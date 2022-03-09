const MACRONAME = "Hex-Move"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
const EFFECT = "Hex (Jez)"

//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
//if ((args[0]?.tag === "OnUse") && !preCheck())return;

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
// DamageBonus must return a function to the caller
if (args[0]?.tag === "DamageBonus") return(doBonusDamage());    
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        postResults();
        return (false);
    }
    /*if (LAST_ARG.hitTargets.length === 0) {  // If target was missed, return
        msg = `Target was missed.`
        postResults();
        return(false);
    }*/
    /*if (args[0].failedSaveUuids.length !== 1) {  // If target made its save, return
        msg = `Saving throw succeeded.  ${aItem.name} has no effect.`
        postResults();

        return(false);
    }*/
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults() {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("Something could have been here")
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }
  
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("A place for things to be done");
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)
    //----------------------------------------------------------------------------------------------
    // Obtain the existing hexMark
    //
    let oldHexMark = getProperty(aToken.actor.data.flags, "midi-qol.hexMark")
    jez.log("..........hexMark target:", oldHexMark)
    //----------------------------------------------------------------------------------------------
    // Update the hexMark to the   token ID in the effect data
    //
    let newHexMark = tToken.id
    /** setProperty(object, key, value)
     * A helper function which searches through an object to assign a value using a string key
     * This string key supports the notation a.b.c which would target object[a][b][c]
     * @param {object} object   The object to update
     * @param {string} key      The string key
     * @param {*} value         The value to be assigned
     * @return {boolean}        Whether the value was changed from its previous value
     */
    setProperty(aToken.actor.data.flags, "midi-qol.hexMark", newHexMark)
    //----------------------------------------------------------------------------------------------
    // Get the token for the old hex target
    //
    let oToken = canvas.tokens.placeables.find(ef => ef.id === oldHexMark)
    jez.log(`${oToken.name} was the old hex target`,oToken)
    //----------------------------------------------------------------------------------------------
    // Get the data of the original hex on the target, then delete it.
    //
    let effect = await oToken.actor.effects.find(i => i.data.label === EFFECT);
    jez.log(`**** ${EFFECT} found?`, effect)
    if (!effect) {
        msg = `${EFFECT} sadly not found on ${oToken.name}.`
        ui.notifications.error(msg);
        postResults(msg);
        return (false);
    }

    //let target = args[0].hitTargets[0].actor;
    //let effect = target.effects.find((i) => i.data.origin === args[0].itemUuid);
    //
    //effect.data.changes[0].key = `flags.midi-qol.disadvantage.ability.check.wis`;

    let effectCopy = duplicate(effect)
    //jez.log(await tToken.actor.updateEmbeddedDocuments("ActiveEffect", [effectCopy]));
    //jez.log("Copied effect?")

    let label = effect.data.label
    //jez.log("effect.data.label", label)
    let icon = effect.data.icon
    //jez.log("effect.data.icon", icon)
    let origin = effect.data.origin
    //jez.log("effect.data.origin", origin)
    let rounds = effect.data.duration.rounds
    //jez.log("effect.data.duration.rounds", rounds)
    let seconds = 6 * rounds
    let startRound = effect.data.duration.startRound
    //jez.log("effect.data.duration.startRound", startRound)
    let startTime = effect.data.duration.startTime
    //jez.log("effect.data.duration.startTime", startTime)
    let itemData = effect.data.flags.dae.itemData
    //jez.log("aItem effect.data.flags.dae.itemData", itemData)
    let spellLevel = effect.data.flags.dae.spellLevel
    //jez.log("effect.data.flags.dae.spellLevel", spellLevel)
    //jez.log("aToken.id", aToken.id)
    let hexID = effect.data.flags.dae.hexId
    jez.log("effect.data.flags.dae.hexId", hexID)
    const hexEffect = await aToken.actor.effects.find(i => i.data.label === "Hex (Jez)");
    jez.log("hexEffect",hexEffect.id)

    let concId = effect.data.flags.dae.concId
    jez.log("effect.data.flags.dae.concId", concId)
    const concEffect = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
    jez.log("concEffect",concEffect.id)


    let effectData = {
        label: label,
        icon: icon,
        origin: origin,
        disabled: false,
        duration: { rounds:rounds, SECONDS:seconds, startRound:startRound, startTime:startTime },
        flags: { dae: { itemData:itemData, spellLevel:spellLevel, tokenId: aToken.id, hexId:hexID, concId:concId } },
        changes: [{key: `flags.midi-qol.disadvantage.ability.check.str`, mode: ADD, value: 1, priority: 20}]
    };
    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: tToken.actor.uuid, effects: [effectData]});    
    /*
    let effectData = {
        label: aItem.name,
        icon: aItem.img,
        origin: UUID,
        disabled: false,
        duration: { rounds: HOURS, SECONDS: SECONDS, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: { dae: { itemData: aItem, spellLevel: LEVEL, tokenId: aToken.id, hexId: hexEffect.id, concId: concEffect.id } },
        changes: [{key: `flags.midi-qol.disadvantage.ability.check.${ability}`, mode: ADD, value: 1, priority: 20}]
    };
    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: tToken.actor.uuid, effects: [effectData]});    
    */





    //----------------------------------------------------------------------------------------------
    // Post the results message
    //
    msg = `Old hexMark: ${oldHexMark}<br>New hexMark: ${newHexMark}`
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
 async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("The do Each code")
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("The do On Use code")
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
