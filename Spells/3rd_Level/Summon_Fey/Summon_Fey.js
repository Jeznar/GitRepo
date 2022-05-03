const MACRONAME = "Summon_Fey.0.1"
console.log(MACRONAME)
/*****************************************************************************************
 * Clean up tokens that may or may not have been summened to the scene
 * 
 * 01/14/22 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
log("")
log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";
const RUNASGMMACRO = "DeleteTokenMacro";
const viewedScene = game.scenes.viewed;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal


log(`============== Finishing === ${MACRONAME} =================`);
log("")
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);

    //----------------------------------------------------------------------------------------------
    // Make sure the RUNASGMMACRO exists and is configured correctly
    //
    const DeleteFunc = game.macros.getName(RUNASGMMACRO);
    if (!DeleteFunc) {
        ui.notifications.error(`Cannot locate ${RUNASGMMACRO} run as GM Macro`);
        return;
    }
    if (!DeleteFunc.data.flags["advanced-macros"].runAsGM) {
        ui.notifications.error(`${RUNASGMMACRO} "Execute as GM" needs to be checked.`);
        return;
    }
    log(` Found ${RUNASGMMACRO}, verified Execute as GM is checked`);

    let trash = [`${aToken.name}'s Fuming Fey`, 
                 `${aToken.name}'s Mirthful Fey`, 
                 `${aToken.name}'s Tricksy Fey`, 
                 `${aToken.name}'s Tricksy Fey's Darkness`]
    log("trash", trash)
    //----------------------------------------------------------------------------------------------
    // Search for MINION in the current scene 
    //
    for (let critter of viewedScene.data.tokens) {
        // log("critter.data.name", critter.data.name);
        if (trash.includes(critter.data.name)) {
            log(`Deleting ${critter.data.name}`)
            DeleteFunc.execute(critter);
        }
    }
    log("Hopefully good things happened.")
    log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
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
    //const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    //const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
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