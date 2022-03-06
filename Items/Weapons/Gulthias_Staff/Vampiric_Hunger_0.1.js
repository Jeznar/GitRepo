const macroName = "Vampiric_Hunger_0.1"
/********************************************************************************************************
 * Macro to implement Vampiric Hunger life drain effect.
 * 
 * Description: The Gulthias staff draws its power from the blood of its wielder, extending tiny black 
 *   roots into the veins beneath the owner's skin. For each day that a character is attuned to it, that 
 *   character must succeed on a DC 14 Constitution saving throw, taking 2d6 necrotic damage on a 
 *   failure. The target's hit point maximum is reduced by an amount equal to the necrotic damage taken. 
 *   The reduction lasts until the target destroys or unattunes from the Gulthias staff and finishes a 
 *   long rest. The target dies if this effect reduces its hit point maximum to 0.
 * 
 * This macro just applies a debuff to implement the HP max reduction.
 * 
 * 12/16/21 1.0 JGB Creation from "Sacrificial_Summon_0.3"
 ******************************************************************************************************/
const DEBUG = false;
const lastArg = args[args.length - 1];
const itemD = lastArg.item;
const gameRound = game.combat ? game.combat.round : 0;
let damageDetail = await lastArg.damageDetail.find(i=> i.type === "necrotic");
let damageTotal = (damageDetail.damage-(damageDetail.DR ?? 0))*(damageDetail.damageMultiplier ?? 1);

if (DEBUG) {
    console.log(`Executing: ${MACRONAME}`);
    console.log(` actor: ${actor.name}`,actor);
    console.log(` actor.uuid: `,actor.uuid);
    console.log(` ItemD: ${itemD.name}`,itemD);
    console.log(` damageDetail: `,damageDetail);
    console.log(` damageTotal: `,damageTotal);
}

//----------------------------------------------------------------------------------------------------
// If save was made, report as such and terminate.
//
if (args[0].failedSaves.length === 0) {
    let message = `<b>${actor.name}</b> made save and suffers no ill effects`;
    postResults(message);
    return;
}

//----------------------------------------------------------------------------------------------------
// Apply the debuff effect
//
let effectData = {
    label: itemD.name,
    icon: itemD.img,
    flags: { dae: { itemData: itemD, stackable: true, macroRepeat: "none" } },
    origin: actor.uuid,
    disabled: false,
    duration: { rounds: 999999, startRound: gameRound },
    changes: [{ key: "data.attributes.hp.max", mode: 2, value: -damageTotal, priority: 20 }]
};
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });

//----------------------------------------------------------------------------------------------------
// Post results and end
//
let message = `The <strong>Gulthias Staff's</strong> tenticles writhe and grow beneath 
<b>${actor.name}</b>'s skin. Drinking in life force and reducing maximum health (HP).`;
postResults(message); 
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
    // const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    // const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}