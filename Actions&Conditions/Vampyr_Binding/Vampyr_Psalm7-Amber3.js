const MACRONAME = "Vampyr_Psalm7-Amber3.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 7th Psalm:  Whenever a character moves, they must succeed on a DC 15 Wisdom saving throw or move half their movement speed in a 
 *             random direction as determined by a d8.
 * 
 * This one needs to do the following:
 * 1. Find all of the friendly tokens
 * 2. Add Temporary Action to perform save specified
 * 3. Post Effect Message
 * 
 * 01/08/23 0.1 Creation of Macro
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
psalm7({ traceLvl: TL })
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
 * 7th Psalm: Whenever a living creature moves, they must succeed on a DC 15 Wisdom saving throw or move half their movement speed 
 *            in a random direction as determined by a d8.
 * 
 * This one needs to do the following:
 * 1. Find all of the friendly tokens
 * 2. Add Temporary Action to perform save specified
 * 3. Post Effect Message
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function psalm7(options = {}) {
    const FUNCNAME = "psalm2(options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Set Macro variables
    //
    const TEMP_ABILITY = 'Move within Vampyr Mists'
    //--------------------------------------------------------------------------------------------------------------------------------
    // 1. Find all of the friendly tokens
    // 
    const LIVINGS = getLiving({traceLvl: TL})
    if (LIVINGS.length === 0) return jez.badNews(`${TAG} No LIVINGS fround on scene`, 'w')
    //-------------------------------------------------------------------------------------------------------------------------------
    // 2. For each friendly token do the things
    // 
    for (let i = 0; i < LIVINGS.length; i++) {
        if (TL > 1) jez.trace(`${TAG} Processing friendly #${i + 1} ${LIVINGS[i].name}`);
        let fToken = LIVINGS[i];
        //---------------------------------------------------------------------------------------------------------------------------
        // a. Remove previously existing temp ability
        //
        await jez.deleteItems(TEMP_ABILITY, "feat", fToken);
        //---------------------------------------------------------------------------------------------------------------------------
        // b. Add temp ability
        //
        await jez.itemAddToActor(fToken, TEMP_ABILITY)
        jez.badNews(`Added '${TEMP_ABILITY}' as a feature, active action to ${fToken.name}`, "i");
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // 3. Post Results
    // 
    msg = `During the remainder of the ritual, any attempt at movement must be preceeded by using the new, feature, active action
    <b>${TEMP_ABILITY}</b>, failure on that ability forces random movement.`
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