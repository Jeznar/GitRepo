const MACRONAME = "Shillelagh_Helper_DAE.0.6.js"
/*****************************************************************************************
 * Intended to be called as a macro.execute from within an ItemMacro to make the doOn and
 * doOff options available to an affect that has been exectued outside of DAE.
 * 
 * 12/30/21 0.1 Creation of Macro
 * 12/30/21 0.2 Cleanups
 * 12/31/21 0.4 Dotting i's etc.
 * 05/17/22 0.5 Update for Foundry 9.x
 * 12/11/22 0.6 Quiet the log
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 0;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //-----------------------------------------------------------------------------------------------------------------------------------
 if (TL>0) jez.trace(`${TAG} === Starting ===`);
 if (TL>1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
 //-----------------------------------------------------------------------------------------------------------------------------------
 // Set standard variables
 //
 const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
 let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
 let aActor = aToken.actor; 
 let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
 const VERSION = Math.floor(game.VERSION);
 const GAME_RND = game.combat ? game.combat.round : 0;
 //-----------------------------------------------------------------------------------------------------------------------------------
 // Set Macro specific globals
 //
const ATTACK_ITEM = args[1];
if (!ATTACK_ITEM) {
    ui.notifications.error(`${MACRONAME} received invalid parameters, please, politely ask Joe to fix this`);
    jez.log(`Bad stuff received by ${MACRONAME}`,"ATTACK_ITEM", ATTACK_ITEM);
    return;
}
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff({traceLvl:TL});         // DAE removal
if (TL>1) jez.trace(`${TAG} === Finished ===`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 *
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
async function doOff(options={}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    await jez.deleteItems(ATTACK_ITEM, "weapon", aActor );
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/***************************************************************************************
 * Function to delete all copies of an item from actor
 *
 * Parameters
 *  - itemName: A string naming the item to be found in actor's inventory
 *  - actor: Optional actor to be searched, defaults to actor launching this macro
 * 
 * Function rewritten to eliminate:
 *  await aActor.deleteOwnedItem(item._id);                 // Obsoletes as of Foundry 9.x
 *  await aActor.deleteEmbeddedDocuments("Item", [item.id]) // Format as of Foundry 9.x 
 ***************************************************************************************/
// async function deleteItems(itemName, actor, type) {
//     let itemFound = null
//     for (let i = 1; i <= 20; i++) {
//         while (itemFound = actor.items.find(item => item.data.name === itemName &&
//             item.type === type)) {
//             jez.log("itemFound", itemFound)
//             await itemFound.delete();
//             msg = `Deleted expired ${itemName}`      // Set notification message
//             ui.notifications.info(msg);
//             jez.log(msg);
//         }
//     }
// }