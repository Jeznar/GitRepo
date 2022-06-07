const MACRONAME = "Heat_Metal_0.7"
jez.log(MACRONAME)
/*****************************************************************************************
 * Create a temporary attack item to use against the victim of Heat Metal
 * 
 * 01/01/21 0.1 Creation of Macro
 * 06/07/22 0.8 Upgrade to use an OverTime DoT and include VFX
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//----------------------------------------------------------------------------------
// Set Macro specific global variables
//
const ATTACK_ITEM = "Heat Metal Damage";
const DEBUFF_NAME = "Heat Metal";
const CAST = "Cast", ABORT = "Cancel"
let itemHeated = "";
let itemWorn = false
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE repeat execution each round
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 ***************************************************************************************************/
async function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        await postResults(msg);
        return (false);
    }
    return (true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    let originID = LAST_ARG.origin.split(".")[1] // aqNN90V6BjFcJpI5 (Origin  ID)
    jez.log("originID", originID);
    let oToken = canvas.tokens.objects.children.find(e => e.data.actorId === originID)
    jez.log("oToken", oToken)
    let oActor = oToken.actor
    jez.log("oActor", oActor)
    jez.log(`doOff ---> Delete ${ATTACK_ITEM} from ${oToken.data.name} if it exists`)
    await deleteItem(ATTACK_ITEM, oActor);  // TODO: Make Library call
    jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    jez.log("TODO: Place on-fire VFX");
    jez.log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)
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
    jez.log("--------------OnUse-----------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
    //----------------------------------------------------------------------------------
    // Callback function
    //
    async function PerformCallback(html, mode) {
        jez.log("PerformCallback() function executing.", "mode", mode, "html", html);
        if (mode === CAST) {
            itemHeated = html.find("[name=DESCTEXT]")[0].value;
            jez.log("itemHeated as entered", itemHeated)
            if (!itemHeated) itemHeated = "Unspecified Item"
            itemWorn = html.find("[name=WORNITEM]")[0].checked;
            jez.log("Values as prepared for create temporary ability", 
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
        let ItemMacro1 = "const LAST_ARG = args[args.length - 1]; \
            let aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; \
            let aToken = canvas.tokens.get(LAST_ARG.tokenId); \
            let aItem = args[0]?.item; \
            let myTarget = canvas.tokens.objects.children.find(e => e.data.actorId === '%ACTORID%'); \
            let damageRoll = new Roll(`%NUMDICE%d8`).evaluate({ async: false }); \
            game.dice3d?.showForRoll(damageRoll); \
            new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, 'fire', [myTarget], damageRoll, \
            {flavor: `${myTarget.name} burns from the heat!`, itemCardId: args[0].itemCardId });"
        let ItemMacro2 = ItemMacro1.replace(/%ACTORID%/g, `${tActor?.data._id}`);
        let ItemMacro3 = ItemMacro2.replace(/%NUMDICE%/g, `${numDice}`);
        let spellDC = aActor.data.data.attributes.spelldc;
        jez.log(` spellDC ${spellDC}`);
        jez.log(` args[0].item.img ${args[0].item.img}`);
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
        taking ${numDice}d8 fire damage immediately. The red hot item imposes disadvantage 
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
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
    let heatedItem = DAE.getFlag(aActor, `${MACRO}.HeatedItem`);
    jez.log("___Item Heated___",
        "itemHeated", heatedItem.description,
        "itemWorn", heatedItem.worn,
        "dropped", heatedItem.dropped)
    if (heatedItem.worn || heatedItem.dropped) { // Worn item can not be easily removed, so just return
        jez.log(`{heatedItem.description} can not be easily dropped.  Worn: ${heatedItem.worn}.  Dropped: ${heatedItem.dropped}`)
        jez.log(`-------------- Finishing --- ${MACRONAME} ${FUNCNAME} -----------------`);
        return (true)
    }
    //----------------------------------------------------------------------------------
    // Create a dialog to allow afflicted actor to choose to drop heated item
    //
    jez.log("Marco....")
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
    jez.log("     ....Polo")
    //----------------------------------------------------------------------------------
    // Callback function
    //
    async function doEachCallback(html, mode) {
        jez.log("doEachCallback(html) function executing.", "html", html, "mode", mode);

        if (mode === "Drop") {
            let debuffEffect = aActor.effects.find(ef => ef.data.label === DEBUFF_NAME) ?? null;
            if (debuffEffect) {
                jez.log("Removing debuff effect", "aActor", aActor, "debuffEffect", debuffEffect);
                await debuffEffect.delete();
                await jez.wait(100);
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
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
return;
}
/***************************************************************************************
 * Function to delete an item from actor
 *
 * Parameters
 *  - itemName: A string naming the item to be found in actor's inventory
 *  - actor: Optional actor to be searched, defaults to actor launching this macro
 ***************************************************************************************/
 async function deleteItem(itemName, actor) { // TODO: Replace with Library call
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
        jez.log(`${actor.name} does not have "${itemName}"`);
        jez.log(`${FUNCNAME} returning false`);
        return (false);
    }
    jez.log(`${actor.name} had "${item.name}"`, item);
    let returnCode = await actor.deleteOwnedItem(item._id);
    
    if (returnCode) {
        jez.log(`${FUNCNAME} returning true, item deleted`,returnCode);
        jez.log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
        return (true);
    } else {
        jez.log(`${FUNCNAME} returning false, item delete failed`);
        jez.log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
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
async function hasItem(itemName, actor) { // TODO: Replace with library call
    const FUNCNAME = "hasItem";
    jez.log("-------hasItem(itemName, actor)------", "Starting", `${MACRONAME} ${FUNCNAME}`,
    "itemName", itemName, `actor ${actor.name}`, actor);

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    let item = actor.items.find(item => item.data.name == itemName)
    if (item == null || item == undefined) {
        jez.log(`${actor.name} does not have "${itemName}", ${FUNCNAME} returning false`);
         return(false);
    }
    jez.log(`${actor.name} has ${itemName}, ${FUNCNAME} returning true`);
    return(true);
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}