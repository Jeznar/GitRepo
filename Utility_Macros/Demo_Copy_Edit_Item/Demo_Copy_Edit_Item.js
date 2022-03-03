const MACRONAME = "Demo_Copy_Edit_Item.js"
/*****************************************************************************************
 * Macro to grab an Item by name from the Items Directory, edit it, add it to the actor 
 * that invoked this macro as an Item OnUse Macro.
 * 
 * 03/03/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
const ITEM_NAME = "Black Tentacles Effect"
const SPEC_ITEM_NAME = `%%${ITEM_NAME}%%`  // Name as expected in Items Directory 
const NEW_ITEM_NAME = `${aToken.name}'s ${ITEM_NAME}` // Name of item in actor's spell book
let msg = "";
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    jez.log("Get rid of pre existing item, if any")
    let oldActorItem = aToken.actor.data.items.getName(NEW_ITEM_NAME)
    jez.log("aToken",aToken)
    jez.log("oldActorItem",oldActorItem)
    if (oldActorItem) await deleteItem(aToken.actor, oldActorItem) 
    //----------------------------------------------------------------------------------------------
    jez.log("Get the item from the Items directory and slap it onto the active actor")
    let itemObj = game.items.getName(SPEC_ITEM_NAME)
    if (!itemObj) {
        msg = `Failed to find ${SPEC_ITEM_NAME} in the Items Directory`
        ui.notifications.error(msg);
        postResults(msg)
        return(false)
    }
    console.log('Item5E fetched by Name', itemObj)
    await replaceItem(aToken.actor, itemObj)
    //----------------------------------------------------------------------------------------------
    jez.log("Edit the item on the actor")
    let aActorItem = aToken.actor.data.items.getName(SPEC_ITEM_NAME)
    jez.log("aActorItem",aActorItem)
    if (!aActorItem) {
        msg = `Failed to find ${SPEC_ITEM_NAME} on ${aToken.name}`
        ui.notifications.error(msg);
        postResults(msg)
        return(false)
    }
     //-----------------------------------------------------------------------------------------------
     jez.log(`Remove the don't change this message assumed to be embedded in the item description.  It 
     should be of the form: <p><strong>%%*%%</strong></p> followed by white space`)
     const searchString = `<p><strong>%%.*%%</strong></p>[\s\n\r]*`;
     const regExp = new RegExp(searchString, "g");
     const replaceString = ``;
     let content = await duplicate(aActorItem.data.data.description.value);
     content = await content.replace(regExp, replaceString);
    let itemUpdate = {
        'name': NEW_ITEM_NAME,
        'data.description.value': content
    }
    await aActorItem.update(itemUpdate)
    //----------------------------------------------------------------------------------------------
    jez.log("Post completion message")
    msg = `An At-Will Spell "${NEW_ITEM_NAME}" has been added to ${aToken.name} for the duration of this spell`
    ui.notifications.info(msg);
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/*************************************************************************************
 * replaceItem
 * 
 * Replace or Add targetItem to inventory of actor5e passed as parms
 *************************************************************************************/
 async function replaceItem(actor5e, targetItem) {
    await deleteItem(actor5e, targetItem)
    return (actor5e.createEmbeddedDocuments("Item", [targetItem.data]))
}
/*************************************************************************************
 * deleteItem
 * 
 * Delete targetItem to inventory of actor5e passed as parms
 *************************************************************************************/
 async function deleteItem(actor5e, targetItem) {
    let itemFound = actor5e.items.find(item => item.data.name === targetItem.data.name && item.type === targetItem.type)
    if (itemFound) await itemFound.delete();
}