const MACRONAME = "Harness_Divine_Power.0.4.js";
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Crymic Macro that failed out of the box, subsequently heavily updated.
 * 
 *  Use Midi-qol + Item Macro. That will trigger resouce consumption.
 * 
 * 12/21/21 0.1 JGB Imported Crymic's code and began debugging
 * 12/22/21 0.2 JGB Add code to handle the no-selection, selection on the dialog
 * 12/??/22 0.3 JGB Unknown changes
 * 12/14/22 0.4 JGB Update to use library functions to handle resource usage (NPC side not tested)
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3**/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
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
let spendResource
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
    spendResource = await Dialog.confirm({ title: Q_TITLE, content: qText, });
    if (TL > 1) jez.trace(`${TAG} spendResource`, spendResource)
    if (spendResource === null) return jez.badNews(`${SPELL_NAME} cancelled by player.`, 'i')
    //-------------------------------------------------------------------------------------------------------------------------------
    // Deal with casting resource 
    //
    let spendResult
    if (spendResource) {
        if (TL > 1) jez.trace(`${TAG} Time to use a resource`)
        spendResult = await jez.resourceSpend(aActor.uuid, RESOURCE_NAME, aItem.uuid, { traceLvl: TL, quiet: true })
        switch (spendResult) {
            case null: console.log(`${aToken.name} is an NPC, can't decrement a resource`); break
            case true: console.log(`${aToken.name} is a PC & ${RESOURCE_NAME} resource decrimented`); break
            case false:
                // False indicates no resource configured on a PC --> exit this script
                console.log(`${aToken.name} is a PC but doesn't have ${RESOURCE_NAME} resource defined`);
                msg = `${aToken.name} is not configured with the '${RESOURCE_NAME}' resource to empower this effect.`
                postResults(msg)
                return jez.badNews(`${SPELL_NAME} cancelled for lack of defined '${RESOURCE_NAME}'`, 'w')
            case 0:
                // 0 indicates no charges remaining for resource on a PC --> exit this script
                console.log(`${aToken.name} has no available charges of ${RESOURCE_NAME}`);
                msg = `${aToken.name} lacks the needed charge of '${RESOURCE_NAME}' to empower this effect.`
                postResults(msg)
                return jez.badNews(`${SPELL_NAME} cancelled for lack of '${RESOURCE_NAME}' charges`, 'i')
            default: return jez.badNews()`resourceSpend returned unexpected value ${CONTINUE}`
        }
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Dialog to choose spell slot restored
    //
    await restoreSlot({ traceLvl: TL });
    //-------------------------------------------------------------------------------------------------------------------------------
    // All done
    //
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Restore a spell slot, maybe
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
async function restoreSlot(options={}) {
    const FUNCNAME = "restoreSlot(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Function variables
    //
    let inputText = "";
    //-------------------------------------------------------------------------------------------------------------------------------
    // Make sure we are a caster of some sort
    //
    if (aActor.data.data.spells.spell1.max === 0) return jez.badNews(`No spell slots found on ${aActor.data.token.name}`,'e');
    if (TL > 1) jez.trace(`${TAG} ${aActor.data.token.name} has spell slots`);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Do we have any restorable slots?  If so go about restoring, otherwise get on out of here, perhaps refunding a charge
    //
    if (hasAvailableSlot(actor)) {
        // Get options for available slots
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
        if (TL > 1) jez.trace(`${TAG} No spell slots to restore.  Was a resource spent? ${spendResource}, if so refund it.`)
        let refundResult
        if (spendResource) {
            refundResult = await jez.resourceRefund(aActor.uuid, RESOURCE_NAME, aItem.uuid, { traceLvl: TL, quiet: true })
            switch (refundResult) {
                case null: console.log(`${aToken.name} is an NPC, can't increment a resource`); break
                case true: console.log(`${aToken.name} is a PC & ${RESOURCE_NAME} resource incremented`); break
                case false: return jez.badNews(`This bit of code should be unreachable`, 'e');
                case 0: 
                    msg = `${aToken.name} is already at maximum charges of '${RESOURCE_NAME}', can not be refunded`
                    console.log(msg)
                    postResults(msg)
                    return jez.badNews(msg, 'i')
                default: return jez.badNews()`resourceRefund returned unexpected value ${refundResult}`
            }
            if (TL > 1) jez.trace(`${TAG} resourceRefund result`, refundResult)
        }
        msg = `${aToken.name} is not missing any spell slots. Use cancelled`
        postResults(msg)
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
            runVFX(aToken, parseInt(num))
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
    if (TL>1) jez.trace(`${FUNCNAME} --`, "aActor", aActor);
    for (let slot in aActor.data.data.spells)
        if (aActor.data.data.spells[slot].value < aActor.data.data.spells[slot].max) return true;
    return false;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Determine how many slots of a given level the actor has
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function getSpellSlots(aActor, level) {
    const FUNCNAME = "getSpellSlots(aActor, level)";
    if (TL>1) jez.trace(`${FUNCNAME} ---`, "aActor", aActor, "level", level);
    return aActor.data.data.spells[`spell${level}`];
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Increase the number of slots at a given level for the actor.
 * 
 * Return boolean, true for success.  Be careful if spellevel is falsey
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function spellRefund(aActor, spellLevel) {
    const FUNCNAME = "spellRefund(aActor, spellLevel)";
    if (TL>1) jez.trace(`${FUNCNAME} ---`, "aActor", aActor, "spellLevel", spellLevel);
    if (spellLevel) {
        let actor_data = duplicate(aActor.data._source);
        // actor_data.data.spells[`${spellLevel}`].value = actor_data.data.spells[`${spellLevel}`].value + 1;
        actor_data.data.spells[`${spellLevel}`].value++;
        await aActor.update(actor_data);
        if (TL>1) jez.trace(`${FUNCNAME} Refunded a level ${spellLevel} slot.`)
        return (true)
    }
    if (TL>1) jez.trace(`${FUNCNAME} No spell level was selected`)
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
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Launch the VFX effects
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
 async function runVFX(token, repeats) {
    new Sequence()
        .effect()
        .file("modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Regular_Orange_Caster_400x400.webm")
        .attachTo(token)
        .repeats(repeats,1000,2000)
        .scaleToObject(2.0)
        .opacity(1)
        .play();
}