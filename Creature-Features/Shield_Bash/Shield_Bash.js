const MACRONAME = "Shield_Bash.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implement a Shield Bash ability: If the target is a the same size or smaller, it must succeed on a DC 15 Strength saving throw 
 * or be knocked prone.
 *
 * 05/02/23 0.1 Creation of Macro
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
const DEBUFF = 'Prone'
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
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (args[0].targets.length !== 1)
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, 'w')
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
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
    //-------------------------------------------------------------------------------------------------------------------------------
    if (!await preCheck()) return (false);
    let tToken  = null
    //---------------------------------------------------------------------------------------------------
    // If no targets hit, go away quietly
    //
    if (L_ARG.hitTargets.length === 0) return
    //---------------------------------------------------------------------------------------------------
    // If target made save, just terminate this macro
    //
    if (L_ARG.failedSaves.length === 0) {
        tToken = canvas.tokens.get(L_ARG.saves[0].id); // First get failed save target
        msg = `${tToken.name} resisted ${aToken.name}'s ${aItem.name}`
        postResults(msg)
        return;
    }
    tToken = canvas.tokens.get(L_ARG.failedSaves[0]?.id); // First get failed save target
    //---------------------------------------------------------------------------------------------------
    // If target is larger than active actor, no effect
    //
    if (TL > 1) jez.trace(`${TAG} If target is larger than active actor, no effect`)
    let aTokenSizeValue = (await jez.getSize(aToken)).value
    let tTokenSizeValue = (await jez.getSize(tToken)).value
    if (tTokenSizeValue > aTokenSizeValue) {
        msg = `${tToken.name} is larger than ${aToken.name} and can nor be knocked down by his/her
        ${aItem.name}`
        postResults(msg)
        return;
    }
    //---------------------------------------------------------------------------------------------------
    // Mark the target prone
    //
    if (TL > 1) jez.trace(`${TAG} Mark the target ${DEBUFF}`)
    if (TL > 1) jez.trace(`${TAG} tToken.actor.uuid`,tToken.actor.uuid)
    await jezcon.addCondition(DEBUFF, tToken.actor.uuid, 
    {allowDups: false, replaceEx: true, origin: aActor.uuid, overlay: false, traceLvl: 0 }) 
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `${tToken.name} has been knocked prone.`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}