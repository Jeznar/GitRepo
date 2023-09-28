const MACRONAME = "Get_Entities"
/*****************************************************************************************
 * Taken from the set of example and community macros
 * 
 * Errors out for undetermined reasons on first setting
 *****************************************************************************************/
const DEBUG = true;
log("------------------------------------------------------------------------------------",
    "Starting", MACRONAME);

// Get actor / item / scene / journal etc by ID
let actor = game.actors.get("0HcZSUIUZ48WAPyv")
let item = game.items.get("0HcZSUIUZ48WAPyv")
let journal = game.journal.get("0HcZSUIUZ48WAPyv")
let scene = game.scene.get("0HcZSUIUZ48WAPyv")

// Get actor / item / scene / journal etc by name
let actor = game.actors.getName("Steve")
let item = game.items.getName("Steve's Item")
let journal = game.journal.getName("Steve's Journal")
let scene = game.scene.getName("Steve's House")

// Get all actors which are Player Characters
let pcs = game.actors.filter(actor => actor.isPC)

// Get all actors which are npcs
let npcs = game.actors.filter(actor => !actor.isPC)

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
