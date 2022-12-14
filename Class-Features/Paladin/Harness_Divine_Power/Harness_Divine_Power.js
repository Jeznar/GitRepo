const MACRONAME = "Harness_Divine_Power.0.3.js";
/*******************************************************************************************
 * Crymic Macro that failed out of the box, subsequently heavily updated.
 * 
 *  Use Midi-qol + Item Macro. That will trigger resouce consumption.
 * 
 * 12/21/21 0.1 JGB Imported Crymic's code and began debugging
 * 12/22/21 0.2 JGB Add code to handle the no-selection, selection on the dialog
 *******************************************************************************************/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 3;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const SPELL_NAME = `Harness Divine Power`
const ACTOR_DATA = await aActor.getRollData();
const RESOURCE_NAME = "Channel Divinity";
const IS_NPC = (aToken.document._actor.data.type === "npc") ? true : false;
const PROF = Math.ceil(ACTOR_DATA.prof / 2);
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    await jez.wait(100)
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Ask if a resource should be consumed 
    //
    const Q_TITLE = `Consume Resource?`
    let qText = `<p>${aToken.name} is using <b>${SPELL_NAME}</b> to Restore a Spell Slot. This typically
    consumes a <b>${RESOURCE_NAME}</b> charge.</b></p>
    <p>If you want to spend the charge (or use the NPC alternative), click <b>"Yes"</b>.</p>
    <p>If you want to bypass spending the charge (with GM permission) click <b>"No"</b>.</p>
    <p>If you want to cancel the spell click <b>"Close"</b> (top right of dialog).</p>`
    const SPEND_RESOURCE = await Dialog.confirm({ title: Q_TITLE, content: qText, });
    if (TL > 1) jez.trace(`${TAG} SPEND_RESOURCE`, SPEND_RESOURCE)
    if (SPEND_RESOURCE === null) return jez.badNews(`${SPELL_NAME} cancelled by player.`, 'i')
    //-------------------------------------------------------------------------------------------------------------------------------
    // Deal with casting resource -- this needs to consider NPC and PC data structures
    //
    if (SPEND_RESOURCE) {
        const CONTINUE = await spendResource({ traceLvl: TL })
        if (!CONTINUE) return jez.badNews(`${SPELL_NAME} cancelled for lack of ${RESOURCE_NAME} charge`, 'w')
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Dialog to choose spell slot restored
    //
    restoreSlot({traceLvl: TL});
    //-------------------------------------------------------------------------------------------------------------------------------
    // Final message
    //
    msg = `Maybe say something useful...`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Restore a spell slot, maybe
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
async function restoreSlot(options={}) {
    const FUNCNAME = "doEach(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let inputText = "";
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    if (aActor.data.data.spells.spell1.max === 0)
        return ui.notifications.error(`No spell slots found on ${aActor.data.token.name}`);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    if (hasAvailableSlot(actor)) {
        // Get options for available slots
        if (TL > 1)
            jez.trace(`${TAG} ${aActor.data.token.name} has spell slots`);
        for (let i = 1; i <= PROF; i++) {
            let chosenSpellSlots = getSpellSlots(aActor, i);
            let minSlots = chosenSpellSlots.value;
            let maxSlots = chosenSpellSlots.max;
            if (TL > 1)
                jez.trace(`${TAG} ${i} Spell slots ${minSlots} / ${maxSlots}`, chosenSpellSlots);
            if (minSlots != maxSlots) {
                inputText += `<div class="form-group"><label for="spell${i}">
                    Spell Slot Level ${i} [${minSlots}/${maxSlots}]</label>
                    <input id="spell${i}" name="spellSlot" value="${i}" 
                    type="radio"></div>`;
            }
        }
        //---------------------------------------------------------------------------------------------------------------------------
        // 
        //
        if (TL > 1) jez.trace(`${TAG} Build a dialog`);
        new Dialog({
            title: aItem.name,
            content: `<form><p>Choose 1 spell slot to restore</p><hr>${inputText}</form>`,
            buttons: {
                recover: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Recover",
                    callback: dialogCallback(spellRefund, aActor)
                }
            }
        }).render(true);
    } else {
        return ui.notifications.warn(`You aren't missing any spell slots.`);
    }
}

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Callback Function for the dialog
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function dialogCallback(spellRefund, aActor) {
    return async (html) => {
        let selected_slot = html.find('input[name="spellSlot"]:checked');
        let slot = "";
        let num = "";
        let msg = "";
        for (let i = 0; i < selected_slot.length; i++) {
            slot = selected_slot[i].id;
            num = selected_slot[i].value;
            if (TL > 1) jez.trace(`${TAG} ${i} slot ${slot} ${num}`)
        }
        let refunded = await spellRefund(aActor, slot)
        if (TL > 1) jez.trace(`${TAG} Refunded`, refunded);
        if (refunded) {
            if (TL > 1) jez.trace(`${TAG} Refunding spell level ${slot} to ${aActor.data.token.name}`)
            msg = `<div><b>${aActor.data.token.name}</b> regains 1 spell slot, <b>Level ${num}</b>.</div>`;
            postResults(msg);
        } else {
            msg = `<b>${aActor.data.token.name}</b> did not select a spell level to recover. <b>No action taken.</b>`
            if (TL > 1) jez.trace(`${TAG}`,msg);
            postResults(msg);
            ui.notifications.warn(msg);
        }
    };
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Determine if the actor has an available spell slot
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function hasAvailableSlot(aActor) {
    const FUNCNAME = "hasAvailableSlot(aActor)";
    if (TL>1) jez.trace(`${TAG} ---------------------------------------------------------------------------`,
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "aActor", aActor);
    for (let slot in aActor.data.data.spells) {
        if (aActor.data.data.spells[slot].value < aActor.data.data.spells[slot].max) {
            return true;
        }
    }
    return false;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Determine how many slots of a given level the actor has
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function getSpellSlots(aActor, level) {
    const FUNCNAME = "getSpellSlots(aActor, level)";
    if (TL>1) jez.trace(`${TAG} ---------------------------------------------------------------------------`,
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "aActor", aActor,
        "level", level);
    return aActor.data.data.spells[`spell${level}`];
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Increase the number of slots at a given level for the actor.
 * 
 * Return boolean, true for success.  Be careful if spellevel is falsey
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function spellRefund(aActor, spellLevel) {
    const FUNCNAME = "spellRefund(aActor, spellLevel)";
    if (TL>1) jez.trace(`${TAG} ---------------------------------------------------------------------------`,
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "aActor", aActor,
        "spellLevel", spellLevel
    );

    if (spellLevel) {
        let actor_data = duplicate(aActor.data._source);
        // actor_data.data.spells[`${spellLevel}`].value = actor_data.data.spells[`${spellLevel}`].value + 1;
        actor_data.data.spells[`${spellLevel}`].value++;
        await aActor.update(actor_data);
        if (TL>1) jez.trace(`${TAG} Refunded a level ${spellLevel} slot.`)
        return (true)
    }
    if (TL>1) jez.trace(`${TAG} No spell level was selected`)
    return (false)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Spend the resource
 * 
 * Returns an array of the options available
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 async function spendResource(options = {}) {
    const FUNCNAME = "spendResource(options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //---------------------------------------------------------------------------------------------------
    // Function variables
    //
    let resourceSlot = null
    let curtRes, curtMax
    //--------------------------------------------------------------------------------------------
    //
    if (IS_NPC) {   // Process resources for an NPC
        const ITEM_USES = await jez.getItemUses(FEATURE, { traceLvl: TL })
        if (TL > 2) jez.trace(`${TAG} Resource Values for NPC: ${aToken.name}`, "ITEM_USES", ITEM_USES)
        curtRes = ITEM_USES.value;
        curtMax = ITEM_USES.max;
    }
    else {
        let resourceList = [{ name: "primary" }, { name: "secondary" }, { name: "tertiary" }];
        let resourceValues = Object.values(ACTOR_DATA.resources);
        let resourceTable = mergeObject(resourceList, resourceValues);
        let findResourceSlot = resourceTable.find(i => i.label.toLowerCase() === RESOURCE_NAME.toLowerCase());
        if (!findResourceSlot) return jez.badNews(`${TAG} ${RESOURCE_NAME} Resource is missing on 
        ${aToken.name}, Please add it.`);
        resourceSlot = findResourceSlot.name;
        curtRes = ACTOR_DATA.resources[resourceSlot].value;
        curtMax = ACTOR_DATA.resources[resourceSlot].max;
        if (TL > 2) jez.trace(`${TAG} Resource Values for PC: ${aToken.name}`,
            "resourceList     ", resourceList,
            "resourceTable    ", resourceTable,
            "findResourceSlot ", findResourceSlot)
    }
    if (TL > 2) jez.trace(`${TAG} Resource Values`,
        "curtRes ", curtRes,
        "curtMax ", curtMax)
    if (curtRes < 1) return false;
    //-----------------------------------------------------------------------------------------------
    // Decrement our resource -- this needs to consider NPC and PC data structures
    //
    if (IS_NPC) {   // Decrement resource for an NPC
        jez.setItemUses(FEATURE, curtRes - 1, { traceLvl: TL })
    }
    else {          // Decrement resource for a PC
        let updates = {};
        let resources = VERSION > 9 ? `system.resources.${resourceSlot}.value` :
            `data.resources.${resourceSlot}.value`;
        updates[resources] = curtRes - 1;
        await aActor.update(updates);
    }
    await jez.wait(300);
    return true
}