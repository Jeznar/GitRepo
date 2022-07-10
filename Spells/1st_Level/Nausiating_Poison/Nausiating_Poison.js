const MACRONAME = "Nausinating Poison.0.2.js"
jez.log(MACRONAME)
/*****************************************************************************************
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
jez.log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";
const GAME_RND = game.combat ? game.combat.round : 0;
const SAVE_DC = aToken.actor.data.data.attributes.spelldc;
const SAVE_TYPE = "con";
const COND_APPLIED = "Poisoned"
const COND_ICON = aItem.img
const DAM_TYPE = "poison";
const SPELL_LVL = LAST_ARG?.spellLevel ? LAST_ARG.spellLevel : 2
const TEMP_SPELL = "Shocking Grasp"               // Name as expected in Items Directory 
const NEW_SPELL = `${MACRO}'s ${TEMP_SPELL}`       // Name of item in actor's spell book
const DICE_TYPE = "d8"
jez.log("CONSTANTS Set", "GAME_RND", GAME_RND, "SAVE_DC", SAVE_DC, "SAVE_TYPE", SAVE_TYPE,
    "COND_ICON", COND_ICON, "DAM_TYPE", DAM_TYPE, "SPELL_LVL", SPELL_LVL)
// VFX Settings -------------------------------------------------------------------
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_BEAM = "jb2a.bolt.poison.green"
const VFX_CASTER = "jb2a.icon.poison.dark_green"
const VFX_OPACITY = 1.0;
const VFX_SCALE = 1.1;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
let returnFunc = null
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "DamageBonus") {
    let returnFunc = await doBonusDamage();    // DAE Damage Bonus
    return(returnFunc)
}
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //------------------------------------------------------------------------------------------------
    // Launch VFX on caster
    // 
    let existingEffect = await aToken.actor.effects.find(ef => ef.data.label === aItem.name);
    if (existingEffect) {
        msg = `<b>${aToken.name}</b> already has ${aItem.name}. Terminating.`;
        ui.notifications.warn(msg)
        postResults(msg);
        return
    }
    //------------------------------------------------------------------------------------------------
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
    //-------------------------------------------------------------------------------------------------
    // Define and apply the effect
    // 
    let effectData = [{
        changes: [
            { key: "flags.dnd5e.DamageBonusMacro", mode: 0, value: `ItemMacro.${aItem.name}`, priority: 20 },
            { key: "flags.midi-qol.itemDetails", mode: 0, value: `${LAST_ARG.uuid}`, priority: 20 },
            { key: "macro.itemMacro", mode: jez.CUSTOM, value: "arbitrary_paramater", priority: 20 },
        ],
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 1, seconds: 6, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: { dae: { itemData: aItem, specialDuration: ["1Hit:mwak"] } },
        icon: aItem.img,
        label: aItem.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: effectData });
    //-------------------------------------------------------------------------------------------------
    // Post completion message
    // 
    msg = `${aToken.name} shrouds her/his hand, a held weapon, or a natural weapon in dark ichorous miasma.`
    await jez.addMessage(game.messages.get(args[args.length - 1].itemCardId),
                   {color:"green",fSize:14,msg:msg,tag:"saves"})
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "doBonusDamage"
 ***************************************************************************************************/
async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
    jez.log("")
    //if (args[0].tag === "DamageBonus") {
        //------------------------------------------------------------------------------------------
        // Only applies to melee weapon and spell attacks
        // Action Types: mwak, msak, rwak, rsak
        jez.log("----- LAST_ARG.item.data.actionType",LAST_ARG.item.data.actionType)
        let actionType = LAST_ARG.item.data.actionType
        if (!(actionType === "mwak")) {
            msg = `<b>${actionType.toUpperCase()}</b> action does not trigger ${aItem.name} damage.`;
            ui.notifications.info(msg)
            jez.log(msg)
            return
        }
        let tToken = canvas.tokens.get(LAST_ARG.hitTargets[0].id);
        jez.log("tToken", tToken)
        let itemUuid = getProperty(LAST_ARG.actor.flags, "midi-qol.itemDetails");
        // let itemN = await fromUuid(itemUuid);
        let itemN = MACRO
        jez.log("itemN =====>", itemN)
        let numDice = LAST_ARG.isCritical ? 2 : 1;
        await jez.wait(500);
        //--------------------------------------------------------------------------------------------
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
        //-------------------------------------------------------------------------------------------------------------
        // Apply COND_APPLIED condition if save is failed
        //   
        const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} DC${SAVE_DC} to avoid ${MACRO}'s ${COND_APPLIED}`;
        let saveRoll = (await tToken.actor.rollAbilitySave("con", { flavor:FLAVOR }))
        jez.log("saveRoll", saveRoll)
        if (saveRoll.total < SAVE_DC) await jezcon.add({ effectName: COND_APPLIED, uuid: tToken.actor.uuid, traceLvl: 0 });
        //-------------------------------------------------------------------------------------------------------------
        // Modify the effects to have a proper termination time
        //
        modEffect(tToken, COND_APPLIED)
        //-------------------------------------------------------------------------------------------------------------
        // Dig through the chat history, to find the message that should have new message added...but don't use it?
        //
        let msgHistory = [];
        game.messages.reduce((list, message) => {
            if (message.data?.flags["midi-qol"]?.itemId === aItem._id && message.data.speaker.token === aToken.id) list.push(message.id);
            return list;
        }, msgHistory);
        //-------------------------------------------------------------------------------------------------------------
        // Return Extra Damage function
        //
        jez.log(`--- Finishing(Extra Damage))--- ${MACRONAME} ${FUNCNAME} ---`,
            "numDice", numDice, "DAM_TYPE", DAM_TYPE, "itemN", itemN);
        return { damageRoll: `${numDice}${DICE_TYPE}[${DAM_TYPE}]`, flavor: `(${itemN} (${CONFIG.DND5E.damageTypes[DAM_TYPE]}))` };
    //}
    jez.log(`-------------- Finished(Bottom)--- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
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
 ***************************************************************************************************/
async function modEffect(token5e, EFFECT) {
    const LAST_ARG = args[args.length - 1];
    jez.log("------- modEffect(token5e, EFFECT) --------","token5e",token5e,"EFFECT",EFFECT)
    await jez.wait(500)     
    let effect = await token5e.actor.effects.find(i => i.data.label === EFFECT);
    jez.log(`${EFFECT} >>> effect`, effect)
    jez.log("effect.data.flags.dae",effect.data.flags.dae)
    if (effect.data.flags.dae === undefined) {
        jez.log("Adding DAE to our critter")
        effect.data.flags.dae = {}
    } else jez.log("flags.dae already existed, party time?")
    effect.data.flags.dae.specialDuration = ["turnEndSource"]
    const result = await effect.update({ 'flags.dae.specialDuration': effect.data.flags.dae.specialDuration,
                                         'origin': LAST_ARG.itemUuid });
    jez.log(`${EFFECT} >>> result`,result)
    if (result) jez.log(`${EFFECT} >>> Active Effect ${EFFECT} updated!`, result);
    else jez.log(`${EFFECT} >>> Active Effect not updated! =(`, result);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //-------------------------------------------------------------------------------------------------------------
    // End the effect on the active token
    //  
    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });
    //-------------------------------------------------------------------------------------------------------------
    // Bye bye
    //  
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}