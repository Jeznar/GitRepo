const MACRONAME = "Harness_Divine_Power.0.2";
/*******************************************************************************************
 * Crymic Macro that failed out of the box
 * 
 *  Use Midi-qol + Item Macro. That will trigger resouce consumption.
 * 
 * 12/21/21 0.1 JGB Imported Crymic's code and began debugging
 * 12/22/21 0.2 JGB Add code to handle the no-selection, selection on the dialog
 *******************************************************************************************/
const DEBUG = true;

(async () => {
    let actorD = canvas.tokens.get(args[0].tokenId).actor;

    let itemD = args[0].item;
    let rollData = await actorD.getRollData();
    let prof = Math.ceil(rollData.prof / 2);
    let inputText = "";
    log("---------------------------------------------------------------------------",
        "Starting", MACRONAME,
        "actorD", actorD,
        "itemD", itemD,
        "rollData", rollData,
        "prof", prof,
        "inputText", inputText);

    if (actorD.data.data.spells.spell1.max === 0) return ui.notifications.error(
        `No spell slots found on ${actorD.data.token.name}`);
    if (hasAvailableSlot(actor)) {
        // Get options for available slots
        log(`${actorD.data.token.name} has spell slots`)
        for (let i = 1; i <= prof; i++) {
            let chosenSpellSlots = getSpellSlots(actorD, i);
            let minSlots = chosenSpellSlots.value;
            let maxSlots = chosenSpellSlots.max;
            log(`${i} Spell slots ${minSlots} / ${maxSlots}`, chosenSpellSlots);
            if (minSlots != maxSlots) {
                inputText += `<div class="form-group"><label for="spell${i}">
                Spell Slot Level ${i} [${minSlots}/${maxSlots}]</label>
                <input id="spell${i}" name="spellSlot" value="${i}" 
                type="radio"></div>`;
            }
        }
        log("Build a dialog");
        new Dialog({
            title: itemD.name,
            content: `<form><p>Choose 1 spell slot to restore</p><hr>${inputText}</form>`,
            buttons: {
                recover: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Recover",
                    callback: dialogCallback(spellRefund, actorD)
                }
            }
        }).render(true);
    } else {
        return ui.notifications.warn(`You aren't missing any spell slots.`);
    }
})();



/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/



/****************************************************************************************
 * Callback Function for the dialog
 ***************************************************************************************/
 function dialogCallback(spellRefund, actorD) {
    return async (html) => {
        let selected_slot = html.find('input[name="spellSlot"]:checked');
        let slot = "";
        let num = "";
        let msg = "";
        for (let i = 0; i < selected_slot.length; i++) {
            slot = selected_slot[i].id;
            num = selected_slot[i].value;
            log(`${i} slot ${slot} ${num}`)
        }
        let refunded = await spellRefund(actorD, slot)
        log("Refunded", refunded);
        if (refunded) {
            log(`Refunding spell level ${slot} to ${actorD.data.token.name}`)
            msg = `<div><b>${actorD.data.token.name}</b> regains 1 spell slot, <b>Level ${num}</b>.</div>`;
            log(msg);
            postResults(msg);
        } else {
            msg = `<b>${actorD.data.token.name}</b> did not select a spell level to recover. <b>No action taken.</b>`
            log(msg);
            postResults(msg);
            ui.notifications.warn(msg);
        }
    };
}

/****************************************************************************************
 * Determine if the actor has an available spell slot
 ***************************************************************************************/
 function hasAvailableSlot(actorD) {
    const FUNCNAME = "hasAvailableSlot(actorD)";
    log("---------------------------------------------------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "actorD", actorD);
    for (let slot in actorD.data.data.spells) {
        if (actorD.data.data.spells[slot].value < actorD.data.data.spells[slot].max) {
            return true;
        }
    }
    return false;
}

/****************************************************************************************
 * Determine how many slots of a given level the actor has
 ***************************************************************************************/
function getSpellSlots(actorD, level) {
    const FUNCNAME = "getSpellSlots(actorD, level)";
    log("---------------------------------------------------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "actorD", actorD,
        "level", level);
    return actorD.data.data.spells[`spell${level}`];
}

/****************************************************************************************
 * Increase the number of slots at a given level for the actor.
 * 
 * Return boolean, true for success.  Be careful if spellevel is falsey
 ***************************************************************************************/
async function spellRefund(actorD, spellLevel) {
    const FUNCNAME = "spellRefund(actorD, spellLevel)";
    log("---------------------------------------------------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "actorD", actorD,
        "spellLevel", spellLevel
    );

    if (spellLevel) {
        let actor_data = duplicate(actorD.data._source);
        // actor_data.data.spells[`${spellLevel}`].value = actor_data.data.spells[`${spellLevel}`].value + 1;
        actor_data.data.spells[`${spellLevel}`].value++;
        await actorD.update(actor_data);
        log(`Refunded a level ${spellLevel} slot.`)
        return(true)
    }
    log(`No spell level was selected`)
    return(false)
}

/***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsString) {
    const FUNCNAME = "postResults(resultsString)";
    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
    log(`Starting ${MACRONAME} ${FUNCNAME}`,
        `resultsString`, resultsString);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    // let chatmsg = await game.messages.get(itemCard.id)
    let chatmsg = game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatmsg.data.content);
    log(`chatmsg: `, chatmsg);
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();

    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************/
function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for (i; i < numParms; i = i + 2) console.log(` ${lines++})`, parms[i], ":", parms[i + 1]);
    } else {            // Even number of arguments
        console.log(parms[i], ":", parms[i + 1]);
        i = 2;
        for (i; i < numParms; i = i + 2) console.log(` ${lines++})`, parms[i], ":", parms[i + 1]);
    }
}