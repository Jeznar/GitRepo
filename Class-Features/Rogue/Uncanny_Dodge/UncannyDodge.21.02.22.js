let myTokenId = args[0].tokenId;
let damageHistory = game.messages.entities.map(i=> ({_id : i.id, tokenId : i.data?.flags?.midiqol?.undoDamage[0]?.tokenId, absDamage : i.data?.flags?.midiqol?.undoDamage[0]?.absDamage, newHP : i.data?.flags?.midiqol?.undoDamage[0]?.newHP, newTempHP : i.data?.flags?.midiqol?.undoDamage[0]?.newTempHP, oldHP : i.data?.flags?.midiqol?.undoDamage[0]?.oldHP, oldTempHP : i.data?.flags?.midiqol?.undoDamage[0]?.oldTempHP})).filter(i=> i.tokenId === myTokenId);
if(damageHistory.length > 0) {
    let curtDamage = damageHistory[damageHistory.length -1];
    let lastDamage = curtDamage.oldHP - curtDamage.newHP;
    let target = canvas.tokens.get(curtDamage.tokenId);
    let healingRoll = "";
    lastDamage > 1 ? healingRoll = new Roll(`${Math.floor(lastDamage/2)}`).roll() : healingRoll = new Roll(`0`).roll();
    new MidiQOL.DamageOnlyWorkflow(actor, token, healingRoll.total, "healing", [target], healingRoll, {itemCardId: args[0].itemCardId});
} else return ui.notifications.warn(`You haven't been attacked yet.`);