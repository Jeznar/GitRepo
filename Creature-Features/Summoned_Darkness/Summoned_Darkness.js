const MACRONAME = "Summoned_Darkness.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * This is an ability for the Tricksy Fey:
 * 
 *   Immediately after using  Fey Step, a 5 foot radius sphere of darkness may be summoned into an adjacent space. The darkness 
 *   remains until the end of your next turn.
 * 
 * 12/17/22 0.1 Created from Magehand.0.7
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
const MINION = "Summoned Darkness, 5 Foot"
const MINION_NAME = `Tricksy Darkness`
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (args[0].targets.length !== 1)
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, 'w')
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
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
    //-------------------------------------------------------------------------------------------------------------------------------
    // Portals need the same color for pre and post effects, so get that set here. Even though only used
    // when we are doing portals.  This is needed to force the same choice for pre and post VFX.
    //
    const PORTAL_COLORS = [ "Dark_Blue", "Dark_Green", "Dark_Purple", "Dark_Red", "Dark_RedYellow", "Dark_Yellow" ]
    let index = Math.floor((Math.random() * PORTAL_COLORS.length))
    let portalColor = PORTAL_COLORS[index]
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        defaultRange: 5,                   // Defaults to 30, but this varies per spell
        duration: 4000,                     // Duration of the intro VFX
        img: aItem.img,                     // Image to use on the summon location cursor
        introTime: 250,                     // Amount of time to wait for Intro VFX
        introVFX: `~Portals/Portal_${portalColor}_H_400x400.webm`, // default introVFX file
        templateName: MINION, 
        minionName: MINION_NAME,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: `~Portals/Masked/Portal_${portalColor}_H_NoBG_400x400.webm`, // default outroVFX file
        source: aToken,                     // Coords for source (with a center), typically aToken
        width: 1,                           // Width of token to be summoned, 1 is the default
        traceLvl: TL                        // Trace level, matching calling function decent choice
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Set up Portal effect
    //
    argObj.duration = 4000
    argObj.introTime = 250
    argObj.introVFX = `~Portals/Portal_${portalColor}_H_400x400.webm`
    argObj.outroVFX = `~Portals/Masked/Portal_${portalColor}_H_NoBG_400x400.webm`
    if (TL > 2) for (let key in argObj) jez.trace(`${MACRO} | argObj.${key}`, argObj[key])
    //-------------------------------------------------------------------------------------------------------------------------------
    const SPAWN_ARRAY = await jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
    const DARKNESS_TOKEN_ID = SPAWN_ARRAY[0]
    if (TL > 1) jez.trace(`${TAG} jez.spawnAt returned`,DARKNESS_TOKEN_ID)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Add an effect that expires at the end of the Fey's next turn (in combat) which will trigger doOff and delete the summoned
    // darkness token.
    //
    const EXPIRE = ["turnStart", "newDay", "longRest", "shortRest"];
    const CE_DESC = `Darkness lasts but only 6 seconds`
    let effectData = {
      label: aItem.name,
      icon: aItem.img,
      origin: L_ARG.uuid,
      disabled: false,
      duration: { seconds: 12, startTime: game.time.worldTime },
      flags: { 
        dae: { macroRepeat: "none", specialDuration: EXPIRE }, 
        convenientDescription: CE_DESC 
      },
      changes: [
           { key: `macro.execute`, mode: jez.ADD, value: `DeleteTokenMacro ${DARKNESS_TOKEN_ID}`, priority: 20 },
      ]
    };
    if (TL > 1) jez.trace(`${FNAME} | effectData`,effectData);
    if (TL > 3) jez.trace(`${FNAME} | MidiQOL.socket().executeAsGM("createEffects"`,"aToken.actor.uuid",
    aToken.actor.uuid,"effectData",effectData);
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });  
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `Maybe say something useful...`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}

//-------------------------------------------------------------------------------------------------
// Search for pre-existing magehand, if found, despawn it.
//
// let previousSummon = canvas.tokens.placeables.find(ef => ef.name === MINION_NAME)
// if (previousSummon) warpgate.dismiss(previousSummon.id, game.scenes.viewed.id)



//-------------------------------------------------------------------------------------------------
// Post message
//
// let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
// msg = `<b>${aToken.name}</b> summons <b>${MINION_NAME}</b> to the field.`;
// jez.addMessage(chatMessage, { color: jez.randomDarkColor(), fSize: 15, msg: msg, tag: "saves" })
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/