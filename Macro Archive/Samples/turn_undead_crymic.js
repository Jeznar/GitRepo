/////////////////////////////////////////////////
// READ FIRST
// Requires: Callback macros ActorUpdate
// Version: 11.06.21
////////////////////////////////////////////////
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
async function cr_lookup(level) {
    if ((level >= 5) && (level < 8)) { return 0.5; }
    if ((level >= 8) && (level < 11)) { return 1; }
    if ((level >= 11) && (level < 14)) { return 2; }
    if ((level >= 14) && (level < 17)) { return 3; }
    if ((level >= 17) && (level <= 20)) { return 4; }
}
const ActorUpdate = game.macros?.getName("ActorUpdate");
if (!ActorUpdate) return ui.notifications.error(`Cannot locate ActorUpdate GM Macro`);
if (!ActorUpdate.data.flags["advanced-macros"].runAsGM) return ui.notifications.error(`ActorUpdate "Execute as GM" needs to be checked.`);
const actorD = game.actors.get(args[0].actor._id).getRollData();
const level = actorD.classes.cleric ? actorD.classes.cleric.levels : actorD.details.cr;
const dc = actorD.attributes.spelldc;
const itemD = args[0].item;
const saveType = actorD.attributes.spellcasting;
const targetList = args[0].targets.reduce((list, target) => {
    if (target.actor.data.data.attributes.hp.value === 0) return list;
    let creatureTypes = ["undead"];
    let undead = creatureTypes.some(i => (target.actor.data.data.details?.type?.value || target.actor.data.data.details?.race).toLowerCase().includes(i));
    console.log(`${itemD.name}=>`, target.name, undead);
    if (undead) list.push(target);
    return list;
}, []);
let turnTargets = [];
for (let target of targetList) {
    let mon_cr = target.actor.getRollData().details.cr;
    let level_cr = await cr_lookup(level);
    console.log(level_cr, mon_cr);
    // add turn resist terms
    let resist = ["Turn Resistance", "Turn Defiance"];
    let getResistance = target.actor.items.find(i => resist.includes(i.name));
    let immunity = ["Turn Immunity"];
    let getImmunity = target.actor.items.find(i => immunity.includes(i.name));
    let getAdvantage = getResistance ? { advantage: true, chatMessage: false, fastForward: true } : { chatMessage: false, fastForward: true };
    let save = await MidiQOL.socket().executeAsGM("rollAbility", { request: "save", targetUuid: target.actor.uuid, ability: saveType, options: getAdvantage });
    if (getImmunity) {
        turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} immune</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
    }
    else {
        if (dc > save.total) {
            if (level_cr >= mon_cr) {
                console.log(target.name, save.total, `Fail [Destroyed]`);
                ActorUpdate.execute(target.id, { "data.attributes.hp.value": 0 });
                turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} fails with ${save.total} [Destroyed]</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
            } else {
                console.log(target.name, save.total, `Fail [Feared]`);
                let gameRound = game.combat ? game.combat.round : 0;
                let effectData = {
                    label: "Frightened",
                    icon: "modules/combat-utility-belt/icons/frightened.svg",
                    origin: args[0].uuid,
                    disabled: false,
                    flags: { dae: { specialDuration: ["isDamaged"] } },
                    duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
                    changes: [{ key: `flags.midi-qol.disadvantage.ability.check.all`, mode: 2, value: 1, priority: 20 },
                    { key: `flags.midi-qol.disadvantage.skill.check.all`, mode: 2, value: 1, priority: 20 },
                    { key: `flags.midi-qol.disadvantage.attack.all`, mode: 2, value: 1, priority: 20 }]
                };
                let effect = target.actor.effects.find(ef => ef.data.label === game.i18n.localize("Frightened"));
                if (!effect) await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:target.actor.uuid, effects: [effectData] });
                turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} fails with ${save.total} [Feared]</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
            }
        } else {
            console.log(target.name, save.total, `Save`);
            turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} succeeds with ${save.total}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
        }
    }
}
await wait(600);
let turn_results = `<div class="midi-qol-nobox midi-qol-bigger-text">${CONFIG.DND5E.abilities[saveType]} Saving Throw: DC ${dc}</div><div><div class="midi-qol-nobox">${turnTargets.join('')}</div></div>`;
let chatMessage = await game.messages.get(args[0].itemCardId);
let content = await duplicate(chatMessage.data.content);
let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${turn_results}`;
content = await content.replace(searchString, replaceString);
await chatMessage.update({ content: content });
await ui.chat.scrollBottom();