const MACRONAME = "Electrify"
jez.log(MACRONAME)
/*****************************************************************************************
 * Homebrew Spell from Occultist list
 * 
 * 03/11/22 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log("")
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
jez.log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";
const GAME_RND = game.combat ? game.combat.round : 0;
const SAVE_DC = aToken.actor.data.data.attributes.spelldc;
const SAVE_TYPE = "con";
const COND_APPLIED = "Stunned"
const COND_ICON = aItem.img
const DAM_TYPE = "lightning";
const SPELL_LVL = LAST_ARG?.spellLevel ? LAST_ARG.spellLevel : 2
jez.log("CONSTANTS Set", "GAME_RND", GAME_RND, "SAVE_DC", SAVE_DC, "SAVE_TYPE", SAVE_TYPE,
    "COND_ICON", COND_ICON, "DAM_TYPE", DAM_TYPE, "SPELL_LVL", SPELL_LVL)
// VFX Settings -------------------------------------------------------------------
const VFX_NAME = `${MACRO}-${aToken.id}`
//const VFX_TARGET = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Regular_YellowWhite_Target_400x400.webm"
const VFX_BEAM = "jb2a.electric_arc.01"
//const VFX_CASTER = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Regular_YellowWhite_Caster_400x400.webm"
const VFX_CASTER = "jb2a.static_electricity.01.blue"
const VFX_OPACITY = 1.0;
const VFX_SCALE = 0.35;
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
jez.log("")
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
        // await existingEffect.delete();
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
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        .persist()
        //.repeats(3,1000)
        .fadeIn(2000)
        .fadeOut(2000)
        .name(VFX_NAME)          // Give the effect a uniqueish name
        .play()
    //-------------------------------------------------------------------------------------------------
    // Define and apply the effect
    // 
    let effectData = [{
        changes: [
            { key: "flags.dnd5e.DamageBonusMacro", mode: 0, value: `ItemMacro.${aItem.name}`, priority: 20 },
            { key: "flags.midi-qol.itemDetails", mode: 0, value: `${LAST_ARG.uuid}`, priority: 20 },
            { key: "macro.itemMacro", mode: CUSTOM, value: "arbitrary_paramater", priority: 20 },
        ],
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 1, seconds: 6, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: { dae: { itemData: aItem, specialDuration: ["DamageDealt"] } },
        icon: aItem.img,
        label: aItem.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: effectData });
    msg = `${aToken.name} channels lightning into his/her hands.`
    await jez.addMessage(game.messages.get(args[args.length - 1].itemCardId),
                   {color:"darkblue",fSize:14,msg:msg,tag:"saves"})
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "doBonusDamage"
 ***************************************************************************************************/
async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    if (args[0].tag === "DamageBonus") {
        if (!["mwak"].includes(LAST_ARG.item.data.actionType)) return {};
        let conc = aToken.actor.effects.find(i => i.data.label === "Concentrating");
        jez.log("conc", conc);
        let tToken = canvas.tokens.get(LAST_ARG.hitTargets[0].id);
        jez.log("tToken", tToken)
        let itemUuid = getProperty(LAST_ARG.actor.flags, "midi-qol.itemDetails");
        let itemN = await fromUuid(itemUuid);
        jez.log("itemN =====>", itemN)
        let numDice = LAST_ARG.isCritical ? 2 : 1;
        //await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: aToken.actor.uuid, effects: [conc.id] });
        await jez.wait(500);
        //-------------------------------------------------------------------------------------------------------------
        // Launch VFX on target
        // 
        new Sequence()
        .effect()
            .atLocation(aToken)
            .reachTowards(tToken)
            .scale(1)
            .file(VFX_BEAM)
            .waitUntilFinished(-4000) 
            .belowTokens(false)
        .effect()
            .atLocation(tToken)
            .repeats(3,1500)
            .scale(0.7)
            .file("jb2a.dizzy_stars.200px.blueorange")
        .play()
        //-------------------------------------------------------------------------------------------------------------
        // Apply Stunned condition if save is failed
        //   
        const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} DC${SAVE_DC} to avoid ${MACRO}'s ${COND_APPLIED}`;
        let saveRoll = (await tToken.actor.rollAbilitySave("con", { flavor:FLAVOR }))
        jez.log("saveRoll", saveRoll)
        if (saveRoll.total < SAVE_DC) game.cub.addCondition("Stunned", tToken);
        modStunnedEffect(tToken)
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
        jez.log(`-------------- Finishing(Extra Damage))--- ${MACRONAME} ${FUNCNAME} -----------------`,
            "numDice", numDice, "DAM_TYPE", DAM_TYPE, "itemN.name", itemN.name);
        return { damageRoll: `${numDice}d10[${DAM_TYPE}]`, flavor: `(${itemN.name} (${CONFIG.DND5E.damageTypes[DAM_TYPE]}))` };
    }
    jez.log(`-------------- Finished(Bottom)--- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Modify existing effect to include a special duration of turnStart  
 ***************************************************************************************************/
async function modStunnedEffect(token5e) {
    const EFFECT = "Stunned"
    await jez.wait(100)
    let effect = await token5e.actor.effects.find(i => i.data.label === EFFECT);
    effect.data.flags.dae.specialDuration = ["turnStart"]
    const result = await effect.update({ 'flags.dae.specialDuration': effect.data.flags.dae.specialDuration });
    if (result) jez.log(`>>> Active Effect ${EFFECT} updated!`, result);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("Something could have been here")
    //-------------------------------------------------------------------------------------------------------------
    // End the effect on the active token
    //  
    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });

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