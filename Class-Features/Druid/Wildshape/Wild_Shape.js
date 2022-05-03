const MACRONAME = "Wild_Shape_0.3"
/*****************************************************************************************
 * Macro just appends some general info to the item card created by Wild Shape
 * 
 * 12/02/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = false;
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;

//actor = canvas.tokens.get(args[0].tokenId).actor;

if (DEBUG) {
    console.log(`Starting: ${MACRONAME}`);
    console.log(`   Token: ${aToken.name}`);
}

let message = `<p style="color:Green;"><b>${aToken.name}</b> has used a charge of <b>${aItem.name}</b> 
to shift into a new form</p>  
<em>An actor from the <b>Actor's Directory</b> can be dropped on <b>${aToken.name}'s</b> open character sheet 
and the popup window used to complete the transformation. End the transformation with <b>Restore Transformation</b>
from the top of the hybrid character sheet.  Any carry over damage needs to be handled manually.</em>`;

// Report results of operation
if (DEBUG) console.log(message);
await postResults(message);
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/****************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    let chatMessage = await game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}