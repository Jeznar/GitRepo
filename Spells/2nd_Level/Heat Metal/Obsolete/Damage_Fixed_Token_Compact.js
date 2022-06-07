let numDice = 1;
let actorId = "7BJKpNufDB5XseeU"
//
const lastArg = args[args.length - 1];
let aActor = canvas.tokens.get(lastArg.tokenId).actor
let aToken = canvas.tokens.get(lastArg.tokenId)
let aItem = args[0]?.item;
let myTarget = canvas.tokens.objects.children.find(e => e.data.actorId === actorId) 
let damageRoll = new Roll(`${numDice}d8`).evaluate({ async: false });
new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, 'fire', [myTarget], damageRoll,
    { flavor: `${myTarget.name} burns from ${aItem.name}`, itemCardId: args[0].itemCardId });




