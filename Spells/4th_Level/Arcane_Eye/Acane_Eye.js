const MACRONAME = "Arcane_Eye.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Call a token via warpgate, grant it dark vision.
 * 
 * Built from the MidiSRD_Arcane_Eye macro.  My version renames the token but doesn't do anything 
 * else notably different.
 * 
 * 07/15/22 0.1 Creation of Macro
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
const EYE_TEXTURE = "modules/jb2a_patreon/Library/Generic/Magic_Signs/DivinationCircleLoop_02_Dark_Blue_800x800.webm"

//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn(args, EYE_TEXTURE);                 // DAE Application
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
 * Perform the code that runs when this macro is removed by DAE, set Off
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff() {
    const FUNCNAME = "doOff()";
    const FNAME = FUNCNAME.split("(")[0]

    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    await MidiMacros.deleteTokens("ArcaneEye", actor)
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${FNAME} | More Detailed Trace Info.`)
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set On
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOn(args, texture) {
    const FUNCNAME = "doOn(args, texture)";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL === 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`, "args", args, "texture", texture);

    if (!game.modules.get("warpgate")?.active) return jez.badNews("Please enable the Warp Gate module", "error")
    const { actor, token, lArgs } = MidiMacros.targets(args)

    const ALLOWED_UNITS = ["", "ft", "any"];

    if (!game.actors.getName("MidiSRD")) { await Actor.create({ name: "MidiSRD", type: "npc" }) }
    const sourceItem = await fromUuid(lArgs.origin)
    texture = texture || sourceItem.img
    let updates = {
        token: {
            name: `${aToken.name}'s Arcane Eye`,
            img: texture,
            dimVision: 30,
            scale: 0.7,
            flags: {
                "midi-srd": {
                    ArcaneEye: {
                        ActorId: actor.id
                    }
                }
            }
        },
        actor: {
            name: `${aToken.name}'s Arcane Eye`
        }
    }
    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
    //------------------------------------------------------------------------------------------------
    // COOL THING:  Macro that runs displays a range name below the summoning crosshairs
    //
    const MAX_RANGE = jez.getRange(aItem, ALLOWED_UNITS) ?? 30
    // let { x, y } = await jez.warpCrosshairs(token, MAX_RANGE, texture, aItem.name, {}, -1)
    let { x, y } = await jez.warpCrosshairs(token, MAX_RANGE, texture, aItem.name, {}, -1, {traceLvl: TL})
    // let { x, y } = await jez.warpCrosshairs(token, MAX_RANGE, texture)
    jez.suppressTokenMoldRenaming(500,{traceLvl:TL}) // Default wait is/was 500ms which is plenty
    await jez.wait(100)             // Wait a bit for TokenMold to be suppressed
    await warpgate.spawnAt({ x, y }, "MidiSRD", updates, { controllingActor: actor }, OPTIONS);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    if (!game.modules.get("warpgate")?.active) return jez.badNews("Please enable the Warp Gate module", "error")
    //-----------------------------------------------------------------------------------------------
    // post summary effect message
    //
    msg = `${aToken.name} creates an invisible, magical eye that hovers in the air for the duration 
    providing darkvision with 30 feet.  See spell description for more.`
    postResults(msg)
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}