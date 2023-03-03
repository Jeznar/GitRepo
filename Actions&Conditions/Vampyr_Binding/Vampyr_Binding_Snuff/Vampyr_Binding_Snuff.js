const MACRONAME = "Vampyr_Binding_Snuff.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Snuff one of the ceremonial lanterns, if last one, announce failure of rutual
 * 
 * 12/30/22 0.1 Creation of Macro
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
const BASE_NAME = 'Ceremonial Lantern'
const COLOR_NAMES = ['Purple', 'Yellow', 'Blue', 'Red', 'Green']
const SCENE_ID = game.scenes.viewed.id
let litLanterns = []
const AMBER_ACTOR_NAME = 'Amber Block'
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
 * 
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

    //-------------------------------------------------------------------------------------------------------------------------------
    // Find lanterns that are still lit and buld array of their id's
    //
    if (TL > 1) jez.trace(`${TAG} Empty Lit Lanterns Array`,litLanterns)
    for (let i = 0; i < COLOR_NAMES.length; i++) {
        let lantern = canvas.tokens.placeables.find(ef => ef.name === `Ceremonial Lantern - ${COLOR_NAMES[i]}`)
        if (TL > 1) jez.trace(`${TAG} ${i} Lantern `, lantern)
        if (!lantern) {
                jez.badNews(`${TAG} Could not find 'Ceremonial Lantern - ${COLOR_NAMES[i]}'`)
                continue
        }
        if (lantern.data.light.bright) litLanterns.push(lantern)
        if (TL > 2) jez.trace(`${TAG} ${i} Lantern `,
            'Name   ',lantern.name,
            'img    ',lantern.data.img,
            'bright ',lantern.data.light.bright,
            'Lantern',lantern,
            'Count  ', litLanterns.length,
            'array  ', litLanterns)
    }
    if (TL > 1) jez.trace(`${TAG} litLanterns`,litLanterns)
    if (!litLanterns.length) return jez.badNews('All lanterns already snuffed','i')
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pick lantern to snuff
    //
    let sel = Math.floor(Math.random() * litLanterns.length); // Returns a random integer from 0 to (litLanterns.length - 1)
    let updates = [];
    updates.push({
        _id: litLanterns[sel].id,
        'light.bright': 0, // was 20
        'light.dim': 0,    // was 40
        img: 'Tiles_JGB/Terrain/Lantern_Ceremonial/Lantern-Ceremony-Dark.png'
    });
    await jez.updateEmbeddedDocs("Token", updates)  
    //-------------------------------------------------------------------------------------------------------------------------------
    // If that was the last token, run game outro VFX....
    //
    if (TL > 1) jez.trace(`${TAG} ${litLanterns.length}, Lit Lanterns`, litLanterns);
    if (litLanterns.length <= 1) {
        let amberBlockToken = canvas.tokens.placeables.find(ef => ef.name === AMBER_ACTOR_NAME)
        if (!amberBlockToken) return jez.badNews(`${TAG} Could not find ${AMBER_ACTOR_NAME}`, 'e')
        runOutroVFX(amberBlockToken)
        msg = `Vampyr has been released from his bindings.  Releasing a tremendous explosion....`
        postResults(msg)
        return
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `${litLanterns[sel].name} has been snuffed by coalescing mists of Vampyr.`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
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
            'name': `Cermonial Lantern - ${colorName}`,
        },
        token: {
            'name': `Cermonial Lantern - ${colorName}`,
            'light.color': `${colorValue}`,
            'displayName': 0,
            'img': `Tiles_JGB/Terrain/Lantern_Cermonial/Lantern-Ceremony-${colorName}.png`
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
 * Run some VFX on the target
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
 function runOutroVFX(target) {
    const VFX_FILE = 'modules/jb2a_patreon/Library/3rd_Level/Call_Lightning/High_Res/CallLightning_01_BlueOrange_2400x2400.webm'
    new Sequence()
        .effect()
        .file(VFX_FILE)
        .attachTo(target)
        .scale(2)
        .fadeIn(5000)
        .opacity(1)
        .persist()
        .belowTokens(false)
        .name('Game End VFX') // Give the effect a uniqueish name
        .play();
}