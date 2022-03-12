const MACRONAME = "Electrify"
jez.log(MACRONAME)
/*****************************************************************************************
 * Homebrew Spell from Occultist list
 * 
 * 03/11/22 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log("")
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
jez.log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";
const GAME_RND = game.combat ? game.combat.round : 0;
const SAVE_DC = aToken.actor.data.data.attributes.spelldc;
const SAVE_TYPE = "con";
const COND_APPLIED = "Stunned"
const COND_ICON = aItem.img
const DAM_TYPE = "lightning";
const SPELL_LVL = LAST_ARG?.spellLevel ? LAST_ARG.spellLevel : 2
const TEMP_SPELL = "Shocking Grasp"               // Name as expected in Items Directory 
const NEW_SPELL = `${MACRO}'s ${TEMP_SPELL}`       // Name of item in actor's spell book
jez.log("CONSTANTS Set", "GAME_RND", GAME_RND, "SAVE_DC", SAVE_DC, "SAVE_TYPE", SAVE_TYPE,
    "COND_ICON", COND_ICON, "DAM_TYPE", DAM_TYPE, "SPELL_LVL", SPELL_LVL)
// VFX Settings -------------------------------------------------------------------
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_BEAM = "jb2a.electric_arc.01"
const VFX_CASTER = "jb2a.static_electricity.01.blue"
const VFX_OPACITY = 1.0;
const VFX_SCALE = 0.35;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
let returnFunc = null
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "DamageBonus") {
    let returnFunc = await doBonusDamage();    // DAE Damage Bonus
    return(returnFunc)
}
jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //------------------------------------------------------------------------------------------------
    // Launch VFX on caster
    // 
    let existingEffect = await aToken.actor.effects.find(ef => ef.data.label === aItem.name);
    if (existingEffect) {
        msg = `<b>${aToken.name}</b> already has ${aItem.name}. Terminating.`;
        ui.notifications.warn(msg)
        postResults(msg);
        return
    }
    //------------------------------------------------------------------------------------------------
    // Launch VFX on caster
    // 
    new Sequence()
        .effect()
        .file(VFX_CASTER)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        .persist()
        //.repeats(3,1000)
        .fadeIn(2000)
        .fadeOut(2000)
        .name(VFX_NAME)          // Give the effect a uniqueish name
        .play()
    //-------------------------------------------------------------------------------------------------
    // Define and apply the effect
    // 
    let effectData = [{
        changes: [
            { key: "flags.dnd5e.DamageBonusMacro", mode: 0, value: `ItemMacro.${aItem.name}`, priority: 20 },
            { key: "flags.midi-qol.itemDetails", mode: 0, value: `${LAST_ARG.uuid}`, priority: 20 },
            { key: "macro.itemMacro", mode: CUSTOM, value: "arbitrary_paramater", priority: 20 },
        ],
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 1, seconds: 6, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: { dae: { itemData: aItem, specialDuration: ["1Hit:msak", "1Hit:mwak"] } },
        icon: aItem.img,
        label: aItem.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: effectData });
    //-------------------------------------------------------------------------------------------------
    // Add the shocking grasp spell to spell book
    // 
    msg = `An At-Will Spell "${NEW_SPELL}" has been added to ${aToken.name} for the duration of this spell`
    ui.notifications.info(msg);
    copyEditItem(aToken)
    //-------------------------------------------------------------------------------------------------
    // Post completion message
    // 
    msg = `${aToken.name} channels lightning into his/her hands.`
    await jez.addMessage(game.messages.get(args[args.length - 1].itemCardId),
                   {color:"darkblue",fSize:14,msg:msg,tag:"saves"})
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "doBonusDamage"
 ***************************************************************************************************/
async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    if (args[0].tag === "DamageBonus") {
        //------------------------------------------------------------------------------------------
        // Only applies to melee weapon and spell attacks
        // Action Types: mwak, msak, rwak, rsak
        jez.log("")
        jez.log("-------------------")
        jez.log("LAST_ARG.item.data.actionType",LAST_ARG.item.data.actionType)
        jez.log("-------------------")
        jez.log("")
        let actionType = LAST_ARG.item.data.actionType
        if (!(actionType === "mwak" || actionType === "msak")) {
            msg = `<b>${actionType.toUpperCase()}</b> action does not trigger ${aItem.name} damage.`;
            ui.notifications.info(msg)
            jez.log(msg)
            return
        }
        let tToken = canvas.tokens.get(LAST_ARG.hitTargets[0].id);
        jez.log("tToken", tToken)
        let itemUuid = getProperty(LAST_ARG.actor.flags, "midi-qol.itemDetails");
        let itemN = await fromUuid(itemUuid);
        jez.log("itemN =====>", itemN)
        let numDice = LAST_ARG.isCritical ? 2 : 1;
        await jez.wait(500);
        //--------------------------------------------------------------------------------------------
        // Launch VFX on target
        // 
        new Sequence()
        .effect()
            .atLocation(aToken)
            .reachTowards(tToken)
            .scale(1)
            .file(VFX_BEAM)
            .waitUntilFinished(-4000) 
            .belowTokens(false)
        .effect()
            .atLocation(tToken)
            .repeats(3,1500)
            .scale(0.7)
            .file("jb2a.dizzy_stars.200px.blueorange")
        .play()
        //-------------------------------------------------------------------------------------------------------------
        // Apply Stunned condition if save is failed
        //   
        const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} DC${SAVE_DC} to avoid ${MACRO}'s ${COND_APPLIED}`;
        let saveRoll = (await tToken.actor.rollAbilitySave("con", { flavor:FLAVOR }))
        jez.log("saveRoll", saveRoll)
        if (saveRoll.total < SAVE_DC) game.cub.addCondition("Stunned", tToken);
        modStunnedEffect(tToken)
        //-------------------------------------------------------------------------------------------------------------
        // Dig through the chat history, to find the message that should have new message added...but don't use it?
        //
        let msgHistory = [];
        game.messages.reduce((list, message) => {
            if (message.data?.flags["midi-qol"]?.itemId === aItem._id && message.data.speaker.token === aToken.id) list.push(message.id);
            return list;
        }, msgHistory);
        //-------------------------------------------------------------------------------------------------------------
        // Return Extra Damage function
        //
        jez.log(`-------------- Finishing(Extra Damage))--- ${MACRONAME} ${FUNCNAME} -----------------`,
            "numDice", numDice, "DAM_TYPE", DAM_TYPE, "itemN.name", itemN.name);
        return { damageRoll: `${numDice}d10[${DAM_TYPE}]`, flavor: `(${itemN.name} (${CONFIG.DND5E.damageTypes[DAM_TYPE]}))` };
    }
    jez.log(`-------------- Finished(Bottom)--- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Modify existing effect to include a special duration of turnStart  
 ***************************************************************************************************/
async function modStunnedEffect(token5e) {
    const EFFECT = "Stunned"
    await jez.wait(100)
    let effect = await token5e.actor.effects.find(i => i.data.label === EFFECT);
    effect.data.flags.dae.specialDuration = ["turnStart"]
    effect.data.changes.push({key: `macro.CUB`, mode: CUSTOM, value:`Reactions - None`, priority: 20})
    const result = await effect.update({ 'flags.dae.specialDuration': effect.data.flags.dae.specialDuration,
                                         'effect.data.changes': effect.data.changes});
    if (result) jez.log(`>>> Active Effect ${EFFECT} updated!`, result);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //-------------------------------------------------------------------------------------------------------------
    // End the effect on the active token
    //  
    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });
    //-----------------------------------------------------------------------------------------------
    // Delete the temporary ability from the actor's spell book
    //
    let itemFound = aActor.items.find(item => item.data.name === NEW_SPELL && item.type === "spell")
    jez.log("itemFound", itemFound)
    if (itemFound) {
        await itemFound.delete();
        msg = `An At-Will Spell "${NEW_SPELL}" has been deleted from ${aToken.name}'s spell book`
        ui.notifications.info(msg);
    }

    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Copy the temporary item to actor's spell book and edit it as appropriate
 ***************************************************************************************************/
 async function copyEditItem(token5e) {
    const FUNCNAME = "copyEditItem(token5e)";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    let oldActorItem = token5e.actor.data.items.getName(NEW_SPELL)
    if (oldActorItem) await deleteItem(token5e.actor, oldActorItem)
    //----------------------------------------------------------------------------------------------
    jez.log("Get the item from the Items directory and slap it onto the active actor")
    let itemObj = game.items.getName(TEMP_SPELL)
    if (!itemObj) {
        msg = `Failed to find ${TEMP_SPELL} in the Items Directory`
        ui.notifications.error(msg);
        postResults(msg)
        return (false)
    }
    console.log('Item5E fetched by Name', itemObj)
    await replaceItem(token5e.actor, itemObj)
    //----------------------------------------------------------------------------------------------
    jez.log("Edit the item on the actor")
    let aActorItem = token5e.actor.data.items.getName(TEMP_SPELL)
    jez.log("aActorItem", aActorItem)
    if (!aActorItem) {
        msg = `Failed to find ${TEMP_SPELL} on ${token5e.name}`
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
        'name': NEW_SPELL,
        'data.description.value': content,
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