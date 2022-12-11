const MACRONAME = "Purify_Food_and_Drink.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Run a simple VFX on the spot selected by placed template, also delete that template
 * 
 * 12/11/22 0.1 Creation of Macro
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

//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
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
    //-----------------------------------------------------------------------------------------------
    // Obtain the new template information
    //
    const TEMPLATE_ID = args[0].templateId
    const TEMPLATE = canvas.templates.objects.children.find(i => i.data._id === TEMPLATE_ID);
    if (TL > 1) jez.trace(`${TAG} TEMPLATE`, TEMPLATE)
    canvas.templates.get(TEMPLATE_ID).document.delete();
    //-----------------------------------------------------------------------------------------------
    // If template is a circle, figure out the HARD_OFFSET value to move from center to top left 
    //
    const GRID_SIZE = canvas.scene.data.grid;               // Size of grid in pixels/square (e.g. 70)
    const FEET_PER_GRID = 5                                 // Feet per on canvas grid
    let topLeft = {}
    if (TEMPLATE.data.t = "circle") {
        let radius = TEMPLATE.data.distance               // e.g. Cloudkill 20 
        let centerX = TEMPLATE.data.x
        let centerY = TEMPLATE.data.y
        topLeft.x = centerX - GRID_SIZE * radius / FEET_PER_GRID
        topLeft.y = centerY - GRID_SIZE * radius / FEET_PER_GRID
    } else {
        topLeft.x = TEMPLATE.center.x;
        topLeft.y = TEMPLATE.center.y;
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Run the VFX
    //
    runVFX(TEMPLATE.center, { traceLvl: TL })
    //-------------------------------------------------------------------------------------------------------------------------------
    // Exit message
    //
    msg = `${aToken.name} has purified nonmagical food and drink making it free of poison and disease.`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function runVFX(location, options = {}) {
    const FUNCNAME = "runVFX(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
        'location', location, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    const VFX_FILE = 'modules/jb2a_patreon/Library/Generic/Healing/HealingAbility_02_Regular_TealYellow_Burst_600x600.webm'
    const seq = new Sequence().effect()
        .scale(0.2)
        .file(`jb2a.healing_generic.burst.bluewhite`)
        .waitUntilFinished(-2000)
        .atLocation(aToken)
    seq.effect()
        .scale(0.4)
        .file(VFX_FILE)
        .waitUntilFinished(-2000)
        .atLocation(location)
    seq.effect()
        .scale(0.3)
        .waitUntilFinished()
        .file(`jb2a.healing_generic.burst.bluewhite`)
        .waitUntilFinished(-2000)
        .atLocation(location)
    seq.effect()
        .scale(1.0)
        .opacity(0.5)
        .waitUntilFinished()
        .file(` jb2a.healing_generic.200px.yellow`)
        .waitUntilFinished(-2000)
        .atLocation(location)
    await seq.play();
}