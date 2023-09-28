const MACRONAME = "Function_Library_0.5"
/***************************************************************************************
 * Library of somewhat generalized functions to be cut'n'pasted into macros
 * 
 * 11/27/21 0.1 Started this projected and created hasItem() and itemEquipped()
 * 11/27/21 0.2 Added itemAttuned()
 * 11/30/21 0.3 Added ?
 * 01/06/22 0.4 Updated variables to more =recent standard and added use of log function
 * 01/10/22 0.5 Added jezIsToken5e and jezIsActor5e
 ***************************************************************************************/
const DEBUG = 2;
let errorMsg = "";
let msg = "";

log(`Starting: ${MACRONAME}`); 
main()
log(`Ending ${MACRONAME}`);

/*************************************************************************************** 
* Simple main body function to be used to validate functions being developed
***************************************************************************************/
async function main() {
    const FUNCNAME = "main";

    log(`Executing ${FUNCNAME}`);

    const ITEMNAME = "Dagger";

    //----------------------------------------------------------------------------------
    if (await hasItem(ITEMNAME)) {
        ui.notifications.info(`${ITEMNAME} was found in inventory`);
    } else {
        ui.notifications.warn(`${ITEMNAME} was *NOT* found in inventory`);
    }

    //----------------------------------------------------------------------------------
    if (await itemEquipped(ITEMNAME)) {
        ui.notifications.info(`${ITEMNAME} is equipped`);
    } else {
        ui.notifications.warn(`${ITEMNAME} is *NOT* equipped`);
    }

    log(`Normal End ${FUNCNAME}`);

    //----------------------------------------------------------------------------------
    if (await itemAttuned(ITEMNAME)) {
        ui.notifications.info(`${ITEMNAME} is attuned`);
    } else {
        ui.notifications.warn(`${ITEMNAME} is *NOT* attuned`);
    }

    log(`Normal End ${FUNCNAME}`);
}

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/***************************************************************************************
* Function to determine if passed actor has a specific item, returning a boolean result
*
* Parameters
*  - itemName: A string naming the item to be found in actor's inventory
*  - actor: Optional actor to be searched, defaults to actor launching this macro
***************************************************************************************/
async function hasItem(itemName, actor) {
    const FUNCNAME = "hasItem(itemName, actor)";
    log(`--------------${FUNCNAME}-----------`, "Starting", `${MACRONAME} ${FUNCNAME}`,
        "itemName", itemName, "actor", actor);

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    let item = actor.items.find(item => item.data.name == itemName)
    if (item == null || item == undefined) {
        log(`${actor.name} does not have ${itemName}, ${FUNCNAME} returning false`);
        log(`--------------${FUNCNAME}-FALSE-----`, "Finished", `${MACRONAME} ${FUNCNAME}`);
        return (false);
    }
    log(`${actor.name} does have ${itemName}, ${FUNCNAME} returning true`);
    log(`--------------${FUNCNAME}-TRUE------`, "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}

/***************************************************************************************
 * Function to delete an item from actor
 *
 * Parameters
 *  - itemName: A string naming the item to be found in actor's inventory
 *  - actor: Optional actor to be searched, defaults to actor launching this macro
 ***************************************************************************************/
async function jezDeleteItem(itemName, actor) {
    const FUNCNAME = "deleteItem(itemName, actor)";

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`,
        "itemName", itemName, `actor ${actor?.name}`, actor);

    if (!jezIsActor5e(actor)) {
        errorMsg = `Obtained actor argument is not of type Actor5E (${actor?.constructor.name})`
        log(errorMsg)
        log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} ==> FALSE --------------`);
        return (false);
    }

    let item = actor.items.find(item => item.data.name === itemName && item.type === "spell")
    if (item == null || item == undefined) {
        errorMsg = `${actor.name} does not have ${itemName}`
        log(errorMsg);
        log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} ==> FALSE --------------`);
        return (false);
    }

    await aActor.deleteOwnedItem(item._id);
    log(`${actor.name} had (past tense) ${item.name}`, item);
    log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} ==> TRUE -----------------`);
    return (true);
}

/***************************************************************************************
* Function to determine if passed actor has a specific item equipped, returning a boolean 
* result
*
* Parameters
*  - itemName: A string naming the item to be found in actor's inventory
*  - actor: Optional actor to be searched, defaults to actor launching this macro
***************************************************************************************/
async function itemEquipped(itemName, actor) {
    const FUNCNAME = "itemEquipped(itemName, actor)";
    log(`--------------${FUNCNAME}-----------`, "Starting", `${MACRONAME} ${FUNCNAME}`,
        "itemName", itemName, "actor", actor, "actor.name", actor?.name);

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    let item = actor.items.find(item => item.data.name == itemName)
    if (item == null || item == undefined) {
        log(`${actor.name} does not have ${itemName}, ${FUNCNAME} returning false`);
        log(`--------------${FUNCNAME}-FALSE-----`, "Finished", `${MACRONAME} ${FUNCNAME}`);
        return (false);
    } else {
        log(`${actor.name} has ${itemName} in inventory`, item);
    }

    const EQUIPPED = item.data.data.equipped;

    if (!EQUIPPED) {
        log(`${itemName} is in inventory but not equipped, ${FUNCNAME} returning false`);
        log(`--------------${FUNCNAME}-FALSE-----`, "Finished", `${MACRONAME} ${FUNCNAME}`);
        return (false);
    } else {
        log(`${itemName} is equipped, ${FUNCNAME} returning true`);
        log(`--------------${FUNCNAME}-TRUE------`, "Finished", `${MACRONAME} ${FUNCNAME}`);
        return (true);
    }
}

/***************************************************************************************
* Function to determine if passed actor has a specific item attuned, returning a boolean 
* result
*
* Parameters
*  - itemName: A string naming the item to be found in actor's inventory
*  - actor: Optional actor to be searched, defaults to actor launching this macro
***************************************************************************************/
async function itemAttuned(itemName, actor) {
    const FUNCNAME = "itemAttuned(itemName, actor)";
    log(`--------------${FUNCNAME}-----------`, "Starting", `${MACRONAME} ${FUNCNAME}`,
        "itemName", itemName, "actor", actor, "actor.name", actor?.name);

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    let item = actor.items.find(item => item.data.name == itemName)
    if (item == null || item == undefined) {
        log(`${actor.name} does not have ${itemName}.`);
        log(`--------------${FUNCNAME}-FALSE-----`, "Finished", `${MACRONAME} ${FUNCNAME}`);
        return (false);
    } else {
        log(`${actor.name} has ${itemName} in inventory`, item);
    }

    // Attunment can be: 0 Does not require Attunment, 1 Requires Attunment, 2 Is Attuned
    const ATTUNED = item.data.data.attunement;
    log(`item.data.data: `, item.data.data);

    if (ATTUNED != 2) {
        log(`${itemName} is in inventory but not attuned.`, item);
        log(`--------------${FUNCNAME}-FALSE-----`, "Finished", `${MACRONAME} ${FUNCNAME}`);
        return (false);
    }
    log(`${itemName} is attuned`, item);
    log(`--------------${FUNCNAME}-TRUE------`, "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}

/************************************************************************
 * Post the results to chat card
 *************************************************************************/
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
    await wait(100);
    await ui.chat.scrollBottom();
    return;
}

// OTHER UNREFINED FUNCTIONS

/***************************************************************************************************
 * Post a new chat message
 ***************************************************************************************************/
 async function postNewChatMessage(msgString) {
    const FUNCNAME = "postChatMessage(msgString)";
    log(`--------------${FUNCNAME}-----------`, "Starting", `${MACRONAME} ${FUNCNAME}`,
        "msgString",msgString);
    await ChatMessage.create({ content: msgString });
    await wait(1000);
    await ui.chat.scrollBottom();
    log(`--------------${FUNCNAME}-----------`, "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/************************************************************************
 * Check to see if target has named effect. Return boolean result
*************************************************************************/
function hasEffect(target, effect) {
    if (target.actor.effects.find(ef => ef.data.label === effect)) {
        errorMsg = `>>> ${target.name} has ${effect}.`;
        log(errorMsg);
        return(true);
    } else {
        errorMsg = `>>> ${target.name} lacks ${effect}.`
        log(errorMsg);
        return(false)
    }
}

/************************************************************************
 * Check to see if two entities are in range with 4.9 feet added
 * to allow for diagonal measurement to "corner" adjacancies
*************************************************************************/
function inRange(firstEntity, secondEntity, maxRange) {
    let distance = canvas.grid.measureDistance(firstEntity, secondEntity);
    distance = distance.toFixed(1);             // Chop the extra decimals, if any
    log(` Considering ${secondEntity.name} at ${distance} distance from ${firstEntity.name}`);
    if (distance > (maxRange + 4.9)) {
        errorMsg = ` ${secondEntity.name} is not in range (${distance}) of ${firstEntity.name}`;
        log(errorMsg);
        return(false);
    } 
    return(true);
}

/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        errorMsg = `Targeted nothing, must target single token to be acted upon`;
        log(errorMsg);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        errorMsg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        log(errorMsg);
        return (false);
    }
    log(`Targeting one target, a good thing`);
    return (true);
}

/************************************************************************
 * Return true if token is friendly
*************************************************************************/
function isFriendly(token) {
    const FRIENDLY = 1, NEUTRAL = 0, HOSTILE = -1;  // Token dispostions, strings as shown in UI  
    log(`checking attitude of ${token.name}, ${token.data.disposition}`)
    switch (token.data.disposition) {
        case FRIENDLY: msg = `${token.name} has a <b>friendly</b> disposition`; break;
        case NEUTRAL:  msg = `${token.name} has a <b>neutral</b> disposition`; break;
        case HOSTILE:  msg = `${token.name} has a <b>hostal</b> disposition`; break;
    }
    log(msg);
    if (token.data.disposition === FRIENDLY) return (true);
    return (false);
}
/***************************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************************/
 function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    }
}
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

/***************************************************************************************************
 * Return true if passed argument is of object type "Token5e"
 ***************************************************************************************************/
 function jezIsToken5e(obj) {
    if (obj?.constructor.name === "Token5e") return(true)
    return(false)
}

/***************************************************************************************************
 * Return true if passed argument is of object type "Token5e"
 ***************************************************************************************************/
 function jezIsActor5e(obj) {
    if (obj?.constructor.name === "Actor5e") return(true)
    return(false)
}