const MACRONAME = "Remorhaz_Vomit.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Initiate a grapple as a result of a successful Remorhaz_Bite. The grapple is automatically applied
 * if the target is hit.
 * 
 * 09/16/23 0.1 JGB created from Remorhaz_Bite.0.1
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
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
// const STOMACH = 'Icons_JGB/Conditions/stomach.webp'
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
// async function preCheck() {
//     if (args[0]?.targets?.length !== 1)
//         return jez.badNews(`Illegal number of targets.  ${args[0]?.targets?.length} were targeted.`, 'w')
//     if (args[0].hitTargets.length !== 1)
//         return jez.badNews(`Target was not hit, no effect.`, 'i')
//     return true
// }
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
    // Function Variables
    //
    // let isGrappling = false;
    //-------------------------------------------------------------------------------------------------------------------------------
    // If saving throw was made return with posted message.
    //
    if (args[0].failedSaves.length !== 1)
        return postResults(`${aToken.name} struggles a bit but manages to keep the content of its stomach down.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Loop through all effects that begin with "Digesting" 
    //
    let digestingEffect = aToken.actor.effects.find(ef => ef.data.label.startsWith("Digesting"))
    let targetUuid = null;
    let vomittedNames = [];
    while (digestingEffect) {
        if (TL > 1) jez.trace(`${TAG} *** Digesting Effect: `, digestingEffect);
        targetUuid = null;  // Remove any carryover value
        // Dig into the effects to extract the UUID of our target, looking for a value that is like this:
        //  value: "Remove_Paired_Effect Scene.4tpZknfj8JM7LtyZ.Token.WXE1sSUaNcYG3LlO.ActiveEffect.xjudy7ai2poqac2o"
        for (let i = 0; i < digestingEffect.data.changes.length; i++) {
            const CHANGE_TOKENS = digestingEffect.data.changes[i].value.split(" ")
            jez.trace(`${TAG} *** ${i} Processing change line: `, CHANGE_TOKENS);
            if (CHANGE_TOKENS[0] === 'Digesting:' && CHANGE_TOKENS.length >= 2) {  // If first token is Digesting extract the name 
                vomittedNames.push(digestingEffect.data.changes[i].value.slice(10, digestingEffect.data.changes[i].value.length));
                if (TL > 1) jez.trace(`${TAG} *** ${i} New Vomited Token Name: `, CHANGE_TOKENS[1]);
            }
            else if (CHANGE_TOKENS[0] === 'Remove_Paired_Effect' && CHANGE_TOKENS.length === 2) {
                targetUuid = CHANGE_TOKENS[1];                            // Second token is our effect UUID that contains UUID
                endOfTargetPhrase = targetUuid.indexOf(".ActiveEffect.")  // Get position of end of our Uuid
                targetUuid = targetUuid.slice(0, endOfTargetPhrase)
                if (TL > 1) jez.trace(`${TAG} *** ${i}  New Vomited Token UUID: `, targetUuid);
            } else if (TL > 1) jez.trace(`${TAG} *** ${i} Skipping change line: `, digestingEffect.data.changes[i].value);
        }
        // Slap a prone on vomitted token
        await jezcon.add({ effectName: 'Prone', uuid: targetUuid, origin: aActor.uuid })
        // Delete the effect
        await digestingEffect.delete()
        // Grab the next effect, if any
        digestingEffect = aToken.actor.effects.find(ef => ef.data.label.startsWith("Digesting"))
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build completion message
    //
    if (vomittedNames.length > 0) {
        msg = `${aToken.name} retches and vomits forth:` + '<br>'
        for (let i = 0; i < vomittedNames.length; i++) msg += vomittedNames[i] + '<br>';
        if (vomittedNames.length === 1) msg += `who lands prone.`
        else msg += `<br> All of whom land prone.`
        postResults(msg)
    }
    return;
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
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}