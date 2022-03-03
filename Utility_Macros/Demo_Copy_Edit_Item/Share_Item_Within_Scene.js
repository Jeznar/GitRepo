const MACRONAME = "Share_Item_Within_Scene.js"
/******************************************************************************
 * Macro to share an item to specified actors within a given scene from a 
 * targeted actor.
 * 
 * This macro should be run from the hotbar with "A" (one!) token of interest 
 * selected in a scene.
 * 
 * Provide option to execute in one of three modes:
 *  1. Delete - item from those Actors that have it.
 *  2. Add - Add or update item for Actors.
 *  3. Update - item on actors that currently have item.
 *
 * 02/14/22 0.1 Created from Open_Actor_Sheets_With.js
 *****************************************************************************/
let itemFound = null;
let msg = ""
let queryTitle = ""
let queryText = ""
let type = ""
let item = ""
let targetItem = null
const ADD = "Add", DELETE = "Delete", UPDATE = "Update"
jez.log(`Beginning ${MACRONAME}`);
let sToken = canvas.tokens.controlled[0]
if (!sToken) {
    msg = `Must select one token to be used to find the item that will be searched for.`
    jez.postMessage({color:"crimson", fSize:14, msg:msg, title:`ERROR: Select a Token`})
    return
}
jez.log(`Source Token ${sToken.name}`, sToken);
let sActor = sToken.actor
let itemsFound = []
let typesFound = []
for (let i=0; i < sActor.items.contents.length; i++) {
    jez.log(`${i} ${sActor.items.contents[i].data.type} ${sActor.items.contents[i].data.name}`)
    if (!typesFound.includes(sActor.items.contents[i].data.type)) typesFound.push(sActor.items.contents[i].data.type)
}
jez.log(`Found ${typesFound.length} types}`, typesFound.sort())
//--------------------------------------------------------------------------------------------
// Dialog to select type of action to be performed
//
queryTitle = "Action to be Performed on Inventory Items"
queryText  = "What action do you want to perform on scene actor inventory's <b>item</b>?"
await jez.pickRadioListArray(queryTitle, queryText, actionCallBack, [
    "Add    - to scene actors that lack it, update others.",
    "Delete - from those scene actors that have it.",
    "Update - in scene actor's inventory that posess it."])
//--------------------------------------------------------------------------------------------
// Callback for action choice.
//
async function actionCallBack(selection) {
    const MODE = selection.split(" ")[0]
    if (!(MODE === ADD || MODE === DELETE || MODE === UPDATE)) {
        msg = `Mode setting (${MODE}) is not of allowed values: ${ADD}, ${DELETE}, or ${DELETE}`
        ui.notifications.error(msg);
        console.log(`${MACRONAME} || ${msg}`)
        return (false)
    }
    jez.log("Mode", MODE)

    //--------------------------------------------------------------------------------------------
    // Dialog to select the type of item that should be acted upon.
    //
    queryTitle = "Update or Add an Item to Actors in Scene"
    queryText = "What item of type of thing should be selected?<br>Please, pick one from list below."
    if (typesFound.length > 9)  // If 9 or less, use a radio button dialog
        await jez.pickFromListArray(queryTitle, queryText, typeCallBack, typesFound.sort())
    else
        await jez.pickRadioListArray(queryTitle, queryText, typeCallBack, typesFound.sort())
    //--------------------------------------------------------------------------------------------
    // Callback for the type selection dialog.
    //
    async function typeCallBack(itemType) {
        jez.log("typeCallBack", itemType)
        msg = `The type named <b>"${itemType}"</b> was selected in the dialog`
        //--------------------------------------------------------------------------------------------
        // Find all the item of type "itemType"
        //
        for (let i = 0; i < sActor.items.contents.length; i++) {
            jez.log(`${i} ${sActor.items.contents[i].data.type} ${sActor.items.contents[i].data.name}`)
            if (sActor.items.contents[i].data.type === itemType) itemsFound.push(sActor.items.contents[i].data.name)
        }
        jez.log(`Found ${itemsFound.length} ${itemType}(s)`, itemsFound.sort())
        //--------------------------------------------------------------------------------------------
        // From the Items found, ask which item should trigger opening a sheet.
        //
        queryTitle = "What specific item should be shared?"
        queryText = `Pick one from list of ${itemType} item(s) to be shared across Actors in this scene.  
        The next popup will allow selection of actors to receive/update the item.`
        if (itemsFound.length > 9)  // If 9 or less, use a radio button dialog
            await jez.pickFromListArray(queryTitle, queryText, itemCallBack, itemsFound.sort())
        else
            await jez.pickRadioListArray(queryTitle, queryText, itemCallBack, itemsFound.sort())
        //--------------------------------------------------------------------------------------------
        // 
        //
        function itemCallBack(itemSelected) {
            jez.log("typeCallBack", itemSelected)
            msg = `The item named <b>"${itemSelected}"</b> was selected in the dialog`
            //--------------------------------------------------------------------------------------------
            // Find the target item and stash the values for later
            //
            jez.log("Item Type", itemType)
            jez.log("Item Selected", itemSelected)
            targetItem = sActor.items.find(item => item.data.name === itemSelected && item.type === itemType)
            jez.log("Target Item", targetItem)
            //--------------------------------------------------------------------------------------------
            // Grab all the tokens on the current canvas, remove the token providing the reference copy
            //
            let allCanvasTokens = canvas.tokens.placeables
            let canvasTokens = []
            for (let i = 0; i < allCanvasTokens.length; i++) {
                jez.log(`(Token ${i + 1})`, allCanvasTokens[i].name)
                if (allCanvasTokens[i] === sToken) jez.log(`Excluding source token (${sToken.name})`, sToken)
                else canvasTokens.push(allCanvasTokens[i])
            }
            //--------------------------------------------------------------------------------------------
            // Filter the token list to remove tokens that lack the target item for modes: Delete & Update
            // Also, make sure MODE is of defined values (to protect future-me)
            //
            let filteredTokens = []
            if (MODE === "Delete" || MODE === "Update") {
                jez.log(`Filtering for MODE ${MODE}...`)
                for (let i = 0; i < canvasTokens.length; i++) {
                    jez.log(`Filtering (${i + 1})`, canvasTokens[i].name)
                    // Does the considered token have the specified item?
                    let itemFound = canvasTokens[i].actor.items.find(item => item.data.name === targetItem.data.name && item.type === itemType)
                    if (itemFound) {
                        jez.log(`Item ${targetItem.data.name} found on ${canvasTokens[i].name}`)
                        filteredTokens.push(canvasTokens[i])    // Store the token with confirmed item
                    } else jez.log(`Item ${targetItem.data.name} NOT found on ${canvasTokens[i].name}`)
                }
            } else filteredTokens = canvasTokens
            canvasTokens = filteredTokens.sort() // Set the original array to the filtered array.
            filteredTokens = []                  // Zero the array so its not accidentally reused.
            //jez.log(`After the reassignment, ${canvasTokens.length} elements`)
            //for (const TOKEN of canvasTokens) jez.log(TOKEN.name, TOKEN); // Dump array to console
            //--------------------------------------------------------------------------------------------
            // If the list size has dropped to zero, post a message and exit.
            //
            if (!canvasTokens.length) {
                msg = `There are no eligible tokens for ${MODE} operation on ${targetItem.data.name}`
                jez.log(msg)
                ui.notifications.info(msg);
                return (false)
            }
            //--------------------------------------------------------------------------------------------
            // Build an array of names for selection dialog to use.
            //
            let canvasTokensNames = []
            for (let i = 0; i < canvasTokens.length; i++) {
                jez.log(`(${i + 1})`, canvasTokens[i].name)
                canvasTokensNames.push(`${canvasTokens[i].name} (${canvasTokens[i].id})`)
            }
            //--------------------------------------------------------------------------------------------
            // Pop dialog to specify the tokens that will be operated on.
            //
            const queryTitle = `Select Tokens for ${MODE} Operation`
            const queryText = `Pick Tokens that should have ${itemSelected} of ${itemType} type operated on.`
            jez.pickCheckListArray(queryTitle, queryText, pickCheckListCallBack, canvasTokensNames.sort());
            //------- ---------------------------------------------------------------------------
            // Call back for selction of tokens to be acted upon dialog.
            //
            function pickCheckListCallBack(selection) {
                let tokenId = null
                let tokensIdsToUpdate = []
                let token5esToUpdate = [];
                jez.log("pickRadioCallBack", selection)
                let selectionString = ""
                for (let i = 0; i < selection.length; i++) {
                    if (selectionString) selectionString += "<br>"
                    selectionString += selection[i]
                }
                //----------------------------------------------------------------------------------------------
                // Build an array of the token IDs that correspond with the tokens that are going to be updated
                // Selection lines are of this form: Lecherous Meat Bag, Medium (eYstNJefUUgrHk8Q)
                //
                for (let i = 0; i < selection.length; i++) {
                    let tokenArray = []     // Array for tokens seperated by "(", there will be 2 or more
                    tokenArray = selection[i].split("(")
                    tokenId = tokenArray[tokenArray.length - 1].slice(0, -1)  // Chop off last character a ")"
                    tokensIdsToUpdate.push(tokenId)  // Stash tha actual tokenId from the selection line
                }
                jez.log(`${tokensIdsToUpdate.length} Token IDs to be Updated`)
                for (let i = 0; i < tokensIdsToUpdate.length; i++) jez.log(`--> ${i}`, tokensIdsToUpdate[i])
                //----------------------------------------------------------------------------------------------
                // Build an array of Tokens from the array of TokenIds just built.
                //
                for (let i = 0; i < tokensIdsToUpdate.length; i++) {
                    token5esToUpdate.push(canvas.tokens.placeables.find(ef => ef.id === tokensIdsToUpdate[i]))
                    msg += `${i + 1}) ${token5esToUpdate[i].name}<br>`
                }
                jez.log(`${token5esToUpdate.length} Tokens to be Updated`)
                for (let i = 0; i < token5esToUpdate.length; i++) jez.log(`==> ${i} ${token5esToUpdate[i].name}`, token5esToUpdate[i])
                //----------------------------------------------------------------------------------------------
                // Actually Perform the Updates
                //
                let msgAddendum = "";
                jez.log("targetItem", targetItem)
                for (let i = 0; i < token5esToUpdate.length; i++) {
                    jez.log("token5esToUpdate[i].actor", token5esToUpdate[i].actor)
                    if (MODE === "Delete") deleteItem(token5esToUpdate[i].actor, targetItem)
                    else replaceItem(token5esToUpdate[i].actor, targetItem)
                    msgAddendum += ` ${i + 1}) ${token5esToUpdate[i].name}<br>`
                }
                //----------------------------------------------------------------------------------------------
                // Build a summary message and post it
                //
                switch (MODE) {
                    case ADD: msg = `${token5esToUpdate.length} token(s) have had the item ${targetItem.name} added 
                    to their inventory from ${sToken.name}.<br><br>` + msgAddendum; break;
                    case UPDATE: msg = `${token5esToUpdate.length} token(s) have had the item ${targetItem.name} updated 
                    in their inventory from ${sToken.name}.<br><br>` + msgAddendum; break;
                    case DELETE: msg = `${token5esToUpdate.length} token(s) have had the item ${targetItem.name} deleted 
                    from their inventory.<br><br>` + msgAddendum; break;
                }
                jez.postMessage({
                    color: "green",
                    fSize: 14,
                    icon: "Icons_JGB/Misc/Jez.png",
                    msg: msg,
                    title: `${token5esToUpdate.length} Actor(s) have been updated`,
                })
            }
            //jez.postMessage({ color: "purple", fSize: 14, msg: msg, title: `Actors with ${itemSelected} ${itemType}` })
            jez.log(`Ending ${MACRONAME}`);
        }
    }
}
return
/*************************************************************************************
 * replaceItem
 * 
 * Replace or Add targetItem to inventory of actor5e passed as parms
 *************************************************************************************/
async function replaceItem(actor5e, targetItem) {
    //-------------------------------------------------------------------------------
    // Search for pre-existing item and delete it if found
    //
    /*let itemType = targetItem.type
    jez.log("itemType", itemType)
    let itemFound = actor5e.items.find(item =>
        item.data.name === targetItem.data.name && item.type === itemType)
    jez.log("itemFound", itemFound)
    if (itemFound) await itemFound.delete();*/
   await deleteItem(actor5e, targetItem)
    //-------------------------------------------------------------------------------
    // Create a copy of the item on the actor5e 
    //
    jez.log("targetItem", targetItem)
    jez.log("targetItem.data", targetItem.data)
    let rtn = await actor5e.createEmbeddedDocuments("Item", [targetItem.data]);
    jez.log("Return from create", rtn)
    return(rtn)
}
/*************************************************************************************
 * deleteItem
 * 
 * Delete targetItem to inventory of actor5e passed as parms
 *************************************************************************************/
 async function deleteItem(actor5e, targetItem) {
    let itemFound = actor5e.items.find(item =>
        item.data.name === targetItem.data.name && item.type === targetItem.type)
    if (itemFound) await itemFound.delete();
}