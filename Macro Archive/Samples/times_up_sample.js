const MACRONAME = "times_up_sample#1.0.1"
/*******************************************************************************************
 * Tim Posney's times-up example Macro #1 from his Github doumentation:
 *  https://gitlab.com/tposney/times-up
 * 
 * "Here is a sample macro that rolls a save each turn until the save is made and then the 
 *  whole active effect is deleted. The save is the item save DC, the type is the item save 
 *  type and the damage is taken from the "Other" formula. So if the items are configured in 
 *  that way the same macro can be used for any "if failed save take damage until save" 
 *  effects.
 * 
 *  Consider an effect that applies the condition frightened until a save occurs. Create 
 *  an effect with whatever changes you want and add the extra macro.execute "Until Save" 
 *  to the Active Effect."
 * 
 * Two versions one that fetches damage/save/dc from item and one that use args like 
 * macro.execute CUSTOM "Until Save" cha 15 
 * Get some useful info.
 * 
 * This will need an OnUse and a Each execution.
 * 
 * 12/22/21 0.1 JGB Loading into my form, breaking out functions and adding comments
 *******************************************************************************************/
let DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME} or ${MACRO}`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

//---------------------------------------------------------------------------------------
// Set some global variables and constants
//
const DEBUFF_NAME = "Until Save";
const DEBUFF_ICON = "Icons_JGB/Misc/curse.png";
let msg = "";
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro

//---------------------------------------------------------------------------------------
// Define some additional handy global variables that I need often.  Not all will be used
// in this macro, but I want them here for future use/reference.
//
// See https://gitlab.com/tposney/dae#lastarg for info on what is included in lastArg
//
const lastArg = args[args.length - 1];
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;

log("------- Obtained Global Values -------",
    `Active Token (aToken) ${aToken.name}`, aToken,
    `Active Actor (aActor) ${aActor.name}`, aActor,
    `Active Item (aItem) ${aItem.name}`, aItem);

if (args[0]?.tag === "OnUse") await doOnUse();   	    // Midi ItemMacro On Use
if (args[0] === "on") doOn();          		    	    // DAE Application
if (args[0] === "off") doOff();        			        // DAE removal
if (args[0] === "each") doEach();					    // DAE each turn

await wait(1000)
log("---------------------------------------------------------------------------",
    "Finished", MACRO);
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/***************************************************************************************
 * OnUse Execution -- Execute code for a ItemMacro onUse
 ***************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    log("---------------On Use-----------------", "Starting", `${MACRONAME} ${FUNCNAME}`,
        `Active Item (aItem) ${aItem.name}`, aItem);

    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id);    // Targeted Token
    let tActor = tToken?.document?._actor;                      // Targeted Actor
    log("----- Obtained Values -------",
        `Targeted token ${tToken?.data?.name}`, tToken,
        `Targeted actor ${tActor?.name}`, tActor);

    //---------------------------------------------------------------------------------------
    // Make sure exactly one token was targeted
    //
    if (!oneTarget()) {
        log(` exception on number of targets selected: ${msg}`);
        await postResults(msg);
        log(`Ending ${MACRONAME} ${FUNCNAME}`);
        return;
    }
    //---------------------------------------------------------------------------------------
    // Make sure target failed its saving throw
    //
    if (failedCount() === 1) {
        log(`Target failed save, continue`);
    } else {
        log(`Target passed save, exit`);
        await postResults("Target made its saving thow");
        log(`Ending ${MACRONAME} ${FUNCNAME}`);
        return;
    }
    //---------------------------------------------------------------------------------------
    // Apply effect(s)....
    //
    log("aActor.uuid",aActor.uuid,"aItem.uuid",aItem.uuid)
    let gameRound = game.combat ? game.combat.round : 0;
    let effectData = {
        label: DEBUFF_NAME,
        icon: DEBUFF_ICON,
        //origin: aActor.uuid,
        origin: aItem._id,
        disabled: false,
        duration: { rounds: 10, startRound: gameRound },
        changes: [
            { key: `macro.itemMacro`, mode: CUSTOM, value: "@token", priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:tActor.uuid, effects: [effectData] });
    log("---------------On Use-----------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Each turn Execution - Each time on the target's turn per DAE setting
 ***************************************************************************************/
async function doEach() {
    const FUNCNAME = "doEach()";
    log("--------------Each--------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    const saveType = aItem.data.save.ability;
    // const saveType = args[1]; 
    const DC = aItem.data.save.dc;
    // const DC = parseInt(args[2]);
    const flavor = `${CONFIG.DND5E.abilities[saveType]} DC${DC} ${aItem?.name || ""}`;
    let save = (await aActor.rollAbilitySave(saveType, { flavor, chatMessage: true, fastforward: true })).total;
    if (save > DC) {
        log(`save was made with a ${save}`);
        if (aActor) aActor.deleteEmbeddedEntity("ActiveEffect", lastArg.effectId);
        // remove the effect, this macro will be called again with "off" when the effect has been deleted.
    } else log(`save failed with a ${save}`);

    log("--------------Each-------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Execute code for a DAE Macro application (on) - nothing other than place holding
 ***************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    log("--------------On----------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    
    // Do any setup/first application as required.
    log("--------------On----------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Execute code for a DAE Macro application (on) - nothing other than place holding
 ***************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);
    // do any clean up
    log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/***************************************************************************************
* Verify exactly one target selected, boolean return
 ***************************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        let message = `Targeted nothing, must target single token to be acted upon`;
        ui.notifications.warn(message);
        log(message);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        let message = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        ui.notifications.warn(message);
        log(message);
        return (false);
    }
    // log(`targeting one target`);
    return (true);
}

/***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
async function postResults(resultsString) {
    const FUNCNAME = "postResults(resultsString)";
    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
    log(`Starting ${MACRONAME} ${FUNCNAME}`,
        `resultsString`, resultsString);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    // let chatmsg = await game.messages.get(itemCard.id)
    let chatmsg = game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatmsg.data.content);
    log(`chatmsg: `, chatmsg);
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();

    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Return the number of tokens that failed their saving throw
 ***************************************************************************************/
 function failedCount() {
    let failCount = args[0].failedSaves.length
    log(`${failCount} args[0].failedSaves: `, args[0].failedSaves)
    return (failCount);
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

/****************************************************************************************
 * Tricksy little sleep implementation
 ***************************************************************************************/
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }