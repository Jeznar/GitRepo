const MACRONAME = "Starter_Macro"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 * 06/29/22 0.2 Update to use jez.trc
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 1;
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(2, trcLvl, `  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let msg = "";
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

//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE everyround
// DamageBonus must return a function to the caller
if (args[0]?.tag === "DamageBonus") return(doBonusDamage());    
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
async function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        ui.notifications.warn(msg)
        postResults(msg);
        return (false);
    }
    /*if (LAST_ARG.hitTargets.length === 0) {  // If target was missed, return
        msg = `Target was missed.`
        postResults(msg);
        return(false);
    }*/
    /*if (args[0].failedSaveUuids.length !== 1) {  // If target made its save, return
        msg = `Saving throw succeeded.  ${aItem.name} has no effect.`
        postResults(msg);

        return(false);
    }*/
    return(true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    jez.trc(1,trcLvl,`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    jez.trc(2,trcLvl,"postResults Parameters","msg",msg)
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    jez.trc(1,trcLvl,`--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.trc(1,trcLvl,`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //

    jez.trc(1,trcLvl,`--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set On
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.trc(1,trcLvl,`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //

    jez.trc(1,trcLvl,`--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.trc(1,trcLvl,`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    if (!await preCheck()) return(false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //

    msg = `Maybe say something useful...`
    postResults(msg)
    jez.trc(1,trcLvl,`--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doEach() {
    const FUNCNAME = "doEach()";
    jez.trc(1,trcLvl,`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //

    jez.trc(1,trcLvl,`--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    jez.trc(1,trcLvl,`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //

    jez.trc(1,trcLvl,`--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
    return true;
}
