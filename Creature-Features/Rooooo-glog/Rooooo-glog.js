const MACRONAME = "Rooooo-glog.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Similar, but different from Glaaar-Pat, this macro runs as a normal "OnUse" macro 
 * (after effects), it ignores any preselected targets, in fact, it clears them, for clarity.
 * 1. Builds a list of in range targets
 * 2. Exclude non "bullywug" subtype tokens
 * 3. Roll 4d4 for healing (This is a homebrew change)
 * 4. Grant the remaining targets temp hit points
 * 5. Play a randomly delayed VFX on the targets
 * 
 * Description of the spell effect:
 * 
 *   The croaker sings an ode to an elder froghemoth. Each bullywug within 30 feet of the croaker 
 *   that can hear the song gains 10 temporary hit points.
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
let bullywugs = []
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
    // Check that we are running as a postActiveEffects macro, for cleanliness
    //
    if (args[0].macroPass !== "postActiveEffects") {
        msg = `${aToken.name}'s ${aItem.name} is likely incorrectly configured.  Check that the 
         On Use Macros field is set to "After Active Effects."`
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img,
            msg: msg, title: `Configuration Problem`, token: aToken
        })
        jez.badNews(`This macro should run postActiveEffects, not ${args[0].macroPass}.`, "e")
    }
    //----------------------------------------------------------------------------------------------
    // Remove any preset targets
    //
    game.user.updateTokenTargets()
    //----------------------------------------------------------------------------------------------
    // Obtain the range of the effect
    //
    let range = jez.getRange(aItem, ALLOWED_UNITS) ?? 30
    // if (!range) return jez.badNews(`Could not retrieve useable range (in feet) for ${aItem.name}`)
    range += 3 // Add a bit of fudge
    //----------------------------------------------------------------------------------------------
    // Build a list of tokens within range that can see the feast occuring, excluding any that 
    // have immunity.
    //
    let candidates = await getCandidates(range, { traceLvl: 0 })
    if (!candidates) return false
    //----------------------------------------------------------------------------------------------
    // Add some VFX on caster
    //
    runVFX(aToken)
    //-----------------------------------------------------------------------------------------------
    // Perform exclusion of non-bullywog tokens, check the subtype field against "bullywug"
    //
    for (let i = 0; i < candidates.length; i++)
        if (candidates[i].actor.data.data.details.type.subtype.toLowerCase() === "bullywug")
            bullywugs.push(candidates[i])
    if (bullywugs.length === 0)
        return postResults(`${aToken.name} finds no bullywugs in range to bolster`)
    //---------------------------------------------------------------------------------------
    // Roll the extra damage die, which will be used as healing -- Not RAW, but random!
    //
    let damageRoll = new Roll(`4d4`).evaluate({ async: false });
    await game.dice3d?.showForRoll(damageRoll);
    //-----------------------------------------------------------------------------------------------
    // Bolster the eligible bullywugs
    //
    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, 'temphp', bullywugs, damageRoll,
        { flavor: `(${CONFIG.DND5E.damageTypes['temphp']})`, itemCardId: LAST_ARG.itemCardId, itemData: aItem, useOther: false });
    //----------------------------------------------------------------------------------------------
    // Add some VFX on subjects
    //
    runVFX(bullywugs)
    //-----------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Build and return a list of candidate token5e data objects
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
        exclude: "none",        // self, friendly, or none (self is default)
        direction: "t2o",       // t2o or o2t (Origin to Target) (t2o is default) 
        chkHear: true,          // Exclude targets with no "line of sound" to actor
        chkDeaf: true,          // Exclude targets that have the Deafened effect
        traceLvl: TL,           // Trace level, integer typically 0 to 5 or TL
    }
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
    return (candidates)
}
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
 async function runVFX(subjects) {
    let vfxLoop = "jb2a.template_circle.out_pulse.01.burst.greenorange" // Origin VFX file
    let vfxScale = 2.2                                                  // Scale for origin
    if (Array.isArray(subjects)) {  // Expecting an array if running VFX on the targets
        vfxLoop = 'jb2a.healing_generic.loop.greenorange'
        vfxScale = 0.4
        for (let i = 0; i < subjects.length; i++) {
            await jez.wait(200 + Math.random() * 200)                        // Add a random pause
            vfx(subjects[i])
        }
    }
    else {                          // Expecting not an array if running VFX on the origin
        vfx(subjects)
     }
     function vfx(token) {
         new Sequence()
             .effect()
             .file(vfxLoop)
             .attachTo(token)
             .scale(vfxScale)
             .play();
     }
 }