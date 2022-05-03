const MACRONAME = "Divine_Smite.0.2"
/*****************************************************************************************
 * Original downloaded from https://www.patreon.com/posts/divine-smite-47781600
 * 
 * 12/24/21 0.0 Cry 12/25/21 Posted Version which didn't work for me
 * 12/26/21 0.1 JGB Adding headers and some debug to see what might be going sideways
 * 01/26/22 0.2 JGB Add VFX
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
jez.log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME} or ${MACRO}`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
// Downloaded from https://www.patreon.com/crymic
// more macros at https://gitlab.com/crymic/foundry-vtt-macros/
const lastArg = args[args.length - 1];
let actorD = game.actors.get(lastArg.actor._id);
let tokenD = canvas.tokens.get(lastArg.tokenId);
let itemD = lastArg.item;
let numDice = Math.min(5, Number(lastArg.spellLevel) + 1);
// VFX Settings -------------------------------------------------------------------
const VFX_NAME = `${MACRO}-${tokenD.id}`
const VFX_TARGET = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Regular_GreenYellow_Target_400x400.webm"
const VFX_CASTER = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Regular_GreenYellow_Caster_400x400.webm"
const VFX_OPACITY = 1.0;
const VFX_SCALE = 0.70;
//---------------------------------------------------------------------------------
let improved = actorD.items.find(i => i.name === "Improved Divine Smite");
if (improved) numDice = numDice *= 2;
let msgHistory = Object.values(MidiQOL.Workflow.workflows).filter(i => i.actor.id === actorD.id && i.workflowType === "Workflow" && i.item?.name != itemD.name);
if (msgHistory.length === 0) return ui.notifications.error(`You need to successfully attack first.`);
let lastAttack = msgHistory[msgHistory.length - 1];
let target = canvas.tokens.get(lastAttack.damageList[0].tokenId);
let creatureTypes = ["undead", "fiend"];
let undead = creatureTypes.some(i => (target.actor.data.data.details?.type?.value || target.actor.data.data.details?.race).toLowerCase().includes(i));
let damageType = "radiant";
if (undead) numDice = numDice *= 2;
//-------------------------------------------------------------------------------------------------------------
// Launch VFX on target
// 
// Sequencer commands: https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Effects
//
    new Sequence()
        .effect()
            .file(VFX_TARGET)
            .attachTo(target)
            .scale(VFX_SCALE)
            .opacity(VFX_OPACITY)
            .belowTokens(false)
            //.repeats(3,1000,2000)
            .name(VFX_NAME)           // Give the effect a uniqueish name
            .waitUntilFinished(-2000) // Negative wait time (ms) clips the effect to avoid fadeout*/
        .effect()
            .file(VFX_CASTER)
            .attachTo(target)
            .scale(VFX_SCALE)
            .opacity(VFX_OPACITY)
            .belowTokens(false)
            .repeats(numDice-1,1000,2000)
            .name(VFX_NAME)          // Give the effect a uniqueish name
        .play()
//-------------------------------------------------------------------------------------------------------------
// Perform save
//
let damageRoll = lastAttack.isCritical ? new Roll(`${numDice * 2}d8[${damageType}]`).evaluate({ async: false }) : new Roll(`${numDice}d8[${damageType}]`).evaluate({ async: false });
await game.dice3d?.showForRoll(damageRoll);
let damageWorkflow = await new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damageType, [target], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemCardId: lastArg.itemCardId, itemData: itemD, useOther: false });
let damageBonusMacro = getProperty(actorD.data.flags, `${game.system.id}.DamageBonusMacro`);
if (damageBonusMacro) {
    await damageWorkflow.rollBonusDamage(damageBonusMacro);
} else {
    await damageWorkflow;
}

jez.log("---------------------------------------------------------------------------",
`Finished`, `${MACRONAME}`);
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/