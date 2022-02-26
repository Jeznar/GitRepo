/************************************************************
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
 ***********************************************************/
const macroName = "Treebane_0.3"
const debug = 1;
if (debug) console.log(`Starting: ${macroName} arguments passed: ${args.length}`);
if (debug > 2) { let i = 0; for (let arg in args) { console.log(` ${i++}: ${arg}`) }; }

let gameRound = game.combat ? game.combat.round : 0;
const DAMAGETYPE = "slashing";

/************************************************************************
* Set Variables for player and target
*************************************************************************/
// let target = canvas.tokens.get(args[0].failedSaves[0]._id);
let actorD = game.actors.get(args[0].actor._id);
let tokenD = canvas.tokens.get(args[0].tokenId).actor;
let player = canvas.tokens.get(args[0].tokenId);
if (debug > 1) console.log(` Player: `, player);

if (game.user.targets.ids.length != 1) {
    let message = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
    ui.notifications.warn(message);
    if (debug) console.log(message);
    return // Abort execution if a single token wasn't targeted
}

let target = canvas.tokens.get(args[0].targets[0].id);
if (debug) console.log(` Player: ${player.name}, Target: ${target.name}`);

/************************************************************************
* End if target was missed in calling action.
*************************************************************************/
if (args[0].hitTargets.length === 0) {
    let message = ` Missed ${target.name}, end ${macroName}`;
    if (debug) console.log(message);
    return;
}

/************************************************************************
* Determine the type of target
*************************************************************************/
let targetType = target.document._actor.data.data.details.type.value;
if (debug) console.log(` Target type: ${targetType}`);

/*************************************************************************
 * If target is not of type plant end macro
 **************************************************************************/
if (targetType.toLowerCase() !== "plant") {
    if (debug) console.log(` Target type is not plant, ending ${macroName}`);
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
if (debug) console.log(` Dice to roll: ${secondDamage}`);

let damageRoll = new Roll(`${secondDamage}`).evaluate({ async: false });
if (debug) console.log(` Damage Total: ${damageRoll.total} Type: ${DAMAGETYPE}`);
if (debug > 1) {
    console.log('actorD', actorD);
    console.log('tokenD', tokenD);
    console.log('target', target);
    console.log(`itemD`, itemD);
    console.log(`target name ${target.name}`);
    console.log(`item name: ${itemD.name}`);
}

new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, "slashing", [target], damageRoll, 
    { flavor: `${target.name} withers on hit from ${itemD.name}`, itemCardId: args[0].itemCardId });

return;
