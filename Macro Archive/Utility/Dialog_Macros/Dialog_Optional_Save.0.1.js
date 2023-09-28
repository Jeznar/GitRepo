const MACRONAME = "Dialog_Optional_Save.0.1"
console.log(MACRONAME)
/*****************************************************************************************
 * Create a dialog that asks if a save is wanted in the OnUse Execution
 * 
 * 01/01/21 0.1 Creation of Macro
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
const SAVE_DC = aActor.data.data.attributes.spelldc;
const SAVE_TYPE = "DEX"
log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";

//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (!preCheck()) {
    console.log(errorMsg)
    ui.notifications.error(errorMsg)
    return;
}

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus



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
    // Check anything important...
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
    log("Something could have been here")
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
        `First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken,
        `First Targeted Actor (tActor) ${tActor?.name}`, tActor);

    DialogSaveOrAccept();

    msg = `Maybe say something useful...`
    postResults(msg);
    log("--------------OnUse-----------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);

    //----------------------------------------------------------------------------------
    // 
    async function DialogSaveOrAccept() {
        log(SAVE_TYPE.toLowerCase())
        new Dialog({
            title: "Save or Accept Spell",
            content: `<div><h2>Dialog Header</h2>
            <div><p style="color:Green;">Does <b>${tToken.name}</b> want to attempt <b>DC${SAVE_DC}</b> 
            ${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} (${SAVE_TYPE}) save vs 
            ${aToken.name}'s ${aItem.name} spell/effect?</p><div>
            <div>${tToken.name} may attempt a save or simply accept the effect.<br><br></div>`,
            buttons: {
                save: {
                    label: "Attempt Save",
                    callback: (html) => {
                        PerformCallback(html, "Save")
                    }
                },
                accept: {
                    label: "Accept Effect",
                    callback: (html) => {
                        PerformCallback(html, "Accept")
                    }
                },
            },
            default: "abort",
        }).render(true);
    }

    //----------------------------------------------------------------------------------
    // 
    async function PerformCallback(html, mode) {
        log("PerformCallback() function executing.", "html", html, "mode", mode);

        if (mode === "Save") {
            postNewChatMessage(`${tToken.name}</b> wants to attempt <b>DC${SAVE_DC}</b> 
                ${SAVE_TYPE} <b>SAVE</b> vs ${aToken.name}'s <b>${aItem.name}</b> spell/effect`);
            return("Save")
        } else if (mode === "Accept") {
            postNewChatMessage(`${tToken.name}</b> wants to <b>ACCEPT</b> ${aToken.name}'s 
            <b>${aItem.name}</b> spell/effect`);
            return("Accept")
        } else {
            postNewChatMessage(`Oh fudge, how did this happen? ${mode}`);
            return("Fudge")    
        }
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
        log(`${actor.name} does not have ${itemName}, ${FUNCNAME} returning false`);
         return(false);
    }
    log(`${actor.name} has ${itemName}, ${FUNCNAME} returning true`);
    return(true);
}


/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function postNewChatMessage(msgString) {
    const FUNCNAME = "postChatMessage(msgString)";
    log(`--------------${FUNCNAME}-----------`, "Starting", `${MACRONAME} ${FUNCNAME}`,
        "msgString",msgString);
    await ChatMessage.create({ content: msgString });
    log(`--------------${FUNCNAME}-----------`, "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
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