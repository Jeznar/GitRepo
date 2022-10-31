const MACRONAME = "Mordenkainen's_Sword.0.1.js"
/*****************************************************************************************
 * 
 * 
 * 10/31/22 0.1 Creation of Macro from Spiritual_Weapon.0.1.js
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 0;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //---------------------------------------------------------------------------------------------------
 if (TL>1) jez.trace(`${TAG} === Starting ===`);
 if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
 const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
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
//----------------------------------------------------------------------------------
// Setup some specific global values
//
const MINION = "%Mordenkainen's Sword%"
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
    let houndInfo = await summonHound()
    jez.log("Hound Info", houndInfo)
    addWatchdogEffect(houndInfo);
    msg = `<b>${aToken.name}</b> has summoned an <b>Arcane Sword</b> to his/her service`
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Summon the minion and update HP
 * 
 * https://github.com/trioderegion/warpgate
 ***************************************************************************************************/
async function summonHound() {
    // const CAST_MOD = jez.getCastMod(aToken);
    // const PROF_MOD = jez.getProfMod(aToken);
    const CHAR_LVL = jez.getCharLevel(aToken);
    const NAME = `${aToken.name.split(" ")[0]}'s Arcane Sword`
    // const SPELL_LVL = args[0].spellLevel
    const CAST_STAT = aActor.data.data.abilities[jez.getCastStat(aToken)].value
    //-----------------------------------------------------------------------------------------------
    //
    //
    let updates = {
        token: { name: NAME },
        actor: { // Borrowed from Arcane_Hand.js
          name: NAME,
          'data.details.cr': CHAR_LVL,            // Set CR to make weapon's proficency bonus match the casters
          'data.abilities.str.value': CAST_STAT,  // Make weapon's cast stat match casters
      },
        // embedded: {
        //     Item: {
        //         "Attack": {
        //            'data.damage.parts' : [[`${1 + Math.floor((SPELL_LVL - 2) / 2)}d8 + ${CAST_MOD}`, "force"]]
        //         }
        //     }
        // }
    }
    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
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
    //-----------------------------------------------------------------------------------------------
    // Get and set maximum sumoning range
    //
    const ALLOWED_UNITS = ["", "ft", "any"];
    if (TL > 1) jez.trace("ALLOWED_UNITS",ALLOWED_UNITS);
    const MAX_RANGE = jez.getRange(aItem, ALLOWED_UNITS) ?? 30
    //-----------------------------------------------------------------------------------------------
    // Obtan location for spawn
    //
    let summonData = game.actors.getName(MINION)
    if (TL > 1) jez.trace("summonData",summonData);
    let {x,y} = await jez.warpCrosshairs(aToken,MAX_RANGE,summonData.img,aItem.name,{},-1,{traceLvl:TL})
    //-----------------------------------------------------------------------------------------------
    // Suppress Token Mold for a wee bit
    //
    jez.suppressTokenMoldRenaming(1000) 
    await jez.wait(100) 
    //-----------------------------------------------------------------------------------------------
    // Return while executing the summon
    //
    return (await warpgate.spawnAt({ x, y }, MINION, updates, CALLBACKS, OPTIONS));
  }
  /***************************************************************************************************
   * 
   ***************************************************************************************************/
   async function preEffects(template) {
    const VFX_FILE = "jb2a.explosion.07.bluewhite"
    new Sequence()
      .effect()
      .file(VFX_FILE)
      .atLocation(template)
      .center()
      .scale(0.25)
      .opacity(0.75)
      .play()
  }
  /***************************************************************************************************
   * 
   ***************************************************************************************************/
   async function postEffects(template) {
    const VFX_OPACITY = 1.0
    const VFX_SCALE = 1.0
    const VFX_FILE = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Regular_Blue_400x400.webm"
    new Sequence()
      .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE*.5)
        .opacity(VFX_OPACITY*0.75)
        .waitUntilFinished(-1000) 
    .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE*.75)
        .opacity(VFX_OPACITY*0.5)
        .waitUntilFinished(-1000) 
    .effect()
        .file(VFX_FILE)
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
    const CE_DESC = `Mordenkainen's Sword is Active`
    const EXPIRE = ["newDay", "longRest", "shortRest"];
    const GAME_RND = game.combat ? game.combat.round : 0;
    // Build list of token IDs seperated by spaces
    for (let i = 0; i < tokenIdArray.length; i++) tokenIds+= `${tokenIdArray[i]} ` 
    let effectData = {
      label: aItem.name,
      icon: aItem.img,
      origin: LAST_ARG.uuid,
      disabled: false,
      duration: { rounds: 10, startRound: GAME_RND, seconds: 60, startTime: game.time.worldTime },
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