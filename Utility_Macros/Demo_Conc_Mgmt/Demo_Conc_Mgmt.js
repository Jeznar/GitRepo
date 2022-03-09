const MACRONAME = "Demo_Conc_Mgmt.js"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
const CONDITION = "Prone"
const FLAG = "Demo_Conc_Mgmt"
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "off") await doOff();                   // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;

/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    modConcentratingEffect(aToken)
    DAE.unsetFlag(aToken.actor, FLAG)            // Clear the flag
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let oTokenId = await DAE.getFlag(aToken.actor, FLAG);       // Get the flag value
    if (oTokenId) {                                             // If Flag was set clean old value
        let oToken = canvas.tokens.placeables.find(ef => ef.id === oTokenId)
        if (await game.cub.hasCondition(CONDITION, oToken)) {   // Does the original Token have condition?
            await game.cub.removeCondition(CONDITION, oToken);  // If so, remove it.
        }
    }
    DAE.unsetFlag(aToken.actor, FLAG) 
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
  
/***************************************************************************************************
 * Modify existing concentration effect to call a this macro as an ItemMacro that can use doOff
 * function can be used to clean accumulated effects.  
 ***************************************************************************************************/
// COOL-THING: Modify existing concentrating effect to enable cleanup of dependent items
 async function modConcentratingEffect(token5e) {
    const EFFECT = "Concentrating"
    //----------------------------------------------------------------------------------------------
    // Seach the token to find the just added concentrating effect
    //
    await jez.wait(100)
    let effect = await token5e.actor.effects.find(i => i.data.label === EFFECT);
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect. 
    //    
    effect.data.changes.push({key: `macro.itemMacro`, mode: CUSTOM, value:`arbitrary_arg`, priority: 20})
    //----------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result) jez.log(`Active Effect ${EFFECT} updated!`, result);
}