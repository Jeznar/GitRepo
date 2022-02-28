const MACRONAME = "Summon_Moonbeam_0.1"
/*****************************************************************************************
 * Implemention of Summon Moonbeam.  Based on macro Jon baked. 
 * 
 * 12/29/21 0.1 Macro to summon a "moonbeam" actor to be used as anchor for effect
 *****************************************************************************************/
const DEBUG = true;
const MINION = "*Moonbeam*"

if (DEBUG) {
    console.log(`Starting: ${MACRONAME}`);
    console.log(`tokenId ${args[0].tokenId}`,args[0].tokenId);
    console.log(` Token: `,canvas.tokens.get(args[0].tokenId).actor);
}

await executeSummonAtTemplate(MINION);

if (DEBUG) console.log(`Ending ${MACRONAME}`);
return;


/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

async function executeSummonAtTemplate(minion) {
    const FUNCNAME = "executeSummon(minion)";
    const RUNASGMMACRO = "SummonCreatureMacro";
    const viewedScene = game.scenes.viewed;
    const squareWidth = viewedScene.data.grid;
    
    //---------------------------------------------------------------------------------
    // Extract information from template and then delete it
    //
    const templateID = args[0].templateId
    let x = canvas.templates.get(templateID).data.x - squareWidth/2;
    let y = canvas.templates.get(templateID).data.y - squareWidth/2;
    canvas.templates.get(templateID).document.delete()

    log("-----------------------------------", 
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "minion", minion,
        "coords (x,y)", `${x},${y}`,
        "RUNASGMMACRO", RUNASGMMACRO,
        "viewedScene", viewedScene, 
        "squareWidth", squareWidth);

    // Make sure the RUNASGMMACRO exists and is configured correctly
    const SummonFunc = game.macros.getName(RUNASGMMACRO);
    if (!SummonFunc) {
        ui.notifications.error(`Cannot locate ${RUNASGMMACRO} run as GM Macro`);
        return;
    }
    if (!SummonFunc.data.flags["advanced-macros"].runAsGM) {
        ui.notifications.error(`${RUNASGMMACRO} "Execute as GM" needs to be checked.`);
        return;
    }
    log(` Found ${RUNASGMMACRO}, verified Execute as GM is checked`);

    // Invoke the RunAsGM Macro to do the job
    SummonFunc.execute(minion, x, y);
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