const MACRONAME = "Force_Target.0.1"
/*****************************************************************************************
 * 
 * 12/29/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME} or ${MACRO}`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

let aToken = null;
const lastArg = args[args.length - 1];
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
const MINION = "*Moonbeam*"

//----------------------------------------------------------------------------------------------
// Search for MINION in the current scene 
//
let eToken = null
for (let critter of game.scenes.viewed.data.tokens) {
    if (critter.data.name === MINION) {
        eToken = critter
        break;
    }
}
log("Target token", eToken);
// eToken._object.setTarget(true, {user: this, releaseOthers: false, groupSelection: true});

let id = eToken._object.id
log("Token Id", id);
const newToken = canvas.tokens.get(id);
// if (!token || this.targets.has(token)) continue;
newToken.setTarget(true, { user: this, releaseOthers: false, groupSelection: true });
log("newToken",newToken);

/*
const token = canvas.tokens.get(id);
if ( !token || this.targets.has(token) ) continue;
token.setTarget(true, {user: this, releaseOthers: false, groupSelection: true});*/

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