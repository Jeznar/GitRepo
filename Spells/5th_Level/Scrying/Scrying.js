const MACRONAME = "Scrying"
/*****************************************************************************************
 * Scrying spell front end that sets modifier for saving throw and then performs save.
 * Requires that the target (token) to be scryed upon is targeted.
 * 
 * 02/21/22 0.1 Creation of Macro
 *****************************************************************************************/
// COOL-THING: Double Radio and input field dialog
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && !preCheck()) return
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
//if (args[0] === "off") await doOff();                   // DAE removal
//if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
//if (args[0] === "each") doEach();					    // DAE removal
//if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        ui.notifications.warn(msg)
        console.log(`${MACRONAME} | ${msg}`)
        console.log(`${MACRONAME} | ${msg}`)
        let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
        jez.addMessage(chatMessage,{color:"darkblue",fSize:14,msg:msg,tag:"saves"})
        return(false);
    }
    const SPELL_FOCUS = "Scrying Focus";
    if (!hasItem(SPELL_FOCUS)) {
        msg = `Must have a ${SPELL_FOCUS} in inventory to cast ${aItem.name}.`
        ui.notifications.warn(msg)
        console.log(`${MACRONAME} | ${msg}`)
        let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
        jez.addMessage(chatMessage,{color:"darkblue",fSize:14,msg:msg,tag:"saves"})
        return(false);
    }
    return (true)
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
    popDialog(aToken, tToken);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************
 * 
 ***************************************************************************************/
async function popDialog(token1, token2) {
    const qTitle = "Select Item in Question"
    const QUERY1 = `${token1.name}'s Knowledge of ${token2.name}`
    const LIST1 = [
        'Secondhand (you have heard of the target) [+5]',
        'Firsthand (you have met the target) [+0]',
        'Familiar (you know the target well) [-5]'
    ]
    const QUERY2 = `${token1.name}'s Connection to ${token2.name}`
    const LIST2 = [
        'Accurate Verbal Description [+5]',
        'Detailed Verbal Description [+0]',
        'Likeness or picture [-2]',
        'Possession or garment [-4]',
        'Body part, lock of hair, bit of nail, or the like [-10]'
    ]
    const QUERY3 = "Additional modifier.  Must be a number prefixed with '+' or '-'"
    pickRadioListDouble(qTitle, QUERY1, QUERY2, QUERY3, pickRadioDoubleCallBack, LIST1, LIST2, token1, token2);
    return
}
/***************************************************************************************
 * 
 ***************************************************************************************/
async function pickRadioDoubleCallBack(selection1, selection2, input1, token1, token2) {
    jez.log("pickRadioDoubleCallBack", "selection1", selection1, "selection2", selection2)
    //----------------------------------------------------------------------------------
    // Grab the modifiers out of the selections
    //
    let mod1 = extractMod(selection1)
    if (!mod1) return(false)
    let mod2 = extractMod(selection2)
    if (!mod1) return(false)
    //----------------------------------------------------------------------------------
    // Deal with the additional input line
    //
    jez.log("input1",input1)
    let mod3 = 0
    if (input1) {
        mod3 = extractMod(input1)
        if (!mod3) return(false)
    }
    jez.log("modifier 3", mod3)
    //----------------------------------------------------------------------------------
    // Perform Save
    //
    let totalMod = parseInt(mod1) + parseInt(mod2) + parseInt(mod3)
    let saved = await doSave(token1, token2, totalMod)
     //----------------------------------------------------------------------------------
    // Post a dialog
    //  
    jez.log("Saved?", saved)
    if (saved) msg = `<b>${token2.name}</b> resisted ${aItem.name} from <b>${token1.name}</b> and is unaffected. 
    They are you immune to this spell from this caster for 24 hours.`
    else msg = `<b>${token2.name}</b> succumbed to ${aItem.name} from <b>${token1.name}</b>. ${token1.name} may 
    scry on the subject per spell description.`
    let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMessage,{color:"darkblue",fSize:14,msg:msg,tag:"saves"})
    //----------------------------------------------------------------------------------
    // Check Selection Function.  Return value or null (if none)
    //
    function extractMod(selection) {
        let selArray = selection.match(/[+-]\d+/)
        jez.log('selArray',selArray)
        if (!selArray) {
            msg = `No numeric value found in the selection: '${selection}'`
            ui.notifications.warn(msg);
            console.log(`${MACRO} |`, msg)
            return(false)
        }
        let mod = selArray[0] // "+3"
        jez.log("Modifier extracted", mod)
        return(mod)
    }
}
/***************************************************************************************************
 * Check the saving throw
 ***************************************************************************************************/
 async function doSave(token1, token2, modifier) {
    const FUNCNAME = "doSave(token1, token2, modifier)";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`,
        `Caster ${token1.name}`, token1,
        `Target ${token2.name}`, token2,
        "Total modifier", modifier);
    const SAVE_TYPE = "wis"
    const SAVE_DC = aToken.actor.data.data.attributes.spelldc - modifier;
    const FLAVOR = `${token2.name} ${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to resist ${aItem.name} from ${token1.name}`;
    let save = (await aActor.rollAbilitySave(SAVE_TYPE, { flavor:FLAVOR, chatMessage:true, fastforward:true })).total;
    jez.log(`save`, save)
    if (save >= SAVE_DC) {
        jez.log(`save was made with a ${save}`);
        return(true)
      } else jez.log(`save failed with a ${save}`);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (false);
}
/***************************************************************************************
 * 
 ***************************************************************************************/
async function pickRadioListDouble(qTitle, qText1, qText2, qText3, pickCallBack, options1, options2, token1, token2) {
    const FUNCNAME = "jez.pickFromList(qTitle, qText1, [options1]";
    jez.log("---------Starting ---${FUNCNAME}-------------------------------------------",
        `qTitle`, qTitle,
        `qText1`, qText1,
        `qText2`, qText2,
        `pickCallBack`, pickCallBack,
        `options1`, options1,
        `options2`, options2);
    let msg = ""
    if (typeof (pickCallBack) != "function") {
        msg = `pickFromList given invalid pickCallBack, it is a ${typeof (pickCallBack)}`
        ui.notifications.error(msg);
        console.log(msg);
        return
    }
    if (!qTitle || !qText1 || !qText2 || !options1) {
        msg = `pickFromList arguments should be (qTitle, qText1, qText2, pickCallBack, [options1]),
        but yours are: ${qTitle}, ${qText1}, ${qText2}, ${pickCallBack}, ${options1}`;
        ui.notifications.error(msg);
        console.log(msg);
        return
    }
    //----------------------------------------------------------------------------------------------------
    // Build HTML Template, first radio box
    //
    let template = `
<div>
<label>${qText1}</label>
<div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">
`   // Back tick on its on line to make the console output better formatted
    for (let option of options1) {
        template += `<input type="radio" id="${option}" name="selectedLine1" value="${option}"> <label for="${option}">${option}</label><br>
`   // Back tick on its on line to make the console output better formatted
    }
    template += `</div></div>`
    jez.log("template 1", template)
    jez.log("")
    jez.log("")
    //----------------------------------------------------------------------------------------------------
    // Build HTML Template, second radio box
    //
    template += `
    <div>
    <label>${qText2}</label>
    <div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">
`   // Back tick on its on line to make the console output better formatted
    for (let option2 of options2) {
        template += `<input type="radio" id="${option2}" name="selectedLine2" value="${option2}"> <label for="${option2}">${option2}</label><br>
`   // Back tick on its on line to make the console output better formatted
    }
    template += `</div></div>`
    jez.log("template 2", template)
    jez.log("")
    jez.log("")
    //----------------------------------------------------------------------------------------------------
    // Build HTML Template, third input box
    //
    template += `
    <div>
    <label>${qText3}</label>
    <div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">
    <div><input name="additionalInput" style="width:350px"/></div>
`   // Back tick on its on line to make the console output better formatted
    template += `</div></div>`
    jez.log("template 3", template)
    jez.log("")
    jez.log("")
    //----------------------------------------------------------------------------------------------------
    // Build Dialog 
    //
    new Dialog({
        title: qTitle,
        content: template,
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: 'OK',
                callback: async (html) => {
                    jez.log("html contents", html)
                    const SELECTED_OPTION1 = html.find("[name=selectedLine1]:checked").val();
                    jez.log("Radio Button Selection", SELECTED_OPTION1)
                    jez.log('selected option', SELECTED_OPTION1)
                    const SELECTED_OPTION2 = html.find("[name=selectedLine2]:checked").val();
                    jez.log("Radio Button Selection", SELECTED_OPTION2)
                    jez.log('selected option', SELECTED_OPTION2)
                    const ADDITIONAL_INPUT = html.find("[name=additionalInput]").val();
                    jez.log("Additional Input", ADDITIONAL_INPUT)
                    pickCallBack(SELECTED_OPTION1, SELECTED_OPTION2, ADDITIONAL_INPUT, token1, token2)
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Cancel',
                callback: async (html) => {
                    jez.log('canceled')
                    pickCallBack(null)
                },
            },
        },
        default: 'cancel',
    }).render(true)
    jez.log(`--------Finished ${FUNCNAME}----------------------------------------`)
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
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;
    jez.log("-------hasItem(itemName, actor)------", "Starting", `${MACRONAME} ${FUNCNAME}`,
    "itemName", itemName, `actor ${actor.name}`, actor);
    // If actor was not passed, pick up the actor invoking this macro
    let item = actor.items.find(item => item.data.name == itemName)
    if (item == null || item == undefined) {
        jez.log(`${actor.name} does not have ${itemName}, ${FUNCNAME} returning false`);
         return(false);
    }
    jez.log(`${actor.name} has ${itemName}, ${FUNCNAME} returning true`);
    return(true);
}