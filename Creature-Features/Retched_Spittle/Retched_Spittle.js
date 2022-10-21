const MACRONAME = "Retched_Spittle.1.3.js"
/*****************************************************************************************
 * Ilyas Retched Spittle per MandyMod
 * 
 * Mandy's Description
 * -------------------
 *  Launch a glob of rancid spittle at a point within 60 feet. Each creature within a 
 *  10-foot radius of that point must succeed on a DC 13 Constitution saving throw or take 
 *  14 (4d6) poison damage and be poisoned for 1 minute.
 * 
 *  On a success, a target takes only half damage and is not poisoned. At the end of each 
 *  of its turns, a target may attempt another saving throw, ending the poisoned condition 
 *  early on a success.
 * 
 * 02/06/22 0.1 Rebuild of Macro to include repeating save and general cleanup
 * 05/02/22 1.1 Update for Foundry 9.x
 * 08/02/22 1.2 Add convenientDescription
 * 10/21/22 1.3 FoundryVTT 9 fix: Swap deleteEmbeddedEntity for deleteEmbeddedDocuments
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim off the version number and extension
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
jez.log(`============== Starting === ${MACRONAME} =================`);
const GAME_RND = game.combat ? game.combat.round : 0;
const LAST_ARG = args[args.length - 1];
let msg = ""
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const DEBUFF_NAME = "Poisoned"
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
// if (args[0] === "off") await doOff();                // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					              // DAE reach turn
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
  const FUNCNAME = "doOnUse()";
  jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
  const SAVE_DC = aActor.data.data.attributes.spelldc;
  const SAVE_TYPE = "con"

  if (LAST_ARG.hitTargets.length === 0) return {};
  let numFailed = args[0].failedSaves.length;
  jez.log(` Qty failed: ${numFailed}`);

  for (let i = 0; i < numFailed; i++) {
    const target = args[0].failedSaves[i];
    // target is an actor, not a token
    jez.log(`  Apply Poisoned: ${target.data.name}`);
    jez.log(i, target);
    const CE_DESC = `Poisoned, may attempt DC${SAVE_DC} CON Save end of each turn`
    let effectData = {
      label: DEBUFF_NAME,
      icon: "modules/combat-utility-belt/icons/poisoned.svg",
      origin: LAST_ARG.uuid,
      disabled: false,
      duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
      // turnEndSource causes them all to save on each targets turn.  Try turnEnd instead   ""
      flags: {
        dae: {
          itemData: aItem,
          macroRepeat: "endEveryTurn",
          stackable: false,
          specialDuration: ['isSaveSuccess.con']
        },
        convenientDescription: CE_DESC
      },
      changes: [
        { key: `macro.itemMacro`, mode: CUSTOM, value: `Save_DC ${SAVE_DC} ${SAVE_TYPE}`, priority: 20 },
        { key: `flags.midi-qol.disadvantage.attack.all`, mode: ADD, value: 1, priority: 20 },
        { key: `flags.midi-qol.disadvantage.skill.check.all`, mode: ADD, value: 1, priority: 20 },
        { key: `flags.midi-qol.disadvantage.ability.check.all`, mode: ADD, value: 1, priority: 20 }]
    };
    let effect = target.actor.effects.find(ef => ef.data.label === game.i18n.localize("Poisoned"));
    if (!effect) await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:target.uuid, effects: [effectData] });
  }
  jez.log(`Ending: ${MACRONAME}`);
  return;
}
/****************************************************************************************
 * Each turn Execution - Each time on the target's turn per DAE setting
 ***************************************************************************************/
async function doEach() {
  const FUNCNAME = "doEach()";
  jez.log(`-------------Starting-${MACRONAME}-${FUNCNAME}--------------------`);
  for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
  //---------------------------------------------------------------------------------------
  // Obtain Save Info - Expecting arguments of this form: Save_DC ${saveDC} ${saveType}
  //
  const SAVE_DC = args[args.length - 3]
  const SAVE_TYPE = args[args.length - 2]
  //---------------------------------------------------------------------------------------
  // Perform Save
  //
  const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to remove <b>${DEBUFF_NAME}</b> effect`;
  jez.log("---- Save Information ---", "saveType", SAVE_TYPE, "saveDC", SAVE_DC, "flavor", FLAVOR);
  let save = (await aActor.rollAbilitySave(SAVE_TYPE, { flavor: FLAVOR, chatMessage: true, fastforward: true })).total;
  jez.log("save", save);
  if (save > SAVE_DC) {
    jez.log(`save was made with a ${save}`);
    // jez.log(aActor.deleteEmbeddedEntity("ActiveEffect", LAST_ARG.effectId)) // Obsolete at FVTT 9.x
    if (aActor) aActor.deleteEmbeddedDocuments("ActiveEffect", [LAST_ARG.effectId]);
  } else jez.log(`save failed with a ${save}`);
  jez.log(`-------------Finished-${MACRONAME}-${FUNCNAME}--------------------`);
  return;
}

