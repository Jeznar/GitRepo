const MACRONAME = "Haste.0.1.js"
/*****************************************************************************************
 * Macro is intended to be fired as an ItemMacro by Haste.  Specifically, play a message
 * reminding players of ectra action every turn and apply the "no actions" effect for 
 * one round at effect expiration.
 * 
 * 06/02/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
//if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
// DamageBonus must return a function to the caller
//if (args[0]?.tag === "DamageBonus") return(doBonusDamage());    
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    msg = `${tToken.name} is under the effects of Haste, gaining several benefits.`
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        postResults(msg);
        return (false);
    }
    return(true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.postMessage({color: jez.randomDarkColor(), 
                fSize: 14, 
                icon: aToken.data.img, 
                msg: `${aToken.name} suffers from waves of lethergy as the ferntic energy fades.`, 
                title: `No longer hasted!`, 
                token: aToken})
    // ---------------------------------------------------------------------------------------
    // Add an effect to the active token that expires at the end of its next turn imposing 
    // CUB condition: No Action
    //
    const GAME_RND = game.combat ? game.combat.round : 0;
    let effectData = {
        label: "No Actions",
        icon: aItem.img,
        origin: aToken.uuid,
        disabled: false,
        // flags: { dae: { itemData: aItem, specialDuration: ['turnEndSource'] } },
        flags: { dae: { itemData: aItem, specialDuration: ['turnEnd'] } },
        duration: { rounds: 2, seconds: 12, startRound: GAME_RND, startTime: game.time.worldTime },
        changes: [
            { key: `macro.CUB`, mode: jez.CUSTOM, value: "No_Actions", priority: 20 }
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
 async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.postMessage({color: jez.randomDarkColor(), 
        fSize: 12, 
        icon: aToken.data.img, 
        msg: `${aToken.name} is under the effects of Haste, gaining an additional action this turn. 
        That action can be used only to take the Attack (one weapon attac⁠k only), Dash, Disengage, 
        Hide, or Use an Object action.`,
        title: `<b>${aToken.name}</b> is Hasted!`, 
        token: aToken})
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
