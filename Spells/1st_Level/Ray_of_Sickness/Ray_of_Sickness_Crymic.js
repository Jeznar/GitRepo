const lastArg = args[args.length - 1];
if(lastArg.hitTargets.length === 0) return {};
let tokenD = canvas.tokens.get(lastArg.tokenId);
let target = canvas.tokens.get(lastArg.hitTargets[0].id);
let itemD = lastArg.item;
let gameRound = game.combat ? game.combat.round : 0;
let DC = tokenD.actor.data.data.attributes.spelldc;
let saveType = "con";
let save = await MidiQOL.socket().executeAsGM("rollAbility", {request: "save", targetUuid: target.actor.uuid, ability: saveType, options: { chatMessage: false, fastForward: true }});
let success = "saves";
if(save.total < DC){
    success = "fails";
let effectData = {
    label: "Poisoned",
    icon: "modules/combat-utility-belt/icons/poisoned.svg",
    origin: lastArg.uuid,
    disabled: false,
    duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
    flags: { dae: { itemData: itemD, specialDuration: ['turnEndSource'] } },
    changes: [{ key: `flags.midi-qol.disadvantage.attack.all`, mode: 2, value: 1, priority: 20 },
    { key: `flags.midi-qol.disadvantage.skill.check.all`, mode: 2, value: 1, priority: 20 },
    { key: `flags.midi-qol.disadvantage.ability.check.all`, mode: 2, value: 1, priority: 20 }]
};
let effect = target.actor.effects.find(ef => ef.data.label === game.i18n.localize("Poisoned"));
if (!effect) await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.uuid, effects: [effectData] });
}
let saveResult = `<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} ${success} with a ${save.total}</div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div>`;
    let saveMessage = `<div class="midi-qol-nobox midi-qol-bigger-text">${CONFIG.DND5E.abilities[saveType]} Saving Throw: DC ${DC}</div><div class="midi-qol-nobox">${saveResult}</div>`;
    let chatMessage = await game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    let searchString = /<div class="midi-qol-saves-display">[\s\S]*<div class="end-midi-qol-saves-display">/g;
let replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display">${saveMessage}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();

function runVFX(token1) {


}