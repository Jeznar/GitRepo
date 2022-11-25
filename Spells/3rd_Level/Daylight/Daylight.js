const MACRONAME = "Daylight.0.2.js"
/*****************************************************************************************
 * Summon Daylight to the field.
 * 
 * 12/01/21 0.1 Creation of Macro
 * 11/24/22 0.2 Flow review and add more current structure
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const DEBUG = false;
const MINION = "Daylight"
const CLOCK_IMG = "Icons_JGB/Misc/alarm_clock.png"
//--------------------------------------------------------------------------------------
// Verify the Actor named as MINION exists
//
if (!game.actors.getName(MINION)) {   // If MINION not found, that's all folks
    msg = `Could not find "<b>${MINION}</b>" in the <b>Actors Directory</b>. 
        <br><br>Can not complete the ${aItem.name} action.`;
    postResults(msg);
    return (false);
}
//--------------------------------------------------------------------------------------------------
// Build the dataObject for our summon call
//
let argObj = {
    defaultRange: 60,                   // Defaults to 30, but this varies per spell
    duration: 1000,                     // Duration of the intro VFX
    introTime: 1000,                     // Amount of time to wait for Intro VFX
    introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
    minionName: MINION,
    name: aItem.name,                   // Name of action (message only), typically aItem.name
    templateName: MINION,	
    outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
    scale: 0.7,								// Default value but needs tuning at times
    source: aToken,                     // Coords for source (with a center), typically aToken
    width: 1,                           // Width of token to be summoned, 1 is the default
    traceLvl: TL                        // Trace level, matching calling function decent choice
}
//--------------------------------------------------------------------------------------------------
// Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
// to update the img attribute or set basic image to match this item
//
let summonData = await game.actors.getName(MINION)
argObj.img = summonData ? summonData.img : aItem.img
//--------------------------------------------------------------------------------------------------
// Do the actual summon
//
const MINION_ID_ARRAY = await jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
const MINION_UUID = `Scene.${game.scenes.viewed.id}.Token.${MINION_ID_ARRAY}`
if (TL > 1) jez.trace(`${TAG} Minon ID Info`,
    'MINION_ID_ARRAY', MINION_ID_ARRAY,
    'MINION_UUID', MINION_UUID)
//--------------------------------------------------------------------------------------------------
// Convert Item Card's duration into seconds, if supported units, otherwise go with 3600
//
let duration = 3600
if (aItem.data.duration.units === "turn") duration = aItem.data.duration.value * 6
if (aItem.data.duration.units === "round") duration = aItem.data.duration.value * 6
if (aItem.data.duration.units === "minute") duration = aItem.data.duration.value * 60
if (aItem.data.duration.units === "hour") duration = aItem.data.duration.value * 3600
if (TL > 1) jez.trace('${TAG} duration', duration)
//--------------------------------------------------------------------------------------------------
// Add an effect to our recently summoned MINION to delete itself at the end of the spell duration
//
const CE_DESC = `Summoned ${MINION} will remain for up to an hour`
const EXPIRE = ["newDay", "longRest", "shortRest"];
// const VALUE = `"${aToken.name}" ${SAVE_DC} ${mode}`
const GAME_RND = game.combat ? game.combat.round : 0;
if (TL > 2) jez.trace('${TAG} Effect Inputs',
    "CE_DESC", CE_DESC,
    "EXPIRE", EXPIRE,
    "GAME_RND", GAME_RND)
let effectData = {
    label: aItem.name,
    icon: CLOCK_IMG,
    origin: LAST_ARG.uuid,
    disabled: false,
    duration: {
        rounds: duration / 6, startRound: GAME_RND,
        seconds: duration, startTime: game.time.worldTime,
        token: aToken.uuid, stackable: false
    },
    flags: {
        dae: { macroRepeat: "endEveryTurn", specialDuration: EXPIRE },
        convenientDescription: CE_DESC
    },
    changes: [
        { key: `macro.execute`, mode: jez.CUSTOM, value: `Dismiss_Tokens ${MINION_UUID}`, priority: 20 },
        // { key: `macro.itemMacro`, mode: jez.OVERRIDE, value: '', priority: 20 }
    ]
};
if (TL > 2) jez.trace('${TAG} effectData',effectData)
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: MINION_UUID, effects: [effectData] });
//---------------------------------------------------------------------------------------------------
// await warpgate.spawn(MINION);
let message = `<strong>${actor.name}</strong> summons <strong>${MINION}</strong> to the field.`;
postResults(message);
return;


/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * 
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG}--- Finished ---`);
}