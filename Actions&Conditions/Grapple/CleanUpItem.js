const MACRONAME = "CleanUpItem.0.3.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Simple minded macro that deletes an item specified by the arguments
 * 
 * 07/05/22 0.1 Creation of Macro
 * 09/22/23 0.3 Replace jez-dot-trc with jez.log
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const TL = 3;
if (TL > 0) jez.log(`============== Starting === ${MACRONAME} =================`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOff() {
    let item = await fromUuid(args[1])
    if (TL > 1) jez.log(` Item to be removed:`, item);
    if (!item) return jez.badNews(`Could not find item to be deleted for ${args[1]}`, "warn")
    jez.itemDeleteFromActor(item.parent.parent._object, item.data.name, item.data.type)
}