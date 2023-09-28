/**********************************************************************************
 * Macro to delete an item by name from an ID obtained from the DAE environment.
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

let tItem = tToken.actor.data.items.find(e => e.data.name === itemName)
console.log(`Item to be deleted ${tItem.name}:`,tItem)

await tActor.deleteOwnedItem(tItem._id);

