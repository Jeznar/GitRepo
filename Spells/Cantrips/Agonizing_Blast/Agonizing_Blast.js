const MACRONAME = "Agonizing_Blast.0.3.js"
/*****************************************************************************************
 * 01/01/22 0.1 Creation of Macro
 * 02/08/22 0.2 Now calls library functions
 * 12/09/22 0.3 Update logging to current style
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 1;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
const ALLOWED_UNITS = ["", "ft", "any"];
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (!preCheck()) return;
//---------------------------------------------------------------------------------------------------
// Set the target
//
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
let tActor = tToken?.actor;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL}); // Midi ItemMacro On Use
if (TL>0) jez.trace(`${TAG} --- Finished ---`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    //----------------------------------------------------------------------------------------------
    // Make sure exactly one token is targeted
    //
    if (game.user.targets.ids.length != 1) {
        msg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        return jez.badNews(msg, "w");
    }
    //----------------------------------------------------------------------------------------------
    // Obtain the range of active ability and make sure units are ok
    //
    let maxRange = jez.getRange(aItem, ALLOWED_UNITS)
    if (!maxRange) {
        msg = `Range is 0 or incorrect units on ${aItem.name}`;
        return jez.badNews(msg, "w");
    }
    //----------------------------------------------------------------------------------------------
    // Make sure the target is in range
    //
    if (!jez.inRange(aToken, canvas.tokens.get(args[0]?.targets[0]?.id), maxRange)) {
        msg = `Target is not in range for ${aItem.name}`;
        return jez.badNews(msg, "w");
    }
    return (true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    // Set function variables
    //
    const PREFIX = "EldritchBlast_01_"
    let color = "";
    switch (Math.floor(Math.random() * 3)) {
        case 0: color = "Dark_Green"; break;
        case 1: color = "Dark_Purple"; break;
        case 2: color = "Dark_Red"; break;
        default: ui.notifications.error("Value was not 0, 1, or 2")
    }
    if (TL>1) jez.trace(`${TAG} Values Set`, 
        "PREFIX   ", PREFIX,
        "Color    ", color,
        "File Name", fileName)
    let fileName = PREFIX + color + fileSuffix(aToken, tToken, {traceLvl:TL})
    //-----------------------------------------------------------------------------------------------
    // Launch the VFX
    new Sequence()
        .effect()
        .file(`modules/jb2a_patreon/Library/Cantrip/Eldritch_Blast/${fileName}`)
        .atLocation(aToken)
        .stretchTo(args[0].targets[0])
        .missed(args[0].hitTargets.length === 0)
        .play()
    if (TL>0) jez.trace(`${TAG} --- Finished ---`);
    return (true);
}
/***************************************************************************************************
 * Return the distance to the target
 ***************************************************************************************************/
function fileSuffix(token1, token2, options={}) {
    const FUNCNAME = "fileSuffix(token1, token2, options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
        'token1 ', token1, 'token2 ', token2, "options",options);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    let dist = canvas.grid.measureDistance(token1, token2).toFixed(0);
    let suffix = "";
    if (dist < 15) suffix = "_05ft_600x400.webm"
    else if (dist < 30) suffix = "_15ft_1000x400.webm"
    else if (dist < 60) suffix = "_30ft_1600x400.webm"
    else if (dist < 90) suffix = "_60ft_2800x400.webm"
    else if (dist <= 130) suffix = "_90ft_4000x400.webm"
    if (TL>1) jez.trace(`${TAG} fileSuffix values`, 'dist  ', dist, "suffix", suffix);
    return (suffix)
}