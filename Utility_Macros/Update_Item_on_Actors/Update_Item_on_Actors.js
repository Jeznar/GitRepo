const MACRONAME = "Update_Item_on_Actors.0.5.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Provide dialogs to select an item from selected actor.  That item is used as a reference to use
 * to update select fields on actors selected and also the item directory (sidebar)
 * 
 * This macro should be run from the hotbar with a (one!) token of interest
 * selected in a scene.
 *
 * 06/16/22 0.4 Updates
 * 06/21/22 0.5 Change to use jez.selectItemOnActor(sToken, promptObj, workHorse)
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
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
    let promptObj = {
        title1: "What item of type of thing should be Updated?",
        // text1 : "Please, pick item type from list below.",
        title2: "Which specific item should be Updated?",
        // text2 : "Pick one from list of items of the type picked in previous dialog.",
        // title3: "Select Actors to receive refreshed item.",
        // text3 : "Choose the actor(s) to have their item refreshed to match the selected item"
    }
    //--------------------------------------------------------------------------------------------
    // Start the real efforts
    //
    Dialog.confirm({
        title: "Update Item on Actors' Sheets",
        content: `<p>This macro will lead you through selecting an item located on 
        <b>${sToken.name}</b>'s actor's sheet.  It will then find all actors in the actor's 
        directory that have that item and ask you to select those that you would like those 
        that you want to update the item on.</p>
        <p>If you commit the update, the version of the item in the Item Directory (sidebar) 
        will first be updated from ${sToken.name}'s copy of the item. Then the item on the 
        selected actors will be updated from the sidebar.</p>
        <p>
        <ul>
        <li>Description -- See below</li>
        <li>Item Macro -- Update macro body to match source</li>
        <li>Animations -- Update animations to match source</li>
        </ul>
        </p><p>
        The description will be customized if it contains the 
        token's name, %TOKENNAME%, or is a special case REGENERATION item.</p>
        <p>Would you like to continue?</p>`,
        yes: () => jez.selectItemOnActor(sToken, promptObj, workHorse),
        no: () => console.log("You choose ... poorly"),
        defaultYes: true
    });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Use Selection Information...
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 async function workHorse(dataObj) {
    const FUNCNAME = "workHorse()";
    // jez.log(`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`, "dataObj.sToken",dataObj.sToken,"dataObj.idArray", dataObj.idArray, "dataObj.itemName", dataObj.itemName, "dataObj.itemType", dataObj.itemType)
    //----------------------------------------------------------------------------------------------
    // Update item in side bar, by calling a macro from this macro
    //
    if (!await updateItemInSidebar(dataObj.sToken, dataObj.itemName, dataObj.itemType)) return (false);
    //----------------------------------------------------------------------------------------------
    // Update the selected actor's item, all of the selected actors
    //
    for (let line of dataObj.idArray) await pushUpdate(line, dataObj.itemName, dataObj.itemType);
    // jez.log(`--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Function to update a target actor's item with the origin actor's item. Should be used to quickly 
 * replace obsolete items. 
 * 
 * Called by main function in a loop to update all actors chosen by the user.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
// async function pushUpdate(targetActorId, nameOfItem, typeOfItem) {
async function pushUpdate(targetActorId, nameOfItem, typeOfItem) {
    const FUNCNAME = "pushUpdate(targetActorId, nameOfItem, typeOfItem)";
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
    console.log(("***********************************************************************"))
    console.log(`*** pushUpdate: Processing ${tActor.data.token.name}`) 
    //----------------------------------------------------------------------------------------------
    // Make sure the item exists and is unique within the actor 
    //
    let matches = jez.itemMgmt_itemCount(tActor.items.contents, nameOfItem, typeOfItem) 
    if (matches === 0) {
        msg = `Item "${nameOfItem}" of type "${typeOfItem}" not on actor ${tActor.name}, very odd, skipping.`
        console.log(msg)
        ui.notifications.warn(msg)
        return(false)
    }
    if (matches > 1) {
        msg = `Item "${nameOfItem}" of type "${typeOfItem}" not unique on ${tActor.name}, skipping.`
        console.log(msg)
        ui.notifications.warn(msg)
        return(false)
    }
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
        // itemDescription = itemDescription.replace(/%TOKENNAME%/g, `${tActor.data.token.name}`);
        let descObj = jez.replaceSubString(itemDescription, 'TOKENNAME', tActor.data.token.name,'%')
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
    if (itemDescription !== null && tActor === null) { // Replace token name with %TOKENNAME%
        //----------------------------------------------------------------------------------------------
        // Update the description to replace instances of the token name with %TOKENNAME%
        //
        let sToken = canvas.tokens.controlled[0]
        let tokenName = sToken.name
        // jez.log("tokenName", tokenName)
        let descObj = jez.replaceSubString(itemDescription, sToken.name, '%TOKENNAME%')
        // jez.log("sidebar descObj", descObj)
        if (descObj.count > 0)
            console.log(`Status  | Replaced ${sToken.name} with "%TOKENNAME%" ${descObj.count} time(s)`)
        itemDescription = descObj.string
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
async function updateItemInSidebar(tokenD, nameOfItem, typeOfItem) {
    const FUNCNAME = "updateItemInSidebar(tokenD, nameOfItem, typeOfItem)";
    // jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`,"originActorId",originActorId,"nameOfItem",nameOfItem,"typeOfItem",typeOfItem);
    console.log(("***********************************************************************"))
    console.log(`*** Update Item in Sidebar: ${nameOfItem} of type ${typeOfItem}`) 
    //----------------------------------------------------------------------------------------------
    // Get Item data for provided name within the actor data, this is the "master" item
    //
    // let itemOrigin = originActor.items.find(item => item.data.name === nameOfItem && item.type === typeOfItem);
    let itemOrigin = tokenD.actor.items.find(item => item.data.name === nameOfItem && item.type === typeOfItem);
    // jez.log("itemOrigin", itemOrigin, "itemOrigin.name", itemOrigin.name, "itemOrigin.id", itemOrigin.id);
    //----------------------------------------------------------------------------------------------
    // Make sure the item exists and is unique within the sidebar 
    //
    let matches = jez.itemMgmt_itemCount(game.items.contents, nameOfItem, typeOfItem)
    if (matches === 0) {
        msg = `Item for "${nameOfItem}" of type "${typeOfItem}" not in Item Directory (sidebar), can not continue.`
        console.log(msg)
        ui.notifications.warn(msg)
        return(false)
    }
    if (matches > 1) {
        msg = `Item for "${nameOfItem}" of type "${typeOfItem}" not unique in Item Directory (sidebar), can not continue.`
        console.log(msg)
        ui.notifications.warn(msg)
        return(false)
    }
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
    // jez.log('Sidebar Item', itemInSidebar)
    //----------------------------------------------------------------------------------------------
    // Assemble the update object we need
    //
    let updateSet = Create_Update_Object(itemOrigin, itemInSidebar);
    // jez.log('Sidebar updates', updateSet)
    //----------------------------------------------------------------------------------------------
    // Update the item in the sidebar with the item from the origin actor
    //
    await itemInSidebar.update(updateSet);
    // jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return(true)
}