const MACRONAME = "Etheral_Jaunt.0.2.js";
/*****************************************************************************************
 * Add text to the Itemcard for Ether Jaunt.
 * 
 * 12/18/21 0.1 JGB Creation
 * 05/11/22 0.2 JGB Update for 9.x
 *  ******************************************************************************************/
const LAST_ARG = args[args.length - 1];
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension

//let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
//let aItem;          // Active Item information, item invoking this macro
//if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
//if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
jez.log("---------------------------------------------------------------------------");
jez.log(`Starting: ${MACRONAME}`, "aToken.name", aToken.name)
for (let i = 0; i < args.length; i++) jez.log(`    args[${i}]`, args[i]);
if (args[0]?.tag === "OnUse") doOnUse();   			// Midi ItemMacro On Use
if (args[0] === "off") await doOff();                   // DAE removal
//---------------------------------------------------------------------------------------
// Finish up this bit o'code
//
jez.log(`Finishing: ${MACRONAME}`);
jez.log("---------------------------------------------------------------------------");
/***************************************************************************************
*    END_OF_MAIN_MACRO_BODY
*                                END_OF_MAIN_MACRO_BODY
*                                                             END_OF_MAIN_MACRO_BODY
***************************************************************************************
* Post the results to chat card
***************************************************************************************/
function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/****************************************************************************************
 * Execute code for a ItemMacro onUse
 ***************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log("---------------------------------------------------------------------------");
    jez.log(`Starting ${MACRONAME} ${FUNCNAME}`);
    //---------------------------------------------------------------------------------------------
    // Run the visual effects
    //
    runVFX(aToken)
    //---------------------------------------------------------------------------------------------
    // Hide the plane shifting token
    //
    aToken.document.update({ "hidden": true });
    await jez.wait(1000)
    aToken.refresh()
    //---------------------------------------------------------------------------------------------
    // Post Completion Message
    //
    msg = `<b>${aToken.name}</b> fades to invisibility and enters the 
    @JournalEntry[L6hDTgXyGS80zbsy]{Border Ethereal} plane.`
    postResults(msg);
    jez.log(`Finished ${MACRONAME} ${FUNCNAME}`);
    jez.log("---------------------------------------------------------------------------");
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //---------------------------------------------------------------------------------------------
    // Run the visual effects
    runVFX(aToken)
    await jez.wait(1000)
    await aToken.document.update({ "hidden": false });
    await jez.wait(1000)
    aToken.refresh()
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the VFX code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function runVFX(token1) {
    jez.log("Launch VFX")
    jez.log("args[0]", args[0])
    const FUNCNAME = "runVFX(token1)";
    const VFX_NAME = `${MACRO}`
    const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Portals/Portal_Vortex_Orange_H_400x400.webm"
    const VFX_OPACITY = 1.0;
    const VFX_SCALE = 0.6;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    new Sequence()
        .effect()
        .file(VFX_LOOP)
        .atLocation(token1) 
        .scale(VFX_SCALE)
        .scaleIn(0.25, 1000)    // Expand from 0.25 to 1 size over 1 second
        .rotateIn(180, 1000)    // 1/2 Rotation over 1 second 
        .scaleOut(0.25, 1000)   // Contract from 1 to 0.25 size over 1 second
        .rotateOut(180, 1000)   // 1/2 Counter Rotation over 1 second
        .opacity(VFX_OPACITY)
        .duration(3000)
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(10)             // Fade in for specified time in milliseconds
        .fadeOut(1000)          // Fade out for specified time in milliseconds
        .extraEndDuration(1200) // Time padding on exit to connect to Outro effect
    .play();
    await jez.wait(100)         // Don't delete till VFX established
}