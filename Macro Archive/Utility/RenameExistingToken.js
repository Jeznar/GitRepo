const MACRONAME = "RenameExistingToken.0.2.js"
jez.log(MACRONAME)
/*****************************************************************************************
 * Find an eixting token and rename it.  This is just a demo script.
 * 
 * 12/30/21 0.1 Creation of Macro
 * 05/02/22 0.2 Updated for FoundryVTT 9.x
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const MINION_NAME = "*Moonbeam*"
jez.log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME}`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
let tToken = null;
if (tToken = await findTokenByName(MINION_NAME)) {
    jez.log("I have fund it!", tToken)
} else {
    jez.log("Found only tears")
    return
}
//
// Macro for changing token name.
//
let newName = "Name B";
const updates = { _id: tToken.id, name: newName };
await tToken.document.update(updates);
/***************************************************************************************************
 * Find an owned token by name on current scene.  Return the token or null if not found
 ***************************************************************************************************/
 async function findTokenByName(name) {
    const FUNCNAME = "findTokenByName(name)";
    jez.log("-----------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "name", name)
    let targetToken = ""
    //----------------------------------------------------------------------------------------------
    // Loop through toens on the canvas looking for the one we seek
    //
    let ownedTokens = canvas.tokens.ownedTokens
    for (let i = 0; i < ownedTokens.length; i++) {
        jez.log(`  ${i}) ${ownedTokens[i].name}`, ownedTokens[i]);
        if (name === ownedTokens[i].name) {
            jez.log("Eureka I found it!")
            targetToken = ownedTokens[i]
            break;
        }
    }
    if (targetToken) jez.log(`${name}'s token has been found`, targetToken)
    else jez.log(`${name}'s token was not found :-(`)
    jez.log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (targetToken);
}