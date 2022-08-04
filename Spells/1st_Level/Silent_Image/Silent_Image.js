const MACRONAME = "Silent_Image.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Call a token via warpgate, most interesting element is the use of jez.warpCrosshairs to control
 * how far away the token can be summoned.
 * 
 * 07/20/22 0.1 Creation of Macro
 * 07/31/22 0.3 Add convenientDescription
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
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
const MINION = `Silent Image`;
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
  let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
  jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff() {
  if (TL > 1) jez.trace("Token to dismiss", args[1])
  warpgate.dismiss(args[1], game.scenes.viewed.id)
  return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse() {
  const FUNCNAME = "doOnUse()";
  const FNAME = FUNCNAME.split("(")[0]
  await jez.wait(100)
  if (TL === 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
  //--------------------------------------------------------------------------------------
  // Perform the actual summon
  //
  let summonedID = await summonSilentImage()
  if (!summonedID) {  // Something went sideways
    if (TL > 3) jez.trace(`${FNAME} | aToken`, aToken)
    if (TL > 3) jez.trace(`${FNAME} | aActor`, aActor)
      jezcon.remove("Concentrating", aToken.actor.uuid, { traceLvl: TL });
    return false
  }
  //--------------------------------------------------------------------------------------
  // Add watchdog effect to despawn summoned token at expiration (1 hour) via doOff 
  //
  const EXPIRE = ["newDay", "longRest", "shortRest"];
  const GAME_RND = game.combat ? game.combat.round : 0;
  let effectData = {
    label: aItem.name,
    icon: aItem.img,
    origin: LAST_ARG.uuid,
    disabled: false,
    duration: {
      rounds: 600, startRound: GAME_RND,
      seconds: 3600, startTime: game.time.worldTime,
      token: aToken.uuid, stackable: false
    },
    flags: { 
      dae: { macroRepeat: "none", specialDuration: EXPIRE },
      convenientDescription: `Maintaining Silent Image.  See Spell Description.`
     },
    changes: [
      { key: `macro.itemMacro`, mode: jez.ADD, value: summonedID, priority: 20 },
    ]
  };
  await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });
  //-----------------------------------------------------------------------------------------------
  // post summary effect message
  //
  msg = `${aToken.name} creates a silent image.<br><br>
    See:&nbsp;<a href="https://www.dndbeyond.com/spells/silent-image" target="_blank" rel="noopener">
    D&amp;D Beyond Description</a> for details`
  postResults(msg)
  if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
  return true;
}
/***************************************************************************************************
 * Summon the minion and update 
 ***************************************************************************************************/
async function summonSilentImage() {
  const FUNCNAME = "summonSilentImage()";
  const FNAME = FUNCNAME.split("(")[0]
  if (TL === 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
  //-----------------------------------------------------------------------------------------------
  //
  let argObj = {
    defaultRange: 30,
    duration: 3000,                     // Duration of the intro VFX
    introTime: 1000,                    // Amount of time to wait for Intro VFX
    introVFX: '~Energy/SwirlingSparkles_01_Regular_${color}_400x400.webm', // default introVFX file
    minionName: `${aToken.name}'s ${MINION}`,
    name: aItem.name,                   // Name of action (message only), typically aItem.name
    outroVFX: '~Fireworks/Firework*_02_Regular_${color}_600x600.webm', // default outroVFX file
    scale: 0.7,								// Default value but needs tuning at times
    source: aToken,                     // Coords for source (with a center), typically aToken
    templateName: `%${MINION}%`,        // Name of the actor in the actor directory
    width: 3,                           // Width of token to be summoned
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
  return jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
}