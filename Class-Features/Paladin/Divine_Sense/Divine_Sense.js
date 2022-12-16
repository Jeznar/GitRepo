const MACRONAME = "Divine_Sense.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implment Paladin Ability Divine Sense.  Specifically manage the visile aura removal 
 * when spell complete.
 * 
 * 12/26/21 0.1 Creation of Macro
 * 12/15/22 0.2 Update style and fix handling of VFX
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
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
const DEBUG = true;
const IMAGE = "Icons_JGB/Spells/Spirit_Guardian.jpg"
const DEBUFF_NAME = aItem.name || "Divine Sense";
const DEBUFF_ICON = aItem.img || "/systems/dnd5e/icons/skills/light_02.jpg";
const VFX_NAME = `${MACRO}-${aToken.id}`
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
// if (args[0] === "on") await doOn({traceLvl:TL});                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          // Midi ItemMacro On Use
// if (args[0] === "each") doEach({traceLvl:TL});					     // DAE everyround
if (args[0] === "off") await doOff({traceLvl:TL});                   // DAE removal
if (TL>1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 * 
 *  
 ***********************************************************************************************************************************
 * Fire up the VFX when effect is added
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL>0) jez.trace(`${TAG} --- Starting ---`);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    runVFX(token)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Set the CE description
    //
    const NEW_DESC = "Know the location and type of any celestial, fiend, or undead that is not behind total cover."
    const EFFECT = "Divine Sense";
    await jez.setCEDesc(aToken, EFFECT, NEW_DESC, { traceLvl: TL });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    msg = `${aToken.name} knows the location and type of any celestial, fiend, or undead within 60 feet that is not behind 
    total cover.`
    postResults(msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 async function doOff(options={}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    console.log(`VFX_NAME`,VFX_NAME)
    Sequencer.EffectManager.endEffects({ name: VFX_NAME });

    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Run some VFX on origin token
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 function runVFX(token) {
    const VFX_LOOP = "modules/jb2a_patreon/Library/TMFX/Radar/Circle/RadarLoop_02_Circle_Normal_500x500.webm"
    const VFX_SCALE = 5.4
     const VFX_OPACITY = 0.8
     new Sequence()
         .effect()
         .file(VFX_LOOP)
         .attachTo(token)
         .scale(VFX_SCALE)
         .opacity(VFX_OPACITY)
         .persist()
         .name(VFX_NAME)         // Give the effect a uniqueish name
         .play()
 }
 /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
  function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
}