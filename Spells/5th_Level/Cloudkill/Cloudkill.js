const MACRONAME = "Cloudkill.0.3.js"
/*****************************************************************************************
 * Cloudkill!
 * 
 *   You create a 20-foot-radius sphere of poisonous, yellow-green fog centered on a point 
 *   you choose within range. The fog spreads around corners. It lasts for the duration or 
 *   until strong wind disperses the fog, ending the spell. Its area is heavily obscured.
 * 
 *   When a creature enters the spell's area for the first time on a turn or starts its 
 *   turn there, that creature must make a Constitution saving throw. The creature takes 
 *   5d8 poison damage on a failed save, or half as much damage on a successful one. 
 *   Creatures are affected even if they hold their breath or don't need to breathe.
 * 
 *   The fog moves 10 feet away from you at the start of each of your turns, rolling 
 *   along the surface of the ground. The vapors, being heavier than air, sink to the 
 *   lowest level of the land, even pouring down openings.
 * 
 *   Higher Levels. When you cast this spell using a spell slot of 6th level or higher, 
 *   the damage increases by 1d8 for each slot level above 5th.
 * 
 * 03/28/22 0.1 Creation of Macro
 * 05/03/22 0.2 Update for FoundryVTT 9.x (Tile.create)
 * 06/29/22 0.3 Fix for permission issue on game.scenes.current.createEmbeddedDocuments & 
 *              canvas.scene.deleteEmbeddedDocuments
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 1;
jez.trc(2, trcLvl, `=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(3, trcLvl,`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
const ITEM_NAME = "Cloudkill Effect"
const SPEC_ITEM_NAME = `%%${ITEM_NAME}%%`               // Name as expected in Items Directory 
const NEW_ITEM_NAME = `${aToken.name}'s ${ITEM_NAME}`   // Name of item in actor's spell book
const GRID_SIZE = canvas.scene.data.grid;               // Size of grid in pixels/square (e.g. 70)
const FEET_PER_GRID = 5                                 // Feet per on canvas grid
//--------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
//if (args[0] === "each") doEach();					    // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 async function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.log("##### chatMsg",chatMsg)
    await jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * doOff is expected to be called when concentration drops and should remove the items passed as 
 * arguments, the first will be a tile id.  It also needs to delete the temporary item.
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    // Delete the cloudkill tile
    //
    const TILE_ID = args[1];    // Must be a 12 character string:  chN3vMQvayMx6kWQ
    jez.log(TILE_ID.length)
    if (TILE_ID.length != 16) return
    jez.log(`Delete the VFX tile`, TILE_ID)
    // Following line throws a permission error for non-GM acountnts running this code.
    // await canvas.scene.deleteEmbeddedDocuments("Tile", [TILE_ID])
    await jez.deleteEmbeddedDocs("Tile", [TILE_ID])  
    //----------------------------------------------------------------------------------------------
    // Delete the temporary item
    //
    let oldActorItem = aToken.actor.data.items.getName(NEW_ITEM_NAME)
    if (oldActorItem) await deleteItem(aToken.actor, oldActorItem)
    msg = `${NEW_ITEM_NAME} has been deleted from ${aToken.name}`
    ui.notifications.info(msg);

    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const TEMPLATE_ID = args[0].templateId
    const TEMPLATE = canvas.templates.objects.children.find(i => i.data._id === TEMPLATE_ID);
    //-----------------------------------------------------------------------------------------------
    // If template is a circle, figure out the HARD_OFFSET value to move from center to top left 
    //
    const GRID_SIZE = canvas.scene.data.grid;               // Size of grid in pixels/square (e.g. 70)
    const FEET_PER_GRID = 5                                 // Feet per on canvas grid
    let topLeft = {}
    if (TEMPLATE.data.t = "circle") {
        let radius = TEMPLATE.data.distance               // e.g. Cloudkill 20 
        let centerX = TEMPLATE.data.x
        let centerY = TEMPLATE.data.y
        topLeft.x = centerX - GRID_SIZE * radius / FEET_PER_GRID
        topLeft.y = centerY - GRID_SIZE * radius / FEET_PER_GRID
    } else {
        topLeft.x = TEMPLATE.center.x;
        topLeft.y = TEMPLATE.center.y;
    }
    //----------------------------------------------------------------------------------------------
    jez.log("Place the VFX Tile")
    const TILE_ID = await placeTile(TEMPLATE_ID, topLeft);
    //----------------------------------------------------------------------------------------------
    copyEditItem(aToken)
    jez.log("Post message to a chat card")
    msg = `An At-Will Spell "${NEW_ITEM_NAME}" has been added to ${aToken.name}'s spell book`
    ui.notifications.info(msg);
    //----------------------------------------------------------------------------------------------
    jez.log("Call function to modify concentration effect to delete the VFX tile on concetration removal")
    modConcEffect(TILE_ID)
    //----------------------------------------------------------------------------------------------
    msg = `<b>${NEW_ITEM_NAME}</b> has been added to ${aToken.name}'s spell book, as an At-Will spell.`
    await postResults(msg)
    jez.log(`-------------- Finished --- ${MACRO} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
async function placeTile(TEMPLATE_ID, templateCenter) {
    const FUNCNAME = "placeTile(TEMPLATE_ID, templateCenter)";
    jez.trc(2,trcLvl,`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    jez.trc(3,trcLvl,"Parameters","TEMPLATE_ID",TEMPLATE_ID,"templateCenter",templateCenter)

    canvas.templates.get(TEMPLATE_ID).document.delete();
    let tileProps = {        
        x: templateCenter.x,
        y: templateCenter.y,
        img: "modules/jb2a_patreon/Library/1st_Level/Fog_Cloud/FogCloud_03_Regular_Green02_800x800.webm",
        width: GRID_SIZE * 8,   // 20 foot across
        height: GRID_SIZE * 8   // 20 foot tall 
    }
    // let newTile = await Tile.create(tileProps)   // Depricated 
    // Following line throws a permission error for non-GM acountnts running this code.
    // let newTile = await game.scenes.current.createEmbeddedDocuments("Tile", [tileProps]);  // FoundryVTT 9.x 
    let existingTiles = game.scenes.current.tiles.contents
    let newTile = await jez.createEmbeddedDocs("Tile", [tileProps])
    jez.trc(3, "jez.createEmbeddedDocs returned", newTile);
    if (newTile) {
        let returnValue = newTile[0].data._id
        jez.trc(2,`--- Finished --- ${MACRONAME} ${FUNCNAME} --- Generated:`,returnValue);
        return returnValue; // If newTile is defined, return the id.
    }
    else {   // newTile will be undefined for players, so need to fish for a tile ID
        let gameTiles = i = null
        let delay = 5
        for (i = 1; i < 20; i++) {
            await jez.wait(delay)   // wait for a very short time and see if a new tile has appeared
            jez.trc(3,trcLvl,`Seeking new tile, try ${i} at ${delay*i} ms after return`)
            gameTiles = game.scenes.current.tiles.contents
            if (gameTiles.length > existingTiles.length) break
        }
        if (i === 40) return jez.badNews(`Could not find new tile, sorry about that`,"warn")
        jez.trc(3,trcLvl,"Seemingly, the new tile has id",gameTiles[gameTiles.length - 1].id)
        let returnValue = gameTiles[gameTiles.length - 1].id
        jez.trc(2,trcLvl,`--- Finished --- ${MACRONAME} ${FUNCNAME} --- Scraped:`,returnValue);
        return returnValue
    }   
}
/***************************************************************************************************
 * Modify existing effect to include a midi-qol overtime saving throw element
 ***************************************************************************************************/
async function modConcEffect(tileId) {
    const EFFECT = "Concentrating"
    //----------------------------------------------------------------------------------------------
    // Seach the token to find the just added effect
    //
    await jez.wait(1000)
    let effect = await aToken.actor.effects.find(i => i.data.label === EFFECT);
    jez.log(`**** ${EFFECT} found?`, effect)
    if (!effect) {
        msg = `${EFFECT} sadly not found on ${aToken.name}.`
        ui.notifications.error(msg);
        postResults(msg);
        return (false);
    }
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect. In this case, a world macro that will be
    // given arguments: VFX_Name and Token.id for all affected tokens
    //    
    //effect.data.changes.push({key: `macro.execute`, mode: jez.CUSTOM, value:`entangle_helper ${VFX_NAME} ${label}`, priority: 20})
    effect.data.changes.push({key: `macro.itemMacro`, mode: jez.CUSTOM, value:`${tileId}`, priority: 20})
    jez.log(`effect.data.changes`, effect.data.changes)
    //----------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result) jez.log(`Active Effect ${EFFECT} updated!`, result);
}
/***************************************************************************************************
 * Copy the temporary item to actor's spell book and edit it as appropriate
 ***************************************************************************************************/
async function copyEditItem(token5e) {
    const FUNCNAME = "copyEditItem()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    let oldActorItem = token5e.actor.data.items.getName(NEW_ITEM_NAME)
    if (oldActorItem) await deleteItem(token5e.actor, oldActorItem)
    //----------------------------------------------------------------------------------------------
    jez.log("Get the item from the Items directory and slap it onto the active actor")
    let itemObj = game.items.getName(SPEC_ITEM_NAME)
    if (!itemObj) {
        msg = `Failed to find ${SPEC_ITEM_NAME} in the Items Directory`
        ui.notifications.error(msg);
        postResults(msg)
        return (false)
    }
    console.log('Item5E fetched by Name', itemObj)
    await replaceItem(token5e.actor, itemObj)
    //----------------------------------------------------------------------------------------------
    jez.log("Find the item on the actor")
    let aActorItem = token5e.actor.data.items.getName(SPEC_ITEM_NAME)
    jez.log("aActorItem", aActorItem)
    if (!aActorItem) {
        msg = `Failed to find ${SPEC_ITEM_NAME} on ${token5e.name}`
        ui.notifications.error(msg);
        postResults(msg)
        return (false)
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
        'name': NEW_ITEM_NAME,              // Change to actor specific name for temp item
        'data.description.value': content,  // Drop in altered description
        'data.level': LAST_ARG.spellLevel,  // Change spell level of temp item 
        'data.damage.parts' : [[`${LAST_ARG.spellLevel}d8`, "poison"]]
    }
    jez.log("itemUpdate",itemUpdate)
    await aActorItem.update(itemUpdate)
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