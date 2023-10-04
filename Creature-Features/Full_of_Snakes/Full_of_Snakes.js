const MACRONAME = "Full_of_Snakes.0.2.js"
const TL = 0;                               // Trace Level for this macro
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implement the full of snakes ability
 * 
 *   When the corpse is reduced to 0 hit points, it splits open, disgorging a  Swarm of Poisonous Snakes that attack immediately.
 * 
 * 10/04/23 0.1 Creation
 * 10/04/23 0.2 Added random choice of three swarms
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.log(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
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
const MINIONS = ['Swarm of Poisonous Snakes', 'Swarm of Garden Snakes', 'Swarm of Constricting Snakes' ]
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.log(`${TAG} === Finished ===`);
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
    if (TL > 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 2) jez.log("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Is our current actor dead?  That is does it have zero health?
    //
    if (aActor.data.data.attributes.hp.value > 0) return postResults(`Sorry(?), ${aToken.name} is not dead!`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Spin through the MINIONS, getting data objects for all that exist, log those missing.
    //
    let minions = []
    for (i = 0; i < MINIONS.length; i++) {
        const MINION_DATA = await game.actors.getName(MINIONS[i])
        if (MINION_DATA) minions.push(MINION_DATA)
        else jez.badNews(`Could not find actor template for "${MINIONS[i]}"`,'w')
    }
    if (minions.length === 0) return jez.badNews(`Could not find any actor templates`,'e')
    else if (TL > 1) jez.log(`${TAG} ${minions.length} minion options`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Randomly pick a minion and put it in constants used for summon
    //
    const INDEX = Math.floor(Math.random()*minions.length)
    const MINION_DATA = minions[INDEX]
    if (TL > 2) jez.log(`${TAG} MINION_DATA`, MINION_DATA)
    const MINION = MINION_DATA.name
    if (TL > 2) jez.log(`${TAG} MINION`, MINION)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call, all we need to do is customize the name and elevation
    //
    let argObj = {
        minionName: MINION_DATA.data.token.name,
        img: MINION_DATA?.img ?? aItem.img,
        defaultRange: 5    // Keep the up chucked undead kinda close
    }
    if (TL > 2) jez.log(`${TAG} argObj`, argObj)
    // Do the actual summon
    summonedMinionId = await jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
    if (TL > 2) jez.log(`${TAG} summonedMinionId`, summonedMinionId)
    // Add our summons to combat tracker immediately after the current actor
    // first we need the current actor in combat...
    //
    const CURRENT_ACTOR = game.combat?.combatant?.actor   // Returns an Actor5e
    // const CURRENT_INIT_VALUE = aToken?.combatant?.data?.initiative
    const CURRENT_INIT_VALUE = CURRENT_ACTOR?.parent?.combatant?.data?.initiative
    if (TL > 1) jez.log(`${TAG} ${aToken.name} current initiative`, CURRENT_INIT_VALUE);
    if (CURRENT_INIT_VALUE) {
        const SPAWN_INT = CURRENT_INIT_VALUE - 1 / 1000;
        await jez.combatAddRemove('Add', summonedMinionId[0], { traceLvl: TL })
        await jez.wait(250)
        await jez.combatInitiative(summonedMinionId[0], { formula: SPAWN_INT, traceLvl: 0 })
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 0) jez.log(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Place an zombie under control of the flower near the flower 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function placeUndead(aToken, options = {}) {
    const FUNCNAME = "placeUndead(aToken, options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "aToken", aToken, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    let MINION = "Zombie"
    //-------------------------------------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //



    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
}