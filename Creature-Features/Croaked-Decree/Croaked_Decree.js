const MACRONAME = "Croaked_Decree.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Mimicking Glaaar-pat, this macro is intended to be 'Called before the item is rolled' it:
 * 1. Builds a list of in range targets
 * 2. Presents that list in a dialog for the user to specify the actual targets
 * 3. Sets the targets in accordance with the above
 * 4. Terminates to allow the Item card configuration to perform the actual damage & apply effect
 * 
 * Description of thr spell effect:
 *   %TOKENNAME% makes a loud pronouncement. Each ally of the royal that is within 60 feet of the 
 *   royal and can hear the pronouncement has advantage on its first attack roll on its next turn.
 * 
 * 11/12/22 0.1 Creation of Macro from Glaaar-pat.0.1.js
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
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
const ALLOWED_UNITS = ["", "ft", "any"];
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
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
    //----------------------------------------------------------------------------------------------
    // Make sure we are running as a preItemRoll macro
    //
    if (args[0].macroPass !== "preItemRoll") {
        msg = `${aToken.name}'s ${aItem.name} is likely incorrectly configured.  Check that the 
         On Use Macros field is set to "Called before the item is rolled."
         <br><br>No effect, action can not be performed.`
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img,
            msg: msg, title: `Configuration Problem`, token: aToken
        })
        return jez.badNews(`This macro must run preItemRoll, not ${args[0].macroPass}.`, "e")
    }
    //----------------------------------------------------------------------------------------------
    // Remove any preset targets
    //
    game.user.updateTokenTargets()
    //----------------------------------------------------------------------------------------------
    // Obtain the range of the effect
    //
    let range = jez.getRange(aItem, ALLOWED_UNITS) ?? 30
    range += 3 // Add a bit of fudge
    //----------------------------------------------------------------------------------------------
    // Build a list of tokens within range that can see the feast occuring, excluding any that 
    // have immunity.
    //
    let candidateIds = await getCandidates(range, { traceLvl: 0 })
    if (!candidateIds) return false
    //----------------------------------------------------------------------------------------------
    // Add some VFX
    //
    runVFX(aToken)
    //----------------------------------------------------------------------------------------------
    // Call function to pop a dialog and select targets to be affected.
    //
    await popDialog();
    async function popDialog() {
        const Q_TITLE = "Select Tokens to be Affected"
        const Q_TEXT = `Check all the creatures that ${aToken.name} wants to affect with
        ${aItem.name}.`
        await jez.pickCheckListArray(Q_TITLE, Q_TEXT, callBack, candidateIds.sort());
        return
    }
    //-----------------------------------------------------------------------------------------------
    // Following is the call back function
    //
    async function callBack(selection) {
        let targets = []
        let targetIds = []
        if (selection === null) return
        if (selection.length === 0) { popDialog(); return }
        //-------------------------------------------------------------------------------------------
        // Build targetedArray of token IDs from all those tasty token descriptors selected.
        // The selection items should be of form: Token Name (Q4XTwd4lR76Afu6B)
        //
        for (let i = 0; i < selection.length; i++) {
            msg += `${i + 1}) ${selection[i]}<br>`
            const ELEMENTS = selection[i].split("(")                    // Make array of elements
            const THIS_ID = ELEMENTS[ELEMENTS.length - 1].slice(0, -1)  // Slice out the ID we need     
            if (TL > 3) jez.trace(`${TAG} | Target ID ${i}`, THIS_ID)
            targetIds.push(THIS_ID)
            targets.push(canvas.tokens.placeables.find(ef => ef.id === THIS_ID))
        }
        //-------------------------------------------------------------------------------------------
        // Fire off a VFX on each of the targets
        //
        const COLOR = jez.getRandomRuneColor()
        const SCHOOL = `evocation`
        for (let i = 0; i < targets.length; i++) {
            if (TL > 3) jez.trace(`${TAG} Targeting: ${targets[i].name}`, targets[i])
            if (TL > 4) jez.trace(`${TAG} School: ${SCHOOL}, Color: ${COLOR}`)
            jez.runRuneVFX(targets[i], SCHOOL, COLOR)
        }
        //----------------------------------------------------------------------------------------------
        // Update the selected targets so item hits correct tokens.
        //
        game.user.updateTokenTargets(targetIds)
    }
    //-----------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Build and return a list of candate token Ids
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function getCandidates(RANGE, options = {}) {
    const FUNCNAME = "getCandidates(RANGE, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "RANGE", RANGE, "options", options);
    //---------------------------------------------------------------------------------------------
    // Variables for this function
    //
    let parms = {
        exclude: "Self",        // self, friendly, or none (self is default)
        direction: "t2o",       // t2o or o2t (Origin to Target) (t2o is default) 
        chkHear: true,          // Exclude targets with no "line of sound" to actor
        chkDeaf: true,          // Exclude targets that have the Deafened effect
        traceLvl: TL,            // Trace level, integer typically 0 to 5 or TL
    }
    let candidateIds = []
    let candidates = null
    //---------------------------------------------------------------------------------------------
    // Get Array of Token5e objects in range
    //
    candidates = await jez.inRangeTargets(aToken, RANGE, parms);
    if (candidates.length === 0) {
        msg = `${aToken.name} sadly realizes that nothing and no one is in range for ${aItem.name}.`
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img,
            msg: msg, title: `No affectable targets`, token: aToken
        })
        return jez.badNews(`No effectable targets in range`, "i")
    }
    //---------------------------------------------------------------------------------------------
    // Build candiate identifier strings from the Token5e array and return it
    //
    for (let i = 0; i < candidates.length; i++) {
        jez.trace(`${FNAME} | Targeting: ${candidates[i].name} (${candidates[i].id})`, candidates[i])
        candidateIds.push(`${candidates[i].name} (${candidates[i].id})`)
    }
    return (candidateIds)
}
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
 async function runVFX(token) {
    new Sequence()
       .effect()
       .file("jb2a.template_circle.out_pulse.01.burst.greenorange")
       .attachTo(token)
       .scale(2.2)
       .play();
}