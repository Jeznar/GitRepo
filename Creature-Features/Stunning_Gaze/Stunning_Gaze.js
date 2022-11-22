const MACRONAME = "Stunning_Gaze.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *   When a creature that can see the Eye Tyrant's central eye starts its turn within 30 feet, the 
 *   Eye Tyrant can force it to make a WIS Save if Eye Tyrant isn't incapacitated and can see the 
 *   creature. A creature that fails the save is  Stunned until the start of its next turn.
 * 
 *   Unless surprised, a creature can avert its eyes (making the creature effectively  Blinded 
 *   relative to Eye Tyrant)  at the start of its turn to avoid the saving throw.
 * 
 *   If the creature does so, it can't see Eye Tyrant until the start of its next turn, when it can 
 *   avert its eyes again. If the creature looks at Eye Tyrant in the meantime, it must immediately 
 *   make the save.
 * 
 * 11/19/22 0.1 Creation of Macro from Maddening_Feast.0.1.js
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
const IMMUNE_COND = "Immune - Maddening Feast"
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
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
    //------------------------------------------------------------------------------------------
    // Prepare for and pop a simple dialog asking if preconditions were met
    //
    // const Q_TITLE = `Can ${aToken.name} Feast?`
    // const Q_TEXT = `To qualify to feast, ${aToken.name} must be within 5 feet of a corpse that 
    // died within the past minute and spend her action gourging on the bloody flesh. Are these 
    // conditions met?<br><br>`
    // let confirmation = await Dialog.confirm({ title: Q_TITLE, content: Q_TEXT, });
    // if (!confirmation) {
    //     msg = `${aToken.name} looks confusedly in the general direction of the GM and wonders
    //     what she is expected to feast upon?<br><br>No effect, action can not be performed.`
    //     jez.postMessage({
    //         color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img,
    //         msg: msg, title: `Can not complete action`, token: aToken
    //     })
    //     return jez.badNews(`Preconditions not met, skipping ${aItem.name} effects.`, "w")
    // }
    //----------------------------------------------------------------------------------------------
    // Obtain the range of the effect
    //
    const RANGE = jez.getRange(aItem, ALLOWED_UNITS) + 3 // Adding a bit of fudge
    if (!RANGE) return jez.badNews(`Could not retrieve useable range (in feet) for ${aItem.name}`)
    //------------------------------------------------------------------------------------------
    // Build a list of tokens within range that can see the feast occuring, excluding any that 
    // have immunity.
    //
    let parms = {
        exclude: "Self",        // self, friendly, or none (self is default)
        direction: "t2o",       // t2o or o2t (Origin to Target) (t2o is default) 
        chkSight: true,         // Boolean (false is default)
        chkBlind: true,         // Boolean (false is default)
        traceLvl: 0,            // Trace level, integer typically 0 to 5
    }
    let candidateIds = []
    let candidates = await jez.inRangeTargets(aToken, RANGE, parms);
    if (candidates.length === 0) {
        msg = `${aToken.name} sadly realizes that nothing and no one is in range for ${aItem.name}.`
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img,
            msg: msg, title: `No affectable targets`, token: aToken
        })
        return jez.badNews(`No effectable targets in range`, "i")
    }
    for (let i = 0; i < candidates.length; i++) {
        immuneEffect = candidates[i].actor.effects.find(ef => ef.data.label === IMMUNE_COND)
        if (TL > 2) jez.trace(`${TAG} ${candidates[i].name} Immune Effect`, immuneEffect)
        if (immuneEffect) 
            jez.trace(`${FNAME} | Immunity: ${candidates[i].name} (${candidates[i].id})`, candidates[i])
        else {
            jez.trace(`${FNAME} | Targeting: ${candidates[i].name} (${candidates[i].id})`, candidates[i])
            candidateIds.push(`${candidates[i].name} (${candidates[i].id})`)
        }
    }
    if (candidateIds.length === 0) {
        msg = `${aToken.name} sadly realizes that nothing and no one can be affected by ${aItem.name}.`
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img,
            msg: msg, title: `No affectable targets`, token: aToken
        })
        return jez.badNews(`No effectable targets in range`, "i")
    }
    //------------------------------------------------------------------------------------------
    // Call function to pop a dialog and select targets to be affected.
    //
    await popDialog();
    async function popDialog() {
        const Q_TITLE = `Which tokens can see ${aToken.name}?`
        const Q_TEXT = `Check all the creatures that can see ${aToken.name}.  This allows players 
        to toggle on the blinded effect, if they are averting their eyes.`
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
        const SCHOOL = `necromancy`
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
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff(options = {}) {
    const FUNCNAME = "doOff()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //---------------------------------------------------------------------------------------------
    // Apply our CE Immune effect modifing key aspects
    //
    let effectData = game.dfreds.effectInterface.findEffectByName("Immune").convertToObject();
    if (TL > 3) jez.trace(`${TAG} effectData >>>`, effectData)
    effectData.description = "Immune to Maddening Feast effects, for now..."
    effectData.name = IMMUNE_COND
    effectData.flags.dae = { specialDuration : [ "longRest" ] }
    if (TL > 2) jez.trace(`${TAG} Apply affect to ${aToken.name}`)
    await game.dfreds.effectInterface.addEffectWith({
        effectData: effectData,
        uuid: aToken.actor.uuid, 
        origin: aItem.uuid
    });
    immuneEffect = aToken.actor.effects.find(ef => ef.data.label === IMMUNE_COND)
    if (!immuneEffect) return jez.badNews(`Immune effect didn't stick...`, "e")
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${TAG} | More Detailed Trace Info.`)

    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}