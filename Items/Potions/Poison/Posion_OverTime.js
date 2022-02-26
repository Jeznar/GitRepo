const MACRONAME = "Posion_OverTime"
jez.log(MACRONAME)
/*****************************************************************************************
 *   If you drink it, you take 3d6 poison damage, and you must succeed on a DC 13 Con
 *   saving throw or be  Poisoned. At the start of each of your turns while you are 
 *   poisoned in this way, you take 3d6 poison damage. At the end of each of your turns, 
 *   you can repeat the saving throw. On a successful save, the poison damage you take on 
 *   subsequent turns decreases by 1d6. The poison ends when the damage decreases to 0.
 *  
 *   DC 13 Constitution saving throw for half damage or suffer the Posioned Effect
 * 
 * 02/05/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
let errorMsg = "";
const DEBUFF_NAME = "Poisoned" 
const DAMAGE_TYPE = "poison"

if (args[0] === "each") doEach();					    // DAE removal

jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/
async function doEach() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let currentRound = game.combat ? game.combat.round : 0;
    let startRound = lastArg.efData.duration.startRound
    let damageDice = 3 + startRound - currentRound // Dice decrease each round
    jez.log("Damage Dice", damageDice)
    //---------------------------------------------------------------------------------------
    // If damage dice have dropped to zero, clear the debuff and quit
    //
    let debuff = aActor.effects.find(ef => ef.data.label === DEBUFF_NAME)
    if (debuff && !damageDice) {
        await debuff.delete();
        return
    } else jez.log(`${aToken.name} lacks ${DEBUFF_NAME} effect.`);
    //---------------------------------------------------------------------------------------
    // Obtain Save Info and apply damage as appropriate
    //
    let saveDC = args[1];
    jez.log('-----SaveDC-------', typeof (saveDC), saveDC)
    let SAVE_TYPE = "con";
    const FLAVOR = `Attempt <b>DC${saveDC} ${CONFIG.DND5E.abilities[SAVE_TYPE]} save </b>to end<b> ${DEBUFF_NAME}</b> effect`;
    jez.log("---- Save Information ---", "SAVE_TYPE", SAVE_TYPE, "saveDC", saveDC, "flavor", FLAVOR);
    let saveObj = (await aActor.rollAbilitySave(SAVE_TYPE, { flavor: FLAVOR, chatMessage: true, fastforward: true }));
    let save = saveObj.total
    jez.log("**** saveObj results", saveObj);
    if (save > saveDC) {
        jez.log(`save was made with a ${save}`);
        //if (aActor) aActor.deleteEmbeddedEntity("ActiveEffect", lastArg.effectId);
        if (debuff) await debuff.delete();
        else jez.log(`${aToken.name} lacks ${DEBUFF_NAME} effect.`);
    } else {
        jez.log(`Save failed with a ${save}. Inflict ${damageDice}d6 of damage`)
        let damageRoll = new Roll(`${damageDice}d6`).evaluate({ async: false });
        jez.log("-------- Damage -------","damageRoll", damageRoll, "Damage Total", damageRoll.total);
        // game.dice3d?.showForRoll(damageRoll);
        await jez.wait(100)
        new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, DAMAGE_TYPE, [aToken], damageRoll,
            { flavor: `${aToken.name} suffers from ${DAMAGE_TYPE} damage` });
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}

/***************************************************************************************************
 * Dig through the chat log looking for our most recent message posted.
 * 
 * As it turned out, this function not useful for this macro at this time, but I'll let it sit
 * here as I may want something like it in the future for munging through chat logs
 ***************************************************************************************************/
 async function digThroughChatLog(actorID) {
    const FUNCNAME = "digThroughChatLog()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    await jez.wait(1000)
    //jez.log(game.messages)
    let msgHistory = [];                                            // Array to hold the history
    game.messages.reduce((list, message) => {                       // Tricksy reduce function
        if (message.data.flags.dnd5e?.roll?.type === "save" &&      // Messages from origin item
            message.data.speaker.actor === actorID)                 // Messages from origin actor
                list.push(message.id);                              // Put'em in an array
        return list;}, msgHistory);                                 // Array will have all matched msgs 
    let itemCard = msgHistory[msgHistory.length - 1];               // Last entry will be most recent
    console.log(`Actor ${actorID}, card ${itemCard}`, msgHistory)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return(itemCard);
}
