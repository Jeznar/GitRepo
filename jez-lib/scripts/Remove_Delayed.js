const MACRONAME = "Remove_Delayed.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Macro to wait time specified as args[2] milliseconds and then attempt to remove named active effect (args[1])
 * 
 * 03/22/23 0.2 JGB Creation
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
// let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
// const VERSION = Math.floor(game.VERSION);
// const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "each") doEach({ traceLvl: TL });					     // DAE everyround
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *  *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doEach(options = {}) {
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Cool heels
    //
    await jez.wait(args[2])
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Try to find effect to be removed
    //
    const EFFECT = await jez.getActiveEffect(aToken, ef => ef.data.label === args[1])
    if (!EFFECT) return jez.badNews(`Could not locate ${args[1]} on ${aToken.name}`)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Try to find effect to be removed
    //
    EFFECT.delete()
}