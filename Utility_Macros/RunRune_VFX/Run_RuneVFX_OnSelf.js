const MACRONAME = "Run_RuneVFX_onSelf.js"
/*****************************************************************************************
 * This macro simply runs the Rune VFX on the using token(s) for the aItem school. It is 
 * intended to be run as an OnUse Macro from an Item.
 * 
 * 03/30/22 0.1 Creation of Macro
 *****************************************************************************************/
 for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//--------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    jez.runRuneVFX(aToken, jez.getSpellSchool(aItem))
 }