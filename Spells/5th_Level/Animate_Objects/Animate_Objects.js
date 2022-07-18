const MACRONAME = "Animate_Objects.0.3.js"
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
 * 07/15/22 0.2 Update to use warpgate.spawnAt with range limitation
 * 07/17/22 0.3 Update to use jez.spawnAt (v2) for summoning
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
const TL = 0;
let summonableCreatures = ["Animated Tiny", "Animated Small", "Animated Medium",
  "Animated Large", "Animated Huge"]
let summonCosts = [1, 1, 2, 4, 8]
let menuCreatures = ["Tiny, cost:1", "Small, cost:1", "Medium, cost:2",
  "Large, cost:4", "Huge, cost:8"]
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
  for (const CRIT of summonableCreatures) {
    const CRITTER = `%${CRIT}%`
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
  await animate();
  //------------------------------------------------------------------------------------------------
  // That's all folks
  //
  jez.log("")
  jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
  jez.log("")
}
/***************************************************************************************************
 * Build dialog to ask what size to animate next, perform summon and call this function again until 
 * budget is exhausted.
 ***************************************************************************************************/
async function animate() {
  const FUNCNAME = 'animate()'
  jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
  const queryTitle = "What size object should be animated next?";
  const queryText = `Remaining animation budget is <b>${summonBudget}</b>`;
  let summonList = [menuCreatures[0], menuCreatures[1]];
  if (summonBudget >= summonCosts[2]) summonList.push(menuCreatures[2]);
  if (summonBudget >= summonCosts[3]) summonList.push(menuCreatures[3]);
  if (summonBudget >= summonCosts[4]) summonList.push(menuCreatures[4]);
  await jez.pickRadioListArray(queryTitle, queryText, summonCallBack, summonList);
  jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
  return (true);
  //---------------------------------------------------------------------------------------------
  async function summonCallBack(selection) {
    let index = 0
    jez.log("pickRadioCallBack", selection);
    if (selection) {
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
        await animate()
        return  // Prevents multple watchdog effects
      }
    }
    msg = `<b>${aToken.name}</b> animates ${count} objects. They will serve 
    for one minute or until dismissed.`;
    postResults(msg);
    addWatchdogEffect(tokenIdArray);
    //---------------------------------------------------------------------------------------------
    async function summonObject(index) {
      let rc = null;
      const CREATURE_NAME = summonableCreatures[index];
      rc = await summonCritter(CREATURE_NAME, summonableCreatures[index]);
      tokenIdArray.push(rc);
    }
  }
}
/***************************************************************************************************
 * Summon the actor and rename with a numeric suffix
 * 
 * https://github.com/trioderegion/warpgate
 ***************************************************************************************************/
async function summonCritter(MINION, SIZE) {
  //--------------------------------------------------------------------------------------
  // Build data object for the spawnAt call 
  //
  let argObj = {
    defaultRange: 30,
    duration: 3000,                     // Duration of the intro VFX
    img: aItem.img,                     // Image to use on the summon location cursor
    introTime: 1000,                    // Amount of time to wait for Intro VFX
    introVFX: '~Energy/SwirlingSparkles_01_Regular_${color}_400x400.webm', // default introVFX file
    minionName: `${aToken.name}'s Object ${++count}`,
    name: aItem.name,                   // Name of action (message only), typically aItem.name
    outroVFX: '~Fireworks/Firework*_02_Regular_${color}_600x600.webm', // default outroVFX file
    scale: 0.7,								// Default value but needs tuning at times
    source: aToken,                     // Coords for source (with a center), typically aToken
    templateName: `%${MINION}%`,        // Name of the actor in the actor directory
    width: 1,                           // Width of token to be summoned
    traceLvl: TL
  }
  //--------------------------------------------------------------------------------------
  // Adjust argObj if this needs to be on a grid intersection
  //
  if (SIZE.includes("Large")) argObj.width = 2
  //--------------------------------------------------------------------------------------
  // Perform the summon
  //
  return await(jez.spawnAt(MINION, aToken, aActor, aItem, argObj))
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
  //-----------------------------------------------------------------------------------------------
  // Define new watchdog effect
  //
  let tokenIds = ""
  const EXPIRE = ["newDay", "longRest", "shortRest"];
  const GAME_RND = game.combat ? game.combat.round : 0;
  // Build list of token IDs seperated by spaces
  for (let i = 0; i < tokenIdArray.length; i++) tokenIds += `${tokenIdArray[i]} `
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
  //-----------------------------------------------------------------------------------------------
  // Remove (delete) existing watchdog Effect
  //
  // let existingEffect = aActor.effects.find(ef => ef.data.label === aItem.name) ?? null;
  // if (existingEffect) await existingEffect.delete();
  //-----------------------------------------------------------------------------------------------
  // Apply new watchdog effect
  //
  await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });
}