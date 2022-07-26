const MACRONAME = "demo_inRangeTargets.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Development/Test engine for inRangeTargets
 * 
 * 07/26/22 0.1 Creation
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
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

//---------------------------------------------------------------------------------------------------
// Run the main procedures
//
if (args[0]?.tag === "OnUse") {
    let options = {
        exclude: "Friendly",    // self, friendly, or none
        direction: "t2o",       // t2o or o2t (Origin to Target)
        chkMove: true,          // Boolean
        chkSight: true,         // Boolean
        chkHear: false,         // Boolean
        chkSpeed: true,         // Boolean
        chkBlind: true,         // Boolean
        chkDeaf: true,          // Boolean
        traceLvl: TL,           // Trace level, integer typically 0 to 5
    }
    let returned = await jez.inRangeTargets(aToken, 30, options);
    console.log("Result", returned)
    if (returned.length === 0) return jez.badNews(`No affectable targets in range`, "i")
    for (let i = 0; i < returned.length; i++) console.log(`Targeting: ${returned[i].name}`)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/