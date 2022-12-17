const MACRONAME = "Polymorph.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 
 * 
 * 12/16/21 0.1 Creation of Macro from "Wild_Shape.0.5.js
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
    //-------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
    //-------------------------------------------------------------------------------------------------------------------------------
// If we are running doOff on Base Token, exit now!
//
// if (args[0] === "off" && args[1] === args[args.length - 1].actorUuid) return
    //-------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#L_ARG for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
    //-------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const SPELL_NAME = `Polymorph`
const DURATION = 3600 // Seconds
const SAVE_DC = aActor.getRollData().attributes.spelldc;
const SAVE_TYPE = "wis"
    //-------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
return;
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
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Ask if a resource should be consumed 
    //
    const Q_TITLE = `Is Target Willing to be Polymorphed?`
    let qText = `<p>${aToken.name} is using <b>${SPELL_NAME}</b> to polymorph ${tToken.name}.  The Target can resist the change, 
    attemptng a ${SAVE_DC}DC WIS Save, or it can simply accept the change.</p>
    <p>If the target wants to attempt a save, click <b>"Yes"</b>.</p>
    <p>If the target wants to accept the polymorph, click <b>"No"</b>.</p>
    <p>If you want to cancel the spell click <b>"Close"</b> (top right of dialog).</p>`
    const TRY_SAVE = await Dialog.confirm({ title: Q_TITLE, content: qText, });
    if (TRY_SAVE === null) return jez.badNews(`${SPELL_NAME} cancelled by player.`, 'i')
    //-------------------------------------------------------------------------------------------------------------------------------
    // Run RuneVFX on caster
    //
    const COLOR = jez.getRandomRuneColor()
    jez.runRuneVFX(aToken, jez.getSpellSchool(aItem), COLOR)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Deal with casting resource -- this needs to consider NPC and PC data structures
    //
    if (TRY_SAVE) {
        if (TL > 1) jez.trace(`${TAG} Creature needs to attempt save`)
        let flavor = `<b>${tToken.name}</b> attempts ${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> 
        save to resist effect from <b>${aItem.name}</b>`;
        let optionsObj = { flavor: flavor, chatMessage: true, fastforward: true }
        let saveObj = (await tToken.actor.rollAbilitySave(SAVE_TYPE, optionsObj));
        const SAVED = (saveObj.total < SAVE_DC) ? false : true
        //---------------------------------------------------------------------------------------------------------------------------
        if (SAVED) {
            jez.dropConcentrating(aToken, { traceLvl: TL })
            msg = `<p style="font-size:14px;color:FireBrick;">${tToken.name} has resisted <b>${aItem.name}</b>, no effect</p>`;
            postResults(msg);
            return
        }
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Run RuneVFX on target if not the caster and affect is being applied
    //
    if (tToken.id != aToken.id) {
        await jez.wait(500)
        jez.runRuneVFX(tToken, jez.getSpellSchool(aItem), COLOR)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // If save failed or effect accepted, post message about how to complete the polymorph
    //
    msg = `Players needs to finish my shape shift! (not automated)`
    bubbleForAll(tToken.id, msg, true, true)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply Watchdog Timer effect to actor to track shape duration
    //
    addWatchdogEffect(tToken, DURATION, { traceLvl: TL })
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pair our new effect with Concentrating
    //
    await jez.wait(200)
    jez.pairEffectsAsGM(aActor, "Concentrating", tToken.actor, SPELL_NAME)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Report results of operation
    //
    msg = `<p style="font-size:14px;color:DarkBlue;"><b>${aToken.name}</b> has used <b>${aItem.name}</b> to shift 
    ${tToken.name}  into a new form</p>
    <p style="font-size:14px;color:DarkBlue;"><em>An actor from the <b>Actor's Directory</b> can be dropped on 
    <b>${tToken.name}'s</b> open character sheet and the popup window used to complete the transformation. End the transformation 
    with <b>Restore Transformation</b> from the top of the hybrid character sheet.  Any carry over damage needs to be handled 
    manually.</em>`;
    postResults(msg);
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Add an effect to the using actor that can perform additional actions on the summoned actor.
 * 
 * Expected input is a single token id and the name of the familiar
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function addWatchdogEffect(target, seconds, options = {}) {
    const FUNCNAME = "addWatchdogEffect(tokenId)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} Starting --- `);
    if (TL > 1) jez.trace(`${TAG} Starting ---`, 'target', target, 'seconds', seconds, 'options', options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Proceed with adding watchdog
    //
    const CE_DESC = `Polymorph lasts for an hour or to zero hit points`
    let effectData = {
        label: SPELL_NAME,
        icon: aItem.img,
        origin: L_ARG.uuid,
        disabled: false,
        duration: {
            rounds: seconds / 6, startRound: GAME_RND,
            seconds: seconds, startTime: game.time.worldTime,
            // token: aToken.uuid, stackable: false
        },
        flags: {
            dae: { macroRepeat: "none" },
            convenientDescription: CE_DESC
        },
        changes: [
            // { key: `macro.execute`, mode: jez.ADD, value: `DeleteTokenMacro ${tokenId}`, priority: 20 },
            { key: `macro.itemMacro`, mode: jez.CUSTOM, value: `${aActor.uuid}`, priority: 20 },
        ]
    };
    if (TL > 1) jez.trace(`${FNAME} | MidiQOL.socket().executeAsGM("createEffects"`, "aToken.actor.uuid",
        aToken.actor.uuid, "effectData", effectData);
    await MidiQOL.socket().executeAsGM("createEffects",{ actorUuid: target.actor.uuid, effects: [effectData] });
    if (TL > 0) jez.trace(`---  Finished --- ${MACRO} ${FNAME} ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Determine if we are runing on base or transformed actor
    //
    const BASE_UUID = args[1]
    await jezcon.remove(SPELL_NAME, BASE_UUID, {traceLvl: TL});
    //-------------------------------------------------------------------------------------------------------------------------------
    // Change back to original form
    //
    await aActor.revertOriginalForm();
    //-------------------------------------------------------------------------------------------------------------------------------
    // Bubble message
    //
    msg = `Now, that feels more natural!`
    bubbleForAll(aToken.id, msg, true, true)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Post Completion message
    //
    let title = `Revert to natural shape`
    msg = `${SPELL_NAME} has expired (or been removed).`;
    jez.postMessage({color: jez.randomDarkColor(), fSize: 14, 
        icon: aToken.data.img, msg: msg, title: title, token: aToken})
    if (TL > 3) jez.trace(`${TAG} | More Detailed Trace Info.`)

    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}