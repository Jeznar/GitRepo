const MACRONAME = "VileIncubator.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Implement the placement of spider spawns from the Vile Incubator ability. 
 * Built from Magehand.0.8.js (4/22/23)
 * 
 *   When the Thrall of Drizlash is reduced to half its hit points, its abdomen bursts open and two 
 *   giant spiders emerge to join the fight as its allies.
 * 
 * 08/21/23 0.1 Creation
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 0;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //---------------------------------------------------------------------------------------------------
 if (TL>0) jez.trace(`${TAG} === Starting ===`);
 if (TL>1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
 const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
 //---------------------------------------------------------------------------------------------------
 // Set standard variables
 let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
 let aActor = aToken.actor; 
 let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
 const VERSION = Math.floor(game.VERSION);
 const GAME_RND = game.combat ? game.combat.round : 0;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const MINION = "Giant Spider"
//--------------------------------------------------------------------------------------------------
// Build the dataObject for our summon call
//
let argObj = {
    defaultRange: 15,                   // Defaults to 30, but this varies per spell
    duration: 1000,                     // Duration of the intro VFX
    img: aItem.img,                     // Image to use on the summon location cursor
    introTime: 1000,                     // Amount of time to wait for Intro VFX
    introVFX:  '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
    minionName: MINION,
    name: aItem.name,                   // Name of action (message only), typically aItem.name
    outroVFX: '~Smoke/SmokePuff01_*_${color}_400x400.webm', // default outroVFX file
    source: aToken,                     // Coords for source (with a center), typically aToken
    width: 2,                           // Width of token to be summoned, 1 is the default
    traceLvl: 0,                        // Trace level, matching calling function decent choice
    templateName: MINION,
}
//-------------------------------------------------------------------------------------------------------------------------------
const ATOKEN_INIT_VALUE = aToken?.combatant?.data?.initiative // Get initiative value, if any
if (TL > 1) jez.trace(`${TAG} ${aToken.name} initiative`, ATOKEN_INIT_VALUE);
for (let i = 1; i < 3; i++) {
    argObj.minionName = MINION + ' ' + i;
    const HAND_TOKEN_ID = (await jez.spawnAt(MINION, aToken, aActor, aItem, argObj))[0]
    //-------------------------------------------------------------------------------------------------------------------------------
    // Add our Summoned critter to combat tracker immediately after summoner if in combat
    //
    if (ATOKEN_INIT_VALUE) {
        const WFS_INIT = ATOKEN_INIT_VALUE - (i * 0.001)
        await jez.combatAddRemove('Add', HAND_TOKEN_ID, { traceLvl: TL })
        await jez.wait(500)
        await jez.combatInitiative(HAND_TOKEN_ID, { formula: WFS_INIT, traceLvl: 0 })
    }
}
//-------------------------------------------------------------------------------------------------------------------------------
// Post message
//
let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
msg = `<b>${aToken.name}</b> spawns two ${MINION}</b>.`;
jez.addMessage(chatMessage, { color: jez.randomDarkColor(), fSize: 15, msg: msg, tag: "saves" })
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