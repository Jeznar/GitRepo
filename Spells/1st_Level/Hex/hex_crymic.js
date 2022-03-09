async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

if (args[0].tag === "OnUse") {
    const target = canvas.tokens.get(args[0].targets[0].id);
    const actorD = game.actors.get(args[0].actor._id);
    const tokenD = canvas.tokens.get(args[0].tokenId);
    const itemD = args[0].item;
    const level = args[0].spellLevel;
    const uuid = args[0].uuid;
    const hours = level === 3 ? 480 : level === 4 ? 480 : level >= 5 ? 1440 : 60;
    const seconds = level === 3 ? 28800 : level === 4 ? 28800 : level >= 5 ? 86400 : 3600;
    const ability_fname = Object.values(CONFIG.DND5E.abilities);
    const ability_sname = Object.keys(CONFIG.DND5E.abilities);
    const gameRound = game.combat ? game.combat.round : 0;
    let ability_list = "";
    for (let i = 0; i < ability_fname.length; i++) {
        let full_name = ability_fname[i];
        let short_name = ability_sname[i];
        ability_list += `<option value="${short_name}">${full_name}</option>`;
    }
    let the_content = `<form><div class="form-group"><label for="ability">Ability:</label><select id="ability">${ability_list}</select></div></form>`;
    new Dialog({
        title: itemD.name,
        content: the_content,
        buttons: {
            hex: {
                label: "Hex",
                callback: async (html) => {
                    let ability = html.find('#ability')[0].value;
                    bonusDamage(target, itemD, uuid, tokenD, actorD, hours, seconds, gameRound);
                    await wait(500);
                    applyDis(target, ability, itemD, uuid, level, tokenD, hours, seconds, gameRound);
                }
            }
        },
        default: "Hex"
    }).render(true);
}

async function bonusDamage(target, itemD, uuid, tokenD, actorD, hours, seconds, gameRound) {
    let effectData = {
        label: itemD.name,
        icon: "systems/dnd5e/icons/skills/violet_24.jpg",
        origin: uuid,
        disabled: false,
        duration: { rounds: hours, seconds: seconds, startRound: gameRound, startTime: game.time.worldTime },
        flags: { dae: { itemData: itemD } },
        changes: [
            { key: "flags.midi-qol.hexMark", mode: 5, value: target.id, priority: 20 },
            { key: "flags.dnd5e.DamageBonusMacro", mode: 0, value: `ItemMacro.${itemD.name}`, priority: 20 },
            { key: "flags.midi-qol.concentration-data.targets", mode: 2, value: { "actorId": actorD.id, "tokenId": tokenD.id }, priority: 20 }
        ]
    };
    await actorD.createEmbeddedEntity("ActiveEffect", effectData);
    let getConc = actorD.effects.find(i => i.data.label === "Concentrating");
    await actorD.updateEmbeddedEntity("ActiveEffect", { "_id": getConc.id, origin: uuid,"duration": { rounds: hours, seconds: seconds, startRound: gameRound, startTime: game.time.worldTime } });
}

async function applyDis(target, ability, itemD, uuid, level, tokenD, hours, seconds, gameRound) {
    const hexEffect = await tokenD.actor.effects.find(i => i.data.label === "Hex");
    const concEffect = await tokenD.actor.effects.find(i => i.data.label === "Concentrating");
    let effectData = {
        label: itemD.name,
        icon: itemD.img,
        origin: uuid,
        disabled: false,
        duration: { rounds: hours, seconds: seconds, startRound: gameRound, startTime: game.time.worldTime },
        flags: { dae: { itemData: itemD, spellLevel: level, tokenId: tokenD.id, hexId: hexEffect.id, concId: concEffect.id } },
        changes: [{ key: `flags.midi-qol.disadvantage.ability.check.${ability}`, mode: 2, value: 1, priority: 20 }]
    };
    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: target.actor.uuid, effects: [effectData]});    
}

if (args[0].tag === "DamageBonus") {
    const target = canvas.tokens.get(args[0].targets[0].id);
    const tokenD = canvas.tokens.get(args[0].tokenId);
    const itemD = args[0].item;
    const damageType = "necrotic";
    if (target.id !== getProperty(tokenD.actor.data.flags, "midi-qol.hexMark")) return {};
    if (!["ak"].some(actionType => (itemD.data.actionType || "").includes(actionType))) return {};
    return { damageRoll: `1d6[${damageType}]`, flavor: `(Hex (${CONFIG.DND5E.damageTypes[damageType]}))`, damageList: args[0].damageList, itemCardId: args[0].itemCardId };
}