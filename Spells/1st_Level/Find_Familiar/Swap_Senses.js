const MACRONAME = "Swap_Senses.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Swap vision from the active token to the actor specified by ID doOnUse() and reverse doOff()
 * 
 * 08/30/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
const TL = 5;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL>1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl: TL});          // Midi ItemMacro On Use
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
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    // Get the Familiar data, or falsy
    //
    let famToken = await getFamiliarData({traceLvl: TL})
    if (!famToken) return 
    if (TL>2) jez.trace(`${TAG} Familiar Token data`, famToken);
    //-----------------------------------------------------------------------------------------------
    // Activate vision on the familiar, deactivate vision on the caster
    //
    await famToken.document.update({ vision: true });
    await aToken.document.update({ vision: false });
    //-----------------------------------------------------------------------------------------------
    // Post descriptive message
    //
    if (TL>3) jez.trace(`${TAG} More Detailed Trace Info.`)
    msg = `<b>${aToken.name}</b> is sharing <b>${famToken.name}</b>'s, senses.  ${aToken.name} can see 
    and hear what ${famToken.name} can, but is blind and deaf while doing so.`
    postResults(msg)
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Reverse the vision swap that was performed by doOnUse()
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOff() {
    const FUNCNAME = "doOff()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>0) jez.trace(`${TAG} --- Starting ---`);
    //-----------------------------------------------------------------------------------------------
    // Get the Familiar data, or falsy
    //
    let famToken = await getFamiliarData({traceLvl: TL})
    if (!famToken) return 
    if (TL>2) jez.trace(`${TAG} Familiar Token data`, famToken);
    //-----------------------------------------------------------------------------------------------
    // Deactivate vision on the familiar, activate vision on the caster
    //
    await famToken.document.update({ vision: false });
    await aToken.document.update({ vision: true });
    //-----------------------------------------------------------------------------------------------
    // Post descriptive message
    //
    msg = `<b>${aToken.name}</b>'s vision and hearing returns to normal.`
    jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img, 
                msg: msg, title: `Senses Return to Normal`, token: aToken})
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
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
        console.log(``)
        console.log(`*** TODO: Delete the feature that invoked this script ***`)
        console.log(``)
        return jez.badNews(`Seemingly no active familiar is defined`, 'i')
    }
    console.log(`---`)
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
    return(famToken)
}