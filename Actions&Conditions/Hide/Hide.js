const MACRONAME = "Hide.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Automate the hide action witgout checking for appropriatness of that action.  Major steps in this process:
 * 
 * 1. Roll a Stealth (Dex) check for the aActor
 * 2. Place a "Hidden" effect on the aActor
 *    a. Obtain the base effect from convienent effects
 *    b. Modify the description to incoporate the rolled check result
 *    c. Apply the effect
 * 3. Post a summary description to this item's chat card.
 * 
 * 04/17/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//    
const SKILL = "ste";
const EFFECT_NAME = 'Hidden'
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 1. Roll a Stealth (Dex) check for the aActor
    //
    const STEALTH_OPTS = { chatMessage: true, fastForward: true };
    const STEALTH_ROLL = await MidiQOL.socket().executeAsGM("rollAbility", 
        { request: "skill", targetUuid: aActor.uuid, ability: SKILL, options: STEALTH_OPTS });
    game.dice3d?.showForRoll(STEALTH_ROLL);
    if (TL > 1) jez.trace(`${TAG} STEALTH_ROLL result: ${STEALTH_ROLL.total}`,STEALTH_ROLL)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 2. Place a "Hidden" effect on the aActor
    //    a. Obtain the base effect from convienent effects
    let effectData = game.dfreds.effectInterface.findEffectByName(EFFECT_NAME).convertToObject();
    //    b. Modify the description to incorporate the rolled check result
    effectData.description = `Hidden while quiet and unseen with a check of ${STEALTH_ROLL.total}`
    //    c. Apply the effect
    game.dfreds.effectInterface.addEffectWith({ effectData: effectData, uuid: aActor.uuid, origin: aActor.uuid });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 3. Post a summary description to this item's chat card.
    //
    msg = `${aToken.name} has hidden themself with a skill check of ${STEALTH_ROLL.total}.  They may remain hidden as long as not 
    in line of sight and quiet. Attacks made while hidden have advantage and reveal the attacker.`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
}