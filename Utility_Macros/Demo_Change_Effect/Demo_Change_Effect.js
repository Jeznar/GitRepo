let MACRONAME = "Demo_Change_Effect.js"
/*****************************************************************************************
 * Demonstrate changing of an existing condition.  
 * 
 * This macro will (hopefully)
 *  1. Spply a simple CUB condition to the caster
 *  2. Find the condition 
 *  3. Change the condition to include an OverTime save and damage element. 
 * 
 * 02/22/22 0.1 Creation of Macro
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
 jez.log(`============== Starting === ${MACRONAME} =================`);
 for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
 const LAST_ARG = args[args.length - 1];
 let aActor;         // Acting actor, creature that invoked the macro
 let aToken;         // Acting token, token for creature that invoked the macro
 if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
 if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
 const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
 
 const CONDITION = "Poisoned"
 const SPELL_DC = aActor.data.data.attributes.spelldc;
 const SAVE_TYPE = "wis"
 const NUM_DICE = 1
//----------------------------------------------------------------------------------
// Appy the "existing" condition (This is what will be changed)
//
await game.cub.addCondition(CONDITION, aToken) // await completion of application
//----------------------------------------------------------------------------------
// Seach the token to find the just added effect
//
let effect = await aToken.actor.effects.find(i => i.data.label === CONDITION);
jez.log("effect", effect)
//----------------------------------------------------------------------------------
// Notice the existing effects are effect.data.changes, they need to be kept.
// 
jez.log(`effect.data.changes 1`,effect.data.changes)
//----------------------------------------------------------------------------------
// Define the desired modification to existing effect.
//
//    https://gitlab.com/tposney/midi-qol#flagsmidi-qolovertime-overtime-effects
//
let overTimeVal = `turn=end, label=${CONDITION},
  saveDC=${SPELL_DC}, saveAbility=${SAVE_TYPE}, saveRemove=true, saveMagic=true, rollType=save,
  damageRoll=${NUM_DICE}d10, damageType=psychic`
//const newData = { key: `flags.midi-qol.OverTime`, mode: OVERRIDE, value: overTimeVal, priority: 20 }
effect.data.changes.push({ key: `flags.midi-qol.OverTime`, mode: OVERRIDE, value: overTimeVal, priority: 20 })
jez.log(`effect.data.changes 2`,effect.data.changes)
//----------------------------------------------------------------------------------
// Apply the modification to existing effect
//
const result = await effect.update({'changes': effect.data.changes});
if (result) jez.log(`Active Effect ${CONDITION} updated!`, result);