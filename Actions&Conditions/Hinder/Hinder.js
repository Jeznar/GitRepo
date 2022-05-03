/************************************************************
 * Implement the "hurtful" half of the RAW Help Axtion in a 
 * somewhat approximate way.
 * 
 * "Alternatively, you can aid a friendly creature in attacking 
 * a creature within 5 feet of you. You feint, distract the 
 * target, or in some other way team up to make your ally's 
 * attack more effective. If your ally attacks the target 
 * before your next turn, the first attack roll is made with 
 * advantage."
 * 
 * This macro ammends that rule slightly, making the attack 
 * benefited the next one against that target regardless of 
 * source.
 * 
 * Midi-QoL Documentation: https://gitlab.com/tposney/midi-qol
 * 
 * List of Midi-QoL Flags:
 * https://docs.google.com/spreadsheets/u/0/d/1Vze_sJhhMwLZDj1IKI5w1pvfuynUO8wxE2j8AwNbnHE/htmlview
 * 
 * 11/17/21 0.1 JGB created from Help_0.1
 * 11/17/21 0.2 JGB Code Cleaning
 ***********************************************************/
const macroName = "Hinder_0.1"
const debug = 0;
if (debug) console.log(`Starting: ${macroName} arguments passed: ${args.length}`);
if (debug > 2) { let i = 0; for (let arg in args) { console.log(` ${i++}: ${arg}`) }; }

/************************************************************************
* Set Variables for execution
*************************************************************************/
let targetD = canvas.tokens.get(args[0].targets[0].id);
let itemD = args[0].item;
let player = canvas.tokens.get(args[0].tokenId);

if (debug > 1) {
    console.log(` *** Player *** `, player);
    console.log(` *** targetD *** `, targetD);
    console.log(` *** itemD *** `, itemD);
    console.log(` *** itemD.img *** `, itemD.img);
}

/************************************************************************
* Check Initial Conditions
*************************************************************************/

// Need to have exactly one target selected
if (game.user.targets.ids.length != 1) {
    let message = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
    ui.notifications.warn(message);
    if (debug) console.log(message);
    return; 
} else if (debug) console.log(` targeting one target`);

// Target needs to be in range
let range = 5; range += 2.5;    // Add a half square buffer for diagonal adjacancy 
let distance = canvas.grid.measureDistance(player, targetD);
distance = distance.toFixed(1);             // Chop the extra decimals, if any
if (debug) console.log(` Considering ${targetD.name} at ${distance} distance`);
if (distance > range) {
    let message = ` ${targetD.name} is not in range (${distance}), end ${macroName}`;
    ui.notifications.warn(message);
    if (debug) console.log(message);
    return;
}

/************************************************************************
 * Provide the target with a buff that gives advantage on next ability 
 * check.
*************************************************************************/
const CUSTOM=0, MULTIPLY=1, ADD=2, DOWNGRADE=3, UPGRADE=4, OVERRIDE=5;
const gameRound = game.combat ? game.combat.round : 0;
const mqFlag = "flags.midi-qol.grants.advantage.attack.all";
const mqExpire = "isAttacked"; 
if (debug) console.log(`${mqFlag}, ${mqExpire}`);

let effectData = {
    label: "Hinder Debuff",
    icon: itemD.img,
    origin: player.actor.uuid,
    disabled: false,
    duration: { rounds: 1, startRound: gameRound },
    flags: { dae: { macroRepeat: "none", specialDuration: [mqExpire] } },
    changes: [{
        key: mqFlag,
        value: 1,
        mode: ADD,
        priority: 20
    }]
};
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetD.actor.uuid, effects: [effectData] });

/************************************************************************
 * Post the results to chart card
 *************************************************************************/
const lastArg = args[args.length - 1];
let resultsString = `${targetD.name} is hindered by the actions of ${player.name}, 
                    granting advantage to next attacker within 1 turn.`;

let chatMessage = await game.messages.get(lastArg.itemCardId);
let content = await duplicate(chatMessage.data.content);
const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
content = await content.replace(searchString, replaceString);
await chatMessage.update({ content: content });
await ui.chat.scrollBottom();

return;