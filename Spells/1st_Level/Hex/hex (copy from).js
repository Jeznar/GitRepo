async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

if (args[0].tag === "OnUse") {
    const tToken = canvas.tokens.get(args[0].targets[0].id);
    const aActor = game.actors.get(args[0].actor._id);
    const aToken = canvas.tokens.get(args[0].tokenId);
    const aItem = args[0].item;
    const LEVEL = args[0].spellLevel;
    const UUID = args[0].uuid;
    const HOURS = LEVEL === 3 ? 480 : LEVEL === 4 ? 480 : LEVEL >= 5 ? 1440 : 60;
    const SECONDS = LEVEL === 3 ? 28800 : LEVEL === 4 ? 28800 : LEVEL >= 5 ? 86400 : 3600;
    const ABILITY_FNAME = Object.values(CONFIG.DND5E.abilities);
    const ABILITY_SNAME = Object.keys(CONFIG.DND5E.abilities);
    const GAME_RND = game.combat ? game.combat.round : 0;
    let ability_list = "";
    for (let i = 0; i < ABILITY_FNAME.length; i++) {
        let full_name = ABILITY_FNAME[i];
        let short_name = ABILITY_SNAME[i];
        ability_list += `<option value="${short_name}">${full_name}</option>`;
    }
    let the_content = `<form><div class="form-group"><label for="ability">Ability:</label><select id="ability">${ability_list}</select></div></form>`;
    new Dialog({
        title: aItem.name,
        content: the_content,
        buttons: {
            hex: {
                label: "Hex",
                callback: async (html) => {
                    let ability = html.find('#ability')[0].value;
                    bonusDamage(tToken, aItem, UUID, aToken, aActor, HOURS, SECONDS, GAME_RND);
                    await wait(500);
                    applyDis(tToken, ability, aItem, UUID, LEVEL, aToken, HOURS, SECONDS, GAME_RND);
                }
            }
        },
        default: "Hex"
    }).render(true);
}

async function bonusDamage(tToken, aItem, UUID, aToken, aActor, HOURS, SECONDS, GAME_RND) {
    let effectData = {
        label: aItem.name,
        icon: "systems/dnd5e/icons/skills/violet_24.jpg",
        origin: UUID,
        disabled: false,
        duration: { rounds: HOURS, SECONDS: SECONDS, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: { dae: { itemData: aItem } },
        changes: [
            { key: "flags.midi-qol.hexMark", mode: 5, value: tToken.id, priority: 20 },
            { key: "flags.dnd5e.DamageBonusMacro", mode: 0, value: `ItemMacro.${aItem.name}`, priority: 20 },
            { key: "flags.midi-qol.concentration-data.targets", mode: 2, value: { "actorId": aActor.id, "tokenId": aToken.id }, priority: 20 }
        ]
    };
    await aActor.createEmbeddedEntity("ActiveEffect", effectData);
    let getConc = aActor.effects.find(i => i.data.label === "Concentrating");
    await aActor.updateEmbeddedEntity("ActiveEffect", { "_id": getConc.id, origin: UUID,"duration": { rounds: HOURS, SECONDS: SECONDS, startRound: GAME_RND, startTime: game.time.worldTime } });
}

async function applyDis(tToken, ability, aItem, UUID, LEVEL, aToken, HOURS, SECONDS, GAME_RND) {
    const hexEffect = await aToken.actor.effects.find(i => i.data.label === "Hex");
    const concEffect = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
    let effectData = {
        label: aItem.name,
        icon: aItem.img,
        origin: UUID,
        disabled: false,
        duration: { rounds: HOURS, SECONDS: SECONDS, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: { dae: { itemData: aItem, spellLevel: LEVEL, tokenId: aToken.id, hexId: hexEffect.id, concId: concEffect.id } },
        changes: [{ key: `flags.midi-qol.disadvantage.ability.check.${ability}`, mode: 2, value: 1, priority: 20 }]
    };
    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: tToken.actor.uuid, effects: [effectData]});    
}

if (args[0].tag === "DamageBonus") {
    const tToken = canvas.tokens.get(args[0].targets[0].id);
    const aToken = canvas.tokens.get(args[0].tokenId);
    const aItem = args[0].item;
    const damageType = "necrotic";
    if (tToken.id !== getProperty(aToken.actor.data.flags, "midi-qol.hexMark")) return {};
    if (!["ak"].some(actionType => (aItem.data.actionType || "").includes(actionType))) return {};
    return { damageRoll: `1d6[${damageType}]`, flavor: `(Hex (${CONFIG.DND5E.damageTypes[damageType]}))`, damageList: args[0].damageList, itemCardId: args[0].itemCardId };
}