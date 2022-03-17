const MACRONAME = "Flaming_Sphere_Helper_DAE.0.3.js"
jez.log(MACRONAME)
/*****************************************************************************************
 * Helper for Flaming_Sphere, based on Moonbeam_Helper_DAE.0.4
 * 
 * 01/01/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const MINION_UNIQUE_NAME = args[1];
const VFX_NAME = args[2];
const ATTACK_ITEM = args[3];
const VFX_OPACITY = args[4] || 0.95;
const VFX_SCALE = args[5] || 0.65;
jez.log("---------------------------------------------------------------------------",
    `Starting ${MACRONAME}`,"MINION_UNIQUE_NAME");
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

if (!MINION_UNIQUE_NAME || !VFX_NAME || !ATTACK_ITEM ) {
    ui.notifications.error(`${MACRONAME} received invalid parameters, please, politely ask Joe to fix this`);
    jez.log(`Bad stuff received by ${MACRONAME}`,
        "MINION_UNIQUE_NAME", MINION_UNIQUE_NAME,
        "VFX_NAME", VFX_NAME,
        "ATTACK_ITEM", ATTACK_ITEM,
        "VFX_OPACITY", VFX_OPACITY,
        "VFX_SCALE", VFX_SCALE);
    return;
}
jez.log("","MINION_UNIQUE_NAME",MINION_UNIQUE_NAME,"VFX_NAME",VFX_NAME,"ATTACK_ITEM",ATTACK_ITEM,
    "VFX_OPACITY",VFX_OPACITY,"VFX_SCALE",VFX_SCALE);
//const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const LAST_ARG = args[args.length - 1];
let msg = "";
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;

if (args[0] === "off") await doOff();         // DAE removal
//if (args[0] === "on") await doOn();           // DAE Application
if (args[0] === "each") doEach();			  // DAE each round execution

jez.log("---------------------------------------------------------------------------",
    "Finished", `${MACRONAME}`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Execute code for a DAE Macro each time on the target's turn per DAE setting
 ***************************************************************************************************/
async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log("===========================================================================",
        `Starting`, `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
    let concentrating = hasEffect(aActor, "Concentrating")
    jez.log("+ Effect", concentrating)

    if (!concentrating) {
        jez.log("No longer concentrating, remove the Flaming_Sphere effect");
        let Flaming_SphereEffect = aActor.effects.find(ef => ef.data.label === "Flaming_Sphere") ?? null; 
        if (Flaming_SphereEffect) {
            jez.log("Flaming_Sphere effect found", Flaming_SphereEffect);
            await Flaming_SphereEffect.delete();
        } else {
            jez.log("Flaming_Sphere effect was not found, this should not have happened.");
        }
    }

    jez.log("===========================================================================",
        `Ending`, `${MACRONAME} ${FUNCNAME}`);
    return;
}
/***************************************************************************************************
 * Check to see if target has named effect. Return the effect or null
 ***************************************************************************************************/
function hasEffect(target, effect) {

    jez.log("+++++++++","target.data.effects", target.data.effects, "effect", effect)
    let effectData = target.data.effects.contents.find(ef => ef.data.label === effect)
    if (effectData) { // Found a Concentraining Effect
        jez.log(`${target.name} has ${effect} effect`, effectData);
        jez.log(`effectData._sourceName`, effectData._sourceName)
        return(effectData);
    } else {
        jez.log(`${target.name} lacks ${effect} effect`);
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
    jez.log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    jez.log(`doOff ---> Delete ${ATTACK_ITEM} from ${aToken.name} if it exists`, aActor)
    await deleteItem(ATTACK_ITEM, aActor);
    jez.log(`doOff ---> Delete the VFX from ${MINION_UNIQUE_NAME}`)
    await deleteVFX(MINION_UNIQUE_NAME);
    jez.log(`doOff ---> Delete ${MINION_UNIQUE_NAME}'s token`)
    await deleteToken(MINION_UNIQUE_NAME);
    jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    jez.log("Nothing to do");
    jez.log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}*/
/***************************************************************************************
 * Function to delete an item from actor
 *
 * Parameters
 *  - itemName: A string naming the item to be found in actor's inventory
 *  - actor: Optional actor to be searched, defaults to actor launching this macro
 ***************************************************************************************/
async function deleteItem(itemName, actor) {
    const FUNCNAME = "deleteItem(itemName, actor)";
    jez.log("-------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "itemName", itemName,
        `actor ${actor?.name}`, actor);

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    let item = actor.items.find(item => item.data.name === itemName && item.type === "spell")
    jez.log("*** Item to be deleted:", item);
    if (item == null || item == undefined) {
        jez.log(`${actor.name} does not have ${itemName}`);
        jez.log(`${FUNCNAME} returning false`);
        return (false);
    }
    jez.log(`${actor.name} had ${item.name}`, item);
    await aActor.deleteOwnedItem(item._id);
    jez.log(`${FUNCNAME} returning true`);

    jez.log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}
/***************************************************************************************************
 * Delete a specified token from the scene using a RunAsGM Macro
 ***************************************************************************************************/
async function deleteToken(minion) {
    const FUNCNAME = "deleteToken(minion)";
    const RUNASGMMACRO = "DeleteTokenMacro";
    jez.log("-----------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "minion", minion);

    let delToken = await findTokenByName(minion)
    if (!delToken) {
        jez.log("Found only tears")
        jez.log("------------------------------ ", "Premature End", `${MACRONAME} ${FUNCNAME}`);
        return (false);
    }
    //----------------------------------------------------------------------------------------------
    // Make the call to delete the token
    //
    // await wait(2000)
    game.macros.getName(RUNASGMMACRO).execute(delToken);
    jez.log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}
/***************************************************************************************************
 * Delete a specified token from the scene using a RunAsGM Macro
 ***************************************************************************************************/
 async function deleteVFX(minion) {
    const FUNCNAME = "executeSummon(minion)";
    const RUNASGMMACRO = "DeleteTokenMacro";
    jez.log("-----------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "minion", minion);
    let delToken = ""

    // Find the token that matchs the specified name.  Return if not found.
    //
    let eToken = await findTokenByName(minion)
    jez.log(`eToken ${eToken.name}`, eToken);
    if (!eToken) {
        jez.log("Found only tears")
        jez.log("------------------------------ ", "Premature End", `${MACRONAME} ${FUNCNAME}`);
        return (false);
    }
    //----------------------------------------------------------------------------------------------
    // Make the call to end the token effects
    //
    jez.log("eToken._object", eToken._object)
    await Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: eToken });
    jez.log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}

/***************************************************************************************************
 * Find an owned token by name on current scene.  Return the token or null if not found
 ***************************************************************************************************/
async function findTokenByName(name) {
    const FUNCNAME = "findTokenByName(name)";
    jez.log("-----------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "name", name)
    let targetToken = ""
    //----------------------------------------------------------------------------------------------
    // Loop through toens on the canvas looking for the one we seek
    //
    let ownedTokens = canvas.tokens.ownedTokens
    for (let i = 0; i < ownedTokens.length; i++) {
        // jez.log(`  ${i}) ${ownedTokens[i].name}`, ownedTokens[i]);
        if (name === ownedTokens[i].name) {
            // jez.log("Eureka I found it!")
            targetToken = ownedTokens[i]
            break;
        }
    }
    if (targetToken) jez.log(`${name}'s token has been found`, targetToken)
    else jez.log(`${name}'s token was not found :-(`)
    jez.log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (targetToken);
}