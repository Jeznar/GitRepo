const MACRONAME = "entangle_helper.0.2.js"
/*****************************************************************************************
 * This is a helper macro for the main entangle script.  It is intended to be invoked to 
 * clean up things when concentration drops.  Rather a technology experiment at this point.
 * 
 * Input arguments expected to be:
 *   args[1]: Identifier for the graphic to be stopped
 *   args[2 to N-1]: Token IDs that need to have "Restrained" effect removed
 *   args[N]: Standard passed argument array (N is number of arguments)
 * 
 * 02/23/22 0.1 Creation of Macro
 * 07/09/22 0.2 Change to remoive tile not VFX
 *****************************************************************************************/
// COOL-THING: Removes effects and template triggered by dropping concentration
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
// COOL-THING: Remove VFX specified as an input to the macro (args[1])
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    // const VFX_NAME = args[1]
    jez.log("Graphic should be terminated", args[1])
    // Sequencer.EffectManager.endEffects({ name: VFX_NAME });
    jez.tileDelete(args[1])
    for (let i = 2; i < args.length - 1; i++) {
        let fetchedToken = canvas.tokens.placeables.find(ef => ef.id === args[i])
        await jezcon.remove("Restrained", fetchedToken.actor.uuid, {traceLvl: 4});
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}