const MACRONAME = "test_getActiveEffectByName.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Test bed for development and testing of the jez.getActiveEffect function.
 * 
 * This is intended to be run as a macro from the hot bar, enabling testing of what should be a library function that is 
 * tolerant of a late appearing active effect on a selected token.
 * 
 * 03/19/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const EFFECT_NAME = "Prone"
//-----------------------------------------------------------------------------------------------------------------------------------
// Loop through selected tokens looking for our TEST_EFFECT on each, dump it to console and move on
//
const TOKEN_COUNT = jez.selectedTokens(MACRO)
if (TOKEN_COUNT) {
    for (let token of canvas.tokens.controlled) {
        if (TL > 0) jez.trace(`${TAG} Running against ${token.name}`);
        //
        const LAMBDA1 = ef => ef.data.label === EFFECT_NAME
        const EFFECT1 = await jez.getActiveEffect(token, LAMBDA1, { traceLvl: TL, maxCheck: 1, waitTime: 10 })
        if (TL > 1) jez.trace(`${TAG} EFFECT1`,EFFECT1)
        if (!EFFECT1) console.log(`LAMDA1 ${EFFECT_NAME} *NOT* found on ${token.name}`, EFFECT1)
        else console.log(`LAMDA1 ${EFFECT_NAME} *WAS* found on ${token.name}`, EFFECT1)
        //
        const EFFECT2 = await jez.getActiveEffect(token, ef => ef.data.label.startsWith(EFFECT_NAME))
        if (TL > 1) jez.trace(`${TAG} EFFECT2`,EFFECT2)
        if (!EFFECT2) console.log(`LAMDA1 ${EFFECT_NAME} *NOT* found on ${token.name}`, EFFECT2)
        else console.log(`LAMDA1 ${EFFECT_NAME} *WAS* found on ${token.name}`, EFFECT2)
        //
        const LAMBDA3 = ef => ef.data.label === EFFECT_NAME && ef.data.origin === 'Actor.hMu40c42yhTjep9M'
        const EFFECT3 = await jez.getActiveEffect(token, LAMBDA3, { traceLvl: TL, maxCheck: 2, waitTime: 500 })
        if (TL > 1) jez.trace(`${TAG} EFFECT`,EFFECT3)
        if (!EFFECT3) console.log(`LAMDA1 ${EFFECT_NAME} *NOT* found on ${token.name}`, EFFECT3)
        else console.log(`LAMDA1 ${EFFECT_NAME} *WAS* found on ${token.name}`, EFFECT3)
        //
    }
}