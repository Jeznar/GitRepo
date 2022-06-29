const MACRONAME = "Demo_Tile_VFX.0.2.js"
/*****************************************************************************************
 * This macro to be used as an ItemMacro and needs the calling item to place a 20x20 
 * targetting template which will be used to locate the tile and then deleted.
 * 
 * Place a tile with a webm video embedded at loaction of a template.
 * 
 * 03/03/22 0.1 Creation of Macro
 * 06/29/22 0.2 Fix for permission issue on game.scenes.current.createEmbeddedDocuments 
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 1;
jez.trc(2, trcLvl, `=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(3, trcLvl,`  args[${i}]`, args[i]);
let msg = "";
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
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
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    // Obtain the ID of the template created by the calling item
    const TEMPLATE_ID = args[0].templateId      
    // Call function to place the tile and grab the returned ID
    let newTileId = await placeTileVFX(TEMPLATE_ID);   
    jez.log("newTileId",newTileId)
    //
    // To delete the new tile
    // await jez.deleteEmbeddedDocs("Tile", [newTileId])  
    // 
    // Grab the tile's TileDocument object from the scene
    let fetchedTile = await canvas.scene.tiles.get(newTileId)
    jez.log(`fetchedTile ${fetchedTile.id}`,fetchedTile)
    // Format and result message 
    msg = `Placed Tile ID: ${fetchedTile.id}. <br>Image file used as source:<br>${fetchedTile.data.img}`;
    jez.log("msg", msg);
    // Post the message to chat log
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Pop a VFX Tile where the template was
 ***************************************************************************************************/
async function placeTileVFX(TEMPLATE_ID) {
    const FUNCNAME = "placeTile(TEMPLATE_ID)";
    jez.trc(2,trcLvl,`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    jez.trc(3,trcLvl,"Parameters","TEMPLATE_ID",TEMPLATE_ID)

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
        img: "modules/jb2a_patreon/Library/4th_Level/Black_Tentacles/BlackTentacles_01_Dark_Purple_600x600.webm",
        width: GRID_SIZE * 4,   // VFX should occupy 4 tiles across
        height: GRID_SIZE * 4   // ditto
    };
    // let newTile = await Tile.create(tileProps)   // Depricated 
    // Following line throws a permission error for non-GM acountnts running this code.
    // let newTile = await game.scenes.current.createEmbeddedDocuments("Tile", [tileProps]);  // FoundryVTT 9.x 
    let existingTiles = game.scenes.current.tiles.contents
    let newTile = await jez.createEmbeddedDocs("Tile", [tileProps])
    jez.trc(3, "jez.createEmbeddedDocs returned", newTile);
    if (newTile) {
        let returnValue = newTile[0].data._id
        jez.trc(2,`--- Finished --- ${MACRONAME} ${FUNCNAME} --- Generated:`,returnValue);
        return returnValue; // If newTile is defined, return the id.
    }
    else {   // newTile will be undefined for players, so need to fish for a tile ID
        let gameTiles = i = null
        let delay = 5
        for (i = 1; i < 20; i++) {
            await jez.wait(delay)   // wait for a very short time and see if a new tile has appeared
            jez.trc(3,trcLvl,`Seeking new tile, try ${i} at ${delay*i} ms after return`)
            gameTiles = game.scenes.current.tiles.contents
            if (gameTiles.length > existingTiles.length) break
        }
        if (i === 40) return jez.badNews(`Could not find new tile, sorry about that`,"warn")
        jez.trc(3,trcLvl,"Seemingly, the new tile has id",gameTiles[gameTiles.length - 1].id)
        let returnValue = gameTiles[gameTiles.length - 1].id
        jez.trc(2,trcLvl,`--- Finished --- ${MACRONAME} ${FUNCNAME} --- Scraped:`,returnValue);
        return returnValue
    }
    jez.log("newTile", newTile);
    return(newTile[0].data._id);
}
