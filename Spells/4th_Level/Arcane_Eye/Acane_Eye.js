const MACRONAME = "Arcane_Eye.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Call a token via warpgate, most interesting element is the use of jez.warpCrosshairs to control
 * how far away the token can be summoned.
 * 
 * 07/15/22 0.1 Creation of Macro
 * 08/02/22 0.2 Add convenientDescription
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
const MINION = `%ArcaneEye%`;
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
    if (TL === 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    //
    if (!game.modules.get("warpgate")?.active) 
        return jez.badNews("Please enable the Warp Gate module", "error")
    //--------------------------------------------------------------------------------------
    // Verify our Minion's Actor exists
    //
    const MINION_DATA = game.actors.getName(MINION)
    if (!MINION_DATA) 
        return jez.badNews(`Could not find ${MINION} in the Actors Directory`,error)
    if (TL > 2) jez.trace(`MINION_DATA`,MINION_DATA);
    //--------------------------------------------------------------------------------------
    // Perform the actual summon
    //
    let summonedID = await summonArcaneEye(MINION_DATA.img)
    //--------------------------------------------------------------------------------------
    // Add watchdog effect to despawn summoned token at expiration (1 hour) via doOff 
    //
    const CE_DESC = `Conjured Arcane Eye is Active`
    const EXPIRE = ["newDay", "longRest", "shortRest"];
    const GAME_RND = game.combat ? game.combat.round : 0;
    let effectData = {
      label: aItem.name,
      icon: aItem.img,
      origin: LAST_ARG.uuid,
      disabled: false,
      duration: { 
          rounds: 600, startRound: GAME_RND, 
          seconds: 3600,  startTime: game.time.worldTime, 
          token: aToken.uuid, stackable: false 
        },
      flags: { 
        dae: { macroRepeat: "none", specialDuration: EXPIRE },
        convenientDescription: CE_DESC
      },
      changes: [
        { key: `macro.itemMacro`, mode: jez.ADD, value: summonedID, priority: 20 },
      ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });
    //-----------------------------------------------------------------------------------------------
    // post summary effect message
    //
    msg = `${aToken.name} creates an invisible, magical eye that hovers in the air for the duration 
    providing darkvision with 30 feet.  See spell description for more.`
    postResults(msg)
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}
/***************************************************************************************************
 * Summon the minion and update 
 ***************************************************************************************************/
async function summonArcaneEye(texture) {
    const FUNCNAME = "summonArcaneEye(texture)";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL === 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`,"texture",texture);
    //-----------------------------------------------------------------------------------------------
    //
    const ALLOWED_UNITS = ["", "ft", "any"];
    if (TL > 1) jez.trace("ALLOWED_UNITS",ALLOWED_UNITS);
    let updates = {
        token: { name: `${aToken.name}'s Arcane Eye` },
        actor: { name: `${aToken.name}'s Arcane Eye` }
    }
    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
    const CALLBACKS = {
        pre: async (template) => {
          jez.vfxPreSummonEffects(template, {color:"*", scale:0.5, opacity:1});
          await warpgate.wait(500);
        },
        post: async (template) => {
          jez.vfxPostSummonEffects(template, {color:"*", scale:0.5, opacity:1});
          await warpgate.wait(500); 
        }
      };
    //------------------------------------------------------------------------------------------------
    // COOL-THING:  Macro that runs displays a range name below the summoning crosshairs
    //
    const MAX_RANGE = jez.getRange(aItem, ALLOWED_UNITS) ?? 30
    let { x, y } = await jez.warpCrosshairs(aToken, MAX_RANGE, texture, aItem.name, {}, -1, { traceLvl: TL })
    //------------------------------------------------------------------------------------------------
    // Suppress token mold's renaming of tokens
    //
    jez.suppressTokenMoldRenaming(1500, { traceLvl: TL }) 
    await jez.wait(100)             // Wait a bit for TokenMold to be suppressed
    //------------------------------------------------------------------------------------------------
    // Spawn in that token
    //
    if (TL>2) jez.trace(`Calling warpgate.spawnAt({ x, y }, MINION, updates, { controllingActor: aActor }, OPTIONS)`,
    "x",x,"y",y,"MINION",MINION,"updates",updates,"aActor",aActor,"OPTIONS",OPTIONS );
    let returnValue = await warpgate.spawnAt({ x, y }, MINION, updates, CALLBACKS, OPTIONS);
    //------------------------------------------------------------------------------------------------
    // That's it, say goodbye
    //
    if (TL>1) jez.trace(`warpgate.spawnAt(...) returning`,returnValue)
    if (TL>0) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return returnValue
}