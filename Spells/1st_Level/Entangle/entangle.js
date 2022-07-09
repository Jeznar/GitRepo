const MACRONAME = "Entangle.0.5.js"
/*****************************************************************************************
 * Apply the REstrained effect with cub to the tokens that fail their saves. 
 *
 * 12/10/21 0.1 Creation of Macro
 * 01/01/22 0.2 Delayed further efforts...
 * 02/23/22 0.3 Partial rewrite to my current style
 * 02/24/22 0.4 Changes to enable a doEach checkng of saves on afflicted tokens
 * 07/09/22 0.5 Replace CUB add for an array of targets with jezcon.addConditions()
 * 07/09/22 0.6 Change the VFX to a placed tile
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
let chatMessage = game.messages.get(LAST_ARG.itemCardId);
const SAVE_DC = aActor.data.data.attributes.spelldc;
const GAME_RND = game.combat ? game.combat.round : 0; 
const CHK_TYPE = "str"
let msg = "";
const TL = 4
const EFFECT = "Restrained"
const TEMPLATE_ID = args[0].templateId
const TOKEN_NAME_NOWHITESPACE = aToken.name.replace(/\s+/g, '');
const VFX_NAME = `${MACRO}-${TOKEN_NAME_NOWHITESPACE}-${GAME_RND}`
const VFX_LOOP = "modules/jb2a_patreon/Library/1st_Level/Entangle/Entangle_01_Green_400x400.webm"
const VFX_OPACITY = 0.7;
const VFX_SCALE = 1.0;
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && !preCheck()) return;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
    // ---------------------------------------------------------------------------------------
    // If no target failed a save, post result and terminate 
    //
    if (args[0].failedSaves.length === 0) {
        msg = `No (${args[0].failedSaves.length}) targets are affected by ${EFFECT}`
        jez.log(` ${msg}`, args[0].saves);
        //await postResults(msg);
        return(false);
    } else {
        msg = `Some (${args[0].failedSaves.length}) targets are affected by ${EFFECT}`
        jez.log(` ${msg}`, args[0].saves);
    }
    return (true)
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
async function doOnUse() {
    let failures = [];
    let numFailed = args[0].failedSaves.length;
    msg = `${numFailed} targets are affected by ${EFFECT}<br><br>
        A creature restrained by the plants can use its action to make a Strength check against 
        your spell save DC ${SAVE_DC}. On a success, it frees itself.`;
    jez.log(msg, args[0].failedSaves);
    // ---------------------------------------------------------------------------------------
    // Launch the VFX that reprsents the grasping vines
    //
    console.log("")
    console.log("")
    let newTileId = await placeTileVFX();
    console.log("")
    console.log("")
    // ---------------------------------------------------------------------------------------
    // Place the debuff on tokens that failed saving throws
    //
    jez.log(`failues array:`, failures);
    let options = {
        allowDups: true,
        replaceEx: false,
        traceLvl: 0
    } 
    await jezcon.addCondition(EFFECT, LAST_ARG.failedSaveUuids, options)
    // ---------------------------------------------------------------------------------------
    // Loop through those just debuffed and add a midi overtime element to each to roll saves.
    // Also build a string of comma delimited token.ids for later use.
    //
    let failedTokenStr = "";
    for (const element of args[0].failedSaves) {
        jez.log(element.name, element);
        modExistingEffect(element, EFFECT);
        if (failedTokenStr)
            failedTokenStr += ` ${element.id}`;
        else
            failedTokenStr = element.id;
    }
    modConcentratingEffect(aToken, newTileId, failedTokenStr);
    // ---------------------------------------------------------------------------------------
    // Post results to the card
    //
    jez.addMessage(chatMessage, msg);
}
/***************************************************************************************************
 * Modify existing effect to include a midi-qol overtime saving throw element
 ***************************************************************************************************/
// COOL-THING: Modify existing concentrating effect to enable cleanup of dependent items
 async function modConcentratingEffect(tToken, tileId, label) {
    const EFFECT = "Concentrating"
    //----------------------------------------------------------------------------------------------
    // Seach the token to find the just added effect
    //
    await jez.wait(100)
    let effect = await tToken.actor.effects.find(i => i.data.label === EFFECT);
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect. In this case, a world macro that will be
    // given arguments: VFX_Name and Token.id for all affected tokens
    //    
    let value = `entangle_helper ${tileId} ${label}`
    effect.data.changes.push({key: `macro.execute`, mode: jez.CUSTOM, value:value, priority: 20})
    jez.log(`effect.data.changes`, effect.data.changes)
    //----------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result) jez.log(`Active Effect ${EFFECT} updated!`, result);
}
/***************************************************************************************************
 * Modify existing effect to include a midi-qol overtime saving throw element
 ***************************************************************************************************/
// COOL-THING:  Adds a everyturn macro call to an existing effect
async function modExistingEffect(tToken, tEffect) {
    jez.log("tToken", tToken)
    jez.log("tToken.actor",tToken?.actor)
    jez.log("Need to update the effect to include a save overtime")
    //----------------------------------------------------------------------------------------------
    // Seach the token to find the just added effect
    //
    await jez.wait(100)
    let effect = await tToken.actor.effects.find(i => i.data.label === tEffect);
    jez.log("0 effect", effect)
    await jez.wait(100)
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect.
    //    https://gitlab.com/tposney/midi-qol#flagsmidi-qolovertime-overtime-effects
    // The following should be rollType=check per documentation, but this throws an error as of today
    // let oTV=`turn=end,label=${tEffect},saveDC=${SAVE_DC},saveAbility=${CHK_TYPE},saveRemove=true,rollType=save`
    // effect.data.changes.push({ key:`flags.midi-qol.OverTime`,mode:jez.OVERRIDE,value:oTV,priority: 20 })
    await effect.data.changes.push({key:`macro.execute`,mode:jez.CUSTOM,value:`entangle_helper2 ${EFFECT} ${CHK_TYPE} ${SAVE_DC} ${aToken.id}`, priority: 20})
    effect.data.flags.dae.macroRepeat = "startEveryTurn"
    //----------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes, 'flags': effect.data.flags });
    if (result) jez.log(`Active Effect ${tEffect} updated!`, result);
}
/***************************************************************************************************
 * Launch the VFX and remove the template from the scene
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Effects
 ***************************************************************************************************/
//  async function runVFX() {
//     jez.log("Launch VFX")
//     const FUNCNAME = "runVFX()";
//     jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
//     const TEMPLATE_ID = args[0].templateId
//     jez.log('TEMPLATE_ID', TEMPLATE_ID)
//     new Sequence()
//     .effect()
//         .file(VFX_LOOP)
//         .atLocation(TEMPLATE_ID) // Effect will appear at  template, center
//         .scale(VFX_SCALE)
//         .scaleIn(0.1, 1500)    // Expand from 0.25 to 1 size over 1 second
//         .rotateIn(180, 1000)    // 1/2 Rotation over 1 second 
//         .scaleOut(0.1, 1500)   // Contract from 1 to 0.25 size over 1 second
//         .rotateOut(180, 1000)   // 1/2 Counter Rotation over 1 second
//         .opacity(VFX_OPACITY)
//         .belowTokens()
//         .persist()
//         //.duration(6000)
//         .name(VFX_NAME)         // Give the effect a uniqueish name
//         .fadeIn(1500)             // Fade in for specified time in milliseconds
//         .fadeOut(1500)          // Fade out for specified time in milliseconds
//         //.extraEndDuration(1200) // Time padding on exit to connect to Outro effect
//     .play();
//     await jez.wait(100)         // Don't delete till VFX established
//     canvas.templates.get(TEMPLATE_ID).document.delete()
//  }
 /***************************************************************************************************
 * Pop a VFX Tile where the template was
 ***************************************************************************************************/
  async function placeTileVFX() {
    const FUNCNAME = "placeTileVFX()";
    const FNAME = FUNCNAME.split("(")[0] 
    if (TL>1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    if (TL>2) jez.trace(`${FNAME} |TEMPLATE_ID`,TEMPLATE_ID)
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