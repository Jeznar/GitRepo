/************************************************************
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
 ***********************************************************/
const macroName = "Wooden_Sword_0.4"
const debug = 1;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5; // midi-qol mode values
jez.log(`Starting: ${macroName} arguments passed: ${args.length}`);
let gameRound = game.combat ? game.combat.round : 0;
let mqFlag = null;      // Midi-QoL Flag to apply
let mqExpire = [];    // Midi-QoL Expiration condition
let resultsString = "";
let attackHit = false;

/************************************************************************
* Set Variables for execution
*************************************************************************/
// let target = canvas.tokens.get(args[0].failedSaves[0]._id);
let actorD = game.actors.get(args[0].actor._id);
let tokenD = canvas.tokens.get(args[0].tokenId).actor;
let targetD = canvas.tokens.get(args[0].targets[0].id);
let itemD = args[0].item;
let player = canvas.tokens.get(args[0].tokenId);
let range = 5; range += 2.5;    // Add a half square buffer for diagonal adjacancy 
const lastArg = args[args.length - 1];
const ABILITY = itemD.name;
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
// Target needs to be in range
distance = canvas.grid.measureDistance(player, targetD);
distance = distance.toFixed(1);             // Chop the extra decimals, if any
jez.log(` Considering ${targetD.name} at ${distance} distance`);
if (distance > range) {
    let message = ` ${targetD.name} is not in range (${distance}), end ${macroName}`;
    ui.notifications.warn(message);
    jez.log(message);
    return;
}
/************************************************************************
 * If target was hit, apply the attack debuff
*************************************************************************/
mqFlag = "flags.midi-qol.disadvantage.attack.all";
mqExpire = ["1Attack", "turnStartSource", "longRest", "shortRest"];
jez.log(`${mqFlag}, ${mqExpire}`);
if (args[0].hitTargets.length !== 0) attackHit = true
if (attackHit) {
    if (debug) {
        let message = `Hit ${targetD.name}, apply attack debuff`;
        jez.log(message);
        let effectData = {
            label: "Attack Debuff",
            icon: itemD.img,
            origin: player.uuid,
            disabled: false,
            duration: { rounds: 2, startRound: gameRound },
            flags: { dae: { macroRepeat: "none", specialDuration: mqExpire } },
            changes: [{
                key: mqFlag,
                value: 1,
                mode: ADD,
                priority: 20
            }]
        };
        await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:targetD.actor.uuid, effects: [effectData] });
    }
} else {
    let message = ` Missed ${targetD.name}, do not apply attack debuff`;
    jez.log(message);
}
/************************************************************************
 * Apply the debuff to grant advantage on next attack
 *************************************************************************/
mqFlag = "flags.midi-qol.grants.advantage.attack.all";
mqExpire = ["isAttacked", "turnStartSource", "longRest", "shortRest"];
jez.log(`${mqFlag}, ${mqExpire}`);

jez.log(` Add debuff to ${targetD.name}`);

let effectData = {
    label: "Grant Advantage",
    icon: itemD.img,
    origin: player.uuid,
    disabled: false,
    duration: { rounds: 2, startRound: gameRound },
    flags: { dae: { macroRepeat: "none", specialDuration: mqExpire } },
    changes: [{
        key: mqFlag,
        value: 1,
        mode: ADD,
        priority: 20
    }]
};
await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:targetD.actor.uuid, effects: [effectData] });
/************************************************************************
 * Post the results to chart card
 *************************************************************************/
if (attackHit) {
    if (debug) {
        jez.log(` Post message that ${targetD.name} has attack debuff`);
        resultsString = `${targetD.name} is befuddled and has disadvantage on it's next attack.<br><br>It is also distracted and grants advantage to next attacker.`;
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
} else {
    if (debug) {
        let message = `  Post message that ${targetD.name} does not have attack debuff`;
        jez.log(message);
        resultsString = `${targetD.name} is distracted by the wild swing and grants advantage to next attacker.`;
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
}
return;