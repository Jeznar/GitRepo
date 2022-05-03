/************************************************************
 * Macro to inflict damage and return a portion of it to the
 * user as healing. Also applie a DAE to drain the target of
 * the amount of nerotic damage from max health. Redone 
 * based on Crymic's macro.
 * 
 * Damage amount is set in attack details on main card. 
 * Fraction returned can be set as "fracRec"
 * 
 * 10/29/21 1.0 JGB Rebuilt starting from Cyrmic's code
 ***********************************************************/
const fracRec = 1.0; // Fraction of necrotic damage healed
/***********************************************************/
const macroName = "Vampire_Bite_1.0"
const debug = true; 
if (debug) console.log("Starting: " + macroName); 

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
if(lastArg.hitTargets.length === 0) return {};
let tokenD = canvas.tokens.get(lastArg.tokenId);
let target = canvas.tokens.get(lastArg.hitTargets[0].id);
let itemD = lastArg.item;
let gameRound = game.combat ? game.combat.round : 0;
let healType = "healing";
let damageType = "necrotic";
let damageDetail = await lastArg.damageDetail.find(i=> i.type === damageType);
let damageTotal = (damageDetail.damage-damageDetail.DR)*damageDetail.damageMultiplier;
MidiQOL.applyTokenDamage([{damage: damageTotal, type: healType}], damageTotal*fracRec, new Set([tokenD]), itemD.name, new Set());
let effectData = {
    label: itemD.name,
    icon: itemD.img,
    flags: { dae: { itemData: itemD, stackable: true, macroRepeat: "none", specialDuration: ["longRest"] } },
    origin: lastArg.uuid,
    disabled: false,
    duration: {seconds: 86400, hours: 24, startRound: gameRound, startTime: game.time.worldTime },
    changes: [{ key: "data.attributes.hp.max", mode: 2, value: -damageTotal, priority: 20 }]
};
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });
let healMessage = `<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">hits ${target.name} <span style="color:red">max hp -${damageTotal}</span></div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div><div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${tokenD.id}">heals ${tokenD.name} <span style="color:green">${damageTotal*fracRec}</span></div><img src="${tokenD.data.img}" width="30" height="30" style="border:0px"></div>`;
await wait(400);
let chatMessage = await game.messages.get(args[0].itemCardId);
let content = await duplicate(chatMessage.data.content);
let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${healMessage}`;
content = await content.replace(searchString, replaceString);
await chatMessage.update({ content: content });