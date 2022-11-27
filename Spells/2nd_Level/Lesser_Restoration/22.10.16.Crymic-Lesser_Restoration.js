//##############################################################
// READ FIRST!!!!!!!!!!!!!!!!!!!
// Midi-Qol "On Use"" macro only
//##############################################################
const lastArg = args[args.length - 1];
let target = canvas.tokens.get(lastArg.targets[0].id);
let itemD = lastArg.item;
let condition_list = ["Blinded", "Deafened", "Paralyzed", "Diseased", "Poisoned"];
let effect = target.actor.effects.filter(i => condition_list.includes(i.data.label));
let selectOptions = effect.reduce((list, activeE) => {
    let condition = activeE.data.label;
    list.push(`<option value="${condition}">${condition}</option>`);
    return list;
}, []);
if (selectOptions.length === 0) return ui.notifications.error(`Nothing happens.. There's nothing to Cure on ${target.name}.`);
let the_content = `<form class="flexcol"><div class="form-group"><select id="element">${selectOptions.join('')}</select></div></form>`;
new Dialog({
    title: `${itemD.name} : ${target.name}`,
    content: the_content,
    buttons: {
        yes: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Remove it!',
            callback: async (html) => {
                let element = html.find('#element').val();
                let effect = target.actor.effects.find(i => i.data.label === element);                
                let chatMessage = game.messages.get(lastArg.itemCardId);
                let chatContent = `<div class="midi-qol-nobox"><div class="midi-qol-flex-container"><div>Cures ${element}:</div><div class="midi-qol-target-npc midi-qol-target-name" id="${target.data._id}"> ${target.name}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></img></div></div></div>`;
                let content = duplicate(chatMessage.data.content);
                let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
                let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${chatContent}`;
                content = content.replace(searchString, replaceString);
                await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: target.actor.uuid, effects: [effect.id] });
                await chatMessage.update({ content: content });
                await ui.chat.scrollBottom();
            }
        }
    },
    default: "yes"
}).render(true);