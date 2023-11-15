const MACRONAME = "Flame_Blade.0.1.js"
const TL = 5;                               // Trace Level for this macro
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implment the Flame Blade spell, key steps:
 * 
 * 1. Copy the Flame Blade from items directory to this actor
 * 2. Scale flame blade for upcast spell
 * 3. Link the concentration and flame blade effect so they end together.
 * 4. Delete the flame blade item when the effect is removed (doOff)
 * 
 * 11/15/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.log(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
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
const SPELL_LEVEL = L_ARG?.spellLevel;
const SPELL_NAME = `Flame Blade`
const TEMPLATE_NAME = `%%${SPELL_NAME}%%`
const ATTACK_ITEM = `${aToken.name}'s ${SPELL_NAME}`
const NUM_DICE = 2 + Math.floor(SPELL_LEVEL/2) // 3 at 2nd level, 4 at 4th level, and so on
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
// if (args[0] === "on") await doOn({ traceLvl: TL });                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.log(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    // This is always cast of the aActor
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    if (!await preCheck()) return (false);
    //----------------------------------------------------------------------------------------------------------
    // Remove any preexisting copies of the temporary item
    //
    await jez.deleteItems(ATTACK_ITEM, "weapon", aActor);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Slap the template item onto the actor
    //
    await jez.itemAddToActor(aToken, TEMPLATE_NAME)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the item's name and extract the comments from the description
    //
    let itemUpdate = {
        name: ATTACK_ITEM,                 // Change to actor specific name for temp item
    }
    await jez.itemUpdateOnActor(aToken, TEMPLATE_NAME, itemUpdate, "weapon")
    //-------------------------------------------------------------------------------------------------------------------------------
    // Grab the data for the new item from the actor
    //
    let getItem = await jez.itemFindOnActor(aToken, ATTACK_ITEM, "weapon");
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the description field, replacing tokens
    //
    let description = getItem.data.data.description.value
    description = description.replace(/%NUMDICE%/g, `${NUM_DICE}`);         // Replace %NUMDICE%
    description = description.replace(/%ATOKEN%/g, `${aToken.name}`);       // Replace %ATOKEN%
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build a new itemUpdate Object
    //
    itemUpdate = {
        data: { 
            description: { 
                value: description 
            },
            damage: {
                parts: [[`${NUM_DICE}d8[fire]`,'fire']]
            }
        },  
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the item with new information
    //
    await jez.itemUpdateOnActor(aToken, ATTACK_ITEM, itemUpdate, "weapon")
    //-------------------------------------------------------------------------------------------------------------------------------
    // Post about item added
    //
    jez.badNews(`Added ${ATTACK_ITEM} as a weapon to ${aToken.name}`, "i");
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pair the new debuff with concentration
    //  
    // await jez.wait(250)
    jez.pairEffectsAsGM(aActor, "Concentrating", aActor, SPELL_NAME)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `${ATTACK_ITEM} springs into existance and is now wielded by ${aToken.name}`
    postResults(msg)
    if (TL > 0) jez.log(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //----------------------------------------------------------------------------------------------------------
    // Remove any preexisting copies of the temporary item
    //
    await jez.deleteItems(ATTACK_ITEM, "weapon", aActor);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return;
}