const MACRONAME = "Vampyr_Psalm6-Amber2.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 6th Psalm:  The ritual lights are encased in a 10 ft. radius orb of thick mist. Creatures may pass the orb freely, 
 *             but light cannot. This prevents characters from seeing which lanterns are lit, and which are snuffed out.
 * 
 * This one needs to do the following:
 * 1. Find all of the ceremonial lanterns
 * 2. For each Lantern
 *    a. Build an array of end points forming a rough circle around the lantern
 *    b. Place light blocking "walls" between each end point
 *    c. attach those end points to the corresponding lantern's token
 * 
 * 01/02/23 0.1 Creation of Macro
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
const GRID_SIZE = canvas.scene.data.grid;   // Stash the grid size
const RADIUS = 2 * GRID_SIZE                // Radius of light blocking circle
const SEG_CNT = 12                           // Number of line segments used to approximate a circle
//-----------------------------------------------------------------------------------------------------------------------------------
// 1. Find all of the ceremonial lanterns
// 
const TOKENS = canvas.tokens.placeables
const LANTERNS = TOKENS.filter(TOKENS => TOKENS.name.startsWith('Ceremonial Lantern - '))
if (TL > 3) jez.trace(`${TAG} Lanterns found`, LANTERNS)
if (LANTERNS.length === 0) return jez.badNews(`${TAG} No Ceremonial Lanterns fround on scene`, 'w')
//-----------------------------------------------------------------------------------------------------------------------------------
// 2. For each Lantern do the things
// 
for (let i = 0; i < LANTERNS.length; i++) {
    const NAME_ATOMS = LANTERNS[i].name.split(' ')
    let eP = []                                      // End points of line segements for this lantern's enclosing circle
    if (TL > 1) jez.trace(`${TAG} Processing lantern #${i + 1} ${NAME_ATOMS[NAME_ATOMS.length - 1]}`);
    //-------------------------------------------------------------------------------------------------------------------------------
    // a. Build an array of end points forming a rough circle around the lantern
    //
    for (let j = 0; j < SEG_CNT; j++) {                     // Loop through the segments calculating starting point of each
        const RADIANS = (j / SEG_CNT) * (2 * Math.PI)       // Distance Around Perimeter * Radians Around Circle
        const FRAC_X = Math.sin(RADIANS)
        const FRAC_Y = Math.cos(RADIANS)
        const X = FRAC_X * RADIUS + LANTERNS[i].center.x
        const Y = FRAC_Y * RADIUS + LANTERNS[i].center.y
        if (TL > 3) jez.trace(`${TAG} Position ${j} {${FRAC_X}, ${FRAC_Y}} {${X}, ${Y}}`)
        eP.push({ x: X, y: Y })
    }
    if (TL > 2) jez.trace(`${TAG} End Points`, eP)
    //-------------------------------------------------------------------------------------------------------------------------------
    // b. Place light blocking "walls" between each end point
    //
    let x0 = eP[0].x
    let y0 = eP[0].y
    let wallDocs = []
    let wallOpts1 = {
        dir: 1,
        light: 20,
        sight: 0,
        sound: 0,
        move: 0
    }
    let wallOpts2 = {
        dir: 2,
        light: 00,
        sight: 20,
        sound: 0,
        move: 0
    }
    for (let j = 1; j < eP.length; j++) {
        if (TL > 2) jez.trace(`${TAG} Line #${j} between {${x0}, ${y0}} and {${eP[j].x}, ${eP[j].y}}`)
        //
        wallOpts1.c = [x0, y0, eP[j].x, eP[j].y]
        const WALL1_DOC = await canvas.scene.createEmbeddedDocuments("Wall", [wallOpts1]);
        if (TL > 3) jez.trace(`${TAG} WALL_DOC`, WALL1_DOC[0])
        wallDocs.push(WALL1_DOC[0])
        //
        wallOpts2.c = [x0, y0, eP[j].x, eP[j].y]
        const WALL2_DOC = await canvas.scene.createEmbeddedDocuments("Wall", [wallOpts2]);
        if (TL > 3) jez.trace(`${TAG} WALL_DOC`, WALL2_DOC[0])
        wallDocs.push(WALL2_DOC[0])
        //
        x0 = eP[j].x
        y0 = eP[j].y
        await jez.wait(10)
    }
    if (TL > 2) jez.trace(`${TAG} Line #${SEG_CNT} between {${x0}, ${y0}} and {${eP[0].x}, ${eP[0].y}}`)
    wallOpts1.c = [x0, y0, eP[0].x, eP[0].y]
    const WALL_DOC = await canvas.scene.createEmbeddedDocuments("Wall", [wallOpts1]);
    if (TL > 3) jez.trace(`${TAG} WALL_DOC`, WALL_DOC[0])
    wallDocs.push(WALL_DOC[0])
    wallOpts2.c = [x0, y0, eP[0].x, eP[0].y]
    const WALL2_DOC = await canvas.scene.createEmbeddedDocuments("Wall", [wallOpts2]);
    if (TL > 3) jez.trace(`${TAG} WALL_DOC`, WALL2_DOC[0])
    wallDocs.push(WALL2_DOC[0])
    //-------------------------------------------------------------------------------------------------------------------------------
    // c. attach those end points to the corresponding lantern's token
    //
    if (TL > 2) jez.trace(`${TAG} Attach Elements`, 'wallDocs', wallDocs, LANTERNS[i].name, LANTERNS[i])
    tokenAttacher.attachElementsToToken(wallDocs, LANTERNS[i], suppresNotification = false)
}
//-----------------------------------------------------------------------------------------------------------------------------------
// 3. Post Results
// 
msg = `The ritual lights are encased in a 10 foot radius orb of thick mist. Creatures may pass the orb freely, but light cannot. 
    This prevents creatures from seeing which lanterns are lit, and which are snuffed out.`
postResults(msg)
//-----------------------------------------------------------------------------------------------------------------------------------
//
//
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
    // Find the ceremonial lanterns, expecting 5, but lets not count on it.
    //

    //-------------------------------------------------------------------------------------------------------------------------------
    // Comments
    //
    if (TL > 3) jez.trace(`${TAG} More Detailed Trace Info.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `Say something useful...`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}