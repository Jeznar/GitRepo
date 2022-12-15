const MACRONAME = "Wild_Shape.0.5.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Macro just appends some general info to the item card created by Wild Shape
 * 
 * 12/02/21 0.1 Creation of Macro
 * 12/10/22 0.4 Add timer watchdog and use of resource by name not position
 * 12/14/22 0.5 Update to use library functions to handle resource usage (NPC side not tested)
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//---------------------------------------------------------------------------------------------------
// If we are running doOff on Base Token, exit now!
//
if (args[0] === "off" && args[1] === args[args.length - 1].actorUuid) return
//---------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#L_ARG for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const SPELL_NAME = `Wild Shape`
const ACTOR_DATA = await aActor.getRollData();
const RESOURCE_NAME = "Wildshapes";
const IS_NPC = (aToken.document._actor.data.type === "npc") ? true : false;
const CLASS_LEVEL = jez.getClassLevel(aToken, 'Druid', { traceLvl: TL })
const DURATION = CLASS_LEVEL * 1800 // Seconds
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
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
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
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
    //---------------------------------------------------------------------------------------------------
    // Ask if a resource should be consumed 
    //
    const Q_TITLE = `Consume Resource?`
    let qText = `<p>${aToken.name} is using <b>${SPELL_NAME}</b> to change shape.  This typically 
    consumes one charge of <b>Wildshape.</b></p>
    <p>If you want to spend the charge (or use the NPC alternative), click <b>"Yes"</b>.</p>
    <p>If you want to bypass spending the charge (with GM permission) click <b>"No"</b>.</p>
    <p>If you want to cancel the spell click <b>"Close"</b> (top right of dialog).</p>`
    const SPEND_RESOURCE = await Dialog.confirm({ title: Q_TITLE, content: qText, });
    if (SPEND_RESOURCE === null) return jez.badNews(`${SPELL_NAME} cancelled by player.`, 'i')
    //---------------------------------------------------------------------------------------------------
    // Deal with casting resource -- this needs to consider NPC and PC data structures
    //
    if (SPEND_RESOURCE) {
        if (TL > 1) jez.trace(`${TAG} Time to use a resource`)
        let spendResult = await jez.resourceSpend(aActor.uuid, RESOURCE_NAME, aItem.uuid, { traceLvl: TL, quiet: false })
        if (!spendResult) return jez.badNews(`${SPELL_NAME} cancelled for lack of WildShapes`, 'w')
    }
    //---------------------------------------------------------------------------------------------------
    // Apply Watchdog Timer effect to actor to track shape duration
    //
    addWatchdogEffect(DURATION, { traceLvl: TL })
    //---------------------------------------------------------------------------------------------------
    // Bubble message
    //
    msg = `My player should finish my shape shift!`
    bubbleForAll(aToken.id, msg, true, true)
    //---------------------------------------------------------------------------------------------------
    // Create summary message to be dislayed
    //
    if (SPEND_RESOURCE) msg = `<p style="color:Green;"><b>${aToken.name}</b> has used a charge of 
    <b>${aItem.name}</b> to shift into a new form</p>`
    else msg = `<p style="color:DarkGreen;"><b>${aToken.name}</b> has shifted into a new form without using 
    a charge of <b>${aItem.name}</b></p>`
    msg += `<em>An actor from the <b>Actor's Directory</b> can be dropped on <b>${aToken.name}'s</b> open 
    character sheet and the popup window used to complete the transformation. End the transformation with 
    <b>Restore Transformation</b> from the top of the hybrid character sheet.  Any carry over damage needs 
    to be handled manually.</em>`;
    //---------------------------------------------------------------------------------------------------
    // Report results of operation
    //
    postResults(msg);
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/***************************************************************************************************
 * Add an effect to the using actor that can perform additional actions on the summoned actor.
 * 
 * Expected input is a single token id and the name of the familiar
 ***************************************************************************************************/
async function addWatchdogEffect(seconds, options = {}) {
    const FUNCNAME = "addWatchdogEffect(tokenId)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} Starting --- `);
    if (TL > 1) jez.trace(`${TAG} Starting ---`, 'seconds', seconds, 'options', options);
    //------------------------------------------------------------------------------------------------
    // 
    //
    //------------------------------------------------------------------------------------------------
    // Proceed with adding watchdog
    //
    const CE_DESC = `Wildshape can be maintained for up to ${seconds / 3600} hours`
    let effectData = {
        label: SPELL_NAME,
        icon: null,
        origin: L_ARG.uuid,
        disabled: false,
        duration: {
            rounds: seconds / 6, startRound: GAME_RND,
            seconds: seconds, startTime: game.time.worldTime,
            token: aToken.uuid, stackable: false
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
    await MidiQOL.socket().executeAsGM("createEffects",
        { actorUuid: aToken.actor.uuid, effects: [effectData] });
    if (TL > 0) jez.trace(`---  Finished --- ${MACRO} ${FNAME} ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Determine if we are runing on base or transformed actor
    //
    const BASE_UUID = args[1]
    await jezcon.remove(SPELL_NAME, BASE_UUID, {traceLvl: TL});
    //-----------------------------------------------------------------------------------------------
    // Change back to original form
    //
    await aActor.revertOriginalForm();
    //---------------------------------------------------------------------------------------------------
    // Bubble message
    //
    msg = `Now, that feels more natural!`
    bubbleForAll(aToken.id, msg, true, true)
    //---------------------------------------------------------------------------------------------------
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