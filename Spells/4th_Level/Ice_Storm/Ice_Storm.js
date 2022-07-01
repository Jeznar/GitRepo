const MACRONAME = "Ice_Storm.0.3.js"
/*****************************************************************************************
 * Tasks for this macro
 *  1. Place a tile containing a VFX to mark the difficult terrain
 *  2. Spit out a message to chat describing the effect
 *  3. Remove the tile at the end of this actor's next turn
 * 
 * 02/11/22 0.1 Creation of Macro
 * 06/29/22 0.2 Fix for permission issue on game.scenes.current.createEmbeddedDocuments & 
 *              canvas.scene.deleteEmbeddedDocuments
 * 07/01/22 0.3 Swap in calls to jez.tileCreate and jez.tileDelete
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
//if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
//if (args[0] === "each") doEach();					    // DAE removal
// DamageBonus must return a function to the caller
//if (args[0]?.tag === "DamageBonus") return(doBonusDamage());    
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
    //-----------------------------------------------------------------------------------------------
    // Delete the tile we just built with library function. 
    //
    jez.tileDelete(args[1])  
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
    const VFX_FILE = "modules/jb2a_patreon/Library/Generic/Fire/GroundCrackLoop_03_Regular_Blue_600x600.webm"
    const SQUARES_ACROSS = 12
    // Obtain the ID of the template created by the calling item
    const TEMPLATE_ID = args[0].templateId
    // Call function to place the tile and grab the returned ID
    let newTileId = await placeTileVFX(TEMPLATE_ID, VFX_FILE, SQUARES_ACROSS);
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
        label: "Ice Storm",
        icon: aItem.img,
        origin: aToken.uuid,
        disabled: false,
        duration: { rounds: 2, startRound: gameRound },
        flags: { dae: { itemData: aItem, specialDuration: specialDuration } },
        changes: [
            { key: `macro.itemMacro`, mode: jez.CUSTOM, value: fetchedTile.id, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
    msg = `The ice storm leaves behind an area of difficult terrain until the end of 
    <b>${aToken.name}</b>'s next turn.`
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Pop a VFX Tile where the template was and return the ID of the tile
 ***************************************************************************************************/
 async function placeTileVFX(TEMPLATE_ID, vfxFile, tilesAcross) {
    const FUNCNAME = "placeTileVFX(TEMPLATE_ID, vfxFile, tilesAcross)";
    jez.trc(2,trcLvl,`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    jez.trc(3,trcLvl,"Parameters","TEMPLATE_ID",TEMPLATE_ID,"vfxFile",vfxFile,"tilesAcross",tilesAcross)

    // Grab the size of grid in pixels per square
    const GRID_SIZE = canvas.scene.data.grid;   
    // Search for the MeasuredTemplate that should have been created by the calling item
    let template = canvas.templates.objects.children.find(i => i.data._id === TEMPLATE_ID);
    // Delete the template to clean up the scene
    canvas.templates.get(TEMPLATE_ID).document.delete();
    // Place the tile with an embedded VFX
    let tileProps = {  
        x: template.center.x - GRID_SIZE*tilesAcross/2,   // X coordinate is center of the template
        y: template.center.y - GRID_SIZE*tilesAcross/2,   // Y coordinate is center of the template
        //img: "modules/jb2a_patreon/Library/Generic/Fire/GroundCrackLoop_03_Regular_Orange_600x600.webm",
        img: vfxFile,
        width: GRID_SIZE * tilesAcross,   // VFX should occupy 2 tiles across
        height: GRID_SIZE * tilesAcross,   // ditto
        alpha: 0.5
    };
    //-----------------------------------------------------------------------------------------------
    // Call library function to create the new tile, catching the id returned.  
    //
    return await jez.tileCreate(tileProps)
 }