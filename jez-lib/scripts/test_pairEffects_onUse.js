const MACRONAME = "test_pair_Effects_onUse.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * 
 * 12/06/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 1;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set standard variables
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
let tActor = tToken?.actor;
//---------------------------------------------------------------------------------------------------
// Slap an effect on active and targetted actor that will be paired
//
let subjects = [aActor.uuid, tActor.uuid]
await jezcon.addCondition("Prone", subjects,
    { allowDups: false, replaceEx: true, origin: aActor.uuid, overlay: false, traceLvl: TL })
await jez.wait(100)
jez.pairEffectsAsGM(aActor, "Prone", tToken.actor, "Prone")

return