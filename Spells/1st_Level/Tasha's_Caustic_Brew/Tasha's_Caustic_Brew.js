/*********************************************************************************
 * DAE Macro.itemmacro @token or Macro.execute "MacroName" @token
 * Times Up/Macro Repeat: Start of Each Turn
 * 
 * JGB: This is Crymic's macro.  I've done nothing beyond adding a header block.
 * *******************************************************************************/
// COOL-THING: Midi Times Up with Macro Repeat for damage over time (DoT)
// COOL-THING: Popup dialog offering to let the token cleanse itself
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
const tokenD = canvas.tokens.get(args[1]);
const actorD = tokenD.actor;
const target = canvas.tokens.get(lastArg.tokenId);
const itemD = actorD.items.get(lastArg.efData.flags.dae.itemData._id).data;
const origin = lastArg.origin;
const level = lastArg.efData.flags.dae.itemData.data.level * 2;
const damageType = "acid";

if (args[0] === "each") {
    let damageRoll = new Roll(`${level}d4`).evaluate({ async: false });
    new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damageType, [target], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemData: itemD, itemCardId: "new" });
    new Dialog({
        title: itemD.name,
        content: "<p>Spend an <b>Action</b> to scape/wash away the Acid?</p>",
        buttons: {
            yes: {
                label: "Yes", callback: async () => {
                    await target.actor.deleteEmbeddedDocuments("ActiveEffect", [lastArg.effectId]);
                    let workflow = await MidiQOL.Workflow.getWorkflow(origin);
                    let itemCard = await MidiQOL.showItemInfo.bind(workflow.item)();
                    await wait(1000);
                    let the_message = `<div class="midi-qol-nobox midi-qol-bigger-text"><b>Condition : Removed</b></div><div><div class="midi-qol-nobox"><div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}"> ${target.name}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px" /></div></div></div></div>`;
                    const chatMessage = await game.messages.get(itemCard.id);
                    let content = await duplicate(chatMessage.data.content);
                    const searchString = /<div class="midi-qol-attack-roll">[\s\S]*<div class="end-midi-qol-attack-roll">/g;
                    const replaceString = `<div class="midi-qol-attack-roll"><div class="end-midi-qol-attack-roll">${the_message}`;
                    content = await content.replace(searchString, replaceString);
                    await chatMessage.update({ content: content });
                    await ui.chat.scrollBottom();
                    let findEffect = await canvas.tokens.placeables.filter(i => i.actor.effects.find(x => x.data.label === itemD.name));
                    if (findEffect.length === 0) {
                        let conc = tokenD.actor.effects.find(i => i.data.label === "Concentrating");
                        await tokenD.actor.deleteEmbeddedDocuments("ActiveEffect", [conc.id]);
                    }
                }
            },
            no: { label: "No", callback: () => { } }
        },
        default: "Yes",
    }).render(true);
}