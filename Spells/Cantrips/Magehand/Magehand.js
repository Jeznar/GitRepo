const MACRONAME = "Magehand.0.8.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro just posts a msg providing basic instructions to the spell card.
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
 * 04/22/23 0.8 Add the "Mage Hand, Control" action for duration of this spell effect and add a 
 *              timer to the summoned mage hand.
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
const FEATURE_NAME = 'Mage Hand Legerdemain'
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
        argObj.traceLvl = 0
        break;
    case 2:
        argObj.duration = 4000
        argObj.introTime = 250
        argObj.introVFX = `~Portals/Portal_${portalColor}_H_400x400.webm`
        argObj.outroVFX = `~Portals/Masked/Portal_${portalColor}_H_NoBG_400x400.webm`
        argObj.traceLvl = 0
        break;
    case 3:
        argObj.duration = 3000
        argObj.introTime = 1000
        argObj.introVFX = '~Energy/SwirlingSparkles_01_Regular_${color}_400x400.webm'
        argObj.outroVFX = '~Fireworks/Firework*_02_Regular_${color}_600x600.webm'
        argObj.traceLvl = 0
        break;
    default:
        jez.badNews("Really, you couldn't pick one of the three defined effects?","warn")
}
if (TL > 2) for (let key in argObj) jez.trace(`${MACRO} | argObj.${key}`, argObj[key])
//-------------------------------------------------------------------------------------------------
const HAND_TOKEN_ID = (await jez.spawnAt(MINION, aToken, aActor, aItem, argObj))[0]
if (TL>1) jez.log(`${TAG} HAND_TOKEN_ID`, HAND_TOKEN_ID)
//-------------------------------------------------------------------------------------------------------------------------------
// Add timer to delete the summoned  creature at the appropriate time:
// RAW: "familiar disappears after a number of hours equal to half your druid level."
//
await jez.wait(125)
await addTimerEffect(HAND_TOKEN_ID, MINION_NAME, 60, { traceLvl: TL })
//---------------------------------------------------------------------------------------------------------------------------
// Add temp ability to control the mage hand
//
const CONTROL_ABILITY = 'Mage Hand, Control'
await jez.deleteItems(CONTROL_ABILITY, "spell", aToken); // Remove previously existing temp ability
await jez.itemAddToActor(aToken, CONTROL_ABILITY)
jez.badNews(`Added '${CONTROL_ABILITY}' as a feature, active action to ${aToken.name}`, "i");
//---------------------------------------------------------------------------------------------------------------------------
// If our actor has "Mage Hand Legerdemain" modify the action to require a bonus action
//
await jez.wait(1000)
const FEATURE = aActor.itemTypes.feat.find(item => [FEATURE_NAME.toLowerCase()].some(x => (item.name).toLowerCase().includes(x)));
if (TL > 2) jez.trace(`${TAG} FEATURE`, FEATURE)
if (FEATURE) {
    const DESC_LEGERDEMAIN = `<p>You can use your <b>bonus action</b> to control the hand.</p>
    <p>The hand can manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, 
    or pour the contents out of a vial. You can move the hand up to 30 feet each time you use it.</p>
    <p>The hand can't attack, activate magic items, or carry more than 10 pounds.</p>`
    const ITEM_UPDATE = { 
        'data.activation.type': 'bonus',
        'data.description.value': DESC_LEGERDEMAIN
    }
    let aActorItem = await jez.itemFindOnActor(aToken, CONTROL_ABILITY, "spell")
    console.log(await aActorItem.update(ITEM_UPDATE)) // jez.itemUpdateOnActor was being uncooperative
}
//-------------------------------------------------------------------------------------------------------------------------------
// Post message
//
let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
msg = `<b>${aToken.name}</b> summons <b>${MINION_NAME}</b> to the field.`;
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
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Add an effect to our recently summoned familiar to delete itself at the end of the spell duration
 * 
 * Expected input is a single token id and the name of the familiar
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function addTimerEffect(tokenId, famName, seconds, options = {}) {
    const FUNCNAME = "addTimerEffect(tokenId, famName, seconds, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} Starting --- `);
    if (TL > 1) jez.trace(`${TAG} Starting ---`, "tokenId", tokenId, "famName", famName,'seconds', seconds, 'options', options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Set function variables/constants
    //
    // const CLOCK_IMG = "Icons_JGB/Misc/alarm_clock.png" -- Nice clock icon
    const CLOCK_IMG = ""    // Causes icon to not appear in scene
    const CE_DESC = `Summoned ${famName} will remain for up to ${seconds} seconds`
    //-------------------------------------------------------------------------------------------------------------------------------
    // Need the actor UUID for the passed TokenID
    //
    const TOKEN5E = canvas.tokens.placeables.find(ef => ef.id === tokenId)
    const ACTOR_UUID = TOKEN5E.actor.uuid
    if (TL > 1) jez.trace(`${TAG} ACTOR_UUID`,ACTOR_UUID)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Proceed!
    //
    let effectData = {
        label: aItem.name,
        icon: CLOCK_IMG,
        origin: L_ARG.uuid,
        disabled: false,
        duration: {
            rounds: seconds / 6, startRound: GAME_RND,
            seconds: seconds, startTime: game.time.worldTime,
            token: aToken.uuid, stackable: false
        },
        flags: { 
            convenientDescription: CE_DESC 
        },
        changes: [
            { key: `macro.execute`, mode: jez.CUSTOM, value: `Dismiss_Tokens ${tokenId}`, priority: 20 },
        ]
    };
    if (TL > 1) jez.trace(`${TAG} effectData`,effectData)
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: ACTOR_UUID, effects: [effectData] });
}