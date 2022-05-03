const MACRONAME = "Demo_Tile_VFX.js"
/*****************************************************************************************
 * This macro to be used as an ItemMacro and needs the calling item to place a 20x20 
 * targetting template which will be used to locate the tile and then deleted.
 * 
 * Place a tile with a webm video embedded at loaction of a template.
 * 
 * 03/03/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
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
    let newTile = await game.scenes.current.createEmbeddedDocuments("Tile", [tileProps]);  // FoundryVTT 9.x 
    jez.log("newTile", newTile);
    return(newTile[0].data._id);
}
