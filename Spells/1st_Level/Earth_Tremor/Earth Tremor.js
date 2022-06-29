const MACRONAME = "Earth_Tremor.0.3.js"
/*****************************************************************************************
 * Slap a text message on the item card indicating Who and What should be moved by the
 * spell.
 *
 * Spell Description: You cause a tremor in the ground within range. Each creature other
 *   than you in that area must make a Dexterity saving throw. On a failed save, a
 *   creature takes 1d6 bludgeoning damage and is knocked prone. If the ground in that
 *   area is loose earth or stone, it becomes difficult terrain until cleared, with
 *   each 5-foot-diameter portion requiring at least 1 minute to clear by hand.
 *
 *   At Higher Levels. When you cast this spell using a spell slot of 2nd level or
 *   higher, the damage increases by 1d6 for each slot level above 1st.
 *
 * 12/11/21 0.1 Creation of Macro
 * 05/17/22 0.2 Convert to place a tile instead of just a sequencer video
 * 06/29/22 0.3 Fix for permission issue on game.scenes.current.createEmbeddedDocuments
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 1;
jez.trc(2, trcLvl, `=== Starting === ${MACRONAME} ===`);

const CONDITION = `Prone`;
const ICON = `modules/combat-utility-belt/icons/prone.svg`;
let msg = "";
let xtraMsg = `<br><br>
    If the ground in that area is loose earth or stone, it becomes difficult terrain
    until cleared. <i><b>FoundryVTT:</b> Effect represented by a tile, that can be
    manually removed.</i>`
jez.trc(1, trcLvl, `************ Executing ${MACRONAME} ****************`)
for (let i = 0; i < args.length; i++) jez.trc(2, trcLvl, `  args[${i}]`, args[i]);
// ---------------------------------------------------------------------------------------
// Place a nifty tile...
//
// Obtain the ID of the template created by the calling item
const TEMPLATE_ID = args[0].templateId
// Call function to place the tile and grab the returned ID
let newTileId = await placeTileVFX(TEMPLATE_ID);
jez.trc(3, trcLvl, "newTileId", newTileId)
// Grab the tile's TileDocument object from the scene
let fetchedTile = await canvas.scene.tiles.get(newTileId)
jez.trc(3, trcLvl, `fetchedTile ${fetchedTile.id}`, fetchedTile)
// Format and result message
msg = `Placed Tile ID: ${fetchedTile.id}. <br>Image file used as source:<br>${fetchedTile.data.img}`;
jez.trc(2, trcLvl, "msg", msg);

// ---------------------------------------------------------------------------------------
// If no target failed, post result and terminate
//
let failCount = args[0].failedSaves.length
jez.trc(2, trcLvl, `${failCount} args[0].failedSaves: `, args[0].failedSaves)
if (failCount === 0) {
    msg = `No creatures failed their saving throw.` + xtraMsg;
    await postResults(msg);
    jez.trc(2, trcLvl, ` ${msg}`, args[0].saves);
    jez.trc(1, trcLvl, `************ Ending ${MACRONAME} ****************`)
    return;
}
// ---------------------------------------------------------------------------------------
// Build an array of the ID's of the chumps that failed.
//
let failures = [];
for (let i = 0; i < failCount; i++) {
    const FAILED = args[0].failedSaves[i];
    jez.trc(3, trcLvl, ` ${i} --> ${FAILED.data.actorId}`, FAILED);
    jez.trc(3, trcLvl, ` ${i} Adding chump: `, FAILED)
    failures.push(FAILED);
    // await game.cub.addCondition(CONDITION, FAILED, {allowDuplicates:true, replaceExisting:true, warn:true});
}
// ---------------------------------------------------------------------------------------
// Apply the CONDITION to the chumps that failed their save, if not already affected
//
let gameRound = game.combat ? game.combat.round : 0;
for (let i = 0; i < failCount; i++) {
    jez.trc(2, trcLvl, ` ${i} Processing: `, failures[i])
    // Determine if target already has the affect
    //if (target.effects.find(ef => ef.data.label === effect)) {
    //if (failures[i].data.actorData.effects.find(ef => ef.data.label === CONDITION)) {
    if (failures[i].data.actorData.effects.find(ef => ef.label === CONDITION)) {
        jez.trc(2, trcLvl, ` ${failures[i].name} is already ${CONDITION}. `, failures[i])
    } else {
        jez.trc(2, trcLvl, ` ${failures[i].name} is not yet ${CONDITION}. `, failures[i])
        //----------------------------------------------------------------------------------------
        // add CUB Condition this is either/or with manual add in section following
        //
        game.cub.addCondition(["Prone"], failures[i], {
            allowDuplicates: false,
            replaceExisting: false,
            warn: true
        });
    }
}
// ---------------------------------------------------------------------------------------
// Post that the target failed and the consequences.
//
msg = `Creatures that failed their saving have been knocked @JournalEntry[FBPUaHRxNyNXAOeh]{prone}.` + xtraMsg;
await postResults(msg);
jez.trc(2, trcLvl, ` ${msg}`);
jez.trc(1, trcLvl, `************ Terminating ${MACRONAME} ****************`)
/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(msg) {
    jez.trc(3, trcLvl, msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Pop a VFX Tile where the template was
 ***************************************************************************************************/
 async function placeTileVFX(TEMPLATE_ID) {
    const FUNCNAME = "placeTileVFX(TEMPLATE_ID)";
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
        x: template.center.x - GRID_SIZE/2,   // X coordinate is center of the template
        y: template.center.y - GRID_SIZE/2,   // Y coordinate is center of the template
        //img: "modules/jb2a_patreon/Library/4th_Level/Black_Tentacles/BlackTentacles_01_Dark_Purple_600x600.webm",
        img: "modules/jb2a_patreon/Library/Generic/Fire/GroundCrackLoop_03_Regular_Orange_600x600.webm",
        width: GRID_SIZE * 3,   // VFX should occupy 2 tiles across
        height: GRID_SIZE * 3   // ditto
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
}