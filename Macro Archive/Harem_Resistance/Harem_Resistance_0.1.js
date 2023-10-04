const macroName = "Harem_Resistant_0.1"
/**************************************************************
* Macro to toggle resistance. 
* 
* It toggles a buff to implement: 
* Grants resistance to magic from Strahd’s consorts 
* (other than Milla), 
*
* It does require the player to actively toggle it/on off as 
* appropriate.
*
* 11/24/21 0.1 JGB Creation
*************************************************************/
const debug = true;
const effect = "Consort Resistance";
const gameRound = game.combat ? game.combat.round : 0;
const itemD = args[0].item;
const iconImage = itemD.img;
const CUSTOM=0, MULTIPLY=1, ADD=2, DOWNGRADE=3, UPGRADE=4, OVERRIDE=5; 
let target = "";

target = canvas.tokens.get(args[0].tokenId).actor;
if (debug) console.log(` ItemMacro - token: ${target.name}`);
processTarget(target, false);
return;

/*************************************************************** 
* Process passed the passed target to toggle Flanking Condition
***************************************************************/
async function processTarget(target, parm) {

    let quiet = parm ? parm : false;    // quiet defaults to false

    if (quiet) {
        if (debug>1) console.log(`Quietly Processing ${target.name}`, target);
    } else {
        if (debug>1) console.log(`Processing ${target.name} with dialog`, target);
    }

    let chatMessage = "";
    let the_message = "";
    if (target.effects.find(ef => ef.data.label === effect)) {
        if (debug) console.log(` Resistance turning off for ${target.data.token.name}`);
        let existingEffect = await target.effects.find(ef => ef.data.label === effect);
        await existingEffect.delete();
        if (!quiet) {
            the_message = `<em>${target.data.token.name} is <strong>no longer affected by Resistance to spells!</strong>.</em>`;
            chatMessage = game.messages.get(args[0].itemCardId);
        }
    } else {
        if (debug) console.log(` Resistance turning on for ${target.data.token.name}`);
        let effectData = [{
            label: effect,
            icon: iconImage,
            duration: { rounds: 1, startRound: gameRound, startTime: game.time.worldTime },
            origin: args[0].uuid,
            disabled: false,
            changes: [
                { key: "data.traits.dr.all", mode: CUSTOM, value: "Spell Damage", priority: 20 },
                { key: "flags.midi-qol.advantage.ability.save.all",mode: OVERRIDE, value: 1, priority: 20 }
            ]
        }]

        await target.createEmbeddedDocuments("ActiveEffect", effectData);
        if (!quiet) {
            the_message = `<em>${target.data.token.name} is <strong>now resistant to magical damage!</strong> Intended only for Consorts other than Ludmilla.</em>`;
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