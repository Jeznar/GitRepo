// Obsolete
// Midi-Qol On Use Macro
// Let the macro do the saving throw and damage. Just assign Action type as Utility
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
(async () => {
    let tokenD = canvas.tokens.get(args[0].tokenId);
    let actorD = game.actors.get(args[0].actor._id);
    let distance = 9.5;
    let itemD = args[0].item;
    let dc = await actorD.getRollData().attributes.spelldc;
    let get_target = canvas.tokens.placeables.filter(target => (canvas.grid.measureDistance(tokenD.center, target.center) <= distance && tokenD.data.disposition != target.data.disposition));
    // let classType = ["Sorcerer", "Warlock", "Wizard", "Artificer", "Occultist"];
    // let level = actorD.items.filter(i => classType.includes(i.name)).sort((a, b) => a.data.levels > b.data.levels ? -1 : 1)[0].data.data.levels;
    // let numDice = 1 + (Math.floor((level + 1) / 6));
    // let damageRoll = new Roll(`${numDice}d6`).evaluate({ async: false });
    let abilitySave = "wis";  // Set appropriate stat for save
    let saveName = CONFIG.DND5E.abilities[abilitySave];
    // game.dice3d?.showForRoll(damageRoll);
    let saveResult = [];
    let hitTargets = [];
    for (let target of get_target) {
        let save;
        await target.actor.hasPlayerOwner ? save = await target.actor.rollAbilitySave(abilitySave, { chatMessage: false }) : save = await target.actor.rollAbilitySave(abilitySave, { chatMessage: false, fastForward: true });
        game.dice3d?.showForRoll(save);
        if (save.total >= dc) {
            saveResult.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}"> ${target.name} saves with a ${save.total}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);

        } else {
            saveResult.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}"> ${target.name} failed with a ${save.total}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
            hitTargets.push(target);
        }
    }
    // new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, "force", hitTargets, damageRoll, { flavor: `(Force)`, itemCardId: args[0].itemCardId }); // Apply damage
    let saveList = saveResult.join('');
    await wait(1000);
    let damage_results = `<div class="midi-qol-nobox midi-qol-bigger-text">${itemD.name} DC ${dc} ${saveName} Saving Throw:</div><div><div class="midi-qol-nobox">${saveList}</div></div>`;
    const chatMessage = await game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatMessage.data.content);
    const searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
    const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${damage_results}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
})();