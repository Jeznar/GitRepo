const MACRONAME = "Entangle.0.7.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Apply the Restrained effect with cub to the tokens that fail their saves. 
 *
 * 12/10/21 0.1 Creation of Macro
 * 01/01/22 0.2 Delayed further efforts...
 * 02/23/22 0.3 Partial rewrite to my current style
 * 02/24/22 0.4 Changes to enable a doEach checkng of saves on afflicted tokens
 * 07/09/22 0.5 Replace CUB add for an array of targets with jezcon.addConditions()
 * 07/09/22 0.6 Change the VFX to a placed tile
 * 12/16/22 0.7 Update style and seek player permission problem for extermination -- use modified CE to achieve this
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let chatMessage = game.messages.get(L_ARG.itemCardId);
const SAVE_DC = aActor.data.data.attributes.spelldc;
const CHK_TYPE = "str"
const EFFECT = "Restrained"
const TEMPLATE_ID = args[0].templateId
const TOKEN_NAME_NOWHITESPACE = aToken.name.replace(/\s+/g, '');
const VFX_NAME = `${MACRO}-${TOKEN_NAME_NOWHITESPACE}-${GAME_RND}`
const VFX_LOOP = "modules/jb2a_patreon/Library/1st_Level/Entangle/Entangle_01_Green_400x400.webm"
const VFX_OPACITY = 0.6;
const VFX_SCALE = 1.0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "each") doEach({ traceLvl: TL });					     // DAE everyround
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (args[0].failedSaves.length === 0)
        return jez.badNews(`No (${args[0].failedSaves.length}) targets are affected by ${EFFECT}`, 'i')
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // if (!await preCheck()) return(false);
    preCheck()
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let failures = [];
    let numFailed = args[0].failedSaves.length;
    msg = `${numFailed} targets are affected by ${EFFECT}<br><br>
        A creature restrained by the plants can use its action to make a Strength check against  your spell save DC ${SAVE_DC}. 
        On a success, it frees itself.`;
    if (TL > 1) jez.trace(`${TAG} msg`, args[0].failedSaves);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Launch the VFX that reprsents the grasping vines
    //
    let newTileId = await placeTileVFX({ traceLvl: TL });
    if (TL > 1) jez.trace(`${TAG} newTileId`, newTileId)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Lets modify a Convient Effect for "Restrained" effect, aka as EFFECT, to fit our current need.
    //
    // Retrieve as an object, the "Restrained" Convenient Effect for modification
    if (TL > 1) jez.trace(`${TAG} Starting code block to modify and apply ${EFFECT}`)
    let effectData = game.dfreds.effectInterface.findEffectByName(EFFECT).convertToObject();
    if (TL > 3) jez.trace(`${TAG} effectData obtained`, effectData)
    // Add the startEveryTurn
    effectData.flags.dae.macroRepeat = "startEveryTurn"
    // Change the convenient description to one specific to this spell
    const CE_DESC = `Something unique for this spell...`
    effectData.description = CE_DESC
    // Define the new effect line
    const VALUE = `entangle_helper2 ${EFFECT} ${CHK_TYPE} ${SAVE_DC} ${aToken.id}`
    effectData.changes.push(
        { key: `macro.execute`, mode: jez.CUSTOM, value: VALUE, priority: 20 },
        // { key: `macro.itemMacro`, mode: jez.CUSTOM, value: `'${aToken.name}' ${SAVE_DC}`, priority: 20 },
    )
    if (TL > 3) jez.trace(`${TAG} effectData changes`, effectData)
    await jez.wait(100);
    // Slap the updated CE onto each of our affected actors
    let failedTokenStr = "";
    if (TL > 1) jez.trace(`${TAG} Need to process ${L_ARG.failedSaveUuids.length} tokens`,L_ARG.failedSaveUuids)
    for (let i = 0; i < L_ARG.failedSaveUuids.length; i++) {
        if (failedTokenStr) failedTokenStr += ` ${L_ARG.failedSaves[i].id}`;
        else failedTokenStr = L_ARG.failedSaves[i].id;
        if (TL > 1) jez.trace(`${TAG} failedTokenStr`,failedTokenStr)
        if (TL > 1) jez.trace(`${TAG} Adding effect to ${L_ARG.failedSaves[i].name} ${L_ARG.failedSaveUuids[i]}`,
            'effectData',effectData,'L_ARG.failedSaveUuids[i].uuid',L_ARG.failedSaveUuids[i],'aItem.uuid',aItem.uuid)
        await game.dfreds.effectInterface.addEffectWith({ 
            effectData: effectData, 
            uuid: L_ARG.failedSaveUuids[i], 
            origin: aItem.uuid 
        });
    }
    if (TL > 1) jez.trace(`${TAG} failedTokenStr`,failedTokenStr)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Modify our concentrating effect
    //
    if (TL > 1) jez.trace(`${TAG} Mod Concentrating Effect`, 'aToken', aToken, 'newTileId', newTileId, 'failedTokenStr', failedTokenStr);
    let rc = modConcentratingEffect(aToken, newTileId, failedTokenStr, { traceLvl: TL });
    if (TL > 1) jez.trace(`${TAG} Mod Concentrating Effect returned`, rc);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Post results to the card
    //
    jez.addMessage(chatMessage, msg);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Modify existing effect to include a midi-qol overtime saving throw element
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
// COOL-THING: Modify existing concentrating effect to enable cleanup of dependent items
async function modConcentratingEffect(tToken, tileId, label, options = {}) {
    const FUNCNAME = "modConcentratingEffect(tToken, tileId, label, options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
        'tToken', tToken, 'tileId', tileId, 'label', label, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    const EFFECT = "Concentrating"
    //-------------------------------------------------------------------------------------------------------------------------------
    // Seach the token to find the just added effect
    //
    await jez.wait(100)
    let effect = await tToken.actor.effects.find(i => i.data.label === EFFECT);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect. In this case, a world macro that will be
    // given arguments: VFX_Name and Token.id for all affected tokens
    //    
    let value = `entangle_helper ${tileId} ${label}`
    effect.data.changes.push({ key: `macro.execute`, mode: jez.CUSTOM, value: value, priority: 20 })
    if (TL > 1) jez.trace(`${TAG} effect.data.changes`, effect.data.changes)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result) if (TL > 1) jez.trace(`${TAG} Active Effect ${EFFECT} updated!`, result);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Modify existing effect to include a midi-qol overtime saving throw element
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
// COOL-THING:  Adds a everyturn macro call to an existing effect
async function modExistingEffect(tToken, tEffect, options = {}) {
    const FUNCNAME = "modExistingEffect(tToken, tEffect, options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME}`, 'tToken', tToken, 'tEffect', tEffect, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Seach the token to find the just added effect
    //
    await jez.wait(100)
    let effect = await tToken.actor.effects.find(i => i.data.label === tEffect);
    if (TL > 1) jez.trace(`${TAG} 0 effect`, effect)
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect.
    //    https://gitlab.com/tposney/midi-qol#flagsmidi-qolovertime-overtime-effects
    // The following should be rollType=check per documentation, but this throws an error as of today
    // let oTV=`turn=end,label=${tEffect},saveDC=${SAVE_DC},saveAbility=${CHK_TYPE},saveRemove=true,rollType=save`
    // effect.data.changes.push({ key:`flags.midi-qol.OverTime`,mode:jez.OVERRIDE,value:oTV,priority: 20 })
    const VALUE = `entangle_helper2 ${EFFECT} ${CHK_TYPE} ${SAVE_DC} ${aToken.id}`
    await effect.data.changes.push({ key: `macro.execute`, mode: jez.CUSTOM, value: VALUE, priority: 20 })
    effect.data.flags.dae.macroRepeat = "startEveryTurn"
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes, 'flags': effect.data.flags });
    if (result) if (TL > 1) jez.trace(`${TAG} Active Effect ${tEffect} updated!`, result);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
* Pop a VFX Tile where the template was
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function placeTileVFX(options = {}) {
    const FUNCNAME = "placeTileVFX(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME}`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    if (TL > 2) jez.trace(`${TAG} TEMPLATE_ID`, TEMPLATE_ID)
    // Grab the size of grid in pixels per square
    const GRID_SIZE = canvas.scene.data.grid;
    // Search for the MeasuredTemplate that should have been created by the calling item
    let template = canvas.templates.objects.children.find(i => i.data._id === TEMPLATE_ID);
    // Delete the template to clean up the scene
    canvas.templates.get(TEMPLATE_ID).document.delete();
    // Place the tile with an embedded VFX
    let tileProps = {
        x: template.center.x,   // X coordinate is center of the template
        y: template.center.y,   // Y coordinate is center of the template
        img: VFX_LOOP,
        width: GRID_SIZE * 4,
        height: GRID_SIZE * 4,
        alpha: VFX_OPACITY                    // Opacity of the tile
    };
    return await jez.tileCreate(tileProps)
}