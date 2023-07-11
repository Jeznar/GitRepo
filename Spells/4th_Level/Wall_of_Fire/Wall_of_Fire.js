const MACRONAME = "Wall_of_Fire.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Macro that automates a porttion of the wall of fire spell.  Specifically it manages a temporary spell that handles the damage 
 * bit of the spell.  It makes no attempt to show the spell on screen or to manage when the damage should be applied.
 * 
 * This macro uses OnUse to acomplish the following:
 * 1. Manage a temporary spell to inflict damage as an at-will spell ability
 * 2. Modify concentration to remove the temp spell on expiration
 * 3. Post a message about drawing the onscreen location of the wall
 * 
 * doOff is used to:
 * 1. Remove the temp spell
 * 2. Post message about spell termination.
 * 
 * 07/11/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
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
const SPELL_LEVEL = L_ARG?.spellLevel;
const SPELL_NAME = `Wall of Fire`
const TEMPLATE_NAME = `%%${SPELL_NAME} Damage%%`
const ATTACK_ITEM = `${SPELL_NAME} Damage`
const NUM_DICE = SPELL_LEVEL + 1
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
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
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Remove any preexisting copies of the temporary item
    //
    await jez.deleteItems(ATTACK_ITEM, "spell", aActor);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Slap the template item onto the actor
    //
    await jez.itemAddToActor(aToken, TEMPLATE_NAME)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the item's name and extract the comments from the description
    //
    let itemUpdate = {
        name: ATTACK_ITEM,                 // Change to actor specific name for temp item
    }
    await jez.itemUpdateOnActor(aToken, TEMPLATE_NAME, itemUpdate, "spell")
    //-------------------------------------------------------------------------------------------------------------------------------
    // Grab the data for the new item from the actor
    //
    let getItem = await jez.itemFindOnActor(aToken, ATTACK_ITEM, "spell");
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the description field
    //
    let description = getItem.data.data.description.value
    description = description.replace(/%NUMDICE%/g, `${NUM_DICE}`);         // Replace %NUMDICE%
    description = description.replace(/%ATOKEN%/g, `${aToken.name}`);       // Replace %ATOKEN%
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build a new itemUpdate Object
    //
    itemUpdate = {
        data: { 
            description: { 
                value: description 
            },
            damage: {
                parts: [[`${NUM_DICE}d8[fire]`,'fire']]
            }
        },  
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the item with new information
    //
    await jez.itemUpdateOnActor(aToken, ATTACK_ITEM, itemUpdate, "spell")
    //-------------------------------------------------------------------------------------------------------------------------------
    // Modify the just applied concentation effect to call this macro so that doOff can do its thing
    //
    const CON_EFFECT = "Concentrating"
    //-------------------------------------------------------------------------------------------------------------------------------
    // Seach the token to find the just added effect
    //
    await jez.wait(100)
    let conEffect = await aToken.actor.effects.find(i => i.data.label === CON_EFFECT);
    if (TL > 1) jez.log(`${TAG} **** ${CON_EFFECT} found?`, conEffect)
    if (!conEffect) return jez.badNews(`${CON_EFFECT} sadly not found on ${aToken.name}.`, "error")
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect. 
    //    
    conEffect.data.changes.push({key: `macro.itemMacro`, mode: jez.ADD, value:`Data field`, priority: 20})
    if (TL > 1) jez.log(`${TAG} conEffect.data.changes`, conEffect.data.changes)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply the modification to concentrating effect
    //
    const result = await conEffect.update({ 'changes': conEffect.data.changes });
    if (result && TL > 1) jez.log(`${TAG} Active Effect ${CON_EFFECT} updated!`, result);
    //-----------------------------------------------------------------------------------------------
    // Update the convenientDescription of the Concentrating effect to describe the spell
    //
    const CE_DESC = `Concentrating on Wall of Fire`
    await jez.setCEDesc(aActor, "Concentrating", CE_DESC, { traceLvl: TL });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `<b>${aToken.name}</b> has cast wall of fire at level ${SPELL_LEVEL}.  Players need to annotate the map appropriately.<br>
    <br>Casting actor needs to use its new, At-Will spell <i${ATTACK_ITEM}<\i> to inflict damage at appropriate times.`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Remove any preexisting copies of the temporary item
    //
    await jez.deleteItems(ATTACK_ITEM, "spell", aActor);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `<b>${aToken.name}</b>'s ${SPELL_NAME} has ended.  Players need to update map annotation appropriatly.`
    let title = `${SPELL_NAME} ended`
    jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img, msg: msg, title: title, token: aToken})
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}