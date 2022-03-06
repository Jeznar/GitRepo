const MACRONAME = "Black_Tentacles.js"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";

const ITEM_NAME = "Black Tentacles Effect"
const SPEC_ITEM_NAME = `%%${ITEM_NAME}%%`  // Name as expected in Items Directory 
const NEW_ITEM_NAME = `${aToken.name}'s ${ITEM_NAME}` // Name of item in actor's spell book

//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//


//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;

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
 * arguments.  The first will be a tile id.  The rest...???
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    const EFFECT = "Black Tentacles Effect" // Must match DAE effect applied by temp item
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const TILE_ID = args[1];    // Must be a 12 character string:  chN3vMQvayMx6kWQ
    jez.log(TILE_ID.length)
    if (TILE_ID.length != 16) return

    jez.log(`Delete the VFX tile`, TILE_ID)
    await canvas.scene.deleteEmbeddedDocuments("Tile", [TILE_ID])
    //----------------------------------------------------------------------------------------------
    // Delete the temporary item
    //
    let oldActorItem = aToken.actor.data.items.getName(NEW_ITEM_NAME)
    if (oldActorItem) await deleteItem(aToken.actor, oldActorItem)
    msg = `An At-Will Spell "${NEW_ITEM_NAME}" has been deleted from ${aToken.name}`
    ui.notifications.info(msg);
    //----------------------------------------------------------------------------------------------
    // Grab the flag, clear the flag
    //
    let tokenIdArray = []
    let flagValue = await DAE.getFlag(aToken.actor, MACRO);     // Get the flag value
    if (flagValue) tokenIdArray = flagValue.split(" ")          // Populate array 
    await DAE.unsetFlag(aToken.actor, MACRO);                   // await??
    //----------------------------------------------------------------------------------------------
    // Loop through the IDs in flagValue, clearing the effect if present on each token
    //
    for (let i = 0; i < tokenIdArray.length; i++) {
        let tToken = canvas.tokens.placeables.find(ef => ef.id === tokenIdArray[i])
        jez.log(`Processing ${i}: ${tToken.name}`)
        let effect = await tToken.actor.effects.find(i => i.data.label === EFFECT);
        jez.log(`  ${EFFECT} found?`, effect)
        if (effect) {
            jez.log(`  ${EFFECT} found on ${aToken.name}, removing...`)
            effect.delete();  // await??
        } else jez.log(`  ${EFFECT} not found on ${aToken.name}, continuing...`)
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("A place for things to be done");
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const TEMPLATE_ID = args[0].templateId
    const TEMPLATE = canvas.templates.objects.children.find(i => i.data._id === TEMPLATE_ID);
    // Place the VFX Tile
    const TILE_ID = await placeTile(TEMPLATE_ID, TEMPLATE.center);
    jez.log("TILE_ID", TILE_ID)
    // Call function to modify concentration effect to delete the VFX tile on concetration removal
    modConcEffect(TILE_ID)
    // Add the atWill spell to spell book of aToken
    copyEditItem(aToken)
    // Clear the flag that will be used to store token.id values of afflicted tokens
    DAE.unsetFlag(aToken.actor, MACRO);                         // await??
    // Post message to a chat card
    msg = `An At-Will Spell "${NEW_ITEM_NAME}" has been added to ${aToken.name} for the duration of this spell`
    ui.notifications.info(msg);
    await postResults(msg)
    jez.log(`-------------- Finished --- ${MACRO} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
async function placeTile(TEMPLATE_ID, templateCenter) {
    canvas.templates.get(TEMPLATE_ID).document.delete();
    const GRID_SIZE = canvas.scene.data.grid; // Size of grid in pixels per square
    let newTile = await Tile.create({
        x: templateCenter.x,
        y: templateCenter.y,
        img: "modules/jb2a_patreon/Library/4th_Level/Black_Tentacles/BlackTentacles_01_Dark_Purple_600x600.webm",
        width: GRID_SIZE * 4,
        height: GRID_SIZE * 4 // ditto
    });
    jez.log("newTile", newTile);
    return(newTile[0].data._id);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
 async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("The do Each code")
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("The do On Use code")
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Modify existing effect to include a midi-qol overtime saving throw element
 ***************************************************************************************************/
async function modConcEffect(tileId) {
    const EFFECT = "Concentrating"
    //----------------------------------------------------------------------------------------------
    // Seach the token to find the just added effect
    //
    await jez.wait(400)
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
    //effect.data.changes.push({key: `macro.execute`, mode: CUSTOM, value:`entangle_helper ${VFX_NAME} ${label}`, priority: 20})
    effect.data.changes.push({key: `macro.itemMacro`, mode: CUSTOM, value:`${tileId}`, priority: 20})
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
    jez.log("Edit the item on the actor")
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
        'name': NEW_ITEM_NAME,
        'data.description.value': content,
        //'effects[0].value.data.label': NEW_ITEM_NAME
    }
    await aActorItem.update(itemUpdate)
    //-----------------------------------------------------------------------------------------------
    /*jez.log(`Change the label of ${SPEC_ITEM_NAME} to the desired ${NEW_ITEM_NAME}`)
    await jez.wait(1000)
    jez.log(" ")
    jez.log(`}}}} ${SPEC_ITEM_NAME} found on aActorItem?`, aActorItem)
    let effect = await aActorItem.data.effects.find(i => i.data.label === SPEC_ITEM_NAME);
    jez.log(" ")
    jez.log(`%%%% ${SPEC_ITEM_NAME} found?`, effect)
    if (!effect) {
        msg = `${SPEC_ITEM_NAME} sadly not found on ${aActorItem.name}`
        ui.notifications.error(msg);
        jez.log(" ")
        jez.log(`itemObj`,itemObj)
        postResults(msg);
        return (false);
    }
    let effectUpdate = {
        'label': NEW_ITEM_NAME
    }
    jez.log("effectUpdate",effectUpdate)
    effect.data.label = NEW_ITEM_NAME
    //await effect.update(effectUpdate)
    jez.log(" ")
    jez.log(`&&&& ${SPEC_ITEM_NAME} found?`, effect)*/
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