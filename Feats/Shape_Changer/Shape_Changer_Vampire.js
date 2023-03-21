const MACRONAME = "Shape_Changer_Dask.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Macro that manages the changing of appearance and naming of a token to automate the shape change ability of a Vampires
 * 
 * o Build arrays of information that define
 *   - Names of Shapes
 *   - Short Descriptions
 *   - Location of file tyo use as the token image
 * o Present player with a list of the names & descriptions to choose from
 * o Start an animation to play for the transformation
 * o Rename the token per name selected
 * o Update the token image
 * o Post a chat log message
 * 
 * 03/21/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 5;                               // Trace Level for this macro
const WAIT = 2500;                          // Time to play the VFX in ms
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
const OLD_NAME = aToken.name
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const BASE_NAME = aActor.data.token.name
const BASE_IMG = aActor.data.token.img
const SHAPE_NAMES = [BASE_NAME, "Bat", "Wolf", "Mist"]
const SHAPE_DESC = [
    `${BASE_NAME}'s natural form`,
    "appear to be mundane animal",
    "appear to be mundane animal",
    "become a cloud of mist"
]
const WOLF_INDEX = Math.floor(Math.random() * 9) // Assumes there are 9 wolf image files that match naming.
const SHAPE_IMAGE = [
    BASE_IMG,
    `Tokens/CoS_NPC/Ravenloft/Vampire_Shape_Shifts/Bat_Small.png`,
    `Tokens/CoS_NPC/Ravenloft/Vampire_Shape_Shifts/Wolf_0${WOLF_INDEX}.png`,
    `Tokens/CoS_NPC/Ravenloft/Vampire_Shape_Shifts/mist.png`,
]
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
    // Function Variables
    //
    let shapeLines = []
    const FILTERID = 'ShapeChange'
    function dummyFunction(itemSelected) { return } // RadioList requires a function...
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build array containing: Index, Name, Description for each persona
    //
    for (let i = 0; i < SHAPE_NAMES.length; i++) {
        if (TL > 1) jez.trace(`${TAG}  Building line ${i + 1} for ${SHAPE_NAMES[i]}`);
        shapeLines.push(`${i + 1}. ${SHAPE_NAMES[i]} - ${SHAPE_DESC[i]}`)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Ask for new form to be selected from a Radio dialog
    //
    const queryTitle = "Select New Appearance/Form"
    const queryText = "Pick one from the list (or I'll do it for you!)"
    let selection = await jez.pickRadioListArray(queryTitle, queryText, dummyFunction, shapeLines);
    const SEL = selection ? selection.match(/[0-9]+/) - 1 : Math.floor(Math.random() * SHAPE_NAMES.length)
    if (TL > 1) jez.trace(`${TAG} Shape selected: ${SEL}`, SHAPE_NAMES[SEL])
    //-------------------------------------------------------------------------------------------------------------------------------
    // Play VFX on the transforming token
    //
    await applyTokenMagic(aToken, FILTERID, {traceLvl: TL})
    await jez.wait(WAIT)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the token with new name and image file
    //
    let updates = [];
    updates.push({
        _id: aToken.id,
        name: SHAPE_NAMES[SEL],
        img: SHAPE_IMAGE[SEL],
    });
    if (TL > 1) jez.trace(`${TAG}  Updating Token to ${SEL}`, 'Name', SHAPE_NAMES[SEL], 'Image', SHAPE_IMAGE[SEL]);
    await jez.updateEmbeddedDocs("Token", updates)
    if (TL > 3) jez.trace(`${TAG} More Detailed Trace Info.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Remove VFX from the transforming token
    //
    await removeTokenMagic(aToken, FILTERID, {traceLvl: TL}) 
    //-------------------------------------------------------------------------------------------------------------------------------
    // Exit message
    //
    msg = `${OLD_NAME} has shifted appearance to ${SHAPE_NAMES[SEL]}`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Apply VFX to token using TokenMagic
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function applyTokenMagic(TARGET, FILTERID, options = {}) {
    const FUNCNAME = "applyTokenMagic(TARGET, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'TARGET', TARGET, 'FILTERID', FILTERID, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define the TokenMagic VFX Data object
    //
    let params =
        [{
            filterId: FILTERID,
            filterType: "distortion",
            maskPath: "modules/tokenmagic/fx/assets/waves-2.png",
            maskSpriteScaleX: 7,
            maskSpriteScaleY: 7,
            padding: 50,
            animated:
            {
                maskSpriteX: { active: true, speed: 0.05, animType: "move" },
                maskSpriteY: { active: true, speed: 0.07, animType: "move" }
            }
        },
        {
            filterId: FILTERID,
            filterType: "ray",
            time: 0,
            color: 0xEF9000,
            alpha: 0.25,
            divisor: 32,
            anchorY: 1,
            animated:
            {
                time:
                {
                    active: true,
                    speed: 0.0005,
                    animType: "move"
                }
            }
        },
        {
            filterId: FILTERID,
            filterType: "glow",
            distance: 10,
            outerStrength: 8,
            innerStrength: 0,
            color: 0xB03000,
            quality: 0.5,
            animated:
            {
                color:
                {
                    active: true,
                    loopDuration: 3000,
                    animType: "colorOscillation",
                    val1: 0xB03000,
                    val2: 0xFFD010
                }
            }
        }
        ];
    let result = await TokenMagic.addFilters(TARGET, params); // addFilters: async addFilters(placeable, paramsArray, replace = false)
    console.log(`result:`, result)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return result;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Apply VFX to token using TokenMagic
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function removeTokenMagic(TARGET, FILTERID, options = {}) {
    const FUNCNAME = "removeTokenMagic(TARGET, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'TARGET', TARGET, 'FILTERID', FILTERID, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define the TokenMagic VFX Data object
    //
    await TokenMagic.deleteFilters(TARGET, FILTERID); // deleteFilters: async deleteFilters(placeable, filterId = null)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}