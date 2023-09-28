const MACRONAME = "DeleteTokenMacro_0.3"
/***************************************************************************************
 * Run as GM Macro that deletes the token passedto it as the only argument
 * 
 * 12/15/21 0.1 Creation
 * 12/30/21 0.2 Added check for existince of document 
 * 01/13/21 0.3 Code failing to set delToken_document id
 ***************************************************************************************/
const DEBUG = true;
const delToken = args[0];
log("---------------------------------------------------------------------------",
    "Starting", MACRONAME,
    `delToken`, delToken,
    `    Name`, delToken.name,
    ` # Parms`, args.length);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

// let delToken_document = delToken?.id.document || delToken.document
let delToken_document = delToken

log("delToken_document", delToken_document)

//canvas.tokens.get(delToken._id)?.document.delete()  // Delete token
delToken_document.delete()  // Delete token

log("---------------------------------------------------------------------------",
    "Finished", `${MACRONAME}`);
return;

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