const MACRONAME = "Vampyr_Binding_Setup.0.3.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Setup for the Vampyr Binding Ritual
 * 
 * 12/29/22 0.1 Creation of Macro
 * 12/30/22 0.2 Summon Amber Block Token instead of tile in circle center
 * 01/11/23 0.3 Change to make this an ability focused on the creature (Amber Block) that fires the macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const GRID_SIZE = canvas.scene.data.grid;     // Stash the grid size
const MAP_HEIGHT = canvas.scene.data.height
const MAP_WIDTH = canvas.scene.data.width
const BASE_NAME = 'Ceremonial Lantern'
const SCENE_ID = game.scenes.viewed.id
const AMBER_ACTOR_NAME = 'Amber Block'
const SALT_WIDTH = 11.5
const LANTERN_DIST = 5.5
const MARGIN = GRID_SIZE * (SALT_WIDTH/2 + 1)
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define function variables
    //
    const AMBER_IMG = 'Tiles_JGB/Terrain/Amber_Chunk/Amber_Chunk.png'
    const SALT_IMG = 'Tiles_JGB/Terrain/Salt_Circle/Salt_Circle.png'
    const COLOR_NAMES = ['Yellow', 'Blue', 'Red', 'Green', 'Purple']
    const COLOR_VALUES = ['#9b9d01', '#01939d', '#9d1001', '#2b9d01', '#9d0190']
    const TEMP_ABILITY = 'Relight Vampyr Lantern'
    const CENTER = aToken.center
    if (TL > 1) jez.trace(`${TAG} Color Values`, 'Names ', COLOR_NAMES, 'Values', COLOR_VALUES)
    let lanterIds = []
    /*********************************************************************************************************************************
     * This code block was used to place the amber block, it is unneeded as of 0.3 which assumes this macro is being triggered by 
     * actor (Amber Block, ideally) that is the center of teh cermonial area. 
    //-------------------------------------------------------------------------------------------------------------------------------
    // Find Center of circle
    //
    const CENTER = await jez.warpCrosshairs(aToken, 150, AMBER_IMG, aItem.name, {}, -1, { traceLvl: 5 })
    if (TL > 1) jez.trace(`${TAG} Coordinates for middle of area`, 'X', CENTER.x, 'Y', CENTER.y, 'CENTER', CENTER)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Verify center is far enough from the scene edges
    //
    if (TL > 1) jez.trace(`${TAG} Center {${CENTER.x}, ${CENTER.y}}, Margin ${MARGIN}, HEIGHT ${MAP_HEIGHT}, WIDTH ${MAP_WIDTH}`)
    if (CENTER.x < MARGIN) return jez.badNews(`Not far enough from scene left edge`,'w')
    if (CENTER.y < MARGIN) return jez.badNews(`Not far enough from scene top edge`,'w')
    if (CENTER.x > MAP_WIDTH - MARGIN) return jez.badNews(`Not far enough from scene right edge`,'w')
    if (CENTER.y > MAP_HEIGHT - MARGIN) return jez.badNews(`Not far enough from scene bottom edge`,'w')
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
    await warpgate.spawnAt({ x: CENTER.x, y: CENTER.y }, AMBER_ACTOR_NAME, {}, {}, OPTIONS);
    *********************************************************************************************************************************/
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define the properties that will be applied to the TILE representing the salt circle.
    //
    saltTileProps = {
        img: SALT_IMG,
        x: CENTER.x - GRID_SIZE * SALT_WIDTH / 2,
        y: CENTER.y - GRID_SIZE * SALT_WIDTH / 2,
        width: GRID_SIZE * SALT_WIDTH,
        height: GRID_SIZE * SALT_WIDTH,
        alpha: 1.0                                // Opacity of our placed tile 0 to 1.0  
    };
    const SALT_CIRCLE_ID = await jez.tileCreate(saltTileProps)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Place Lantern tokens around our circle
    //
    for (let i = 0; i < 5; i++) {
        const RADIANS = (i / 5) * (2 * Math.PI) + Math.PI // Distance Around Perimeter * Radians Around Circle
        if (TL > 1) jez.trace(`${TAG} Placing Lantern #${i + 1} at ${RADIANS} radians`);
        await jez.wait(500)
        lanterIds[i] = await placeLantern(COLOR_NAMES[i], COLOR_VALUES[i], RADIANS, CENTER.x, CENTER.y, LANTERN_DIST,
            { traceLvl: TL })
    }
    if (TL > 1) jez.trace(`${TAG} lanterIds`, lanterIds)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Add a spell to allow livings to attempt to relight ceremonial lanterns
    //
    const LIVINGS = getLiving({traceLvl: TL})
    if (LIVINGS.length === 0) return jez.badNews(`${TAG} No LIVINGS fround on scene`, 'w')
    for (let i = 0; i < LIVINGS.length; i++) {
        if (TL > 1) jez.trace(`${TAG} Processing friendly #${i + 1} ${LIVINGS[i].name}`);
        let fToken = LIVINGS[i];
        await jez.deleteItems(TEMP_ABILITY, "feat", fToken);
        await jez.itemAddToActor(fToken, TEMP_ABILITY)
        jez.badNews(`Added '${TEMP_ABILITY}' as a Feature/Active Ability to ${fToken.name}`, "i");
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `Elements of the Vampyr Binding Ritual have been placed.`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function placeAmber(actorName, X, Y, options = {}) {
    const FUNCNAME = "placeAmber(actorName, X, Y, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'actorName', actorName, 'X', X, 'Y', Y, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
    let returned = await warpgate.spawnAt({ x: X, y: Y }, actorName, {}, {}, OPTIONS);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return returned;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function placeLantern(colorName, colorValue, radians, centerX, centerY, lanternDist, options = {}) {
    const FUNCNAME = "placeLantern(colorName, colorValue, radians, centerX, centerY, lanternDist, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'colorName', colorName, 'colorValue', colorValue,
        'radians', radians, 'centerX', centerX, 'centerY', centerY, 'lanternDist', lanternDist, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Calculate X, Y coordinates as offsets to center position
    //
    const FRAC_X = Math.sin(radians)
    const FRAC_Y = Math.cos(radians)
    const X = FRAC_X * lanternDist * GRID_SIZE + centerX
    const Y = FRAC_Y * lanternDist * GRID_SIZE + centerY
    if (TL > 1) jez.trace(`${TAG} Position {${FRAC_X}, ${FRAC_Y}} {${FRAC_X}, ${FRAC_Y}}`)
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    let updates = {
        actor: {
            'name': `Ceremonial Lantern - ${colorName}`,
            'img': `Tiles_JGB/Terrain/Lantern_Ceremonial/Lantern-Ceremony-${colorName}.png`
        },
        token: {
            'name': `Ceremonial Lantern - ${colorName}`,
            'light.color': `${colorValue}`,
            'displayName': 0,
            'img': `Tiles_JGB/Terrain/Lantern_Ceremonial/Lantern-Ceremony-${colorName}.png`
        },
    }
    if (TL > 1) jez.trace(`${TAG} updates`, updates)
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    //
    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
    if (TL > 1) jez.trace(`${TAG} OPTIONS`, OPTIONS)
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    //
    let returned = await warpgate.spawnAt({ x: X, y: Y }, BASE_NAME, updates, {}, OPTIONS);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return returned;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Return an array of Token5e's representing all of the living creatures in the scene.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
 function getLiving(options = {}) {
    const FUNCNAME = "getLiving(options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Function constants & variables
    //
    const NOT_LIVING_NAMES = ['Amber Block', 'Torch']
    const NOT_LIVING_SUBNAMES = [ 'Dancing Light', 'Ceremonial Lantern - ']
    const NOT_LIVING_RACES = [ 'undead', 'construct']
    const TOKENS = canvas.tokens.placeables
    if (TL > 3) jez.trace(`${TAG} Tokens to choose from`, TOKENS)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Filter the tokens on the scene against our filter
    //
    const LIVINGS = TOKENS.filter(checkLiving)
    if (TL > 3) jez.trace(`${TAG} LIVINGS found`, LIVINGS)
    if (LIVINGS.length === 0) return jez.badNews(`${TAG} No LIVINGS fround on scene`, 'w')
    //-------------------------------------------------------------------------------------------------------------------------------
    // Local function used by the filter method
    //
    function checkLiving(subject) {
        if (NOT_LIVING_NAMES.includes(subject.name)) return false
        for (let i = 0; i < NOT_LIVING_SUBNAMES.length; i++) if (subject.name.startsWith(NOT_LIVING_SUBNAMES[i])) return false
        const RACE = jez.getRace(subject)
        for (let i = 0; i < NOT_LIVING_RACES.length; i++) if (RACE.startsWith(NOT_LIVING_RACES[i])) return false
        if (subject.actor.data.data.attributes.hp.value > 0) return true
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return(LIVINGS);
}