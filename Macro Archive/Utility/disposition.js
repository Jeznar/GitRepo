const MACRONAME = "disposition.0.1"
let msg = ""
let errorMsg = ""
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
const DEBUG = true;
isFriendly(tToken);
postNewChatMessage(msg)

/***************************************************************************************************
 * Post a new chat message
 ***************************************************************************************************/
 async function postNewChatMessage(msgString) {
    const FUNCNAME = "postChatMessage(msgString)";
    log(`--------------${FUNCNAME}-----------`, "Starting", `${MACRONAME} ${FUNCNAME}`,
        "msgString",msgString);
    await ChatMessage.create({ content: msgString });
    log(`--------------${FUNCNAME}-----------`, "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/************************************************************************
 * Return true if token is friendly
*************************************************************************/
function isFriendly(token) {
    const FRIENDLY = 1, NEUTRAL = 0, HOSTILE = -1;  // Token dispostions, strings as shown in UI  
    log(`checking attitude of ${token.name}, ${token.data.disposition}`)
    switch (token.data.disposition) {
        case FRIENDLY: msg = `${token.name} has a <b>friendly</b> disposition`; break;
        case NEUTRAL:  msg = `${token.name} has a <b>neutral</b> disposition`; break;
        case HOSTILE:  msg = `${token.name} has a <b>hostal</b> disposition`; break;
    }
    log(msg);
    if (token.data.disposition === FRIENDLY) return (true);
    return (false);
}

/***************************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************************/
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