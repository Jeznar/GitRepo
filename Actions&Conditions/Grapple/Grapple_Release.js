const MACRONAME = "Grapple_Release_0.3"
/*****************************************************************************************
 * Macro that releases an existing grapple (ad restraint)
 * 
 * 12/06/21 0.1 Creation of Macro
 * 12/12/21 0.3 Eliminate cubCondition calls
 *****************************************************************************************/
const DEBUG = true;
console.log(` token:`,token);

actor = canvas.tokens.get(args[0].tokenId).actor;
let tokenName = token.data.name; 
let message = "";       // string to be appended to the itemCard reporting results
let actorID = canvas.tokens.get(args[0].tokenId);

if (DEBUG) {
    console.log(`Starting: ${MACRONAME}`);
    console.log(`   Actor: ${actor.name}`);
    console.log(` tokenName: ${tokenName}`);
}

//--------------------------------------------------------------------------------------
// Make sure one and only one token is targeted
//
if (oneTarget()) {
    if (DEBUG) console.log(`One target is targeted, a good thing`);
} else {
    if (DEBUG) console.log(` exception on number of targets selected: ${message}`);
    await postResults(message);
    if (DEBUG) console.log(`Ending ${MACRONAME}`);
    return;
}
let targetID = canvas.tokens.get(args[0].targets[0].id);

//--------------------------------------------------------------------------------------
// Make sure the target is grappled
//
// let grappled = game.cub.hasCondition("Grappled", targetID, {warn:true});
let grappledEffect = targetID.actor.effects.find(ef => ef.data.label === "Grappled");
if (grappledEffect) {
    if (DEBUG) console.log(`${targetID.name} is grappled, a good thing.`);
} else {
    let message =+ `${targetID.name} is not grappled.  May not release a grapple on it.`
    await postResults(message);
    if (DEBUG) console.log(`Ending ${MACRONAME}`);
    return;
}

//--------------------------------------------------------------------------------------
// Make sure the actor is grappling
//
// let grappling = game.cub.hasCondition("Grappling", actorID, {warn:true});
let grapplingEffect = actorID.actor.effects.find(ef => ef.data.label === "Grappling");                 
if (grapplingEffect) {
    if (DEBUG) console.log(`${actorID.name} is grappling, a good thing.`);
} else {
    message += `<b>${actorID.name}</b> is not grappling, may not release a grapple.<br>`
    await postResults(message);
    if (DEBUG) console.log(`Ending ${MACRONAME}`);
    return;
}

// ----------------------------------------------------------------------
// If the target was restrained, remove it too as this seems more often 
// right than wrong
//
// let restrained = game.cub.hasCondition("Restrained", targetID, { warn: true });       
if (DEBUG) console.log(`targetID.actor.effects`, actorID.actor.effects)
let restrainedEffect = targetID.actor.effects.find(ef => ef.data.label === "Restrained");        
if (restrainedEffect) {
    // await game.cub.removeCondition("Restrained", targetID, { warn: true })                    
    await restrainedEffect.delete();
    if (DEBUG) console.log(` Removed existing Restrained conditon from ${targetID.name}`);
    message += `<b>${targetID.name}</b> is no longer <b>@JournalEntry[CZWEqV2uG9aDWJnD]{Restrained}</b><br>`
} else {
    if (DEBUG) console.log(`No Restrained conditon found on ${targetID.name}`);
}

// ----------------------------------------------------------------------
// Remove Grappled from target
//
// await game.cub.removeCondition("Grappled", targetID, { warn: true }) 
await grappledEffect.delete();
if (DEBUG) console.log(` Removed existing Grappled conditon from ${targetID.name}`);
message += `<b>${targetID.name}</b> is no longer <b>@JournalEntry[QAwq9CcEg3fh3qZ3]{Grappled}</b> <br>`


// ----------------------------------------------------------------------
// If the actor was Grappling, remove it (should always be true by here)
//
//await game.cub.removeCondition("Grappling", token, { warn: true })
await grapplingEffect.delete();
if (DEBUG) console.log(` Removed existing Grappling conditon from ${actorID.name}`);
message += `<b>${actorID.name}</b> is no longer <b>@JournalEntry[KmWFRyfFImaXM7O9]{Grappling}</b> <br>`

//--------------------------------------------------------------------------------------
// Post the results
//
await postResults(message);
if (DEBUG) console.log(`Ending ${MACRONAME}`);

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/****************************************************************************************
 * Verify exactly one target selected, boolean return
 ***************************************************************************************/
function oneTarget() {
    let DEBUG = false;

    if (!game.user.targets) {
        message = `Targeted nothing, must target single token to be acted upon`;
        // ui.notifications.warn(message);
        if (DEBUG) console.log(message);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        message = `Please target a single token to be acted upon. <br>Targeted ${game.user.targets.ids.length} tokens`;
        // ui.notifications.warn(message);
        if (DEBUG) console.log(message);
        return (false);
    }
    if (DEBUG) console.log(` targeting one target`);
    return (true);
}

/****************************************************************************************
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