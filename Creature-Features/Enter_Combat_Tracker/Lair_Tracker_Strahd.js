const MACRONAME = "Lair_Tracker_Strahd.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Spawn in the Lair Action token for Strahd, then put it into combat at 20 initiative.
 * 
 * 11/15/22 0.1 Creation of Macro
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
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const MINION = `Lair Action, Strahd`
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
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    //  Spawn in the Lair Token
    //
    const lairTokenID = await spawnToken(aToken, {traceLvl: TL})
    let lairTokenToken = await canvas.tokens.placeables.find(ef => ef.id === lairTokenID[0])
    if (TL > 2) jez.trace(`${TAG} lairToken Info`,
        `lairTokenID    ==>`, lairTokenID,
        `lairTokenToken ==>`, lairTokenToken)
    //-----------------------------------------------------------------------------------------------
    //  Do the thing and the other thing
    //
    if (!lairTokenToken.combatant) await lairTokenToken.toggleCombat();
    lairTokenToken.combatant.update({initiative: 20})
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Use warpgate though library call to spawn in the token.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 async function spawnToken(aToken, options = {}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "aToken", aToken, 
        "options", options);
    //--------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        defaultRange: 100,                  // Defaults to 30, but this varies per spell
        duration: 1000,                     // Duration of the intro VFX
        introTime: 1000,                    // Amount of time to wait for Intro VFX
        introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
        minionName: MINION,
        templateName: MINION,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        scale: 0.3,							// Default value but needs tuning at times
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
    return (await jez.spawnAt(MINION, aToken, aActor, aItem, argObj))
}