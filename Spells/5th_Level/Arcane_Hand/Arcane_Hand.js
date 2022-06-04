const MACRONAME = "Arcane_Hand.0.1.js"
/*****************************************************************************************
 * Summon aand customize an Arcane Hound to the scene
 *  
 * - Summon with WarpGate
 * - Modify Bite ability to have correct to-hit bonus
 * - Delete summon when effect on original caster is removed (or expires)
 * 
 * 02/11/22 0.1 Creation of Macro
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
//----------------------------------------------------------------------------------
// Setup some specific global values
//
const MINION_TEMPLATE = `%Arcane Hand%`;
let colorArray = ["Blue", "Green", "Purple", "Rainbow", "Red", "Grey"];
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
    jez.log(`Checking for creature: "${MINION_TEMPLATE}"`)
    let critter = game.actors.getName(MINION_TEMPLATE)
    if (!critter) {
        msg = `Configuration problem: <b>${MINION_TEMPLATE}</b> was not found in the actor's directory.`
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
    await popColorDialog();
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Pop a Radio Button Dialog to select the color of the hand to be used.
 ***************************************************************************************************/
async function popColorDialog() {
  const queryTitle = "What Color Should Hand Be?"
  const queryText = `Select one color that should be used for the Arcane Hand.`
  jez.pickRadioListArray(queryTitle, queryText, pickColorCallBack, colorArray);
}
/***************************************************************************************************
 * Process the callback from dialog and fork to correct function to apply effect
 ***************************************************************************************************/
async function pickColorCallBack(selection) {
  if (!selection) popColorDialog()          // Try again if no selection made
  else {
    let color = selection
    if (color === "Grey") color = "Rock01" // Rock is the only 'color' with a suffix
    let houndInfo = await summonHound(color)
    addWatchdogEffect(houndInfo);
    msg = `<b>${aToken.name}</b> has summoned a ${selection} arcane hand that will serve for the 
    duration of the spell.`
    postResults(msg)
  }
}
/***************************************************************************************************
 * Summon the minion and update HP
 * 
 * https://github.com/trioderegion/warpgate
 ***************************************************************************************************/
async function summonHound(color) {
  const CAST_MOD = jez.getCastMod(aToken);
  const CHAR_LVL = jez.getCharLevel(aToken);
  const MAX_HP = aActor.data.data.attributes.hp.max
  const NAME = `${aToken.name}'s Arcane Hand`
  const SPELL_LVL = args[0].spellLevel
  const FIST_DAM = `${4 + (SPELL_LVL - 5) * 2}d8`
  const GRASP_DAM = `${2 + (SPELL_LVL - 5) * 2}d6 + ${CAST_MOD}`
  const CAST_STAT = aActor.data.data.abilities[jez.getCastStat(aToken)].value
  let updates = {
    token: {
      name: NAME,
      img: `modules/jb2a_patreon/Library/5th_Level/Arcane_Hand/ArcaneHand_Human_01_Idle_${color}_400x400.webm`,
    },
    actor: {
      name: NAME,
      img: `modules/jb2a_patreon/Library/5th_Level/Arcane_Hand/ArcaneHand_Human_01_Idle_${color}_Thumb.webp`,
      'data.attributes.hp': { 
        formula: MAX_HP,
        max: MAX_HP,
        value: MAX_HP,  
       },
      'data.details.cr': CHAR_LVL,            // Set CRto make hands proficency bonus match the casters
      'data.abilities.int.value': CAST_STAT,  // Make hand's cast stat match casters
    },
    embedded: {
      Item: {
        "Clenched Fist": {
          'data.damage.parts': [[FIST_DAM, "force"]],
          'data.attackBonus': `${CAST_MOD}[mod]`,
          img: `modules/jb2a_patreon/Library/5th_Level/Arcane_Hand/ArcaneHand_Human_01_Idle_${color}_Thumb.webp`,
        },
        "Forceful Hand": {
          img: `modules/jb2a_patreon/Library/5th_Level/Arcane_Hand/ArcaneHand_Human_01_Idle_${color}_Thumb.webp`,
        },
        "Grasping Hand": {
          'data.damage.versatile': GRASP_DAM,
          img: `modules/jb2a_patreon/Library/5th_Level/Arcane_Hand/ArcaneHand_Human_01_Idle_${color}_Thumb.webp`,
        },
        "Interposing Hand": {
          img: `modules/jb2a_patreon/Library/5th_Level/Arcane_Hand/ArcaneHand_Human_01_Idle_${color}_Thumb.webp`,
        },
      }
    }
  }
  const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
  const CALLBACKS = {
    pre: async (template) => {
      preEffects(template, color);
      await warpgate.wait(1000);
    },
    post: async (template) => {
      postEffects(template, color);
      await warpgate.wait(500);
    }
  };
  return (await warpgate.spawn(MINION_TEMPLATE, updates, CALLBACKS, OPTIONS));
}
  /***************************************************************************************************
   * 
   ***************************************************************************************************/
   async function preEffects(template, color) {
    let vfxFile = "jb2a.explosion.yellow.1"
    switch (color) {
      case "Blue":    vfxFile = "jb2a.explosion.07.bluewhite"; break;
      case "Green":   vfxFile = "jb2a.explosion.04.green"; break;
      case "Purple":  vfxFile = "jb2a.explosion.07.purplepink"; break;
      case "Rainbow": vfxFile = "jb2a.explosion.tealyellow.2"; break;
      case "Red":     vfxFile = "jb2a.explosion.red.0"; break;
      case "Rock01":  vfxFile = "jb2a.explosion.yellow.1"; break;
    }
    new Sequence()
      .effect()
      .file(vfxFile)
      .atLocation(template)
      .center()
      .scale(0.5)
      .opacity(0.75)
      .play()
  }
  /***************************************************************************************************
   * 
   ***************************************************************************************************/
   async function postEffects(template, color) {
    const VFX_OPACITY = 1.0
    const VFX_SCALE = 1.0
     let vfxFile = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_400x400.webm"
     switch (color) {
       case "Blue":
         vfxFile = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Regular_Blue_400x400.webm";
         break;
       case "Green":
         vfxFile = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Dark_Green_400x400.webm";
         break;
       case "Purple":
        vfxFile = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Dark_Purple_400x400.webm";
        break;
       case "Rainbow":
        vfxFile = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Dark_Black_400x400.webm";
        break;
       case "Red":
        vfxFile = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Dark_Purple_400x400.webm";
        break;
       case "Rock01":
        vfxFile = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Regular_Grey_400x400.webm";
        break;
     }
     
    new Sequence()
      .effect()
        .file(vfxFile)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE*.5)
        .opacity(VFX_OPACITY*0.75)
        .waitUntilFinished(-1000) 
    .effect()
        .file(vfxFile)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE*.75)
        .opacity(VFX_OPACITY*0.5)
        .waitUntilFinished(-1000) 
    .effect()
        .file(vfxFile)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE*1)
        .opacity(VFX_OPACITY*0.25)
        .waitUntilFinished(-1000) 
    .play()
  }
/***************************************************************************************************
 * 
 ***************************************************************************************************/
 async function addWatchdogEffect(tokenIdArray) {
    let tokenIds = ""
    const EXPIRE = ["longRest"];
    const GAME_RND = game.combat ? game.combat.round : 0;
    // Build list of token IDs seperated by spaces
    for (let i = 0; i < tokenIdArray.length; i++) tokenIds+= `${tokenIdArray[i]} ` 
    let effectData = {
      label: aItem.name,
      icon: aItem.img,
      origin: LAST_ARG.uuid,
      disabled: false,
      duration: { rounds: 4800, startRound: GAME_RND, seconds: 28800, startTime: game.time.worldTime },
      flags: { dae: { macroRepeat: "none", specialDuration: EXPIRE } },
      changes: [
        { key: `macro.itemMacro`, mode: jez.ADD, value: tokenIds, priority: 20 },
      ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });
  }