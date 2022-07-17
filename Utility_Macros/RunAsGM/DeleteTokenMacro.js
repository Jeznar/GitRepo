const MACRONAME = "DeleteTokenMacro.0.4.js"
/***************************************************************************************
 * Run as GM Macro that deletes the token passedto it as the only argument
 * 
 * 12/15/21 0.1 Creation
 * 12/30/21 0.2 Added check for existince of document 
 * 01/13/21 0.3 Code failing to set delToken_document id
 * 05/17/22 0.4 Chasing bug in 0.3 and using library function
 * 07/17/22 0.5 Added support for multi tokens called by DAE off
 ***************************************************************************************/
const delToken = args[0];
jez.log(`----- Starting ${MACRONAME} ----------`,
    `delToken`, delToken,
    `    Name`, delToken.name,
    ` # Parms`, args.length);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

// -------------------------------------------------------------------------------------
// Use warpgate to delete the token 
//
let sceneId = game.scenes.viewed.id

if (args[0] === "off") 
    for (let i = 1; i < args.length-1; i++) 
        warpgate.dismiss(args[i], sceneId)
else warpgate.dismiss(delToken.id, sceneId)

jez.log(`-------Finished ${MACRONAME} -----------`);