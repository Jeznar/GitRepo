const MACRONAME = "Hideous_Laughter.0.3.js"
/*****************************************************************************************
 * 
 * 06/02/22 0.1 Creation of Macro
 * 07/09/22 0.2 Replace CUB.addCondition with CE
 * 07/31/22 0.3 Add convenientDescription, prevent duplicate prones
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
//----------------------------------------------------------------------------------
// Setup global variables
//
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
const EFFECT_NAME = "Hideous Laughter"
//##################################
// Read First!!! Requires both Dynamic Active Effects + Midi-QoL
// DAE setup
// Requires: Cub_Condition Callback Macro, Times Up Module.
// Duration: Macro Repeat: End of each turn.
// Effects: Either use Item Macro or Macro Execute, no args needed.
//##################################
const origin = LAST_ARG.origin;
jez.log("origin",origin)
let itemUuid = null
if (origin) itemUuid = await fromUuid(origin);
jez.log("itemUuid",itemUuid)
const caster = itemUuid?.actor; // curious setting here...makes the clearing conc work
jez.log(`*** caster`, caster)  
const GAME_RND = game.combat ? game.combat.round : 0;
const SAVE_DC = aActor.data.data.attributes.spelldc;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE every round
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is launched by DAE placing effect
 ***************************************************************************************************/
 async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    // Crymic retained code
    //
    let hookId = Hooks.on("midi-qol.DamageRollComplete", damageCheck);
    DAE.setFlag(aActor, "hLaughter", hookId);
    if ((!(game.modules.get("jb2a_patreon")?.active || game.modules.get("JB2A_DnD5e")?.active) && !(game.modules.get("sequencer")?.active))) return {};
    runVFX(aToken);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is launched by DAE removing effect
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    // Crymic retained code
    //
    let hookId = DAE.getFlag(aActor, "hLaughter");
    Hooks.off("midi-qol.DamageRollComplete", hookId);
    DAE.unsetFlag(aActor, "hLaughter");
    let conc = caster.effects.find(i => i.data.label === "Concentrating");
    if (conc) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: caster.uuid, effects: [conc.id] });
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Crymic's damageCheck(workflow)
 ***************************************************************************************************/
async function damageCheck(workflow) {
    const FUNCNAME = "damageCheck(workflow)";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`### workflow`, workflow)
    //----------------------------------------------------------------------------------------------
    // (Crymic) Place Damage Save Effect on afflicted token ... this is a VERY short duration effect 
    // that manages the saving throw from damage.  
    //
    const C_DESC = `Incapacitated with laughter.  DC${SAVE_DC} WIS Save to end end of each turn and when damaged.`
    let effectData = [{
        label: "Damage Save",
        icon: "icons/skills/wounds/injury-triple-slash-bleed.webp",
        origin: origin,
        disabled: false,
        flags: { 
            dae: { specialDuration: ["isDamaged"] }, 
            convenientDescription: C_DESC
        },
        duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
        changes: [{ key: `flags.midi-qol.advantage.ability.save.all`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 20 }]
    }];
    jez.log(">>> effectData", effectData)
    let damageSave = await aActor.effects.find(i => i.data.label === "Damage Save");
    jez.log(">>> damageSave", damageSave)
    if (!damageSave) await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: LAST_ARG.actorUuid, effects: effectData });
    await jez.wait(600);
    //----------------------------------------------------------------------------------------------
    // (Crymic) Do something mysterious with workflow.damageList (which doesn't exist at this point)
    //
    //jez.log(">>> workflow.damageList", workflow?.damageList)
    //let attackWorkflow = workflow.damageList.map((i) => ({ tokenId: i?.tokenId, totalDamage: i?.totalDamage })).filter(i => i.tokenId === aToken.id);
    //jez.log(">>> attackWorkflow", attackWorkflow)
    //let lastAttack = attackWorkflow[attackWorkflow.length - 1];
    //jez.log(">>> lastAttack", lastAttack)
    //----------------------------------------------------------------------------------------------
    // (Crymic) If the triggering attack did more than zero damage
    //
    //if (lastAttack?.totalDamage > 0) { // Original if statement
    if (workflow.damageTotal > 0) {
        jez.log(">>> workflow.damageTotal", workflow.damageTotal)
        let midiWorkFlow = await MidiQOL.Workflow.getWorkflow(origin);
        jez.log(">>> midiWorkFlow", midiWorkFlow)
        midiWorkFlow.advantage = true;
        //let itemCard = await MidiQOL.showItemCard.bind(midiWorkFlow.item)(false, midiWorkFlow, false);
        //jez.log(">>> itemCard", itemCard)
        //midiWorkFlow.itemCardId = await itemCard.id;
        await midiWorkFlow.checkSaves(false);
        //await midiWorkFlow.displaySaves(false, true);
        let save = await midiWorkFlow.saveResults[0];
        jez.log(">>> save", save)
        let DC = midiWorkFlow.item.data.data.save.dc;
        jez.log(">>> DC", DC)
        // game.dice3d?.showForRoll(save);
        await ui.chat.scrollBottom();
        if (save.total >= DC) {
            let removeConc = caster.effects.find(i => i.data.label === "Concentrating");
            jez.log(">>> removeConc", removeConc)
            bubbleForAll(aToken.id, `Ouch, not funny`, true, true)
            if (removeConc) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: caster.uuid, effects: [removeConc.id] });
            ChatMessage.create({
                user: game.user._id,
                speaker: ChatMessage.getSpeaker({ token: aToken }),
                content: `${aToken.name} ceases uncontrolled laughter growing more serious, even though remaining prone.`,
                type: CONST.CHAT_MESSAGE_TYPES.EMOTE
            });
        } else {
            runVFX(aToken);
            bubbleForAll(aToken.id, `That tickles!`, true, true)
            ChatMessage.create({
                user: game.user._id,
                speaker: ChatMessage.getSpeaker({ token: aToken }),
                content: `${aToken.name} laughs maniacally, finding everything to be hilariously funny, 
                rolling on the ground in fits of laughter.`,
                type: CONST.CHAT_MESSAGE_TYPES.EMOTE
            });
        }
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
}
/***************************************************************************************************
 *    END_OF_CRYMIC_CODE
 *                                END_OF_CRYMIC_CODE
 *                                                             END_OF_CRYMIC_CODE
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    if (!preCheck()) return;
    //----------------------------------------------------------------------------------------------
    // If Intelligence is 4 or less, immune to this spell.
    //
    let tInt = tToken.actor.data.data.abilities['int'].value
    if (tInt < 5) {
        msg = `${tToken.name} doesn't see why that is funny.  Might be because its intelligence is less than 5.`
        jez.log(msg)
        postResults(msg)
        await jez.wait(100) // Allow earlier effects to complete 
        let conc = aActor.effects.find(i => i.data.label === "Concentrating");
        if (conc) conc.delete();
        // Generate a chat bubble on the scene, using a World script!
        msg = `I don't get it.  That's not funny!`
        bubbleForAll(tToken.id, msg, true, true)
        return
    }
    //----------------------------------------------------------------------------------------------
    // Proceed with saving throw
    //
    if (args[0].failedSaveUuids.length === 1) {         // target failed save
        msg = `<b>${tToken.name}</b> failed save and is affected by ${aItem.name}, incapacitated
        and falling prone.`
        bubbleForAll(tToken.id, `That is hillarious!`, true, true)
        await jez.wait(50) // Allow earlier effects to complete 
        // Knock the target prone, if it isn't already prone
        await jezcon.addCondition("Prone", tToken.actor.uuid, {allowDups: false}) 
        await jez.wait(100) // Allow earlier effects to complete 
    } 
    else bubbleForAll(tToken.id, `Yea, right, not that funny`, true, true)
    //----------------------------------------------------------------------------------------------
    // Modify recently created effect to have a convenientDescription
    //
    let effect = await tToken.actor.effects.find(i => i.data.label === EFFECT_NAME);
    if (!effect) return jez.badNews(`Could not find ${EFFECT_NAME} effect on ${tToken.name}`,"e")
    const C_DESC = `Incapacitated with laughter.  DC${SAVE_DC} WIS Save to clear, end of turns and when damaged.`
    await effect.update({ flags: { convenientDescription: C_DESC } });
    //----------------------------------------------------------------------------------------------
    // Post results
    //
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        postResults(msg);
        return (false);
    }
    return(true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
 async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    runVFX(aToken)
    jez.postMessage({color: jez.randomDarkColor(), 
        fSize: 14, 
        icon: aToken.data.img, 
        msg: `${aToken.name} finds everything hilariously funny and rolls on the ground in fits of 
        laughter. `,
        title: `<b>${aToken.name}</b> ROFL!`, 
        token: aToken})
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Play a little VFX on our afflicted token
 ***************************************************************************************************/
 async function runVFX(token5e) {
    new Sequence()
        .effect()
        .file("jb2a.toll_the_dead.purple.skull_smoke")
        .atLocation(token5e)
        .scaleToObject(1.5)
        .waitUntilFinished(-500)
        .play()
 }