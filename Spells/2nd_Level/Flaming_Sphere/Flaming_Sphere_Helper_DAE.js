const MACRONAME = "Flaming_Sphere_Helper_DAE.0.3"
console.log(MACRONAME)
/*****************************************************************************************
 * Helper fr Flaming_Sphere, based on Moonbeam_Helper_DAE.0.4
 * 
 * 01/01/22 0.1 Creation of Macro
 * 03/16/22 0.2 Move into GitRepo chasing what appears to be permissions issue
 *****************************************************************************************/
let DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const MINION_UNIQUE_NAME = args[1];
const VFX_NAME = args[2];
const ATTACK_ITEM = args[3];
const VFX_OPACITY = args[4] || 0.95;
const VFX_SCALE = args[5] || 0.65;
log("---------------------------------------------------------------------------",
    `Starting ${MACRONAME}`,"MINION_UNIQUE_NAME");
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

if (!MINION_UNIQUE_NAME || !VFX_NAME || !ATTACK_ITEM ) {
    ui.notifications.error(`${MACRONAME} received invalid parameters, please, politely ask Joe to fix this`);
    DEBUG = true;
    log(`Bad stuff received by ${MACRONAME}`,
        "MINION_UNIQUE_NAME", MINION_UNIQUE_NAME,
        "VFX_NAME", VFX_NAME,
        "ATTACK_ITEM", ATTACK_ITEM,
        "VFX_OPACITY", VFX_OPACITY,
        "VFX_SCALE", VFX_SCALE);
    return;
}

log("","MINION_UNIQUE_NAME",MINION_UNIQUE_NAME,"VFX_NAME",VFX_NAME,"ATTACK_ITEM",ATTACK_ITEM,
    "VFX_OPACITY",VFX_OPACITY,"VFX_SCALE",VFX_SCALE);

const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
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
if (args[0] === "each") doEach();			  // DAE each round execution

log("---------------------------------------------------------------------------",
    "Finished", `${MACRONAME}`);
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************

 /****************************************************************************************
 * Execute code for a DAE Macro each time on the target's turn per DAE setting
 ***************************************************************************************/
async function doEach() {
    const FUNCNAME = "doEach()";
    log("===========================================================================",
        `Starting`, `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    let concentrating = hasEffect(aActor, "Concentrating")
    log ("+ Effect", concentrating)

    if (!concentrating) {
        log("No longer concentrating, remove the Flaming_Sphere effect");
        let Flaming_SphereEffect = aActor.effects.find(ef => ef.data.label === "Flaming_Sphere") ?? null; 
        if (Flaming_SphereEffect) {
            log("Flaming_Sphere effect found", Flaming_SphereEffect);
            await Flaming_SphereEffect.delete();
        } else {
            log("Flaming_Sphere effect was not found, this should not have happened.");
        }
    }

    log("===========================================================================",
        `Ending`, `${MACRONAME} ${FUNCNAME}`);
    return;
}


/***************************************************************************************************
 * Check to see if target has named effect. Return the effect or null
 ***************************************************************************************************/
function hasEffect(target, effect) {

    log("+++++++++","target.data.effects", target.data.effects, "effect", effect)
    let effectData = target.data.effects.contents.find(ef => ef.data.label === effect)
    if (effectData) { // Found a Concentraining Effect
        log(`${target.name} has ${effect} effect`, effectData);
        log(`effectData._sourceName`, effectData._sourceName)
        return(effectData);
    } else {
        log(`${target.name} lacks ${effect} effect`);
        return(false)
    }
}

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
    log(`doOff ---> Delete the VFX from ${MINION_UNIQUE_NAME}`)
    await deleteVFX(MINION_UNIQUE_NAME);
    log(`doOff ---> Delete ${MINION_UNIQUE_NAME}'s token`)
    await deleteToken(MINION_UNIQUE_NAME);
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

    let item = actor.items.find(item => item.data.name === itemName && item.type === "spell")
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

/***************************************************************************************************
 * Delete a specified token from the scene using a RunAsGM Macro
 ***************************************************************************************************/
async function deleteToken(minion) {
    const FUNCNAME = "deleteToken(minion)";
    const RUNASGMMACRO = "DeleteTokenMacro";
    log("-----------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "minion", minion);

    let delToken = await findTokenByName(minion)
    if (!delToken) {
        log("Found only tears")
        log("------------------------------ ", "Premature End", `${MACRONAME} ${FUNCNAME}`);
        return (false);
    }
    //----------------------------------------------------------------------------------------------
    // Make the call to delete the token
    //
    // await wait(2000)
    game.macros.getName(RUNASGMMACRO).execute(delToken);

    log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}

/***************************************************************************************************
 * Delete a specified token from the scene using a RunAsGM Macro
 ***************************************************************************************************/
 async function deleteVFX(minion) {
    const FUNCNAME = "executeSummon(minion)";
    const RUNASGMMACRO = "DeleteTokenMacro";
    log("-----------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "minion", minion);
    let delToken = ""

    // Find the token that matchs the specified name.  Return if not found.
    //
    let eToken = await findTokenByName(minion)
    log(`eToken ${eToken.name}`, eToken);
    if (!eToken) {
        log("Found only tears")
        log("------------------------------ ", "Premature End", `${MACRONAME} ${FUNCNAME}`);
        return (false);
    }
    //----------------------------------------------------------------------------------------------
    // Make the call to end the token effects
    //
    log("eToken._object", eToken._object)
    await Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: eToken });
    log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}

/***************************************************************************************************
 * Find an owned token by name on current scene.  Return the token or null if not found
 ***************************************************************************************************/
async function findTokenByName(name) {
    const FUNCNAME = "findTokenByName(name)";
    log("-----------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "name", name)
    let targetToken = ""
    //----------------------------------------------------------------------------------------------
    // Loop through toens on the canvas looking for the one we seek
    //
    let ownedTokens = canvas.tokens.ownedTokens
    for (let i = 0; i < ownedTokens.length; i++) {
        // log(`  ${i}) ${ownedTokens[i].name}`, ownedTokens[i]);
        if (name === ownedTokens[i].name) {
            // log("Eureka I found it!")
            targetToken = ownedTokens[i]
            break;
        }
    }
    if (targetToken) log(`${name}'s token has been found`, targetToken)
    else log(`${name}'s token was not found :-(`)
    log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (targetToken);
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