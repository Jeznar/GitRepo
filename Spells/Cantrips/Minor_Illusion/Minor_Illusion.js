const MACRONAME = "Minor_Illusion.0.1.js"
/*****************************************************************************************
 * Run a three staget Illusion rune VFX in the 5' square tile created when the spell was targeted. 
 * Delete that VFX on spell completion or removal. 
 * 
 * 06/01/22 0.1 Creation of Macro
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
    const SQUARES_LENGTH = 1
    const SQUARES_HEIGHT = 1
    // Obtain the ID of the template created by the calling item
    const TEMPLATE_ID = args[0].templateId
    // Call function to place the tile and grab the returned ID
    const VFX_FILE = `modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/IllusionRuneLoop_01_Regular_${jez.getRandomRuneColor()}_400x400.webm`
    let newTileId = await placeTileVFX(TEMPLATE_ID, VFX_FILE, SQUARES_LENGTH, SQUARES_HEIGHT);
    jez.log("newTileId", newTileId)
    // Grab the tile's TileDocument object from the scene
    let fetchedTile = await canvas.scene.tiles.get(newTileId)
    jez.log(`fetchedTile ${fetchedTile.id}`, fetchedTile)
    // Format and result message 
    msg = `Placed Tile ID: ${fetchedTile.id}. <br>Image file used as source:<br>${fetchedTile.data.img}`;
    jez.log("msg", msg);
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
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Pop a VFX Tile where the template was and return the ID of the tile
 ***************************************************************************************************/
async function placeTileVFX(TEMPLATE_ID, vfxFile, tilesWide, tilesHigh) {
    jez.log("vfxFile", vfxFile)
    // Grab the size of grid in pixels per square
    const GRID_SIZE = canvas.scene.data.grid;
    // Search for the MeasuredTemplate that should have been created by the calling item
    let template = canvas.templates.objects.children.find(i => i.data._id === TEMPLATE_ID);
    // Delete the template to clean up the scene
    canvas.templates.get(TEMPLATE_ID).document.delete();
    // Place the tile with an embedded VFX
    let tileProps = {
        _id: game.scenes.current.id,                        // ID of current scene to hold tile
        x: template.center.x, //- GRID_SIZE * tilesWide / 2,   // X coordinate is poorly understood
        y: template.center.y, //- GRID_SIZE * tilesHigh / 2,   // Y coordinate is center of the template
        img: vfxFile,
        width: GRID_SIZE * tilesWide,   // VFX should occupy 2 tiles across
        height: GRID_SIZE * tilesHigh   // ditto
    };
    //-----------------------------------------------------------------------------------------------
    // Build an array of tile ids in the current scene so we can figure out what tile was just added
    //
    let existingTiles = []
    for (tile of game.scenes.current.tiles.contents) {
        jez.log("tile ID", tile.id)
        existingTiles.push(tile.id)
    }
    jez.log("existingTiles",existingTiles)
    // let newTile = await Tile.create(tileProps)   // Depricated 
    // Following line throws a permission error for non-GM acountnts running this code.
    //   Uncaught (in promise) Error: User Jon M. lacks permission to create Tile [v0VARMGmr4fCaTLr] in parent Scene [MzEyYTVkOTQ4NmZk]
    // let newTile = await game.scenes.current.createEmbeddedDocuments("Tile", [tileProps]);  // FoundryVTT 9.x 
    let newTile = await jez.createEmbeddedDocs("Tile", [tileProps])  
    jez.log("newTile placeTileVFX", newTile);
    if (newTile) return (newTile[0].data._id); // If newTile is defined, return the id.
    else {   // newTile will be undefined for players, so need to fish for a tile ID

        let newTiles = []
        let gameTiles = null
        let i
        for (i = 0; i <= 40; i++) {
            await jez.wait(10)
            jez.log(`${i}`)
            gameTiles = game.scenes.current.tiles.contents
            if (gameTiles.length > existingTiles.length) break
        }
        if (i === 40) return jez.badNews(`Could not find new tile, sorry about that`,"warn")
        jez.log("Seemingly, the new tile has id",gameTiles[gameTiles.length - 1].id)
        return gameTiles[gameTiles.length - 1].id
    }
}
/***************************************************************************************************
 * Run a 3 part spell rune VFX on indicated token  with indicated rune, Color, scale, and opacity
 * may be optionally specified.
 * 
 * If called with an array of target tokens, it will recursively apply the VFX to each token 
 * 
 * Typical calls: 
 *  jez.runRuneVFX(tToken, jez.getSpellSchool(aItem))
 *  jez.runRuneVFX(args[0].targets, jez.getSpellSchool(aItem), jez.getRandomRuneColor())
 ***************************************************************************************************/
 function runRuneVFX(target, school, color, scale, opacity) {
    school = school || "illusion"               // default school is illusion \_(ツ)_/
    color = color || jez.getRandomRuneColor()   // If color not provided get a random one
    scale = scale || 1.0                        // If scale not provided use 1.0
    opacity = opacity || 1.0                    // If opacity not provided use 1.0
    //jez.log("runRuneVFX(target, school, color, scale, opacity)","target",target,"school",school,"scale",scale,"opacity",opacity)
    if (Array.isArray(target)) {                // If function called with array, do recursive calls
        for (let i = 0; i < target.length; i++) jez.runRuneVFX(target[i], school, color, scale, opacity);
        return (true)                           // Stop this invocation after recursive calls
    }
    //-----------------------------------------------------------------------------------------------
    // Build names of video files needed
    // 
    const INTRO = `jb2a.magic_signs.rune.${school}.intro.${color}`
    const BODY = `jb2a.magic_signs.rune.${school}.loop.${color}`
    const OUTRO = `jb2a.magic_signs.rune.${school}.outro.${color}`
    //-----------------------------------------------------------------------------------------------
    // Play the VFX
    // 
    new Sequence()
        .effect()
        .file(INTRO)
        .atLocation(target)
        .scaleToObject(scale)
        .opacity(opacity)
        .waitUntilFinished(-500)
        .effect()
        .file(BODY)
        .atLocation(target)
        .scaleToObject(scale)
        .opacity(opacity)
        //.duration(3000)
        .persist()
        .waitUntilFinished(-500)
        .effect()
        .file(OUTRO)
        .atLocation(target)
        .scaleToObject(scale)
        .opacity(opacity)
        .play();
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