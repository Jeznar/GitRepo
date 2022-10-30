const MACRONAME = "Charge.0.1.js"
/*****************************************************************************************
 * Implement the knockdown portion of charge
 * 
 * Action Description: If %TOKENNAME% moves at least 20 feet straight toward a target and 
 * then hits it with a ram attack on the same turn, the target takes an extra 3 (1d6) 
 * bludgeoning damage.
 * 
 * If the target is a creature, no more than one size larger than %TOKENNAME%, it must 
 * succeed on a DC 12 Strength saving throw or be knocked prone.
 * 
 * 10/26/22 0.1 Creation of Macro from Trampling_Charge_0.3.js
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor;
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
const DEBUG = true;
const CONDITION = "Prone";
const PRONE_JRNL = `@JournalEntry[${game.journal.getName(CONDITION).id}]{Prone}`
//------------------------------------------------------------------------------------------
// Prepare for and pop a simple dialog asking if preconditions were met
const Q_TITLE = `Did ${aToken.name} Charge?`
const Q_TEXT = `To qualify as a trampling charge ${aToken.name} must impact the target after
    moving 20 feet or more in a straight line at the target.<br><br>Select Yes, if this 
    precondition was met.<br><br>
    If no, the damage must be manually reversed.`
let confirmation = await Dialog.confirm({title: Q_TITLE, content: Q_TEXT,});
if (!confirmation) return jez.badNews(`Preconditions not met, skipping ${aItem.name} effects.`,"i")
// ---------------------------------------------------------------------------------------
// Make sure exactly one target.
//
console.log(args[0].targets.length)
if (args[0].targets.length !== 1) {
    msg = `One and only one target is allowed.  Tried to hit ${args[0].targets.length}.`;
    postResults(msg);
    return jez.badNews(msg, "i")
}
// ---------------------------------------------------------------------------------------
// If no target was hit, post result and terminate 
//
let tToken = canvas.tokens.get(args[0].targets[0].id);
if (args[0].hitTargets.length === 0) {
    msg = `${tToken.name} avoided the knockdown by making its save.`;
    postResults(msg);
    return jez.badNews(msg, "i")
}
// ---------------------------------------------------------------------------------------
// Check to make sure the target isn't already prone
//
if (TL > 2) jez.trace(`${TAG} tToken.actor.effects: `, tToken.actor.effects);
let proneEffect = tToken.actor.effects.find(ef => ef.data.label === CONDITION);
if (TL > 2) jez.trace(`${TAG} proneEffect: `, proneEffect);
if (proneEffect) {
    msg = `<b>${tToken.name}</b> is already ${CONDITION}. Can not be knocked down again.`
    if (TL > 1) jez.trace(`${TAG} ${TAG}`);
    postResults(msg);
    return;
}
// ---------------------------------------------------------------------------------------
// Make sure the target is the no more than one size larger than the charger 
//
if (TL > 2) jez.trace(`${TAG} Involved Tokens ---`, "Active Token",aToken,"Target Token",tToken);
let sizeDiff = await sizeDelta(aToken, tToken, {traceLvl: TL});
if (TL > 1) jez.trace(`${TAG} Size Difference`, sizeDiff);
if (sizeDiff < -1) {
    msg = `${tToken.name} is too large to be knocked down by ${aToken.name}.`;
    postResults(msg);
    return;
}
// ---------------------------------------------------------------------------------------
// If the target saved post that and exit 
//
if (args[0].failedSaves.length === 0) {
    msg = `${tToken.name} made its saving throw. It is unaffected by knockdown.`
    postResults(msg);
    if (TL > 1) jez.trace(`${TAG} ${msg}`)
    return;
}
// ---------------------------------------------------------------------------------------
// Add prone condition to target
//
await jezcon.addCondition(CONDITION, tToken.actor.uuid, 
   {allowDups: false, replaceEx: false, origin: aActor.uuid, overlay: false, traveLvl: TL }) 
// ---------------------------------------------------------------------------------------
// Create and post success message.
//
msg = `<b>${tToken.name}</b> has been knocked ${PRONE_JRNL}.`
postResults(msg);
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]

    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Determine the number of size category first argument is larger than 
 * second and return that. 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function sizeDelta(entity1, entity2, options = {}) {
    const FUNCNAME = "sizeDelta(entity1, entity2)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- ${FUNCNAME} ---`, "entity1", entity1, "entity2", entity2);
    //-----------------------------------------------------------------------------------------------
    // Do the thing
    //
    let entity1SizeValue = (await jez.getSize(entity1)).value
    if (TL > 1) jez.trace(`${TAG} ${entity1.name} size value`, entity1SizeValue)
    let entity2SizeValue = (await jez.getSize(entity2)).value
    if (TL > 1) jez.trace(`${TAG} ${entity2.name} size value`, entity2SizeValue)
    return (entity1SizeValue - entity2SizeValue)
}