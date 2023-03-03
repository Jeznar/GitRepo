const MACRONAME = "Vampyr_Binding_Cleanup.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * This macro cleansup changes made by the binding ritual
 * 
 * 01/11/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 5;                               // Trace Level for this macro
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
cleanup({ traceLvl: TL })
return
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
 * This macro cleansup changes made by the binding ritual
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function cleanup(options = {}) {
    const FUNCNAME = "cleanup(options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Set Macro variables
    //
    const SPEED_EFFECT = 'Psalm 1'
    const HP_DRAIN = 'Psalm 2'
    const FEAR_EFFECT = 'Frightened of the Mists'
    const CHOCKING_ITEM = 'Speak within Vampyr Mists'
    const MOVEMENT_ITEM = 'Move within Vampyr Mists'
    const RELIGHT_ITEM = 'Relight Vampyr Lantern'
    const LANTERN_NAME = 'Ceremonial Lantern - '
    const SALT_IMG = 'Tiles_JGB/Terrain/Salt_Circle/Salt_Circle.png'
    //--------------------------------------------------------------------------------------------------------------------------------
    //  Function values
    //
    const LIVINGS = getLiving({traceLvl: TL})
    if (LIVINGS.length === 0) return jez.badNews(`${TAG} No LIVINGS fround on scene`, 'w')
    //--------------------------------------------------------------------------------------------------------------------------------
    // Loop through LIVINGS removing any SPEED_EFFECT
    //
    for (let i = 0; i < LIVINGS.length; i++) {
        let existingEffect = await LIVINGS[i].actor.effects.find(ef => ef.data.label.startsWith(SPEED_EFFECT));
        if (existingEffect) await existingEffect.delete();
    }
    //--------------------------------------------------------------------------------------------------------------------------------
    // Loop through LIVINGS removing any HP_DRAIN
    //
    for (let i = 0; i < LIVINGS.length; i++) {
        let existingEffect = await LIVINGS[i].actor.effects.find(ef => ef.data.label.startsWith(HP_DRAIN));
        if (existingEffect) await existingEffect.delete();
    }
    //--------------------------------------------------------------------------------------------------------------------------------
    // Loop through LIVINGS removing any FEAR_EFFECT
    //
    for (let i = 0; i < LIVINGS.length; i++) {
        let existingEffect = await LIVINGS[i].actor.effects.find(ef => ef.data.label.startsWith(FEAR_EFFECT));
        if (existingEffect) await existingEffect.delete();
    }
    //--------------------------------------------------------------------------------------------------------------------------------
    // Loop through LIVINGS removing any CHOCKING_ITEM temporay abilities
    //
    for (let i = 0; i < LIVINGS.length; i++) await jez.deleteItems(CHOCKING_ITEM, "feat", LIVINGS[i]);
    //--------------------------------------------------------------------------------------------------------------------------------
    // Loop through LIVINGS removing any MOVEMENT_ITEM temporay abilities
    //
    for (let i = 0; i < LIVINGS.length; i++) await jez.deleteItems(MOVEMENT_ITEM, "feat", LIVINGS[i]);
    //--------------------------------------------------------------------------------------------------------------------------------
    // Loop through LIVINGS removing any RELIGHT_ITEM temporay abilities
    //
    for (let i = 0; i < LIVINGS.length; i++) await jez.deleteItems(RELIGHT_ITEM, "feat", LIVINGS[i]);
    //--------------------------------------------------------------------------------------------------------------------------------
    //  Loop through lanterns, deleting them and any attached walls
    //
    const TOKENS = canvas.tokens.placeables
    const LANTERNS = TOKENS.filter(TOKENS => TOKENS.name.startsWith(LANTERN_NAME))
    if (TL > 3) jez.trace(`${TAG} Lanterns found`, LANTERNS)
    // if (LANTERNS.length === 0) return jez.badNews(`${TAG} No Ceremonial Lanterns fround on scene`, 'w')
    for (let i = 0; i < LANTERNS.length; i++) {
        warpgate.dismiss(LANTERNS[i].id, game.scenes.viewed.id)
        // if (TL > 3) jez.trace(`${TAG} Walls:`,LANTERNS[i].data.flags['token-attacher'].attached.Wall)
        // jez.deleteEmbeddedDocs("Wall",LANTERNS[i].data.flags['token-attacher'].attached.Wall,{traceLvl: TL})
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //  Find a tile using SALT_IMG from game.scenes.current.tiles and delete it.
    //
    if (TL > 3) jez.trace(`${TAG} Tiles on scene`,game.scenes.current.tiles)
    let saltTile = game.scenes.current.tiles.find(ef => ef.data.img === SALT_IMG) ?? null
    if (TL > 2) jez.trace(`${TAG} Salt Tile`,saltTile)
    saltTile.delete()
    //-------------------------------------------------------------------------------------------------------------------------------
    // 6. Post Results
    // 
    msg = `Binding Ritual has been cleanedup`
    postResults(msg)
    return
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