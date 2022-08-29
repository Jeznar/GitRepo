const MACRONAME = "Imp_Shape_Change.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Implment IMP's Shape Change Ability.  Changing displayed token image and movement per RAW, except
 * token does not revert on death and nothing is done with equipment.
 * 
 *   Imp can use its action to polymorph into a beast form that resembles:
 *    1. rat(speed 20 ft.),
 *    2. raven (20 ft., fly 60 ft.), or 
 *    3. spider (20 ft., climb 20 ft.), or
 *    4. back into its true form.
 *   Its statistics are the same in each form, except for the speed changes noted. Any equipment it 
 *   is wearing or carrying isn't transformed. It reverts to its true form if it dies.
 * 
 * 08/29/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
const TL = 1;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL>1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
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
let SHAPES = ["Imp", "Raven", "Rat", "Spider"]
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
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
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Prepare and pop a dialog asking what shape is desired, calling callback with response
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //----------------------------------------------------------------------------------
    // Comments, perhaps
    //
    const queryTitle = "What form is desired?"
    const queryText = `Pick a form for ${aToken.name} from the list below`
    jez.pickRadioListArray(queryTitle, queryText, pickShapeCallBack, SHAPES);

    // if (TL>3) jez.trace(`${TAG} More Detailed Trace Info.`)
    // msg = `Maybe say something useful...`
    // postResults(msg)
    // if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Extract the results of calling dialog and proceed
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
async function pickShapeCallBack(selection) {
    const FUNCNAME = "pickShapeCallBack(selection)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} Called ${FNAME}`);
    if (TL > 1) jez.trace(`${TAG} Called ${FUNCNAME}`, "Selection", selection);
    //---------------------------------------------------------------------------------------------------
    // Handle a cancel or X button from previous dialog
    //
    if (selection === null) return;     // Cancel button was selected on the preceding dialog
    if (selection.length === 0) {       // Nothing was selected
        if (TL > 0) jez.trace(`${MACRO} ${FNAME} | No selection passed to pickShapeCallBack(selection), trying again.`)
        doOnUse()
        return;
    }
    //---------------------------------------------------------------------------------------------------
    // Do something useful from here
    //
    if (TL > 0) jez.trace(`${TAG} Perform swap to ${selection} shape`)
}