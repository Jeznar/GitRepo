const MACRONAME = "No_Obstructions_In_Ravenloft.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Strahd's Lair Ability to pass through obstructions.  This is intended to be run from a Lair 
 * Action token. All it does is mark the effect on Strahd and remove it at the appropriate time.
 * 
 *   Until initiative count 20 of the next round, Strahd can pass through solid walls, doors, 
 *   ceilings, and floors as if they weren't there.
 * 
 * This macro runs as an OnUse macro and assumes the item card does nothing other than launchng it.
 * 
 * - Find the OWNER of the lair action (Strahd)
 * - Apply EFFECT_NAME to OWNER
 * - Post Appropriate message
 * 
 * 11/16/22 0.1 Creation of Macro from Stolen_Shadow.0.2.js
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
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
const ALLOWED_UNITS = ["", "ft", "any"];    // Assume blank and any is feet
const EFFECT_NAME = `No Obstructions`
const EFFECT_ICON = 'Icons_JGB/Monster_Features/VIP_Pass.png'
const OWNER = "Strahd"
if (TL > 2) jez.trace(`${TAG} Variable Values`,
    `EFFECT_NAME   ==>`, EFFECT_NAME,
    `EFFECT_ICON   ==>`, EFFECT_ICON,
    `MINION        ==>`, MINION);
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
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
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    //  Need to find a token named OWNER which will be used as the origin token (oToken)
    //
    let oToken = canvas.tokens.placeables.find(ef => ef.name === OWNER)
    if (TL > 2) jez.trace(`${TAG} Origin token, ${oToken.name}`,oToken)
    if (!oToken) {
        msg = `Origin token for Lair Action, ${oToken.name}, could not be found in scene.`
        postResults(msg)
        return jez.badNews(msg, "w")
    }
    //-----------------------------------------------------------------------------------------------
    // Check for presence of debuff EFFECT that serves as an immunity marker
    //
    if (jezcon.hasCE(EFFECT_NAME, oToken.actor.uuid, { traceLvl: 0 })) {
        msg = `${oToken.name} already has the ${EFFECT_NAME} effect.`
        postResults(msg)
        return jez.badNews(msg, "i")
    }
    //-----------------------------------------------------------------------------------------------
    // Define and apply EFFECT to the ORIGIN 
    //
    let specDur = ["turnStartSource", "longRest", "shortRest"]
    let effectData = {
        label: EFFECT_NAME,
        icon: EFFECT_ICON,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 1, startRound: GAME_RND },
        flags: { 
            dae: { 
                itemData: aItem, 
                specialDuration: specDur 
            },
            isConvenient: true,
            isCustomConvenient: true,
            convenientDescription: `${oToken.name} can pass through solid walls, doors, ceilings, and floors as if not there.`
        },
        changes: [
            { key: `macro.tokenMagic`, mode: jez.CUSTOM, value:`distortion`, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: oToken.actor.uuid, effects: [effectData] });
    await jezcon.addCondition(EFFECT_NAME, LAST_ARG.targetUuids,
        { allowDups: false, replaceEx: true, origin: oToken.actor.uuid, overlay: false, traceLvl: TL })
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    msg = `${oToken.name} can now pass through solid walls, doors, ceilings, and floors as if not there.`;
    postResults(msg)
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Use warpgate though library call to spawn in the shadow.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function spawnShadow(aToken, tToken, options = {}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "aToken", aToken, "tToken", tToken,
        "options", options);
    if (TL > 2) jez.trace(`${TAG} Interesting Values`, 
        "tToken.data.img ==> ", tToken.data.img);
    //--------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        defaultRange: 5,                    // Defaults to 30, but this varies per spell
        duration: 1000,                     // Duration of the intro VFX
        introTime: 1000,                    // Amount of time to wait for Intro VFX
        introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
        minionName: `Shadow of ${tToken.name}`,
        templateName: MINION,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        scale: 0.5,							// Default value but needs tuning at times
        source: tToken,                     // Coords for source (with a center), typically aToken
        width: 1,                           // Width of token to be summoned, 1 is the default
        traceLvl: TL                        // Trace level, matching calling function decent choice
    }
    argObj.updates = {
        actor: {
            name: `Shadow of ${tToken.name}`,
            // 'data.attributes.hp': { value: 66, max: 66 }
        },
        token: { 
            name: `Shadow of ${tToken.name}`,
            img: tToken.data.img,
            tint: "#404040",
            alpha: 0.5                         // AKA Opacity
        },
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
    return (await jez.spawnAt(MINION, aToken, aActor, aItem, argObj))
}