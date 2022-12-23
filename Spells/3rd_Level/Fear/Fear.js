const MACRONAME = "Fear.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Does some house keeping for the Fear Force Spell.  Specifically:
 * 
 * 1. If no targets failed their save, remove concentration and display a message
 * 2. Update the convenientDescription of concentrating on caster
 * 3. Process Tokens that Failed Saves, giving them EFFECT_NAME
 * 
 * 10/20/22 0.1 Creation of Macro
 * 10/21/22 0.2 Add doEach for subsequent saving throws when out of Line of Sight (LoS)
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
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
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const EFFECT_NAME = "Fear"
let ceDesc = ""
const GAME_RND = game.combat ? game.combat.round : 0;
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });     // Midi ItemMacro On Use
if (args[0] === "each") doEach({ traceLvl: TL });
if (TL > 1) jez.trace(`=== Finished === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    // let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    // let tActor = tToken?.actor;
    const SAVE_TYPE = "wis"
    const SAVE_DC = aActor.data.data.attributes.spelldc;
    let failSaves = args[0].failedSaves
    //----------------------------------------------------------------------------------
    // 1. Make sure at least one target failed its saving throw 
    //
    if (LAST_ARG.failedSaves.length === 0) {                // All targets made saves
        clearEffect(aToken.id, "Concentrating")
        if (TL > 2) jez.trace(`${TAG} All targets made successful saving throws`);
        msg = `No targets are affected by <b>${aToken.name}</b>'s spell.`
        postResults(msg)
        return;
    }
    //-----------------------------------------------------------------------------------------------
    // 2. Update the convenientDescription of concentrating on caster
    //
    ceDesc = `Maintaining ${EFFECT_NAME} effect on those that failed saves`
    await jez.setCEDesc(aActor, "Concentrating", ceDesc, { traceLvl: TL });
    //---------------------------------------------------------------------------------------------
    // 3. Process Tokens that Failed Saves, giving them EFFECT_NAME
    //
    if (TL > 2) jez.trace(`${TAG} ${failSaves.length} Tokens failed saves, need '${EFFECT_NAME}' added`)
    for (let i = 0; i < failSaves.length; i++) {
        if (TL > 2) jez.trace(`${TAG}  ${i + 1}) ${failSaves[i].name}`, failSaves[i])
        applyFear(failSaves[i], SAVE_TYPE, SAVE_DC);
    }
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    msg = `${aToken.name} projects a phantasmal image of her/his target's worst fears.`
    postResults(msg)
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Remove an effect from passed subject
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function clearEffect(subject, effectName, options = {}) {
    const TL = options.traceLvl ?? 0
    sActor = jez.getActor5eDataObj(subject)
    const EFFECT = await aToken.actor.effects.find(i => i.data.label === effectName);
    if (TL > 1) jez.trace(`${TAG} Attempting to clear ${effectName} from ${subject.name}`, EFFECT)
    if (EFFECT) await EFFECT.delete()
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * When the effect ends, remove the token represented the phantasm on the scene
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff() {
    if (TL > 1) jez.trace("Token to dismiss", args[1])
    warpgate.dismiss(args[1], game.scenes.viewed.id)
    return;
}
/***************************************************************************************************
 * Apply the Fear condition to a token, adding CEDesc and save data for use by doEach()
 ***************************************************************************************************/
async function applyFear(token, saveType, saveDC) {
    const CE_DESC = `Afflicted by ${aToken.name}'s ${EFFECT_NAME}, must DASH away if possible.`
    let effectData = [{
        label: EFFECT_NAME,
        icon: aItem.img,
        origin: LAST_ARG.uuid,
        disabled: false,
        flags: {
            dae: { stackable: false, macroRepeat: "endEveryTurn" },
            convenientDescription: CE_DESC
        },
        duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
        changes: [
            { key: `macro.CE`, mode: jez.CUSTOM, value: "Frightened", priority: 20 },
            { key: `macro.itemMacro`, mode: jez.CUSTOM, value: `${aToken.id} Save_DC ${saveDC} ${saveType}`, priority: 20 },
        ]
    }];
    // let horrified = token.actor.effects.find(i => i.data.label === HORRIFIED_COND);
    // if (!horrified) applyEffect(token, effectData);
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token.actor.uuid, effects: effectData });
}
/***************************************************************************************************
 * Perform the code that runs every turn on the afflicted. This code is fired by DAE's itemMacro 
 * on the applied affect, which must provide required arguments:
 * 
 * - "each":    5th from last arg (aka first), string literal "each" from DAE
 * - OriginId:  4th from last arg, a 16 character string providing the origin ID of the effect
 * - "Save_DC": 3rd from last arg, string literal "Save_DC" -- documentation only
 * - SAVE_DC:   2nd from last argument, interger value of saving throw
 * - SAVE_TYPE: 1st from last argument, string value of save type
 * - onUseObj:  Last argument
 * 
 ***************************************************************************************************/
async function doEach(options = {}) {
    const FUNCNAME = "doEach(options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Parse the passed arguments setting some constants, arguments passed of this form:
    //  Save_DC ${saveDC} ${saveType}
    //
    let save = null;
    const ORIGIN_TOKENID = args[args.length - 5]
    const SAVE_DC = args[args.length - 3]
    const SAVE_TYPE = args[args.length - 2]
    if (TL > 1) jez.trace(`${TAG} ${aToken.name} perhaps attempts DC${SAVE_DC} ${SAVE_TYPE} save to remove ${EFFECT_NAME} effect.`);
    //-----------------------------------------------------------------------------------------------
    // Parse the passed DAE provided origin data to find the origin token, etc.  It will be of form: 
    //    Scene.MzEyYTVkOTQ4NmZk.Token.4k8NyJnKNvjALfja.Item.MTI3MDA4YzllNTZh (for unlinked tokens?)
    //-OR-
    //    Actor.qvVZIQGyCMvDJFtG.Item.aEqDbQmGc462BSNV (for linked tokens?)
    //
    let origin = LAST_ARG.origin
    if (TL > 1) jez.trace(`${TAG} Origin data`, origin);
    let noLoS = false;
    const ORIGIN_TOKENS = origin.split(".")
    // let ORIGIN_TOKENID = ORIGIN_TOKENS[3];
    let oItemId = ORIGIN_TOKENS[5];
    let oToken = await canvas.tokens.placeables.find(ef => ef.id === ORIGIN_TOKENID)
    if (ORIGIN_TOKENS.length === 6) {
        if (TL > 1) jez.trace(`${TAG} Origin Token ID ${ORIGIN_TOKENID}, Item ID ${oItemId}`)
    }
    else if (ORIGIN_TOKENS.length === 4) {
        let oActorId = ORIGIN_TOKENS[1]
        oItemId = ORIGIN_TOKENS[3];
        if (TL > 1) jez.trace(`${TAG} Origin IDs Actor ${oActorId}, Token ${ORIGIN_TOKENID}, Item ${oItemId}`)
    }
    else return jez.badNews(`${TAG} Could not parse origin information from ${origin}`,"e")
    if (TL > 1) jez.trace(`${TAG} Origin token (${ORIGIN_TOKENID}): ${oToken?.name}`, oToken)
    let oItem = oToken.actor.data.items.get(oItemId)
    if (TL > 1) jez.trace(`${TAG} Origin item ${oItem?.name}`, oItem)
    //-----------------------------------------------------------------------------------------
    // Grab the EFFECT_NAME condition info
    //
    let condition = aActor.effects.find(ef => ef.data.label === EFFECT_NAME)
    if (condition) {
        if (TL > 1) jez.trace(`${TAG} ${EFFECT_NAME} Condition`, condition)
        // Does the afflicted have a clear LoS to the originator?
        noLoS = canvas.walls.checkCollision(new Ray(aToken.center, oToken.center), { type: "sight", mode: "any" })
        if (TL > 1) jez.trace(`${TAG} ${aToken.name} LoS to ${oToken.name} blocked?`, noLoS)
    } else return jez.badNews(`Somehow ${aToken.name} lacks ${EFFECT_NAME} condition.  HeLp!`, "w")
    //-----------------------------------------------------------------------------------------
    // Execute the save, only if there is no LOS to origin of effect.
    //
    if (noLoS) {
        let flavor = `${aToken.name} attempts ${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> 
            save to remove <b>${aItem.name}</b> normally as ${oToken.name} can not be seen.`;
        save = (await aActor.rollAbilitySave(SAVE_TYPE, { flavor: flavor, chatMessage: true, fastforward: true }));
    } else {
        bubbleForAll(aToken.id, `I am terrified of ${oToken.name} and must DASH away!`, true, true)
        return
    }
    if (TL > 1) jez.trace(`${TAG} Save results`, save)
    //-----------------------------------------------------------------------------------------
    // Apply the save results
    //
    if (save.total < SAVE_DC) {
        if (TL > 1) jez.trace(`${TAG} ${aToken.name} failed with a ${SAVE_TYPE} save with ${save.total} vs ${SAVE_DC}`)
        bubbleForAll(aToken.id, `I remain terrified of ${oToken.name} and must DASH away!`, true, true)
    } else {
        if (TL > 1) jez.trace(`${TAG} ${aToken.name} made a ${SAVE_TYPE} save with ${save.total} vs ${SAVE_DC}`)
        // aActor.deleteEmbeddedEntity("ActiveEffect", LAST_ARG.effectId); // deleteEmbeddedEntity not a function
        aActor.deleteEmbeddedDocuments("ActiveEffect",[LAST_ARG.effectId]);
        bubbleForAll(aToken.id, `I no longer live in fear of ${oToken.name}!`, true, true)
    }
    if (TL > 1) jez.trace(`${TAG} -------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}