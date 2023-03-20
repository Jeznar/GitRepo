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
const TL = 3;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const TEST_EFFECT_NAME = "Prone"
//-----------------------------------------------------------------------------------------------------------------------------------
// Loop through selected tokens looking for our TEST_EFFECT on each, dump it to console and move on
//
const TOKEN_COUNT = jez.selectedTokens(MACRO)
if (TOKEN_COUNT) {
    for (let token of canvas.tokens.controlled) {
        if (TL > 0) jez.trace(`${TAG} Running against ${token.name}`);
        const TEST_EFFECT = await getActiveEffectByName(token, TEST_EFFECT_NAME, { traceLvl: TL, waitTime: 2000 })
        if (TL > 1) jez.trace(`${TAG} TEST_EFFECT`,TEST_EFFECT)
        if (!TEST_EFFECT) console.log(`${TEST_EFFECT_NAME} *NOT* found on ${token.name}`, TEST_EFFECT)
        else console.log(`${TEST_EFFECT_NAME} *WAS* found on ${token.name}`, TEST_EFFECT)
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * This function will seaerch for a named activeEffect on a passed token/actor, returning the active effect or null if none found.
 * 
 * Options can have the following values meanigfully set:
 * 
 *   maxCheck(10)   - Maximum number of times to run the check
 *   traceLvl(0)    - Trace Level, this is a zero or a (presumably) small integer used to control trace verbosity.
 *   waitTime(2500) - Total amount of time (ms) that this function should wait (retrying) before giving up and returning a null 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function getActiveEffectByName(subject, EFFECT_NAME, options = {}) {
    const FUNCNAME = "getActiveEffectByName(subject, EFFECT_NAME, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `jez.${FNAME} |`
    const MAX_CHECK = options.maxCheck ?? 10
    const TL = options.traceLvl ?? 0
    const WAIT_TIME = options.waitTime ?? 2500
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "subject", subject, "EFFECT_NAME", EFFECT_NAME,
        "options", options);
    if (TL > 2) jez.trace(`${TAG} Options`,
        "MAX_CHECK", MAX_CHECK,
        "TL       ", TL,
        "WAIT_TIME", WAIT_TIME);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Function variables
    //
    const DELAY = WAIT_TIME / MAX_CHECK
    //-------------------------------------------------------------------------------------------------------------------------------
    // Convert the passed subject to an ACTOR5E Object
    //
    const ACTOR_OBJ = await jez.getActor5eDataObj(subject, { traceLvl: TL })
    if (!ACTOR_OBJ) return null // If subject didn't get us something, give up and quit.
    if (TL > 1) jez.trace(`${TAG} Actor Object received:`, ACTOR_OBJ)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    let foundEffect = null
    for (let i = 0; i < MAX_CHECK; i++) {
        if (TL > 1) jez.trace(`${TAG} Check ${i + 1} on ${ACTOR_OBJ.name}`)
        foundEffect = await ACTOR_OBJ.effects.find(ef => ef.data.label.startsWith(EFFECT_NAME));
        if (foundEffect) break
        await jez.wait(DELAY)
    }
    if (TL > 2) jez.trace(`${TAG} ${ACTOR_OBJ.name} foundEffect:`, foundEffect);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return foundEffect;
}