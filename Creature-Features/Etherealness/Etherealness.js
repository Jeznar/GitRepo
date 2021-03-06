const MACRONAME = "Etherealness"
/*****************************************************************************************
 * Basic VFX and vanish macro
 * 
 * 02/18/22 0.1 Creation of Macro
 * 05/02/22 0.2 Update for Foundry 9.x
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus
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
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("A place for things to be done");
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    // let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    // let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    //jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)
    //---------------------------------------------------------------------------------------------
    // Run the visual effects
    runVFX(aToken)
    //---------------------------------------------------------------------------------------------
    // Hide the plane shifting token
    aToken.document.update({ "hidden": true });
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
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("The do On Use code")
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
// COOL-THING: Wildcard selection of graphic file.
    const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Portals/Portal_Vortex_Orange_H_400x400.webm"
    const VFX_OPACITY = 1.0;
    const VFX_SCALE = 0.6;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    new Sequence()
    .effect()
        .file(VFX_LOOP)
// COOL-THING: Effect will appear at token, center
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