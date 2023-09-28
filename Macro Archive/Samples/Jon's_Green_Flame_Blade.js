/***
 * Jon's Green Flame Blade Macro
 * 
 ****/

// Midi-Qol On Use Macro
const actorD = game.actors.get(args[0].actor._id);
const tokenD = canvas.tokens.get(args[0].tokenId);
const itemD = args[0].item;
let msgHistory = Object.values(MidiQOL.Workflow.workflows).filter(i=> i.actor.id === actorD.id && i.item?.name != itemD.name && i.workflowType === "Workflow");
if(msgHistory.length === 0) return ui.notifications.warn(`You need to successfully attack first.`);
let lastAttack = msgHistory[msgHistory.length - 1];
let damageType = "fire";
let level = actorD.data.type === "npc" ? (actorD.data.data.details.spellLevel != 0 ? actorD.data.data.details.spellLevel:1) : actorD.data.data.details.level;
let spellcasting = actorD.data.data.attributes.spellcasting === "wis" ? actorD.data.data.abilities.wis.mod : actorD.data.data.attributes.spellcasting === "cha" ? actorD.data.data.abilities.cha.mod : actorD.data.data.abilities.int.mod;
let numDice = Math.floor((level + 1) / 6);
if(lastAttack.isCritical) numDice *= 2;
let firstDamage = numDice >= 1 ? `${numDice}d8` : `0`;
let secondDamage = numDice >= 1 ? `${numDice}d8 + ${spellcasting}` : spellcasting;
const hit_type = lastAttack.isCritical ? "critically hits" : "hits";
let mainTarget = canvas.tokens.get(args[0].hitTargets[0].id);
let distance = 9.5;
let secondTarget = canvas.tokens.placeables.filter(target => (canvas.grid.measureDistance(mainTarget.center, target.center) <= distance && mainTarget.id != target.id && mainTarget.data.disposition === target.data.disposition));
let damageRoll = new Roll(`${firstDamage}`). evaluate({async:false});
new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damageType, [mainTarget], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemCardId: args[0].itemCardId});

if(secondTarget.length > 1){
    let target_list = "";
    for(let target of secondTarget){
        target_list += `<option value="${target.id}">${target.name}</option>`;
    }
    
    new Dialog({
        title: itemD.name,
        content: `<p>Pick a secondary target</p><form><div class="form-group"><select id="hitTarget">${target_list}</select></div></form>`,
        buttons: {
            attack: {label: "Confirmed", callback: async (html) => {
                let target_id = html.find('#hitTarget')[0].value;
                let find_target = canvas.tokens.get(target_id);
                let damageRoll = new Roll(`${secondDamage}`).evaluate({async:false});
                new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damageType, [find_target], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemData: itemD , itemCardId: "new"});
            }}
        }
    }).render(true);
} else {
    for(let find_target of secondTarget){
        let damageRoll = new Roll(`${secondDamage}`).evaluate({async:false});
        new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damageType, [find_target], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemData: itemD , itemCardId: "new"});
    }
}