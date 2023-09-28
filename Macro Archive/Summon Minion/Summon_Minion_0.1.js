const MACRONAME = "Summon_Minion_0.1"
/*****************************************************************************************
 * Summon MINION to the field.
 * 
 * 12/01/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = false;
const MINION = "Flopsy"

if (DEBUG) {
    console.log(`Executing: ${MACRONAME}`);
    console.log(` Minion: ${MINION}`);
}

await warpgate.spawn(MINION);
let message = `<strong>${actor.name}</strong> summons <strong>${MINION}</strong> to the field.`;
postResults(message);
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