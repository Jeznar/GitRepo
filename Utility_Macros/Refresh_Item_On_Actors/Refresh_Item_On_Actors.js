const MACRONAME = "Refresh_Item_On_Actors.0.6.js"
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
 *   - consumption data, e.g. data on the consumables used by a item
 *   - preparation data, e.g. if the actor has it via pact magic want to retain that
 *   - uses data, i.e. stash any times per day or similar for reapplication
 *   - Quantity for Regeneration special case in the description
 *   - magic property flag setting
 * - Delete the match on the actor
 * - Create new item on actor by copying the reference item
 * - Update the new item with retained information from original
 * - Process the next selected actor
 * 
 * TODO: 
 *  2. Dialog to select fields to protect
 * 
 * 06/16/22 0.1 Creation
 * 06/17/22 0.2 Implment Zhell's suggested method, or close to it.
 * 06/20/22 0.3 Pull dialogs and selection into a function that can be moved to jez-lib
 * 06/26/22 0.4 Report on what is actually protected 
 * 06/26/22 0.5 Retain the Magic setting
 * 06/26/22 0.6 Add special handling of finesse weapons
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
console.log(`       ============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) console.log(`  args[${i}]`, args[i]);
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let msg = ""
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
    // let sActor = sToken.actor
    let promptObj = {
        // title1: "What item of type of thing should be Refreshed?",
        // text1 : "Please, pick item type from list below.",
        // title2: "Which specific item should be Refreshed?",
        // text2 : "Pick one from list of items of the type picked in previous dialog.",
        // title3: "Select Actors to receive refreshed item.",
        // text3 : "Choose the actor(s) to have their item refreshed to match the selected item"
    }
    //--------------------------------------------------------------------------------------------
    // Start the real efforts
    //
    Dialog.confirm({
        title: "Refresh Item on Actors' Sheets",
        content: `<p>This macro will lead you through selecting an item located on 
        <b>${sToken.name}</b>'s actor's sheet.  It will then find all actors in the actor's 
        directory that have that item and ask you to select those that you would like those 
        that you want to refresh the item on.</p>
        <p>If you commit the refresh, the version of the item in the Item Directory (sidebar) 
        will first be refreshed from ${sToken.name}'s copy of the item. Then the item on the 
        selected actors will be refreshed from the sidebar.</p>
        <p>Certain fields will be retained from each actor's version of the item:
        </p><p>
        <ul>
        <li>Consumption -- components consumed to use item</li>
        <li>Preperation -- method of preperation, e.g. pact magic</li>
        <li>Uses -- number of uses per period</li>
        <li>Magic Property -- setting of the magic property flag.</li>
        <li>Finesse Property -- Stat set to actors best of STR/DEX.</li>
        </ul>
        </p><p>
        The description will be customized if it contains the token's name, %TOKENNAME%, or is 
        a special case REGENERATION item.<p>
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
    // Refresh item in side bar
    //
    if (!await updateItemInSidebar(dataObj.sToken, dataObj.itemName, dataObj.itemType)) return (false);
    //----------------------------------------------------------------------------------------------
    // Refresh the selected actor's item, all of the selected actors
    //
    for (let line of dataObj.idArray) await pushUpdate(line, dataObj.itemName, dataObj.itemType);
    // jez.log(`--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Update the item in the Item directory, sidebar.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 async function updateItemInSidebar(tokenD, nameOfItem, typeOfItem) {
    const FUNCNAME = "updateItemInSidebar(tokenD, nameOfItem, typeOfItem)";
    // jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`,"tokenD",tokenD,"nameOfItem",nameOfItem,"typeOfItem",typeOfItem);
    console.log(("***********************************************************************"))
    console.log(`*** Refresh Sidebar Item ${typeOfItem} named ${nameOfItem}`)
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
    //----------------------------------------------------------------------------------------------
    // Perform the actual update
    //
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
    // Grab some of the settings of the items for reapplication
    //
    let itemTargetPrep = itemTarget.data.data.preparation ?? null;
    let itemTargetUses = itemTarget.data.data.uses ?? null;
    let itemTargetConsume = itemTarget.data.data.consume ?? null;
    let itemTargetMagic = itemTarget.data.data.properties.mgc ?? null;
    let itemTargetFinesse = itemTarget.data.data.properties.fin ?? null;
    let itemOriginPrep = itemOrigin.data.data.preparation ?? null;
    let itemOriginUses = itemOrigin.data.data.uses ?? null;
    let itemOriginConsume = itemOrigin.data.data.consume ?? null;
    let itemOriginMagic = itemOrigin.data.data.properties.mgc ?? null;
    let itemOriginFinesse = itemOrigin.data.data.properties.fin ?? null;  
    //----------------------------------------------------------------------------------------------
    // Special handling for Finesse weapon
    //
    let modStat = "str"
    if (itemOriginFinesse) {
        // Need to set itemTarget.data.data.ability appropriately
        if (jez.getStatMod(tActor,"dex") > jez.getStatMod(tActor,"str")) modStat = "dex"
    }
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
    // Report to console what is actually being retained from original
    //
    // jez.log('Origin Data',"itemOriginPrep",itemOriginPrep,"itemOriginUses",itemOriginUses,"itemOriginConsume",itemOriginConsume)
    if (!isEqual(itemTargetPrep, itemOriginPrep))       console.log(`Status  | Prep retained   :`, itemTargetPrep)
    if (!isEqual(itemTargetUses, itemOriginUses))       console.log(`Status  | Uses retained   :`, itemTargetUses)
    if (!isEqual(itemTargetConsume, itemOriginConsume)) console.log(`Status  | Consume retained:`, itemTargetConsume)
    if (!isEqual(itemTargetMagic, itemOriginMagic))     console.log(`Status  | Magic retained  :`, itemTargetMagic)
    //----------------------------------------------------------------------------------------------
    // Build item update object to return the protected fields to original values
    //
    let itemUpdate = {
        data: {
            description: {
                value: itemDescription      // Specially processed description
            },
            consume: itemTargetConsume,     // Targets consumption data 
            preparation: itemTargetPrep,    // Target's preparation information
            uses: itemTargetUses,           // Target's use information
            properties: {
                mgc: itemTargetMagic        // Target's setting of the magic flag on item
            },
        },
    }
    if (itemOriginFinesse) {
        console.log(`Status  | Finesse Stat Pic:`, modStat)
        itemUpdate.data.ability = modStat // str or dex if this is a finesse weapon
    }
    // jez.log('Returning itemUpdate', itemUpdate);
    // jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`,"Returning itemUpdate", itemUpdate);
    return itemUpdate;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Somewhat simple minded object comparison function based on one found online.
 * https://medium.com/geekculture/object-equality-in-javascript-2571f609386e
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function isEqual(obj1, obj2) {
    // jez.log("isEqual(obj1, obj2)","obj1",obj1,"obj1 type",typeof(obj1),"obj2",obj2,"obj2 type",typeof(obj2))
    if (!obj1 && !obj2) {
        // jez.log("obj1 & obj2 are falsey, return true")
        return true 
    } else if (!obj1 || !obj2) {
        // jez.log("one of obj1 & obj2 are falsey, return false")
        return false
    }
    // jez.log("continue")

    var props1 = Object.getOwnPropertyNames(obj1);
    // jez.log("props1",props1)
    var props2 = Object.getOwnPropertyNames(obj2);
    // jez.log("props2",props2)

    if (props1.length != props2.length) {
        // jez.log("length mismatch, return false")
        return false;
    }
    for (var i = 0; i < props1.length; i++) {
        let val1 = obj1[props1[i]];
        // jez.log("val1",val1)

        let val2 = obj2[props1[i]];
        // jez.log("val2",val2)

        let isObjects = isObject(val1) && isObject(val2);
        //jez.log("isObject",isObject)
        if (((isObjects && !isEqual(val1, val2)) || (!isObjects && val1 !== val2)) 
              && !(!val1 && !val2)) {
            // jez.log("Not sure what this case is, return false")
            return false;
        } // jez.log("Alternative result, continue")
    }
    // jez.log("made it, return true")
    return true;
    function isObject(object) {
        // jez.log("==> object",object)
        return object != null && typeof object === 'object';
      }
}