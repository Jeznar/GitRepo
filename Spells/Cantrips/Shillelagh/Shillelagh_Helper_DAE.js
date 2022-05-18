const MACRONAME = "Shillelagh_Helper_DAE.0.2"
jez.log(MACRONAME)
/*****************************************************************************************
 * Intended to be called as a macro.execute from within an ItemMacro to make the doOn and
 * doOff options available to an affect that has been exectued outside of DAE.
 * 
 * 12/30/21 0.1 Creation of Macro
 * 12/30/21 0.2 Cleanups
 * 12/31/21 0.4 Dotting i's etc.
 * 05/17/22 0.5 Update for Foundry 9.x
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`------Starting ${MACRONAME}-----------------`)
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

const ATTACK_ITEM = args[1];

if (!ATTACK_ITEM) {
    ui.notifications.error(`${MACRONAME} received invalid parameters, please, politely ask Joe to fix this`);
    jez.log(`Bad stuff received by ${MACRONAME}`,"ATTACK_ITEM", ATTACK_ITEM);
    return;
}
jez.log("ATTACK_ITEM",ATTACK_ITEM);

const LAST_ARG = args[args.length - 1];
let msg = "";
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
if (args[0] === "off") await doOff();         // DAE removal
//if (args[0] === "on") await doOn();           // DAE Application
jez.log(`--------- Finished ${MACRONAME} -----------`)
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 *
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`------- Starting ${MACRONAME} ${FUNCNAME} ---------`);
    jez.log(`doOff ---> Delete ${ATTACK_ITEM} from ${aToken.name} if it exists`, aActor)
    for (let i = 0; i < args.length; i++) jez.log(`***args[${i}]`, args[i]);
    await deleteItems(ATTACK_ITEM, aActor, "weapon");
    jez.log(`---------- Finished ${MACRONAME} ${FUNCNAME} -----------`);
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
async function deleteItems(itemName, actor, type) {
    let itemFound = null
    for (let i = 1; i <= 20; i++) {
        while (itemFound = actor.items.find(item => item.data.name === itemName &&
            item.type === type)) {
            jez.log("itemFound", itemFound)
            await itemFound.delete();
            msg = `Deleted expired ${itemName}`      // Set notification message
            ui.notifications.info(msg);
            jez.log(msg);
        }
    }
}