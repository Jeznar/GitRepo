const MACRONAME = "Life_Drain.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implement a generic Life Drain ability: The target must succeed on a Constitution saving throw or its hit point maximum is
 * reduced by an amount equal to the damage taken. This reduction lasts until the target finishes a long rest. The target dies
 * if this effect reduces its hit point maximum to 0.
 *
 * 05/02/23 0.1 Creation of Macro
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
const RECOVERY_FRACTION = 1.0; // Fraction of necrotic damage healed
// let gameRound = game.combat ? game.combat.round : 0;
// const HEAL_TYPE = "healing";
// const DAMAGE_TYPE = "cold";
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
// if (args[0] === "on") await doOn({ traceLvl: TL });                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
// if (args[0] === "each") doEach({ traceLvl: TL });					     // DAE everyround
// DamageBonus must return a function to the caller
// if (args[0]?.tag === "DamageBonus") return (doBonusDamage({ traceLvl: TL }));
// if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
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
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    if (!await preCheck()) return (false);
    // let tToken = canvas.tokens.get(L_ARG.hitTargets[0].id); // First git target
    let tToken  = null
    //---------------------------------------------------------------------------------------------------
    // If target made save, just terminate this macro
    //
    if (L_ARG.failedSaves.length === 0) {
        tToken = canvas.tokens.get(L_ARG.saves[0].id); // First get failed save target
        msg = `${tToken.name} resisted ${aToken.name}'s ${aItem.name}`
        postResults(msg)
        console.log(msg)
        return;
    }
    tToken = canvas.tokens.get(L_ARG.failedSaves[0]?.id); // First get failed save target
    //---------------------------------------------------------------------------------------------------
    // Dig out how much damage the calling attack inflicted
    //
    console.log('==> ', L_ARG.damageDetail)
    // let damageTotal = L_ARG.damageDetail.find(i => i.type === DAMAGE_TYPE);   // Changed for Midi update
    let damageTotal = L_ARG.damageDetail[0].damage;                              // Only one damage line supported
    if (!damageTotal) return jez.badNews("Deal damage first", "w");              // 21.12.12 Addition
    if (TL > 2) jez.trace(`${TAG} Damage Total`, damageTotal);
    //---------------------------------------------------------------------------------------------------
    // Cook up a custom debuff effect and apply it to the target
    //
    const CE_DESC = `Hit point maximum reduced by ${damageTotal}` // 1.1 Addition
    let effectData = {
        label: aItem.name,
        icon: aItem.img,
        flags: {
            dae: { itemData: aItem, stackable: true, macroRepeat: "none", specialDuration: ["longRest"] },
            convenientDescription: CE_DESC,                                                     // 1.1 Addition
        },
        origin: L_ARG.uuid,
        disabled: false,
        // duration: {seconds: 86400, hours: 24, startRound: gameRound, startTime: game.time.worldTime },
        // changes: [{ key: "data.attributes.hp.max", mode: 2, value: -damageTotal, priority: 20 }]     // Old Line
        changes: [{ key: "data.attributes.hp.max", mode: 2, value: -damageTotal, priority: 20 }] // 21.12.12 Replacement
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `${aToken.name} has reduced ${tToken.name}'s maximum hit points by ${damageTotal}`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}