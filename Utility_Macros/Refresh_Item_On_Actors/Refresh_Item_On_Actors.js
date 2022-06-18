const MACRONAME = "Refresh_Item_On_Actors.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Provide dialogs to select an item from selected actor.  That item is used as a reference to create
 * new versions on actors selected and also replacing it into the item directory (sidebar)
 * 
 * This macro should be run from the hotbar with a (one!) token of interest selected in a scene.
 * 
 * Here's the main flow of this beasty
 * - Item directory (sidebar) is searched for an item match (name & type) and checked for uniquness
 * - Match is deleted from sidebar, incidentally breaking any links to its item id
 * - Selected item is duplicated in sidebar and considered the reference from this point
 * - Each selected actor is searched for a unique copy of the item in question, skip if not unique
 * - Match on actor is scrapped for key information to be retained
 *   - preparation data, e.g. if the actor has it via pact magic want to retain that
 *   - uses data, i.e. stash any times per day or similar for reapplication
 *   - Quantity for Regeneration special case in the description
 * - Delete the match on the actor
 * - Create new item on actor by copying the reference item
 * - Update the new item with retained information from original
 * - Process the next selected actor
 *
 * 06/16/22 0.1 Creation
 * 06/17/22 0.2 Implment Zhell's suggested method, or close to it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
console.log(`       ============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) console.log(`  args[${i}]`, args[i]);
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let msg = ""
let queryTitle = ""
let queryText = ""
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
main();
// jez.log(`============== Finishing === ${MACRONAME} =================`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
async function preCheck() {
    if (canvas.tokens.controlled.length !== 1) {
        jez.badNews(`Must select one token to be used to find the item that will be searched for.  Selected ${canvas.tokens.controlled.length}`)
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: "Icons_JGB/Misc/Jez.png",
            msg: msg, title: `Try Again, Selecting One Token`,
        })
        return (false)
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Main function
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function main() {
    if (!preCheck()) return (false)
    //--------------------------------------------------------------------------------------------
    // Setup variables for main function & children
    //
    let sToken = canvas.tokens.controlled[0]
    // jez.log(`Source Token ${sToken.name}`, sToken);
    let sActor = sToken.actor
    let typesFound = []
    //--------------------------------------------------------------------------------------------
    // Read through all of the targets items to find all of the types represented
    //
    for (let i = 0; i < sActor.items.contents.length; i++) {
        // jez.log(`${i} ${sActor.items.contents[i].data.type} ${sActor.items.contents[i].data.name}`)
        if (!typesFound.includes(sActor.items.contents[i].data.type)) typesFound.push(sActor.items.contents[i].data.type)
    }
    // jez.log(`Found ${typesFound.length} types}`, typesFound.sort())
    //--------------------------------------------------------------------------------------------
    // Pop a dialog to select the type of thing to be operated on
    //
    queryTitle = "What item of type of thing?"
    queryText = "Please, pick one from list below."
    if (typesFound.length > 9)  // If 9 or less, use a radio button dialog
        await jez.pickFromListArray(queryTitle, queryText, typeCallBack, typesFound.sort())
    else
        await jez.pickRadioListArray(queryTitle, queryText, typeCallBack, typesFound.sort())
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * typeCallBack
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    async function typeCallBack(itemType) {
        msg = `typeCallBack: Type "${itemType}" was selected in the dialog`
        console.log(msg)
        let itemsFound = []
        //--------------------------------------------------------------------------------------------
        // If cancel button was selected on the preceding dialog, null is returned.
        //
        if (itemType === null) return; 
        //--------------------------------------------------------------------------------------------
        // If nothing was selected call preceding function and terminate this one
        //
        if (!itemType) {
            // jez.log("itemType",itemType)
            console.log("No selection passed to typeCallBack(itemType), trying again.")
            main();
            return;
        }
        //--------------------------------------------------------------------------------------------
        // Find all the item of type "itemType"
        //
        for (let i = 0; i < sActor.items.contents.length; i++) {
            // jez.log(`${i} ${sActor.items.contents[i].data.type} ${sActor.items.contents[i].data.name}`)
            if (sActor.items.contents[i].data.type === itemType) itemsFound.push(sActor.items.contents[i].data.name)
        }
        // jez.log(`Found ${itemsFound.length} ${itemType}(s)`, itemsFound.sort())
        //--------------------------------------------------------------------------------------------
        // From the Items found, ask which item should trigger opening a sheet.
        //
        queryTitle = "Sheets with with which item should be processed?"
        queryText = `Pick one from list of ${itemType} item(s)`
        if (itemsFound.length > 9)  // If 9 or less, use a radio button dialog
            await jez.pickFromListArray(queryTitle, queryText, itemCallBack, itemsFound.sort())
        else
            await jez.pickRadioListArray(queryTitle, queryText, itemCallBack, itemsFound.sort())
        /*********1*********2*********3*********4*********5*********6*********7*********8*********9******
         * itemCallBack
         *********1*********2*********3*********4*********5*********6*********7*********8*********9*****/
        function itemCallBack(itemSelected) {
            msg = `itemCallBack: Item named "${itemSelected}" was selected in the dialog`
            console.log(msg)
            let actorFullWithItem = [];
            //--------------------------------------------------------------------------------------------
            // If cancel button was selected on the preceding dialog, null is returned ==> Terminate
            //
            if (itemSelected === null) return;
            //--------------------------------------------------------------------------------------------
            // If nothing was selected call preceding function and terminate this one
            //
            if (!itemSelected) {
                console.log("No selection passed to itemCallBack(itemSelected), trying again.")
                typeCallBack(itemType);
                return;
            }
            //--------------------------------------------------------------------------------------------
            // Search all actors in the actor directory for our item/type combos
            //
            let allActors = game.actors
            for (let entity of allActors) {
                let itemFound = entity.items.find(item => item.data.name === itemSelected && item.type === itemType)
                if (itemFound) actorFullWithItem.push(`${entity.name} (${entity.id})`);
            }
            //--------------------------------------------------------------------------------------------
            // From the Items found, ask which item should trigger opening a sheet.
            //
            const Q_TITLE = "Select Actors to Update"
            const Q_TEXT = `Choose the actor(s) to have their ${itemSelected} of type ${itemType} updated to 
            that held by ${sToken.name}`
            jez.pickCheckListArray(Q_TITLE, Q_TEXT, pickCheckCallBack, actorFullWithItem);
            // jez.log(`Ending ${MACRONAME}`);
            /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
             * pickCheckCallBack
             *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
            async function pickCheckCallBack(selection) {
                msg = `pickCheckCallBack: ${selection.length} actor(s) selected in the dialog`
                console.log(msg)
                let actorsIdsToUpdate = [];
                let selectionString = ""
                //--------------------------------------------------------------------------------------------
                // If cancel button was selected on the preceding dialog, null is returned.
                //
                if (selection === null) return;
                //--------------------------------------------------------------------------------------------
                // If nothing was selected (empty array), call preceding function and terminate this one
                //
                if (selection.length === 0) {
                    console.log("No selection passed to pickCheckCallBack(selection), trying again.")
                    itemCallBack(itemSelected)  // itemSelected is a global that is passed to preceding func
                    return;
                }
                //--------------------------------------------------------------------------------------------
                // Build a string with <br> embedded between entries, other than last
                //
                for (let i = 0; i < selection.length; i++) {
                    if (selectionString) selectionString += "<br>"
                    selectionString += selection[i]
                }
                //----------------------------------------------------------------------------------------------
                // Build an array of the actor IDs that might be updated
                // Selection lines are of this form: Lecherous Meat Bag, Medium (eYstNJefUUgrHk8Q)
                //
                // jez.log('selection', selection)
                for (let i = 0; i < selection.length; i++) {
                    // jez.log(`${i + 1} ${selection[i]}`)
                    let actorArray = []     // Array for actors seperated by "(", there will be 2 or more
                    actorArray = selection[i].split("(")
                    let actorId = actorArray[actorArray.length - 1].slice(0, -1)  // Chop off last character a ")"
                    actorsIdsToUpdate.push(actorId)  // Stash tha actual actorId from the selection line
                }
                //----------------------------------------------------------------------------------------------
                // Update item in side bar, by calling a macro from this macro
                //
                // jez.log(`updateItemInSidebar(sActor.id, itemSelected, itemType)`, "sActor.name", sActor.name,"itemSelected", itemSelected, "itemType", itemType)
                if (!await updateItemInSidebar(sToken, itemSelected, itemType)) return(false)

                //----------------------------------------------------------------------------------------------
                // Update the selected actor's item
                //
                for (let line of actorsIdsToUpdate) await pushUpdate(line, itemSelected, itemType);
            }
        }
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Function to update a target actor's item with the origin actor's item. Should be used to quickly 
 * replace obsolete items. 
 * 
 * Called by main function in a loop to update all actors chosen by the user.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function pushUpdate(targetActorId, nameOfItem, typeOfItem) {
    //const FUNCNAME = "pushUpdate(targetActorId, nameOfItem, typeOfItem)";
    // jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`,"targetActorId",targetActorId,"nameOfItem",nameOfItem,"typeOfItem",typeOfItem);
    //----------------------------------------------------------------------------------------------
    // Get target Actor
    //
    let tActor = game.actors.get(targetActorId);
    if (!tActor) {
        msg = `Passed targetActorId "${targetActorId}" did find an actor data object`
        console.log(msg)
        ui.notifications.error(msg)
        return (false)
    }
    // jez.log("tActor",tActor)
    console.log(("***********************************************************************"))
    console.log(`*** pushUpdate: Processing ${tActor.data.token.name}`)
    //----------------------------------------------------------------------------------------------
    // Make sure the item exists and is unique within the target actor 
    //
    let matches = jez.itemMgmt_itemCount(tActor.items.contents, nameOfItem, typeOfItem)
    if (matches === 0) return jez.badNews(`"${nameOfItem}" of type "${typeOfItem}" not on ${tActor.name}, skipping.`)
    if (matches > 1)   return jez.badNews(`"${nameOfItem}" of type "${typeOfItem}" not unique on ${tActor.name}, skipping.`)
    //----------------------------------------------------------------------------------------------
    // Get Items, itemOrigin (reference) from sidebar and target from the tActor
    //
    let itemOrigin = game.items.find(item => item.data.name === nameOfItem && item.type === typeOfItem);
    let itemTarget = tActor.items.find(item => item.data.name === nameOfItem && item.type === typeOfItem);
    //----------------------------------------------------------------------------------------------
    // Fetcg Item Properties to Retain from target item and build an update
    //
    let updateSet = createUpdateObj(itemOrigin, itemTarget, tActor);
    // jez.log("Update Set", updateSet);
    // jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    // Now, inspired by Zhell's Discord thoughts...
    // https://discord.com/channels/170995199584108546/699750150674972743/987118754381058048
    // Delete the item from the target actor and copy reference item from the item directory.
    // await itemTarget.delete();
    // await tActor.createEmbeddedDocuments("Item", [itemOrigin.toObject()]);
    await itemTarget.update(itemOrigin.toObject())              // Update reference to match source
    //----------------------------------------------------------------------------------------------
    // itemTarget that was referenced has been destroyed, need to get the current version.
    //
    itemTarget = await tActor.items.find(item => item.data.name === nameOfItem && item.type === typeOfItem);
    //----------------------------------------------------------------------------------------------
    // Return to calling function while applying the update that was built
    //
    return (await itemTarget.update(updateSet))
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Build an update object for our item
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function createUpdateObj(itemOrigin, itemTarget, tActor = null) {
    const FUNCNAME = "createUpdateObj(itemOrigin, itemTarget, tActor = null)";
    // jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`,"itemOrigin", itemOrigin, "itemTarget", itemTarget, "tActor", tActor);
    let itemDescription = itemOrigin.data.data.description.value ?? null;
    //----------------------------------------------------------------------------------------------
    // Grab some of the settings of the target's item for reapplication
    //
    let itemPreparation = itemTarget.data.data.preparation ?? null;
    let itemUses = itemTarget.data.data.uses ?? null;
    //----------------------------------------------------------------------------------------------
    // Update the description field, if tActor is set, we are updating the sidebar and don't want to
    // alter the description.
    //
    if (itemDescription !== null && tActor !== null) {
        //----------------------------------------------------------------------------------------------
        // Replace the magic token, %TOKENNAME%, with the name of the token.
        //
        // itemDescription = itemDescription.replace(/%TOKENNAME%/g, `${tActor.data.token.name}`);
        let descObj = jez.replaceSubString(itemDescription, 'TOKENNAME', tActor.data.token.name, '%')
        // jez.log("descObj", descObj)
        if (descObj.count > 0)
            console.log(`Status  | Replaced "%TOKENNAME%" with ${tActor.data.token.name} ${descObj.count} time(s)`)
        itemDescription = descObj.string
        //----------------------------------------------------------------------------------------------
        // Consider special case created by DnD 5e Helpers for Regeneration effect:  If the item is
        // named "Regeneration" or "Self-Repair" then the description should contain the magic phrase
        // "X hit points", where X can be a static value or a dice formula.
        //
        // The magic phrase must be found and retained in the updated description...oh boy!
        //
        // Reg Ex string used by the DnD 5e Helpers module: 
        //   const regenRegExp = new RegExp(`([0-9]+|[0-9]*d0*[1-9][0-9]*) ${hitPointsString}`);
        //
        if (itemOrigin.name.startsWith("Regeneration") || itemOrigin.name.startsWith("Self-Repair")) {
            msg = `Special case for ${tActor.data.token.name}, item: ${itemOrigin.name}`
            console.log(`Status  | ${msg}`)
            ui.notifications.info(msg)
            const regenRegExp = new RegExp(`([0-9]+|[0-9]*d0*[1-9][0-9]*) hit points`);
            let originMagic = itemOrigin.data.data.description.value.match(regenRegExp);
            // jez.log("originMagic", originMagic)
            if (originMagic) {
                // jez.log(`Found magic phrase in master item, ${originMagic[0]}}`)
                let targetMagic = itemTarget.data.data.description.value.match(regenRegExp);
                // jez.log("targetMagic", targetMagic)
                if (targetMagic) {
                    // jez.log("Truthy")
                    const updateRegExp = new RegExp(`${originMagic[0]}`);
                    // jez.log("updateRegExp", updateRegExp)
                    itemDescription = itemDescription.replace(updateRegExp, targetMagic[0])
                }
                else {
                    // jez.log("Falsey")
                    msg = `Disturbingly, ${tActor.name} had no magic phrase in its description`
                    console.log(`Warning | ${msg}`)
                    ui.notifications.info(msg)
                }
            }
            else return jez.badNews(`Reference is missing magic phrase in description, skipping ${tActor?.name}`)
        }
    }
    //----------------------------------------------------------------------------------------------
    // Build item update object to return the protected fields to original values
    //
    let itemUpdate = {
        data: {
            description: {
                value: itemDescription      // Specially processed description
            },
            preparation: itemPreparation,   // Target's preperation information
            uses: itemUses,                 // Target's use information
        },
    }
    // jez.log('Returning itemUpdate', itemUpdate);
    // jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`,"Returning itemUpdate", itemUpdate);
    return itemUpdate;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Update the item in the Item directory, sidebar.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function updateItemInSidebar(tokenD, nameOfItem, typeOfItem) {
    const FUNCNAME = "updateItemInSidebar(tokenD, nameOfItem, typeOfItem)";
    // jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`,"originActorId",originActorId,"nameOfItem",nameOfItem,"typeOfItem",typeOfItem);
    console.log(("***********************************************************************"))
    console.log(`*** Update Sidebar Item ${typeOfItem} named ${nameOfItem}`)
    //----------------------------------------------------------------------------------------------
    // Get Item data for provided name within the actor data, this is the "master" item
    //
    let itemOrigin = tokenD.actor.items.find(item => item.data.name === nameOfItem && item.type === typeOfItem);
    // jez.log("itemOrigin", itemOrigin, "itemOrigin.name", itemOrigin.name, "itemOrigin.id", itemOrigin.id);
    //----------------------------------------------------------------------------------------------
    // Make sure the item exists and is unique within the sidebar 
    //
    let matches = jez.itemMgmt_itemCount(game.items.contents, nameOfItem, typeOfItem)
    if (matches === 0) return jez.badNews(`"${nameOfItem}" of type "${typeOfItem}" not in Item Directory, can not continue.`)
    if (matches > 1) return   jez.badNews(`"${nameOfItem}" of type "${typeOfItem}" not unique (found ${matches}) in Item Directory, can not continue.`)
    //----------------------------------------------------------------------------------------------
    // Get Item data from item in the sidebar
    //
    let itemInSidebar = game.items.find(item => item.data.name === nameOfItem && item.type === typeOfItem);
    if (!itemInSidebar) return jez.badNews(`"${nameOfItem}" of type "${typeOfItem}" not found in Item Directory, can not continue.`)
    //----------------------------------------------------------------------------------------------
    // Zhell's Discord thoughts...
    // https://discord.com/channels/170995199584108546/699750150674972743/987118754381058048
    //
    // itemInSidebar.delete()                                   // Delete the item in sidebar
    // await Item.createDocuments([itemOrigin.toObject()]);     // Create the item in sidebar
    await itemInSidebar.update(itemOrigin.toObject())           // Update reference to match source
    //----------------------------------------------------------------------------------------------
    // itemInSidebar that was referenced has been destroyed, need to get the current version.
    //
    itemInSidebar = game.items.find(item => item.data.name === nameOfItem && item.type === typeOfItem);
    if (!itemInSidebar) return jez.badNews(`New "${nameOfItem}" of type "${typeOfItem}" not found in Item Directory, can not continue.`)
    //----------------------------------------------------------------------------------------------
    // Update the description to replace instances of the token name with %TOKENNAME%
    //
    let itemDescription = itemInSidebar.data.data.description.value ?? null;
    let descObj = jez.replaceSubString(itemDescription, tokenD.name, '%TOKENNAME%')
    // jez.log("sidebar descObj", descObj)
    if (descObj.count > 0)
        console.log(`Status  | Replaced ${tokenD.name} with "%TOKENNAME%" ${descObj.count} time(s)`)
    itemDescription = descObj.string
    //----------------------------------------------------------------------------------------------
    // Build item update object
    //
    let itemUpdate = {
        data: {
            description: {
                value: itemDescription      // Specially processed description
            },
        },
    }
    // jez.log("Sidebar itemUpdate", itemUpdate)
    //----------------------------------------------------------------------------------------------
    // Update that sidebar item!
    //
    await itemInSidebar.update(itemUpdate)
    // jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Capitalize each first word in a string and return the result -- Seemingly broken 6/13/22
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
// function capitalize(input) {
//     // Separate words in string by the " " spaces between them.
//     const words = input.split(" ");
//     // For each word separated, capitalize the first letters and then join them together.
//     words.map((word) => {
//         return word[0].toUpperCase() + word.substring(1);
//     }).join(" ");
// }