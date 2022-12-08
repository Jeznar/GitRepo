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
//
// Set the value for the Active Actor (aActor)
let aActor;
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else aActor = game.actors.get(LAST_ARG.actorId);
//
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
// const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const GAME_RND = game.combat ? game.combat.round : 0;
const CONDITION1 = "Poisoned"
const CONDITION2 = "Phantasmal Killer"
const SPELL_DC = aActor.data.data.attributes.spelldc;
const SAVE_TYPE = "wis"
const NUM_DICE = 1
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finished === ${MACRONAME} =================`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse() {
  const FUNCNAME = "doOnUse()";

  jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
  let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
  if (!tToken) {
    msg = `Please target at least one token`
    ui.notifications.warn(msg)
    jez.log(msg)
    return(false)
  }
  //----------------------------------------------------------------------------------
  // Appy the "existing" condition (This is what will be changed)
  //
  await game.cub.addCondition(CONDITION1, tToken, {allowDuplicates:true, replaceExisting:false, warn:true})
  //----------------------------------------------------------------------------------
  // Seach the token to find the just added effect
  //
  jez.log(`About to: tToken.actor.effects.find(i => i.data.label === ${CONDITION1})`)
  let effect = await tToken.actor.effects.find(i => i.data.label === CONDITION1);
  jez.log("effect before additions", effect)

  //----------------------------------------------------------------------------------
  // Notice the existing effects are effect.data.changes, they need to be kept.
  // 
  jez.log(`effect.data.changes 1`, effect.data.changes)
  //----------------------------------------------------------------------------------
  // Define the desired modification to existing effect.
  //
  //    https://gitlab.com/tposney/midi-qol#flagsmidi-qolovertime-overtime-effects
  //
  let overTimeVal = `turn=end, label=${CONDITION1},
  saveDC=${SPELL_DC}, saveAbility=${SAVE_TYPE}, saveRemove=true, saveMagic=true, rollType=save,
  damageRoll=${NUM_DICE}d10, damageType=psychic`
  //const newData = { key: `flags.midi-qol.OverTime`, mode: OVERRIDE, value: overTimeVal, priority: 20 }
  effect.data.changes.push({ key: `flags.midi-qol.OverTime`, mode: jez.OVERRIDE, value: overTimeVal, priority: 20 })
  jez.log(`effect.data.changes 2`, effect.data.changes)
  //----------------------------------------------------------------------------------
  // Apply the modification to existing effect
  //
  const result = await effect.update({ 'changes': effect.data.changes });
  if (result) jez.log(`Active Effect ${CONDITION1} updated!`, result);
  //----------------------------------------------------------------------------------
  // Lets add another effect, this time by direct calls
  //
  let overTimeVal2 = `turn=end, label=${CONDITION2}, saveDC=${SPELL_DC}, saveAbility=${SAVE_TYPE},
saveRemove=true, damageRoll=${NUM_DICE}d10, saveMagic=true, damageType=psychic`
  let effectData = [{
    label: CONDITION2,
    icon: aItem.img,
    origin: aToken.document.uuid,
    disabled: false,
    // flags: { dae: { stackable: false, macroRepeat: "none" } },
    // flags: { dae: { itemData: aItem.data, macroRepeat: "startEveryTurn", token: aToken.uuid } },
    flags: { dae: { itemData: aItem, macroRepeat: "startEveryTurn", token: aToken.document.uuid, stackable: false } },
    duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
    changes: [
      // COOL-THING: Midi-QoL OverTime dot & save effect
      { key: `flags.midi-qol.OverTime`, mode: jez.OVERRIDE, value: overTimeVal2, priority: 20 },
      { key: `flags.midi-qol.disadvantage.ability.check.all`, mode: jez.ADD, value: 1, priority: 20 },
      { key: `flags.midi-qol.disadvantage.skill.all`, mode: jez.ADD, value: 1, priority: 20 },
      { key: `flags.midi-qol.disadvantage.attack.all`, mode: jez.ADD, value: 1, priority: 20 },
      { key: `macro.itemMacro`, mode: jez.CUSTOM, value: aToken.name, priority: 20 },
      //{ key: `macro.execute`, mode: jez.CUSTOM, value: executeValue, priority: 20}
    ]
  }];
  await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: effectData });
  //-------------------------------------------------------------------------------------------------------------
  // Grab the data for the two effects to be paired
  //
  await jez.wait(100)
  jez.pairEffects(tToken.actor, CONDITION1, aActor, CONDITION2)
  jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
  return (true);
}