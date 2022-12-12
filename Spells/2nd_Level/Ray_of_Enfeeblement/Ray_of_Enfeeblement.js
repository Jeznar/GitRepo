const MACRONAME = "Ray_of_Enfeeblement.0.2.js"
/*****************************************************************************************
 * Implement Ray of Enfeeblement
 * 
 * 02/18/22 0.1 Creation of Macro
 * 12/11/22 0.2 Add miss to VFX, pairing of concentration and effect and update logging
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
 //-----------------------------------------------------------------------------------------------------------------------------------
 // Set Macro specific globals
 //

 //----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
// but only for OnUse invocation.
if ((args[0]?.tag === "OnUse") && !preCheck()) return
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          // Midi ItemMacro On Use
if (args[0] === "each") doEach({traceLvl:TL});					    // DAE removal
if (TL>1) jez.trace(`${TAG} === Finished ===`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (args[0].targets.length !== 1)     // If not exactly one target, return
        return jez.badNews(`Must target exactly one target.  ${args[0].targets.length} were targeted.`,'i')
    return (true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
// COOL-THING: Performs saving throw each round, removes effect on save.
async function doEach(options={}) {
    const FUNCNAME = "doEach(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Function values
    //
    const SAVE_DC = args[1]
    const SAVE_TYPE = "con"
    const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to end <b>${aItem.name}'s effect.</b>`;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Perform the saving throw
    //
    let save = await aToken.actor.rollAbilitySave(SAVE_TYPE,{flavor:FLAVOR, chatMessage:true, fastforward:true});
    if (save.total < SAVE_DC) {
        if (TL>1) jez.trace(`${TAG} ${aToken.name} failed: ${SAVE_TYPE} ${save.total} vs DC${SAVE_DC}`)
        msg = `${aToken.name} fails to clear effect of ${aItem.name} and is still doing half damage with strength based weapons.<br><br>
        <b>FoundryVTT:</b> Manually handled.`
        jez.postMessage({color:"darkred", fSize:14, msg:msg, title:`${aItem.name} effect remains`, token:aToken, icon:aActor.img})

    } else {
        if (TL>1) jez.trace(`${TAG} ${aToken.name} saved: ${SAVE_TYPE} ${save.total} vs DC${SAVE_DC}`)
        const EFFECT_NAME = "Ray of Enfeeblement"
        if (TL>1) jez.trace(`${TAG} Attempt to remove ${EFFECT_NAME} from ${aToken.name}.`)
        let effectObj = aActor.effects.find(i => i.data.label === EFFECT_NAME);
        if (effectObj) {
            if (TL>1) jez.trace(`${TAG} Attempting to remove ${effectObj.id} from ${aActor.uuid}`)
            MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: aActor.uuid, effects: [effectObj.id] });
        }
        msg = `${aToken.name} shook off the effects of ${aItem.name} and is no longer doing half damage with strength based weapons.`
        jez.postMessage({color:"purple", fSize:14, msg:msg, title:`${aItem.name} effect removed`, token:aToken, icon:aActor.img})
    }
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Function values
    //
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    //-------------------------------------------------------------------------------------------------------------------------------
    const MISSED = (args[0].hitTargets.length > 0 ) ? false : true
    //-------------------------------------------------------------------------------------------------------------------------------
    runVFX(aToken, tToken, MISSED)
    //-------------------------------------------------------------------------------------------------------------------------------
    // If we scored a hit, need to pair the new effect and the concentratinf effect
    //
    if (!MISSED) jez.pairEffectsAsGM(aActor, "Concentrating", tToken.actor, "Ray of Enfeeblement")
    //-------------------------------------------------------------------------------------------------------------------------------
    msg = `${tToken.name} has been <b>enfeebled</b>.  It does 1/2 damage with strength based weapons while 
    affected by ${aItem.name}.<br><br><b>FoundryVTT</b>: This must be handled manually.`
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, {color:"purple", fSize:15, msg:msg, tag:"saves" })
    //-------------------------------------------------------------------------------------------------------------------------------
    if (TL>0) jez.trace(`${TAG} --- Finished ---`);
    return (true);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Display the VFX for the beam
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
async function runVFX(token1, token2, missed) {
    if (TL>1) jez.trace(`${TAG} token1 ${token1.name}`, token1)
    if (TL>1) jez.trace(`${TAG} token2 ${token2.name}`, token2)
    const VFX_OPACITY = 1.0;
    const VFX_SCALE = 1.0;
    const VFX_NAME = `${MACRO}`
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pick a color based on a color string found in the icon's name.
    // Available VFX colors: blue, blueyellow, green, purpleteal
    // Recognized  strings: blue, yellow (blueyellow), green, teal (purpleteal), magenta (purpleteal)
    let color = "green"
    const IMAGE = aItem.img.toLowerCase()
    if (IMAGE.includes("yellow")) color = "blueyellow"
    else if (IMAGE.includes("blue")) color = "blue"
    else if (IMAGE.includes("green")) color = "green"
    else if (IMAGE.includes("teal")) color = "purpleteal"
    else if (IMAGE.includes("magenta")) color = "purpleteal"
    else if (IMAGE.includes("orange")) color = "orange"
    else if (IMAGE.includes("purple")) color = "purple"
    //if (TL>1) jez.trace(`${TAG} Color ${color}`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pick distance category to be used.
    //
    let distance = canvas.grid.measureDistance(token1, token2).toFixed(1);
    if (TL>1) jez.trace(`${TAG} Distance between ${token1.name} and ${token2.name} is ${distance}.`)
    let distCategory = "05ft_600x400"
    if (distance > 15) distCategory = "15ft_1000x400"
    if (distance > 30) distCategory = "30ft_1600x400"
    if (distance > 45) distCategory = "45ft_2200x400"
    if (distance > 60) distCategory = "60ft_2800x400"
    if (distance > 90) distCategory = "90ft_4000x400"
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply the effect
    //
    const ROOT = "modules/jb2a_patreon/Library/Cantrip/Ray_Of_Frost/RayOfFrost_01_Regular"
    const VFX_STRING = `${ROOT}_${color}_${distCategory}.webm`
    if (TL>1) jez.trace(`${TAG} VFX File Name: ${VFX_STRING}`)
    new Sequence()
    .effect()
        .atLocation(token1)
        .stretchTo(token2)
        .file(VFX_STRING)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .missed(missed)
        //.duration(4000)
        .name(VFX_NAME)         // Give the effect a uniqueish name
    .play();
}