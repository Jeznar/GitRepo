const MACRONAME = "Protection_from_Evil_and_Good.0.4.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * This spell macro built from a Sequencer example found at:
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Dynamic-Active-Effects-&-JB2A-Shield
 * 
 * JB2A Effects can be viewed at: https://www.jb2a.com/Library_Preview/
 * 
 * 12/31/21 0.1 Creation of Macro
 * 12/31/21 0.2 Additions
 * 03/31/21 0.3 Adjustments to VFX
 * 12/16/22 0.4 Update style and added pairEffectsAsGM (using doOnUse which was previously not used)
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
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_INTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_01_Regular_Green_Intro_400x400.webm"
const VFX_LOOP = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Green_Loop_400x400.webm";
const VFX_OUTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Green_OutroExplode_400x400.webm";
const VFX_OPACITY = 0.7;
const VFX_SCALE = 1.9;
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "on") await doOn({ traceLvl: TL });                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
return;
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
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set On
 * This runs on actor that has the affected applied to it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOn(options = {}) {
    const FUNCNAME = "doOn(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
    //-------------------------------------------------------------------------------------------------------------------------------
    jez.runRuneVFX(aToken, jez.getSpellSchool(aItem), "green")
    new Sequence()
        .effect()
        .file(VFX_INTRO)
        .attachTo(aToken)
        .scaleToObject(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .waitUntilFinished(-500) // Negative wait time (ms) clips the effect to avoid fadeout
        .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .scaleToObject(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(true)
        .persist()
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .extraEndDuration(800)  // Time padding on exit to connect to Outro effect
        .play()
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
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
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pair concentrating and this macro's effect
    //
    jez.pairEffectsAsGM(aActor, "Concentrating", tToken.actor, "Protection from Evil and Good")
    //-------------------------------------------------------------------------------------------------------------------------------
    // Say Goodbye
    //
    msg = `${tToken.name} is protected against: aberrations, celestials, elementals, fey, fiends, and undead.`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
async function doOff(options={}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });
    //-------------------------------------------------------------------------------------------------------------------------------
    new Sequence()
        .effect()
        .file(VFX_OUTRO)
        .scaleToObject(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .attachTo(aToken)
        .play()
    //-------------------------------------------------------------------------------------------------------------------------------
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}