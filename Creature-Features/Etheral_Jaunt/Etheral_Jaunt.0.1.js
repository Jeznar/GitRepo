const MACRONAME = "Etheral_Jaunt.0.1";
/*****************************************************************************************
 * Add text to the Itemcard for Ether Jaunt.
 * 
 * 12/18/21 0.1 JGB Creation
 *  ******************************************************************************************/
const DEBUG = true;
let lastArg = args[args.length - 1]; 
let actorD = game.actors.get(args[0].actor._id);

let msg = "";
log("---------------------------------------------------------------------------");
log(`Starting: ${MACRONAME}`, "actorD.name", actorD.name)
for (let i = 0; i < args.length; i++) log(`    args[${i}]`, args[i]);

if (args[0]?.tag === "OnUse") doOnUse();   			// Midi ItemMacro On Use

//---------------------------------------------------------------------------------------
// Finish up this bit o'code
//
log(`Finishing: ${MACRONAME}`);
log("---------------------------------------------------------------------------");
return;

 /***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/****************************************************************************************
 * Execute code for a ItemMacro onUse
 ***************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    log("---------------------------------------------------------------------------");
    log(`Starting ${MACRONAME} ${FUNCNAME}`);

    let itemD = args[0]?.item;

    msg = `<b>${actorD.name}</b> fades to invisibility and enters the 
    @JournalEntry[L6hDTgXyGS80zbsy]{Border Ethereal} plane.`
    postResults(msg);
    log(`Finished ${MACRONAME} ${FUNCNAME}`);
    log("---------------------------------------------------------------------------");
    return;
}

/***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
async function postResults(resultsString) {
    const FUNCNAME = "postResults(resultsString)";
    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
    log(`Starting ${MACRONAME} ${FUNCNAME}`, 
        `resultsString`, resultsString);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    // let chatmsg = await game.messages.get(itemCard.id)
    let chatmsg = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatmsg.data.content);
    log(`chatmsg: `, chatmsg);
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();

    log("Finishing", FUNCNAME);
    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
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
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    }
}