const MACRONAME = "Dissonant_Whispers.0.2.js"
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
 * 12/11/22 0.2 Add miss VFX, chat bubble & update logging
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 0;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //-----------------------------------------------------------------------------------------------------------------------------------
 if (TL>0) jez.trace(`${TAG} === Starting ===`);
 if (TL>1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
 //-----------------------------------------------------------------------------------------------------------------------------------
 // Set standard variables
 //
 const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
 let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
 let aActor = aToken.actor; 
 let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
 const VERSION = Math.floor(game.VERSION);
 const GAME_RND = game.combat ? game.combat.round : 0;
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && !preCheck()) return;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});       // Midi ItemMacro On Use
if (TL>1) jez.trace(`${TAG} === Finished ===`);
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        postResults(msg);
        return jez.badNews(msg,'i')
    }
    if (args[0].failedSaveUuids.length !== 1) {  // If target made its save, return
        msg = `Saving throw succeeded.  ${aItem.name} has no additional effect.`
        postResults(msg);
        missVFX(aToken, L_ARG.saves[0])
        return jez.badNews(msg,'i')
    }
    return(true)
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    runVFX(aToken, tToken)
    //-------------------------------------------------------------------------------------------------------------------------------
    msg = `Oh my, I must react by fleeing ${aToken.name}!`
    bubbleForAll(tToken.id, msg, true, true)
    //-------------------------------------------------------------------------------------------------------------------------------
    msg = `<b>${tToken.name}</b> must immediately use its reaction, if available, to move as far as its speed
    allows away from <b>${aToken.name}</b>. ${tToken.name} doesn’t move into obviously danger. A deafened 
    creature is exempt from this effect.`
    postResults(msg)
    if (TL>0) jez.trace(`${TAG} --- Finished ---`);
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
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
 async function missVFX(token1, token2) {
    new Sequence()
        .effect()
            .file("jb2a.scorching_ray.01.orange")
            .stretchTo(token2)
            .atLocation(token1)
            .scale(1)
            .opacity(0.8)
            .missed(true)
            .waitUntilFinished(-1500) 
        .play();
}
