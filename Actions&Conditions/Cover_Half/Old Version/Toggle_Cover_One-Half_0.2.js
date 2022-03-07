const macroName = "Toggle_Half_Cover_0.2"
//###############################################################################
// READ THIS -  Requires Midi-QoL on use -or- Hotbar usage
/********************************************************************************
* Macro to toggle 1/2 Cover condition. 
* This macro is intended to be used as an ItemMacro -or- from
* the hotbar.  If used on hotbar, multi-select is supported.
*
* 12/09/21 0.1 JGB Creation from Toggle_Flanking_1.0
* 12/09/21 0.2 JGB Add Code to remove 3/4 cover, if present
********************************************************************************/
const debug = true;
const effect = "Half cover";
const otherEffect = "Three-Quarters cover";
const gameRound = game.combat ? game.combat.round : 0;
const iconImage = args[0]?.item.img  || "icons/svg/barrel.svg" // or icons/svg/target.svg

let target = "";

 // Constants to be used as mode values for midi-qol
 const CUSTOM=0, MULTIPLY=1, ADD=2, DOWNGRADE=3, UPGRADE=4, OVERRIDE=5;

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

/**************************************************************************** 
* Process passed the passed target to toggle Half_Cover Condition and 
* remove 3/4 cover, if present
****************************************************************************/
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
        if (debug) console.log(` Half_Cover turning off for ${target.data.token.name}`);
        /* game.cub.removeConditions(effect,target.data.token.name,{warn:true}); */
        let existingEffect = await target.effects.find(ef => ef.data.label === effect);
        await existingEffect.delete();
        if (!quiet) {
            the_message = `<em>${target.data.token.name} is <strong>no longer</strong> benefiting from Half Cover!.</em>`;
            chatMessage = game.messages.get(args[0].itemCardId);
        }
    } else {
        if (debug) console.log(` Half_Cover turning on for ${target.data.token.name}`);
        let effectData = [{
            label: effect,
            icon: iconImage,
            duration: { rounds: 1, startRound: gameRound, startTime: game.time.worldTime },
            /*origin: args[0].uuid,*/
            changes: [{
                "key": "data.attributes.ac.value",
                "mode": ADD,
                "value": 2,
                "priority": 20
            }, {
                "key": "data.abilities.dex.bonuses.save",
                "mode": ADD,
                "value": 2,
                "priority": 20
            }]
        }];
        await target.createEmbeddedDocuments("ActiveEffect", effectData);
        if (!quiet) {
            the_message = `<em>${target.data.token.name} is <strong>now benefiting</strong> from Half Cover!</em>`;
            chatMessage = game.messages.get(args[0].itemCardId);
        }
    }

    if (target.effects.find(ef => ef.data.label === otherEffect)) {
        // if (debug) console.log(` Half_Cover turning off for ${target.data.token.name}`);
        /* game.cub.removeConditions(effect,target.data.token.name,{warn:true}); */
        the_message += `<br><em>${target.data.token.name} is <strong>no longer benefiting</strong> from Three-Quarters Cover!</em>`;
        let existingEffect = await target.effects.find(ef => ef.data.label === otherEffect);
        await existingEffect.delete();
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
