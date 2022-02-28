const MACRONAME = "Summon_Swarms_of_Insects"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
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
  let name = `${summons} ${number}`
  // COL-THING: Updates the name of the summoned token via warpgate call
  let updates = { token : {name: name} }
  const OPTIONS = { controllingActor: aActor };
  // COOL-THING: Plays VFX before and after the warpgate summon.
  const CALLBACKS = {
    pre: async (template) => {
      preEffects(template);
      await warpgate.wait(500);
    },
    post: async (template, token) => {
      postEffects(template);
      await warpgate.wait(500);
      //greetings(template, token);
    }
  };
  //updates = mergeObject(updates, choice);
  await warpgate.spawn(summons, updates, CALLBACKS, OPTIONS);
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