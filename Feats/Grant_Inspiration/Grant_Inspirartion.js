const MACRONAME = "Grant_Inspiration.0.4.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Macro will attempt to grant inspiration to the targeted actor, checking for a nuymber of cases:
 * 1. Target is an NPC and can not have inspiration...post message to that effect, exit
 * 2. Target already has inspration...post message to that effect, exit
 * 3. Flip tActor.data.data.attributes.inspiration to true...post message, exit
 * 
 * This macro is intended to be usewd by the fated ally who can grant inspiration while in the presence of Strahd.
 * 
 * 04/07/23 0.1 Creation of Macro3
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
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // 1. Target is an NPC and can not have inspiration...post message to that effect, exit
    //
    if (await jez.isNPC(tActor.uuid)) return postResults(`${tToken.name} can not benefit from inspiration (NPC).`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 2. Target already has inspiration...post message to that effect, exit
    //
    if (tActor.data.data.attributes.inspiration) return postResults(`${tToken.name} is already inspired.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 3. Flip tActor.data.data.attributes.inspiration to true...post message, exit
    //
    await jez.actorUpdate(tToken, { "data.attributes.inspiration": true  })
    runVFX(tToken)
    if (tActor.data.data.attributes.inspiration) return postResults(`${tToken.name} is inspired by ${aToken.name}.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    return true;
}
//-----------------------------------------------------------------------------------------------------------------------------------
// Function:  Play the VFX 
//
async function runVFX(target) {
    const VFX_FILE = 'modules/jb2a_patreon/Library/Generic/Twinkling_Stars/TwinklingStars_08_Orange_100x100.webm'
    new Sequence()
        .effect()
        .file(VFX_FILE)
        .atLocation(target, { randomOffset: true })
        .repeats(5, 30, 60)
        .play()
}