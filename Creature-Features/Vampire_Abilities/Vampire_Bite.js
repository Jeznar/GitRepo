const MACRONAME = "Vampire_Bite.1.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Macro to inflict damage and return a portion of it to the
 * user as healing. Also applie a DAE to drain the target of
 * the amount of nerotic damage from max health. Redone 
 * based on Crymic's macro.
 * 
 * Damage amount is set in attack details on main card. 
 * Fraction returned can be set as "fracRec"
 * 
 * 10/29/21 1.0 JGB Rebuilt starting from Cyrmic's code
 * 08/02/22 1.1 JGB convenientDescription and Table of things to say when frightened
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const fracRec = 1.0; // Fraction of necrotic damage healed
const debug = true; 
if (debug) console.log("Starting: " + MACRONAME); 

//async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
if(lastArg.hitTargets.length === 0) return {};
let tokenD = canvas.tokens.get(lastArg.tokenId);
let target = canvas.tokens.get(lastArg.hitTargets[0].id);
let itemD = lastArg.item;
let gameRound = game.combat ? game.combat.round : 0;
let healType = "healing";
let damageType = "necrotic";
// let damageDetail = await lastArg.damageDetail.find(i=> i.type === damageType);           // Old Line
let damageTotal = lastArg.damageDetail.find(i=> i.type === damageType);                     // Changed for Midi update    
if(!damageTotal) return jez.badNews("Deal damage first","w");                               // 21.12.12 Addition
// let damageTotal = (damageDetail.damage-damageDetail.DR)*damageDetail.damageMultiplier;   // Old Line
let healAmount = Math.clamped(damageTotal.damage, 0, tokenD.actor.data.data.attributes.hp.max - tokenD.actor.data.data.attributes.hp.value);    // 21.12.12 Addition
// MidiQOL.applyTokenDamage([{damage: damageTotal, type: healType}], damageTotal*fracRec, new Set([tokenD]), itemD.name, new Set());            // Old Line   
await MidiQOL.applyTokenDamage([{damage: healAmount, type: healType}], healAmount, new Set([tokenD]), itemD, new Set());                        // 21.12.12 Addition
const CE_DESC = `Hit point maximum reduced by ${damageTotal.damage}` // 1.1 Addition
let effectData = {
    label: itemD.name,
    icon: itemD.img,
    flags: { 
        dae: { itemData: itemD, stackable: true, macroRepeat: "none", specialDuration: ["longRest"] },
        convenientDescription: CE_DESC,                                                     // 1.1 Addition
    },
    origin: lastArg.uuid,
    disabled: false,
    // duration: {seconds: 86400, hours: 24, startRound: gameRound, startTime: game.time.worldTime },
    // changes: [{ key: "data.attributes.hp.max", mode: 2, value: -damageTotal, priority: 20 }]     // Old Line
    changes: [{ key: "data.attributes.hp.max", mode: 2, value: -damageTotal.damage, priority: 20 }] // 21.12.12 Replacement
};
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });
let healMessage = `<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">hits ${target.name} <span style="color:red">max hp -${damageTotal}</span></div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div><div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${tokenD.id}">heals ${tokenD.name} <span style="color:green">${damageTotal*fracRec}</span></div><img src="${tokenD.data.img}" width="30" height="30" style="border:0px"></div>`;
await jez.wait(400);
let chatMessage = await game.messages.get(args[0].itemCardId);
let content = await duplicate(chatMessage.data.content);
let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${healMessage}`;
content = await content.replace(searchString, replaceString);
await chatMessage.update({ content: content });