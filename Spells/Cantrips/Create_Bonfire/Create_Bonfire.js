const MACRONAME = "Create_Bonfire.0.1.js"
/*****************************************************************************************
 * Create Bonfire.
 * 
 *   Description: Create a bonfire on ground that you can see within range. Until the 
 *   spell ends, the magic bonfire fills a 5-foot cube. Any creature in the bonfire's 
 *   space when you cast the spell must succeed on a Dexterity save or take 1d8 fire 
 *   damage.
 * 
 *   A creature must also make the saving throw when it moves into the bonfire's space 
 *   for the first time on a turn or ends its turn there. 
 * 
 *   The bonfire ignites flammable objects in its area that aren't being worn or carried.
 * 
 *   The spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), 
 *   and 17th level (4d8).
 * 
 * 05/05/22 0.1 Creation of Macro
  *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`-------------------Starting ${MACRONAME}----------------------------------`)
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; 
    else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); 
    else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; 
    else aItem = lastArg.efData?.flags?.dae?.itemData;
let msg = "";
const BONFIRE_ORIG_NAME = "%Bonfire%"
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") doOnUse();          // Midi ItemMacro On Use
if (args[0] === "off") await doOff();             // DAE removal
//if (args[0] === "each") doEach();			      // DAE removal
jez.log(`-------------------Finishing ${MACRONAME}----------------------------------`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
     const FUNCNAME = "doOnUse()";
     const SQ_WID = game.scenes.viewed.data.grid;
     const SAVE_DC = aItem.data.save.dc;
     jez.log(`---------Starting ${MACRONAME} ${FUNCNAME}----------------------`)
     //-----------------------------------------------------------------------------------------
     // Get the TEMPLATE object and delete the template.
     //
     const templateID = args[0].templateId
     const TEMPLATE = canvas.templates.get(templateID).data
     canvas.templates.get(templateID).document.delete()
    //--------------------------------------------------------------------------------------
    // Grab our character level and figure out what the damage dice should be
    //
    let charLevel = jez.getCharLevel(aToken)
    let damageDice = "1d8"
    if (charLevel >= 5)  damageDice = "2d8"
    if (charLevel >= 11) damageDice = "3d8"
    if (charLevel >= 17) damageDice = "4d8"
    jez.log("Damage Dice", damageDice)
    //--------------------------------------------------------------------------------------
    // Spawn in the Bonfire, catch its token.id, exit on failure to spawn
    //
    const BONFIRE_ID = await spawnBonfire({x:TEMPLATE.x+SQ_WID/2,y:TEMPLATE.y+SQ_WID/2}, 
        `${aToken.name}'s Bonfire`,damageDice)
    if (!BONFIRE_ID) {
        msg = `Bonfire could not be spawned.   ${BONFIRE_ORIG_NAME} must be available in <b>Actors 
        Directory</b>.<br><br>
        Can not complete the ${aItem.name} action.`;
        postResults(msg);
        return (false);
    }
    //--------------------------------------------------------------------------------------
    // Modify the concentrating effect to delete the Bonfire on termination
    //
    modConcentratingEffect(aToken, BONFIRE_ID)
    //--------------------------------------------------------------------------------------
    // Modify the existing on the bonfire to do appropriate damage
    //
    await jez.wait(100)
    jez.log("BONFIRE_ID --->", BONFIRE_ID)
    let bonfireToken = canvas.tokens.placeables.find(ef => ef.id === BONFIRE_ID[0])
    jez.log("bonfire token", bonfireToken)
    modExistingEffect(bonfireToken, damageDice, SAVE_DC)
    //--------------------------------------------------------------------------------------
    // 
    //
    postResults(msg);
    jez.log("--------------OnUse-----------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}
/***************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************/
  async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
    //--------------------------------------------------------------------------------------
    // Delete the existing bonfire
    //
    let sceneId = game.scenes.viewed.id
    let bonfireId = args[1]
    warpgate.dismiss(bonfireId, sceneId)
    jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
/***************************************************************************************************
 * Post the results to chat card
 ***************************************************************************************************/
 function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, {color:jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Spawn the Bonfire into existance returning the UUID or null on failure
 ***************************************************************************************************/
async function spawnBonfire(center, newName, damageDice) {
    //--------------------------------------------------------------------------------------
    // Verify the Actor named BONFIRE_ORIG_NAME exists in Anctor Directory
    //
    if (!game.actors.getName(BONFIRE_ORIG_NAME)) {   // If bonfire not found, that's all folks
        msg = `Could not find "<b>${BONFIRE_ORIG_NAME}</b>" in the <b>Actors Directory</b>. 
        <br><br>Can not complete the ${aItem.name} action.`;
        postResults(msg);
        return (null);
    }
    //--------------------------------------------------------------------------------------
    // Define warpgate updates, options and callbacks 
    //
    let updates = {
        actor: {name: newName},    
        token: {name: newName},
        /*embedded: { // This didn't quite work for reasons unknown
            ActiveEffect: {
                "Bonfire Damage Aura": {
                    flags: {
                        ActiveAuras: {
                            aura: "All",
                            isAura: true,
                            onlyOnce: true,
                            radius: 2,
                        },
                    },
                    label: 'Bonfire Damage Aura',
                    icon: 'Icons_JGB/Misc/campfire.svg',
                    changes: [{
                        "key": "macro.tokenMagic",
                        "mode": jez.CUSTOM,
                        "value": "Fire v2 (sparks)",
                        "priority": 30
                    }, {
                        "key": "macro.execute",
                        "value": `Bonfire_Helper ${damageDice}`,
                        "mode": jez.CUSTOM,
                        "priority": 30
                    }],
                }
            }
        }*/
    }
    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
    const CALLBACKS = {
        pre: async (template) => {
            preEffects(template);
            await jez.wait(2000)
        },
        post: async (template) => {
            postEffects(template);
        }
    };
    //--------------------------------------------------------------------------------------
    // Fire off warpgate 
    //
    let bonfireId = await warpgate.spawnAt(center, BONFIRE_ORIG_NAME, updates, CALLBACKS, OPTIONS);
    jez.log("bonfireId", bonfireId)
    return(bonfireId)
}
/***************************************************************************************************
 * Pre-Spawn VFX
 ***************************************************************************************************/
async function preEffects(template) {
    jez.runRuneVFX(template, jez.getSpellSchool(aItem)) 
    return
}
/***************************************************************************************************
 * Post-Spawn VFX
 ***************************************************************************************************/
async function postEffects(template) { return }
/***************************************************************************************************
 * Line connecting token to bonfire VFX
 ***************************************************************************************************/
 async function chainEffect(token1, token2) {
    new Sequence()
        .effect()
        .file("jb2a.energy_beam.normal.blue.01")
        .atLocation(token1)
        .stretchTo(token2)
        .fadeIn(500)
        .fadeOut(500)
        .duration(2000)
        .scale(1.0)
        .opacity(1.0)
    .play()
}
/***************************************************************************************************
 * Modify existing concentration effect to call Remove_Effect_doOff on removal
 ***************************************************************************************************/
async function modConcentratingEffect(aToken, bonfireId) {
    // Modify concentrating to delete the bonfire on concentration drop
    //----------------------------------------------------------------------------------------------
    // Make sure the world macro that is used to remove effect exists
    //
    const REMOVE_MACRO = "IMSC_Create_Bonfire"
    const removeFunc = game.macros.getName(REMOVE_MACRO);
    if (!removeFunc) {
        ui.notifications.error(`Cannot locate ${REMOVE_MACRO} run as World Macro`);
        return;
    }
    //----------------------------------------------------------------------------------------------
    // Seach the casting token to find the just added concentration effect
    //
    await jez.wait(200)
    let effect = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to concentartion effect. In this case, a macro that will be
    // given argument: bonfireId
    //    
    effect.data.changes.push({key: `macro.execute`, mode: jez.CUSTOM, value:`${REMOVE_MACRO} ${bonfireId}`, priority: 20})
    jez.log(`effect.data.changes`, effect.data.changes)
    //----------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result) jez.log(`Active Effect "Concentrating" updated!`, result);
}
/***************************************************************************************************
 * Modify existing concentration effect to call Remove_Effect_doOff on removal
 ***************************************************************************************************/
 async function modExistingEffect(aToken, dDice, SAVE) {
    // Modify concentrating to delete the bonfire on concentration drop
    //----------------------------------------------------------------------------------------------
    // Make sure the world macro that is used to remove effect exists
    //
    const MAC_NAME = "Bonfire_Helper"
    const EXISTING_EFFECT = "Bonfire Damage Aura"
    //----------------------------------------------------------------------------------------------
    // Seach the casting token to find the just added concentration effect
    //
    await jez.wait(200)
    let effect = await aToken.actor.effects.find(i => i.data.label === EXISTING_EFFECT);
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to concentartion effect. In this case, a macro that will be
    // given argument: bonfireId
    //    
    effect.data.changes.push({key: `macro.execute`, mode: jez.CUSTOM, 
        value:`${MAC_NAME} ${dDice} ${SAVE}`, priority: 20})
    jez.log(`effect.data.changes`, effect.data.changes)
    //----------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result) jez.log(`Active Effect "${EXISTING_EFFECT}" updated!`, result);
}