const MACRONAME = "test_tileCreateDelete.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Test harness for two library functions.  
 * 
 * This needs to be inserted as an ItemMacro on an item that places a targeting template.
 * 
 * 06/29/22 0.1 Creation
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 1;
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(2, trcLvl, `  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let msg = "";
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.trc(1, trcLvl, `--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Store some needed info
    //
    // Grab the size of grid in pixels per square
    const TEMPLATE_ID = args[0].templateId                                  // ID of the template
    const GRID_SIZE = canvas.scene.data.grid;                               // Stash the grid size
    const TEMPLATE_OBJS = canvas.templates.objects.children                 // Stash the templates
    let template = TEMPLATE_OBJS.find(i => i.data._id === TEMPLATE_ID);     // Find Template
    canvas.templates.get(TEMPLATE_ID).document.delete();                    // Delete Template
    //-----------------------------------------------------------------------------------------------
    // Build the data object for the tile to be created
    //
    let tileProps = {
        x: template.center.x - GRID_SIZE / 2,     // X coordinate is center of the template
        y: template.center.y - GRID_SIZE / 2,     // Y coordinate is center of the template
        img: "modules/jb2a_patreon/Library/Generic/Fire/GroundCrackLoop_03_Regular_Orange_600x600.webm",
        width: GRID_SIZE * 3,                   // VFX should occupy 2 tiles across
        height: GRID_SIZE * 3                   // ditto
    };
    //-----------------------------------------------------------------------------------------------
    // Call library function to create the new tile, catching the id returned
    //
    let tileId = await jez.tileCreate(tileProps)
    //-----------------------------------------------------------------------------------------------
    // Cool heals for a bit before moving on to the delete
    //
    for (let i = 1; i <= 5; i++) { console.log(`Waited ${i*0.5} seconds`); await jez.wait(500) }
    //-----------------------------------------------------------------------------------------------
    // Delete the tile we just built with library function
    //
    jez.tileDelete(tileId)
    //-----------------------------------------------------------------------------------------------
    // That's all folks
    //
    jez.trc(1, trcLvl, `--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
    return;
}