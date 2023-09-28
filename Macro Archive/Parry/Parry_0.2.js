/*************************************************************
* Macro to implment the Parry reaction that raises AC by 2 for
* the next attack and then returns to normal.
*
* 12/01/21 0.1 JGB Creation
* 12/01/21 0.2 JGB Cleanup
*************************************************************/
const macroName = "Parry_0.2"
const debug = true;
const effect = "Parry";
const gameRound = game.combat ? game.combat.round : 0;
const lastArg = args[args.length - 1];
const itemD = lastArg.item;
const iconImage = itemD.img;
const acBonus = 2;
let target = canvas.tokens.get(args[0].tokenId).actor;
if (debug) console.log(` ItemMacro - token: ${target.name}`);

await processTarget(target);
return;

/*************************************************************** 
* Process passed the passed target to toggle Flanking Condition
***************************************************************/
async function processTarget(target) {
    if (debug) console.log(` Parry turning on for ${target.data.token.name}`);
    let effectData = [{
        label: effect,
        icon: iconImage,
        duration: { rounds: 1, startRound: gameRound, startTime: game.time.worldTime },
        flags: { dae: { macroRepeat: "none", specialDuration: ["1Reaction","isAttacked"] } },
        /*origin: args[0].uuid,*/
        changes: [{
            "key": "data.attributes.ac.bonus",
            "mode": 2,
            "value": acBonus,
            "priority": 20
        }]
    }];

    await target.createEmbeddedDocuments("ActiveEffect", effectData);

    let message = `<em>${target.data.token.name} chooses to <strong>parry</strong> the attack.</em><br>Armor class temporarily boosted by ${acBonus}`;
    postResults(message);

    return;
}

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