const MACRONAME = "Gust_of_Wind.0.4.js"
/*****************************************************************************************
 * 05/31/22 0.1 Creation of Macro
 * 06/29/22 0.2 Fix for permission issue on game.scenes.current.createEmbeddedDocuments & 
 *              canvas.scene.deleteEmbeddedDocuments
 * 07/01/22 0.3 Swap in calls to jez.tileCreate and jez.tileDelete
 * 08/02/22 0.4 Add convenientDescription
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 1;
jez.trc(2, trcLvl, `=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(3, trcLvl,`  args[${i}]`, args[i]);
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
        jez.tileDelete(TILE_ID)
    } 
    else if (args[1] === "Effect") {
        let existingEffect = await aToken.actor.effects.find(i => i.data.label === args[2]);
        if (existingEffect) await existingEffect.delete()
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
    //
    const CE_DESC = `Bonus action to change direction the gust blasts from ${aToken.name}.`
    let effectData = {
        label: aItem.name,
        icon: aItem.img,
        origin: aToken.uuid,
        disabled: false,
        flags: { 
            dae: { itemData: aItem }, 
            convenientDescription: CE_DESC
        },
        changes: [
            { key: `macro.itemMacro`, mode: jez.CUSTOM, value: `Tile ${fetchedTile.id}`, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
    msg = `Strong wind blasts from <b>${aToken.name}</b>. Eash token that starts its turn in the 
    gusts must make a DC${jez.getSpellDC(aToken)} STR Save or be moved 15 feet.  
    Moving into the wind costs double.`
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
    const FUNCNAME = "placeTileVFX(TEMPLATE_ID, vfxFile, tilesWide, tilesHigh)";
    jez.trc(2,trcLvl,`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    jez.trc(3,trcLvl,"Parameters","TEMPLATE_ID",TEMPLATE_ID,"vfxFile",vfxFile,"tilesWide",tilesWide,"tilesHigh",tilesHigh)

    // Grab the size of grid in pixels per square
    const GRID_SIZE = canvas.scene.data.grid;
    // Search for the MeasuredTemplate that should have been created by the calling item
    let template = canvas.templates.objects.children.find(i => i.data._id === TEMPLATE_ID);
    // Delete the template to clean up the scene
    canvas.templates.get(TEMPLATE_ID).document.delete();
    // Place the tile with an embedded VFX
    let tileProps = {
        x: template.center.x /*- GRID_SIZE*tilesWide/2*/,   // X coordinate is poorly understood
        y: template.center.y - GRID_SIZE * tilesHigh / 2,   // Y coordinate is center of the template
        img: vfxFile,
        width: GRID_SIZE * tilesWide,   // VFX should occupy 2 tiles across
        height: GRID_SIZE * tilesHigh   // ditto
    };
    return await jez.tileCreate(tileProps)
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
    effect.data.changes.push({ key: `macro.itemMacro`, mode: jez.CUSTOM, value: `Effect '${label}'`, priority: 20 })
    jez.log(`effect.data.changes`, effect.data.changes)
    //----------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result) jez.log(`Active Effect ${EFFECT} updated!`, result);
}