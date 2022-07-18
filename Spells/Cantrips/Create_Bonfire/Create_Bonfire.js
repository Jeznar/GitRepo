const MACRONAME = "Create_Bonfire.0.3.js"
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
 * 07/15/22 0.2 Convert to use jez.warpCrosshairs
 * 07/17/22 0.3 Update to use jez.spawnAt (v2) for summoning
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
const TL = 0;
const MINION = "Bonfire"
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") doOnUse();          // Midi ItemMacro On Use
if (args[0] === "off") await doOff();             // DAE removal
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
     const SAVE_DC = aItem.data.save.dc;
     jez.log(`---------Starting ${MACRONAME} ${FUNCNAME}----------------------`)
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
    const BONFIRE_ID = await spawnBonfire(`${aToken.name}'s Bonfire`,damageDice)
    if (!BONFIRE_ID) {
        msg = `Bonfire could not be spawned.   %${MINION}% must be available in <b>Actors 
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
    let bonfireToken = canvas.tokens.placeables.find(ef => ef.id === BONFIRE_ID[0])
    modExistingEffect(bonfireToken, damageDice, SAVE_DC)
    //--------------------------------------------------------------------------------------
    // 
    //
    msg = `Any creature in the bonfire's space when it appears must succeed on a ${SAVE_DC}DC 
    DEX save or take ${damageDice} fire damage. A creature must also make a save when 
    it moves into the bonfire for the first time on a turn or ends its turn there.`
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
    jez.addMessage(chatMsg, {color:"FireBrick", fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Spawn the Bonfire into existance returning the UUID or null on failure
 **************************************************************************************************/
async function spawnBonfire(newName) {
    if (TL > 1) jez.trace("spawnBonfire(newName)", "newName",newName);
    jez.runRuneVFX(aToken, jez.getSpellSchool(aItem)) 
    //--------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        defaultRange: 30,                   // Defaults to 30, but this varies per spell
        duration: 1000,                     // Duration of the intro VFX
        img: aItem.img,                     // Image to use on the summon location cursor
        introTime: 1000,                     // Amount of time to wait for Intro VFX
        introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        scale: 0.5,								// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        width: 1,                           // Width of token to be summoned, 1 is the default
        traceLvl: TL                        // Trace level, matching calling function decent choice
    }
    let bonfireId = await jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
    //--------------------------------------------------------------------------------------
    //
    jez.log("bonfireId", bonfireId)
    return (bonfireId)
}
/***************************************************************************************************
 * Modify existing concentration effect to call Remove_Effect_doOff on removal
 ***************************************************************************************************/
async function modConcentratingEffect(aToken, bonfireId) {
    // Modify concentrating to delete the bonfire on concentration drop
    //----------------------------------------------------------------------------------------------
    // Seach the casting token to find the just added concentration effect
    //
    await jez.wait(200)
    let effect = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to concentration effect. In this case, a macro that will be
    // given argument: bonfireId
    //    
    effect.data.changes.push({key:`macro.itemMacro`,mode:jez.CUSTOM,value:bonfireId,priority:20})
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