const MACRONAME = "Minor_Illusion.0.2.js"
/*****************************************************************************************
 * Run a three staget Illusion rune VFX in the 5' square tile created when the spell was targeted. 
 * Delete that VFX on spell completion or removal. 
 * 
 * 06/01/22 0.1 Creation of Macro
 * 07/01/22 0.2 Swap in calls to jez.tileCreate and jez.tileDelete
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 1;
jez.trc(2,trcLvl,`=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(3,trcLvl,`  args[${i}]`, args[i]);
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
jez.trc(2,trcLvl,`=== Finishing === ${MACRONAME} ===`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.trc(3,trcLvl,msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.trc(2,trcLvl,`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    if (args[1] === "Tile") {
        //-----------------------------------------------------------------------------------------------
        // Delete the tile we just built with library function. 
        //
        jez.tileDelete(args[2])
    } 
    else if (args[1] === "Effect") {
        let existingEffect = await aToken.actor.effects.find(i => i.data.label === args[2]);
        if (existingEffect) await existingEffect.delete()
    } else {
        msg = `Some bad logic happened in ${MACRO}. Args[1] = ${args[1]}. Please tell Joe.`
        return jez.badNews(msg,"error")
    }
    jez.trc(2,trcLvl,`--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.trc(2,trcLvl,`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    // ---------------------------------------------------------------------------------------
    // Place a nifty tile... 
    //
    const SQUARES_LENGTH = 1
    const SQUARES_HEIGHT = 1
    // Obtain the ID of the template created by the calling item
    const TEMPLATE_ID = args[0].templateId
    // Call function to place the tile and grab the returned ID
    const VFX_FILE = `modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/IllusionRuneLoop_01_Regular_${jez.getRandomRuneColor()}_400x400.webm`
    let newTileId = await placeTileVFX(TEMPLATE_ID, VFX_FILE, SQUARES_LENGTH, SQUARES_HEIGHT);
    jez.trc(3,trcLvl,"newTileId", newTileId)
    // Grab the tile's TileDocument object from the scene
    let fetchedTile = await canvas.scene.tiles.get(newTileId)
    jez.trc(3,trcLvl,`fetchedTile ${fetchedTile.id}`, fetchedTile)
    // Format and result message 
    msg = `Placed Tile ID: ${fetchedTile.id}. <br>Image file used as source:<br>${fetchedTile.data.img}`;
    jez.trc(3,trcLvl,"msg", msg);
    // ---------------------------------------------------------------------------------------
    // If a previous casting is still active, delete it before creating a new one.
    //
    let existingEffect = aActor.effects.find(ef => ef.data.label === aItem.name)
    if (existingEffect) await existingEffect.delete();
    // ---------------------------------------------------------------------------------------
    // Add an effect to the active token 
    //
    const GAME_RND = game.combat ? game.combat.round : 0;
    let effectData = {
        label: aItem.name,
        icon: aItem.img,
        origin: aToken.uuid,
        disabled: false,
        duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: { dae: { itemData: aItem } },
        changes: [
            { key: `macro.itemMacro`, mode: jez.CUSTOM, value: `Tile ${fetchedTile.id}`, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
    msg = `<b>${aToken.name}</b> creates a sound or an image of an object within range that lasts for the 
    duration. Effects are not automated.`
    postResults(msg)
    // ---------------------------------------------------------------------------------------
    // Modify the concentrating effect to trigger removal of the associated effect
    //
    //modConcentratingEffect(aToken, aItem.name)
    // ---------------------------------------------------------------------------------------
    // That's all folks...
    //
    jez.trc(2,trcLvl,`--- Finished --- ${MACRONAME} ${FUNCNAME} ---`,true);
    return (true);
}
/***************************************************************************************************
 * Pop a VFX Tile where the template was and return the ID of the tile
 ***************************************************************************************************/
async function placeTileVFX(TEMPLATE_ID, vfxFile, tilesWide, tilesHigh) {
    const FUNCNAME = "placeTileVFX(TEMPLATE_ID, vfxFile, tilesWide, tilesHigh)";
    jez.trc(2, trcLvl, `--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    jez.trc(3, trcLvl, "Parameters", "TEMPLATE_ID", TEMPLATE_ID, "vfxFile", vfxFile, "tilesWide", tilesWide, "tilesHigh", tilesHigh)
    // Grab the size of grid in pixels per square
    const GRID_SIZE = canvas.scene.data.grid;
    // Search for the MeasuredTemplate that should have been created by the calling item
    let template = canvas.templates.objects.children.find(i => i.data._id === TEMPLATE_ID);
    // Delete the template to clean up the scene
    canvas.templates.get(TEMPLATE_ID).document.delete();
    // Place the tile with an embedded VFX
    let tileProps = {
        _id: game.scenes.current.id,    // ID of current scene to hold tile
        x: template.center.x,           // X coordinate is poorly understood
        y: template.center.y,           // Y coordinate is center of the template
        img: vfxFile,
        width: GRID_SIZE * tilesWide,   // 
        height: GRID_SIZE * tilesHigh   // 
    };
    //-----------------------------------------------------------------------------------------------
    // Call library function to create the new tile, returning the id. 
    //
    return await jez.tileCreate(tileProps)
}