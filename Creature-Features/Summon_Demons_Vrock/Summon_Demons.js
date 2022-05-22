const MACRONAME = "Summon_Demons.0.1.js"
/*****************************************************************************************
 * Implement a Vrock's summon ability,
 * 
 *   The demon chooses what to summon and attempts a magical summoning.
 *   A vrock has a 30 percent chance of summoning 2d4 dretches or one vrock.
 *   A summoned demon appears in an unoccupied space within 60 feet of its summoner, acts 
 *   as an ally of its summoner, and can't summon other demons. It remains for 1 minute, 
 *   until it or its summoner dies, or until its summoner dismisses it as an action.
 * 
 * 05/21/22 0.1 Creation of Macro
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
let msg = "";
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "off") await doOff();                   // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
  const FUNCNAME = "doOnUse()";
  let tokenIdArray = [];
  jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
  //------------------------------------------------------------------------------------------------
  // Run a runeVFX on the summoning token
  //
  jez.runRuneVFX(aToken, jez.getSpellSchool(aItem))
  //------------------------------------------------------------------------------------------------
  // Determine if the summoning will succeed, post failure message if warrented
  //
  let summonAttempt = new Roll(`1d100`).evaluate({ async: false });
  game.dice3d?.showForRoll(summonAttempt);
  jez.log("Roll result", summonAttempt.total)
  if (summonAttempt.total <= 70) {  // 70 gets 70% failure rate
    msg = `<b>${token.name}</b>'s summon attempt has failed!  It wasted its turn.`
    jez.log(msg)
    postResults(msg)
    return (false)
  }
  //------------------------------------------------------------------------------------------------
  // Pop a dialog to find out if the summoner wants 2d4 dretches or one vrock added to the scene
  //
  const queryTitle = "What type of Demon to summon?"
  const queryText = "Pick from the list"
  let demons = ["Dretches (2d4)", "Vrock (1)"];
  jez.pickRadioListArray(queryTitle, queryText, summonCallBack, demons);
  //------------------------------------------------------------------------------------------------
  // That's all folks
  //
  jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
  return (true);
  //---------------------------------------------------------------------------------------------
  async function summonCallBack(selection) {
    jez.log("pickRadioCallBack", selection)

    const demonType = selection.split(" ")[0]
    if (demonType === "Dretches") {
      jez.log("Time to summon some Dretches")
      summonDretches()
    }
    else if (demonType === "Vrock") {
      jez.log("Time to summon a Vrock")
      summonVrock()
    } else {
      msg = `Bad news! This should not have happened to ${MACRO}`
      ui.notifications.error(msg)
      return (false)
    }
  }
  //---------------------------------------------------------------------------------------------
  async function summonDretches() {
    const CREATURE_NAME = "Dretch"
    let rc = null
    let dretches = new Roll(`2d4`).evaluate({ async: false });
    game.dice3d?.showForRoll(dretches);
    for (let i = 1; i <= dretches.total; i++) {
      rc = await summonCritter(CREATURE_NAME, i)
      tokenIdArray.push(rc)
    }
    msg = `<b>${aToken.name}</b> summons ${dretches.total} ${CREATURE_NAME}es. They will serve 
    for one minute or until dismissed.`
    postResults(msg)
    addWatchdogEffect(tokenIdArray)
  }
  //---------------------------------------------------------------------------------------------
  async function summonVrock() {
    let rc = null
    const CREATURE_NAME = "Vrock"
    rc = await summonCritter(CREATURE_NAME, 1)
    tokenIdArray.push(rc)
    msg = `<b>${aToken.name}</b> summons a ${CREATURE_NAME}. It will serve 
    for one minute or until dismissed.`
    postResults(msg)
    addWatchdogEffect(tokenIdArray)
  }
}
/***************************************************************************************************
 * Summon the actor and rename with a numeric suffix
 * 
 * https://github.com/trioderegion/warpgate
 ***************************************************************************************************/
async function summonCritter(summons, number) {
  let name = `${aToken.name}'s ${summons} ${number}`
  let updates = { token: {name: name},
                  actor: {name: name},
                }
  const OPTIONS = { controllingActor: aActor };
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
  return (await warpgate.spawn(summons, updates, CALLBACKS, OPTIONS));
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
  const SCENE_ID = game.scenes.viewed.id

  jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
  jez.log("Something could have been here")
  for (let i = 1; i < args.length - 1; i++) {
    jez.log(`  args[${i}]`, args[i]);
    await jez.wait(250)
    warpgate.dismiss(args[i], SCENE_ID)
  }
  jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
  return;
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
 async function addWatchdogEffect(tokenIdArray) {
  let tokenIds = ""
  const EXPIRE = ["newDay", "longRest", "shortRest"];
  const GAME_RND = game.combat ? game.combat.round : 0;
  // Build list of token IDs seperated by spaces
  for (let i = 0; i < tokenIdArray.length; i++) tokenIds+= `${tokenIdArray[i]} ` 
  let effectData = {
    label: aItem.name,
    icon: aItem.img,
    origin: LAST_ARG.uuid,
    disabled: false,
    duration: { rounds: 10, startRound: GAME_RND, startTime: game.time.worldTime },
    flags: { dae: { macroRepeat: "none", specialDuration: EXPIRE } },
    changes: [
      { key: `macro.itemMacro`, mode: jez.ADD, value: tokenIds, priority: 20 },
    ]
  };
  await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });
}
