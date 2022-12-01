//######################################
//## https://www.patreon.com/crymic
//#####################################
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
const version = Math.floor(game.version);
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
const tokenD = canvas.tokens.get(lastArg.tokenId);
const itemD = lastArg.item;
const gameRound = game.combat ? game.combat.round : 0;

if (lastArg.tag === "OnUse") {
    const spellLevel = Math.floor((lastArg.spellLevel - 1) / 2);
    const title = `Choose your Damage Type:`;
    const menuOptions = {};
    menuOptions["buttons"] = [
        { label: "Select", value: true },
        { label: "Cancel", value: false }
    ];
    menuOptions["inputs"] = [
        { type: "radio", label: "Cold Damage", value: "cold", options: "damageType" },
        { type: "radio", label: "Necrotic Damage", value: "necrotic", options: "damageType" },
        { type: "radio", label: "Radiant Damage", value: "radiant", options: "damageType" }
    ];
    let choices = await warpgate.menu(menuOptions, { title, options: { height: "100%" } });
    let spellButtons = choices.buttons;
    if (!spellButtons) {
        let effect = tactor.effects.find(i => (version > 9 ? i.label : i.data.label) === "Concentrating");
        if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tactor.uuid, effects: [effect.id] });
        let spellUpdate = {};
        let spellSlot;
        if ((actorData.classes?.warlock) && (castingStat === "cha")) spellSlot = "pact";
        else spellSlot = "spell" + lastArg.spellLevel;
        let currentSlot = actorData.spells[spellSlot].value;
        spellUpdate[`${version > 9 ? "system" : "data"}.spells.${spellSlot}.value`] = currentSlot + 1;
        await tactor.update(spellUpdate);
    }
    let damageChoice = choices.inputs.filter(Boolean)[0];
    let effectData = [{
        changes: [
            { key: "flags.dnd5e.DamageBonusMacro", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: `ItemMacro.${itemD.name}`, priority: 20 },
            { key: "flags.midi-qol.spiritShroud.name", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: itemD.name, priority: 20 },
            { key: "flags.midi-qol.spiritShroud.uuid", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: lastArg.uuid, priority: 20 },
            { key: "flags.midi-qol.spiritShroud.level", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: spellLevel, priority: 20 },
            { key: "flags.midi-qol.spiritShroud.type", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: damageChoice, priority: 20 }
        ],
        origin: lastArg.uuid,
        disabled: false,
        duration: { rounds: 10, startRound: gameRound, startTime: game.time.worldTime },
        flags: {
            dae: { itemData: itemD }
        },
        label: itemD.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tactor.uuid, effects: effectData });
} else if (args[0].tag === "DamageBonus") {
    let targetList = lastArg.hitTargets.map(i => i.id);
    let findTarget = MidiQOL.findNearby(null, tokenD, 10, null).find(i => targetList.includes(i.id));
    if (!findTarget) return {};
    let itemList = await tactor.itemTypes.weapon.concat(tactor.itemTypes.spell);
    let attackList = itemList.reduce((list, item) => {
        if (!["ak"].some(i => (version > 9 ? item.system.actionType : item.data.data.actionType).toLowerCase().includes(i))) return list;
        else list.push(item.name.toLowerCase());
        return list;
    }, []);
    let legalAttack = attackList.some(i => (itemD.name.toLowerCase()).toLowerCase().includes(i));
    if (!legalAttack) return {};
    const spellName = getProperty((version > 9 ? tactor.flags : tactor.data.flags), "midi-qol.spiritShroud.name");
    const spellDice = getProperty((version > 9 ? tactor.flags : tactor.data.flags), "midi-qol.spiritShroud.level");
    const spellOrigin = getProperty((version > 9 ? tactor.flags : tactor.data.flags), "midi-qol.spiritShroud.uuid");
    const damageType = getProperty((version > 9 ? tactor.flags : tactor.data.flags), "midi-qol.spiritShroud.type");
    let effectData = {
        changes: [
            { key: "data.traits.di.value", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: `healing`, priority: 20 }
        ],
        origin: spellOrigin,
        disabled: false,
        transfer: false,
        flags: { dae: { stackable: "noneOirign", specialDuration: ["turnStartSource"] } },
        duration: { rounds: 1, turns: 1, startRound: gameRound, startTime: game.time.worldTime },
        icon: "icons/skills/wounds/blood-cells-vessel-red-orange.webp",
        label: `Healing Debuff`
    }
    let effect = findTarget.actor.effects.find(i => (version > 9 ? i.label : i.data.label) === "Healing Debuff");
    if (!effect) await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: findTarget.actor.uuid, effects: [effectData] });
    let damageDice = await new game.dnd5e.dice.DamageRoll(`${spellDice}d8[${damageType}]`, tactor.getRollData(), { critical: lastArg.isCritical }).evaluate({ async: true });
    return { damageRoll: damageDice.formula, flavor: `(${spellName} (${CONFIG.DND5E.damageTypes[damageType]}))`, damageList: lastArg.damageList, itemCardId: lastArg.itemCardId };
}