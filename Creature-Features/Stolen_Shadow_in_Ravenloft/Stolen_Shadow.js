const MACRONAME = "Stolen_Shadow.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Strahd's Lair Ability to steal and control a shadow.
 * 
 *   Strahd targets one Medium or smaller creature that casts a shadow. The target's shadow must be 
 *   visible to Strahd and within 30 feet of him. If the target fails a DC 17 Charisma saving throw, 
 *   its shadow detaches from it and becomes a shadow that obeys Strahd's commands, acting on 
 *   initiative count 20. A greater restoration spell or a remove curse spell cast on the target 
 *   restores its natural shadow, but only if its undead shadow has been destroyed.
 * 
 * This macro runs as an OnUse macro and assumes the item card does nothing other than launchng it.
 * 
 * - Make sure one, in range, visible token is targeted.
 * - Check for presence of debuff EFFECT_NAME that serves as an immunity marker
 * - Roll and check save, exiting on success
 * - Apply EFFECT_NAME to the target 
 * - warpgate spawn a shadow with appropriate mods to the token
 * - Add the new token to combat tracker and force initiative count 20
 * 
 * 
 * 
 * 
 * 11/15/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 4;                               // Trace Level for this macro
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
const EFFECT_NAME = `Stolen Shadow`
const SAVE_DC = aActor.getRollData().attributes.spelldc;
const SAVE_TYPE = "cha";
const MINION = `Shadow`
if (TL > 2) jez.trace(`${TAG} Variable Values`,
    `ALLOWED_UNITS ==>`, ALLOWED_UNITS,
    `EFFECT_NAME   ==>`, EFFECT_NAME,
    `SAVE_DC       ==>`, SAVE_DC,
    `SAVE_TYPE     ==>`, SAVE_TYPE,
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
    //  Make sure one, in range, visible token is targeted.
    //
    if (args[0].targets.length !== 1) {     // If not exactly one target 
        msg = `Target exactly one target. ${args[0]?.targets?.length} targeted.`
        postResults(msg)
        return jez.badNews(msg, "w")
    }
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-----------------------------------------------------------------------------------------------
    //  Target is in range?
    const MAX_RANGE = 30 // jez.getRange(aItem, ALLOWED_UNITS)
    const DISTANCE = jez.getDistance5e(aToken, tToken)
    if (DISTANCE > MAX_RANGE) {
        msg = `${tToken.name} is ${DISTANCE} away, max range is ${MAX_RANGE} feet.`
        postResults(msg)
        return jez.badNews(msg, "i")
    }
    if (TL > 2) jez.trace(`${TAG} Variable Values`,
        `tToken ==>`, tToken,
        `tActor ==>`, tActor,
        `MAX_RANGE ==>`, MAX_RANGE,
        `DISTANCE ==>`, DISTANCE)
    //-----------------------------------------------------------------------------------------------
    // Target is visible?
    let ray = new Ray(aToken.center, tToken.center)
    let badLoS = canvas.walls.checkCollision(ray, { type: "sight", mode: "any" })
    if (badLoS) {
        msg = `${aToken.name}'s line of sight blocked to ${tToken.name}`
        postResults(msg)
        return jez.badNews(msg, "i")
    }
    if (jezcon.hasCE("Blinded", aToken.actor.uuid, { traceLvl: 0 })) {
        msg = `${aToken.name} is blinded, can not see ${tToken.name}`
        postResults(msg)
        return jez.badNews(msg, "i")
    }
    //-----------------------------------------------------------------------------------------------
    // Check size of target
    //
    const TARGET_SIZE_OBJ = await jez.getSize(tToken)
    if (TARGET_SIZE_OBJ.value > 3) {
        msg = `${tToken.name} is to large to have its shadow stolen.`
        postResults(msg)
        return jez.badNews(msg, "i")
    }
    //-----------------------------------------------------------------------------------------------
    // Check for presence of debuff EFFECT that serves as an immunity marker
    //
    if (jezcon.hasCE(EFFECT_NAME, tToken.actor.uuid, { traceLvl: 0 })) {
        msg = `${tToken.name}'s shadow already stolen`
        postResults(msg)
        return jez.badNews(msg, "i")
    }
    //-----------------------------------------------------------------------------------------------
    // Roll and check save, exiting on success
    //
    let save = await tToken.actor.rollAbilitySave(SAVE_TYPE, { chatMessage: true, fastForward: true })
    if (save.total >= SAVE_DC) {
        msg = `${tToken.name} resisted the ${aItem.name} effect.`
        postResults(msg)
        return
    }
    //-----------------------------------------------------------------------------------------------
    // Apply EFFECT to the target 
    //
    console.log(`LAST_ARG.targetUuids`, LAST_ARG.targetUuids)
    await jezcon.addCondition(EFFECT_NAME, LAST_ARG.targetUuids,
        { allowDups: false, replaceEx: true, origin: aActor.uuid, overlay: false, traceLvl: TL })
    //-----------------------------------------------------------------------------------------------
    // warpgate spawn a shadow with appropriate mods to the token
    //
    spawnShadow(aToken, tToken, {traceLvl: TL})


    //-----------------------------------------------------------------------------------------------
    // Add the new token to combat tracker and force initiative count 20    
    //

    //-----------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${TAG} More Detailed Trace Info.`)


    msg = `Maybe say something useful...`
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