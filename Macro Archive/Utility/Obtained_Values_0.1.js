const MACRONAME = "Obtained_Values.0.1"
/*****************************************************************************************
 * Obtain various useful values
 * 
 * 12/20/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
if (DEBUG) {
    log(` ---------------- starting ${MACRONAME} ----------------------------------------`);
    for (let i = 0; i < args.length; i++) log(`    args[${i}]`, args[i]);
}
log(``);

if (args[0]?.tag === "OnUse") doOnUse();   			    // Midi ItemMacro On Use
if (args[0] === "on") doDAE("on");          			// DAE Application
if (args[0] === "off") doDAE("off");        			// DAE removal
if (args[0] === "each") doDAE("each");					// DAE each turn

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/****************************************************************************************
 * Execute code for a ItemMacro onUse
 ***************************************************************************************/
function doOnUse() {
    const FUNCNAME = "doOnUse()";
    log(`-------------------Starting ${MACRONAME} ${FUNCNAME}-------------------------`);

    log("Invoker's Information",
        "Invoker's Actor Name - args[0].actor.name", args[0].actor.name,
        "Invoker's Token Name - args[0].actor.token.name", args[0].actor.token.name);

    for (let i = 0; i < args[0].targets.length; i++) {
        log(`Target[${i}]'s Information`,
            "Actor Name - args[0].targets[i]._actor.name", args[0].targets[i]._actor.name,
            "Token Name - args[0].targets[i].name", args[0].targets[i].name);
    }
}

/****************************************************************************************
 * Execute code for a ItemMacro doOn
 ***************************************************************************************/
 function doDAE(mode) {
    const FUNCNAME = `doDAE(${mode})`;
    log(`-------------------Starting ${MACRONAME} ${FUNCNAME}-------------------------`);
    for (let i = 0; i < args.length; i++) log(`    args[${i}]`, args[i]);

    let lastArg = args[args.length - 1];
    log("Obtaining aActor information",
        "canvas.tokens.get(lastArg.tokenId).actor", canvas.tokens.get(lastArg.tokenId).actor,
        "game.actors.get(lastArg.actorId)", game.actors.get(lastArg.actorId));
     let aActor = (lastArg.tokenId)
         ? canvas.tokens.get(lastArg.tokenId).actor
         : game.actors.get(lastArg.actorId);
     log("Affected actor's information", aActor,
         "aActor.name", aActor.name,
         "aActor.name.data.tokenName", aActor?.data?.token?.name);
     return;
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
        for (i; i < numParms; i = i + 2) console.log(` ${lines++})`, parms[i], ":", parms[i + 1]);
    } else {            // Even number of arguments
        console.log(parms[i], ":", parms[i + 1]);
        i = 2;
        for (i; i < numParms; i = i + 2) console.log(` ${lines++})`, parms[i], ":", parms[i + 1]);
    }
}
