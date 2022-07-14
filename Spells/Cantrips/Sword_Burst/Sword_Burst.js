const MACRONAME = "Sword_Burst.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * You create a momentary circle of spectral blades that sweep around you. All other creatures within 
 * 5 feet of you must succeed on a Dexterity saving throw or take 1d6 force damage.
 * 
 * This spells damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th 
 * level (4d6).
 * 
 * 07/13/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TL = 5;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
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
let failSaves = []  // Array to contain the tokens that failed their saving throws
let madeSaves = []  // Array to contain the tokens that made their saving throws
let madeNames = ""
let failNames = ""
const SAVE_TYPE = "dex"
const SAVE_DC = aActor.data.data.attributes.spelldc;
const DAMAGE_TYPE = "force"
const DAMAGE_DICE = "d6"
let tTokenCnt = 0
//---------------------------------------------------------------------------------------------------
// Scale the damage dice based on the level of the caster
//
let casterLevel = jez.getCharLevel(aToken)
jez.log("casterLevel", casterLevel)
let numDice = 1
if (casterLevel >= 5) numDice++
if (casterLevel >= 11) numDice++
if (casterLevel >= 17) numDice++
const NUM_DICE = numDice
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]

    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]

    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Figure out our maximum range (it should likely be 5 feet, but will read item card)
    //
    const ALLOWED_UNITS = ["", "ft", "any"];
    const MAX_RANGE = jez.getRange(aItem, ALLOWED_UNITS)
    if (!MAX_RANGE) return jez.badNews(`Range is 0 or incorrect units on ${aItem.name}`, "error")
    if (TL > 2) jez.trace(`Maximum range is ${MAX_RANGE} feet`)
    //-----------------------------------------------------------------------------------------------
    // Find targets that are within MAX_RANGE by checking all tokens on the map and build target list 
    //
    let tTokens = []
    let allTokens = canvas.tokens.placeables
    for (let i = 0; i < allTokens.length; i++) {
        if (jez.inRange(aToken, allTokens[i], MAX_RANGE)) {
            if (aToken != allTokens[i]) {
                tTokenCnt++
                tTokens.push(allTokens[i])
            }
            if (TL > 2) jez.trace(`${allTokens[i].name} is in range`);

        }
        else if (TL > 2) jez.trace(`${allTokens[i].name} is not in range`);
    }
    if (tTokens.length === 0) return jez.badNews("No targets within range", "info")
    //---------------------------------------------------------------------------------------------
    // Proceed with the in range tokens -- roll saves
    //
    const FLAVOR = "Not Shown"
    for (let i = 0; i < tTokens.length; i++) {
        if (TL > 2) jez.trace(`${i}) Roll a save for ${tTokens[i].name}`)
        let save = (await tTokens[i].actor.rollAbilitySave(SAVE_TYPE, { FLAVOR, chatMessage: false, fastforward: true }));
        if (TL > 3) jez.trace(`${tTokens[i].name} saving throw ${save.total}`, save)
        if (save.total < SAVE_DC) {
            if (TL > 2) jez.trace(`${tTokens[i].name} failed: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            failSaves.push(tTokens[i])
            failNames += `<b>${tTokens[i].name}</b>: ${save.total} (${save._formula})<br>`
        } else {
            if (TL > 2) jez.trace(`${tTokens[i].name} saved: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            madeSaves.push(tTokens[i])
            madeNames += `<b>${tTokens[i].name}</b>: ${save.total} (${save._formula})<br>`
        }
    }
    //---------------------------------------------------------------------------------------------
    // Roll up some damage 
    //
    jez.log(`${failSaves.length} Tokens failed saves, need damage applied`)
    let damageRoll = new Roll(`${NUM_DICE}${DAMAGE_DICE}`).evaluate({ async: false });
    game.dice3d?.showForRoll(damageRoll);
    if (TL > 2) jez.trace("damageRoll", damageRoll)
    //---------------------------------------------------------------------------------------------
    // If one or more target failed its save Apply damage to Tokens that failed saves. 
    //
    // Freeze suggested an alternitive damage function on discord. 
    // https://discord.com/channels/170995199584108546/699750150674972743/986703175279079485
    //
    let targets = new Set();
    for (let i = 0; i < failSaves.length; i++) targets.add(failSaves[i]);
    if (TL > 3) jez.trace("targets set", targets)
    await MidiQOL.applyTokenDamage([{ damage: damageRoll.total, type: DAMAGE_TYPE }], damageRoll.total, targets)
    //---------------------------------------------------------------------------------------------
    // Launch a VFX onto each of the targets that failed their saves. 
    //
    for (let i = 0; i < failSaves.length; i++) {
        runVFX(failSaves[i]);
        await jez.wait(500+Math.floor(Math.random() * 500))
    }
    //---------------------------------------------------------------------------------------------
    // Craft results message and post it.
    //
    let chatMessage = await game.messages.get(args[args.length - 1].itemCardId);
    await jez.wait(50)
    //    
    if (madeNames) {
        msg = `<b><u>Successful ${SAVE_TYPE.toUpperCase()} Save</u></b> vs DC${SAVE_DC}<br>${madeNames}`
        await jez.wait(50)
        jez.addMessage(chatMessage, { color: "darkgreen", fSize: 14, msg: msg, tag: "damage" })
    }
    //
    if (failNames) {
        msg = `<b><u>Failed ${SAVE_TYPE.toUpperCase()} Save</u></b> vs DC${SAVE_DC}<br>${failNames}`
        await jez.wait(50)
        jez.addMessage(chatMessage, { color: "darkred", fSize: 14, msg: msg, tag: "damage" })
    }
    await jez.wait(50)
    //
    msg = `Total of ${tTokenCnt} target(s) within ${MAX_RANGE} feet of ${aToken.name}.  Those that 
    failed saves take ${damageRoll.total} ${DAMAGE_TYPE} damage from ${NUM_DICE}${DAMAGE_DICE}.<br>`
    jez.addMessage(chatMessage, { color: "darkblue", fSize: 14, msg: msg, tag: "damage" })
    await jez.wait(50)
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}
/***************************************************************************************************
 * Perform the VFX code that runs when the mace hits a special target
 ***************************************************************************************************/
 async function runVFX(token1) {
    const VFX_NAME = `${MACRO}`
    const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Melee/Sword01_*_Regular_Yellow_800x600.webm"
    const VFX_OPACITY = 1.0;
    const VFX_SCALE = 0.4;
    new Sequence()
    .effect()
        .file(VFX_LOOP)
        .atLocation(token1)     // Effect will appear at  template, center
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .name(VFX_NAME)         // Give the effect a uniqueish name
    .play();
    await jez.wait(100)         // Don't delete till VFX established
}