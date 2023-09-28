const MACRONAME = "DeleteTokenByName.0.1"
console.log(MACRONAME)
/*****************************************************************************************
 * Find an 
 * 
 * 12/30/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const TARGET_NAME = "*Moonbeam*"
let delToken = ""
log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME}`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

if (delToken = await findTokenByName(TARGET_NAME)) {
    log("I have fund it!", delToken)
    deleteToken(delToken)
} else log("Found only tears")

return;

/***************************************************************************************************
 * Find an owned token by name on current scene.  Return the token or null if not found
 ***************************************************************************************************/
async function findTokenByName(name) {
    const FUNCNAME = "findTokenByName(name)";
    log("-----------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "name", name)
    let targetToken = ""

    let ownedTokens = canvas.tokens.ownedTokens
    for (let i = 0; i < ownedTokens.length; i++) {
        log(`  ${i}) ${ownedTokens[i].name}`, ownedTokens[i]);
        if (name === ownedTokens[i].name) {
            log("Eureka I found it!")
            targetToken = ownedTokens[i]
            break;
        }
    }
    if (targetToken) log(`${TARGET_NAME}'s token has been found`, targetToken)
    else log(`${TARGET_NAME}'s token was not found :-(`)

    log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (targetToken);
}

/***************************************************************************************************
 * Delete a specified token from the scene using a RunAsGM Macro
 ***************************************************************************************************/
 async function deleteToken(minion) {
    const FUNCNAME = "deleteToken(minion)";
    const RUNASGMMACRO = "DeleteTokenMacro";
    log("-----------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "minion", minion);

    // Make sure the RUNASGMMACRO exists and is configured correctly
    const DeleteFunc = game.macros.getName(RUNASGMMACRO);
    if (!DeleteFunc) {
        ui.notifications.error(`Cannot locate ${RUNASGMMACRO} run as GM Macro`);
        return;
    }
    if (!DeleteFunc.data.flags["advanced-macros"].runAsGM) {
        ui.notifications.error(`${RUNASGMMACRO} "Execute as GM" needs to be checked.`);
        return;
    }
    log(` Found ${RUNASGMMACRO}, verified Execute as GM is checked`);

    // Invoke the RunAsGM Macro to do the job
    DeleteFunc.execute(minion);

    log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}

/****************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************/
 function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    }
}