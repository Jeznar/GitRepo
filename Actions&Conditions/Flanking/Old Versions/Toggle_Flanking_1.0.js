//#############################################################
// READ THIS -  Requires Midi-QoL on use -or- Hotbar usage
/**************************************************************
* Macro to toggle Flanking condition. Based on Crymic's Great 
* Weapon Master with the intent of making it a one round -or- 
* togglable effect (still expires after one round).
*
* This macro is intended to be used as an ItemMacro -or- from
* the hotbar.  If used on hotbar, multi-select is supported.
*
* 11/05/21 0.1 JGB Creation
* 11/05/21 0.2 JGB Rewritten to last only a round & dialog
* 11/05/21 0.3 JGB Convert main operation into a function
* 11/05/21 0.4 JGB Modify to allow use as ItemMacro or Hotbar
* 11/05/21 1.0 JGB Seemingly the macro now works as intended
*************************************************************/
const macroName = "Toggle_Flanking_1.0"
const debug = true;
const effect = "Flanking";
const gameRound = game.combat ? game.combat.round : 0;
const iconImage = "Icons_JGB/Conditions/flanking.png"
let target = "";


if (args[0]) {  // If ItemMacro, run just once on using token
    target = canvas.tokens.get(args[0].tokenId).actor;
    if (debug) console.log(` ItemMacro - token: ${target.name}`);
    processTarget(target, false);
    return;
} else {        // If hotbar, run against all selected tokens
    for (target of canvas.tokens.controlled) {
        if (debug) console.log(` HotBar - token: ${target.name}`);
        processTarget(target.actor, true);
    }
}

/*************************************************************** 
* Process passed the passed target to toggle Flanking Condition
***************************************************************/
async function processTarget(target,parm) {

    let quiet = parm ? parm : false;    // quiet defaults to false

    if (quiet) {
        if (debug>1) console.log(`Quietly Processing ${target.name}`, target);
    } else {
        if (debug>1) console.log(`Processing ${target.name} with dialog`, target);
    }

    let chatMessage = "";
    let the_message = "";
    if (target.effects.find(ef => ef.data.label === effect)) {
        if (debug) console.log(` Flanking turning off for ${target.data.token.name}`);
        let existingEffect = await target.effects.find(ef => ef.data.label === effect);
        await existingEffect.delete();
        if (!quiet) {
            the_message = `<em>${target.data.token.name} is <strong>no longer flanking!</strong>.</em>`;
            chatMessage = game.messages.get(args[0].itemCardId);
        }
    } else {
        if (debug) console.log(` Flanking turning on for ${target.data.token.name}`);
        let effectData = [{
            label: effect,
            icon: iconImage,
            duration: { rounds: 1, startRound: gameRound, startTime: game.time.worldTime },
            /*origin: args[0].uuid,*/
            changes: [{
                "key": "data.bonuses.mwak.attack",
                "mode": 2,
                "value": 2,
                "priority": 20
            }, {
                "key": "data.bonuses.msak.attack",
                "mode": 2,
                "value": 2,
                "priority": 20
            }]
        }];
        await target.createEmbeddedDocuments("ActiveEffect", effectData);
        if (!quiet) {
            the_message = `<em>${target.data.token.name} is <strong>now flanking!</strong></em>`;
            chatMessage = game.messages.get(args[0].itemCardId);
        }
    }
    if (!quiet) {
        let content = await duplicate(chatMessage.data.content);
        let searchString = /<div class="midi-qol-saves-display">[\s\S]*<div class="end-midi-qol-saves-display">/g;
        let replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display">${the_message}`;
        content = content.replace(searchString, replaceString);
        await chatMessage.update({ content: content });
        await ui.chat.scrollBottom();
    }
    return;
}
