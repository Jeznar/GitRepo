const MACRONAME = "Demo_Flag_Mgmt"
/*****************************************************************************************
 * Demonstrate the use of three FoundryVTT flag management calls for storing and using
 * DAE calls. Target some number of tokens, execute this as an itemMacro and look at 
 * console output.
 * 
 *  DAE.unsetFlag(actor5e, flag) -- Clears "flag" from "actor5e" data object
 *  DAE.getFlag(actor5e, flag) -- Returns the contents of "actor5e's" "flag"
 *  DAE.setFlag(actor5e, flag, value) -- stores "value" to "flag" on "actor5e"
 * 
 * 03/05/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let currentValue = ""
//-----------------------------------------------------------------------------------------
// Display flag object for our actor
//
console.log(`${aToken.name} current DAE flagObj content`,aToken.actor.data.flags.dae)
//-----------------------------------------------------------------------------------------
// Clear any prexisting value of the flag
//
await DAE.unsetFlag(aToken.actor, MACRONAME);
//-----------------------------------------------------------------------------------------
// Display the value of the flag
//
currentValue = await DAE.getFlag(aToken.actor, MACRONAME);
console.log("Value of flag after clear",currentValue)
//-----------------------------------------------------------------------------------------
// Add the token.id of our invoking token to the flag
//
await DAE.setFlag(aToken.actor, MACRONAME, aToken.id);
//-----------------------------------------------------------------------------------------
// Display the value of the flag
//
currentValue = await DAE.getFlag(aToken.actor, MACRONAME);
console.log("Value of flag after originator",currentValue)
//-----------------------------------------------------------------------------------------
// Loop through the targets, adding them to the flag value, getting and displaying as we go
//
for (let i = 0; i < args[0].targets.length; i++) {
    let flagValue = await DAE.getFlag(aToken.actor, `${MACRONAME}`)
    flagValue += ` ${args[0].targets[i].id}`
    await DAE.setFlag(aToken.actor, MACRONAME, flagValue);
    currentValue = await DAE.getFlag(aToken.actor, MACRONAME);
    console.log(`Value of flag after target ${i+1}`,currentValue)
}
//-----------------------------------------------------------------------------------------
// Imagine we've done some useful things and then want to use that flag info to do...
//
currentValue = await DAE.getFlag(aToken.actor, MACRONAME);  // Get the flag value
let tokenIdArray = currentValue.split(" ")                      // Populate array 
//-----------------------------------------------------------------------------------------
// Obtain the token data for our acting token based on the ID transferred via the flag
//
let actingToken = canvas.tokens.placeables.find(ef => ef.id === tokenIdArray[0])
console.log(`${actingToken.name} started this fine mess and targeted ${tokenIdArray.length-1} tokens`)
//-----------------------------------------------------------------------------------------
// Loop through the targetted tokens, if any, and print out their names
//
for (let i = 1; i < tokenIdArray.length; i++) {
    let targetToken = canvas.tokens.placeables.find(ef => ef.id === tokenIdArray[i])
    console.log(` ${i}) ${targetToken.name}`)
}
//-----------------------------------------------------------------------------------------
// Display flag object for our actor
//
console.log(`${aToken.name} current DAE flagObj content`,aToken.actor.data.flags.dae)
//-----------------------------------------------------------------------------------------
// Clear the flag so we don't pollute
//
await DAE.unsetFlag(aToken.actor, MACRONAME);