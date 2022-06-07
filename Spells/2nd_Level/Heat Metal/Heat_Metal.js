const MACRONAME = "Heat_Metal_0.8.js"
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
const ATTACK_ITEM = `${aToken.name} Heat Metal`;
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
        postResults(msg);
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
    const ATTACK_ITEM = `${oToken.name} Heat Metal`;
    let oActor = oToken.actor
    jez.log("oActor", oActor)
     jez.log(`doOff ---> Delete ${ATTACK_ITEM} from ${oToken.data.name} if it exists`)

    //await deleteItem(ATTACK_ITEM, oActor);  // TODO: Make Library call
    await jez.deleteItems(ATTACK_ITEM, "spell", oActor);
    jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    runVFX(aToken)
    jez.log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    if (!await preCheck()) return (false);
    await jez.deleteItems(ATTACK_ITEM, "spell", aActor);
    const FUNCNAME = "doOnUse()";
    const NUM_DICE = args[0].spellLevel;
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    // jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    // jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)
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
            //jez.log("itemHeated as entered", itemHeated)
            if (!itemHeated) itemHeated = "Unspecified Item"
            itemWorn = html.find("[name=WORNITEM]")[0].checked;
            //jez.log("Values as prepared for create temporary ability","Heated",itemHeated,"Worn",itemWorn);
            //await CreateTemporaryAbility();
            //-------------------------------------------------------------------------------------------
            // Slap the template item onto the actor
            //
            await jez.itemAddToActor(aToken, "%%Heat Metal Damage%%")
            //-------------------------------------------------------------------------------------------
            // Update the item's name and extract the comments from the description
            //
            let itemUpdate = {
                name: ATTACK_ITEM,                 // Change to actor specific name for temp item
            }
            await jez.itemUpdateOnActor(aToken, "%%Heat Metal Damage%%", itemUpdate, "spell")
            //-------------------------------------------------------------------------------------------
            // Grab the data for the new item from the actor
            //
            let getItem = await jez.itemFindOnActor(aToken, ATTACK_ITEM, "spell");
            //-------------------------------------------------------------------------------------------
            // Update the description field
            //
            let description = getItem.data.data.description.value
            description = description.replace(/%NUMDICE%/g, `${NUM_DICE}`);         // Replace %NUMDICE%
            description = description.replace(/%TARGETNAME%/g, `${tToken.name}`);   // Replace %TARGETNAME%
            //-------------------------------------------------------------------------------------------
            // Update the macro field
            //
            let macro = getItem.data.flags.itemacro.macro.data.command
            macro = macro.replace(/%ACTORID%/g, `${tActor?.data._id}`); // Replace %ACTORID%
            macro = macro.replace(/%NUMDICE%/g, `${NUM_DICE}`);         // Replace %NUMDICE%
            //-------------------------------------------------------------------------------------------
            // Build a new itemUpdate Object
            //
            itemUpdate = {
                data: { description: { value: description } },   // Drop in altered description
                flags: {
                    itemacro: {
                        macro: {
                            data: {
                                command: macro,
                                name: ATTACK_ITEM,
                                img: args[0].item.img,
                            },
                        },
                    },
                },
                img: args[0].item.img,
            }
            //-------------------------------------------------------------------------------------------
            // Update the item with new information
            //
            await jez.itemUpdateOnActor(aToken, ATTACK_ITEM, itemUpdate, "spell")
        } else return (false);
        //-------------------------------------------------------------------------------------------
        // Store info on heated item as a flag on the target 
        //
        let heatedItem = {
            description: itemHeated,
            worn: itemWorn,
            dropped: false  // Used to track if the heated item is still "in hand"
        }
        await DAE.setFlag(tActor, `${MACRO}.HeatedItem`, heatedItem);
        //-------------------------------------------------------------------------------------------
        // Build and post summary message to chat card.
        //
        let textVariable = "unless item is <b>dropped</b>"
        if (itemWorn) textVariable = "until item is <b>removed</b>"
        msg = `<p style="color:red;font-size:14px;">
        <b>${tToken.name}</b>'s <b>${itemHeated}</b> begins to glow a dull red with intense heat. 
        taking ${NUM_DICE}d8 fire damage immediately. The red hot item imposes disadvantage 
        on attack rolls and ability checks, ${textVariable}.</p>
        <p style="font-size:14px;">As a bonus action. <b>${aToken.name}</b> can repeat this damage 
        each round for up to a minute, concentraion drops, or the item is dropped.
        </p>`;
        postResults(msg);
        return (true);
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
    if (heatedItem.worn || heatedItem.dropped) { // Worn item can not be easily removed, so just return
        jez.log(`-------------- Finishing --- ${MACRONAME} ${FUNCNAME} -----------------`);
        return (true)
    }
    //----------------------------------------------------------------------------------
    // Create a dialog to allow afflicted actor to choose to drop heated item
    //
    // jez.log("Marco....")
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
    // jez.log("     ....Polo")
    //----------------------------------------------------------------------------------
    // Callback function
    //
    async function doEachCallback(html, mode) {
        jez.log("doEachCallback(html) function executing.", "html", html, "mode", mode);

        if (mode === "Drop") {
            let debuffEffect = aActor.effects.find(ef => ef.data.label === DEBUFF_NAME) ?? null;
            if (debuffEffect) {
                // jez.log("Removing debuff effect", "aActor", aActor, "debuffEffect", debuffEffect);
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
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    //jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Run VFX
 ***************************************************************************************************/
 function runVFX(target) {
    let color = ""
    const IMAGE = aItem.img.toLowerCase()
    if (IMAGE.includes("blue")) color = "blue"
    else if (IMAGE.includes("green")) color = "green"
    else if (IMAGE.includes("orange")) color = "orange"
    else if (IMAGE.includes("purple")) color = "purple"
    else if (IMAGE.includes("magenta")) color = "purple"
    else if (IMAGE.includes("sky")) color = "blue"
    else if (IMAGE.includes("royal")) color = "green"
    if (!color) color = "orange"
  
    new Sequence()
        .effect()
        //.file("jb2a.fire_bolt.orange")
        .file(`jb2a.flames.01.${color}`)
        .duration(10000)
        // .persist()
        .fadeIn(1000)
        .opacity(0.80)
        .fadeOut(1000)
        // .name(VFX_NAME)
        .atLocation(target)
        .play()
  }