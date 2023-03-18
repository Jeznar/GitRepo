const MACRONAME = "Wind_Wall.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Macro updates the convient description associated with the concentration effect and adds a trigger to call this on removal.  
 * on removal of concentration, post a message announcing spell end and remindeing players to remove the manually drawn wind wall.
 * 
 * 03/18/23 0.1 Creation of Macro
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
// Set Macro specific global
//

//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "each") doEach({ traceLvl: TL });					     // DAE everyround
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
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
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the convenientDescription of the Concentrating effect to describe the spell
    //
    const CE_DESC = `Maintaining concentration on ${aItem.name}`
    await jez.setCEDesc(aActor, "Concentrating", CE_DESC, { traceLvl: TL });
    //-------------------------------------------------------------------------------------------------------------------------------
    // Modify our cncentrating effect to call the ItemMacro (this bit of code)
    //
    // Seach the token to find the just added "Concentrating"
    await jez.wait(150)
    let effect = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
    if (TL > 1) jez.trace(`${TAG} **** ${"Concentrating"} found?`, effect)
    if (!effect) return jez.badNews(`"Concentrating" sadly not found on ${aToken.name}`,'e')
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect. 
    effect.data.flags.dae = {
        itemData: aItem,
        macroRepeat: "startEveryTurn",
        stackable: false
    }
    await effect.data.update({ 'flags': effect.data.flags });
    await jez.wait(50)
    const result = effect.data.changes.push({ key: `macro.itemMacro`, mode: jez.CUSTOM, value: `Random_Bit`, priority: 20 })
    if (result) if (TL > 1) jez.trace(`${TAG} Active Effect: "Concentrating" updated!`, result);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `${aToken.name} has called forth a wall of wind, damaging those within it when it appears and blowing upward while it 
    remains.<br><br>Players: Don't forget to manually manage the location of the wind effect.`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doEach(options = {}) {
    const FUNCNAME = "doEach(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Post spell effect message and reminder
    //
    msg = `${aToken.name}'s <a style="box-sizing: border-box; user-select: text;" href="https://www.dndbeyond.com/spells/wind-wall" 
    target="_blank" rel="noopener">Wind Wall</a> is still blowing remember to manually account for its effects.`
    let title = `${aItem.name} Continues`
    jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img, msg: msg, title: title, token: aToken})
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
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
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Post spell end message and reminder
    //
    msg = `${aToken.name}'s ${aItem.name} spell has ended. Remember to cleanup the manually drawn wind wall if needed.`
    let title = `${aItem.name} Ended`
    jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img, msg: msg, title: title, token: aToken})
    return;
}