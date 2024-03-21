const MACRONAME = "Armor_of_Agathys.0.1.js"
const TL = 0;                               // Trace Level for this macro
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Partial automation for the Armor of Agathys spell.
 * 
 *   You gain 5 temporary hit points per level of spell for the duration (1 hour). 
 * 
 *   If a creature hits you with a melee attack while you have these hit points, the creature takes 5 cold damage.
 * 
 *   At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, both the temporary hit points and the 
 *   cold damage increase by 5 for each slot.
 * 
 * This is only partially automated.  
 *   - Effect is NOT sometimes removed when the temp hp is exhausted, players should watch this.  
 *     A pop up is displayed reminding the player when the spell is cast of hos this works (doOnUse)
 *   - Effect has its CE_DESC updated to have relevant info (doOnUse)
 *   - Add a VFX tied to the effect as part of the DAE applied
 *   - Item card adds the temp hp to the caster (@spells.pact.level * 5 with Healing (temporary))
 *   - Temp item is added to the caster to do damage (doOn), item to do damage and check existance of temp hp
 *   - Temp item is deleted when effect is removed (doOff)
 *   - Each turn check to make sure temp HP remain, if all gone, delete our DAE effect (doEach)
 * 
 * 11/17/22 0.1 Creation of Macro
 * 11/18/23 0.2 Added handling of Armor of Akroma as spell name which does radiant instead of cold damage
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
const EFFECT_NAME = "Armor of Agathys"
const TEMP_ITEM = "Armor of Agathys Damage"
const TEMPLATE_NAME = `%%${TEMP_ITEM}%%`
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "on") await doOn({ traceLvl: TL });                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "each") doEach({ traceLvl: TL });					     // DAE everyround
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
    //-------------------------------------------------------------------------------------------------------------------------------
    // Display pop-up explaining manual elements of this spell
    //
    new Dialog({
        title: `${EFFECT_NAME} Implementation`,
        content: `<p>This spell adds <b>${args[0].damageTotal} temp HP</b> to <b>${aToken.name}</b>.  It also creates a temporary 
            item, <b>${TEMP_ITEM}</b>, that should be <b>manually used</b> when ${aToken.name} receives melee damage to inflict the 
            retalitory damage.
            </p><p>
            The active effect (${EFFECT_NAME}) may need to be manually removed when the applied temp HP are exhausted.</p>`,
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: 'Ok',
            },
        }
    }).render(true);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Add CE_DESC to the effect applied to caster
    //
    ceDesc = `While Temp HP Remains, ${args[0].damageTotal} cold damage manually applied to melee attackers`
    await jez.setCEDesc(aActor, EFFECT_NAME, ceDesc, { traceLvl: TL });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `A protective magical force surrounds ${aToken.name}, manifesting as a spectral frost that covers ${aToken.name}.`
    postResults(msg)
    if (TL > 0) jez.log(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set On
 * This runs on actor that has the affected applied to it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOn(options = {}) {
    const FUNCNAME = "doOn(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Delete any pre-existing temp spells
    //
    await jez.deleteItems(TEMP_ITEM, "spell", aToken);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the item's name and extract the comments from the description
    //
    if (TL > 2) jez.trace(`${TAG} Adding ${TEMPLATE_NAME} to ${aToken.name}`);
    await jez.itemAddToActor(aToken, TEMPLATE_NAME)
    let itemUpdate = {
        name: TEMP_ITEM,
    }
    await jez.itemUpdateOnActor(aToken, TEMPLATE_NAME, itemUpdate, "spell")
    //-------------------------------------------------------------------------------------------
    // Grab the data for the new item from the actor
    //
    let getItem = await jez.itemFindOnActor(aToken, TEMP_ITEM, "spell");
    //-------------------------------------------------------------------------------------------
    // Update the description field
    //
    let description = getItem.data.data.description.value
    description = description.replace(/%ATOKEN.NAME%/g, `${aToken.name}`);         
    description = description.replace(/%DAMAGE%/g, `${args[1]*5}`);   
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build a new itemUpdate Object
    //
    itemUpdate = {
        data: { 
            description: { 
                value: description 
            },
            damage: {
                parts: [[`${args[1]*5}[cold]`,'cold']]
            }
        },  
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the item with new information
    //
    await jez.itemUpdateOnActor(aToken, TEMP_ITEM, itemUpdate, "spell")
    //-------------------------------------------------------------------------------------------------------------------------------
    // Comments
    //
    if (TL > 3) jez.log(`${TAG} | More Detailed Trace Info.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
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
    //-------------------------------------------------------------------------------------------------------------------------------
    // Delete any existing temp spells
    //
    await jez.deleteItems(TEMP_ITEM, "spell", aToken);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Post completion message
    //
    msg = `Ice shield around ${aToken.name} fades away, its magic drained.`
    let title = `Armor of Agathys Fades`
    jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img, msg: msg, title: title, token: aToken})
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Each turn check to see if temp hp remain.  If they don't delete the DAE effect
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doEach(options = {}) {
    const FUNCNAME = "doEach(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // If temp HP has fallen to (or below, how that would happen I have no idea) zero, remove the DAE effect
    //
    if (aActor.data.data.attributes.hp.temp <= 0 ) {
        let aEffect = await aActor?.effects?.find(ef => ef?.data?.label === EFFECT_NAME)
        if (aEffect) await aEffect.delete();
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return true;
}