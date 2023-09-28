const MACRONAME = "Function_Library_0.1"
/***************************************************************************************
 * Library of somewhat generalized functions to be cut'n'pasted into macros
 * 
 * 11/27/21 0.1 Started this projected and created hasItem() and itemEquipped()
 ***************************************************************************************/
constd DEBUG = 2;

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
}

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
* Function to determine if passed actor has a specific item euipped, returning a boolean 
* result
*
* Parameters
*  - itemName: A string naming the item to be found in actor's inventory
*  - actor: Optional actor to be searched, defaults to actor launching this macro
***************************************************************************************/
async function itemEquipped(itemName, actor) {
    const FUNCNAME = "itemEquipped";

    // If DEBUG not defined in environment, set it, need var to raise the scope
    // if (typeof DEBUG === `undefined`) {var DEBUG = false};

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
            console.log(`${actor.name} does not have equipped ${itemName}`);
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