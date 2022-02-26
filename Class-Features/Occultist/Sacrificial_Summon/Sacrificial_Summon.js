const MACRONAME = "Sacrificial_Summon_0.4"
/*****************************************************************************************
 * Implemention of sacrifical summon HomeBrewed forOlivia in the TiB Campaign.
 * 
 * Spell Description: Cast Find Familiar as an action without expending a spell slot or 
 * using any material components. When you cast Find Familiar in this way, you take 
 * 1d4 + half of your occultist level necrotic damage and your max hit points are reduced 
 * by the same amount until you complete a long rest.
 * 
 * 02/16/22 0.4 Convert to new(ish) styles
 *****************************************************************************************/
const MINION = "Flopsy"
const lastArg = args[args.length - 1];
const itemD = lastArg.item;
const gameRound = game.combat ? game.combat.round : 0;
let damageDetail = await lastArg.damageDetail.find(i => i.type === "necrotic");
let damageTotal = (damageDetail.damage - (damageDetail.DR ?? 0)) * (damageDetail.damageMultiplier ?? 1);
jez.log(`Executing: ${MACRONAME}`,
    ` Minion: `, MINION, ` actor: ${actor.name}`, actor, ` actor.uuid: `, actor.uuid,
    ` ItemD: ${itemD.name}`, itemD, ` damageDetail: `, damageDetail, ` damageTotal: `, damageTotal);
//----------------------------------------------------------------------------------------
// Apply the debuff effect
//
let effectData = {
    label: itemD.name,
    icon: itemD.img,
    flags: { dae: { itemData: itemD, stackable: true, macroRepeat: "none", specialDuration: ["longRest"] } },
    origin: actor.uuid,
    disabled: false,
    duration: { rounds: 99999, startRound: gameRound },
    changes: [{ key: "data.attributes.hp.max", mode: 2, value: -damageTotal, priority: 20 }]
};
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
//----------------------------------------------------------------------------------------
// Create and post summary message
//
let msg = `<b>${actor.name}</b> drains her life force by <b>${damageTotal}</b> to summon <b>${MINION}</b>.`;
let chatMessage = await game.messages.get(lastArg.itemCardId);
jez.addMessage(chatMessage, {color:"purple", fSize:15, msg:msg, tag:"saves" })
// COOL-THING: USes Warp Gate to spawn a minion with out a pop up dialog
await warpgate.spawn(MINION);