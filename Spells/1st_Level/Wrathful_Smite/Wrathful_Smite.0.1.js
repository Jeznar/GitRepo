const MACRONAME = "Wrathful_Smite.0.1"
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(MACRONAME)
/*****************************************************************************************
 * Implment Wrathful Smite!
 * 
 * special thanks to theripper93
 * 
 * 01/25/22 0.1 Add headers and VFX
 *****************************************************************************************/
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
const actorD = game.actors.get(lastArg.actor._id);
const tokenD = canvas.tokens.get(lastArg.tokenId);
const tactor = canvas.tokens.get(lastArg.tokenId).actor;
const gameRound = game.combat ? game.combat.round : 0;
const spellDC = tokenD.actor.data.data.attributes.spelldc;
const saveType = "wis";
// VFX Settings -------------------------------------------------------------------
const VFX_NAME = `${MACRO}-${tokenD.id}`
const VFX_TARGET = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Dark_Red_Target_400x400.webm"
const VFX_CASTER = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Dark_Red_Caster_400x400.webm"
const VFX_OPACITY = 1.0;
const VFX_SCALE = 0.70;
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
if (args[0].tag === "OnUse") {
    let itemD = lastArg.item;
    //------------------------------------------------------------------------------------------------
    // Launch VFX on caster
    // 
    new Sequence()
        .effect()
        .file(VFX_CASTER)
        .attachTo(tokenD)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        .name(VFX_NAME)          // Give the effect a uniqueish name
        .play()
    //-------------------------------------------------------------------------------------------------
    // Define and apply the effect
    // 
    let effectData = [{
        changes: [
            { key: "flags.dnd5e.DamageBonusMacro", mode: 0, value: `ItemMacro.${itemD.name}`, priority: 20 },
            { key: "flags.midi-qol.itemDetails", mode: 0, value: `${lastArg.uuid}`, priority: 20 },
        ],
        origin: lastArg.uuid,
        disabled: false,
        duration: { rounds: 1, seconds: 6, startRound: gameRound, startTime: game.time.worldTime },
        flags: { dae: { itemData: itemD, specialDuration: ["DamageDealt"] } },
        icon: itemD.img,
        label: itemD.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tokenD.actor.uuid, effects: effectData });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "doBonusDamage"
 ***************************************************************************************************/
if (args[0].tag === "DamageBonus") {
    if (!["mwak"].includes(lastArg.item.data.actionType)) return {};
    let target = canvas.tokens.get(lastArg.hitTargets[0].id);
    let itemUuid = getProperty(lastArg.actor.flags, "midi-qol.itemDetails");
    let itemN = await fromUuid(itemUuid);
    let itemD = lastArg.item;
    let numDice = lastArg.isCritical ? 2 : 1;
    let saveOptions = target.actor.data.type === "character" ? { chatMessage: false, fastForward: false } : { chatMessage: false, fastForward: true };
    let save = await MidiQOL.socket().executeAsGM("rollAbility", { request: "save", targetUuid: target.actor.uuid, ability: saveType, options: saveOptions });
    let saveSuccess = "saves";
    let conc = tokenD.actor.effects.find(i => i.data.label === "Concentrating");
    //-------------------------------------------------------------------------------------------------------------
    // Launch VFX on target
    // 
    new Sequence()
        .effect()
        .file(VFX_TARGET)
        .attachTo(target)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        .name(VFX_NAME)          // Give the effect a uniqueish name
        .play()
    //-------------------------------------------------------------------------------------------------------------
    // Perform save
    //
    if (save.total < spellDC) {
        saveSuccess = "fails";
        let effectData = [{
            label: "Frightened",
            icon: "icons/svg/terror.svg",
            origin: "",
            disabled: false,
            flags: { dae: {stackable: false, macroRepeat: "none" } },
            duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
            changes: [{ key: `flags.midi-qol.disadvantage.ability.check.all`, mode: 2, value: 1, priority: 20 },
            { key: `flags.midi-qol.disadvantage.skill.all`, mode: 2, value: 1, priority: 20 },
            { key: `flags.midi-qol.disadvantage.attack.all`, mode: 2, value: 1, priority: 20 },
            { key: `flags.dae.deleteUuid`, mode: 5, value: conc.uuid, priority: 20 },
            { key: `flags.midi-qol.OverTime`, mode: 5, value: `turn=start,label=Frightened,saveDC=${spellDC},saveAbility=${saveType},saveRemove=true`, priority: 20 }
            ]
        }];
        let frightened = target.actor.effects.find(i => i.data.label === "Frightened");
        if (!frightened) applyEffect(target, effectData);
        await wait(500);
        updateEffect(tokenD, target, conc);
        // Bug Fix?  Following line appears to be needed to clear conc after use
        await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tokenD.actor.uuid, effects: [conc.id] });
    } else {
        await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tokenD.actor.uuid, effects: [conc.id] });
    }
    await wait(500);
    let msgHistory = [];
    game.messages.reduce((list, message) => {
        if (message.data?.flags["midi-qol"]?.itemId === itemD._id && message.data.speaker.token === tokenD.id) list.push(message.id);
        return list;
    }, msgHistory);
    let damageType = "psychic";
    let itemCard = msgHistory[msgHistory.length - 1];
    let saveResult = `<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} ${saveSuccess} with a ${save.total}</div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div>`;
    let saveMessage = `<div class="midi-qol-nobox midi-qol-bigger-text">${CONFIG.DND5E.abilities[saveType]} Saving Throw: DC ${spellDC}</div><div class="midi-qol-nobox">${saveResult}</div>`;
    let chatMessage = await game.messages.get(itemCard);
    let content = await duplicate(chatMessage.data.content);
    let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
    let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${saveMessage}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    return { damageRoll: `${numDice}d6[${damageType}]`, flavor: `(${itemN.name} (${CONFIG.DND5E.damageTypes[damageType]}))` };
}

async function applyEffect(target, effectData){
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: effectData });
}
async function updateEffect(tokenD, target, conc){
    let frightened = target.actor.effects.find(i => i.data.label === "Frightened");        
    await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: tokenD.actor.uuid, updates: [{ _id: conc.id, changes: [{ key: `flags.dae.deleteUuid`, mode: 5, value: frightened.uuid, priority: 20 }] }] });
}