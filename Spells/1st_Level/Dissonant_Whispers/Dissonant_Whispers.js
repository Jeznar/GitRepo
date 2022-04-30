const MACRONAME = "Dissonant_Whispers.js"
/*****************************************************************************************
 * Play a VFX and display appropriate message describing effect.
 * 
 *  On a failed save, it takes 3d6 psychic damage and must immediately use its reaction, 
 *  if available, to move as far as its speed allows away from you. The creature doesn’t 
 *  move into obviously dangerous ground, such as a fire or a pit. On a successful save, 
 *  the target takes half as much damage and doesn’t have to move away. A deafened 
 *  creature automatically succeeds on the save.
 * 
 * 03/12/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && !preCheck()) return;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
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
        jez.log(msg)
        postResults(msg);
        return (false);
    }
    if (args[0].failedSaveUuids.length !== 1) {  // If target made its save, return
        msg = `Saving throw succeeded.  ${aItem.name} has no additional effect.`
        jez.log(msg)
        postResults(msg);
        return(false);
    }
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
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)
    runVFX(aToken, tToken)

    msg = `<b>${tToken.name}</b> must immediately use its reaction, if available, to move as far as its speed
    allows away from <b>${aToken.name}</b>. ${tToken.name} doesn’t move into obviously danger. A deafened 
    creature is exempt from this effect.`
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
 async function runVFX(token1, token2) {
    new Sequence()
        .effect()
            .file("jb2a.scorching_ray.01.orange")
            .stretchTo(token2)
            .atLocation(token1)
            .scale(1)
            .opacity(1)
            .waitUntilFinished(-1500) 
        .effect()
            .file("jb2a.icon.fear.orange")
            .attachTo(token2)
            .scale(0.7)
            .opacity(1)
            .scaleIn(0.1, 1000)
            .duration(5000)
            .fadeIn(100) 
            .fadeOut(1000) 
            .waitUntilFinished(-1500) 
        .effect()
            .file("jb2a.markers.fear.dark_orange.01")
            .scale(0.7)
            .opacity(1)
            .duration(5000)
            .fadeIn(1000)
            .scaleIn(0.4, 1000)
            .fadeOut(1000) 
            .attachTo(token2)
        .play();
}
