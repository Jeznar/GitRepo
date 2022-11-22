const MACRONAME = "Produce_Flame.0.4.js"
/*****************************************************************************************
 * Produce Flame!
 * 
 * Originally from Crymic's macro that was themed after Kandashi's create item macro.  It 
 * now uses a helper macro from the Items directory that is copied to the actor.
 * 
 * 06/06/22 0.2 Conversion of Crymic code to my style (sort of) and FoundryVTT 9.x 
 * 11/21/22 0.4 Attach flame animation with .attachTo(target) not .atLocation(target) &
 *              Update the associated DAE effect to handle lighting
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 3;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
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
const TEMPLATE_NAME = "%%Flame%%"
const TEMP_SPELL_NAME = `${aToken.name}'s Flame`
const VFX_NAME = `${aToken.name} Flame`
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff({ traceLvl: TL });            // DAE removal
if (args[0] === "on") await doOn({ traceLvl: TL });              // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });   // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
function postResults(msg) {
  const FUNCNAME = "postResults(msg)";
  const FNAME = FUNCNAME.split("(")[0]
  const TAG = `${MACRO} ${FNAME} |`
  if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
  if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
  //-----------------------------------------------------------------------------------------------
  let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
  jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
  if (TL > 1) jez.trace(`${TAG}--- Finished ---`);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse(options = {}) {
  const FUNCNAME = "doOnUse(options={})";
  const FNAME = FUNCNAME.split("(")[0]
  const TAG = `${MACRO} ${FNAME} |`
  const TL = options.traceLvl ?? 0
  if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
  if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
  await jez.wait(100)
  //----------------------------------------------------------------------------------
  msg = `<b>${aToken.name}</b> has produced a flame that emits light until thrown at a target, by 
  using temporary innate spell, "<b>${TEMP_SPELL_NAME}</b>," which can be found in his/her spell book.`
  postResults(msg)
  if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
  return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn(options = {}) {
  const FUNCNAME = "doOn(options={})";
  const FNAME = FUNCNAME.split("(")[0]
  const TAG = `${MACRO} ${FNAME} |`
  const TL = options.traceLvl ?? 0
  if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
  //-----------------------------------------------------------------------------------------------
  // Delete all temp flame spells
  //
  await jez.deleteItems(TEMP_SPELL_NAME, "spell", aToken);
  //-----------------------------------------------------------------------------------------------
  // Start the VFX on the caster
  //
  runVFX(aToken)
  //-----------------------------------------------------------------------------------------------
  // Apply lighting update to the caster -- This seems to have stopped working at FoundryVTT 9.x
  //
  // if (TL > 2) jez.trace(`${TAG} Launching update of ${aToken.name} lighting`);
  // let rc = await aToken.document.update({
  //   light: {
  //     "dimLight": 20,
  //     "brightLight": 10,
  //     "lightAlpha": 0.25,
  //     "lightColor": "#f7c597",
  //     lightAnimation: {
  //       intensity: 4,
  //       speed: 5,
  //       type: "torch"
  //     }
  //   }
  // });
  // if (TL > 2) jez.trace(`${TAG} Update returned`, rc);
  //-----------------------------------------------------------------------------------------------
  // Add new temp spell item
  //
  if (TL > 2) jez.trace(`${TAG} Adding ${TEMPLATE_NAME} to ${aToken.name}`);
  await jez.itemAddToActor(aToken, TEMPLATE_NAME)
  let itemUpdate = {
    name: TEMP_SPELL_NAME,
  }
  await jez.itemUpdateOnActor(aToken, TEMPLATE_NAME, itemUpdate, "spell")
  //-----------------------------------------------------------------------------------------------
  // Post completion message
  //
  msg = `Added One Time Use Spell: "${TEMP_SPELL_NAME}"`      // Set notification message
  ui.notifications.info(msg);
  if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
  return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
async function doOff(options = {}) {
  const FUNCNAME = "doOff(options={})";
  const FNAME = FUNCNAME.split("(")[0]
  const TAG = `${MACRO} ${FNAME} |`
  const TL = options.traceLvl ?? 0
  if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
  if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
  //-----------------------------------------------------------------------------------------------
  // Remove alterations to token -- This seems to have stopped working at FoundryVTT 9.x
  //   await aToken.document.update({
  //     "dimLight": 0,
  //     "brightLight": 0,
  //     "lightColor": ""
  //   });
  await jez.deleteItems(TEMP_SPELL_NAME, "spell", aToken);
  if (TL > 1) jez.trace(`${TAG} end VFX_NAME`, VFX_NAME)
  Sequencer.EffectManager.endEffects({ name: VFX_NAME });
  if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
  return;
}
  /***************************************************************************************************
   * Run VFX
   ***************************************************************************************************/
  function runVFX(target) {
    let color = ""
    const IMAGE = aItem.img.toLowerCase()
    if (IMAGE.includes("blue")) color = "blue"
    else if (IMAGE.includes("green")) color = "green"
    else if (IMAGE.includes("orange")) color = "orange"
    else if (IMAGE.includes("purple")) color = "purple"
    else if (IMAGE.includes("magenta")) color = "purple"
    else if (IMAGE.includes("sky")) color = "blue"
    else if (IMAGE.includes("royal")) color = "green"
    if (!color) color = "orange"

    new Sequence()
      .effect()
      //.file("jb2a.fire_bolt.orange")
      .file(`jb2a.flames.01.${color}`)
      //.duration(10000)
      .persist()
      .opacity(0.60)
      .name(VFX_NAME)
      // .atLocation(target)
      .attachTo(target)
      .play()
  }