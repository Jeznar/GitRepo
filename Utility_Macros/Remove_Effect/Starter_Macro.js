const MACRONAME = "Starter_Macro"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
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
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";

//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && !preCheck())  {await jez.wait(250); return;}

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
// DamageBonus must return a function to the caller
if (args[0]?.tag === "DamageBonus") return(doBonusDamage());    
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
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
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("Something could have been here")
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
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)


    msg = `Maybe say something useful...`
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
 async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("The do Each code")
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
