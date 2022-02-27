const MACRONAME = "Fog_Cloud_0.1"
/*****************************************************************************************
 * Slap a text message on the item card indicating effects of fog cloud.
 * 
 * Spell Description: You create a 20-foot-radius sphere of fog centered on a point within 
 *   range. The sphere spreads around corners, and its area is heavily obscured. It lasts 
 *   for the duration or until a wind of moderate or greater speed (at least 10 miles per 
 *   hour) disperses it.
 * 
 *   At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, 
 *   the radius of the fog increases by 20 feet for each slot level above 1st.
 * 
 * 12/11/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = false;
let msg = "";
if(DEBUG) {
    console.log(`************ Executing ${MACRONAME} ****************`)
    console.log(`args[0]: `,args[0]);
}

msg = `A <b>sphere of thick billowing fog</b> @JournalEntry[XfpVN7dTzsmDOXUT]{heavily obscures} 
an area, creatures within it, or trying to look through it are effectively
@JournalEntry[lIPpTxLdMS9z2G94]{blinded}.`

console.log(`************ Terminating ${MACRONAME} ****************`)
postResults(msg);
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    /***************************************** 
     * Some Special div's per Posney's docs
     *  - midi-qol-attack-roll
     *  - midi-qol-damage-roll
     *  - midi-qol-hits-display
     *  - midi-qol-saves-display
     * 
     * One other that I have been using
     *  - midi-qol-other-roll
    ******************************************/

    const DIV = "midi-qol-damage-roll"; 

    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    if (DEBUG) console.log(`chatMessage: `,chatMessage);
    //const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    //const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}