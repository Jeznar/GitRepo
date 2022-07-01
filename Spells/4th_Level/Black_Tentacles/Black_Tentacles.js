const MACRONAME = "Black_Tentacles.0.5.js"
/*****************************************************************************************
 * Black Tentacles!
 * 
 *   Squirming, ebony tentacles fill a 20-foot square on ground that you can see within 
 *   range. For the duration, these tentacles turn the ground in the area into difficult 
 *   terrain.
 * 
 *   When a creature enters the affected area for the first time on a turn or starts its 
 *   turn there, the creature must succeed on a Dexterity saving throw or take 3d6 
 *   bludgeoning damage and be restrained by the tentacles until the spell ends.
 * 
 *   A creature that starts its turn in the area and is already restrained by the 
 *   tentacles takes 3d6 bludgeoning damage.
 * 
 *   A creature restrained by the tentacles can use its action to make a Strength or 
 *   Dexterity check (its choice) against your spell save DC. On a success, it frees 
 *   itself.
 * 
 * 03/28/22 0.1 Creation of Macro
 * 05/03/22 0.2 Update for FoundryVTT 9.x (Tile.create)
 * 06/03/22 0.3 Fixed bug introduced by using external macro (ItemMacro fixed it)
 * 06/29/22 0.4 Fix for permission issue on game.scenes.current.createEmbeddedDocuments & 
 *              canvas.scene.deleteEmbeddedDocuments
 * 07/01/22 0.5 Swap in calls to jez.tileCreate and jez.tileDelete
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
const ITEM_NAME = "Black Tentacles Effect"
const SPEC_ITEM_NAME = `%%${ITEM_NAME}%%`  // Name as expected in Items Directory 
const NEW_ITEM_NAME = `${aToken.name}'s ${ITEM_NAME}` // Name of item in actor's spell book
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
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
 * arguments.  The first will be a tile id.  The rest...???
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    const EFFECT = "Black Tentacles Effect" // Must match DAE effect applied by temp item
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const TILE_ID = args[1];    // Must be a 12 character string:  chN3vMQvayMx6kWQ
    jez.log(TILE_ID.length)
    if (TILE_ID.length != 16) return
    //-----------------------------------------------------------------------------------------------
    // Delete the tile we just built with library function. 
    //
    jez.tileDelete(TILE_ID)
    //----------------------------------------------------------------------------------------------
    // Delete the temporary item
    //
    let oldActorItem = aToken.actor.data.items.getName(NEW_ITEM_NAME)
    if (oldActorItem) await deleteItem(aToken.actor, oldActorItem)
    msg = `${NEW_ITEM_NAME} has been deleted from ${aToken.name}`
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
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const TEMPLATE_ID = args[0].templateId
    const TEMPLATE = canvas.templates.objects.children.find(i => i.data._id === TEMPLATE_ID);
    jez.log("Place the VFX Tile")
    const TILE_ID = await placeTile(TEMPLATE_ID, TEMPLATE.center);
    jez.log("TILE_ID", TILE_ID)
    copyEditItem(aToken)
    jez.log("Post message to a chat card")
    msg = `An At-Will Spell "${NEW_ITEM_NAME}" has been added to ${aToken.name}'s spell book`
    ui.notifications.info(msg);
    jez.log("Clear the flag that will be used to store token.id values of afflicted tokens")
    DAE.unsetFlag(aToken.actor, MACRO);                         // await??
    // Call function to modify concentration effect to delete the VFX tile on concetration removal
    modConcEffect(TILE_ID)
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
    const GRID_SIZE = canvas.scene.data.grid; // Size of grid in pixels per square
    let tileProps = { 
        x: templateCenter.x - GRID_SIZE/2,
        y: templateCenter.y - GRID_SIZE/2,
        img: "modules/jb2a_patreon/Library/4th_Level/Black_Tentacles/BlackTentacles_01_Dark_Purple_600x600.webm",
        width: GRID_SIZE * 5,
        height: GRID_SIZE * 5 // ditto
    }
    return await jez.tileCreate(tileProps)
}
/***************************************************************************************************
 * Each round, ask the GM if the afflicted actor wants to use its action to attemot to break out 
 * of the grapple from the tentacles.
 ***************************************************************************************************/
async function doEach() {
    const FUNCNAME = "doEach()";
    const CHECK_DC = args[1];
    const ORIGIN_TOKEN_ID = args[2]
    jez.log(`Check DC: ${CHECK_DC}, Origin Token ID: ${ORIGIN_TOKEN_ID}`)
    let strMod = await jez.getStatMod(aToken, "str");
    let dexMod = await jez.getStatMod(aToken, "dex");
    let chkStat = "Strength"; let chkSta = "str"; let chkMod = strMod
    let oToken = canvas.tokens.placeables.find(ef => ef.id === ORIGIN_TOKEN_ID)
    if (dexMod > strMod) { chkStat = "Dexterity"; chkSta = "dex"; chkMod = dexMod }
    jez.log(`------${FUNCNAME} Stats for escape check ------`, "chkStat", chkStat, "chkSta", chkSta, "chkMod", chkMod)
    const DIALOG_TITLE = `Does ${aToken.name} attempt to break restraint?`
    const DIALOG_TEXT = `The twisty tentacles are keeping <b>${aToken.name}</b> restrained, 
        damaging it each round. Does <b>${aToken.name}</b> want to use its
        action to attempt a ${chkStat} check against ${oToken.name}'s  Black Tentacles spell, 
        check <b>DC${CHECK_DC}?<br><br>`
    new Dialog({
        title: DIALOG_TITLE,
        content: DIALOG_TEXT,
        buttons: {
            yes: {
                label: "Attempt Escape", callback: async () => {
                    let flavor = `${aToken.name} uses this turn's <b>action</b> to attempt a 
                    ${CONFIG.DND5E.abilities[chkSta]} check vs <b>DC${CHECK_DC}</b> to end the 
                    effect from ${aItem.name}.`;
                    let check = (await aToken.actor.rollAbilityTest(chkSta,
                        { flavor: flavor, chatMessage: true, fastforward: true })).total;
                    jez.log("Result of check roll", check);
                    if (CHECK_DC < check) {
                        await aToken.actor.deleteEmbeddedDocuments("ActiveEffect", [LAST_ARG.effectId]);
                        jez.postMessage({
                            color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                            msg: `<b>${aToken.name}</b> succesfully broke free.<br>No longer ${RESTRAINED_JRNL}.`,
                            title: `Succesful Skill Check`, token: aToken
                        })
                    } else {
                        jez.postMessage({
                            color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                            msg: `<b>${aToken.name}</b> failed to break free.<br>Remains ${RESTRAINED_JRNL}.`,
                            title: `Failed Skill Check`, token: aToken,
                        })
                    }
                }
            },
            no: {
                label: "Ignore Tentacles", callback: async () => {
                    jez.postMessage({
                        color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                        msg: `<b>${aToken.name}</b> opted to ignore the Tentacles and remains ${RESTRAINED_JRNL}.`,
                        title: `Declined Skill Check`, token: aToken
                    })
                }
            },
        },
        default: "yes",
    }).render(true);
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