const MACRONAME = "Earth_Tremor_0.2.js"
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
 *****************************************************************************************/
const CONDITION = `Prone`;
const ICON = `modules/combat-utility-belt/icons/prone.svg`;
let msg = "";
let xtraMsg = `<br><br>
    If the ground in that area is loose earth or stone, it becomes difficult terrain 
    until cleared. <i><b>FoundryVTT:</b> Effect represented by a tile, that can be 
    manually removed.</i>`
jez.log(`************ Executing ${MACRONAME} ****************`)
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
// ---------------------------------------------------------------------------------------
// Place a nifty tile... 
//
// Obtain the ID of the template created by the calling item
const TEMPLATE_ID = args[0].templateId
// Call function to place the tile and grab the returned ID
let newTileId = await placeTileVFX(TEMPLATE_ID);
jez.log("newTileId", newTileId)
// Grab the tile's TileDocument object from the scene
let fetchedTile = await canvas.scene.tiles.get(newTileId)
jez.log(`fetchedTile ${fetchedTile.id}`, fetchedTile)
// Format and result message 
msg = `Placed Tile ID: ${fetchedTile.id}. <br>Image file used as source:<br>${fetchedTile.data.img}`;
jez.log("msg", msg);

// ---------------------------------------------------------------------------------------
// If no target failed, post result and terminate 
//
let failCount = args[0].failedSaves.length
jez.log(`${failCount} args[0].failedSaves: `, args[0].failedSaves)
if (failCount === 0) {
    msg = `No creatures failed their saving throw.` + xtraMsg;
    await postResults(msg);
    jez.log(` ${msg}`, args[0].saves);
    jez.log(`************ Ending ${MACRONAME} ****************`)
    return;
}
// ---------------------------------------------------------------------------------------
// Build an array of the ID's of the chumps that failed.
//
let failures = [];
for (let i = 0; i < failCount; i++) {
    const FAILED = args[0].failedSaves[i];
    jez.log(` ${i} --> ${FAILED.data.actorId}`, FAILED);
    jez.log(` ${i} Adding chump: `, FAILED)
    failures.push(FAILED);
    // await game.cub.addCondition(CONDITION, FAILED, {allowDuplicates:true, replaceExisting:true, warn:true});
}
// ---------------------------------------------------------------------------------------
// Apply the CONDITION to the chumps that failed their save, if not already affected
//
let gameRound = game.combat ? game.combat.round : 0;
for (let i = 0; i < failCount; i++) {
    jez.log(` ${i} Processing: `, failures[i])
    // Determine if target already has the affect
    //if (target.effects.find(ef => ef.data.label === effect)) {
    //if (failures[i].data.actorData.effects.find(ef => ef.data.label === CONDITION)) {
    if (failures[i].data.actorData.effects.find(ef => ef.label === CONDITION)) {
        jez.log(` ${failures[i].name} is already ${CONDITION}. `, failures[i])
    } else {
        jez.log(` ${failures[i].name} is not yet ${CONDITION}. `, failures[i])
        //----------------------------------------------------------------------------------------
        // add CUB Condition this is either/or with manual add in section following
        //
        game.cub.addCondition(["Prone"], failures[i], {
            allowDuplicates: false,
            replaceExisting: false,
            warn: true
        }); 
        //----------------------------------------------------------------------------------------
        // Manual condition add
        //
        /*let effectData = {
            label: CONDITION,
            icon: ICON,
            // origin: player.uuid,
            disabled: false,
            duration: { rounds: 99, startRound: gameRound },
            changes: [
                { key: `flags.midi-qol.disadvantage.attack.all`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.mwak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.msak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rwak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rsak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `data.attributes.movement.walk`, mode: jez.MULTIPLY, value: 0.5, priority: 20 }
            ]
        };
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: failures[i].uuid, effects: [effectData] });*/
    }
}
// ---------------------------------------------------------------------------------------
// Post that the target failed and the consequences.
//
msg = `Creatures that failed their saving have been knocked @JournalEntry[FBPUaHRxNyNXAOeh]{prone}.` + xtraMsg;
await postResults(msg);
jez.log(` ${msg}`);
jez.log(`************ Terminating ${MACRONAME} ****************`)
/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
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
        x: template.center.x - GRID_SIZE/2,   // X coordinate is center of the template
        y: template.center.y - GRID_SIZE/2,   // Y coordinate is center of the template
        //img: "modules/jb2a_patreon/Library/4th_Level/Black_Tentacles/BlackTentacles_01_Dark_Purple_600x600.webm",
        img: "modules/jb2a_patreon/Library/Generic/Fire/GroundCrackLoop_03_Regular_Orange_600x600.webm",
        width: GRID_SIZE * 3,   // VFX should occupy 2 tiles across
        height: GRID_SIZE * 3   // ditto
    };
    // let newTile = await Tile.create(tileProps)   // Depricated 
    let newTile = await game.scenes.current.createEmbeddedDocuments("Tile", [tileProps]);  // FoundryVTT 9.x 
    jez.log("newTile", newTile);
    return(newTile[0].data._id);
}