const MACRONAME = "Ink_Cloud.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Places an Ink Cloud tile in support of Octopus ability.
 * 
 * This needs to be inserted as an ItemMacro.
 * 
 *11/28/22 0.1 Creation
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor;
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          // Midi ItemMacro On Use
if (args[0] === "off") await doOff({traceLvl:TL});                   // DAE removal
if (TL>1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    // Store some needed info
    //
    // Grab the size of grid in pixels per square
    // const TEMPLATE_ID = args[0].templateId                                  // ID of the template
    // const TEMPLATE_OBJS = canvas.templates.objects.children                 // Stash the templates
    // let template = TEMPLATE_OBJS.find(i => i.data._id === TEMPLATE_ID);     // Find Template
    // canvas.templates.get(TEMPLATE_ID).document.delete();                    // Delete Template
    //-----------------------------------------------------------------------------------------------
    // Build the data object for the tile to be created
    //
    const GRID_SIZE = canvas.scene.data.grid;                               // Stash the grid size
    let tileProps = {
        x: aToken.center.x - GRID_SIZE * 2,     // X coordinate is center of the aToken
        y: aToken.center.y - GRID_SIZE * 2,     // Y coordinate is center of the aToken
        // img: "modules/jb2a_patreon/Library/1st_Level/Fog_Cloud/FogCloud_01_White_800x800.webm",
        img: "modules/jb2a_patreon/Library/1st_Level/Sleep/Cloud01_02_Dark_OrangePurple_400x400.webm",
        width: GRID_SIZE*4,                     // VFX should occupy 2 tiles across
        height: GRID_SIZE*4,                    // ditto
        overhead: true,
        occlusion: {
            alpha: 0,
            mode: 3,
        },
        alpha: 1.0                            // Opacity of our placed tile 0 to 1.0  
    };
    //-----------------------------------------------------------------------------------------------
    // Call library function to create the new tile, catching the id returned.  
    //
    let tileId = await jez.tileCreate(tileProps)
    //-----------------------------------------------------------------------------------------------
    // Place a DAE effect on the actor to trigger deletion of the cloud in 10 turns 
    //
    const CE_DESC = `Ink Cloud obscures vision for up to a minute`
    const GAME_RND = game.combat ? game.combat.round : 0;
    const EFFECT_NAME = `Ink Cloud`
    let effectData = [{
        label: EFFECT_NAME,
        icon: aItem.img,
        origin: LAST_ARG.uuid,
        disabled: false,
        flags: { 
            dae: { stackable: false, macroRepeat: "none" },
            convenientDescription: CE_DESC
        },
        duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
        changes: [
            { key: `macro.itemMacro`, mode: jez.CUSTOM, value: `${tileId}`, priority: 20 },
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: effectData });
    //-----------------------------------------------------------------------------------------------
    // That's all folks
    //
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOff(options={}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    const TILE_ID = args[1]
    jez.tileDelete(TILE_ID)
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}