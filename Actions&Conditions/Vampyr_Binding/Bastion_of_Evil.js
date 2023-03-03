const MACRONAME = "Bastion_of_Evil.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Summon Vampire Spawns!
 * 
 * 01/12/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const VAMP_NAME = "Vampire Spawn"
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //---------------------------------------------------------------------------------------------------
    // Make sure actors that may be summoned exist and are unique before continuing
    //
    if (!game.actors.getName(VAMP_NAME))
        return jez.badNews(`Could not find "<b>${VAMP_NAME}</b>" in the <b>Actors Directory</b>. Quiting`)
    //---------------------------------------------------------------------------------------------------
    // Determine how many critters can be summoned 
    //
    let d4Roll = new Roll(`1d4`).evaluate({ async: false });
    game.dice3d?.showForRoll(d4Roll);
    let summonMax = d4Roll.total - 1
    if (TL > 1) jez.trace(`${TAG} Ready to summon ${summonMax} ${VAMP_NAME}`, d4Roll)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `${summonMax} Vampire Spawn(s) are called to service.`
    postResults(msg)
    //--------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        defaultRange: 300,                   // Defaults to 30, but this varies per spell
        duration: 1000,                     // Duration of the intro VFX
        introTime: 1000,                     // Amount of time to wait for Intro VFX
        introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
        minionName: `${VAMP_NAME} ${GAME_RND}`,
        templateName: VAMP_NAME,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        scale: 0.7,								// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        //updates: updates,
        width: 1,                           // Width of token to be summoned, 1 is the default
        traceLvl: TL                        // Trace level, matching calling function decent choice
    }
    //--------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and ues it
    // to update the img attribute or set basic image to match this item
    //
    let summonData = await game.actors.getName(VAMP_NAME)
    argObj.img = summonData ? summonData.img : aItem.img
    //-------------------------------------------------------------------------------------------------------------------------------
    // Summon Vamp Spawns 
    //
    let SPAWNED_IDS = []
    for (let i = 0; i < summonMax; i++) {
        argObj.minionName =  `${VAMP_NAME} ${GAME_RND}-${i+1}`
        let SPAWN_ID = await jez.spawnAt(VAMP_NAME, aToken, aActor, aItem, argObj)
        SPAWNED_IDS.push(SPAWN_ID[0])
    }
    if (TL > 1) jez.trace(`${TAG} SPAWNED_IDS`,SPAWNED_IDS)
    await jez.combatAddRemove('Add', SPAWNED_IDS, { traceLvl: TL })               // Add demon to combat
    await jez.wait(100)
    await jez.combatInitiative(SPAWNED_IDS, { formula: null, traceLvl: 0 })   // Roll demon initiative
    //-------------------------------------------------------------------------------------------------------------------------------
    // all done
    //
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}