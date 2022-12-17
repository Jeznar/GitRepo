const MACRONAME = "Plant_Growth.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * This macro asks the user if they are using the instant or long termm version of this spell.  If it is the instant version, 
 * a tile with a green transmutation effect will be placed as a marker, if the 8 hour version is used, the macro ends and the GM
 * will need to handle the effects.
 * 
 * 12/12/22 0.1 Creation of Macro
 * 12/13/22 0.2 Added check for cancellation at dialog and refund of spell slot
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL>0) jez.trace(`${TAG} === Starting ===`);
if (TL>1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor; 
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
const ALLOWED_UNITS = ["", "ft", "any"];
const MAX_RANGE = jez.getRange(aItem, ALLOWED_UNITS) ?? 150
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//

//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          // Midi ItemMacro On Use
if (TL>1) jez.trace(`${TAG} === Finished ===`);
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
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Simple dialog to select the mode of this spell to be used
    //
    const Q_TITLE = `One Action Version of Plant Growth?`
    let qText = `<p>Plant Growth can be used in a single action mode which will cause existing plants to grow wildly or as an eight hour 
    casting to greatly enhance the fertility of the sole in an area.</p>
    <p>If you want to cast the single action version, please click the <b>"Yes"</b> button.</p>
    <p>If you want to cast the 8 hour version, please click the <b>"No"</b> button.</p>`
    let confirmation = await Dialog.confirm({ title: Q_TITLE, content: qText, });
    if (confirmation === null) {
        if (TL > 3) jez.trace(`${TAG} Dialog choice was Close.`,confirmation)
        jez.refundSpellSlot(aToken, L_ARG.spellLevel, { traceLvl: TL, quiet: false, spellName: aItem.name })
        msg = `Spell casting was cancelled.`
        postResults(msg)
        return false
    }
    if (!confirmation) {
        if (TL > 3) jez.trace(`${TAG} Dialog choice was no.`,confirmation)
        msg = `Casting will continue for up to eight hours.`
        postResults(msg)
        return false
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pick a spot for the effect and place it
    //
    const EFFECT_CENTER = await crossHairs(aToken, MAX_RANGE, {traceLvl:TL})
    placeTile(EFFECT_CENTER, {traceLvl:TL})
    //-------------------------------------------------------------------------------------------------------------------------------
    // Thats all
    //
    msg = `All normal plants in affected area become thick and overgrown. A creature moving through the area must spend 4 feet of 
    movement for every 1 foot it moves. ${aToken.name} can exclude one or more areas of any size within from being affected.`
    postResults(msg)
    if (TL>0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Pick a spot for the center of the spell
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 async function crossHairs(origin, range,  options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,'origin', origin, 'range', range, "options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let cachedDistance = 0;
    const ICON = aItem.img
    const WARN = 'Icons_JGB/Misc/Warning.webm'
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    const checkDistance = async (crosshairs) => {
        while (crosshairs.inFlight) {
            //wait for initial render
            await jez.wait(100);
            const ray = new Ray(origin, crosshairs);
            const distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0];
            //only update if the distance has changed
            if (cachedDistance !== distance) {
                cachedDistance = distance;
                if (distance > range) crosshairs.icon = WARN;
                else crosshairs.icon = ICON;
                crosshairs.draw();
                crosshairs.label = `${distance}/150 ft`;
            }
        }
    }
    const location = await warpgate.crosshairs.show(
        {
            // swap between targeting the grid square vs intersection based on token5e's size
            interval: 1,
            size: 1,
            icon: ICON,
            label: '0/150 ft.',
        },
        { show: checkDistance },
    );
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    if (TL > 1) jez.trace(`${TAG} location ==>`, location)
    if (location.cancelled || cachedDistance > range) {
        if (TL>1) jez.trace(`${TAG} Location selected: ${location.x}, ${location.y} is out of range`, location)
        return;
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    if (TL>1) jez.trace(`${TAG} Place effect at: ${location.x}, ${location.y}`, location)
    // runVFX(location, { traceLvl: TL })
    return location
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Place a tile
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
async function placeTile(center, options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'center', center, "options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    const IMAGE1 = "modules/jb2a_patreon/Library/Generic/Magic_Signs/TransmutationCircleIntro_02_Dark_Green_800x800.webm"
    const IMAGE2 = "modules/jb2a_patreon/Library/Generic/Magic_Signs/TransmutationCircleLoop_02_Dark_Green_800x800.webm"
    const GRID_SIZE = canvas.scene.data.grid;   // Stash the grid size
    const EFFECT_SIZE = 40                      // Effect diameter
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build the data object for the tile to be created
    //
    let tileProps = {
        x: center.x - GRID_SIZE * EFFECT_SIZE/2,     
        y: center.y - GRID_SIZE * EFFECT_SIZE/2,
        img: IMAGE1,
        width: GRID_SIZE*EFFECT_SIZE,                     // VFX should occupy 2 tiles across
        height: GRID_SIZE*EFFECT_SIZE,                    // ditto
        overhead: false,
        occlusion: {
            alpha: 1,
            mode: 3,
        },
        alpha: 0.3                            // Opacity of our placed tile 0 to 1.0  
    };
    //-------------------------------------------------------------------------------------------------------------------------------
    // Call library function to create the new tile, catching the id returned.  
    //
    const TILE_ID1 = await jez.tileCreate(tileProps)
    if (TL>1) jez.trace(`${TAG} Tile ID1`,TILE_ID1)
    await jez.wait(2000)
    tileProps.img = IMAGE2
    const TILE_ID2 = await jez.tileCreate(tileProps)
    await jez.wait(1000)
    jez.tileDelete(TILE_ID1, {traceLvl:TL})
    if (TL>1) jez.trace(`${TAG} Tile ID1`,TILE_ID2)
    return TILE_ID2
}