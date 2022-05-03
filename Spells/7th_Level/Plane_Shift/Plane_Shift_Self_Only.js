const MACRONAME = "Plane_Shift_Self_Only"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 * 05/02/22 0.2 Updated for FoundryVTT 9.x
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
* Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    // Make sure only one target was targeted.
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        ui.notifications.warn(msg)
        jez.log(msg)
        return(false);
    }
    return (true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    await aToken.document.update({ "hidden": false });
    await jez.wait(1000)
    aToken.refresh()
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //---------------------------------------------------------------------------------------------
    // Run the visual effects
    runVFX(aToken)
    //---------------------------------------------------------------------------------------------
    // Hide the plane shifting token
    //aToken.document.update({ "hidden": true });
    jez.log('Before: aToken.document.update({ "hidden": true });')
    aToken.document.update({ "hidden": true });
    jez.log('After: aToken.document.update({ "hidden": true });')

    await jez.wait(1000)
    aToken.refresh()
    //---------------------------------------------------------------------------------------------
    // Post good bye message
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    msg = `${aToken.name} blinks out of existance.`
    jez.addMessage(chatMsg, { color: "steelblue", fSize:16, msg:msg, tag:"saves", icon:aItem.img })
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the VFX code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function runVFX(token1) {
    jez.log("Launch VFX")
    jez.log("args[0]", args[0])
    const FUNCNAME = "runVFX(token1)";
    const VFX_NAME = `${MACRO}`
    const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Portals/Portal_Vortex_Red_H_400x400.webm"
    const VFX_OPACITY = 1.0;
    const VFX_SCALE = 1.0;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    new Sequence()
    .effect()
        .file(VFX_LOOP)
        .atLocation(token1)     // Effect will appear at  template, center
        .scale(VFX_SCALE)
        .scaleIn(0.25, 1000)    // Expand from 0.25 to 1 size over 1 second
        .rotateIn(180, 1000)    // 1/2 Rotation over 1 second 
        .scaleOut(0.25, 1000)   // Contract from 1 to 0.25 size over 1 second
        .rotateOut(180, 1000)   // 1/2 Counter Rotation over 1 second
        .opacity(VFX_OPACITY)
        .duration(6000)
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(10)             // Fade in for specified time in milliseconds
        .fadeOut(1000)          // Fade out for specified time in milliseconds
        .extraEndDuration(1200) // Time padding on exit to connect to Outro effect
    .play();
    await jez.wait(100)         // Don't delete till VFX established
}
