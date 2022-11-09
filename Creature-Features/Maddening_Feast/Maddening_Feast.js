const MACRONAME = "Maddening_Feast.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Basic Structure for a rather complete macro
 * 
 *   %TOKENNAME% feasts on the corpse of one enemy within 5 feet of her that died within the past 
 *   minute. 
 * 
 *   Each creature of %TOKENNAME% choice that is within 60 feet of her and able to see her must  
 *   succeed on a DC15 WIS Save or be Frightened of her for 1 minute.
 * 
 *   While frightened in this way, a creature is  Incapacitated, can't understand what others say, 
 *   can't read, and speaks only in gibberish; the DM controls the creature's movement, which is 
 *   erratic.
 * 
 *   A creature can repeat the saving throw at the end of each of its turns, ending the effect on 
 *   itself on a success. If a creature's saving throw is successful or the effect ends for it, 
 *   the creature is immune to the hag's Maddening Feast for the next 24 hours.
 * 
 * Major Steps to complete:
 * 1. The precondiions for this spell are checked only with a dialog reminding the user of them and 
 *    asking for confirmation to continue. 
 * 2. Build a list of potential targets
 * 
 * 11/09/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 1;                               // Trace Level for this macro
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
const ALLOWED_UNITS = ["", "ft", "any"];
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
// if (args[0] === "on") await doOn({traceLvl:TL});                  // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
// if (args[0] === "each") doEach({traceLvl:TL});					 // DAE everyround
// if (args[0] === "off") await doOff({traceLvl:TL});                   // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
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
 * Perform the code that runs when this macro is removed by DAE, set On
 * This runs on actor that has the affected applied to it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
// async function doOn(options={}) {
//     const FUNCNAME = "doOn()";
//     const FNAME = FUNCNAME.split("(")[0] 
//     const TAG = `${MACRO} ${FNAME} |`
//     const TL = options.traceLvl ?? 0
//     if (TL>0) jez.trace(`${TAG} --- Starting ---`);
//     //-----------------------------------------------------------------------------------------------
//     // Comments, perhaps
//     //
//     if (TL>3) jez.trace(`${TAG} | More Detailed Trace Info.`)

//     if (TL>1) jez.trace(`${TAG} --- Finished ---`);
//     return true;
// }
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
    //----------------------------------------------------------------------------------------------
    // Remove any preset targets
    //
    game.user.updateTokenTargets()  
    //------------------------------------------------------------------------------------------
    // Prepare for and pop a simple dialog asking if preconditions were met
    //
    const Q_TITLE = `Can ${aToken.name} Feast?`
    const Q_TEXT = `To qualify to feast, ${aToken.name} must be within 5 feet of a corpse that 
    died within the past minute and spend her action gourging on the bloody flesh. Are these 
    conditions met?<br><br>`
    let confirmation = await Dialog.confirm({ title: Q_TITLE, content: Q_TEXT, });
    if (!confirmation) {
        msg = `${aToken.name} looks confusedly in the general direction of the GM and wonders
        what she is expected to feast upon?<br><br>No effect, action can not be performed.`
        jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img, 
        msg: msg, title: `Can not complete action`, token: aToken})
        return jez.badNews(`Preconditions not met, skipping ${aItem.name} effects.`, "w")
    }
    //------------------------------------------------------------------------------------------
    // Build a list of tokens within range that can see the feast occuring
    //
    let parms = {
        exclude: "Self",        // self, friendly, or none (self is default)
        direction: "t2o",       // t2o or o2t (Origin to Target) (t2o is default) 
        chkSight: true,         // Boolean (false is default)
        chkBlind: true,         // Boolean (false is default)
        traceLvl: TL,           // Trace level, integer typically 0 to 5
    }
    let candidateIds = []
    let candidates = await jez.inRangeTargets(aToken, RANGE, parms);
    if (candidates.length === 0) {
        msg = `${aToken.name} sadly realizes that nothing amd no one can be affected by
        ${aItem.name}.`
        jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img, 
        msg: msg, title: `${aItem.name} has no affectable targets`, token: aToken})
        return jez.badNews(`No effectable targets in range`, "i")
    }
    if (TL>1) for (let i = 0; i < candidates.length; i++) {
        jez.trace(`${FNAME} | Targeting: ${candidates[i].name}`)
        candidateIds.push(candidates[i].id)
    }

    //----------------------------------------------------------------------------------
    // let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    // let tActor = tToken?.actor;
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${TAG} More Detailed Trace Info.`)


    msg = `Maybe say something useful...`
    postResults(msg)
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doEach(options = {}) {
    const FUNCNAME = "doEach()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${TAG} More Detailed Trace Info.`)

    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "doBonusDamage"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doBonusDamage(options = {}) {
    const FUNCNAME = "doBonusDamage()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${TAG} More Detailed Trace Info.`)


    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff(options = {}) {
    const FUNCNAME = "doOff()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${TAG} | More Detailed Trace Info.`)

    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}