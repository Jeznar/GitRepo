const MACRONAME = "Vampire_Charm.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Apply an appropriately crafted charm to target that fails it save.
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
// const EFFECT_IMG = 'Icons_JGB/Conditions/Charmed.png'
const CHARMED_JRNL = `@JournalEntry[${game.journal.getName("Charmed").id}]{Charmed}`
let gameRound = game.combat ? game.combat.round : 0;


//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
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
    let tToken = null
    //---------------------------------------------------------------------------------------------------
    // If target made save, just terminate this macro
    //
    if (L_ARG.failedSaves.length === 0) {
        tToken = canvas.tokens.get(L_ARG.saves[0].id); // First get failed save target
        msg = `${tToken.name} resisted ${aToken.name}'s ${aItem.name}`
        postResults(msg)
        return;
    }
    tToken = canvas.tokens.get(L_ARG.failedSaves[0]?.id); // First get failed save target
    //---------------------------------------------------------------------------------------------------
    // Remove previously applied copies of the effect, repeating until none found
    //
    let tEffect = null
    do {
        tEffect = await tToken.actor.effects.find(ef => ef.data.label === aItem.name && ef.data.origin === L_ARG.uuid)
        if (TL > 1) jez.trace(`${TAG} tEffect:`,tEffect)
        if (tEffect) await tEffect.delete()
      }
    while(tEffect);
    //---------------------------------------------------------------------------------------------------
    // Cook up a custom debuff effect and apply it to the target
    //
    const CE_DESC = `Considers ${aToken.name} to be a friend`
    let effectData = {
        label: aItem.name,
        icon: aItem.img,
        flags: {
            dae: { itemData: aItem, stackable: false, macroRepeat: "none", /*specialDuration: ["longRest"]*/ },
            convenientDescription: CE_DESC,
        },
        duration: { seconds: 86400, startTime: game.time.worldTime, /*startRound: gameRound, rounds: 14400 */},
        origin: L_ARG.uuid,
        disabled: false,
        // duration: {seconds: 86400, hours: 24, startRound: gameRound, startTime: game.time.worldTime },
        // changes: [{ key: "data.attributes.hp.max", mode: 2, value: -damageTotal, priority: 20 }]     // Old Line
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
    //-------------------------------------------------------------------------------------------------------------------------------
    // Play VFX on target
    //
    runVFX(tToken)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Whisper the player owner of the affected token, if any
    //
    if (TL > 1) jez.trace(`${TAG} Token.actor.hasPlayerOwner for ${tToken.name}`, tToken.actor.hasPlayerOwner)

    if (tToken.actor.hasPlayerOwner) {
        if (TL > 1) jez.trace(`${TAG} Processing ${tToken.name}`, tToken, tToken.actor)
        let owner = warpgate.util.firstOwner(tToken.document)
        if (TL > 1) jez.trace(`${TAG} Owner of ${tToken.name}`, owner)
        msg = `${tToken.name} now regards ${aToken.name} as a friendly acquantance. ${tToken.name} can't attack ${aToken.name}
        or target ${aToken.name} with harmful abilities or magical effects. ${aToken.name} has advantage on any ability 
        checks to interact socially with ${tToken.name}.<br><br>(${CHARMED_JRNL})`
        if (!owner.isGM)
            ChatMessage.create({
                user: game.user.id,
                content: msg,
                whisper: ChatMessage.getWhisperRecipients(owner.data.name),
            });
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Post exit message
    //
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
//-------------------------------------------------------------------------------------------------------------------------------
// Function:  Play the VFX 
//
async function runVFX(target) {
    // Fireball VFX file : jb2a.fireball.explosion.orange
    await jez.wait(100)
    new Sequence()
        .effect()
        .file(`jb2a.icon.heart.dark_red`)
        .attachTo(target)
        .scaleToObject(1.5)
        .opacity(1)
        .duration(6000)
        .fadeIn(1000)            // Fade in for specified time in milliseconds
        .fadeOut(1000)           // Fade out for specified time in milliseconds
        .play()
}
//-------------------------------------------------------------------------------------------------------------------------------
// Function:  Play the VFX 
//