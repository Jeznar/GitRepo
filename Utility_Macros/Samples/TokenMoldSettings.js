const MACRONAME = "TokenMoldSettings.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Messing with Token Mold settings with intent of learning how to temporaily suppress the rename
 * setting.
 * 
 * 07/06/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 1;
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(2, trcLvl, `  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let msg = "";
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let tokenMoldSettings = game.settings.get("Token-Mold", "everyone");
jez.log("tokenMoldSettings",tokenMoldSettings)
jez.log("tokenMoldSettings.name.use",tokenMoldSettings.name.use)

