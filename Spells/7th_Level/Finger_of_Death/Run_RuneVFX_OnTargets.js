const MACRONAME = "Run_RuneVFX_onTargets.js"
/*****************************************************************************************
 * This macro simply runs the Rune VFX on the targeted token(s) for the aItem school.
 * 
 * 03/29/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//--------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (args[0].targets.length !== 0) {     // If not exactly one target, return
        msg = `Must target at least one target.`
        postResults(msg);
        return (false);
    }
    return(true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let immuneRaces = ["undead", "construct"];  // Set strings that define immune races
    let vulnerableRaces = ["plant"]             // Strings that define vulnerable races
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------
    // Run the preCheck function to make sure things are setup as best I can check them
    //
    if (!preCheck()) return;
    //-----------------------------------------------------------------------------------------------
    // If target is immune type, post appropriate message and exit
    //
    if (checkType(tToken, immuneRaces)) {
        msg = `${tToken.name} appears to be unaffected by ${aItem.name}.`
        postResults(msg);
        return (false);
    }
    //-----------------------------------------------------------------------------------------------
    // Launch our VFX
    //
    jez.runRuneVFX(tToken, jez.getSpellSchool(aItem))
 }