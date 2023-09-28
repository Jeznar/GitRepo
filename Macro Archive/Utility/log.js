let a = "able"
let b = "beta"
let c = { a:"abc", x:879}
let DEBUG = true;

log("Hi There", a, b, c, a, c);
log(`Fred ${b}`,c)
log("Hi There", a, b, c);
log(`Fred ${b}`,c)
log("Hi There", a, b, c, DEBUG);
log(`Fred ${b}`, c, DEBUG)
return

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
        for ( i; i<numParms; i=i+2) console.log(` ${lines++}) `, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++}) `, parms[i],":",parms[i+1]);
    }
}