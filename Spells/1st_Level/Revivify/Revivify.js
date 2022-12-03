const MACRONAME = "Revivify.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Check validity of cast (partially at least) and then boost HP of target by 1 point.
 * 
 * 12/03/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set standard variables
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//

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
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function preCheck() {
    if (args[0].targets.length !== 1) {      // If not exactly one target 
        msg = `Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`
        jez.refundSpellSlot(aToken, L_ARG.spellLevel, { traceLvl: 0, quiet: false, spellName: aItem.name })
        postResults(msg)
        return jez.badNews(msg, "w");
    }
    return (true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
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
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-----------------------------------------------------------------------------------------------
    // Does the targeted actor have 0 HP at time of casting?
    //
    let curHP = tActor.data.data.attributes.hp.value
    console.log(`curHP`,curHP)
    if (curHP > 0) {
        msg = `${tToken.name} has positive hit points. This spell has no benefit and has been 
        cancelled.`
        postResults(msg)
        jez.refundSpellSlot(aToken, L_ARG.spellLevel,{ spellName: aItem.name })
        return
    }
    //-----------------------------------------------------------------------------------------------
    // Ask player if preconditions are met with a simple dialog.
    //
    let confirmation = await Dialog.confirm({
        title: `Preconditions for ${aItem.name} met?`,
        content: `<p>Has ${tToken.name} died within the last minute?</p>`,
      });
    if (!confirmation) { // Clicked "No" on the dialog
        msg = `${tToken.name} can not benefit from ${aItem.name} as they have beed dead too long.`
        postResults(msg)
        jez.refundSpellSlot(aToken, L_ARG.spellLevel,{ spellName: aItem.name })
        return
    }
    //-----------------------------------------------------------------------------------------------
    // Heal the target for 1 HP to restore it to life, using a runAsGM macro to dodge permission 
    // issue for players.
    //
    const ACTORUPDATEASGM = jez.getMacroRunAsGM("ActorUpdate")
    if (!ACTORUPDATEASGM) { return false }
    let rc = ACTORUPDATEASGM.execute(tToken.id, { "data.attributes.hp.value": 1 }); // target equiv token.id?
    console.log('rc',rc)
    //-----------------------------------------------------------------------------------------------
    // Add the prone condition to the newly breathing as it likely should be there.
    //
    await jezcon.addCondition("Prone", L_ARG.targetUuids, 
        {allowDups: false, replaceEx: true, origin: tActor.uuid, overlay: false, traceLvl: TL }) 
    //-----------------------------------------------------------------------------------------------
    // Thats all folks
    //
    msg = `${tToken.name} has been restored to life with 1 hit point.`
    postResults(msg)
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}