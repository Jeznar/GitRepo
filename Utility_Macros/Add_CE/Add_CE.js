const MACRONAME = "Add_CE.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Adds a Convienent Effect to targeted token(s) or to the invoking token if nothing is targeted. 
 * 
 * FAILURE: This doesn't work because OnUse Macros can't have additional arguments from the item Card
 * 
 * It expects its arguments to include (the first is required, remaining are optional and order does
 * not matter):
 * 
 * effectName -- first argument -- String naming an existing CE in the game system
 * allowDups:true or allowDups:false -- Defaults to false, allows or disallows duplicates
 * replaceEx:true or replaceEx:false -- Defaults to false, replaces existing if true
 * overlay:true or overlay:false -- 
 * traceLvl:N -- Tracing level where N is 0 or a positive integer, defaults to 0 
 * 
 * 07/19/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TL = 4;                               // Trace Level for this macro
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
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0] 

    if (TL>1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-----------------------------------------------------------------------------------------------
    // Parse and process the arguments
    //
    if (args.length < 2) return jez.badNews(`${MACRO} received less than required number of aruments`,"e")
    if (TL>2) jez.trace(`${MACRO} | Condition to be added is ${arg[1]}`)
    for (let i = 2; i < args.length; i++) {
        if (TL>2) jez.trace(`${MACRO} | Argument ${i}`, arg[i])
    }
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL>3) jez.trace(`${FNAME} | More Detailed Trace Info.`)
    if (TL>1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}