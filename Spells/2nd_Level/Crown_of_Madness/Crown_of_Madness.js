const MACRONAME = "Crown_of_Madness.0.2.js"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 * 08/01/22 0.2 Add convenientDescription
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
// const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
const TL = 0;
const EFFECT = "Madness"
// const DEBUFF_NAME = "Madness" 
// const DEBUFF_ICON = "Icons_JGB/Conditions/Madness.PNG"
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && !preCheck()) return;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    jez.log("args[0].targets.length", args[0].targets.length)
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        postResults();
        return (false);
    }
    jez.log("args[0].failedSaveUuids.length", args[0].failedSaveUuids.length)
    if (args[0].failedSaveUuids.length !== 1) {  // If target made its save, return
        msg = `Saving throw succeeded.  ${aItem.name} has no effect.`
        postResults();
        return (false);
    }
    return (true)
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
function postResults() {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("Terminate the VFX")
    //const SRC_TOKEN_ID = args[3]            // aqNN90V6BjFcJpI5
    const SRC_ACTOR_ID = LAST_ARG.origin.split(".")[1]  // aqNN90V6BjFcJpI5
    const VFX_NAME = `${MACRO}-${SRC_ACTOR_ID}`
    jez.log("VFX_NAME", VFX_NAME)
    jez.log("aToken", aToken)
    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)
    //--------------------------------------------------------------------------------------------
    // Put a DAE effect on the target that includes
    // -- ItemMacro that runs at start of every turn reminding of effect on target (doEach)
    // -- ItemMacro terminates the VFX when it is removed (doOff)
    // -- Midi Overtime effect that performs a save at end of each turn
    //
    // DAE Effect macro.itemMacro CUSTOM WIS DC16
    // DAE Effect flags.midi-qol.OverTime OVERRIDE turn=end,saveDC=16,label=Save vs Crown of Madness,saveAbility=wis,saveRemove=true,saveMagic=true,rollType=save
    // String for the DAE Effect: turn=end,saveDC=@attributes.spelldc,label=Save vs Crown of Madness,saveAbility=wis,saveRemove=true,saveMagic=true,rollType=save
    //--------------------------------------------------------------------------------------------
    // Place an effect on the caster that will call the helper macro to see if spell continues
    //
    const GAME_RND = game.combat ? game.combat.round : 0;
    const CE_DESC = `Maintaining the Crown Effect requires action each round.`
    let effectData = [{
        changes: [
            { key: "macro.execute", mode: jez.CUSTOM, value: "Crown_of_Madness_Helper", priority: 20 }
        ],
        origin: aToken.uuid,
        flags: {
            dae: { itemData: aItem, macroRepeat: "startEveryTurn", token: tToken.uuid },
            convenientDescription: CE_DESC
        },
        disabled: false,
        duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
        icon: aItem.img,
        label: aItem.name
    }];
    jez.log("effectData", effectData)
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: effectData });

    //--------------------------------------------------------------------------------------------
    // Fire off the VFX that will be playing on the subject of madness
    //
    runVFX(tToken)
    //----------------------------------------------------------------------------------------------
    // Modify recently created effect to have a convenientDescription
    //
    await jez.wait(500)
    if (TL > 1) jez.trace(`${MACRO} ${FNAME} | ==> ${tToken.name}`, tToken)
    let effect = await tToken.actor.effects.find(i => i.data.label === "Crown of Madness");
    if (TL > 3) jez.trace(`${MACRO} ${FNAME} | Effect`, effect)
    if (!effect) return jez.badNews(`Could not find "Crown of Madness" effect on ${tToken.name}`, "e")
    const C_DESC = `${aToken.name} can force to attack creature in melee range`
    await effect.update({ flags: { convenientDescription: C_DESC } });
    //--------------------------------------------------------------------------------------------
    // Add results to the chat card
    //
    msg = `<b>${tToken.name}</b> is afflicted by <b>${EFFECT}</b> from ${aToken.name}'s ${aItem.name}.`
    postResults();
    //-------------------------------------------------------------------------------------------------------------
    // Pair the new debuff with concentration
    //  
    await jez.wait(250)
    jez.pairEffects(aActor, "Concentrating", tToken.actor, "Crown of Madness")
    //-------------------------------------------------------------------------------------------------------------
    // Pair the new debuff with concentration
    //  
    await jez.wait(250)
    jez.pairEffects(aActor, "Concentrating", aActor, "Crown of Madness")
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/**************************************************************************
 * Fire off the two stage visual effects
 **************************************************************************/
async function runVFX(token5e) {
    jez.log("Start runVFX(token5e)", token5e)
    let VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Marker/MarkerCircleOfStars_Regular_*_400x400.webm"
    let VFX_INTRO = "modules/jb2a_patreon/Library/Generic/Conditions/Dizzy_Stars/DizzyStars_01_*_400x400.webm"
    const VFX_OPACITY = 1.0;
    const VFX_SCALE = 0.5;
    const VFX_NAME = `${MACRO}-${aActor.id}`
    new Sequence()
        .effect()
        .file(VFX_INTRO)
        .attachTo(token5e)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .waitUntilFinished(-1500)
        .effect()
        .file(VFX_LOOP)
        .attachTo(token5e)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .persist()
        .name(VFX_NAME)
        .scaleIn(0.1, 1500)         // Expand from 0.25 to 1 size over 1 second
        .rotateIn(180, 1500)        // 1/2 Rotation over 1 second 
        .scaleOut(0.1, 1500)        // Contract from 1 to 0.25 size over 1 second
        .rotateOut(180, 1500)       // 1/2 Counter Rotation over 1 second  
        //.endTime(600)
        //.waitUntilFinished(-800) 
        .play();
    jez.log("Finish runVFX(token5e)", token5e)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const SAVE_TYPE = args[1].toLowerCase()             // wis from WIS
    const SAVE_DC = args[2].substring(2)                // 16 from DC16
    jez.log("LAST_ARG.origin", LAST_ARG.origin)
    const SRC_ACTOR_ID = LAST_ARG.origin.split(".")[1]  // aqNN90V6BjFcJpI5
    let sActor = game.actors.get(SRC_ACTOR_ID)
    let sTokenName = sActor.data.token.name
    jez.log("sTokenName", sTokenName)
    jez.log("sActor", sActor)
    jez.log(`SAVE_TYPE ${SAVE_TYPE}, SAVE_DC ${SAVE_DC}, sTokenName ${sTokenName}`)

    msg = `<b>${aToken.name}</b> must use its action before moving this turn to make a melee attack 
    against a creature other than itself that <b>${sTokenName}</b> mentally chooses. ${aToken.name}
    can act normally if ${sTokenName} chooses no creature or if none are within its reach.`
    let titleMsg = "Madness! It's Madness!!!"
    // COOL-THING: Simple Acknowledgement Dialog.prompt
    Dialog.prompt({
        title: titleMsg,
        content: `<br>${msg}<br><br>`,
        label: "Sadly, I Got the Message",
        callback: () => {/*ui.notifications.info("Prompt button pressed!")*/ }
    });
    jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, msg: msg, title: titleMsg, token: aToken })
    jez.log(`Present a start of turn chat message reminding victim of effect of ${EFFECT}`)
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}