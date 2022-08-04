const MACRONAME = "Flaming_Sphere.0.8.js"
/*****************************************************************************************
 * Implements Flaming Sphere, based on Moonbeam.0.8 and its Helper_DAE script
 * 
 * 01/01/22 0.1 Creation of Macro
 * 03/16/22 0.2 Move into GitRepo chasing what appears to be permissions issue
 * 05/16/22 0.5 Update for FoundryVTT 9.x
 * 07/15/22 0.6 Update to use warpgate.spawnAt with range limitation
 * 07/17/22 0.7 Update to use jez.spawnAt (v2) for summoning
 * 08/02/22 0.8 Add convenientDescription
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
 const TL = 0;

const ATTACK_ITEM = "Flaming Sphere Attack";
const MINION = "Flaming_Sphere"
const EFFECT = "Flaming Sphere"
const MINION_UNIQUE_NAME = `${aToken.name}'s Sphere`
const MACRO_HELPER = `${MACRO}_Helper_DAE`;
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_OPACITY = 0.7;
const VFX_SCALE = 0.6;   
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
    // if (!runAsGM_Check(SummonAsGM_MACRO)) return (false);
    // if (!runAsGM_Check(DeleteAsGM_MACRO)) return (false);
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
    //await deleteItem(ATTACK_ITEM, aActor);
    await jez.deleteItems(ATTACK_ITEM, "spell", aActor);
    const numDice = args[0].spellLevel;
    const damageType = "fire"; 
    let spellDC = aActor.data.data.attributes.spelldc
    jez.log(` spellDC ${spellDC}`);
    jez.log(` args[0].item.img ${args[0].item.img}`)
     //-------------------------------------------------------------------------------
     // Build the item data for the action to be created
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
     await summonCritter(MINION)
     jez.log(`OnUse ==> Start the VFX sequence on ${MINION_UNIQUE_NAME}`)
     await startVFX();
     //-------------------------------------------------------------------------------
     // Create an effect on the caster to trigger the doOn / doOff actions
     //
     let gameRound = game.combat ? game.combat.round : 0;
     value = `${MACRO_HELPER} "${MINION_UNIQUE_NAME}" "${VFX_NAME}" 
             "${ATTACK_ITEM}" ${VFX_OPACITY} ${VFX_SCALE}`;
     const CE_DESC = `Maintaining Flaming Sphere, Bonus action to move it each round.`
     let effectData = {
         label: EFFECT,
         icon: aItem.img,
         origin: aActor.uuid,
         flags: {
             dae: { itemData: aItem.data, macroRepeat: "startEveryTurn", token: aToken.uuid },
             convenientDescription: CE_DESC
         },
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
/***************************************************************************************************
 * Start the Visual Special Effects (VFX) on specified token
 ***************************************************************************************************/
async function startVFX() {
    const FUNCNAME = "startVFX()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} ----------------`);
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
 * Summon the minion
 * 
 * https://github.com/trioderegion/warpgate
 ***************************************************************************************************/
async function summonCritter(MINION) {
    jez.log("function summonCritter(MINION)", "MINION", MINION);
    //--------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        defaultRange: 60,                   // Defaults to 30, but this varies per spell
        duration: 1000,                     // Duration of the intro VFX
        introTime: 1000,                     // Amount of time to wait for Intro VFX
        introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
        minionName: `${aToken.name}'s ${MINION}`,
        minionName: MINION_UNIQUE_NAME,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        scale: 0.7,								// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        width: 1,                           // Width of token to be summoned, 1 is the default
        traceLvl: TL                        // Trace level, matching calling function decent choice
    }
    //--------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    let summonData = await game.actors.getName(MINION)
    argObj.img = summonData ? summonData.img : aItem.img
    //--------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    let returned = await jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
    //--------------------------------------------------------------------------------------------------
    // Fnish up
    //
    // sphereID = returned[0] // The token ID of the summoned sphere
    sphereToken = canvas.tokens.placeables.find(ef => ef.id === returned[0])
}