const MACRONAME = "Simple_Dialog.0.1"
/*******************************************************************************************
 * Implement Simple Dialog for User 
 * 
 * 12/28/21 0.1 JGB Creation
 *******************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const lastArg = args[args.length - 1];

let aToken = null;
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);

log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME} or ${MACRO}`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

const dialogTitle = "Make a choice of how to use your action"
const dialogText = `The nasty vines are keeping you restrained.  Would you like to use your action
        to attempt to break the vines, or simply ignore them and do something else with your action?<br><br>`
const buttonOne = "Break Vines"
const buttonTwo = "Ignore Vines"
popSimpleDialog(dialogTitle, dialogText, callBackFunc, buttonOne, buttonTwo) 

log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
return;
 /***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/****************************************************************************************
 * Create and process selection dialog, passing it onto specified callback function
 ***************************************************************************************/
 function popSimpleDialog(dialogTitle, dialogText, callBackFunc, buttonOne, buttonTwo) {
    const FUNCNAME = "popSimpleDialog(dialogTitle, dialogText, callBackFunc, buttonOne, buttonTwo)";
    log("---------------------------------------------------------------------------",
        `Starting`, `${MACRONAME} ${FUNCNAME}`,
        `dialogTitle`, dialogTitle,
        `dialogText`, dialogText,
        `buttonOne`, buttonOne,
        `buttonTwo`, buttonTwo);

    if (typeof(callBackFunc)!="function" ) {
        let msg = `pickFromList given invalid callBackFunc, it is a ${typeof(callBackFunc)}`
        ui.notifications.error(msg);
        log(msg);
        return
    }   

    if (!dialogTitle || !dialogText || !buttonOne || !buttonTwo ) {
        let msg = `pickFromList arguments should be (dialogTitle, dialogText, callBackFunc, buttonOne, buttonTwo),
                   but yours are: ${dialogTitle}, ${dialogText}, ${callBackFunc}, ${buttonOne}, ${buttonTwo}`;
        ui.notifications.error(msg);
        log(msg);
        return
    }

    new Dialog({
        title: dialogTitle,
        content: dialogText,
        buttons: {
            button1: {
                icon: '<i class="fas fa-check"></i>',
                label: buttonOne,
                callback: async () => {
                    log(`selected button 1: ${buttonOne}`)
                    callBackFunc(`Selected button 1: ${buttonOne}`)
                },
            },
            button2: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Ignore Vines',
                callback: async () => {
                    log('canceled')
                    callBackFunc(`Selected button 2: ${buttonTwo}`)
                },
            },
        },
        default: 'button2'
    }).render(true)

    log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Create and process selection dialog, passing it onto specified callback function
 ***************************************************************************************/
async function callBackFunc(text) {
    const FUNCNAME = "";
    log("---------------------------------------------------------------------------",
        `Started`, `${MACRONAME} ${FUNCNAME}`);
    log("!!!! Text is here !!!!",text)
    postResults(text)
    // SimpleChatMessage(aToken, text)
    log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Create and process selection dialog, passing it onto specified callback function
 * 
 * Courtesy of @errational --  Creates a chat message
 * 
 * This throws an error: TypeError: content.trim is not a function
 ***************************************************************************************/
function SimpleChatMessage(token, text) {
    ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(token),
        content: text,
        type: CONST.CHAT_MESSAGE_TYPES.OTHER
    });

    /* ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({actorD: actorD}),
        content: the_message,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE
      });*/
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

/****************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsStr) {
    const lastArg = args[args.length - 1];

    if(DEBUG) console.log(`postResults: ${resultsStr}`);
  
    let chatMessage = await game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsStr}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
  }