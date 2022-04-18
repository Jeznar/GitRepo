/////////////////////////////////////////////////
// Requires: Callback macros ActorUpdate
////////////////////////////////////////////////
const MACRONAME = "Channel_Divinity.22.04.12.js"
/*****************************************************************************************
 * Couple changes to Crymic;s code.  
 * 
 * - Change console.warn() and console.error() commands to jez.log()
 * - Add my typical header block
 * - Add a few additional jez.log() tracing statemenets
 * - Changed "Frightened" to "Turn" to differentiate from the RAW condition 
 * - Change calling item from target data from "30 feet enemy" to "30 feet creature"
 * - Eliminate [postActiveEffects] prefix from item's ItemMacro line
 * 
 * 04/18/22 0.1 Modification of Crymic's 04/12/22 implementation
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
async function cr_lookup(level) {
    return level > 20 ? 5 : level >= 17 ? 4 : level >= 14 ? 3 : level >= 11 ? 2 : level >= 8 ? 1 : level >= 5 ? 0.5 : 0;
}
const ActorUpdate = game.macros.find(i => i.name === "ActorUpdate");
if (!ActorUpdate) return ui.notifications.error(`REQUIRED: Missing ActorUpdate GM Macro!`);
let AdvancedMacros = getProperty(ActorUpdate.data.flags, "advanced-macros");
if (!AdvancedMacros) return ui.notifications.error(`REQUIRED: Macro requires AdvancedMacros Module!`);
else if (!AdvancedMacros.runAsGM) return ui.notifications.error(`REQUIRED: ActorUpdate "Execute As GM" must be checked.`);

const lastArg = args[args.length - 1];
const actorD = canvas.tokens.get(lastArg.tokenId).actor;
const rollData = actorD.getRollData();
const level = rollData.details.cr ?? rollData.classes.cleric.levels;
const DC = rollData.attributes.spelldc;
const saveType = rollData.attributes.spellcasting;
const itemD = lastArg.item;
const gameRound = game.combat ? game.combat.round : 0;

jez.log(`###### ${itemD.name} Workflow Started #####`);
jez.log(`lastArg.targets`,lastArg.targets)

const targetList = lastArg.targets.reduce((list, target) => {
    let creatureTypes = ["undead"];
    let undead = target.actor.type === "character"  ? creatureTypes.some(i => (target.actor.data.data.details.race).toLowerCase().includes(i)) : creatureTypes.some(i => (target.actor.data.data.details.type.value).toLowerCase().includes(i));    
    if (!undead && target.actor.type === "character" && target.actor.data.data.details.race === (undefined || null)) {
        jez.log(`=>`, `Invalid Target`, target.name, `| Skipped: Race mismatch`, `| Result:`,target.actor.data.data.details.race);
        return list;
    } else if (!undead && target.actor.type === "npc" && target.actor.data.data.details.type.value === (undefined || null)) {
        jez.log(`=>`, `Invalid Target`, target.name, `| Skipped: Type mismatch`, `| Result:`,target.actor.data.data.details.type.value);
        return list;
    } else if (!undead && target.actor.type === "npc" && target.actor.data.data.details.type.value === "custom") {
        undead = creatureTypes.some(i => (target.actor.data.data.details.type.subtype || target.actor.data.data.details.type.custom).toLowerCase().includes(i));
        if(!undead){ jez.log(`=>`, `Invalid Target`, target.name, `| Skipped: Custom Type mismatch`, `| Result:`,target.actor.data.data.details.type.custom,`(${target.actor.data.data.details.type.subtype})`);
        return list;
       }
    };
    jez.log(`=>`, `Target Found:`, target.name, `| Creature Type:`, target.actor.type === "character" ? target.actor.data.data.details.race : target.actor.data.data.details.type.value);
    if (undead) list.push(target);
    return list;
}, []);

if (targetList.length === 0) {
    ui.notifications.warn(`${itemD.name} was unable to find any valid targets`);
    jez.log(`${itemD.name} was unable to find any valid targets`);
    return jez.log(`##### ${itemD.name} Workflow Aborted #####`);
}

let turnTargets = [];

for (let target of targetList) {
    let mon_cr = target.actor.getRollData().details.cr;
    let level_cr = await cr_lookup(level);
    // add turn resist terms
    let resist = ["Turn Resistance", "Turn Defiance"];
    let getResistance = target.actor.items.find(i => resist.includes(i.name));
    let immunity = ["Turn Immunity"];
    let getImmunity = target.actor.items.find(i => immunity.includes(i.name));
    let getAdvantage = getResistance ? { advantage: true, chatMessage: false, fastForward: true } : { chatMessage: false, fastForward: true };
    let save = await MidiQOL.socket().executeAsGM("rollAbility", { request: "save", targetUuid: target.actor.uuid, ability: saveType, options: getAdvantage });
    if (getImmunity) {
        jez.log(`=>`, `Target Processed:`, target.name, `| CR:`, mon_cr, `| Result: Immune`);
        turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} is immune</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
    } else {
        if (save.total < DC) {
            if (level_cr >= mon_cr) {
                jez.log(`=>`, `Target Processed:`, target.name, `| CR:`, mon_cr, `| DC:`, DC, `| Save:`, save.total, `[Fail]`, `| Result: Destroyed`);
                turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} fails with ${save.total} [D]</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
                await ActorUpdate.execute(target.id, { "data.attributes.hp.value": 0 });
                if (!(game.modules.get("jb2a_patreon")?.active && game.modules.get("sequencer")?.active)) return {};
                new Sequence()
                    .effect()
                    .atLocation(target)
                    .file("jb2a.impact.orange")
                    .scaleToObject(1.5)
                    .play()
            } else {
                jez.log(`=>`, `Target Processed:`, target.name, `| CR:`, mon_cr, `| DC:`, DC, `| Save:`, save.total, `[Fail]`, `| Result: Turned`);
                let effectData = {
                    // label: "Frightened",
                    label: "Turned",    // JGB: Changed name as it is not the RAW Frightened condition effect
                    icon: "icons/svg/terror.svg",
                    origin: lastArg.uuid,
                    disabled: false,
                    flags: { dae: { specialDuration: ["isDamaged"] } },
                    duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
                    changes: [{ key: `flags.midi-qol.disadvantage.ability.check.all`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 20 },
                    { key: `flags.midi-qol.disadvantage.skill.all`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 20 },
                    { key: `flags.midi-qol.disadvantage.attack.all`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 20 }]
                };
                let effect = target.actor.effects.find(i => i.data.label === game.i18n.localize("Turned"));
                if (!effect) {
                    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });
                    jez.log(`>`, target.name, `Applyying: Turned Condition`, `Success`);
                } else {
                    jez.log(`>`, target.name, `Applyying: Turned Condition`, `Failure`);
                }
                turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} fails with ${save.total} [F]</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
                if (!(game.modules.get("jb2a_patreon")?.active && game.modules.get("sequencer")?.active)) return {};
                new Sequence()
                    .effect()
                    .atLocation(target)
                    .file("jb2a.icon.fear.orange")
                    .scaleToObject(1.5)
                    .play()
            }
        } else {
            jez.log(`=>`, `Target Skipped:`, target.name, `| CR:`, mon_cr, `| DC:`, DC, `| Save:`, save.total, `[Skipped]`, `| Result: Save`);
            turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} saves with ${save.total}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
        }
    }
}
jez.log(`##### ${itemD.name} Workflow Completed #####`);
await wait(600);
let turn_results = `<div class="midi-qol-nobox midi-qol-bigger-text">${CONFIG.DND5E.abilities[saveType]} Saving Throw: DC ${DC}</div><div><div class="midi-qol-nobox">${turnTargets.join('')}</div></div>`;
let chatMessage = await game.messages.get(lastArg.itemCardId);
let content = await duplicate(chatMessage.data.content);
let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${turn_results}`;
content = await content.replace(searchString, replaceString);
await chatMessage.update({ content: content });
await ui.chat.scrollBottom();