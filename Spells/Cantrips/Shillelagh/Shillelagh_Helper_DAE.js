const MACRONAME = "Shillelagh_Helper_DAE.0.2"
console.log(MACRONAME)
/*****************************************************************************************
 * Intended to be called as a macro.execute from within an ItemMacro to make the doOn and
 * doOff options available to an affect that has been exectued outside of DAE.
 * 
 * 12/30/21 0.1 Creation of Macro
 * 12/30/21 0.2 Cleanups
 * 12/31/21 0.4 Dotting i's etc.
 *****************************************************************************************/
let DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
log("---------------------------------------------------------------------------",
    `Starting ${MACRONAME}`,MACRO);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

const ATTACK_ITEM = args[1];

if (!ATTACK_ITEM) {
    ui.notifications.error(`${MACRONAME} received invalid parameters, please, politely ask Joe to fix this`);
    DEBUG = true;
    log(`Bad stuff received by ${MACRONAME}`,"ATTACK_ITEM", ATTACK_ITEM);
    return;
}
log("ATTACK_ITEM",ATTACK_ITEM);

const lastArg = args[args.length - 1];
let msg = "";
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;

if (args[0] === "off") await doOff();         // DAE removal
if (args[0] === "on") await doOn();           // DAE Application

log("---------------------------------------------------------------------------",
    "Finished", `${MACRONAME}`);
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    log(`doOff ---> Delete ${ATTACK_ITEM} from ${aToken.name} if it exists`, aActor)
    await deleteItem(ATTACK_ITEM, aActor);
    log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    log("Nothing to do");
    log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/***************************************************************************************
 * Function to delete an item from actor
 *
 * Parameters
 *  - itemName: A string naming the item to be found in actor's inventory
 *  - actor: Optional actor to be searched, defaults to actor launching this macro
 ***************************************************************************************/
async function deleteItem(itemName, actor) {
    const FUNCNAME = "deleteItem(itemName, actor)";
    log("-------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "itemName", itemName,
        `actor ${actor?.name}`, actor);

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;
    
    log("******* actor.items", actor.items);
    let item = actor.items.find(item => item.data.name === itemName && item.type === "weapon")
    log("*** Item to be deleted:", item);


    if (item == null || item == undefined) {
        log(`${actor.name} does not have ${itemName}`);
        log(`${FUNCNAME} returning false`);
        return (false);
    }
    log(`${actor.name} had ${item.name}`, item);
    await aActor.deleteOwnedItem(item._id);
    log(`${FUNCNAME} returning true`);

    log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
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
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }