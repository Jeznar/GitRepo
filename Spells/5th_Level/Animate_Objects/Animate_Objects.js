const MACRONAME = "Animate_Objects.0.1.js"
/*****************************************************************************************
 * Implement Animate Objects which is a rather complicated spell.  This macro assumes
 * enoiugh of the appropriate type of objects are in range.  The general flow of this 
 * is as follows:
 * 
 * - Make sure the 5 template creatures exist in the actor's directory, %Animate SIZE%, 
 *   with size being Huge, Large, Medium, Small and Tint.
 * - Ask the caster what type of creature is to be summoned in a dialog that shows budget
 *   and cost
 * - Use Warpgate to summon and rename an actor to teh scene
 * - Repeat previous two steps till budget is spent.
 * - Modify conentration function to act as watchdog effect to delete summons at end 
 * 
 * 06/01/22 0.1 Creation of Macro
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
let summonableCreatures = [ "%Animated Tiny%",  "%Animated Small%", "%Animated Medium%", 
                            "%Animated Large%", "%Animated Huge%" ]
let summonCosts = [ 1, 1, 2, 4, 8 ]
let menuCreatures = [ "Tiny, cost:1",  "Small, cost:1", "Medium, cost:2", 
"Large, cost:4", "Huge, cost:8" ]
let summonBudget = 10
let tokenIdArray = [];  
let count = 0 // Count of objects animated
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
  jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
  //------------------------------------------------------------------------------------------------
  // Make sure all 5 potentially needed actors exist in the actor's directory.
  //
  for (const CRITTER of summonableCreatures) {
    jez.log(`Checking for creature: "${CRITTER}"`)
    let critter = game.actors.getName(CRITTER)
    jez.log("critter", critter)
    if (!critter) {
      msg = `Configuration problem: <b>${CRITTER}</b> was not found in the actor's directory.`
      ui.notifications.error(msg)
      postResults(msg)
      return
    }
  }
  //------------------------------------------------------------------------------------------------
  // Run a runeVFX on the summoning token
  //
  jez.runRuneVFX(aToken, jez.getSpellSchool(aItem))
  //------------------------------------------------------------------------------------------------
  // Call the function that will begin the recursive process of asking for summon type and placing.
  //
  animate();
  //------------------------------------------------------------------------------------------------
  // That's all folks
  //
  jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
}
/***************************************************************************************************
 * Build dialog to ask what size to animate next, perform summon and call this function again until 
 * budget is exhausted.
 ***************************************************************************************************/
function animate() {
  const FUNCNAME = 'animate()'
  jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
  const queryTitle = "What size object should be animated next?";
  const queryText = `Remaining animation budget is <b>${summonBudget}</b>`;
  let summonList = [ menuCreatures[0], menuCreatures[1]];
  if (summonBudget >= summonCosts[2]) summonList.push(menuCreatures[2]);
  if (summonBudget >= summonCosts[3]) summonList.push(menuCreatures[3]);
  if (summonBudget >= summonCosts[4]) summonList.push(menuCreatures[4]);
  jez.pickRadioListArray(queryTitle, queryText, summonCallBack, summonList);
  jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
  return (true);
  //---------------------------------------------------------------------------------------------
  async function summonCallBack(selection) {
    let index = 0
    jez.log("pickRadioCallBack", selection);
    const ANIMATION_SIZE = selection.split(",")[0];
    switch (ANIMATION_SIZE) {
      case "Tiny": index = 0; break;
      case "Small": index = 1; break;
      case "Medium": index = 2; break;
      case "Large": index = 3; break;
      case "Huge": index = 4; break;
    }
    jez.log(`Time to summon a ${summonableCreatures[index]}, index was ${index}`);
    await summonObject(index);
    summonBudget -= summonCosts[index]
    if (summonBudget > 0) {
      jez.log(`Remaining budget is ${summonBudget}`)
      animate()
    } 
    else {
      msg = `<b>${aToken.name}</b> animates ${count} objects. They will serve 
      for one minute or until dismissed.`;
      postResults(msg);
      addWatchdogEffect(tokenIdArray);
    }
  }
  //---------------------------------------------------------------------------------------------
  async function summonObject(index) {
    let rc = null;
    const CREATURE_NAME = summonableCreatures[index];
    rc = await summonCritter(CREATURE_NAME);
    tokenIdArray.push(rc);
  }
}
/***************************************************************************************************
 * Summon the actor and rename with a numeric suffix
 * 
 * https://github.com/trioderegion/warpgate
 ***************************************************************************************************/
async function summonCritter(summons) {
  let name = `${aToken.name}'s Object ${++count}`
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
