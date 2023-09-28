const MACRONAME = "Wild_Companion_0.1"
/*****************************************************************************************
 * Macro just appends some general info to the item card created by Wild Companion
 * 
 * 12/02/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = false;

actor = canvas.tokens.get(args[0].tokenId).actor;

if (DEBUG) {
    console.log(`Starting: ${MACRONAME}`);
    console.log(`   Actor: ${actor.name}`);
}

let message = `${actor.name} has used a daily wild shape ability to summon a companion.  
The companion is equivalent to a familiar but is type fey.<br><br>
<em>Player may click a familiar from their companions button (top right of character sheet) and 
place it on scene with a click.</em>`;

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