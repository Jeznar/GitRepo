const macroName = "Help_0.6"
/************************************************************
 * Implement the "helpful" half of the RAW Help Axtion in a 
 * somewhat approximate way.
 * 
 * "You can lend your aid to another creature in the completion 
 * of a task. When you take the Help action, the creature you 
 * aid gains advantage on the next ability check it makes to 
 * perform the task you are helping with, provided that it 
 * makes the check before the start of your next turn."
 * 
 * This macro ammends that rule slightly, requiring adjacancy
 * to help (generally true) and simply providing advantage on
 * the target's next check.
 * 
 * Midi-QoL Documentation: https://gitlab.com/tposney/midi-qol
 * 
 * List of Midi-QoL Flags:
 * https://docs.google.com/spreadsheets/u/0/d/1Vze_sJhhMwLZDj1IKI5w1pvfuynUO8wxE2j8AwNbnHE/htmlview
 * 
 * 11/17/21 0.1 JGB created from Wooden_Sword_0.4
 * 11/17/21 0.2 JGB Code Cleanup
 * 11/20/21 0.3 JGB Change end condition to: 
 *                  isSkill: "Expires if the character rolls:  skill check"
 *                  isCheck: "Expires if the character rolls:  ability check"
 * 11/20/21 0.4 JGB More code cleanups
 * 11/20/21 0.5 JGB Posting error results to action card
 * 11/20/21 0.6 JGB Require target to be helped to be friendly
 ***********************************************************/
const debug = 1;
if (debug) console.log(`Starting: ${macroName} arguments passed: ${args.length}`);
if (debug > 2) { let i = 0; for (let arg in args) { console.log(` ${i++}: ${arg}`) }; }

/************************************************************************
* Set Variables for execution
*************************************************************************/
// let target = canvas.tokens.get(args[0].failedSaves[0]._id);
let targetD = canvas.tokens.get(args[0].targets[0]?.id);
let itemD = args[0].item;
let player = canvas.tokens.get(args[0].tokenId);
let range = 5;
let effect = "Helped";

if (debug > 1) {
    console.log(` *** Player *** `, player);
    console.log(` *** targetD *** `, targetD);
    console.log(` *** itemD *** `, itemD);
    console.log(` *** itemD.img *** `, itemD.img);
}

/************************************************************************
* Check Initial Conditions, bail out as appropriate
*************************************************************************/
if (!oneTarget()) {
    postResults(`${player.name} seems to have had a PEBCAK.<br>Target one entity, please`);
    return;  
}
if (!isFriendly(targetD)) {
    postResults(`${player.name} reconsiders as ${targetD.name} is not friendly.`);
    return;  
}
if (!inRange(player, targetD, range)) {
    postResults(`${player.name} is too far from ${targetD.name} to help.`);
    return;  
}
if (hasEffect(targetD, effect)) {
    postResults(`${targetD.name} has already been helped.`);
    return;  
}

/************************************************************************
 * Provide the target with a buff that gives advantage on next ability 
 * check.
*************************************************************************/
const gameRound = game.combat ? game.combat.round : 0;
const mqFlag = "flags.midi-qol.advantage.ability.check.all";
const mqExpire = ["isCheck", "isSkill"]
const CUSTOM=0, MULTIPLY=1, ADD=2, DOWNGRADE=3, UPGRADE=4, OVERRIDE=5; 

if (debug) {
    console.log(`${targetD.name} receives ${effect}`);
    console.log(`FLAG ${mqFlag}\nEXPIRE ${mqExpire}\nROUND ${gameRound}`);
}

let effectData = {
    label: effect,
    icon: itemD.img,
    origin: player.actor.uuid,
    disabled: false,
    duration: { rounds: 1, startRound: gameRound },
    flags: { dae: { macroRepeat: "none", specialDuration: mqExpire } },
    changes: [{
        key: mqFlag,
        value: 1,
        mode: ADD,
        priority: 20
    }]
};
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetD.actor.uuid, effects: [effectData] });

postResults(`${targetD.name} is helped by ${player.name}, gaining advantage on next ability check within 1 turn.`);
return;


/*************************************************************************
 *         END OF MAIN MACRO BODY
 *                                        END OF MAIN MACRO BODY
 ************************************************************************/


/************************************************************************
 * Post the results to chart card
 *************************************************************************/
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

/************************************************************************
 * Check to see if target has named effect. Return boolean result
*************************************************************************/
function hasEffect(target, effect) {
    if (target.actor.effects.find(ef => ef.data.label === effect)) {
        let message = `${target.name} already has ${effect} effect, end ${macroName}`;
        // ui.notifications.info(message);
        if (debug) console.log(message);
        return(true);
    } else {
        if (debug) console.log(` ${target.name} needs ${effect} effect added`);
        return(false)
    }
}

/************************************************************************
 * Check to see if two entities are in range with 2.5 foot added
 * to allow for diagonal measurement to "corner" adjacancies
*************************************************************************/
function inRange(firstEntity, secondEntity, maxRange) {
    let distance = canvas.grid.measureDistance(firstEntity, secondEntity);
    distance = distance.toFixed(1);             // Chop the extra decimals, if any
    if (debug) console.log(` Considering ${secondEntity.name} at ${distance} distance`);
    if (distance > (maxRange + 2.5)) {
        let message = ` ${secondEntity.name} is not in range (${distance}) of ${firstEntity.name}, end ${macroName}`;
        // ui.notifications.warn(message);
        if (debug) console.log(message);
        return(false);
    } 
    return(true);
}

/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        let message = `Targeted nothing, must target single token to be acted upon`;
        // ui.notifications.warn(message);
        if (debug) console.log(message);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        let message = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        // ui.notifications.warn(message);
        if (debug) console.log(message);
        return (false);
    }
    if (debug) console.log(` targeting one target`);
    return (true);
}

/************************************************************************
 * Return true if token is friendly
*************************************************************************/
function isFriendly(token, actor) {
    const FREINDLY = 1, NEUTRAL = 0, HOSTILE = -1;  // Token dispostions, strings as shown in UI  
    if (debug) console.log(`checking attitude of ${token.name}, ${token.data.disposition}`)
    if (token.data.disposition === FREINDLY) return (true);
    return (false);
}