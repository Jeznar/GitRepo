const MACRONAME = "Drenched_in_Despair.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *  Any creature that starts its turn in the same space as the aspect must succeed on a DC 19 Wisdom saving throw or become stunned 
 *  until the start of its next turn.
 * 
 *  If a creature stunned in this way starts its turn in the same space, it takes 14 (4d6) necrotic damage and the aspect regains 
 *  the same amount of hit points.
 * 
 * 01/12/23 0.1 Creation of Macro
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
const SAVE_DC = 19
const SAVE_TYPE = 'wis'
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
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (args[0].targets.length !== 1)
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, 'w')
    return true
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
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Force a saving throw, on failure, apply debuff that:
 *  - Adds CE Stunned effect for one turn
 *  - Triggers ItemMacro Macro (this macro)
 *  - Expires at the start of next turn (triggering doOff)
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
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Perform save, exiting if successful
    //
    const SAVE = await tToken.actor.rollAbilitySave(SAVE_TYPE, { chatMessage: true, fastforward: true });
    if (SAVE.total >= SAVE_DC) {
        if (TL > 2) jez.trace(`${TAG} ${tToken.name} made SAVE`)
        msg = `${tToken.name} has resisted ${aItem.name}`
        postResults(msg)
        return
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build the effect to be applied's data obj
    //
    const CE_DESC = `Proximity to ${aToken.name} has stunned this creature`
    const EXPIRE = ['turnStart', "newDay", "longRest", "shortRest"];
    let effectData = {
      label: aItem.name,
      icon: aItem.img,
      origin: L_ARG.uuid,
      disabled: false,
      flags: { 
        dae: { macroRepeat: "none", specialDuration: EXPIRE },
        convenientDescription: CE_DESC
      },
      changes: [
        { key: `macro.itemMacro`, mode: jez.ADD, value: aToken.id, priority: 20 },
        { key: `macro.CE`, mode: jez.CUSTOM, value: 'Stunned', priority: 20 },
      ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build the effect to be applied's data obj
    //
    if (TL > 3) jez.trace(`${TAG} More Detailed Trace Info.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `${tToken.name} is drenched in despair (stunned) while in the mists in the immediate area of ${aToken.name}`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * When removed, check to see if closeenough to Vampyr's essense.  If close, takes 14 (4d6) necrotic damage and the aspect regains 
 * the same amount of hit points.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Function values
    //
    const GRID_SIZE = canvas.scene.data.grid
    //-------------------------------------------------------------------------------------------------------------------------------
    // Get the token data for 'Aspect of Vampyr'
    //
    let oToken = canvas.tokens.placeables.find(ef => ef.id === args[1])
    if (!oToken) return jez.badNews(`${TAG} Could not find origin token with id: ${args[1]}`)
    if (TL > 1) jez.trace(`${TAG} Origin Token`,oToken)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Get the distance between origin and active token
    //
    const DISTANCE = jez.getDistance5e(aToken, oToken)
    if (TL > 1) jez.trace(`${TAG} Distance between ${aToken.name} and ${oToken.name}: ${DISTANCE} or ${DISTANCE*GRID_SIZE/5} pixels`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Get width of origin token (in pixels)
    //
    const WIDTH = oToken.w
    if (TL > 1) jez.trace(`${TAG} Width of ${oToken.name}: ${WIDTH}`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // If distance between the oToken and aToken is more than half the width of oToken, quietly exit
    //
    if (DISTANCE*GRID_SIZE/5 > WIDTH / 2) {
        if (TL > 1) jez.trace(`${TAG} No damage as ${DISTANCE*GRID_SIZE/5} <= ${WIDTH / 2}`)
        return
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply damage to aToken and heal oToken
    //
    if (TL > 1) jez.trace(`${TAG} Apply damage to ${aToken.name} and heal ${oToken.name}`)
    let dRoll = new Roll(`4d6`).evaluate({ async: false });
    await game.dice3d?.showForRoll(dRoll);
    await new MidiQOL.DamageOnlyWorkflow(oToken.actor, oToken, dRoll.total, 'necrotic', [aToken], dRoll,
        { flavor: `(${CONFIG.DND5E.damageTypes['necrotic']})`, itemCardId: L_ARG.itemCardId, itemData: aItem, useOther: false });
    await MidiQOL.applyTokenDamage([{damage: dRoll.total, type: 'healing'}], dRoll.total, new Set([oToken]), null, new Set());   
    //-------------------------------------------------------------------------------------------------------------------------------
    // Post message
    //
    msg = `${aToken.name} is feels crushing despair from the mists in the immediate area of ${oToken.name}. Restoring strength to
    ${oToken.name} through his/her suffering.`
    jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img, msg: msg, title: 'Drenched in Despair', 
        token: aToken})
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}