const MACRONAME = "Regeneration_Vampire_Initialize.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Create a hook'ed function that fires when actor with this macro is damaged.
 * The macro looks into damage received and if any of it was of type "radiant" then it applies a
 * No_Regen convient effect to the actor. This macro needs to be run at start of combat for any with 
 * this feature.
 * 
 * 10/06/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
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
const HOOK_NAME = "Regen_Suppression"
const DAM_TYPE = "radiant"
const EFFECT_NAME = "No_Regen"
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "on") await doOn();
if (args[0] === "off") await doOff();                       // DAE removal
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 * This runs on actor that has the affected applied to it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOn() {
   const FUNCNAME = "doOn()";
   const FNAME = FUNCNAME.split("(")[0]
   const TAG = `${MACRO} ${FNAME} |`
   if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
   //-----------------------------------------------------------------------------------------------
   // Check for pre-req modules
   //
   if ((!(game.modules.get("jb2a_patreon")?.active ||
      game.modules.get("JB2A_DnD5e")?.active) && !(game.modules.get("sequencer")?.active)))
      return jez.badnews(`Missing required module(s) for ${MACRO}`)
   //-----------------------------------------------------------------------------------------------
   // Create a hook that will call function: evaluateDamage() based on thatlonelybugbear in discord
   // https://discord.com/channels/170995199584108546/1010273821401555087/1027596831280074783
   //

   let hookId = Hooks.on("midi-qol.DamageRollComplete", (workflow) => {
      // workflow.targets.first() will be first Token5e in target array
      if (workflow.targets.first() === aToken) evaluateDamage(workflow)
   })
   DAE.setFlag(aActor, HOOK_NAME, hookId);
   if (TL > 2) jez.trace(`${TAG} Hook Id`, hookId);
   if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
   return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff() {
   const FUNCNAME = "doOff()";
   const FNAME = FUNCNAME.split("(")[0]
   const TAG = `${MACRO} ${FNAME} |`
   if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
   //----------------------------------------------------------------------------------------------
   // Remove the hook
   //
   let hookId = DAE.getFlag(aActor, HOOK_NAME);
   if (TL > 2) jez.trace(`${TAG} Hook Id`, hookId);
   Hooks.off("midi-qol.DamageRollComplete", hookId);
   DAE.unsetFlag(aActor, HOOK_NAME);
   if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
   return;
}
/***************************************************************************************************
 * evaluateDamage based on Crymic's damageCheck(workflow)
 ***************************************************************************************************/
async function evaluateDamage(workflow) {
   const FUNCNAME = "evaluateDamage(workflow)";
   const FNAME = FUNCNAME.split("(")[0]
   const TAG = `${MACRO} ${FNAME} |`
   if (TL === 0) jez.trace(`${TAG} --- Starting ---`);
   if (TL > 1) jez.trace(`${TAG} --- Starting ${FUNCNAME} ---`, "workflow", workflow);
   //----------------------------------------------------------------------------------------------
   // If the triggering attack did zero damage, quietly return
   //
   if (workflow.damageTotal <= 0) {
      if (TL > 0) jez.trace(`${TAG} No damage done in triggering attack`);
      return
   }
   //----------------------------------------------------------------------------------------------
   // If the triggering attack didn't do DAM_TYPE damage type, quietly exit
   //
   console.log("TODO: need to determine if radiant damage was done")
   if (TL > 2) jez.trace(`${TAG} Damage Detail`, workflow.damageDetail);
   let triggered = false // Variable to record whether trigger damage type was observed.
   workflow.damageDetail.forEach(checkDamage);
   //
   function checkDamage(value) {
      if (TL > 2) jez.trace(`${TAG} Damage type: ${value.type}`, value);
      if (value.type === DAM_TYPE) triggered = true
   }
   if (!triggered) return 
   //----------------------------------------------------------------------------------------------
   // Replace the EFFECT_NAME effect on the active token
   //
   console.log("TODO: Apply an EFFECT_NAME effect to active token")
   await jezcon.addCondition(EFFECT_NAME, aActor.uuid, 
   {allowDups: false, replaceEx: true, origin: aActor.uuid, overlay: false, traceLvl: TL })
   //----------------------------------------------------------------------------------------------
   // All done
   //
   if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}