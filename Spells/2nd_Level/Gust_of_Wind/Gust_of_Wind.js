const MACRONAME = "Gust_of_Wind.0.1.js"
/*****************************************************************************************
 * Tasks for this macro
 *  1. Place a tile containing a VFX to mark the difficult terrain
 *  2. Spit out a message to chat describing the effect
 *  3. Remove the tile at the end of this actor's next turn
 * 
 * 05/31/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    if (args[1] === "Tile") {
        const TILE_ID = args[2]
        jez.log(`Delete the VFX tile`, TILE_ID)
        await canvas.scene.deleteEmbeddedDocuments("Tile", [TILE_ID])
        jez.log(`Deleted Tile ${TILE_ID}`)
    } 
    else if (args[1] === "Effect") {
        let existingEffect = await tToken.actor.effects.find(i => i.data.label === EFFECT);
        await existingEffect.delete()
    } else {
        msg = `Some bad logic happened in ${MACRO}. Args[1] = ${args[1]}. Please tell Joe the tale.`
        ui.notifications.error(msg)
        jez.log(msg)
        postResults(msg)
        return(false)
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    // ---------------------------------------------------------------------------------------
    // Place a nifty tile... 
    //
    const VFX_FILE = "modules/jb2a_patreon/Library/2nd_Level/Gust_Of_Wind/GustOfWind_01_White_1200x200.webm"
    const SQUARES_LENGTH = 12
    const SQUARES_HEIGHT = 2
    // Obtain the ID of the template created by the calling item
    const TEMPLATE_ID = args[0].templateId
    // Call function to place the tile and grab the returned ID
    let newTileId = await placeTileVFX(TEMPLATE_ID, VFX_FILE, SQUARES_LENGTH, SQUARES_HEIGHT);
    jez.log("newTileId", newTileId)
    // Grab the tile's TileDocument object from the scene
    let fetchedTile = await canvas.scene.tiles.get(newTileId)
    jez.log(`fetchedTile ${fetchedTile.id}`, fetchedTile)
    // Format and result message 
    msg = `Placed Tile ID: ${fetchedTile.id}. <br>Image file used as source:<br>${fetchedTile.data.img}`;
    jez.log("msg", msg);
    // ---------------------------------------------------------------------------------------
    // Add an effect to the active token that expires at the end of its next turn. 
    // BUG: For some reason the special Duration code in this effect is tossing an error
    //   times-up.js:31 times-up |  Could not process combat update  TypeError: Cannot read properties of undefined (reading 'startsWith')
    //   at combatUpdate.js:96
    //   at Map.filter (collection.mjs:66)
    //   at Combat.handlePreUpdateCombat (combatUpdate.js:91)
    //   at Combat.preUpdateCombat (combatUpdate.js:141)
    //   at Wrapper.🎁call_wrapper [as call_wrapper] (libWrapper-wrapper.js:620)
    //   at Combat.processOverTime (utils.js:794)
    //   at async ClientDatabaseBackend._preUpdateDocumentArray (foundry.js:10203)
    //   at async ClientDatabaseBackend._updateDocuments (foundry.js:10122)
    //   at async Function.updateDocuments (document.mjs:373)
    //   at async Combat.update (document.mjs:456)
    //   at async MonksCombatTracker._onCombatControl (foundry.js:58779)
    // I'm leaving it as I think it should be and will research the issue when I have time and better 
    // connectivity.
    //
    let gameRound = game.combat ? game.combat.round : 0;
    let specialDuration = ["turnEndSource"]
    let effectData = {
        label: aItem.name,
        icon: aItem.img,
        origin: aToken.uuid,
        disabled: false,
        duration: { rounds: 2, startRound: gameRound },
        flags: { dae: { itemData: aItem, specialDuration: specialDuration } },
        changes: [
            { key: `macro.itemMacro`, mode: jez.CUSTOM, value: `TILE ${fetchedTile.id}`, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
    msg = `The ice storm leaves behind an area of difficult terrain until the end of 
    <b>${aToken.name}</b>'s next turn.`
    postResults(msg)
    // ---------------------------------------------------------------------------------------
    // Modify the concentrating effect to trigger removal of the associated effect
    //
    modConcentratingEffect(aToken, aItem.name)
    // ---------------------------------------------------------------------------------------
    // That's all folks...
    //
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Pop a VFX Tile where the template was and return the ID of the tile
 ***************************************************************************************************/
async function placeTileVFX(TEMPLATE_ID, vfxFile, tilesWide, tilesHigh) {
    // Grab the size of grid in pixels per square
    const GRID_SIZE = canvas.scene.data.grid;
    // Search for the MeasuredTemplate that should have been created by the calling item
    let template = canvas.templates.objects.children.find(i => i.data._id === TEMPLATE_ID);
    // Delete the template to clean up the scene
    canvas.templates.get(TEMPLATE_ID).document.delete();
    // Place the tile with an embedded VFX
    let tileProps = {
        x: template.center.x /*- GRID_SIZE*tilesWide/2*/,   // X coordinate is center of the template
        y: template.center.y - GRID_SIZE * tilesHigh / 2,   // Y coordinate is center of the template
        img: vfxFile,
        width: GRID_SIZE * tilesWide,   // VFX should occupy 2 tiles across
        height: GRID_SIZE * tilesHigh   // ditto
    };
    // let newTile = await Tile.create(tileProps)   // Depricated 
    let newTile = await game.scenes.current.createEmbeddedDocuments("Tile", [tileProps]);  // FoundryVTT 9.x 
    jez.log("newTile", newTile);
    return (newTile[0].data._id);
}
/***************************************************************************************************
 * Modify existing concentration effect to trigger removal of the associated DAE effect on caster
 ***************************************************************************************************/
async function modConcentratingEffect(tToken, label) {
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
    effect.data.changes.push({ key: `macro.itemMacro`, mode: jez.CUSTOM, value: `Effect ${label}`, priority: 20 })
    jez.log(`effect.data.changes`, effect.data.changes)
    //----------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result) jez.log(`Active Effect ${EFFECT} updated!`, result);
}