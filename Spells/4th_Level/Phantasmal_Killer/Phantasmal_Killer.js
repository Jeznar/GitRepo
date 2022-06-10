const MACRONAME = "Phantasmal_Killer.0.2.js"
/*****************************************************************************************
 * Phantasmal Killer leveraging Midi-qol for overtime damage and saves
 * 
 * 02/19/22 0.1 Creation of Macro
 * 06/08/22 0.2 General update to more current form and bug chase
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
const GAME_RND = game.combat ? game.combat.round : 0;
let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
const CONDITION="Phantasmal Killer"
const SPELL_DC = aToken.actor.data.data.attributes.spelldc;
const SAVE_TYPE = "wis"
const NUM_DICE = args[0].spellLevel;
const FRIGHTENED_JRNL = `@JournalEntry[${game.journal.getName("Frightened").id}]{Frightened}`
const FRIGHTENED_ICON = "Icons_JGB/Monster_Features/Frightened.png"

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
if (args[0] === "off") await doOff();                   // DAE removal

jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)
    //----------------------------------------------------------------------------------
    // Run the preCheck function to make sure things are setup as best I can check them
    // but only for OnUse invocation.
    if ((args[0]?.tag === "OnUse") && !preCheck()) return;
    //-------------------------------------------------------------------------------------------------------------
    // If the target saved, exit this macro
    // 
    if (!args[0].failedSaves.length) {
        msg = `${tToken.name} saved, ${MACRO} is complete.`
        ui.notifications.info(msg)
        jez.log(msg)
        return
    }
    //-------------------------------------------------------------------------------------------------------------
    // Grab the data for the new Concentrating effect so that it can be removed when created effect drops
    //
    let concEffectData = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
    //let executeValue = `Remove_Paired_Effect ${aToken.id} ${concEffectData.id}`
    //-------------------------------------------------------------------------------------------------------------
    // Apply Phantasmal Killer condition
    // https://gitlab.com/tposney/midi-qol#flagsmidi-qolovertime-overtime-effects
    //
    // FoundryVTT 9.x migration:  aToken.uuid ===> aToken.document.uuid
    let overTimeVal=`turn=end,
        label=${CONDITION},
        saveDC=${SPELL_DC},
        saveAbility=${SAVE_TYPE},
        saveRemove=true,
        damageRoll=${NUM_DICE}d10,
        saveMagic=true,
        damageType=psychic`
    let effectData = [{
        label: CONDITION,
        icon: aItem.img,
        origin: aToken.document.uuid,
        disabled: false,
        // flags: { dae: { stackable: false, macroRepeat: "none" } },
        // flags: { dae: { itemData: aItem.data, macroRepeat: "startEveryTurn", token: aToken.uuid } },
        flags: { dae: { itemData: aItem, macroRepeat: "startEveryTurn", token: tToken.uuid, stackable: false } },
        duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
        changes: [
// COOL-THING: Midi-QoL OverTime dot & save effect
            { key: `flags.midi-qol.OverTime`, mode: jez.OVERRIDE, value:overTimeVal , priority: 20 },
            { key: `flags.midi-qol.disadvantage.ability.check.all`, mode: jez.ADD, value: 1, priority: 20 },
            { key: `flags.midi-qol.disadvantage.skill.all`, mode: jez.ADD, value: 1, priority: 20 },
            { key: `flags.midi-qol.disadvantage.attack.all`, mode: jez.ADD, value: 1, priority: 20 },
            { key: `macro.itemMacro`, mode: jez.CUSTOM, value: aToken.name, priority: 20 },
            //{ key: `macro.execute`, mode: jez.CUSTOM, value: executeValue, priority: 20}
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: effectData });
// COOL-THING: Add lines to pair effects for mutual termination.
    //-------------------------------------------------------------------------------------------------------------
    // Grab the data for the two effects to be paired
    //
    await jez.wait(200)
    jez.pairEffects(aToken, "Concentrating", tToken, CONDITION)
    /**************************************************************************************************************
     * Add a macro execute line calling the macro "Remove_Paired_Effect" which must exist in the macro folder to 
     * named effect on the pair of tokens supplied.  
     * 
     * token1 & token2 are Token5e objects
     * effectName1 & effectName2 are strings that name effects on their respective token actors.
     **************************************************************************************************************/
    /*async function pairEffects(token1, effectName1, token2, effectName2) {
        await jez.wait(100)
        //---------------------------------------------------------------------------------------------------------
        // Make sure the macro that will be called later exists.  Throw an error and return if not
        //
        let pairingMacro = game.macros.find(i=> i.name === "Remove_Paired_Effect");
        if(!pairingMacro) return ui.notifications.error("REQUIRED: Remove_Paired_Effect macro is missing.");
        //---------------------------------------------------------------------------------------------------------
        // Grab the effect data from the first token
        //
        let effectData1 = await token1.actor.effects.find(i => i.data.label === effectName1);
        if (!effectData1) {
            msg = `Sadly "${effectName1}" effect not found on ${token1.name}.  Effects not paired.`
            jez.log(msg)
            ui.notifications.warn(msg) 
            return(false)
        }
        //---------------------------------------------------------------------------------------------------------
        // Grab the effect data from the second token
        //
        let effectData2 = await token2.actor.effects.find(i => i.data.label === effectName2);
        if (!effectData2) {
            msg = `Sadly "${effectName2}" effect not found on ${token2.name}.  Effects not paired.`
            jez.log(msg)
            ui.notifications.warn(msg) 
            return(false)
        }
        //---------------------------------------------------------------------------------------------------------
        // Add the actual pairings
        //
        await addPairing(effectData2, token1, effectData1)
        await addPairing(effectData1, token2, effectData2)
        //---------------------------------------------------------------------------------------------------------
        // Define a function to do the actual pairing
        //
        async function addPairing(effectChanged, tokenPaired, effectPaired) {
            let value = `Remove_Paired_Effect ${tokenPaired.id} ${effectPaired.id}`
            effectChanged.data.changes.push({ key: `macro.execute`, mode: jez.CUSTOM, value: value, priority: 20 })
            jez.log("Adding changes", "tokenPaired", tokenPaired.name, "value", value, "effectChanged.data.changes", effectChanged.data.changes )
            return (await effectChanged.update({ changes: effectChanged.data.changes }))
            //return (await effectChanged.update())

        }
        return(true)
    }*/
    //-------------------------------------------------------------------------------------------------------------
    // Post Completion message
    //
    msg = `${tToken.name} is ${FRIGHTENED_JRNL}.  May not willing move closer to ${aToken.name}`
    jez.log(`msg`,msg)
    await jez.addMessage(chatMessage, {color:"purple", fSize:15, msg:msg, tag:"saves" })
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
 async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("lastArg.origin", lastArg.origin)       // Scene.MzEyYTVkOTQ4NmZk.Token.xQZ547rzaxSalnmz
    let originArray = lastArg.origin.split(".")     // Split up the origin array
    let originId    = originArray[originArray.length-1]
    let oToken      = canvas.tokens.placeables.find(ef => ef.id === originId)
    msg = `${aToken.name} is still ${FRIGHTENED_JRNL}.  May not willing move closer to ${oToken.name}.`
    await jez.postMessage({color:"purple", fSize:15, msg:msg, title:`${aToken.name} Frightened`, 
        token:aToken, icon:FRIGHTENED_ICON})
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let originArray = lastArg.origin.split(".")    // Trim of the version number and extension
    let originId    = originArray[originArray.length-1]
    let oToken      = canvas.tokens.placeables.find(ef => ef.id === originId)
    msg = `${aToken.name} is no longer ${FRIGHTENED_JRNL} of ${oToken.name}.`
    await jez.postMessage({color:"darkgreen", fSize:15, msg:msg, title:`${aToken.name} Recovered`, 
        token:aToken, icon:aToken.data.img})
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }
/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        await jez.addMessage(chatMessage, {color:"purple", fSize:15, msg:msg, tag:"saves" })
        ui.notifications.warn(msg)
        jez.log(msg)
        return(false);
    }
    return (true)
}