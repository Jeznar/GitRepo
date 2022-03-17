const MACRONAME = "Flaming_Sphere.0.4.js"
jez.log(MACRONAME)
/*****************************************************************************************
 * Implements Flaming Sphere, based on Moonbeam.0.8 and its Helper_DAE script
 * 
 * 01/01/22 0.1 Creation of Macro
 * 03/16/22 0.2 Move into GitRepo chasing what appears to be permissions issue
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
 jez.log(`============== Starting === ${MACRONAME} =================`);
 for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
 const LAST_ARG = args[args.length - 1];
 let aActor;         // Acting actor, creature that invoked the macro
 let aToken;         // Acting token, token for creature that invoked the macro
 let aItem;          // Active Item information, item invoking this macro
 if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
 if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
 if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
 let msg = "";

const ATTACK_ITEM = "Flaming Sphere Attack";
const MINION_NAME = "*Flaming_Sphere*"
const MINION_UNIQUE_NAME = `${aToken.name}'s Sphere`
const MACRO_HELPER = `${MACRO}_Helper_DAE`;
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_LOOP = "modules/jb2a_patreon/Library/2nd_Level/Flaming_Sphere/FlamingSphere_02_Orange_200x200.webm";
const VFX_OPACITY = 0.7;
const VFX_SCALE = 0.6;   
const DeleteAsGM_MACRO = "DeleteTokenMacro";
const SummonAsGM_MACRO = "SummonCreatureMacro";
const VIEWED_SCENE = game.scenes.viewed;
const SQUARE_WIDTH = VIEWED_SCENE.data.grid;
const TEMPLATE_ID = args[0]?.templateId
let sphereID = null     // The token.id of the summoned fire sphere
let sphereToken = null  // Variable to hold the token5e for the Sphere
jez.log("------- Obtained Global Values -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem,
    "ATTACK_ITEM", ATTACK_ITEM,
    "MINION_UNIQUE_NAME", MINION_UNIQUE_NAME);

//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (!preCheck()) {
    jez.log(msg)
    ui.notifications.error(msg)
    return;
}
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0].tag === "OnUse") await doOnUse(); // Midi ItemMacro On Use

msg = `<b>${aActor.name}</b> now has an ability named: <b>Flaming Sphere Attack</b> that can be used 
to inflict damage on creatures that start their turn in the beam or enter it.<br><br>
The owner can use their <b>Action</b> to move the tile respesenting the beam up to <b>60 feet</b>.
The tile and the Flaming_Sphere Attack require manual cleanup after spell completion.`
postResults(msg);
jez.log(`Ending ${MACRONAME} ================================================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post the results to chat card
 ***************************************************************************************************/
 async function postResults(resultsString) {
    const LAST_ARG = args[args.length - 1];

    let chatMessage = game.messages.get(LAST_ARG.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    jez.log(`chatMessage: `,chatMessage);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}
/***************************************************************************************************
 * Check the setup of things.  Setting the global msg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (!game.modules.get("advanced-macros")?.active) {
        msg = "Please enable the Advanced Macros module"
        return (false)
    }
    if (!runAsGM_Check(SummonAsGM_MACRO)) return (false);
    if (!runAsGM_Check(DeleteAsGM_MACRO)) return (false);
    if (!game.macros.getName(MACRO_HELPER)) {
        msg = `Could not locate required macro: ${MACRO_HELPER}`
        return (false)
    }
    //----------------------------------------------------------------------------------
    // Make sure the GM_MACRO exists and is configured to run as GM
    //
    // 
    function runAsGM_Check(GM_MACRO) {
        const checkFunc = game.macros.getName(GM_MACRO);
        if (!checkFunc) {
            msg = `Cannot locate ${GM_MACRO} run as GM Macro`;
            return (false);
        }
        if (!checkFunc.data.flags["advanced-macros"].runAsGM) {
            msg = `${GM_MACRO} "Execute as GM" needs to be checked.`;
            return (false);
        }
        jez.log(` Found ${GM_MACRO}, verified Execute as GM is checked`);
        return (true);
    }
    jez.log('All looks good, to quote Jean-Luc, "MAKE IT SO!"')
    return (true)
}
/***************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log("--------------OnUse-----------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    await deleteItem(ATTACK_ITEM, aActor);
    const numDice = args[0].spellLevel;
    const damageType = "fire"; 
    let spellDC = aActor.data.data.attributes.spelldc
    jez.log(` spellDC ${spellDC}`);
    jez.log(` args[0].item.img ${args[0].item.img}`)
     //-------------------------------------------------------------------------------
     // Build the item data for the action to be creater
     //
     let value = 
      `Use this attack to attempt to damage any creature that ends its turn within 5 
      feet of the sphere. The creature takes ${numDice}d6 fire damage, 
      or half damage on save.
   
      If you ram the sphere into a creature, that creature is subject to an immediate 
      attack with this item and the sphere stops moving for this turn.`
    let itemData = [{
        "name": ATTACK_ITEM,
        "type": "spell",
        "data": {
            "source": "Casting Flaming Sphere",
            "ability": "",
            "description": {"value": value},
            "actionType": "save",
            "attackBonus": 0,
            "damage": {
                "parts": [
                    [
                        `${numDice}d6`,
                        `${damageType}`
                    ]
                ],
            },
            "formula": "",
            "save": {
                "ability": "dex",
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
     // Extract coordinates from the template and delete it
     //
     //jez.log("Extract information from template and then delete the template")
     //jez.log("TEMPLATE_ID", TEMPLATE_ID)
     //jez.log(`canvas.templates.get(TEMPLATE_ID)`, canvas.templates.get(TEMPLATE_ID))
     let x = canvas.templates.get(TEMPLATE_ID).data.x //- SQUARE_WIDTH / 2;
     let y = canvas.templates.get(TEMPLATE_ID).data.y //- SQUARE_WIDTH / 2;
     await canvas.templates.get(TEMPLATE_ID).document.delete()
     //-------------------------------------------------------------------------------
     // Summon the rolling ball o'fire, which includes setting the token.id of the 
     // summoned sphere into the global variable: sphereID
     //
     jez.log(`OnUse ==> Summon the ${MINION_NAME} at ${x},${y}`)
     jez.log(await summonCritter(x, y, MINION_NAME, 50))
     //await game.macros.getName(SummonAsGM_MACRO).execute(MINION_NAME, x, y); // Summon occurs here!  Gosh Durnit
     //await jez.wait(100);   // Wait a bit to allow the summoned token to be fully completed

     //jez.log(`OnUse ==> Obtain the token information from the just summoned ${MINION_NAME}`)
     //let tToken = await findTokenByName(MINION_NAME)

     jez.log(`OnUse ==> Start the VFX sequence on ${MINION_UNIQUE_NAME}`)
     await startVFX(MINION_UNIQUE_NAME);
     //-------------------------------------------------------------------------------
     // Create an effect on the caster to trigger the doOn / doOff actions
     //
     let gameRound = game.combat ? game.combat.round : 0;
     value = `${MACRO_HELPER} "${MINION_UNIQUE_NAME}" "${VFX_NAME}" 
             "${ATTACK_ITEM}" ${VFX_OPACITY} ${VFX_SCALE}`;
     let effectData = {
         label: MACRO,
         icon: aItem.img,
         origin: aActor.uuid,
         flags: { dae: { itemData: aItem.data, macroRepeat: "startEveryTurn", token: aToken.uuid } },
         disabled: false,
         duration: { rounds: 10, turns: 10, startRound: gameRound, seconds: 60, startTime: game.time.worldTime },
         changes: [
             { key: "macro.execute", mode: jez.CUSTOM, value: value, priority: 20 }
         ]
     };
     await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
     jez.log(`applied ${MACRO} effect`, effectData);

     jez.log("--------------OnUse---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
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
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;
    let item = actor.items.find(item => item.data.name === itemName && item.type === "spell")
    jez.log("*** Item to be deleted:", item);
    if (item == null || item == undefined) {
        jez.log(`${actor.name} does not have ${itemName}`);
        jez.log(`${FUNCNAME} returning false`);
        return (false);
    }
    jez.log(`${actor.name} had ${item.name}`, item);
    await aActor.deleteOwnedItem(item._id);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Summon a token of minion on the template and delete the template
 ***************************************************************************************************/
/*async function executeSummonAtTemplate(minion) {
    const FUNCNAME = "executeSummon(minion)";
  
    //---------------------------------------------------------------------------------
    // Extract information from template and then delete it
    //
    let x = canvas.templates.get(TEMPLATE_ID).data.x + SQUARE_WIDTH/2; // Because, reasons
    let y = canvas.templates.get(TEMPLATE_ID).data.y + SQUARE_WIDTH/2;
    await canvas.templates.get(TEMPLATE_ID).document.delete() 

    jez.log("-----------------------------------", 
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "minion", minion,
        "coords (x,y)", `${x},${y}`,
        "SummonAsGM_MACRO", SummonAsGM_MACRO,
        "VIEWED_SCENE", VIEWED_SCENE, 
        "SQUARE_WIDTH", SQUARE_WIDTH);

    // Invoke the RunAsGM Macro to do the job
    // SummonFunc.execute(minion, x, y);
    game.macros.getName(SummonAsGM_MACRO).execute(minion, x, y);

    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);

    return (true);
}
*/
/***************************************************************************************************
 * Start the Visual Special Effects (VFX) on specified token
 ***************************************************************************************************/
async function startVFX(minion) {
    const FUNCNAME = "startVFX(minion)";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} ----------------`);
    jez.log("==> minion", minion);
    //----------------------------------------------------------------------------------------------
    // Search for minion in the current scene 
    //
    /*
    let eToken = await findTokenByName(minion)
    if (!eToken) {
        jez.log("Found only tears")
        ui.notifications.error(`${MACRO} failed, ${minion} not found.`);
        jez.log("------------------------------ ", "Premature End", `${MACRONAME} ${FUNCNAME}`);
        return (false);
    } else jez.log("eToken =====> ", eToken)*/
    new Sequence()
      .effect()
        .file("jb2a.smoke.puff.centered.dark_black.2")
        .attachTo(sphereToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .persist()
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(300)            // Fade in for specified time in milliseconds
        .fadeOut(300)           // Fade out for specified time in milliseconds
        .extraEndDuration(800)  // Time padding on exit to connect to Outro effect
      .play()
      jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Find an owned token by name on current scene.  Return the token or null if not found
 ***************************************************************************************************/
 /*async function findTokenByName(name) {
    const FUNCNAME = "findTokenByName(name)";
    jez.log("-----------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "name", name)
    let targetToken = ""
    //----------------------------------------------------------------------------------------------
    // Loop through tokens on the canvas looking for the one we seek
    //
    let ownedTokens = canvas.tokens.ownedTokens
    for (let i = 0; i < ownedTokens.length; i++) {
        jez.log(`  ${i}) ${ownedTokens[i].name}`, ownedTokens[i]);
        if (name === ownedTokens[i].name) {
            // jez.log("Eureka I found it!")
            targetToken = ownedTokens[i]
            break;
        }
    }
    if (targetToken) jez.log(`${name}'s token has been found`, targetToken)
    else jez.log(`${name}'s token was not found :-(`)
    jez.log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (targetToken);
}*/
/***************************************************************************************************
 * Summon the minion and update HP
 * 
 * https://github.com/trioderegion/warpgate
 ***************************************************************************************************/
 async function summonCritter(x,y,summons,MAX_HP) {
    jez.log("function summonCritter(x,y,summons, number, updates)","x",x,"y",y,"summons",summons,"MAX_HP",MAX_HP);
    //let updates = { actor: { "data.attributes.hp": { value: MAX_HP, max: MAX_HP } } }

    //let name = `${summons}-${aToken.name}`
    let name = MINION_UNIQUE_NAME
    let updates = { token : {name: name} }

    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
    const CALLBACKS = {
      pre: async (template) => {
        preEffects(template);
        await warpgate.wait(500);
      },
      post: async (template, token) => {
        postEffects(template);
        await warpgate.wait(500);
      }
    };
    jez.log("About to call Warpgate.spawnAt")
    let returned = await warpgate.spawnAt({x:x,y:y},summons, updates, CALLBACKS, OPTIONS);
    jez.log("returned", returned)
    sphereID = returned[0] // The token ID of the summoned sphere
    jez.log("sphereID", sphereID)
    sphereToken = canvas.tokens.placeables.find(ef => ef.id === sphereID)
    jez.log("sphereToken", sphereToken)
  }
  /***************************************************************************************************
   * 
   ***************************************************************************************************/
   async function preEffects(template) {
    const VFX_FILE = "jb2a.explosion.orange.0"
    new Sequence()
      .effect()
      .file(VFX_FILE)
      .atLocation(template)
      .center()
      .opacity(0.8)
      .scale(0.5)
      .play()
  }
  /***************************************************************************************************
   * 
   ***************************************************************************************************/
   async function postEffects(template) {
    const VFX_OPACITY = 1.0
    const VFX_SCALE = 1.0
    const VFX_FILE = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Regular_Grey_400x400.webm"
    new Sequence()
      .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE/2)
        .opacity(VFX_OPACITY)
        .waitUntilFinished(-1000) 
    .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE*0.75)
        .opacity(VFX_OPACITY*0.75)
        .waitUntilFinished(-1000) 
    .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE*1.25)
        .opacity(VFX_OPACITY*0.5)
        .waitUntilFinished(-1000) 
    .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE*1.5)
        .opacity(VFX_OPACITY*0.25)
        .waitUntilFinished(-1000) 
    .play()
  }