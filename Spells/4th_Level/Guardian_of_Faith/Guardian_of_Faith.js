const MACRONAME = "Guardian_of_Faith.0.1.js"
/*****************************************************************************************
 * Summon a Guardian of Faith to the current scene.  Some key points:
 * 
 * - Summon with WarpGate
 * - Modify Bite ability to have correct to-hit bonus
 * - Delete summon when effect on original caster is removed (or expires)
 * 
 * 08/04/22 0.1 Creation of Macro based on Faithful Hound
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
const TL = 0;                               // Trace Level for this macro
//----------------------------------------------------------------------------------
// Setup some specific global values
//
const MINION = `%Guardian of Faith%`;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
  jez.log(`Checking for creature: "${MINION}"`)
  let critter = game.actors.getName(MINION)
  jez.log("Template Creature", critter)
  if (!critter) {
    msg = `Configuration problem: <b>${MINION}</b> was not found in the actor's directory.`
    ui.notifications.error(msg)
    postResults(msg)
    return (false)
  }
  return (true)
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
function postResults(msg) {
  jez.log(msg);
  let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
  jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
async function doOff() {
  const FUNCNAME = "doOff()";
  jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
  for (let i = 1; i < args.length - 1; i++) {
    jez.log(`  args[${i}]`, args[i]);
    await jez.wait(250)
    warpgate.dismiss(args[i], game.scenes.viewed.id)
  }
  bubbleForAll(aToken.id, `My guardian is no more`, true, true)
  jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
  return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
  const FUNCNAME = "doOnUse()";
  if (!await preCheck()) return (false);
  jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
  let guardianInfo = await summonGuardian()
  jez.log("Guardian Info", guardianInfo)
  addWatchdogEffect(guardianInfo);
  addFlagToSummoned(guardianInfo, aToken.id, {traceLvl: TL});
  msg = `${aToken.name} has summoned a Guardian of Faith to the field that will protect the area it was summoned to.`
  postResults(msg)
  jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
  return (true);
}
/***************************************************************************************************
 * Summon the minion 
 ***************************************************************************************************/
async function summonGuardian() {
  const NAME = `${aToken.name.split(" ")[0]}'s Guardian of Faith`
  const CHAR_LVL = jez.getCharLevel(aToken);
  const CAST_STAT = aActor.data.data.abilities[jez.getCastStat(aToken)].value
  //--------------------------------------------------------------------------------------------------
  // Define modifcations for the summons
  //
  let updates = {
    token: { name: NAME },
    actor: { 
      name: NAME,
      'data.details.cr': CHAR_LVL,            // Set CR to  match the caster's
      'data.abilities.wis.value': CAST_STAT,  // Make key stat match caster's
    }
  }
  //--------------------------------------------------------------------------------------------------
  // Build the argument object for the summons
  //
  let argObj = {
    defaultRange: 30,
    duration: 3000,                     // Duration of the intro VFX
    introTime: 1000,                    // Amount of time to wait for Intro VFX
    introVFX: '~Energy/SwirlingSparkles_01_Regular_${color}_400x400.webm',
    minionName: `${NAME}`,
    name: aItem.name,                   // Name of action (message only), typically aItem.name
    outroVFX: '~Fireworks/Firework*_02_Regular_${color}_600x600.webm',
    scale: 0.7,								// Default value but needs tuning at times
    source: aToken,                     // Coords for source (with a center), typically aToken
    templateName: `${MINION}`,        // Name of the actor in the actor directory
    updates: updates,
    width: 2,                           // Width of token to be summoned
    traceLvl: TL
  }
  //--------------------------------------------------------------------------------------------------
  // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
  // to update the img attribute or set basic image to match this item
  //
  let summonData = await game.actors.getName(MINION)
  argObj.img = summonData ? summonData.img : aItem.img
  //--------------------------------------------------------------------------------------------------
  // Do the actual summon
  //
  return (await jez.spawnAt(MINION, aToken, aActor, aItem, argObj))
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
async function addWatchdogEffect(tokenIdArray) {
  let tokenIds = ""
  const CE_DESC = `Guardian of Faith is Active`
  const EXPIRE = ["newDay", "shortRest", "longRest"];
  const GAME_RND = game.combat ? game.combat.round : 0;
  // Build list of token IDs seperated by spaces
  for (let i = 0; i < tokenIdArray.length; i++) tokenIds += `${tokenIdArray[i]} `
  let effectData = {
    label: aItem.name,
    icon: aItem.img,
    origin: LAST_ARG.uuid,
    disabled: false,
    duration: { rounds: 4800, startRound: GAME_RND, seconds: 28800, startTime: game.time.worldTime },
    flags: {
      dae: { macroRepeat: "none", specialDuration: EXPIRE },
      convenientDescription: CE_DESC
    },
    changes: [
      { key: `macro.itemMacro`, mode: jez.ADD, value: tokenIds, priority: 20 },
    ]
  };
  await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
 async function addFlagToSummoned(guardianID, tokenId, options={}) {
  const FUNCNAME = "addFlagToSummoned(guardianID, tokenId)";
  const FNAME = FUNCNAME.split("(")[0] 
  const TAG = `${MACRO} ${FNAME} |`
  const TL = options.traceLvl ?? 0
  if (TL===1) jez.trace(`${TAG} --- Starting ---`);
  if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"guardianID",guardianID,"tokenId",tokenId);
  //-------------------------------------------------------------------------------------------------
  // convert the guardianID into guardian token data (Token5e)
  //
  let gToken = null
  for (let i = 1; i < 11; i++) {
    gToken = await canvas.tokens.placeables.find(ef => ef.id === guardianID[0])
             // await canvas.tokens.placeables.find(ef => ef.id === "7sMRPW32f4hSR1la")
    if (gToken) break
    if (TL>1) jez.trace(`${TAG} Try #${i} for ${guardianID[0]} failed finding guardian`,gToken);
    await jez.wait(200)
  }
  if (!gToken) return jez.badNews(`Unable to find token associated with ID #${guardianID[0]}`,"w")
  //-------------------------------------------------------------------------------------------------
  await DAE.setFlag(gToken.actor, MACRO, tokenId);
  if (TL>2) jez.trace(`${TAG} ${gToken.name} current DAE flagObj`,gToken.actor.data.flags.dae)
  let curVal = await DAE.getFlag(gToken.actor, MACRO);
  if (TL>1) jez.trace(`${TAG} ${gToken.name} flag value ${curVal}`)
}