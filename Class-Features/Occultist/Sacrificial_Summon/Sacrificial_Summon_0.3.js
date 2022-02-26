const MACRONAME = "Sacrificial_Summon_0.3"
/*****************************************************************************************
 * Implemention of sacrifical summon HomeBrewed forOlivia in the TiB Campaign.
 * 
 * Spell Description: Cast Find Familiar as an action without expending a spell slot or 
 * using any material components. When you cast Find Familiar in this way, you take 
 * 1d4 + half of your occultist level necrotic damage and your max hit points are reduced 
 * by the same amount until you complete a long rest.
 * 
 * 11/30/21 0.1 Creation of Macro
 * 12/01/21 0.2 Change to use damage from main item instead of rolling it in macro
 * 12/01/21 0.3 Add warpgate call to summon the minion
 *****************************************************************************************/
const DEBUG = false;
const MINION = "Flopsy"
const lastArg = args[args.length - 1];
const itemD = lastArg.item;
const gameRound = game.combat ? game.combat.round : 0;
let damageDetail = await lastArg.damageDetail.find(i=> i.type === "necrotic");
let damageTotal = (damageDetail.damage-(damageDetail.DR ?? 0))*(damageDetail.damageMultiplier ?? 1);

if (DEBUG) {
    console.log(`Executing: ${MACRONAME}`);
    console.log(` Minion: ${MINION}`);
    console.log(` actor: ${actor.name}`,actor);
    console.log(` actor.uuid: `,actor.uuid);
    console.log(` ItemD: ${itemD.name}`,itemD);
    console.log(` damageDetail: `,damageDetail);
    console.log(` damageTotal: `,damageTotal);
}

// Apply the debuff effect
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

let message = `<strong>${actor.name}</strong> drains her life force by <strong>${damageTotal}</strong> 
to summon <strong>${MINION}</strong> to the field.`;
postResults(message); 

await warpgate.spawn(MINION);

return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/****************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    let chatMessage = await game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}