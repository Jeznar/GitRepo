const MACRONAME = "Shillelagh.0.1"
console.log(MACRONAME)
/*****************************************************************************************
 * Create/manage a limited duration item for the Shillelagh spell
 * 
 * Description: The wood of a club or quarterstaff you are holding is imbued with nature's 
 *   power. For the duration, you can use your spellcasting ability instead of Strength 
 *   for the attack and damage rolls of melee attacks using that weapon, and the weapon's 
 *   damage die becomes a d8. The weapon also becomes magical, if it isn't already. The 
 *   spell ends if you cast it again or if you let go of the weapon.
 * 
 * 12/31/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME}`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
//let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
//let tActor = tToken?.actor;

const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const EFFECT_NAME = "Shillelagh"
const EFFECT_ICON = "Icons_JGB/Weapons/quarterstaff-shillelagh.jpg"
const MACRO_HELPER = `${MACRO}_Helper_DAE`;
let attackItem = "Shillelagh";

log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem);
let msg = "";
let errorMsg = "";
let baseWeapon = ""; // The base weapon turned into a Shillelagh

//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (!await preCheck()) {
    console.log(errorMsg)
    ui.notifications.error(errorMsg)
    return;
}

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use

log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
    // Check anything important...
    if (typeof errorMsg === undefined) {
        let errorMsg = 'global variable "errorMsg" is not defined, but required'
        console.log(errorMsg)
        ui.notifications.error(errorMsg)
    }
    if (!game.macros.getName(MACRO_HELPER)) {
        errorMsg = `Could not locate required macro: ${MACRO_HELPER}`
        // return (false)
    }

    log('All looks good, to quote Jean-Luc, "MAKE IT SO!"')
    return (true)
}

/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 * Return false if the spell failed.
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    log("--------------OnUse-----------------", "Starting", `${MACRONAME} ${FUNCNAME}`);

    //-------------------------------------------------------------------------------
    // If the buff already exists, remove it before adding another one
    //
    let existingEffect = aActor.effects.find(ef => ef.data.label === EFFECT_NAME) ?? null;
    log("existingEffect", existingEffect)
    if (existingEffect) await existingEffect.delete();

    //----------------------------------------------------------------------------------
    // Run the preCheckOnUse function which checks inventory and sets attackItem
    //
    if (!await preCheckOnUse()) {
        console.log(errorMsg)
        ui.notifications.error(errorMsg)
        return;
    }

    //----------------------------------------------------------------------------------
    // Set base weapon dependent variables
    //
    let descValue = ""
    let damVersatile = ""
    let propVer = "false"
    attackItem += " " + baseWeapon;

    if (baseWeapon === "Club") {
        descValue = `The wood of the club you are holding is imbued with nature's power. 
            For the duration, you can use your spellcasting ability instead of Strength 
            for the attack and damage rolls of melee attacks using that weapon, and the 
            weapon's <b>damage die becomes a d8</b>. 
            <br><br>The weapon also becomes <b>magical</b>.`
    }
    if (baseWeapon === "Quarterstaff") {
        descValue = `The wood of the quarterstaff you are holding is imbued with nature's power. 
           For the duration, you can use your spellcasting ability instead of Strength 
           for the attack and damage rolls of melee attacks using that weapon, and the 
           weapon's <b>damage die becomes a d8</b>.
           <br><br><b>Houserule</b>: It keeps versatile property, damage die becomes a d10. 
           <br><br>The weapon also becomes <b>magical</b>.`
        damVersatile = "1d10+@mod"
        propVer = "true"
    }
    log("--- Weapon Properties ---",
        "propVer", propVer,
        "damVersatile", damVersatile,
        "descValue", descValue)

    //-------------------------------------------------------------------------------
    // Create an effect on the caster to trigger the doOff action to remove temp weap
    //
    let gameRound = game.combat ? game.combat.round : 0;
    let value = `${MACRO_HELPER} "${attackItem}"`;

    let effectData = {
        label: MACRO,
        icon: EFFECT_ICON,
        origin: aActor.uuid,
        disabled: false,
        duration: { rounds: 10, turns: 10, startRound: gameRound, seconds: 60, startTime: game.time.worldTime },
        changes: [
            { key: "macro.execute", mode: CUSTOM, value: value, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
    log(`applied ${MACRO} effect`, effectData);

    //-------------------------------------------------------------------------------
    // Build the item data for the action to be created, a new weapon in inventory
    //
    let itemData = [{
        "name": attackItem,
        "type": "weapon",
        "data": {
            "source": "Casting Shillelagh",
            "ability": "",
            "ability": aActor.data.data.attributes.spellcasting,
            "description": {
                "value": descValue
            },
            "actionType": "mwak",
            "attackBonus": 0,
            "damage": {
                "parts": [[`1d8+@mod`, `bludgeoning`]],  // Set base damage
                "versatile": damVersatile               // Set vesatile damage (Houserule)
            },
            "formula": "",
            "properties": {
                "mgc": "true",  // Mark the new item as magic
                "ver": propVer  // Mark the new item as versatile or not (Houserule)
            }
        },
        "img": EFFECT_ICON,
        "effects": []
    }];
    await aActor.createEmbeddedDocuments("Item", itemData);

    msg = `<p style="color:green;font-size:14px;">
        <b>${aToken.name}</b>'s ${baseWeapon} is wreathed in dim green glow and sprouts 
        magical vines and thorns making it a fearsome weapon.</p>
        <p><b>FoundryVTT</b>: Use newly created item <b>${attackItem}</b> in INVENTORY 
        tab to attack with the temporary weapon.</p>`
    postResults(msg);

    log("--------------OnUse-----------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}
/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
 async function preCheckOnUse() {
    // Check anything important...
    if (hasItem("Club", aActor)) baseWeapon = "Club" 
    if (hasItem("Quarterstaff", aActor)) baseWeapon = "Quarterstaff"

    if (!baseWeapon) {
        errorMsg = `${aToken.name} has nether a Quarterstaff nor Club. Spell Failed.`
        log("PreCheckonUse failed")
        return (false)
    }  

    log("---- preCheckOnUse ----","attackItem",attackItem )
    log("PreCheckonUse passed")
    return (true)
}



/*************************************************************************
 * Check to see if target has named effect. Return boolean result
 *************************************************************************/
function hasEffect(target, effect) {
    const FUNCNAME = "hasEffect(target, effect)";
    log("--------------hasEffect-----------", "Starting", `${MACRONAME} ${FUNCNAME}`,
    "target", target, "effect", effect);
    log("target.actor.data.effects", target.actor.data.effects);
 
    let existingEffect = aActor.effects.find(ef => ef.data.label === effect) ?? null; 
    log("existingEffect", existingEffect)

    // if (target.actor.effects.find(ef => ef.data.label === effect)) {
    if (existingEffect) {
        let message = `${target.name} already has ${effect} effect`;
        // ui.notifications.info(message);
        log(message);
        return(true);
    } else {
        log(` ${target.name} needs ${effect} effect added`);
        return(false)
    }
}

/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    log("--------------Bonus Damage-----------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    log("The do On Use code")
    log("--------------Bonus Damage-----------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}
/***************************************************************************************************
 * Post the results to chat card
 ***************************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    log(`chatMessage: `,chatMessage);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}

/***************************************************************************************
* Function to determine if passed actor has a specific item, returning a boolean result
*
* Parameters
*  - itemName: A string naming the item to be found in actor's inventory
*  - actor: Optional actor to be searched, defaults to actor launching this macro
***************************************************************************************/
function hasItem(itemName, actor) {
    const FUNCNAME = "hasItem";
    log("-------hasItem(itemName, actor)------", "Starting", `${MACRONAME} ${FUNCNAME}`,
    "itemName", itemName, `actor ${actor.name}`, actor);

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    let item = actor.items.find(item => item.data.name == itemName)
    if (item == null || item == undefined) {
        log(`${actor.name} does not have ${itemName}, ${FUNCNAME} returning false`);
         return(false);
    }
    log(`${actor.name} has ${itemName}, ${FUNCNAME} returning true`);
    return(true);
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