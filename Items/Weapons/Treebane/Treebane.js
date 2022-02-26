const macroName = "Treebane.0.4.js"
/************************************************************************
 * On hit, againts creatures of type "plant" add an extra 1d8 
 * slashing damage.
 * 
 *  - Setup Variables
 *  - Exit on a miss in calling item
 *  - Determine type of target
 *  - If target is of type plant, roll extra 1d8 slashing dam
 *  - Apply results
 * 
 * 11/14/21 0.1 JGB created from Knock_Down_0.3"
 * 11/14/21 0.2 JGB turn down debug level
 * 11/14/21 0.3 JGB Bug: Wither Affects Non-Plants
 * 02/24/22 0.4 JGB Standardisizing and go after that bug (got it)
 *************************************************************************/
jez.log(`Starting: ${macroName} arguments passed: ${args.length}`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

let gameRound = game.combat ? game.combat.round : 0;
const DAMAGETYPE = "slashing";
/************************************************************************
* Set Variables for player and target
*************************************************************************/
// let target = canvas.tokens.get(args[0].failedSaves[0]._id);
let actorD = game.actors.get(args[0].actor._id);
let tokenD = canvas.tokens.get(args[0].tokenId).actor;
let player = canvas.tokens.get(args[0].tokenId);
jez.log(` Player: `, player);

if (game.user.targets.ids.length != 1) {
    let message = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
    ui.notifications.warn(message);
    jez.log(message);
    return // Abort execution if a single token wasn't targeted
}
let target = canvas.tokens.get(args[0].targets[0].id);
jez.log(` Player: ${player.name}, Target: ${target.name}`);

runVFX(target)
/************************************************************************
* End if target was missed in calling action.
*************************************************************************/
if (args[0].hitTargets.length === 0) {
    let message = ` Missed ${target.name}, end ${macroName}`;
    jez.log(message);
    return;
}
/**************************************************************************
 * If target is not of type plant end macro
 **************************************************************************/
let isNPC = false
let targetType = null
if (target.document._actor.data.type === "npc") isNPC = true; //else isNPC = false;
if (isNPC) targetType = target.document._actor.data.data.details.type.value
else targetType = target.document._actor.data.data.details.race.toLowerCase()
if (targetType.includes("plant")) {
    jez.log(`${target.name} is a plant`)
} else {
    jez.log(` ${target.name} type is not plant, ending ${macroName}`);
    return;
}
/************************************************************************
 * Roll extra 1d8 slashing damage & apply
 **************************************************************************/
let damageType = "slashing";
let numDice = 1;
args[0].isCritical ? numDice = numDice * 2 : numDice;
let itemD = player.actor.items.getName("Treebane");
let secondDamage = `${numDice}d8`;
jez.log(` Dice to roll: ${secondDamage}`);

let damageRoll = new Roll(`${secondDamage}`).evaluate({ async: false });
jez.log(` Damage Total: ${damageRoll.total} Type: ${DAMAGETYPE}`);

new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, "slashing", [target], damageRoll,
    { flavor: `${target.name} withers on hit from ${itemD.name}`, itemCardId: args[0].itemCardId });

return;

/**************************************************************************
 * Fire off the visual effects
 **************************************************************************/
async function runVFX(token5e) {
// COOL-THING: Random VFX graphic file via wildcard
//let VFX_ATTACK = "modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Melee/GreatAxe01_Fire_Regular_Green_800x600.webm"
let VFX_ATTACK = "modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Melee/GreatAxe01_Fire_*_800x600.webm"
new Sequence()
    .effect()
        .file(VFX_ATTACK)
        .atLocation(token5e)
        .scale(0.5)
        .missed(args[0].hitTargets.length === 0)
    .play()


}