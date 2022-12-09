const MACRONAME = "Magehand.0.7.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro just posts a msg providing basic instructions to teh spell card.
 * 
 * 12/02/21 0.1 Creation
 * 12/02/21 0.2 Drastic simplification and resouce consumption can be handled by base code
 * 02/25/22 0.3 Update to use jez.lib and rename the summoned hand
 * 05/25/22 0.4 Chasing Error: Sequencer | Effect | attachTo - could not find given object
 *              Issue was caused by a conflict with TokenMold/Name.  Now handled with a 
 *              warning.
 * 07/15/22 0.5 Update to use warpgate.spawnAt with range limitation and suppress tokenmold
 * 07/15/22 0.6 Build library function to generalize the warpgate.spawnAt thang
 * 12/09/22 0.7 Despawn (delete, dismiss) one existing magehand from this actor
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
const MINION = "Magehand"
const MINION_NAME = `${aToken.name}'s Magehand`
//-------------------------------------------------------------------------------------------------
// Search for pre-existing magehand, if found, despawn it.
//
let previousSummon = canvas.tokens.placeables.find(ef => ef.name === MINION_NAME)
if (previousSummon) warpgate.dismiss(previousSummon.id, game.scenes.viewed.id)
//--------------------------------------------------------------------------------------------------
// Portals need the same color for pre and post effects, so get that set here. Even though only used
// when we are doing portals.  This is needed to force the same choice for pre and post VFX.
//
const PORTAL_COLORS = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple", "Dark_Red",
"Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange", "Bright_Purple", "Bright_Red", 
"Bright_Yellow"]
let index = Math.floor((Math.random() * PORTAL_COLORS.length))
let portalColor = PORTAL_COLORS[index]
//--------------------------------------------------------------------------------------------------
// Build the dataObject for our summon call
//
let argObj = {
    defaultRange: 30,                   // Defaults to 30, but this varies per spell
    duration: 4000,                     // Duration of the intro VFX
    img: aItem.img,                     // Image to use on the summon location cursor
    introTime: 250,                     // Amount of time to wait for Intro VFX
    introVFX: `~Portals/Portal_${portalColor}_H_400x400.webm`, // default introVFX file
    name: aItem.name,                   // Name of action (message only), typically aItem.name
    outroVFX: `~Portals/Masked/Portal_${portalColor}_H_NoBG_400x400.webm`, // default outroVFX file
    source: aToken,                     // Coords for source (with a center), typically aToken
    width: 1,                           // Width of token to be summoned, 1 is the default
    traceLvl: TL                        // Trace level, matching calling function decent choice
}
//-------------------------------------------------------------------------------------------------
// Set up one of the three spawn effects tested: (1) Explosion, (2) Portal, (3) Firework
// modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_01_Dark_Black_400x400.webm and pick one
// at psuedo Random
//
const EFFECT = Math.floor(Math.random() * 3) + 1
switch (EFFECT) {
    case 1:
        argObj.duration = 1000
        argObj.introTime = 1000
        argObj.introVFX = '~Explosion/Explosion_01_${color}_400x400.webm'
        argObj.outroVFX = '~Smoke/SmokePuff01_*_${color}_400x400.webm'
        break;
    case 2:
        argObj.duration = 4000
        argObj.introTime = 250
        argObj.introVFX = `~Portals/Portal_${portalColor}_H_400x400.webm`
        argObj.outroVFX = `~Portals/Masked/Portal_${portalColor}_H_NoBG_400x400.webm`
        break;
    case 3:
        argObj.duration = 3000
        argObj.introTime = 1000
        argObj.introVFX = '~Energy/SwirlingSparkles_01_Regular_${color}_400x400.webm'
        argObj.outroVFX = '~Fireworks/Firework*_02_Regular_${color}_600x600.webm'
        break;
    default:
        jez.badNews("Really, you couldn't pick one of the three defined effects?","warn")
}
if (TL > 2) 
    for (let key in argObj) jez.trace(`${MACRO} | argObj.${key}`, argObj[key])
//-------------------------------------------------------------------------------------------------
jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
//-------------------------------------------------------------------------------------------------
// Post message
//
let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
msg = `<b>${aToken.name}</b> summons <b>${MINION_NAME}</b> to the field.`;
jez.addMessage(chatMessage, { color: jez.randomDarkColor(), fSize: 15, msg: msg, tag: "saves" })
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/