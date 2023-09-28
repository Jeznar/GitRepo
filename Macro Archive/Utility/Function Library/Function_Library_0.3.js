const MACRONAME = "Function_Library_0.3"
/***************************************************************************************
 * Library of somewhat generalized functions to be cut'n'pasted into macros
 * 
 * 11/27/21 0.1 Started this projected and created hasItem() and itemEquipped()
 * 11/27/21 0.2 Added itemAttuned()
 * 11/30/21 0.3 Added ?
 ***************************************************************************************/
const DEBUG = 2;

if (DEBUG) console.log(`Starting: ${MACRONAME}`); 
main()
if (DEBUG) console.log(`Ending ${MACRONAME}`);

/*************************************************************************************** 
* Simple main body function to be used to validate functions being developed
***************************************************************************************/
async function main() {
    const FUNCNAME = "main";

    if (DEBUG) console.log(`Executing ${FUNCNAME}`);

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

    if (DEBUG) console.log(`Normal End ${FUNCNAME}`);

    //----------------------------------------------------------------------------------
    if (await itemAttuned(ITEMNAME)) {
        ui.notifications.info(`${ITEMNAME} is attuned`);
    } else {
        ui.notifications.warn(`${ITEMNAME} is *NOT* attuned`);
    }

    if (DEBUG) console.log(`Normal End ${FUNCNAME}`);
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
    const FUNCNAME = "hasItem";

    // If DEBUG not defined in environment, set it, need var to raise the scope
    // if (typeof DEBUG === `undefined`) {var DEBUG = false};

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    if (DEBUG>1) {
        console.log(`Executing ${FUNCNAME}`);
        console.log(`Item: ${itemName}`);
        console.log(`Actor: ${actor.name}`, actor);
    }

    let item = actor.items.find(item => item.data.name == itemName)
    if (item == null || item == undefined) {
        if (DEBUG) {
            console.log(`${actor.name} does not have ${itemName}`);
            console.log(`${FUNCNAME} returning false`);
        }
        return(false);
    }
    if (DEBUG) {
        console.log(`${actor.name} does have ${itemName}`);
        console.log(`${FUNCNAME} returning true`);
    }
    return(true);
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
    const FUNCNAME = "itemEquipped";
    const DEBUG = true;

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    if (DEBUG > 1) {
        console.log(`Executing ${FUNCNAME}`);
        console.log(`Item: ${itemName}`);
        console.log(`Actor: ${actor.name}`, actor);
    }

    let item = actor.items.find(item => item.data.name == itemName)
    if (item == null || item == undefined) {
        if (DEBUG) {
            console.log(`${actor.name} does not have ${itemName}`);
            console.log(`${FUNCNAME} returning false`);
        }
        return (false);
    } else {
        if (DEBUG) {
            console.log(`${actor.name} has ${itemName} in inventory`, item);
        }
    }

    const EQUIPPED = item.data.data.equipped;

    if (!EQUIPPED) {
        if (DEBUG) {
            console.log(`${itemName} is in inventory but not equipped`, item);
            console.log(`${FUNCNAME} returning false`);
        }
        return (false);
    } else {
        if (DEBUG) {
            console.log(`${itemName} is equipped`, item);
            console.log(`${FUNCNAME} returning true`);
        }
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
    const FUNCNAME = "itemAttuned";
    const DEBUG = true;

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    if (DEBUG > 1) {
        console.log(`Executing ${FUNCNAME}`);
        console.log(`Item: ${itemName}`);
        console.log(`Actor: ${actor.name}`, actor);
    }

    let item = actor.items.find(item => item.data.name == itemName)
    if (item == null || item == undefined) {
        if (DEBUG) {
            console.log(`${actor.name} does not have ${itemName}`);
            console.log(`${FUNCNAME} returning false`);
        }
        return (false);
    } else {
        if (DEBUG) {
            console.log(`${actor.name} has ${itemName} in inventory`, item);
        }
    }

    // Attunment can be: 0 Does not require Attunment, 1 Requires Attunment, 2 Is Attuned
    const ATTUNED = item.data.data.attunement;
    if (DEBUG) console.log(`item.data.data: `,item.data.data);
 
    if (ATTUNED != 2) {
        if (DEBUG) {
            console.log(`${itemName} is in inventory but not attuned`, item);
            console.log(`${FUNCNAME} returning false`);
        }
        return (false);
    } else {
        if (DEBUG) {
            console.log(`${itemName} is attuned`, item);
            console.log(`${FUNCNAME} returning true`);
        }
        return (true);
    }
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
    await ui.chat.scrollBottom();
    return;
}

// OTHER UNREFINED FUNCTIONS


/************************************************************************
 * Check to see if target has named effect. Return boolean result
*************************************************************************/
function hasEffect(target, effect) {
    if (target.actor.effects.find(ef => ef.data.label === effect)) {
        let message = `${target.name} already has ${effect} effect, end ${macroName}`;
        // ui.notifications.info(message);
        if (debug) console.log(message);
        return(true);
    } else {
        if (debug) console.log(` ${target.name} needs ${effect} effect added`);
        return(false)
    }
}

/************************************************************************
 * Check to see if two entities are in range with 2.5 foot added
 * to allow for diagonal measurement to "corner" adjacancies
*************************************************************************/
function inRange(firstEntity, secondEntity, maxRange) {
    let distance = canvas.grid.measureDistance(firstEntity, secondEntity);
    distance = distance.toFixed(1);             // Chop the extra decimals, if any
    if (debug) console.log(` Considering ${secondEntity.name} at ${distance} distance`);
    if (distance > (maxRange + 2.5)) {
        let message = ` ${secondEntity.name} is not in range (${distance}) of ${firstEntity.name}, end ${macroName}`;
        // ui.notifications.warn(message);
        if (debug) console.log(message);
        return(false);
    } 
    return(true);
}

/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        let message = `Targeted nothing, must target single token to be acted upon`;
        // ui.notifications.warn(message);
        if (debug) console.log(message);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        let message = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        // ui.notifications.warn(message);
        if (debug) console.log(message);
        return (false);
    }
    if (debug) console.log(` targeting one target`);
    return (true);
}

/************************************************************************
 * Return true if token is friendly
*************************************************************************/
function isFriendly(token, actor) {
    const FREINDLY = 1, NEUTRAL = 0, HOSTILE = -1;  // Token dispostions, strings as shown in UI  
    if (debug) console.log(`checking attitude of ${token.name}, ${token.data.disposition}`)
    if (token.data.disposition === FREINDLY) return (true);
    return (false);
}
