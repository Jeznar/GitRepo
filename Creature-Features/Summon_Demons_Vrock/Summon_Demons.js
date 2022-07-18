const MACRONAME = "Summon_Demons.0.2.js"
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
 * 07/17/22 0.2 Update to use jez.spawnAt for summoning
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
const TL = 0;                               // Trace Level for this macro

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
// if (args[0] === "off") await doOff();                   // DAE removal
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
  const FNAME = FUNCNAME.split("(")[0] 
  if (TL===1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
  if (TL > 1) jez.trace(`--- Starting --- ${MACRO} ${FUNCNAME} ---`);
  //-------------------------------------------------------------------------------------------
  let tokenIdArray = [];
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
  if (summonAttempt.total <= 01) {  // 70 gets 70% failure rate
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
    const FUNCNAME = "summonCallBack(selection)";
    const FNAME = FUNCNAME.split("(")[0] 
    if (TL===1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Starting --- ${MACRO} ${FUNCNAME} ---`,"selection",selection);
    //-------------------------------------------------------------------------------------------

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
    const FUNCNAME = "summonDretches()";
    const FNAME = FUNCNAME.split("(")[0] 
    if (TL>1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
    //-------------------------------------------------------------------------------------------
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
    const FUNCNAME = "summonVrock()";
    const FNAME = FUNCNAME.split("(")[0] 
    if (TL>1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
    //-------------------------------------------------------------------------------------------
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
  const FUNCNAME = "summonCritter(summons, number)";
  const FNAME = FUNCNAME.split("(")[0] 
  if (TL===1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
  if (TL > 1) jez.trace(`--- Starting --- ${MACRO} ${FUNCNAME} ---`,"summons",summons,"number",number);
  //--------------------------------------------------------------------------------------
  // Build data object for the spawnAt call 
  //
  let argObj = {
    defaultRange: 60,
    duration: 1000,                     // Duration of the intro VFX
    img: aItem.img,                     // Image to use on the summon location cursor
    introTime: 750,                    // Amount of time to wait for Intro VFX
    introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
    name: aItem.name,                   // Name of action (message only), typically aItem.name
    outroVFX: '~Smoke/SmokePuff01_*_${color}_400x400.webm', // default outroVFX file
    scale: 1.0,
    source: aToken,                     // Coords for source (with a center), typically aToken
    suppressTokenMold: 1250,
    templateName: `%${summons}%`,        // Name of the actor in the actor directory
    width: 2,                           // Width of token to be summoned
    traceLvl: TL
  }
  //--------------------------------------------------------------------------------------
  // If we are summoning a Dretch, the argObj needs to be revised
  //
  if (summons === "Dretch") {
    argObj.minionName = `${aToken.name}'s ${summons} ${number}`
    if (TL > 2) jez.trace(`${FNAME} | Updated minionName`, argObj.minionName)
    argObj.width = 1
  }
  //--------------------------------------------------------------------------------------
  // Call spawnAt to do the deed 
  //
  let returned = await jez.spawnAt(summons, aToken, aActor, aItem, argObj)
  return returned
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
 * 
 ***************************************************************************************************/
 async function addWatchdogEffect(tokenIdArray) {
  const FUNCNAME = "addWatchdogEffect(tokenIdArray)";
  const FNAME = FUNCNAME.split("(")[0] 
  if (TL===1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
  if (TL > 1) jez.trace(`--- Starting --- ${MACRO} ${FUNCNAME} ---`,"tokenIdArray",tokenIdArray);
  //------------------------------------------------------------------------------------------------
  let tokenIds = ""
  const EXPIRE = ["newDay", "longRest", "shortRest"];
  const GAME_RND = game.combat ? game.combat.round : 0;
  // Build list of token IDs seperated by spaces
  for (let i = 0; i < tokenIdArray.length; i++) tokenIds+= `${tokenIdArray[i]} ` 
  if (TL > 1) jez.trace(`${FNAME} | tokenIdArray`,tokenIdArray);

  let effectData = {
    label: aItem.name,
    icon: aItem.img,
    origin: LAST_ARG.uuid,
    disabled: false,
    duration: { rounds: 10, startRound: GAME_RND, startTime: game.time.worldTime },
    flags: { dae: { macroRepeat: "none", specialDuration: EXPIRE } },
    changes: [
         { key: `macro.execute`, mode: jez.ADD, value: `DeleteTokenMacro ${tokenIds}`, priority: 20 },
    ]
  };
  if (TL > 1) jez.trace(`${FNAME} | effectData`,effectData);
  if (TL > 3) jez.trace(`${FNAME} | MidiQOL.socket().executeAsGM("createEffects"`,"aToken.actor.uuid",
  aToken.actor.uuid,"effectData",effectData);
  await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });  
  if (TL > 0 ) jez.trace(`---  Finished --- ${MACRO} ${FNAME} ---`);
}