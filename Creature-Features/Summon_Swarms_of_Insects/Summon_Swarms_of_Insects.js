const MACRONAME = "Summon_Swarms_of_Insects.0.2.js"
/*****************************************************************************************
 * Summon swarms of insects, like the name says
 * 
 * 02/11/22 0.1 Creation of Macro
 * 07/18/22 0.2 Update to use jez.spawnAt for summoning
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
let msg = "";
const TL = 0;
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const CREATURE_NAME = "Swarm of Insects"
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
  const FUNCNAME = "doOnUse()";
  jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
  let swarms = new Roll(`1d4`).evaluate({ async: false });
  game.dice3d?.showForRoll(swarms);

  for (let i = 1; i <= swarms.total; i++) {
    await summonCritter(CREATURE_NAME, i)
  }
  let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
  msg = `<b>${aToken.name}</b> summons ${swarms.total} ${CREATURE_NAME}`

  await jez.addMessage(chatMessage, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" })
  jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
  return (true);
}
/***************************************************************************************************
 * Summon the actor and rename with a numeric suffix
 * 
 * https://github.com/trioderegion/warpgate
 ***************************************************************************************************/
async function summonCritter(summons, number) {
  //--------------------------------------------------------------------------------------
  // Build data object for the spawnAt call 
  //
  let argObj = {
    defaultRange: 60,                   // Defaults to 30, but this varies per spell
    duration: 1000,                     // Duration of the intro VFX
    img: aItem.img,                     // Image to use on the summon location cursor
    introTime: 1000,                     // Amount of time to wait for Intro VFX
    introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
    minionName: `${aToken.name}'s ${summons} ${number}`,
    name: aItem.name,                   // Name of action (message only), typically aItem.name
    outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
    source: aToken,                     // Coords for source (with a center), typically aToken
    width: 1,                           // Width of token to be summoned, 1 is the default
    traceLvl: TL                        // Trace level, matching calling function decent choice
}
  //--------------------------------------------------------------------------------------
  // Call spawnAt to do the deed 
  //
  return await jez.spawnAt(summons, aToken, aActor, aItem, argObj)
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
async function preEffects(template) {
  const VFX_FILE = "modules/jb2a_patreon/Library/Generic/Explosion/Explosion_*_Green_400x400.webm"
  new Sequence()
    .effect()
    .file(VFX_FILE)
    .atLocation(template)
    .center()
    .scale(1.0)
    .play()
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
async function postEffects(template) {
  const VFX_FILE = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Dark_Green_400x400.webm"
  new Sequence()
    .effect()
    .file(VFX_FILE)
    .atLocation(template)
    .center()
    .scale(1.0)
    .play()
}