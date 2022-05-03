const macroName = "Knock_Down_0.5.js"
/************************************************************
 * Apply the "Prone" condition if target fails save.  This is
 * intended to be used to automate "Chomp" for Galahad 
 * 
 * Save DC = 10 
 * 
 *  - Set needed variables
 *  - End if target is already prone
 *  - Determine DC of save
 *  - Determine success/failure
 *  - Apply results
 * 
 * It would be nice for the macro to post results in addition.
 * 
 * 11/14/21 0.1 JGB created from Grapple_Initiate_0.8
 * 11/15/21 0.2 JGB Add logic to abourt macro if no hit and
 *                  eliminate uneeded hotbar protection
 * 11/15/21 0.3 JGB add limitation that target must be no more 
 *                  one size larger than player
 * 11/20/21 0.4 JGB Add card updates for errors
 * 05/04/22 0.5 JGB Update for Foundry 9.x
 ***********************************************************/
const debug = 1;
if (debug) console.log(`Starting: ${macroName} arguments passed: ${args.length}`);
if (debug > 2) { let i = 0; for (let arg in args) { console.log(` ${i++}: ${arg}`) }; }

let gameRound = game.combat ? game.combat.round : 0;
let player = null;
let target = null;
const CONDITION = "Prone";

/************************************************************************
 * Create object to convert size string to values
 ***********************************************************************/
 class CreatureSizes {
    //let CreatureSizeString = "";
    //let CreatureSizeInt = 99;
    
   constructor(size) {
   this.SizeString = size;
   
   switch(size) {
        case "tiny": this.SizeInt = 1; break;
        case "sm":   this.SizeInt = 2; break;
        case "med":  this.SizeInt = 3; break;
        case "lg":   this.SizeInt = 4; break;
        case "huge": this.SizeInt = 5; break;
        case "grg":  this.SizeInt = 6; break;
        default:     this.SizeInt = 0;  // Error Condition
        }
    }
}

/************************************************************************
* Set Variables for player and target
*************************************************************************/
player = canvas.tokens.get(args[0].tokenId);
if (debug > 1) console.log(` Player: `, player);

if (game.user.targets.ids.length != 1) {
    let message = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
    ui.notifications.warn(message);
    if (debug) console.log(message);
    return // Abort execution if a single token wasn't targeted
}

target = canvas.tokens.get(args[0].targets[0].id);
if (debug) console.log(` Player: ${player.name}, Target: ${target.name}`);

/************************************************************************
* End if target was missed in calling action.
*************************************************************************/
if (args[0].hitTargets.length === 0) {
    let message = ` Missed ${target.name}, end ${macroName}`;
    if (debug) console.log(message);
    return;
}

/************************************************************************
* End if target is more than one size category larger than player
*************************************************************************/
if (debug > 1) {
    dotWalkString("player.document._actor.data.data.traits.size");
    dotWalkString("target.document._actor.data.data.traits.size");
}

let playerSizeString = player.document._actor.data.data.traits.size;
let targetSizeString = target.document._actor.data.data.traits.size;

let targetSizeObject = new CreatureSizes(targetSizeString);
let targetSize = targetSizeObject.SizeInt;  // Returns 0 on failure to match size string
if (!targetSize) {
    let message = `Size of ${player.name}, ${playerSizeString} failed to parse. End ${macroName}`;
    if (debug) console.log(message);
    ui.notifications.error(message);
    return;
}

let playerSizeObject = new CreatureSizes(playerSizeString);
let playerSize = playerSizeObject.SizeInt;  // Returns 0 on failure to match size string

if (!playerSize) {
    let message = `Size of ${player.name}, ${playerSizeString} failed to parse. End ${macroName}`;
    if (debug) console.log(message);
    ui.notifications.error(message);
    return;
}
if (debug) console.log(` ${player.name} ${playerSizeString} ${playerSize} - ${target.name} ${targetSizeString} ${targetSize}`);

if (playerSize < (targetSize-1)) {
    let message = ` ${target.name} is too large for ${player.name} to knock down, end ${macroName}`;
    if (debug) console.log(message);
    postResults(`${target.name} is too large for ${player.name} to knock down.`);
    return;
}

/************************************************************************
* End if target is already affected by CONDITION
*************************************************************************/
if (target.actor.effects.find(ef => ef.data.label === CONDITION)) {
    let message = ` ${target.name} already prone, end ${macroName}`;
    if (debug) console.log(message);
    postResults(`${target.name} is already ${CONDITION}.`);
    return;
}

/************************************************************************
* Determine DC of save (10 + Athletics total bonus)
*************************************************************************/
// let saveDC = player.actor.data.data.attributes.spelldc;
let saveDC = 10 + player.actor.data.data.skills.ath.total;
if (debug) console.log(` DC = ${saveDC}`);

/**************************************************************************
 * Determine success/failure
 *************************************************************************/
let saveType = "str";
let saveObject = await MidiQOL.socket().executeAsGM("rollAbility", {
    request: "save",
    targetUuid: target.actor.uuid,
    ability: saveType,
    options: { chatMessage: true, fastForward: true }
});

let saved = true;
if (saveObject.total < saveDC) {
    if (debug) console.log(`Target Failed! ${saveObject.total} vs ${saveDC}`);
    saved = false;
} 
if (debug && saved) console.log(`${target.name} Saved!`); 
else console.log(`${target.name} Failed!`);

/**************************************************************************
 *  Apply Prone Condition, if target did not win (save)
 *************************************************************************/
 // Constants to be used as mode values for midi-qol
 const CUSTOM=0, MULTIPLY=1, ADD=2, DOWNGRADE=3, UPGRADE=4, OVERRIDE=5;
 // midi-qol, higher priority values are added later than lower values
 
if (!saved) { 
    if (debug) console.log(`Player Wins - Apply ${CONDITION}`);

    let effectData = {
        label: CONDITION,
        icon: "modules/combat-utility-belt/icons/prone.svg",
        origin: player.uuid,
        disabled: false,
        duration: { rounds: 99, startRound: gameRound },
        changes: [
            { key: `flags.midi-qol.disadvantage.attack.all`, mode: ADD, value: 1, priority: 20 },
            { key: `flags.midi-qol.grants.advantage.attack.mwak`, mode: ADD, value: 1, priority: 20 },
            { key: `flags.midi-qol.grants.advantage.attack.msak`, mode: ADD, value: 1, priority: 20 },
            { key: `flags.midi-qol.grants.disadvantage.attack.rwak`, mode: ADD, value: 1, priority: 20 },
            { key: `flags.midi-qol.grants.disadvantage.attack.rsak`, mode: ADD, value: 1, priority: 20 }
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:target.actor.uuid, effects: [effectData] });
    let message = `${target.name} is knocked prone.`;
    ui.notifications.info(message);
    postResults(`${target.name} is knocked down.`);
} else {
    if (debug) console.log("Target Wins");
    postResults(`${target.name} avoids a knock down.`);
    
}
return;

/*************************************************************************
 *         END OF MAIN MACRO BODY
 *                                        END OF MAIN MACRO BODY
 ************************************************************************/

/***************************************************
 * Log the components of a dotted entity
 * 
 **************************************************/
function dotWalkString(string) {
    let location, obj;
    const COMPONENTS = string.split(".");
    for (let component of COMPONENTS) {
        if (!location) {
            location = component
            console.log(`${location}: `, eval(location));
        } else {
            location = location + '.' + component;
            console.log(`${location}: `, eval(location));
        }
    }
}

/************************************************************************
 * Post the results to chat card
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