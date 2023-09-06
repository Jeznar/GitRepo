const MACRONAME = "Feather_Kindred.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implement Wereraven Precuror ability to summon kindred ravens to the field and add them to combat initiative
 * 
 * 09/06/23 0.1 Creation
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
    // Constants
    //
    const MINION = "Raven, Undead"
    let summonedMinionId = null
    const FLAG_NAME = `${MACRO}_Counter`;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Obtain the DAE flag that tracks quantity of ravens summoned, which may or may not be set.  If set, update counter to value
    let flagValue = DAE.getFlag(aActor, FLAG_NAME);
    let counter = flagValue ?? 1;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Obtain elevation of summoner so it can be set as initail value on the summoned creatures
    //
    const ELEVATION = aToken.data.elevation
    //-------------------------------------------------------------------------------------------------------------------------------
    // Determine how many ravens are to be summoned
    //
    const NUM_SUMMONED_OBJ = new Roll(`1d4 + 1`).evaluate({ async: false });
    // game.dice3d?.showForRoll(NUM_SUMMONED_OBJ);
    const SPEAKER = ChatMessage.getSpeaker({ actor });
    NUM_SUMMONED_OBJ.toMessage({ speaker: SPEAKER });
    console.log(NUM_SUMMONED_OBJ)
    const NUM_SUMMONED = NUM_SUMMONED_OBJ.total
    //-------------------------------------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    let summonData = await game.actors.getName(MINION)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Loop to summon the appropriate quantity of summoned creatures
    // 
    const LIMIT = counter + NUM_SUMMONED
    for (; counter < LIMIT; counter++) { // We will be using counter as our loop control variable
        //--------------------------------------------------------------------------------------------------
        // Build the dataObject for our summon call, all we need to do is customize the name and elevation
        //
        let argObj = {
            minionName: `Raven ${counter}`,
            img: summonData?.img ?? aItem.img
        }
        argObj.updates = {
            // actor: { name: famName },
            token: {
                name: argObj.minionName,
                elevation: ELEVATION,
            },
        // embedded: { Item: {} } // Need an empty entry here to hold one or more additions
        }
        //--------------------------------------------------------------------------------------------------
        // Do the actual summon
        //
        summonedMinionId = await jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
        if (TL > 0) jez.log(`${TAG} summonedMinionId: `, summonedMinionId)
        //-------------------------------------------------------------------------------------------------------------------------------
        // Add our summons to combat tracker after summoner if in combat
        //
        const ATOKEN_INIT_VALUE = aToken?.combatant?.data?.initiative
        if (TL > 1) jez.trace(`${TAG} ${aToken.name} initiative`, ATOKEN_INIT_VALUE);
        if (ATOKEN_INIT_VALUE) {
            const PRECURSOR_INIT = ATOKEN_INIT_VALUE - counter / 1000;
            await jez.combatAddRemove('Add', summonedMinionId[0], { traceLvl: TL })
            await jez.wait(250)
            await jez.combatInitiative(summonedMinionId[0], { formula: PRECURSOR_INIT, traceLvl: 0 })
        }
        //-------------------------------------------------------------------------------------------------------------------------------
        // Get token data for just summoned critter from its TokenId
        let fetchedToken = canvas.tokens.placeables.find(ef => ef.id === summonedMinionId[0])
        console.log('fetchedToken: ',fetchedToken)
        console.log('fetchedToken.actor.uuid',fetchedToken.actor.uuid)
        //-------------------------------------------------------------------------------------------------------------------------------
        // Add a DAE flag to the summoned Raven so it knows who summoned it.
        //
        await DAE.setFlag(fetchedToken.actor.uuid, 'FeatheredKindredSummonedByActor', aActor.uuid);
        await DAE.setFlag(fetchedToken.actor.uuid, 'FeatheredKindredSummonedByToken', token.id);
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update flag value for next execution
    //
    await DAE.setFlag(aActor, FLAG_NAME, counter);
    postResults(`${aToken.name} has summoned ${NUM_SUMMONED} ravens to serve it.`)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
* Post results to the chat card
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}