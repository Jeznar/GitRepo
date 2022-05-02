const MACRONAME = "Moonbeam.0.9.js"
console.log(MACRONAME)
/*****************************************************************************************
 * Implements Moonbeam, based on a sample code.
 * 
 * 12/10/21 0.1 Creation of Macro
 * 12/10/21 0.2 Reformatting to make some sense of things
 * 12/10/21 0.4 Continuing after detour that was vesrion 0.3.  Going more manual and easier
 *              to implement.
 * 12/29/21 0.5 Add code to avoid having extra moonbeam attack abilities created
 * 12/29/21 0.6 Summon a MINION_NAME token in the template
 * 12/30/21 0.7 Add the VFX to token summoned
 * 12/31/21 0.8 Create preCheck function to put setup validation in one place 
 * 05/02/22 0.9 Updated for FoundryVTT 9.x
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
const ATTACK_ITEM = "Moonbeam Attack";
const MINION_NAME = "*Moonbeam*"
const MINION_UNIQUE_NAME = `Moonbeam-${aToken.name}`
const MACRO_HELPER = `${MACRO}_Helper_DAE`;
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_INTRO = "modules/jb2a_patreon/Library/2nd_Level/Moonbeam/MoonbeamIntro_01_Regular_Blue_400x400.webm"
const VFX_LOOP = "modules/jb2a_patreon/Library/2nd_Level/Moonbeam/Moonbeam_01_Regular_Blue_400x400.webm";
const VFX_OUTRO = "modules/jb2a_patreon/Library/2nd_Level/Moonbeam/MoonbeamOutro_01_Regular_Blue_400x400.webm";
const VFX_OPACITY = 0.7;
const VFX_SCALE = 0.6;   
const DeleteAsGM_MACRO = "DeleteTokenMacro";
const SummonAsGM_MACRO = "SummonCreatureMacro";
const VIEWED_SCENE = game.scenes.viewed;
const SQUARE_WIDTH = VIEWED_SCENE.data.grid;
const TEMPLATE_ID = args[0]?.templateId
log("------- Obtained Global Values -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem,
    "ATTACK_ITEM", ATTACK_ITEM,
    "MINION_UNIQUE_NAME", MINION_UNIQUE_NAME);
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
if (args[0] === "off") await doOff();         // DAE removal
if (args[0] === "on") await doOn();           // DAE Application
if (args[0].tag === "OnUse") await doOnUse(); // Midi ItemMacro On Use

msg = `<b>${aActor.name}</b> now has an ability named: <b>Moonbeam Attack</b> that can be used 
to inflict damage on creatures that start their turn in the beam or enter it.<br><br>
The owner can use their <b>Action</b> to move the tile respesenting the beam up to <b>60 feet</b>.
The tile and the Moonbeam Attack require manual cleanup after spell completion.`
postResults(msg);

log(`Ending ${MACRONAME} ================================================`);
return;



/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
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
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (typeof errorMsg === undefined) {
        let errorMsg = 'global variable "errorMsg" is not defined, but required'
        console.log(errorMsg)
        ui.notifications.error(errorMsg)
    }
    if (!game.modules.get("advanced-macros")?.active) {
        errorMsg = "Please enable the Advanced Macros module"
        return (false)
    }
    if (!runAsGM_Check(SummonAsGM_MACRO)) return (false);
    if (!runAsGM_Check(DeleteAsGM_MACRO)) return (false);
    if (!game.macros.getName(MACRO_HELPER)) {
        errorMsg = `Could not locate required macro: ${MACRO_HELPER}`
        return (false)
    }
    //----------------------------------------------------------------------------------
    // Make sure the GM_MACRO exists and is configured to run as GM
    //
    // 
    function runAsGM_Check(GM_MACRO) {
        const checkFunc = game.macros.getName(GM_MACRO);
        if (!checkFunc) {
            errorMsg = `Cannot locate ${GM_MACRO} run as GM Macro`;
            return (false);
        }
        if (!checkFunc.data.flags["advanced-macros"].runAsGM) {
            errorMsg = `${GM_MACRO} "Execute as GM" needs to be checked.`;
            return (false);
        }
        log(` Found ${GM_MACRO}, verified Execute as GM is checked`);
        return (true);
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
    await deleteItem(ATTACK_ITEM, aActor);
    let template = canvas.templates.placeables.find(i => i.data.flags.DAESRD?.Moonbeam?.ActorId === aActor.id)
    await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.id])
    await game.macros.getName(DeleteAsGM_MACRO).execute(MINION_NAME);
    log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
  }
  
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    log("Nothing to do");
    log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/***************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    log("--------------OnUse-----------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    await deleteItem(ATTACK_ITEM, aActor);

    let extraDice = 0;
    if (args[0].spellLevel > 2) extraDice = args[0].spellLevel - 2;
    const numDice = 2 + extraDice;
    let damageType = "radiant"; 

    let spellDC = aActor.data.data.attributes.spelldc
    log(` spellDC ${spellDC}`);
    log(` args[0].item.img ${args[0].item.img}`)
     //-------------------------------------------------------------------------------
     // Build the item data for the action to be creater
     //
    let itemData = [{
        "name": ATTACK_ITEM,
        "type": "spell",
        "data": {
            "source": "Casting Moonbeam",
            "ability": "",
            "description": {
                "value": "half damage on save"
            },
            "actionType": "save",
            "attackBonus": 0,
            "damage": {
                "parts": [
                    [
                        `${numDice}d10`,
                        `${damageType}`
                    ]
                ],
            },
            "formula": "",
            "save": {
                "ability": "con",
                "dc": spellDC,
                "scaling": "spell"
            },
            "level": 0,
            "school": "abj",
            "preparation": {
                "mode": "innate",
                "prepared": false
            },
        },
        "img": args[0].item.img,
        "effects": []

    }];
    await aActor.createEmbeddedDocuments("Item", itemData);
     //-------------------------------------------------------------------------------
     // Create an effect on the caster to trigger the doOn / doOff actions
     //
     let gameRound = game.combat ? game.combat.round : 0;
     let value= `${MACRO_HELPER} "${MINION_UNIQUE_NAME}" "${VFX_NAME}" 
                "${ATTACK_ITEM}" "${VFX_OUTRO}" ${VFX_OPACITY} ${VFX_SCALE}`;
   
     let effectData = {
         label: MACRO,
         icon: aItem.img,
         origin: aActor.uuid,
         flags: { dae: { itemData: aItem.data, macroRepeat: "startEveryTurn", token: aToken.uuid } },
         disabled: false,
         duration: { rounds: 10, turns: 10, startRound: gameRound, seconds: 60, startTime: game.time.worldTime },
         changes: [
             { key: "macro.execute", mode: CUSTOM, value: value, priority: 20 }
        ]
    };

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
    log(`applied ${MACRO} effect`, effectData);


    log("Extract information from template and then delete the template")
    log("TEMPLATE_ID", TEMPLATE_ID)
    log(`canvas.templates.get(TEMPLATE_ID)`, canvas.templates.get(TEMPLATE_ID))
    let x = canvas.templates.get(TEMPLATE_ID).data.x - SQUARE_WIDTH / 2;
    let y = canvas.templates.get(TEMPLATE_ID).data.y - SQUARE_WIDTH / 2;
    await canvas.templates.get(TEMPLATE_ID).document.delete()

    log(`OnUse ==> Summon the ${MINION_NAME} to act as a placeholder for the VFX at ${x},${y}`)
    await game.macros.getName(SummonAsGM_MACRO).execute(MINION_NAME, x, y);
    await wait(100);   // Wait a bit to allow the summoned token to be fully completed

    log(`OnUse ==> Obtain the token information from the just summoned ${MINION_NAME}`)
    let tToken = await findTokenByName(MINION_NAME)

    log(`OnUse ==> Change summoned ${MINION_NAME} to a more unique name, ${MINION_UNIQUE_NAME}`)
    let updates = { _id: tToken.id, name: MINION_UNIQUE_NAME };
    log(`OnUse ==> Target token information ${tToken.name}`, tToken, "updates to apply", updates);
    await tToken.document.update(updates);
    await wait(100);   // Wait a bit to allow the summoned token to be fully completed

    log(`OnUse ==> Start the VFX sequence on ${MINION_UNIQUE_NAME}`)
    await startVFX(MINION_UNIQUE_NAME);

    log("--------------OnUse---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/***************************************************************************************
 * Function to determine if passed actor has a specific item, returning a boolean result
 *
 * Parameters
 *  - itemName: A string naming the item to be found in actor's inventory
 *  - actor: Optional actor to be searched, defaults to actor launching this macro
 ***************************************************************************************/
async function hasItem(itemName, actor) {
    const FUNCNAME = "hasItem(itemName, actor)";
    log("-------------------------------", 
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "itemName", itemName,
        `actor ${actor?.name}`, actor);

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    let item = actor.items.find(item => item.data.name == itemName)
    if (item == null || item == undefined) {
        log(`${actor.name} does not have ${itemName}`);
        log(`${FUNCNAME} returning false`);
        return (false);
    }
    log(`${actor.name} does have ${itemName}`, item);
    log(`${FUNCNAME} returning true`);

    log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
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
        log(`${actor.name} does not have ${itemName}`);
        log(`${FUNCNAME} returning false`);
        return (false);
    }
    log(`${actor.name} had ${item.name}`, item);
    await aActor.deleteOwnedItem(item._id);
    log(`${FUNCNAME} returning true`);

    log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}

/***************************************************************************************************
 * Summon a token of minion on the template and delete the template
 ***************************************************************************************************/
async function executeSummonAtTemplate(minion) {
    const FUNCNAME = "executeSummon(minion)";
  
    //---------------------------------------------------------------------------------
    // Extract information from template and then delete it
    //
    let x = canvas.templates.get(TEMPLATE_ID).data.x - SQUARE_WIDTH/2;
    let y = canvas.templates.get(TEMPLATE_ID).data.y - SQUARE_WIDTH/2;
    await canvas.templates.get(TEMPLATE_ID).document.delete() 

    log("-----------------------------------", 
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "minion", minion,
        "coords (x,y)", `${x},${y}`,
        "SummonAsGM_MACRO", SummonAsGM_MACRO,
        "VIEWED_SCENE", VIEWED_SCENE, 
        "SQUARE_WIDTH", SQUARE_WIDTH);

    // Invoke the RunAsGM Macro to do the job
    // SummonFunc.execute(minion, x, y);
    game.macros.getName(SummonAsGM_MACRO).execute(minion, x, y);

    log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}

/***************************************************************************************************
 * Start the Visual Special Effects (VFX) on specified token
 ***************************************************************************************************/
async function startVFX(minion) {
    const FUNCNAME = "startVFX(minion)";
    log("-----------------------------------","Starting", `${MACRONAME} ${FUNCNAME}`,
        "minion", minion);

    //----------------------------------------------------------------------------------------------
    // Search for minion in the current scene 
    //
    let eToken = await findTokenByName(minion)
    if (!eToken) {
        log("Found only tears")
        ui.notifications.error(`${MACRO} failed, ${minion} not found.`);
        log("------------------------------ ", "Premature End", `${MACRONAME} ${FUNCNAME}`);
        return (false);
    } else log("eToken =====> ", eToken)

    new Sequence()
      .effect()
        .file(VFX_INTRO)
        .attachTo(eToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .waitUntilFinished(-500) // Negative wait time (ms) clips the effect to avoid fadeout
      .effect()
        .file(VFX_LOOP)
        .attachTo(eToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .persist()
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(300)            // Fade in for specified time in milliseconds
        .fadeOut(300)           // Fade out for specified time in milliseconds
        .extraEndDuration(800)  // Time padding on exit to connect to Outro effect
      .play()

    log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}

/***************************************************************************************************
 * Find an owned token by name on current scene.  Return the token or null if not found
 ***************************************************************************************************/
 async function findTokenByName(name) {
    const FUNCNAME = "findTokenByName(name)";
    log("-----------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "name", name)
    let targetToken = ""
    //----------------------------------------------------------------------------------------------
    // Loop through tokens on the canvas looking for the one we seek
    //
    let ownedTokens = canvas.tokens.ownedTokens
    for (let i = 0; i < ownedTokens.length; i++) {
        // log(`  ${i}) ${ownedTokens[i].name}`, ownedTokens[i]);
        if (name === ownedTokens[i].name) {
            // log("Eureka I found it!")
            targetToken = ownedTokens[i]
            break;
        }
    }
    if (targetToken) log(`${name}'s token has been found`, targetToken)
    else log(`${name}'s token was not found :-(`)
    log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (targetToken);
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
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }