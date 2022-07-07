const MACRONAME = "CleanUpItem.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Simple minded macro that deletes an item specified by the arguments
 * 
 * 07/05/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 3;
jez.trc(1, trcLvl, `============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.trc(2, trcLvl, `  args[${i}]`, args[i]);
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOff() {
    let item = await fromUuid(args[1])
    jez.trc(3, trcLvl, ` Item to be removed:`,item);
    // Workaround for DAE issue has been incoprated into jezlib
    // https://gitlab.com/tposney/dae/-/issues/319
    // await jez.wait(Math.floor(Math.random() * 500))
    if (!item) return // jez.badNews(`Could not find item to be deleted for ${args[1]}`, "warn")
    jez.itemDeleteFromActor(item.parent.parent._object, item.data.name, item.data.type)
}