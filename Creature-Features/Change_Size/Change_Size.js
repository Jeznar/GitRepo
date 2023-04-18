const MACRONAME = "Change_Size.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Macro that manages the changing of appearance and naming of a token to automate the shape change ability of a Vampires
 * 
 * 04/18/23 0.1 Creation of Macro from Shape_Changer_Vamp.0.2
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
const OLD_NAME = aToken.name
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
//  Values for update object
let values = {
    descs: [
        'tiny',
        `Small`,
        `Medium`,
        'Large',
        "Huge",
        "Gargantuan"
    ],
    sizes: [
        { name: "tiny", height: 0.5, width: 0.5 },
        { name: "sm", height: 1, width: 1 },
        { name: "med", height: 1, width: 1 },
        { name: "lg", height: 2, width: 2 },
        { name: "huge", height: 3, width: 3 },
        { name: "grg", height: 4, width: 4 },
    ],
}
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
    function dummyFunction(itemSelected) { return } // RadioList requires a function...
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build array containing: Index, Name, Description for each persona
    //
    for (let i = 0; i < values.sizes.length; i++) {
        if (TL > 1) jez.trace(`${TAG}  Building line ${i + 1} for ${values.sizes[i]}`);
        shapeLines.push(`${i + 1}. ${values.sizes[i].name} - ${values.descs[i]}`)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Ask for new form to be selected from a Radio dialog
    //
    const queryTitle = "Select New Size"
    const queryText = "Pick one from the list (or I'll do it for you!)"
    let selection = await jez.pickRadioListArray(queryTitle, queryText, dummyFunction, shapeLines);
    const SEL = selection ? selection.match(/[0-9]+/) - 1 : Math.floor(Math.random() * values.names.length)
    if (TL > 1) jez.trace(`${TAG} Size selected: ${SEL}`, values.sizes[SEL].name)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the token with new name and image file
    //
    let updates = [];
    updates.push({
        _id: aToken.id,
        height: values.sizes[SEL].height,
        width: values.sizes[SEL].width
    });
    if (TL > 1) jez.trace(`${TAG}  Updating Token to ${SEL}`);
    await jez.updateEmbeddedDocs("Token", updates)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the actor with new movement values
    //
    await jez.actorUpdate(aToken, { 
        "data.traits.size": values.sizes[SEL].name,
    })
    console.log('==>', values.sizes[SEL].name)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Exit message
    //
    msg = `${aToken.name} has shifted size, it is now ${values.descs[SEL]}`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}