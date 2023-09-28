/**********************************************************************************
 * Macro to damage a specific token identified by an ID
 * This is just a snippet that belongs in a larger DAE on/off macro.
 * 
 * The DAE environment contains a collection of information.  One is "origin"
 * 
 * It might have the following specific information:
 *  args[args.length - 1].origin // Actor.aqNN90V6BjFcJpI5.Item.Hc5G91NBEhAH4Vg9
 * 
 * For this operation, I want the ID after Actor.  Obtained like so:
 *  args[args.length - 1].origin.split(".")[1] // aqNN90V6BjFcJpI5
 **********************************************************************************/
let actorId = "aqNN90V6BjFcJpI5"
let itemName = "Heat Metal Damage"

let tToken = canvas.tokens.objects.children.find(e => e.data.actorId === actorId)
let tActor = tToken.actor

console.log(`Token Name: ${tToken.data.name}`,tToken)
console.log(`Actor Name: ${tActor.data.name}`, tActor)
console.log("Items on actor:",tToken.actor.data.items)

//---------------------------------------------------------------------------------
//
//
let damageType = "slashing";
let numDice = 1;
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

