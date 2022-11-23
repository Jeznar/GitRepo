async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
const version = Math.floor(game.version);
const tokenD = canvas.tokens.get(lastArg.tokenId);
const actorD = tokenD.actor;
const actorData = await actorD.getRollData();
const guided = actorD.itemTypes.feat.find(item => ["guided strike"].some(x => (item.name).toLowerCase().includes(x)));
const itemD = lastArg.item;
if (!guided) return ui.notifications.error(`Looking for an item named Guided Strike, cannot find it.`);
const target = canvas.tokens.get(lastArg.targets[0].id);
if (!["ak"].some(i => (version > 9 ? itemD.system.actionType : itemD.data.actionType).toLowerCase().includes(i))) return {};
const resourceName = "Channel Divinity";
let resourceList = [{ name: "primary" }, { name: "secondary" }, { name: "tertiary" }];
let resourceValues = Object.values(actorData.resources);
let resourceTable = mergeObject(resourceList, resourceValues);
let findResourceSlot = resourceTable.find(i => i.label.toLowerCase() === resourceName.toLowerCase());
if (!findResourceSlot) return ui.notifications.error(`${resourceName} Resources is missing on ${tokenD.name}, Add it.`);
let resourceSlot = findResourceSlot.name;
let curtRes = actorData.resources[resourceSlot].value;
let curtMax = actorData.resources[resourceSlot].max;
if (curtRes < 1) return console.warn(guided.name, curtRes, `out of resources`);
if (lastArg.macroPass === "preCheckHits") {
    let workflow = await MidiQOL.Workflow.getWorkflow(lastArg.uuid);
    let guidingStrike = await new Promise((resolve) => {
        let the_content = `<p>Attack Roll Total: <span style="font-weight:800;color: ${lastArg.attackD20 === 1 ? "red" : lastArg.attackD20 === 20 ? "green" : "black"}">${lastArg.attackTotal}</span> <small>[ ${lastArg.attackRoll.result} ]</small></p><p>Do you wish to Channel Divinity to guide your attack? [${curtRes}/${curtMax}]</p>`;
        new Dialog({
            title: guided.name,
            content: the_content,
            buttons: {
                use: {
                    label: `Attack`, icon: `<img src="${version > 9 ? guided.img : guided.data.img}" width="30px" height="30px">`, callback: async () => resolve(true)
                },
                skip: {
                    label: "Skip", callback: () => resolve(false)
                }
            },
            default: "Skip"
        }).render(true);
    });
    if (!guidingStrike) return {};
    console.warn(guided.name, `Original Attack Data =>`, `Attack Total:`, lastArg.attackTotal);
    let newAttackRoll = await new Roll(`${lastArg.attackRoll.result} + 10`).evaluate({ async: true });
    console.warn(guided.name, `Adjusted Attack Data =>`, `Attack Total:`, newAttackRoll.total);
    workflow.isFumble = false;
    workflow.isCritical = false;
    if (lastArg.attackD20 === 1) {
        workflow.isFumble = true
    } else if (lastArg.attackD20 === 20) {
        workflow.isCritical = true;
    } else {
        workflow.attackRoll = newAttackRoll;
        workflow.attackTotal = newAttackRoll.total;
    }
    switch (MidiQOL.configSettings().rollAlternate) {
        case "formula":
        case "formulaadv": workflow.attackRollHTML = await newAttackRoll.render({ template: "modules/midi-qol/templates/rollAlternate.html" }); break;
        case "adv":
        case "off":
        default: workflow.attackRollHTML = await newAttackRoll.render(); // "off"
    }
    let updates = {};
    let resources = version > 9 ? `system.resources.${resourceSlot}.value` : `data.resources.${resourceSlot}.value`;
    updates[resources] = curtRes - 1;
    await actorD.update(updates);
    await wait(300);
    let the_message = `<em>${guided.name}.<br>${tokenD.name} strikes with supernatural accuracy!</em>`;
    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(version > 9 ? chatMessage.content : chatMessage.data.content);
    let searchString = /<div class="midi-qol-saves-display">[\s\S]*<div class="end-midi-qol-saves-display">/g;
    let replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display"><hr>${the_message}`;
    content = content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
}