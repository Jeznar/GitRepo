const MACRONAME = "Dominated.0.1.js"
/*****************************************************************************************
 * 
 * 
 * Notes from Crymic:
 * Read First!!! Requires both Dynamic Active Effects + Midi-QoL
 * DAE setup
 *   Requires: Cub_Condition Callback Macro, Times Up Module.
 *   Duration: Macro Repeat: End of each turn.
 *   Effects: Either use Item Macro or Macro Execute, no args needed.
 * 
 * 08/06/22 0.1 Creation of Macro from Hideous_Laughter.0.3.js
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
 const TAG = `${MACRO} |`
 const TL = 5;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //---------------------------------------------------------------------------------------------------
 if (TL>1) jez.trace(`=== Starting === ${MACRONAME} ===`);
 if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
 const LAST_ARG = args[args.length - 1];
 //---------------------------------------------------------------------------------------------------
 // Set the value for the Active Token (aToken)
 let aToken;         
 if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
 else aToken = game.actors.get(LAST_ARG.tokenId);
 let aActor = aToken.actor; 
 //
 // Set the value for the Active Item (aItem)
 let aItem;         
 if (args[0]?.item) aItem = args[0]?.item; 
 else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//--------------------------------------------------------------------------------------------------
// Setup global variables
//
const EFFECT_NAME = "Dominated"                     // Name of effect to be applied
const CRITTER_TYPES = ["Beast","Monster","Person"]  // Types of critters for this spell
const FLAG_NAME = EFFECT_NAME                       // Name of flag to be used
const origin = LAST_ARG.origin;                     if (TL>2) jez.trace(`${TAG} origin`,origin)
let itemUuid = null;                                // Declared so can be set in an if code block                            
if (origin) itemUuid = await fromUuid(origin);      if (TL>2) jez.trace(`${TAG} itemUuid`,itemUuid)
const oActor = itemUuid?.actor;                     if (TL>2) jez.trace(`${TAG} origin actor`,oActor)
const GAME_RND = game.combat?game.combat.round:0;
const SAVE_DC = aActor.data.data.attributes.spelldc;
//--------------------------------------------------------------------------------------------------
// This macro can be called by: "Dominate Beast", "Dominate Person", or "Dominate Monster".  Parse  
// the item name to nab type of critter targeted by this casting so different messages can be posted.
//
const CRITTER_TYPE = aItem.name.split(" ")[1];  if (TL>2) jez.trace(`${TAG} crtter type`,CRITTER_TYPE)
if (!CRITTER_TYPE) return jez.badNews(`Could not parse creature type from ${aItem.name}`,"e")
if (!CRITTER_TYPES.includes(CRITTER_TYPE)) return jez.badNews(`${CRITTER_TYPE} not supported`,"e")
//--------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE every round
if (TL>0) jez.trace(`${TAG} === Finishing === ${MACRONAME}`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is launched by DAE placing effect
 * 
 * This runs on actor that has the affected applied to it
 ***************************************************************************************************/
 async function doOn() {                
    const FUNCNAME = "doOn()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>0) jez.trace(`${TAG} --- Starting ---`);
    //----------------------------------------------------------------------------------------------
    // Crymic retained code
    //
    let hookId = Hooks.on("midi-qol.DamageRollComplete", damageCheck);
    // DAE.setFlag(aActor, FLAG_NAME, hookId);
    let flagObj = {
        hookId: hookId,
        aTokenId: aToken.id,
        oActorUuid: oActor.uuid,
        oTokenName: oActor.data.token.name
    }
    DAE.setFlag(aActor, FLAG_NAME, flagObj);
    if ((!(game.modules.get("jb2a_patreon")?.active || game.modules.get("JB2A_DnD5e")?.active) || 
        !(game.modules.get("sequencer")?.active))) return jez.badNews(`Prerequisite modules not found`,"e");
    runVFX(aToken);
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is launched by DAE removing effect
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>0) jez.trace(`${TAG} --- Starting ---`);
    //----------------------------------------------------------------------------------------------
    let flagObj = DAE.getFlag(aActor, FLAG_NAME);                   if (TL>2) jez.trace(`${TAG} flagObj`,flagObj)
    let hookId = flagObj.hookId;                                    if (TL>2) jez.trace(`${TAG} hookId`,hookId)
    // let hookId = DAE.getFlag(aActor, FLAG_NAME);                    if (TL>2) jez.trace(`${TAG} hookId`,hookId)
    Hooks.off("midi-qol.DamageRollComplete", hookId);               // Turn off the hook that was set
    if (TL>2) jez.trace(`${TAG} aActor ${aActor.name}`,aActor)
    if (TL>2) jez.trace(`${TAG} oActor ${oActor.name}`,oActor)
    DAE.unsetFlag(aActor, FLAG_NAME);                               // Clear the flag from aActor 
    let conc=oActor.effects.find(i=>i.data.label==="Concentrating");// Get concentrating data object
    if (conc) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: oActor.uuid, effects: [conc.id] });
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/***************************************************************************************************
 * Crymic's damageCheck(workflow)
 ***************************************************************************************************/
async function damageCheck(workflow) {
    const FUNCNAME = "damageCheck(workflow)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting ${FUNCNAME} ---`,"workflow",workflow);
    //----------------------------------------------------------------------------------------------
    // Get the origin token information by processing the Flag and then finding the token 
    //
    let flagObj = DAE.getFlag(aActor, FLAG_NAME);   if (TL>2) jez.trace(`${TAG} flagObj`,flagObj)
    let oTokenName = flagObj.oTokenName;            if (TL>2) jez.trace(`${TAG} oTokenName`,oTokenName)
    //----------------------------------------------------------------------------------------------
    // (Crymic) Place Damage Save Effect on afflicted token ... this is a VERY short duration effect 
    // that manages the saving throw from damage.  
    //
    const C_DESC = `Description of spell effect here.  DC${SAVE_DC}.`
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
    if (TL>1) jez.trace(`${TAG} effectData`,effectData)
    let damageSave = await aActor.effects.find(i => i.data.label === "Damage Save");
    if (TL>1) jez.trace(`${TAG} damageSave`,damageSave)
    if (!damageSave) await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: LAST_ARG.actorUuid, effects: effectData });
    await jez.wait(250);
    //----------------------------------------------------------------------------------------------
    // If the triggering attack did more than zero damage further evaluation needed
    //
    if (TL>2) jez.trace(`${TAG} workflow`, workflow )
    if (workflow.damageTotal > 0) {
        //----------------------------------------------------------------------------------------------
        // Pop a dialog to determine if the save should be made at advantage
        //


        //----------------------------------------------------------------------------------------------
        // Proceed
        //
        if (TL>2) jez.trace(`${TAG} workflow?.damageTotal`, workflow?.damageTotal )
        let midiWorkFlow = await MidiQOL.Workflow.getWorkflow(origin);
        if (TL>2) jez.trace(`${TAG} midiWorkFlow`, midiWorkFlow )
        if (TL>2) jez.trace(`${TAG} midiWorkFlow.advantage 1`, midiWorkFlow?.advantage )
        midiWorkFlow.advantage = true;                      if (TL>2) jez.trace(`${TAG} midiWorkFlow.advantage 2`, midiWorkFlow?.advantage )
        //let itemCard = await MidiQOL.showItemCard.bind(midiWorkFlow.item)(false, midiWorkFlow, false);
        //jez.log(">>> itemCard", itemCard)
        //midiWorkFlow.itemCardId = await itemCard.id;
        await midiWorkFlow.checkSaves(false);
        //await midiWorkFlow.displaySaves(false, true);
        let save = await midiWorkFlow.saveResults[0];       if (TL>1) jez.trace(`${TAG} midiWorkFlow save`, save )
        let DC = midiWorkFlow.item.data.data.save.dc;       if (TL>1) jez.trace(`${TAG} midiWorkFlow save DC`, DC )
        // game.dice3d?.showForRoll(save);
        await ui.chat.scrollBottom();                       // Move chat to bottom 
        //----------------------------------------------------------------------------------------------
        if (TL>3) jez.trace(`${TAG} aActor ${aActor?.name}`,"aActor",aActor)
        if (TL>3) jez.trace(`${TAG} oActor ${oActor?.name}`,"oActor",oActor)
        //----------------------------------------------------------------------------------------------
        if (save.total >= DC) {                             // Save was made
            let conc = oActor.effects.find(i=>i.data.label==="Concentrating"); if (TL>1) jez.trace(`${TAG} Concentrating Effect on ${oActor.name}`, conc )
            bubbleForAll(aToken.id, `No more domination for me!`, true, true)
            if (conc) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: oActor.uuid, effects: [conc.id] });
            ChatMessage.create({user: game.user._id,
                speaker: ChatMessage.getSpeaker({ token: aToken }),
                content: `${aToken.name} is no longer dominated by ${oTokenName}`,
                type: CONST.CHAT_MESSAGE_TYPES.EMOTE
            });
        } else {
            runVFX(aToken);
            bubbleForAll(aToken.id, `Ouch! But I will still serve ${oTokenName}`, true, true)
            ChatMessage.create({user: game.user._id, 
                speaker: ChatMessage.getSpeaker({ token:aToken }),
                content: `Remains dominated by ${oTokenName}.`,
                type: CONST.CHAT_MESSAGE_TYPES.EMOTE
            });
        }
    }
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
}
/***************************************************************************************************
 *    END_OF_CRYMIC_CODE
 *                                END_OF_CRYMIC_CODE
 *                                                             END_OF_CRYMIC_CODE
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>0) jez.trace(`${TAG} --- Starting ---`);
    //-----------------------------------------------------------------------------------------------
    if (!preCheck()) return;
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    //----------------------------------------------------------------------------------------------
    // Handle successful save, post messge and exit.
    //
    console.log("TODO: Handle immune target type and successful application saves. ")
    if (LAST_ARG.failedSaves.length === 0) {    // Target made it's save
        if (TL>2) jez.trace(`${TAG} Target ${tToken.name} made its saving throw`);
        msg = `${tToken.name} shrugs off the effects of ${aToken.name}'s spell.`
        postResults(msg)
        return;
    }
    //----------------------------------------------------------------------------------------------
    // Make sure target is correct creature type for this spell
    //
    let race = jez.getRace(tToken)
    if (race === "humanoid") race = "person"    // Flip humanoid to person
    if (TL>2) jez.trace(`${TAG} Target ${tToken.name} race is ${race}.`);
    if (race !== CRITTER_TYPE) {                // Target race not a match for this spell
        if (TL>2) jez.trace(`${TAG} Target ${tToken.name} is a {race} needs to be ${CRITTER_TYPE}`);
        msg = `${tToken.name} is wrong type of creature for ${aToken.name}'s spell.`
        let conc=aActor.effects.find(i=>i.data.label==="Concentrating");// Get concentrating data object
        if (conc) await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid:aActor.uuid, effects:[conc.id]});
        postResults(msg)
        return;
    }

    //----------------------------------------------------------------------------------------------
    // Could do creature type check here...
    //
    // let tInt = tToken.actor.data.data.abilities['int'].value
    // if (tInt < 5) {
    //     msg = `${tToken.name} doesn't see why that is funny.  Might be because its intelligence is less than 5.`
    //     jez.log(msg)
    //     postResults(msg)
    //     await jez.wait(100) // Allow earlier effects to complete 
    //     let conc = aActor.effects.find(i => i.data.label === "Concentrating");
    //     if (conc) conc.delete();
    //     // Generate a chat bubble on the scene, using a World script!
    //     msg = `I don't get it.  That's not funny!`
    //     bubbleForAll(tToken.id, msg, true, true)
    //     return
    // }
    //----------------------------------------------------------------------------------------------
    // Proceed with saving throw
    //
    // if (args[0].failedSaveUuids.length === 1) {         // target failed save
    //     msg = `<b>${tToken.name}</b> failed save and is affected by ${aItem.name}, incapacitated
    //     and falling prone.`
    //     bubbleForAll(tToken.id, `That is hillarious!`, true, true)
    //     await jez.wait(50) // Allow earlier effects to complete 
    //     // Knock the target prone, if it isn't already prone
    //     await jezcon.addCondition("Prone", tToken.actor.uuid, {allowDups: false}) 
    //     await jez.wait(100) // Allow earlier effects to complete 
    // } 
    // else bubbleForAll(tToken.id, `Yea, right, not that funny`, true, true)
    //----------------------------------------------------------------------------------------------
    // Modify recently created effect to have a convenientDescription
    //
    let effect = await tToken.actor.effects.find(i => i.data.label === EFFECT_NAME);
    if (!effect) return jez.badNews(`Could not find ${EFFECT_NAME} effect on ${tToken.name}`,"e")
    const C_DESC = `Incapacitated with laughter.  DC${SAVE_DC} WIS Save to clear, end of turns and when damaged.`
    await effect.update({ flags: { convenientDescription: C_DESC } });
    //----------------------------------------------------------------------------------------------
    // Link the concentrating and new domination effect 
    //
    console.log("TODO: Link the concentrating and new domination effect ")
    //----------------------------------------------------------------------------------------------
    // Post results
    //
    msg = `${tToken.name} is dominated by ${aToken.name}`
    postResults(msg)
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
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
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>0) jez.trace(`${TAG} --- Starting ---`);
    //-----------------------------------------------------------------------------------------------
    runVFX(aToken)
    jez.postMessage({
        color: jez.randomDarkColor(),
        fSize: 14,
        icon: aToken.data.img,
        msg: `${aToken.name} finds everything hilariously funny and rolls on the ground in fits of 
        laughter. `,
        title: `<b>${aToken.name}</b> ROFL!`,
        token: aToken
    })
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
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