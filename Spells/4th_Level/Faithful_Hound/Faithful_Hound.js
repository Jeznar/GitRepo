const MACRONAME = "Faithful_Hound.0.3.js"
/*****************************************************************************************
 * Summon a Faithful Hound to the current scene.  Some key points:
 * 
 * - Summon with WarpGate
 * - Modify Bite ability to have correct to-hit bonus
 * - Delete summon when effect on original caster is removed (or expires)
 * 
 * 02/11/22 0.1 Creation of Macro
 * 07/15/22 0.2 Suppress Tokenmold and limit range of summoning
 * 08/02/22 0.3 Add convenientDescription
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
const TL = 5;                               // Trace Level for this macro
//----------------------------------------------------------------------------------
// Setup some specific global values
//
const MINION = `%Faithful Hound%`;
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
    msg = `${aToken.name} conjures a phantom watchdog in an unoccupied space.`
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
    const CAST_MOD = jez.getCastMod(aToken);
    const PROF_MOD = jez.getProfMod(aToken);
    const NAME = `${aToken.name}'s Faithful Hound`
    //-----------------------------------------------------------------------------------------------
    //
    //
    // Below based on: https://github.com/trioderegion/warpgate/wiki/Summon-Spiritual-Badger
    let updates = {
        token: { name: NAME },
        actor: { name: NAME },
        embedded: {
            Item: {
                "Bite, Faithful Hound": {
                    'data.damage.parts': [[`4d8`, "piercing"]],
                    'data.attackBonus': `${CAST_MOD}[mod] + ${PROF_MOD}[prof]`,    // 5[mod] + 3[prof]
                },
            }
        }
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
    const CE_DESC = `Faithful Hound is Active`
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