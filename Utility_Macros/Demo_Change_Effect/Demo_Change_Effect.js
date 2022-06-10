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
  // Exercise getActor5eDataObj function (Not directly relevant to this macro)
  //
  /*let x = null
  x = getActor5eDataObj(aToken)
  jez.log(`aToken to ${x.name}`,x)
  x = getActor5eDataObj(aActor)
  jez.log(`aActor to ${x.name}`,x)
  x = getActor5eDataObj(aToken.id)
  jez.log(`aToken.id to ${x.name}`,x)
  x = getActor5eDataObj(aActor.id)
  jez.log(`aActor.id to ${x.name}`,x)*/
  //x = getActor5eDataObj("ABCDEF012345678")
  //jez.log(`garbage input returned`, x)
  //----------------------------------------------------------------------------------
  // Exercise jez.getEffectDataObj function (Not directly relevant to this macro)
  //
  /*x = await jez.getEffectDataObj(CONDITION1, tToken)
  jez.log(`Effect Data Obj for ${CONDITION1} on ${tToken.name}, tToken`,x)
    x = await jez.getEffectDataObj(CONDITION1, aActor)
  jez.log(`Effect Data Obj for ${CONDITION1} on ${tToken.name}, tToken`,x)
  x = await jez.getEffectDataObj(CONDITION1, aToken.id)
  jez.log(`Effect Data Obj for ${CONDITION1} on ${tToken.name}, tToken.id`,x)
  x = await jez.getEffectDataObj(CONDITION1, aActor.id)
  jez.log(`Effect Data Obj for ${CONDITION1} on ${tToken.name}, tToken.id`,x)
  x = await jez.getEffectDataObj(CONDITION2, aToken)
  jez.log(`Effect Data Obj for ${CONDITION2} on ${aToken.name}`,x)
  x = await jez.getEffectDataObj("Actor.i9vqeZXzvIcdZ3BU.ActiveEffect.DmvGS7OsCz3HoggP")
  jez.log(`Effect Data Obj for direct UUID`,x)*/
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
  pairEffects(tToken.actor, CONDITION1, aActor, CONDITION2)
  jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
  return (true);
}
/**************************************************************************************************************
     * Add a macro execute line calling the macro "Remove_Paired_Effect" which must exist in the macro folder to 
     * named effect on the pair of tokens supplied.  
     * 
     * Note: This operates on effect by name which can result in unexpected results if multiple effects on a an
     * actor have the same name.  Not generally an issue, but it might be.
     * 
     * subject1 & subject2 are types supported by getActor5eDataObj (actor5e, token5e, token5e.id, actor5e.id)
     * effectName1 & effectName2 are strings that name effects on their respective token actors.
     **************************************************************************************************************/
 async function pairEffects(subject1, effectName1, subject2, effectName2) {
  //---------------------------------------------------------------------------------------------------------
  // Convert subject1 and subject2 into actor objects, throw an error and return if conversion fails
  //
  jez.log("pairEffects(subject1, effectName1, subject2, effectName2)","subject1",subject1,"effectName1",effectName1, "subject2",subject2,"effectName2",effectName2)
  let actor1 = getActor5eDataObj(subject1)
  if (!actor1) return (ui.notfications.error("First subject not a token, actor, tokenId or actorId"))
  let actor2 = getActor5eDataObj(subject2)
  if (!actor2) return (ui.notfications.error("Second subject not a token, actor, tokenId or actorId"))
  //---------------------------------------------------------------------------------------------------------
  // Make sure the macro that will be called later exists.  Throw an error and return if not
  //
  let pairingMacro = game.macros.find(i => i.name === "Remove_Paired_Effect");
  if (!pairingMacro) return ui.notifications.error("REQUIRED: Remove_Paired_Effect macro is missing.");
  //---------------------------------------------------------------------------------------------------------
  // Grab the effect data from the first token
  //
  let effectData1 = await actor1.effects.find(i => i.data.label === effectName1);
  if (!effectData1) {
      msg = `Sadly "${effectName1}" effect not found on ${actor1.name}.  Effects not paired.`
      jez.log(msg)
      ui.notifications.warn(msg)
      return (false)
  }
  //---------------------------------------------------------------------------------------------------------
  // Grab the effect data from the second token
  //
  let effectData2 = await actor2.effects.find(i => i.data.label === effectName2);
  if (!effectData2) {
      msg = `Sadly "${effectName2}" effect not found on ${actor2.name}.  Effects not paired.`
      jez.log(msg)
      ui.notifications.warn(msg)
      return (false)
  }
  //---------------------------------------------------------------------------------------------------------
  // Add the actual pairings
  //
  await addPairing(effectData2, actor1, effectData1)
  await addPairing(effectData1, actor2, effectData2)
  //---------------------------------------------------------------------------------------------------------
  // Define a function to do the actual pairing
  //
  async function addPairing(effectChanged, tokenPaired, effectPaired) {
      let value = `Remove_Paired_Effect ${tokenPaired.id} ${effectPaired.id}`
      effectChanged.data.changes.push({ key: `macro.execute`, mode: jez.CUSTOM, value: value, priority: 20 })
      return (await effectChanged.update({ changes: effectChanged.data.changes }))
  }
  return (true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Function to return the Actor5e data associated with the passed parameter.
 *
 * Parameters
 *  - subject: actor, token, or token Id to be searched
 *********1*********2*********3*********4*********5*********6*********7*********8*********9**********/
 function getActor5eDataObj(subject) {
  let mes = ""
  let actor5e = null
  const FUNCNAME = "getActor5eDataObj(subject)"
  //(`${FUNCNAME} received`, subject)
  //----------------------------------------------------------------------------------------------
  // Validate the subject parameter, stashing it into "actor5e" variable, returning false is bad
  //
  if (typeof (subject) === "object") {                   // Hopefully we have a Token5e or Actor5e
      if (subject.constructor.name === "Token5e") {
          actor5e = subject.actor
          return (actor5e)
      }
      else {
          if (subject.constructor.name === "Actor5e") {
              actor5e = subject
              return (actor5e)
          }
          else {
              mes = `Object passed to ${FUNCNAME} is type "${typeof (subject)}" must be Token5e or Actor5e`
              ui.notifications.error(mes)
              jez.log(mes)
              return (false)
          }
      }
  }
  else {                  // subject is not an object maybe it is 16 char string? 
      //jez.log("subject is not an object maybe it is 16 char string?", subject)
      if ((typeof (subject) === "string") && (subject.length === 16)) {
          actor5e = jez.getTokenById(subject)?.actor// Maybe string is a token id?
          if (actor5e) return (actor5e)             // Subject is a tokenID 
          actor5e = canvas.tokens.placeables.find(ef => ef.data.actorId === subject).actor
          if (actor5e) return (actor5e)             // Subject is an actorID embedded in a scene token 
          actor5e = game.actors.get(subject)        // Maybe string is an actor id?
          if (actor5e) return (actor5e)             // Subject is an actor ID 
          mes = `Subject parm passed to ${FUNCNAME} looks like an id but does not map to a token or actor: ${subject}`
          ui.notifications.error(mes)
          jez.log(mes)
          return (false)
      }
      else {                                      // Oh fudge, subject is something unrecognized
          mes = `Subject parm passed to ${FUNCNAME} is not a Token5e, Actor5e, Token.id, or Actor.id: ${subject}`
          ui.notifications.error(mes)
          jez.log(mes)
          return (false)
      }
  }
}