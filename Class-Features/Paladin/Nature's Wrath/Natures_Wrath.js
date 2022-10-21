const MACRONAME = "Natures_Wrath_0.4"
/*******************************************************************************************
 * Implement Nature's Wrath
 * 
 * Description: You can use your Channel Divinity to invoke primeval forces to ensnare a foe.
 *   As an action, you can cause spectral vines to spring up and reach for a creature within 
 *   10 feet of you that you can see. The creature must succeed on a Strength or Dexterity 
 *   saving throw (its choice) or be restrained. While restrained by the vines, the creature 
 *   repeats the saving throw at the end of each of its turns. On a success, it frees itself 
 *   and the vines vanish.
 * 
 * This will need an OnUse and a Each execution.
 * 
 * 12/21/21 0.1 JGB Creation
 * 12/24/21 0.2 JGB Incorporate ideas from times_up_sample#1.0.1 and making this a DAE thing
 * 12/26/21 0.3 JGB Seemingly working version
 * 10/21/22 0.4 JGB FoundryVTT 9 fix: Swap deleteEmbeddedEntity for deleteEmbeddedDocuments
 *******************************************************************************************/
const DEBUG = false;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME} or ${MACRO}`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

let gameRound = game.combat ? game.combat.round : 0;

//---------------------------------------------------------------------------------------
// Set some global variables and constants
//
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

//---------------------------------------------------------------------------------------
// Set some additional derived global constants
//
const DEBUFF_NAME = "Restrained by Nature's Wrath" // aItem.name || "Nature's Wraith";
const DEBUFF_ICON = "modules/combat-utility-belt/icons/restrained.svg"
                    // aItem.img || "icons/magic/nature/root-vine-entangled-humanoid.webp";

//-------------------------------------------------------------------------------
// Depending on where invoked call appropriate function to do the work
//
if (args[0]?.tag === "OnUse") doOnUse();   			    // Midi ItemMacro On Use
if (args[0] === "on") doOn();          		        // DAE Application
if (args[0] === "off") doOff();        			    // DAE removal
if (args[0] === "each") doEach();					    // DAE removal
//if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus

log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
return;
 /***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/
 /**************************************************************************************
 * Execute code for a ItemMacro onUse
 ***************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    log("---------------------------------------------------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        `Active Item (aItem) ${aItem.name}`, aItem);

    //---------------------------------------------------------------------------------------
    // Make sure exactly one token was targeted
    //
    if (!oneTarget()) {
        await postResults(msg);
        log("msg",msg);
        log(`Ending ${MACRONAME} ${FUNCNAME}`);
        await wait(2000);
        return;
    }

    //---------------------------------------------------------------------------------------
    // Set Variables for the target
    //
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id);    // Targeted Token
    let tActor = tToken?.document?._actor;                      // Targeted Actor
    log("----- Obtained Values -------",
        `Targeted token ${tToken?.data?.name}`, tToken,
        `Targeted actor ${tActor?.name}`, tActor);

    //---------------------------------------------------------------------------------------
    // Obtain some useful info from environment
    //
    let saveDC = aActor.data.data.attributes.spelldc;
    let tarDexSaveMod = tToken.document._actor.data.data.abilities.dex.save;
    let tarStrSaveMod = tToken.document._actor.data.data.abilities.str.save;
    log("*** Obtained values ***",
        "saveDC", saveDC,
        "tarDexSaveMod", tarDexSaveMod,
        "tarStrSaveMod", tarStrSaveMod);

   
    //---------------------------------------------------------------------------------------
    // Thats all folks
    //
    postResults(msg);
    log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Each turn Execution - Each time on the target's turn per DAE setting
 ***************************************************************************************/
 async function doEach() {
    const FUNCNAME = "doEach()";
    log("--------------Each--------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    //---------------------------------------------------------------------------------------
    // Obtain Save Info
    //
    let { saveType, saveDC } = getSaveInfo(aToken);
    const flavor = `${CONFIG.DND5E.abilities[saveType]} <b>DC${saveDC}</b> to remove <b>${DEBUFF_NAME}</b> effect`;
    log("---- Save Information ---","saveType",saveType,"saveDC",saveDC,"flavor",flavor);

    let save = (await aActor.rollAbilitySave(saveType, { flavor, chatMessage: true, fastforward: true })).total;
    log("save",save);
    if (save > saveDC) {
        log(`save was made with a ${save}`);
        // if (aActor) aActor.deleteEmbeddedEntity("ActiveEffect", lastArg.effectId); // Obsolete at FVTT 9.x
        if (aActor) aActor.deleteEmbeddedDocuments("ActiveEffect", [lastArg.effectId]);
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

    // Get Actor by ID: let actor = game.actors.get("0HcZSUIUZ48WAPyv")
    // Get Item by ID:  let item = game.items.get("0HcZSUIUZ48WAPyv")

    //---------------------------------------------------------------------------------------
    // Set Variables for the target
    //
    //let tToken = canvas.tokens.get(args[0]?.targets[0]?.id);    // Targeted Token
    let tToken = canvas.tokens.get(lastArg.tokenId);
    // let tActor = game.actors.get(lastArg.actorId);             
    let tActor = canvas.tokens.get(lastArg.tokenId).actor;        // Targeted Actor
    log("----- Obtained Values -------",
        `Targeted token ${tToken.name}`, tToken,
        `Targeted actor ${tActor?.name}`,tActor);

    //---------------------------------------------------------------------------------------
    // Obtain Save Info
    //
    let { saveType, saveDC } = getSaveInfo(tToken);

    //---------------------------------------------------------------------------------------
    // Roll the saving throw
    //
    const flavor = `${CONFIG.DND5E.abilities[saveType]} <b>DC${saveDC}</b> to avoid <b>${DEBUFF_NAME}</b> effect`;
    let save = await tToken.actor.rollAbilitySave(saveType, {
        chatMessage: true,
        fastForward: true,
        flavor: `${CONFIG.DND5E.abilities[saveType]} <b>DC${saveDC}</b> to avoid <b>${DEBUFF_NAME}</b> effect`
    });
    log('Result of save', save);

    //---------------------------------------------------------------------------------------
    // If the target failed save then apply effect that will trigger an every turn save
    //
    if (save.total >= saveDC) {
        msg = `${tToken.name} made its save.  Rolling ${save.total} vs ${saveDC} DC.`;
        log(msg)
        await wait(500)   // This pause allows the debuff to be placed by DAE before removal
        //----------------------------------------------------------------------------------
        // Check for debuff matching DEBUFF_NAME.  If it exists, remove it.
        //
        log(" tToken.data.effects",  tToken.data.actorData.effects)
        let existingEffect = tActor.effects.find(ef => ef.data.label === DEBUFF_NAME) ?? null; 
         
        if (existingEffect) {
            msg = `${tToken.name} has ${DEBUFF_NAME} effect: `;
            log(msg, existingEffect);
            await existingEffect.delete();
        } else {
            msg = `${tToken.name} lacked ${DEBUFF_NAME} effect.`;
            log(msg);
        }
    }
    else {
        msg = `${tToken.name} failed its save.  Rolling ${save.total} vs ${saveDC} DC.`;
        log(msg);
    }

    log("--------------On----------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Fetch and return the save type and target number
 ***************************************************************************************/
function getSaveInfo(tToken) {
    let saveDC = args[1];
    let tarDexSaveMod = tToken.document._actor.data.data.abilities.dex.save;
    let tarStrSaveMod = tToken.document._actor.data.data.abilities.str.save;

    //---------------------------------------------------------------------------------------
    // Determine target's prefered stat for the save, and make save roll
    //
    let saveType = "";
    if (tarDexSaveMod > tarStrSaveMod) {
        log(`saveDC ${saveDC} - ${tToken.name} prefers Dex save, with a ${tarDexSaveMod} mod vs ${tarStrSaveMod}`);
        saveType = "dex";
    } else {
        log(`saveDC ${saveDC} - ${tToken.name} prefers Str save, with a ${tarStrSaveMod} mod vs ${tarDexSaveMod}`);
        saveType = "str";
    }
    return { saveType, saveDC };
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

/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        msg = `Targeted nothing, must target single token to be acted upon`;
        ui.notifications.warn(msg);
        log(msg);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        msg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        ui.notifications.warn(msg);
        log(msg);
        return (false);
    }
    log(` targeting one target`);
    return (true);
}

/***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsString) {
    const FUNCNAME = "postResults(resultsString)";
    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
    log(`Starting ${MACRONAME} ${FUNCNAME}`,`resultsString`, resultsString);

    // let chatmsg = await game.messages.get(itemCard.id)
    let chatmsg = game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatmsg.data.content);
    log(` chatmsg: `, chatmsg);
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    // log("============================ content before", content)
    content = await content.replace(searchString, replaceString);
    // log("============================ content after", content)
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();

    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
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
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    }
}

/****************************************************************************************
 * Tricksy little sleep implementation
 ***************************************************************************************/
 async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }