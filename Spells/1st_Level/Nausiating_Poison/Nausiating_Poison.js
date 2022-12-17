const MACRONAME = "Nausinating Poison.0.4.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Homebrew Spell from Occultist list
 * 
 *  You shroud your hand, a weapon you are holding, or a natural weapon in dark ichorous 
 *  miasma. After casting this spell, if you make a successful melee spell attack, unarmed 
 *  strike or a melee weapon attack, the target takes an additional 1d8 poison damage and 
 *  must make a Constitution saving throw. On a failed save, the target becomes poisoned 
 *  until the end of your next turn.
 * 
 *  The spell ends after dealing damage, or at the start of your next turn, whichever 
 *  occurs first.
 * 
 * 03/12/22 0.1 Creation of Macro
 * 07/09/22 0.2 Replace CUB.addCondition with CE
 * 07/31/22 0.3 Add convenientDescription
 * 11/01/22 0.4 Added MSAK as triggering action
 * 12/17/22 0.5 Update logging and general style
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
const LAST_ARG = args[args.length - 1];
const SAVE_DC = aToken.actor.data.data.attributes.spelldc;
const SAVE_TYPE = "con";
const COND_APPLIED = "Poisoned"
const COND_ICON = aItem.img
const DAM_TYPE = "poison";
const SPELL_LVL = LAST_ARG?.spellLevel ? LAST_ARG.spellLevel : 2
const TEMP_SPELL = "Shocking Grasp"               // Name as expected in Items Directory 
const NEW_SPELL = `${MACRO}'s ${TEMP_SPELL}`       // Name of item in actor's spell book
const DICE_TYPE = "d8"
let returnFunc = null
if (TL > 1) jez.trace(`${TAG} CONSTANTS Set`, "GAME_RND", GAME_RND, "SAVE_DC", SAVE_DC, "SAVE_TYPE", SAVE_TYPE,
    "COND_ICON", COND_ICON, "DAM_TYPE", DAM_TYPE, "SPELL_LVL", SPELL_LVL)
//-----------------------------------------------------------------------------------------------------------------------------------
// VFX Settings
//
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_BEAM = "jb2a.bolt.poison.green"
const VFX_CASTER = "jb2a.icon.poison.dark_green"
const VFX_OPACITY = 1.0;
const VFX_SCALE = 1.1;
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
// DamageBonus must return a function to the caller
if (args[0]?.tag === "DamageBonus") return (doBonusDamage({ traceLvl: TL }));
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
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
    // Launch VFX on caster
    // 
    let existingEffect = await aToken.actor.effects.find(ef => ef.data.label === aItem.name);
    if (existingEffect) {
        msg = `<b>${aToken.name}</b> already has ${aItem.name}. Terminating.`;
        ui.notifications.warn(msg)
        postResults(msg);
        return
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Launch VFX on caster
    // 
    new Sequence()
        .effect()
        .file(VFX_CASTER)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .scaleIn(0.1, 3000)
        .opacity(VFX_OPACITY)
        //.repeats(3,1000)
        .fadeIn(1000)
        .waitUntilFinished(-500)
        .effect()
        .file(VFX_CASTER)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(true)
        .persist()
        //.repeats(3,1000)
        .fadeOut(2000)
        .scaleOut(0.5, 2000)
        .name(VFX_NAME)          // Give the effect a uniqueish name
        .play()
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define and apply the effect
    // 
    const C_DESC = `Next melee spell, unarmed, or melee weapon hit does extra damage and CON save or poisoned.`
    let effectData = [{
        changes: [
            { key: "flags.dnd5e.DamageBonusMacro", mode: 0, value: `ItemMacro.${aItem.name}`, priority: 20 },
            { key: "flags.midi-qol.itemDetails", mode: 0, value: `${LAST_ARG.uuid}`, priority: 20 },
            { key: "macro.itemMacro", mode: jez.CUSTOM, value: "arbitrary_paramater", priority: 20 },
        ],
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 1, seconds: 6, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: {
            dae: { itemData: aItem, specialDuration: ["1Hit:mwak"] },
            convenientDescription: C_DESC
        },
        icon: aItem.img,
        label: aItem.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: effectData });
    //-------------------------------------------------------------------------------------------------------------------------------
    // Post completion message
    // 
    msg = `${aToken.name} shrouds her/his hand, a held weapon, or a natural weapon in dark ichorous miasma.`
    await jez.addMessage(game.messages.get(args[args.length - 1].itemCardId),
        { color: "green", fSize: 14, msg: msg, tag: "saves" })
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return (true);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "doBonusDamage"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 async function doBonusDamage(options={}) {
    const FUNCNAME = "doBonusDamage(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Only applies to melee weapon and spell attacks
    // Action Types: mwak, msak, rwak, rsak
    if (TL > 1) jez.trace(`${TAG} ----- LAST_ARG.item.data.actionType`, LAST_ARG.item.data.actionType)
    let actionType = LAST_ARG.item.data.actionType
    if (!(actionType === "mwak" || actionType === "msak"))
        return jez.badNews(`<b>${actionType.toUpperCase()}</b> action does not trigger ${aItem.name} damage.`, 'i')
    let tToken = canvas.tokens.get(LAST_ARG.hitTargets[0].id);
    if (TL > 1) jez.trace(`${TAG} tToken`, tToken)
    let itemUuid = getProperty(LAST_ARG.actor.flags, "midi-qol.itemDetails");
    // let itemN = await fromUuid(itemUuid);
    let itemN = MACRO
    if (TL > 1) jez.trace(`${TAG} itemN =====>`, itemN)
    let numDice = LAST_ARG.isCritical ? 2 : 1;
    await jez.wait(500);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Launch VFX on target
    // 
    new Sequence()
        .effect()
        .atLocation(aToken)
        .stretchTo(tToken)
        .scale(1)
        .file(VFX_BEAM)
        .waitUntilFinished(-500)
        .belowTokens(false)
        .effect()
        .atLocation(tToken)
        .fadeIn(1000)
        .scaleIn(0.1, 1000)
        .fadeOut(2000)
        .scaleIn(0.1, 2000)
        //.repeats(3,1500)
        .scale(VFX_SCALE)
        .file(VFX_CASTER)
        .play()
    //-------------------------------------------------------------------------------------------------------------------------------
    // Roll that sweet, sweet save
    //   
    const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} DC${SAVE_DC} to avoid ${MACRO}'s ${COND_APPLIED}`;
    let saveRoll = (await tToken.actor.rollAbilitySave("con", { flavor: FLAVOR }))
    if (TL > 1) jez.trace(`${TAG} saveRoll`, saveRoll)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply COND_APPLIED condition if save is failed, modifying appropriately
    //
    if (saveRoll.total < SAVE_DC) {
        if (TL > 1) jez.trace(`${TAG} Target ${tToken.name} failed its save`);
        // Retrieve as an object, the COND_APPLIED Convenient Effect for modification
        let effectData = game.dfreds.effectInterface.findEffectByName(COND_APPLIED).convertToObject();
        // If debugging, dump out the effect data object
        if (TL > 3) jez.trace(`${TAG} effectData objtained`, effectData)
        // The standard Poisoned CE lacks a "dae" field in its flags, so it needs to be added
        effectData.flags.dae = { specialDuration: ["turnEndSource"] }
        // Change the icon used to one specific to this spell
        // effectData.icon = POIS_ICON
        // Change the convenient description to one specific to this spell
        effectData.description = "Poisoned by Nauseating Poison, disadvantage on attack rolls and ability checks."
        // If debugging, dump out the effect data object after the updates
        if (TL > 3) jez.trace(`${TAG} updated ===>`, effectData)
        // Slap the updated CE onto our targeted actor
        game.dfreds.effectInterface.addEffectWith({ effectData: effectData, uuid: tToken.actor.uuid, origin: aActor.uuid });
        // Set msg with result for later display
        msg = `<b>${tToken.name}</b> has been poisoned by the effects of ${aItem.name} for one turn.`
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Dig through the chat history, to find the message that should have new message added...but don't use it?
    //
    let msgHistory = [];
    game.messages.reduce((list, message) => {
        if (message.data?.flags["midi-qol"]?.itemId === aItem._id && message.data.speaker.token === aToken.id) list.push(message.id);
        return list;
    }, msgHistory);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Return Extra Damage function
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`, "numDice", numDice, "DAM_TYPE", DAM_TYPE, "itemN", itemN);
    return { damageRoll: `${numDice}${DICE_TYPE}[${DAM_TYPE}]`, flavor: `(${itemN} (${CONFIG.DND5E.damageTypes[DAM_TYPE]}))` };
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Modify existing effect to include a special duration of turnStart  
 * 
 *         "On a failed save, the target becomes poisoned until the end of your next turn."
 * 
 * Need to set condition added by cub to the origin correctly, something like this:
 *   effect.data.origin ==> Actor.aqNN90V6BjFcJpI5.Item.tMWjmgB2qKCTTVTR
 * 
 * The aItem.UUID appears to contain this type of info:
 *           aItem.uuid ==> Actor.aqNN90V6BjFcJpI5.Item.tMWjmgB2qKCTTVTR
 * 
 * Because this is being called as part of a doBonusDamage invocation it is extra funky.  Need to 
 * access LAST_ARG, where the following appears to have potential:
 *     args[0].itemUuid ==> Actor.aqNN90V6BjFcJpI5.Item.pz9HMZ3rgkq2jme1
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
// async function modEffect(token5e, EFFECT) {
//     const LAST_ARG = args[args.length - 1];
//     if (TL>1) jez.trace(`${TAG} ------- modEffect(token5e, EFFECT) --------`, "token5e", token5e, "EFFECT", EFFECT)
//     await jez.wait(500)
//     let effect = await token5e.actor.effects.find(i => i.data.label === EFFECT);
//     if (TL>1) jez.trace(`${TAG} ${EFFECT} >>> effect`, effect)
//     if (TL>1) jez.trace(`${TAG} effect.data.flags.dae`, effect.data.flags.dae)
//     if (effect.data.flags.dae === undefined) {
//         if (TL>1) jez.trace(`${TAG} Adding DAE to our critter`)
//         effect.data.flags.dae = {}
//     } else if (TL>1) jez.trace(`${TAG} flags.dae already existed, party time?`)
//     effect.data.flags.dae.specialDuration = ["turnEndSource"]
//     const result = await effect.update({
//         'flags.dae.specialDuration': effect.data.flags.dae.specialDuration,
//         'origin': LAST_ARG.itemUuid
//     });
//     if (TL>1) jez.trace(`${TAG} ${EFFECT} >>> result`, result)
//     if (result) if (TL>1) jez.trace(`${TAG} ${EFFECT} >>> Active Effect ${EFFECT} updated!`, result);
//     else if (TL>1) jez.trace(`${TAG} ${EFFECT} >>> Active Effect not updated! =(`, result);
// }
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
    // End the effect on the active token
    //  
    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });
    //-------------------------------------------------------------------------------------------------------------------------------
    // Bye bye
    //  
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
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
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}