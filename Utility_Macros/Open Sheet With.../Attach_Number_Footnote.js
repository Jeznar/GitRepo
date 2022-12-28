const MACRONAME = "Attach_Number_Footnote.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Attach a numeric "footnote" as a VFX as a tech exploration.
 * It should be run from the macro folder or the hot bar with a token targeted.
 * 
 * 12/27/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
console.log(`       ============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) console.log(`  args[${i}]`, args[i]);
//------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let msg = ""
//----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
main();
jez.log(`============== Finishing === ${MACRONAME} =================`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (canvas.tokens.controlled.length !== 1) {
        jez.badNews(`Must select one token that will have a footnote added.  
            Selected ${canvas.tokens.controlled.length}`)
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: "Icons_JGB/Misc/Jez.png",
            msg: msg, title: `Try Again, Selecting One Token`,
        })
        return (false)
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Main function
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function main() {
    if (!preCheck()) return (false)
    //------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    const EFFECTNAME = 'effect'
    let sToken = canvas.tokens.controlled[0]
    runVFX(sToken, `${EFFECTNAME}-1`, {clockwise: true, flip: true})
    await jez.wait(Math.floor(Math.random() * 500) + 500)
    runVFX(sToken, `${EFFECTNAME}-2`,  {clockwise: false, flip: false})
    await jez.wait(Math.floor(Math.random() * 500) + 500)
    runVFX(sToken, `${EFFECTNAME}-3`, {flip: true})
    await jez.wait(5000)
    Sequencer.EffectManager.endEffects({ name: `${EFFECTNAME}-3`, object: sToken });
    await jez.wait(1000)
    Sequencer.EffectManager.endEffects({ name: `${EFFECTNAME}-2`, object: sToken });
    await jez.wait(1000)
    Sequencer.EffectManager.endEffects({ name: `${EFFECTNAME}-1`, object: sToken });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Use Selection Information...
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function runVFX(target, vfxname, options = {}) {
    const FUNCNAME = "runVFX(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    const CLOCKWISE = options.clockwise ?? Math.floor(Math.random() * 2)
    const FLIP = options.flip ?? (Math.floor(Math.random() * 2)) ? true : false
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'target', target, "options", options);
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
    new Sequence().effect()
        .scaleToObject(SCALE)
        .opacity(OPACITY)
        .persist()
        .name(vfxname)
        .file(VFX_FILE)
        .mirrorX(FLIP)
        .attachTo(target)
        .attachTo(token)
        .zeroSpriteRotation(true)
        .loopProperty("spriteContainer", "rotation", { from: ANGLE_START, to: ANGLE_STOP, duration: ORBIT_PERIOD})
        .spriteOffset({ x: 0.4 }, { gridUnits: true })
        .play()
    //------------------------------------------------------------------------------------------------------------------------------
    // Update item in side bar, by calling a macro from this macro
    //
    jez.log(`--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
}