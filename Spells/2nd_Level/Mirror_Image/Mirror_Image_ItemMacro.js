const MACRONAME = "Mirror_Image_ItemMacro.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * This macro works in concert with Mirror_Image_World to implement the Mirror Images spell.  This one has the following tasks:
 * 
 * - Launch the VFX images around the caster 
 * - Create a spell cast message
 * - Backstop the image cleanup when spell drops
 * 
 * 12/28/22 0.1 Creation of Macro
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
const EFFECTNAME = 'Mirror_Image'
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
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
    // Delete any orphan images from earlier casting
    //
    await Sequencer.EffectManager.endEffects({ name: `${EFFECTNAME}-1`, object: aToken });
    await Sequencer.EffectManager.endEffects({ name: `${EFFECTNAME}-2`, object: aToken });
    await Sequencer.EffectManager.endEffects({ name: `${EFFECTNAME}-3`, object: aToken });
    await jez.wait(1500) // Protection from deleting our new image
    //-------------------------------------------------------------------------------------------------------------------------------
    // Startup thoes images
    //
    runVFX(aToken, `${EFFECTNAME}-1`, { clockwise: true, flip: true })
    await jez.wait(Math.floor(Math.random() * 500) + 500)
    runVFX(aToken, `${EFFECTNAME}-2`, { clockwise: false, flip: false })
    await jez.wait(Math.floor(Math.random() * 500) + 500)
    runVFX(aToken, `${EFFECTNAME}-3`, { flip: true })
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `${aToken.name} is surrounded by three illusory duplicates that may be hit any time the caster is targeted with a single 
    target spell.`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Delete the images if they are still bouncing around.
    //
    Sequencer.EffectManager.endEffects({ name: `${EFFECTNAME}-3`, object: aToken });
    await jez.wait(750)
    Sequencer.EffectManager.endEffects({ name: `${EFFECTNAME}-2`, object: aToken });
    await jez.wait(750)
    Sequencer.EffectManager.endEffects({ name: `${EFFECTNAME}-1`, object: aToken });
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Create three VFX images orbiting the caster
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
 async function runVFX(target, vfxname, options = {}) {
    const FUNCNAME = "runVFX(target, vfxname, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    const CLOCKWISE = options.clockwise ?? Math.floor(Math.random() * 2)
    const FLIP = options.flip ?? (Math.floor(Math.random() * 2)) ? true : false
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME}`, 'target', target, 'vfxname', vfxname, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Set values to control the VFX
    //
    const ANGLE_START = (CLOCKWISE) ? 0 : 360
    const ANGLE_STOP = (CLOCKWISE) ? 360 : 0
    const ORBIT_PERIOD = Math.floor(Math.random() * 2000) + 2000
    const SCALE = (Math.floor(Math.random() * 3) - 1) / 10 + 0.8
    const OPACITY = (Math.floor(Math.random() * 4) - 2) / 10 + 0.6
    const VFX_FILE = target.data.img
    //-------------------------------------------------------------------------------------------------------------------------------
    // Fire up ye'ole VFX
    //
    const seq = new Sequence().effect()
        .scaleToObject(SCALE)
        .opacity(OPACITY)
        .persist()
        .name(vfxname)
        .file(VFX_FILE)
        .mirrorX(FLIP)
        .attachTo(target)
        .attachTo(token)
        .zeroSpriteRotation(true)
        .loopProperty("spriteContainer", "rotation", { from: ANGLE_START, to: ANGLE_STOP, duration: ORBIT_PERIOD })
        .spriteOffset({ x: 0.4 }, { gridUnits: true })
        .fadeIn(500)
        .fadeOut(150)
    await seq.play()
    //------------------------------------------------------------------------------------------------------------------------------
    // Update item in side bar, by calling a macro from this macro
    //
    jez.log(`--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
}