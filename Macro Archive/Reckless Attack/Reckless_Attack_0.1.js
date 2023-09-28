const MACRONAME = "Reckless_0.1"
/*****************************************************************************************
 * Macro that toggles the CUB Conditoned "Reckless" on/off.
 * 
 * 12/06/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
console.log(` token:`,token);
let effect = "Reckless"

actor = canvas.tokens.get(args[0].tokenId).actor;
let tokenName = token.data.name; 
let message = "";       // string to be appended to the itemCard reporting results
let actorID = canvas.tokens.get(args[0].tokenId);

if (DEBUG) {
    console.log(`Starting: ${MACRONAME}`);
    console.log(`   Actor: ${actor.name}`);
    console.log(` tokenName: ${tokenName}`);
    console.log(` effect: ${effect}`);
}
//--------------------------------------------------------------------------------------
// Reckless should be defined in CUB Condition Lab to include the following:
//   flags.midi-qol.advantage.attack.mwak
//   flags.midi-qol.grants.advantage.attack.mwak
//   flags.midi-qol.grants.advantage.attack.rwak
//   flags.midi-qol.grants.advantage.attack.msak
//   flags.midi-qol.grants.advantage.attack.rsak
//
//--------------------------------------------------------------------------------------
// If the actor is already reckless, the condition should be removed
//
let reckless = game.cub.hasCondition(effect, actorID, {warn:true});
if (DEBUG) console.log(` Already Reckless: `, reckless);
if (reckless) {
    game.cub.removeCondition(effect, actorID, {warn:true});
    message = `<b>${actorID.name}</b> was reckless, becoming cautious once again.<br>`
    await postResults(message);
    if (DEBUG) console.log(`Ending ${MACRONAME}`);
    return;
}
//--------------------------------------------------------------------------------------
// If the actor is didn't have the effect, it needs to be added
//
game.cub.addCondition(effect, actorID, {allowDuplicates: false, replaceExisting: true, warn: true});
message = `<b>${actorID.name}</b> is now reckless with advantage on melee weapon attacks also granting advantage to attacks against ${actorID.name}.<br>`
await postResults(message);
if (DEBUG) console.log(`Ending ${MACRONAME}`);
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

    if(DEBUG) console.log(`postResults: ${resultsString}`);
  
    let chatMessage = await game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
  }