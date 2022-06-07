const MACRONAME = "Heat_Metal_0.7"
console.log(MACRONAME)
/*****************************************************************************************
 * Create a temporary attack item to use against the victim of Heat Metal
 * 
 * 01/01/21 0.1 Creation of Macro
 * 01/02/21 0.2 Efforts Continue
 * 01/02/21 0.3 Working on forcing temporary attack to hit a specific token, regardless of
 *              targeting.
 * 01/02/21 0.4 Adding macro to do damage with an ItemMacro
 * 01/03/21 0.5 Some more efforts
 * 01/05/21 0.6 Add dialog to allow the specifiction of the item to be heated
 * 01/05/21 0.7 Add doEach that allows the victim to drop the item if not worn
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
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const ATTACK_ITEM = "Heat Metal Damage";
const DEBUFF_NAME = "Heat Metal";
log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";
const CAST = "Cast", ABORT = "Cancel"
let itemHeated = "";
let itemWorn = false

//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (!preCheck()) {
    console.log(`===> ${errorMsg} <===`)   // Log this message regardless of DEBUG
    ui.notifications.error(errorMsg)
    return;
} else console.log(`===> All Clean ${errorMsg} <===`)  

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE repeat execution each round

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
function preCheck() {
    if (args[0]?.tag !== "OnUse") return(true); // Only perform checks for the OnUse invocation
    if (!oneTarget()) {
        postResults(errorMsg)
        return(false)
    }
    log('All looks good, to quote Jean-Luc, "MAKE IT SO!"')
    return (true)
}

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    let originID = lastArg.origin.split(".")[1] // aqNN90V6BjFcJpI5 (Origin  ID)
    log("originID", originID);
    let oToken = canvas.tokens.objects.children.find(e => e.data.actorId === originID)
    log("oToken", oToken)
    let oActor = oToken.actor
    log("oActor", oActor)

    log(`doOff ---> Delete ${ATTACK_ITEM} from ${oToken.data.name} if it exists`)
    await deleteItem(ATTACK_ITEM, oActor);
    log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
  }
  
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    log("A place for things to be done");
    log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    log("--------------OnUse-----------------", "Starting", `${MACRONAME} ${FUNCNAME}`,
        `First Targeted ID`, tActor?.data._id,   // <== This is needed ID -JGB
        `First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken,
        `First Targeted Actor (tActor) ${tActor?.name}`, tActor);

    //----------------------------------------------------------------------------------
    // Create a dialog to allow specification of the item to be heated and proceed
    //
    new Dialog({
        title: "Select Item to be Heated",
        content: `
    <div><h3>What type of item is to be heated by <b>${aToken.name}'s</b> Heat Metal spell?</h3><div>
    <div>You should specify a manufactured metal object, such as a metal weapon or a suit of 
    heavy or medium metal armor, that you can see within range, carried or worn by 
    <b>${tToken.name}</b> that you will cause to glow red-hot.</div><br>
    <div>Item Description (Optional): <input name="DESCTEXT" style="width:350px"/><br><br></div>
    <div><input name="WORNITEM" type="checkbox"/>Item is worn and/or not easily dropped?<br><br></div>
    `,

        buttons: {
            cast: {
                label: CAST,
                callback: (html) => {
                    PerformCallback(html, CAST)
                }
            },
            abort: {
                label: ABORT,
                callback: (html) => {
                    PerformCallback(html, ABORT)
                }
            },
        },
        default: "abort",
    }).render(true);

    log("--------------OnUse-----------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);

    //----------------------------------------------------------------------------------
    // Callback function
    //
    async function PerformCallback(html, mode) {
        log("PerformCallback() function executing.", "mode", mode, "html", html);
        if (mode === CAST) {
            itemHeated = html.find("[name=DESCTEXT]")[0].value;
            log("itemHeated as entered", itemHeated)
            if (!itemHeated) itemHeated = "Unspecified Item"
            itemWorn = html.find("[name=WORNITEM]")[0].checked;
            log("Values as prepared for create temporary ability", 
                "itemHeated", itemHeated, "itemWorn", itemWorn);
            await CreateTemporaryAbility();
        } else return(false);

        // Store info on heated item as a flag on the target (possible permissions issue)
        let heatedItem = {
            description: itemHeated,
            worn: itemWorn,
            dropped: false  // Used to track if the heated item is still "in hand"
        }
        await DAE.setFlag(tActor, `${MACRO}.HeatedItem`, heatedItem);

        return(true);
    }

    //----------------------------------------------------------------------------------
    // Function to create a new spell attack to invoke damage on our victim
    //
    async function CreateTemporaryAbility() {
        const numDice = args[0].spellLevel;

        // Create the ItemMacro Payload and use RegEx to insert values
        let ItemMacro1 = "const lastArg = args[args.length - 1]; \
            let aActor = canvas.tokens.get(lastArg.tokenId).actor; \
            let aToken = canvas.tokens.get(lastArg.tokenId); \
            let aItem = args[0]?.item; \
            let myTarget = canvas.tokens.objects.children.find(e => e.data.actorId === '%ACTORID%'); \
            let damageRoll = new Roll(`%NUMDICE%d8`).evaluate({ async: false }); \
            game.dice3d?.showForRoll(damageRoll); \
            new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, 'fire', [myTarget], damageRoll, \
            {flavor: `${myTarget.name} burns from the heat!`, itemCardId: args[0].itemCardId });"
        let ItemMacro2 = ItemMacro1.replace(/%ACTORID%/g, `${tActor?.data._id}`);
        let ItemMacro3 = ItemMacro2.replace(/%NUMDICE%/g, `${numDice}`);

        let spellDC = aActor.data.data.attributes.spelldc;
        log(` spellDC ${spellDC}`);
        log(` args[0].item.img ${args[0].item.img}`);
        let value = `As a bonus action, this attack may be used to inflict <b>${numDice}d8 fire</b>
         damage to ${tToken.name}.  
        <br><br>
        <b>FoundryVTT</b>: The target does not need to be targeted to use this ability.`;

        let itemData = [{
            "name": ATTACK_ITEM,
            "type": "spell",
            "flags": {
                "itemacro": {
                    "macro": {
                        "data": {
                            "command": `${ItemMacro3}`,
                            "type": "script",
                            "name": `${DEBUFF_NAME}`,
                            "img": `${args[0].item.img}`,
                            "scope": "global"
                        }
                    }
                },
                "midi-qol": {
                    "onUseMacroName": "ItemMacro"
                }
            },
            "data": {
                "source": "Casting Heat Metal",
                "ability": "",
                "description": { "value": value },
                "actionType": "other",
                "formula": "",
                "level": 0,
                "school": "trs",
                "preparation": {
                    "mode": "innate",
                    "prepared": false
                },
            },
            "img": args[0].item.img,
            "effects": []
        }];
        await aActor.createEmbeddedDocuments("Item", itemData);
        let textVariable = "unless item is <b>dropped</b>"
        if (itemWorn) textVariable = "untill item is <b>removed</b>"
        msg = `<p style="color:red;font-size:14px;">
        <b>${tToken.name}</b>'s <b>${itemHeated}</b> begins to glow a dull red with intense heat. 
        taking ${numDice}d6 fire damage immediately. The red hot item imposes disadvantage 
        on attack rolls and ability checks, ${textVariable}.</p>
        <p style="font-size:14px;">As a bonus action. <b>${aToken.name}</b> can repeat this damage 
        each round for up to a minute, concentraion drops, or the item is dropped.
        </p>`;

        postResults(msg);
    }
}

/****************************************************************************************
 * Execute code for a DAE Macro each time on the target's turn per DAE setting
 ***************************************************************************************/
async function doEach() {
    const FUNCNAME = "doEach()";
    log("===========================================================================",
        `Starting`, `${MACRONAME} ${FUNCNAME}`,
        `aActor ${aActor.name}`, aActor);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    let heatedItem = DAE.getFlag(aActor, `${MACRO}.HeatedItem`);
    log("___Item Heated___",
        "itemHeated", heatedItem.description,
        "itemWorn", heatedItem.worn,
        "dropped", heatedItem.dropped)

    if (heatedItem.worn || heatedItem.dropped) { // Worn item can not be easily removed, so just return
        log(`{heatedItem.description} can not be easily dropped.  Worn: ${heatedItem.worn}.  Dropped: ${heatedItem.dropped}`)
        return (true)
    }
    //----------------------------------------------------------------------------------
    // Create a dialog to allow afflicted actor to choose to drop heated item
    //
    log("Marco....")
    new Dialog({
        title: "Drop Red Hot Item?",
        content: `<div><h3>Does <b>${aToken.name}</b> want to drop the red hot 
        <b>${heatedItem.description}</b>?</h3></div>
        <div>If item is dropped, ${aToken.name} will no longer be burned by the item, 
        but of course will no longer have the item on their person.</div><br>`,
        buttons: {
            cast: {
                label: "Drop It",
                callback: (html) => {
                    doEachCallback(html, "Drop")
                }
            },
            abort: {
                label: "Hold It",
                callback: (html) => {
                    doEachCallback(html, "Hold")
                }
            },
        },
        default: "Drop It",
    }).render(true);
    log("     ....Polo")

    //----------------------------------------------------------------------------------
    // Callback function
    //
    async function doEachCallback(html, mode) {
        log("doEachCallback(html) function executing.", "html", html, "mode", mode);

        if (mode === "Drop") {
            let debuffEffect = aActor.effects.find(ef => ef.data.label === DEBUFF_NAME) ?? null;
            if (debuffEffect) {
                log("Removing debuff effect", "aActor", aActor, "debuffEffect", debuffEffect);
                await debuffEffect.delete();
                await wait(100);
                heatedItem.dropped = true;
                await DAE.setFlag(aActor, `${MACRO}.HeatedItem`, heatedItem);
                msg = `<b>${aToken.name}</b> has dropped the red hot <b>${heatedItem.description}</b> 
                and can no longer use it, or be damaged by it.`;
            } else msg = `Strangely, ${aToken.name} lacked ${DEBUFF_NAME} effect.  Code issue here.`;
        }
        if (mode === "Hold") {
            msg = `</b>${aToken.name}</b> has choosen to hold the red hot <b>${heatedItem.description}</b>.
            It can still use the item and be damaged by it.`;
        }
        await ChatMessage.create({ content: msg });
        return (true);
    }

    log("===========================================================================",
    `Ending`, `${MACRONAME} ${FUNCNAME}`);

return;
}

/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "doBonusDamage"
 ***************************************************************************************************/
 async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    log("--------------Bonus Damage-----------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    log("The do On Use code")
    log("--------------Bonus Damage-----------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
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
        errorMsg = `Should have targeted a single token to be acted upon.<br><br> 
        Targeted ${game.user.targets.ids.length} tokens.  Now you have made a mess.`;
        log(errorMsg);
        return (false);
    }
    log(` targeting one target`);
    return (true);
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
        log(`${actor.name} does not have "${itemName}"`);
        log(`${FUNCNAME} returning false`);
        return (false);
    }
    log(`${actor.name} had "${item.name}"`, item);
    let returnCode = await actor.deleteOwnedItem(item._id);
    
    if (returnCode) {
        log(`${FUNCNAME} returning true, item deleted`,returnCode);
        log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
        return (true);
    } else {
        log(`${FUNCNAME} returning false, item delete failed`);
        log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
        return (false);  
    }
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
    log("-------hasItem(itemName, actor)------", "Starting", `${MACRONAME} ${FUNCNAME}`,
    "itemName", itemName, `actor ${actor.name}`, actor);

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    let item = actor.items.find(item => item.data.name == itemName)
    if (item == null || item == undefined) {
        log(`${actor.name} does not have "${itemName}", ${FUNCNAME} returning false`);
         return(false);
    }
    log(`${actor.name} has ${itemName}, ${FUNCNAME} returning true`);
    return(true);
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