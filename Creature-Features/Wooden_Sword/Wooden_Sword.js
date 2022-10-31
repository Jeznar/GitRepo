const MACRONAME = "Wooden_Sword.0.5.js"
/*****************************************************************************************
 * Implement Arabelle's Wooden Sword action which has two 
 * special results:
 * 1) On a hit, the target is at diadvantage on its next 
 *    attack roll
 * 2) It also grants advantage to the next attack made against
 *    the target, regardless of a hit or a miss.
 * 
 *  - Setup Variable
 *  - Verify initial conditons, exit on problems
 *    o Exactly one target selected
 *    o Check distance to target
 *  - If target was hit, apply the attack debuff
 *  - Apply the debuff too grant advantage on next attack
 *  - Post the result to chart card
 * 
 * Midi-QoL Documentation: https://gitlab.com/tposney/midi-qol
 * 
 * List of Midi-QoL Flags:
 * https://docs.google.com/spreadsheets/u/0/d/1Vze_sJhhMwLZDj1IKI5w1pvfuynUO8wxE2j8AwNbnHE/htmlview
 * 
 * 05/02/22 Update for Foundry 9.x
 * 08/02/22 0.4 Add convenientDescription and arabelle's quips in bubble statements
 * 10/31/22 0.5 Change range calaculations to handle larger target tokens
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
const TL = 5;                               // Trace Level for this macro
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
//
jez.log(`Starting: ${MACRONAME} arguments passed: ${args.length}`);
let gameRound = game.combat ? game.combat.round : 0;
let resultsString = "";
let attackHit = false;
const GRID_SIZE = game.scenes.viewed.data.grid
const GRID_DISTANCE = game.scenes.viewed.data.gridDistance
/************************************************************************
* Set Variables for execution
*************************************************************************/
// let target = canvas.tokens.get(args[0].failedSaves[0]._id);
// let actorD = game.actors.get(args[0].actor._id);
// let tokenD = canvas.tokens.get(args[0].tokenId).actor;
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id);
let range = 5; range += 2.5;    // Add a half square buffer for diagonal adjacancy 
const lastArg = args[args.length - 1];
const ABILITY = aItem.name;
let distance = 0;
/************************************************************************
* Check Initial Conditions
*************************************************************************/
// Need to have exactly one target selected
if (game.user.targets.ids.length != 1) {
    let message = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
    ui.notifications.warn(message);
    jez.log(message);
    return;
} else jez.log(` targeting one target`);
//----------------------------------------------------------------------------------
// Target needs to be in range, first Define FUDGE for this token so that distance 
// will be checked against an outer square and not at the top left corner of the
// token.
//
const WIDTH = tToken.w // The number of screen units wide the token is 
const TOKEN_SIZE = Math.round(GRID_DISTANCE*WIDTH/GRID_SIZE)
const FUDGE = (TOKEN_SIZE - 5)/1.41
if (TL>4) jez.trace(`${TAG} ${tToken.name} size is ${TOKEN_SIZE} feet, fudge is ${FUDGE}`)
//----------------------------------------------------------------------------------
//
//
distance = jez.getDistance5e(aToken, tToken)
if (TL>4) jez.trace(`${TAG} ${tToken.name} distance is ${distance} vs ${range+FUDGE}`)
// distance = canvas.grid.measureDistance(aToken, tToken);
// distance = distance.toFixed(1);             // Chop the extra decimals, if any
// jez.log(` Considering ${tToken.name} at ${distance} distance`);
if (distance > range + FUDGE) {
    let message = ` ${tToken.name} is not in range (${distance}), end ${MACRONAME}`;
    ui.notifications.warn(message);
    jez.log(message);
    return;
}
//----------------------------------------------------------------------------------
// Nab something witty (I hope) from the TABLE_NAME table
//
const TABLE_NAME = "Arabelle_Quip"
let table = game.tables.getName(TABLE_NAME);
if (table) {
    if (TL > 1) jez.trace(`${TAG} ${TABLE_NAME} table`, table)
    let roll = await table.roll();
    msg = roll.results[0].data.text;
} else {
    jez.badNews(`No quip (${TABLE_NAME}) table found, using default.`, "i")
    msg = `Give it up, you, you monster!`;
}
msg = msg.replace("%SOURCE%", aToken.name);
//----------------------------------------------------------------------------------
// Bubble that statement onto the screen
//
bubbleForAll(aToken.id, msg, true, true)
/************************************************************************
 * 
*************************************************************************/
let mqExpire = ["1Attack", "turnStartSource", "longRest", "shortRest"];
if (args[0].hitTargets.length !== 0) attackHit = true
if (attackHit) { // If target was hit, apply the attack debuff and grant advantage
    let message = `Hit ${tToken.name}, apply attack debuff`;
    jez.log(message);
    let effectData = {
        label: "Wooden Sword Attacked Debuff",
        icon: aItem.img,
        origin: aToken.actor.uuid,
        disabled: false,
        duration: { rounds: 2, startRound: gameRound },
        flags: { 
            dae: { macroRepeat: "none", specialDuration: mqExpire, stackable: false }, 
            convenientDescription: `Disadvantage on next attack`
        },
        changes: [{ key: "flags.midi-qol.disadvantage.attack.all", value: 1, mode: jez.ADD, priority: 20 }]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
} else {
    let message = ` Missed ${tToken.name}, do not apply attack debuff`;
    jez.log(message);
}
/************************************************************************
 * Apply the debuff to grant advantage on next attack
 *************************************************************************/
mqExpire = ["isAttacked", "turnStartSource", "longRest", "shortRest"];
let effectData = {
    label: "Wooden Sword Attack Debuff",
    icon: aItem.img,
    origin: aToken.actor.uuid,
    disabled: false,
    duration: { rounds: 2, startRound: gameRound },
    flags: { 
        dae: { macroRepeat: "none", specialDuration: mqExpire, stackable: false }, 
        convenientDescription: `Grants advantage on next attack`
     },
    changes: [{ key: "flags.midi-qol.grants.advantage.attack.all", value: 1, mode: jez.ADD, priority: 20 }]
};
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
/************************************************************************
 * Post the results to chart card
 *************************************************************************/
if (attackHit) {
    jez.log(` Post message that ${tToken.name} has attack debuff`);
    resultsString = `${tToken.name} is befuddled and has disadvantage on its next attack.<br><br>It is also distracted and grants advantage to next attacker.`;
    // getting chat message
    let chatMessage = await game.messages.get(lastArg.itemCardId);
    // duplicating chat message to copy over
    let content = await duplicate(chatMessage.data.content);
    //let searchString = "text you are looking for to replace";
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    //let replaceString = "replacement text";
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    // creating the object
    content = await content.replace(searchString, replaceString);
    // passing the update to the chat message
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
} else {
    let message = `  Post message that ${tToken.name} does not have attack debuff`;
    jez.log(message);
    resultsString = `${tToken.name} is distracted by the wild swing and grants advantage to next attacker.`;
    // getting chat message
    let chatMessage = await game.messages.get(lastArg.itemCardId);
    // duplicating chat message to copy over
    let content = await duplicate(chatMessage.data.content);
    //let searchString = "text you are looking for to replace";
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    //let replaceString = "replacement text";
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    // creating the object
    content = await content.replace(searchString, replaceString);
    // passing the update to the chat message
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
}