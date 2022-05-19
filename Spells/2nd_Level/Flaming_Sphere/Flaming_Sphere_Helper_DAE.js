const MACRONAME = "Flaming_Sphere_Helper_DAE.0.4.js"
jez.log(MACRONAME)
/*****************************************************************************************
 * Helper fr Flaming_Sphere, based on Moonbeam_Helper_DAE.0.4
 * 
 * 01/01/22 0.1 Creation of Macro
 * 03/16/22 0.2 Move into GitRepo chasing what appears to be permissions issue
 * 05/16/22 0.5 Update for FoundryVTT 9.x .deleteOwnedItem() --> .deleteEmbeddedDocuments()
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

jez.log("---------------------------------------------------------------------------",
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
    jez.log("===========================================================================",
        `Starting`, `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

    let concentrating = hasEffect(aActor, "Concentrating")
    log ("+ Effect", concentrating)

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
    // await deleteItem(ATTACK_ITEM, aActor);
    await jez.deleteItems(ATTACK_ITEM, "spell", aActor);
    jez.log(`doOff ---> Delete the VFX from ${MINION_UNIQUE_NAME}`)
    await deleteVFX(MINION_UNIQUE_NAME);
    jez.log(`doOff ---> Delete ${MINION_UNIQUE_NAME}'s token`)
    await deleteToken(MINION_UNIQUE_NAME);
    jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    jez.log("Nothing to do");
    jez.log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
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
    // await aActor.deleteOwnedItem(item._id);                 // Obsoletes as of Foundry 9.x
    await aActor.deleteEmbeddedDocuments("Item", [item._id])   // Format as of Foundry 9.x 
    jez.log(`${FUNCNAME} returning true`);

    jez.log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}
/***************************************************************************************
 * Function to delete all copies of a named item of a given type from actor
 *
 * Parameters
 *  - itemName: A string naming the item to be found in actor's inventory
 *  - subject: actor, token, or token Id to be searched
 *  - type: type of item to be deleted, e.g. spell, weapon 
 ***************************************************************************************/
/*async function deleteItems(itemName, type, subject) {
    let itemFound = null
    let message = ""
    let actor5e = null
    //----------------------------------------------------------------------------------------------
    // Validate the subject parameter, stashing it into "actor5e" variable
    //
    if (typeof (subject) === "object") {                   // Hopefully we have a Token5e or Actor5e
        if (subject.constructor.name === "Token5e") actor5e = subject.actor
        else {
            if (subject.constructor.name === "Actor5e") actor5e = subject
            else {
                message = `Object passed to jez.deleteItems(...) is type 
                '${typeof (subject)}' must be a Token5e or Actor5e`
                ui.notifications.error(message)
                console.log(message)
                return (false)
            }
        }
    } else {
        if ((typeof (subject) === "string") && (subject.length === 16))
            actor5e = jez.getTokenById(subject).actor
        else {
            message = `Subject parm passed to jez.deleteItems(...) is not a Token5e, 
            Actor5e, or Token.id: ${subject}`
            ui.notifications.error(message)
            console.log(message)
            return (false)
        }
    }
    //----------------------------------------------------------------------------------------------
    // Validate that Type is a string.
    //
    if (typeof (type) != "string") {
        message = `Type parm passed to jez.deleteItems(...) is '${typeof (type)}'.  It
        must be a string identifying a FoundryVTT item type (e.g. spell, weapon).`
        ui.notifications.error(message)
        console.log(message)
        return (false)
    }
    //----------------------------------------------------------------------------------------------
    // Look for matches and delete them.  Generating a message for each deletion
    //
    while (itemFound = actor5e.items.find(item => item.data.name === itemName && 
            item.type === type)) {
        jez.log("itemFound", itemFound)
        await itemFound.delete();
        msg = `Deleted ${type} ${itemName}`      // Set notification message
        ui.notifications.info(msg);
        jez.log(msg);
    }
}*/
/***************************************************************************************************
 * Delete a specified token from the scene using a RunAsGM Macro
 ***************************************************************************************************/
async function deleteToken(minion) {
    const FUNCNAME = `deleteToken(${minion})`;
    const RUNASGMMACRO = "DeleteTokenMacro";
    jez.log(`----Starting ${MACRONAME} ${FUNCNAME} -----`)
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