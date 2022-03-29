const MACRONAME = "Cloudkill_Effect.js"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const BASEMACRO = "Black_Tentacles"
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
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
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
//if (args[0] === "each") doEach();					    // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 async function postResults() {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    await jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    if (args[0].targets.length === 0) {     
        msg = `Must target at least one target.  ${args[0].targets.length} were targeted.`
        await postResults();
        return (false);
    }
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id);    // First Targeted Token, if any
    runVFX(tToken)
    if (LAST_ARG.failedSaves.length === 0) {
        msg = `<b>${tToken.name}</b> takes half damage from the deadly cloud.`
    } else {
        msg = `<b>${tToken.name}</b> takes full damage from the deadly cloud.`
    }
    //---------------------------------------------------------------------------------------------
    // Add results to chat card
    //
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Run VFX
 ***************************************************************************************************/
async function runVFX(token5e) {
    new Sequence()
    .effect()
        .file("modules/jb2a_patreon/Library/Generic/UI/IconPoison_01_Dark_Green_200x200.webm")
        .attachTo(token5e)
        .scale(1.0)
        .scaleIn(0.1, 1500)         // Expand from 0.25 to 1 size over 1 second
        //.rotateIn(180, 1500)        // 1/2 Rotation over 1 second 
        .scaleOut(0.1, 1500)        // Contract from 1 to 0.25 size over 1 second
        //.rotateOut(180, 1500)       // 1/2 Counter Rotation over 1 second
        .opacity(1.0)
        //.belowTokens()
        //.persist()
        //.duration(10000)
        //.name(VFX_NAME)             // Give the effect a uniqueish name
        .fadeIn(1500)               // Fade in for specified time in milliseconds
        .fadeOut(1500)              // Fade out for specified time in milliseconds
        //.extraEndDuration(1200)   // Time padding on exit to connect to Outro effect
    .play();
    //await jez.wait(100)         // Don't delete till VFX established
    return (true)
}


