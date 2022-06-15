const MACRONAME = "Update_Item_on_Actors.js"
/******************************************************************************
 * Macro to find all actors who have a specified item and open their sheets
 * to make replacing items easier.
 * 
 * This macro should be run from the hotbar with a (one!) token of interest
 * selected in a scene.
 *
 * 12/03/21 0.1 Creation
 * 01/23/22 0.2 Add Front end to enter the item name
 * 01/30/22 0.3 Add Radio Button possibility and change calls to jez-lib funcs
 *****************************************************************************/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
console.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) console.log(`  args[${i}]`, args[i]);
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let itemFound = null;
let msg = ""
let queryTitle = ""
let queryText = ""
let type = ""
let item = ""
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
        msg = `Must select one token to be used to find the item that will be searched for.  Selected ${canvas.tokens.controlled.length}`
        console.log(msg)
        ui.notifications.warn(msg)
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
                itemFound = entity.items.find(item => item.data.name === itemSelected && item.type === itemType)
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
                // jez.log(`Update_Item_In_Sidebar(sActor.id, itemSelected, itemType)`, "sActor.name", sActor.name,"itemSelected", itemSelected, "itemType", itemType)
                if (!await Update_Item_In_Sidebar(sActor.id, itemSelected, itemType)) return(false)
                //----------------------------------------------------------------------------------------------
                // Update the selected actor's item
                //
                for (let line of actorsIdsToUpdate) await Push_Update(line, itemSelected, itemType);
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
async function Push_Update(targetActorId, nameOfItem, typeOfItem) {
    const FUNCNAME = "Push_Update(targetActorId, nameOfItem, typeOfItem)";
    // jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`,"targetActorId",targetActorId,"nameOfItem",nameOfItem,"typeOfItem",typeOfItem);
    //----------------------------------------------------------------------------------------------
    // Get Actor
    //
    let tActor = game.actors.get(targetActorId);
    if (!tActor) {
        msg = `Passed targetActorId "${targetActorId}" did find an actor data object`
        console.log(msg)
        ui.notifications.error(msg)
        return(false)
    }
    // jez.log("tActor",tActor)
    console.log(`Push_Update: Processing ${tActor.data.token.name}`) 
    //----------------------------------------------------------------------------------------------
    // Get Items
    //
    let itemOrigin = game.items.find(item => item.data.name === nameOfItem && item.type === typeOfItem);
    let itemTarget = tActor.items.find(item => item.data.name === nameOfItem && item.type === typeOfItem);
    //----------------------------------------------------------------------------------------------
    // Get Item Properties to Move
    //
    let updateSet = Create_Update_Object(itemOrigin, itemTarget, tActor);
    // jez.log("Update Set", updateSet);
    // jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (await itemTarget.update(updateSet))
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Build an update object for our item
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function Create_Update_Object(itemOrigin, itemTarget, tActor = null) {
    const FUNCNAME = "Create_Update_Object(itemOrigin, itemTarget, tActor = null)";
    // jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`,"itemOrigin", itemOrigin, "itemTarget", itemTarget, "tActor", tActor);
    let itemDescription = itemOrigin.data.data.description.value ?? null;
    let itemMacro = itemOrigin.data.flags?.itemacro ?? null;
    let itemAnimation = itemOrigin.data.flags?.autoanimations ?? null;
    //----------------------------------------------------------------------------------------------
    // Update the description field
    //
    if (itemDescription !== null && tActor !== null) {
        //------------------------------------------------------------------------------------------
        // If tActor is not set, we are updating the sidebar and don't want to replace place holder
        // strings.
        // jez.log("tActor.data.token.name", tActor.data.token.name)
        itemDescription = itemDescription.replace(/%TOKENNAME%/g, `${tActor.data.token.name}`);
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
            console.log(msg)
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
                    console.log(msg)
                    ui.notifications.info(msg)
                }
            }
            else {
                msg = `Reference is missing magic phrase in description, skipping ${tActor?.name}`
                console.log(msg)
                ui.notifications.warn(msg)
                return
            }
        }
    }
    //----------------------------------------------------------------------------------------------
    // Build item update object
    //
    let itemUpdate = {
        data: {
            description: {
                value: itemDescription
            }
        },
        flags: {
            itemacro: { macro: itemMacro?.macro },
            autoanimations: itemAnimation
        },
        //img: itemTarget.img,
    }
    // jez.log('Returning itemUpdate', itemUpdate);
    // jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`,"Returning itemUpdate", itemUpdate);
    return itemUpdate;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Update the item in the Item directory, sidebar.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function Update_Item_In_Sidebar(originActorId, nameOfItem, typeOfItem) {
    const FUNCNAME = "Update_Item_In_Sidebar(originActorId, nameOfItem, typeOfItem)";
    // jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`,"originActorId",originActorId,"nameOfItem",nameOfItem,"typeOfItem",typeOfItem);
    //----------------------------------------------------------------------------------------------
    // Get Actor data for provided ID
    //
    let originActor = game.actors.get(originActorId);
    // jez.log("originActor", originActor)
    //----------------------------------------------------------------------------------------------
    // Get Item data for provided name within the actor data, this is the "master" item
    //
    let itemOrigin = originActor.items.find(item => item.data.name === nameOfItem && item.type === typeOfItem);
    // jez.log("itemOrigin", itemOrigin, "itemOrigin.name", itemOrigin.name, "itemOrigin.id", itemOrigin.id);
    //----------------------------------------------------------------------------------------------
    // Get Item data from item in the sidebar
    //
    let itemInSidebar = game.items.find(item => item.data.name === nameOfItem && item.type === typeOfItem);
    if (!itemInSidebar) {
        msg = `Item for "${nameOfItem}" of type "${typeOfItem}" not found in Item Directory (sidebar),
        can not continue.`
        console.log(msg)
        ui.notifications.warn(msg)
        return(false)
    }
    //----------------------------------------------------------------------------------------------
    // Assemble the update object we need
    //
    let updateSet = Create_Update_Object(itemOrigin, itemInSidebar);
    //----------------------------------------------------------------------------------------------
    // Update the item in the sidebar with the item from the origin actor
    //
    await itemInSidebar.update(updateSet);
    // jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return(true)
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