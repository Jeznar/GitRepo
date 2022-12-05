const MACRONAME = "Swap_Senses.0.3.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Swap vision from the active token to the actor specified by ID doOnUse() and reverse doOff()
 * 
 * 08/30/22 0.1 Creation of Macro
 * 09/02/22 0.2 Add support for CHAIN_MASTER_VOICE
 * 12/04/22 0.3 Added message & avoid error message when familiar is not found in scene 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor;
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const SPELL_NAME = `Find Familiar`
const CHAIN_MASTER_VOICE = "Invocation: Voice of the Chain Master"
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
  * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    // Get the Familiar data, or falsy
    //
    let famToken = await getFamiliarData({ traceLvl: TL })
    if (!famToken) {
        if (TL > 1) jez.trace(`${TAG} Cleaning up, since familiar is MIA`);
        deleteTempSpells({ traceLvl: TL })
        postResults(`Could not find familiar`)
        let existingEffect = aActor.effects.find(ef => ef.data.label.startsWith("Swap Senses "))
        if (existingEffect) existingEffect.delete()
        return
    }
    if (TL > 2) jez.trace(`${TAG} Familiar Token data`, famToken);
    //--------------------------------------------------------------------------------------------------
    // Does the caster have the CHAIN_MASTER_VOICE feature?  Set boolean appropriately
    //
    let chainMasterVoice = false   // Boolean flag indicating caster has CHAIN_MASTER_VOICE invocation
    if (aActor.items.find(i => i.name === CHAIN_MASTER_VOICE)) chainMasterVoice = true
    //-----------------------------------------------------------------------------------------------
    // If the caster lacks CHAIN_MASTER_VOICE, make sure the familiar is no further than 100 feet
    //
    if (!chainMasterVoice) {
        let distance = jez.getDistance5e(aToken, famToken)
        if (TL > 2) jez.trace(`${TAG} Distance to the familiar: ${distance}`);
        if (distance > 100) {
            let existingEffect = aActor.effects.find(ef => ef.data.label.startsWith("Swap Senses "))
            if (TL > 1) jez.trace(`${TAG} Existing effect`, existingEffect);
            if (existingEffect) {
                if (TL > 1) jez.trace(`${TAG} Deleting existing effect`);
                let rc = await existingEffect.delete()
                if (TL > 1) jez.trace(`${TAG} Deleting rc`, rc);
            }
            jez.badNews(`${famToken.name} is more than 100 feet away. Attempt to share senses failed.`, "i")
            return
        }
    }
    //-----------------------------------------------------------------------------------------------
    // Activate vision on the familiar, deactivate vision on the caster
    //
    await famToken.document.update({ vision: true });
    await aToken.document.update({ vision: false });
    //-----------------------------------------------------------------------------------------------
    // Post descriptive message
    //
    if (TL > 3) jez.trace(`${TAG} More Detailed Trace Info.`)
    msg = `<b>${aToken.name}</b> is sharing <b>${famToken.name}</b>'s, senses.  ${aToken.name} can see 
    and hear what ${famToken.name} can, but is blind and deaf while doing so.`
    postResults(msg)
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Reverse the vision swap that was performed by doOnUse()
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff() {
    const FUNCNAME = "doOff()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
    //-----------------------------------------------------------------------------------------------
    // Get the Familiar data, or falsy
    //
    let famToken = await getFamiliarData({ traceLvl: TL })
    if (!famToken) return
    if (TL > 2) jez.trace(`${TAG} Familiar Token data`, famToken);
    //-----------------------------------------------------------------------------------------------
    // Deactivate vision on the familiar, activate vision on the caster
    //
    await famToken.document.update({ vision: false });
    await aToken.document.update({ vision: true });
    //-----------------------------------------------------------------------------------------------
    // Post descriptive message
    //
    msg = `<b>${aToken.name}</b>'s vision and hearing returns to normal.`
    jez.postMessage({
        color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img,
        msg: msg, title: `Senses Return to Normal`, token: aToken
    })
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Obtain the data for existing familiar
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function getFamiliarData(options = {}) {
    const FUNCNAME = "getFamiliarData(options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Look for an existing Find_Familiar effect on the caster and dig into it to find the id of our
    // familiar's token.
    //
    existingEffect = aActor.effects.find(ef => ef.data.label === SPELL_NAME)
    if (!existingEffect) {
        deleteTempSpells({ traceLvl: TL })
        return jez.badNews(`Seemingly no active familiar is defined`, 'i')
    }
    if (TL > 1) jez.trace(`${TAG} existingEffect data`, existingEffect);
    famTokId = existingEffect.data.changes[0].value.split(" ")[1]   // Second token must be a tokenID
    if (TL > 2) jez.trace(`${TAG} Token ID of our familiar: ${famTokId}`);
    //-----------------------------------------------------------------------------------------------
    // Make sure the familiar exists and grab its data
    //
    let famToken = canvas.tokens.placeables.find(ef => ef.id === famTokId)
    if (!famToken) return jez.badNews(`Could not find familiar token (${famTokId})`)
    if (TL > 2) jez.trace(`${TAG} Familiar Token data`, famToken)
    //-----------------------------------------------------------------------------------------------
    // Send back our results
    //
    return (famToken)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Delete existing temporary spell items, if any.  They must be at-will spells that start with 
 * NEW_SPELL_PREFIX
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function deleteTempSpells(options = {}) {
    const FUNCNAME = "deleteTempSpell(options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Delete all of the at-will spells that start with NEW_SPELL_PREFIX
    //
    const NEW_SPELL_PREFIX = "Swap Senses with"
    let itemFound = null
    while (itemFound = aActor.items.find(item => item.data.name.startsWith(NEW_SPELL_PREFIX) &&
        item.type === "spell" && item.data.data.preparation.mode === "atwill")) {
        await jez.wait(100) // Let things settle a moment
        await itemFound.delete();
        jez.badNews(`At-Will Spell "${itemFound.name}" has been deleted from ${aToken.name}'s spell book`, 'i')
        await jez.wait(50)
    }
}