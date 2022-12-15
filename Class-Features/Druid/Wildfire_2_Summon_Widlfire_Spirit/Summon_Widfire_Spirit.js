const MACRONAME = "Summon_Wildfire_Spirit.0.8.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implemention of Summon Wildfire Spirit.  Based on macro Jon baked. 
 * 
 * args[0] contains a bunch of information for ItemMacro macros, including templateID of 
 * the placed template (if any).  That ID can be accessed as: args[0].templateId
 * The list is documented at: https://gitlab.com/tposney/midi-qol#notes-for-macro-writers
 * 
 * Module automated evocations apprently can eliminate the need for this macro.
 * 
 * A Reddit guide on setting up automated resouce usage.
 * https://www.reddit.com/r/FoundryVTT/comments/j9q81f/guide_how_to_setup_skill_resource_consumption/
 * 
 * 11/29/21 0.1 Add headers, debug and use of Summoner Module
 * 11/29/21 0.2 Try to make the macro actually, you know, work
 * 11/29/21 0.3 Cleanup the mostly working code
 * 11/29/21 0.4 Add use of a resource which is checked and decremented, on further study this was implemented by setting Resource 
 *              Consumption of details page to resource.secondry.value (also primary and tertiary available)
 * 12/01/21 0.5 Fix maxHP added fixed 13 but should have been 5
 * 03/16/22 0.6 Update to use WARPGATE and add to GitRepo (also fix bug of graphic failing)
 * 12/10/22 0.7 Add timer watchdog, use of resource by name not position, and insert it into combat tracker
 * 12/15/22 0.8 Update to use library functions to handle resource usage (NPC side not tested)
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3**/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const SPELL_NAME = `Summon Wildfire Spirit`
// const ACTOR_DATA = await aActor.getRollData();
const RESOURCE_NAME = "Wildshapes";
const IS_NPC = (aToken.document._actor.data.type === "npc") ? true : false;
// const CLASS_LEVEL = jez.getClassLevel(aToken, 'Druid', { traceLvl: TL })
const DURATION = 3600 // Seconds
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
  jez.log(msg);
  let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
  jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
  const FUNCNAME = "doOnUse(options={})";
  const FNAME = FUNCNAME.split("(")[0]
  const TAG = `${MACRO} ${FNAME} |`
  const TL = options.traceLvl ?? 0
  if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
  if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
  // await jez.wait(100)
  //-------------------------------------------------------------------------------------------------------------------------------
  // Get the template coords and delete it.
  //
  const MINION = await jez.familiarNameGet(aToken.actor);
  // Extract coordinates from the template and then delete it
  const templateID = args[0].templateId
  // Set the x,y coordinates of the targeting template that was placed.
  const X = canvas.templates.get(templateID).data.x
  const Y = canvas.templates.get(templateID).data.y
  // Delete the template that had been placed
  canvas.templates.get(templateID).document.delete()
  //-------------------------------------------------------------------------------------------------------------------------------
  // Ask if a resource should be consumed 
  //
  const Q_TITLE = `Consume Resource?`
  let qText = `<p>${aToken.name} is using <b>${SPELL_NAME}</b> to summon wildfire spirit.  This typically consumes one charge of 
    <b>Wildshape.</b></p>
    <p>If you want to spend the charge (or use the NPC alternative), click <b>"Yes"</b>.</p>
    <p>If you want to bypass spending the charge (with GM permission) click <b>"No"</b>.</p>
    <p>If you want to cancel the spell click <b>"Close"</b> (top right of dialog).</p>`
  const SPEND_RESOURCE = await Dialog.confirm({ title: Q_TITLE, content: qText, });
  if (TL > 1) jez.trace(`${TAG} SPEND_RESOURCE`,SPEND_RESOURCE)
  if (SPEND_RESOURCE === null) return jez.badNews(`${SPELL_NAME} cancelled by player.`, 'i')
  //-------------------------------------------------------------------------------------------------------------------------------
  // Delete a pre-exisiting version of this spell, if any.
  //
  let oldEffect = await aActor.effects.find(ef => ef.data.label === SPELL_NAME) ?? null; // Added a null case.
  if (oldEffect) await jez.deleteEffectAsGM(oldEffect.uuid, { traceLvl: TL })
  if (TL > 1) jez.trace(`${TAG} oldEffect`, oldEffect)
  //-------------------------------------------------------------------------------------------------------------------------------
  // Deal with casting resource -- this needs to consider NPC and PC data structures
  //
  if (SPEND_RESOURCE) {
    if (TL > 1) jez.trace(`${TAG} Time to use a resource`)
    let spendResult = await jez.resourceSpend(aActor.uuid, RESOURCE_NAME, aItem.uuid, { traceLvl: TL, quiet: false })
    if (!spendResult) return
  }
  // const CONTINUE = await spendResource({ traceLvl: TL })
  // if (!CONTINUE) return jez.badNews(`${SPELL_NAME} cancelled for lack of WildShapes`, 'w')
  //-------------------------------------------------------------------------------------------------------------------------------
  // Set the maximum hit points for the summoned familiar
  //
  const MAX_HP = (token.actor.getRollData().classes.druid.levels * 5) + 5;
  if (TL > 1) jez.trace(`${TAG} MAX_HP`,MAX_HP)
  //-------------------------------------------------------------------------------------------------------------------------------
  // Do the actual summon
  //
  let sTokenIds = await summonCritter(X, Y, MINION, MAX_HP, { traceLvl: TL }) // Returns array of summoned tokens
  let wfsTokenId = sTokenIds[0]
  if (TL > 1) jez.trace(`${TAG} wfsTokenId`,wfsTokenId)
  //-------------------------------------------------------------------------------------------------------------------------------
  // Apply Watchdog Timer effect to actor to track shape duration
  //
  await jez.wait(100)
  addWatchdogEffect(wfsTokenId, MINION, DURATION, { traceLvl: TL })
  if (TL > 1) jez.trace(`${TAG} added watchdog effect`)
  //-------------------------------------------------------------------------------------------------------------------------------
  // Post a more or less useful message to chat log and exit
  //
  msg = `<b>${aToken.name}</b> has summoned <b>${MINION}</b> (with ${MAX_HP}HP) to the field.  
    Creatures within 10 feet are hit with fire damage from explosion.`
  postResults(msg);
  msg = `${MINION} has been summoned to serve ${aToken.name}`
  postResults(msg)
  //-------------------------------------------------------------------------------------------------------------------------------
  // Add our Wildfire Spirit to combat tracker immediately after summoner if in combat
  //
  const ATOKEN_INIT_VALUE = aToken?.combatant?.data?.initiative
  if (TL > 1) jez.trace(`${TAG} ${aToken.name} initiative`, ATOKEN_INIT_VALUE);
  if (ATOKEN_INIT_VALUE) {
    const WFS_INIT = ATOKEN_INIT_VALUE - 0.001
    await jez.combatAddRemove('Add', wfsTokenId, { traceLvl: TL })
    await jez.wait(500)
    await jez.combatInitiative(wfsTokenId, { formula: WFS_INIT, traceLvl: 0 })
  }
  //-------------------------------------------------------------------------------------------------------------------------------
  if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
  return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Add an effect to the using actor that can perform additional actions on the summoned actor.
 * 
 * Expected input is a single token id and the name of the familiar
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function addWatchdogEffect(tokenId, famName, seconds, options = {}) {
  const FUNCNAME = "addWatchdogEffect(tokenId)";
  const FNAME = FUNCNAME.split("(")[0]
  const TAG = `${MACRO} ${FNAME} |`
  const TL = options.traceLvl ?? 0
  if (TL === 1) jez.trace(`${TAG} Starting --- `);
  if (TL > 1) jez.trace(`${TAG} Starting ---`, "tokenId", tokenId, "famName", famName, 'seconds', seconds, 'options', options);
  //-------------------------------------------------------------------------------------------------------------------------------
  // Make sure DEL_TOKEN_MACRO exists and is GM execute enabled
  //
  const RUNASGM_MACRO = jez.getMacroRunAsGM("DeleteTokenMacro") // This macro will display ui.notification.error
  if (!RUNASGM_MACRO) return false
  //-------------------------------------------------------------------------------------------------------------------------------
  // Proceed with adding watchdog
  //
  const CE_DESC = `${famName} can remain for up to ${seconds / 3600} hour(s)`
  let effectData = {
    label: SPELL_NAME,
    icon: aItem.img,
    origin: L_ARG.uuid,
    disabled: false,
    duration: {
      rounds: seconds / 6, startRound: GAME_RND,
      seconds: seconds, startTime: game.time.worldTime,
      token: aToken.uuid, stackable: false
    },
    flags: {
      dae: { macroRepeat: "none" },
      convenientDescription: CE_DESC,
      isConvenient: true,
      isCustomConvenient : true
    },
    changes: [
      { key: `macro.execute`, mode: jez.ADD, value: `DeleteTokenMacro ${tokenId}`, priority: 20 },
      // { key: `macro.itemMacro`, mode: jez.CUSTOM, value: `${aActor.uuid}`, priority: 20 },
    ]
  };
  if (TL > 1) jez.trace(`${FNAME} | MidiQOL.socket().executeAsGM("createEffects"`, "aToken.actor.uuid",
    aToken.actor.uuid, "effectData", effectData);
  await MidiQOL.socket().executeAsGM("createEffects",
    { actorUuid: aToken.actor.uuid, effects: [effectData] });
  if (TL > 0) jez.trace(`---  Finished --- ${MACRO} ${FNAME} ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Summon the minion and update HP
 * 
 * https://github.com/trioderegion/warpgate
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function summonCritter(x, y, summons, MAX_HP, options={}) {
  const FUNCNAME = "summonCritter(x, y, summons, MAX_HP, options={})";
  const FNAME = FUNCNAME.split("(")[0] 
  const TAG = `${MACRO} ${FNAME} |`
  const TL = options.traceLvl ?? 0
  if (TL===1) jez.trace(`${TAG} --- Starting ---`);
  if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'x      ',x, 'y      ', y, 'summons', summons,'MAX_HP ', MAX_HP, 
    "options",options);
  //-------------------------------------------------------------------------------------------------------------------------------
  // 
  //
  let castMod = jez.getCastMod(aToken)
  let profMod = jez.getProfMod(aToken)
  if (TL > 1) jez.trace(`${TAG} Data Gathered`, 'castMod', castMod, 'profMod', profMod)
  //-------------------------------------------------------------------------------------------------------------------------------
  // Below based on: https://github.com/trioderegion/warpgate/wiki/Summon-Spiritual-Badger
  //
  let updates = {
    actor: {
      'data.attributes.hp': { value: MAX_HP, max: MAX_HP }
    },
    embedded: {
      Item: {
        "Flame Seed": {
          'data.damage.parts': [[`1d6 + ${profMod}`, "fire"]],
          'data.attackBonus': `${castMod}[mod] + ${profMod}[prof]`,    // 5[mod] + 3[prof]
        },
      }
    }
  }
  if (TL > 1) jez.trace(`${TAG} updates`,updates)
  //-------------------------------------------------------------------------------------------------------------------------------
  //
  //
  const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
  if (TL > 1) jez.trace(`${TAG} OPTIONS`,OPTIONS)
  //-------------------------------------------------------------------------------------------------------------------------------
  //
  //
  const CALLBACKS = {
    pre: async (template) => {
      preEffects(template);
      await warpgate.wait(500);
    },
    post: async (template, token) => {
      postEffects(template);
      await warpgate.wait(500);
    }
  };
  if (TL > 1) jez.trace(`${TAG} CALLBACKS`,CALLBACKS)
  //-------------------------------------------------------------------------------------------------------------------------------
  //
  //
  let returned = await warpgate.spawnAt({ x: x, y: y }, summons, updates, CALLBACKS, OPTIONS);
  if (TL > 1) jez.trace(`${TAG} warpgate.spawnAt returned`,returned)
  return returned
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preEffects(template) {
  const VFX_FILE = "jb2a.explosion.02.orange"
  new Sequence()
    .effect()
    .file(VFX_FILE)
    .atLocation(template)
    .center()
    .scale(1.4)
    .play()
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function postEffects(template) {
  const VFX_OPACITY = 1.0
  const VFX_SCALE = 1.0
  const VFX_FILE = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Regular_Grey_400x400.webm"
  new Sequence()
    .effect()
    .file(VFX_FILE)
    .atLocation(template)
    .center()
    .scale(VFX_SCALE)
    .opacity(VFX_OPACITY)
    .waitUntilFinished(-1000)
    .effect()
    .file(VFX_FILE)
    .atLocation(template)
    .center()
    .scale(VFX_SCALE * 1.5)
    .opacity(VFX_OPACITY * 0.75)
    .waitUntilFinished(-1000)
    .effect()
    .file(VFX_FILE)
    .atLocation(template)
    .center()
    .scale(VFX_SCALE * 2.0)
    .opacity(VFX_OPACITY * 0.5)
    .waitUntilFinished(-1000)
    .effect()
    .file(VFX_FILE)
    .atLocation(template)
    .center()
    .scale(VFX_SCALE * 2.5)
    .opacity(VFX_OPACITY * 0.25)
    .waitUntilFinished(-1000)
    .play()
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOff(options = {}) {
  const FUNCNAME = "doOff(options={})";
  const FNAME = FUNCNAME.split("(")[0]
  const TAG = `${MACRO} ${FNAME} |`
  const TL = options.traceLvl ?? 0
  if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
  if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
  //-------------------------------------------------------------------------------------------------------------------------------
  // Comments, perhaps
  //
  if (TL > 3) jez.trace(`${TAG} | More Detailed Trace Info.`)

  if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
  return;
}