const MACRONAME = "Consume_Familiar_0.3"
/*****************************************************************************************
 * Implemention for removal of familiar as a part of the HomeBrew: Consume Familiar for
 * Olivia in the Travels in Barovia Campaign.
 * 
 * args[0] contains a bunch of information for ItemMacro macros, including templateID of 
 * the placed template (if any).  That ID can be accessed as: args[0].templateId
 * The list is documented at: https://gitlab.com/tposney/midi-qol#notes-for-macro-writers
 * 
 * Spell Description: Whenever you cast a curse spell that requires material components, 
 * as a free action, you can instead use your familiar’s life force. Your familiar 
 * disappears (as if it lost all of its hit points) and you may cast any of your curses 
 * you know in the Occultist spell list without requiring any material components.
 * 
 * 11/30/21 0.1 Creation of Macro
 * 12/02/21 0.2 Alter logic to destroy all existing copies of the MINION
 * 12/15/21 0.3 Change to use a RunAsGM helper macro to allow players to delete token
 *****************************************************************************************/
const DEBUG = true;
const MINION = "Flopsy"
const RUNASGMMACRO = "DeleteTokenMacro";

const viewedScene = game.scenes.viewed;
// let found = false;
// let sacTokenID = null;
// let sacToken = null;
let message = "";
let minionCount = 0;
let minionCountDead = 0;

actor = canvas.tokens.get(args[0].tokenId).actor;

if (DEBUG) {
    console.log(`Starting: ${MACRONAME}`);
    console.log(`  Minion: ${MINION}`);
    console.log(`   Scene: `, viewedScene);
    console.log(`  Tokens: `, viewedScene.data.tokens );
    console.log(`   actor: `,actor);
    console.log(`   Actor.name: ${actor.name}`);
}

//----------------------------------------------------------------------------------------------
// Make sure the RUNASGMMACRO exists and is configured correctly
//
const DeleteFunc = game.macros.getName(RUNASGMMACRO);
if (!DeleteFunc) {
    ui.notifications.error(`Cannot locate ${RUNASGMMACRO} run as GM Macro`);
    return;
}
if (!DeleteFunc.data.flags["advanced-macros"].runAsGM) {
    ui.notifications.error(`${RUNASGMMACRO} "Execute as GM" needs to be checked.`);
    return;
}
if (DEBUG) console.log(` Found ${RUNASGMMACRO}, verified Execute as GM is checked`);

//----------------------------------------------------------------------------------------------
// Search for MINION in the current scene 
//
for (let critter of viewedScene.data.tokens) {
    if (DEBUG>1) console.log(critter.data.name);
    if (critter.data.name === MINION) {
        if (critter._actor.data.data.attributes.hp.value > 0) minionCount++ 
        else minionCountDead++
        if (DEBUG) console.log(` Found ${minionCount} ${MINION} alive and ${minionCountDead} dead so far, TokenID ${critter.data._id} `,critter);
        // canvas.tokens.get(critter.data._id).document.delete()  // Delete MINION's token
        DeleteFunc.execute(critter);
    }
}

//----------------------------------------------------------------------------------------------
// Create appropriate message for chat card
//
if (minionCount > 0) {
    message = `<b>${MINION}</b> has been consumed to power <b>${actor.name}'s</b> curse. 
    Its essense replacing any material components for the current curse spell.<br>`;
    if (minionCount > 1) message += `Total of ${minionCount} active ${MINION}s were deleted.<br>`;
} else {
    message = `Could not find active <b>${MINION}</b> in current scene to consume.  ${actor.name}'s current curse 
    spell <b>still requires material components</b> as normal.<br>`
}
if (minionCountDead > 0) {
    message += `<br><b>${minionCountDead}</b> dead ${MINION} tokens were removed from scene.`
}

//----------------------------------------------------------------------------------------------
// Report results of operation
//
if (DEBUG) console.log(message);
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

/****************************************************************************************
 * run as GM macro body follows (intentionally commented out)
 ****************************************************************************************
 const MACRONAME = "DeleteTokenMacro_0.1"
 /***************************************************************************************
  * Run as GM Macro that deletes the token passedto it as the only argument
  * 
  * 12/15/21 0.1 Creation
  ***************************************************************************************
 const DEBUG = false;
 const delToken = args[0];
 
 if (DEBUG) {
     console.log(`Executing ${MACRONAME}`);
     console.log(` delToken: `,delToken);
     console.log(`     Name: ${delToken.name}`);
 }
 canvas.tokens.get(delToken._id).document.delete()  // Delete token
 if (DEBUG) console.log(`Ending ${MACRONAME}`);
 return; */