const MACRONAME = "Vampire_Bite.1.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Macro to inflict damage and return a portion of it to the
 * user as healing. Also applie a DAE to drain the target of
 * the amount of nerotic damage from max health. Redone 
 * based on Crymic's macro.
 * 
 * Damage amount is set in attack details on main card. 
 * Fraction returned can be set as "RECOVERY_FRACTION"
 * 
 * 10/29/21 1.0 JGB Rebuilt starting from Cyrmic's code
 * 08/02/22 1.1 JGB convenientDescription and Table of things to say when frightened
 * 10/05/22 1.2 JGB Looking for Bug that causes healing effect to be: "max hp - [object Object]"
 *                  Damage done was reported as damageTotal, is now damageTotal.damage
 *                  Healing done is now healAmount, was some wacky calculation. 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 4;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
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
const RECOVERY_FRACTION = 1.0; // Fraction of necrotic damage healed
// let gameRound = game.combat ? game.combat.round : 0;
const HEAL_TYPE = "healing";
const DAMAGE_TYPE = "necrotic";
//---------------------------------------------------------------------------------------------------
// If we didn't hit anything, just terminate this macro
//
if (LAST_ARG.hitTargets.length === 0) return {};
let tToken = canvas.tokens.get(LAST_ARG.hitTargets[0].id);
//---------------------------------------------------------------------------------------------------
// Dig out how much damage the calling attack inflicted
//
// let damageDetail = await LAST_ARG.damageDetail.find(i=> i.type === DAMAGE_TYPE);         // Old Line
let damageTotal = LAST_ARG.damageDetail.find(i=> i.type === DAMAGE_TYPE);                   // Changed for Midi update    
if(!damageTotal) return jez.badNews("Deal damage first","w");                               // 21.12.12 Addition
// let damageTotal = (damageDetail.damage-damageDetail.DR)*damageDetail.damageMultiplier;   // Old Line
if (TL > 2) jez.trace(`${TAG} Damage Total`, damageTotal);
//---------------------------------------------------------------------------------------------------
// Figure out how much healing can be done, and apply it to the aActor
//
let healAmount = Math.clamped(damageTotal.damage, 0, aToken.actor.data.data.attributes.hp.max - aToken.actor.data.data.attributes.hp.value);    // 21.12.12 Addition
if (TL > 2) jez.trace(`${TAG} Healing Amount`, healAmount);
// MidiQOL.applyTokenDamage([{damage: damageTotal, type: HEAL_TYPE}], damageTotal*RECOVERY_FRACTION, new Set([aToken]), aItem.name, new Set());            // Old Line   
await MidiQOL.applyTokenDamage([{damage: healAmount, type: HEAL_TYPE}], healAmount, new Set([aToken]), aItem, new Set());                        // 21.12.12 Addition
//---------------------------------------------------------------------------------------------------
// Cook up a custom debuff effect and apply it to the target
//
const CE_DESC = `Hit point maximum reduced by ${damageTotal.damage}` // 1.1 Addition
let effectData = {
    label: aItem.name,
    icon: aItem.img,
    flags: { 
        dae: { itemData: aItem, stackable: true, macroRepeat: "none", specialDuration: ["longRest"] },
        convenientDescription: CE_DESC,                                                     // 1.1 Addition
    },
    origin: LAST_ARG.uuid,
    disabled: false,
    // duration: {seconds: 86400, hours: 24, startRound: gameRound, startTime: game.time.worldTime },
    // changes: [{ key: "data.attributes.hp.max", mode: 2, value: -damageTotal, priority: 20 }]     // Old Line
    changes: [{ key: "data.attributes.hp.max", mode: 2, value: -damageTotal.damage, priority: 20 }] // 21.12.12 Replacement
};
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
//---------------------------------------------------------------------------------------------------
// Build a nice custom message describing the result of the action
//
let healMessage = `<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" 
id="${tToken.id}">hits ${tToken.name} 
<span style="color:red">Max HP reduced by ${damageTotal.damage}</span></div>
<img src="${tToken.data.img}" width="30" height="30" style="border:0px"></div><div class="midi-qol-flex-container">
<div class="midi-qol-target-npc midi-qol-target-name" id="${aToken.id}">heals ${aToken.name} for
<span style="color:green">${healAmount}</span></div>
<img src="${aToken.data.img}" width="30" height="30" style="border:0px"></div>`;
if (TL > 2) jez.trace(`${TAG} Heal Message`, healMessage);

await jez.wait(400);
let chatMessage = await game.messages.get(args[0].itemCardId);
let content = await duplicate(chatMessage.data.content);
let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${healMessage}`;
content = await content.replace(searchString, replaceString);
await chatMessage.update({ content: content });