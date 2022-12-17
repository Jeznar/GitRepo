const MACRONAME = "Befuddling_Curse.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Befuddling Curse.  Post a simple message to the chat card describing the effect
 * 
 * Description: You befuddle a creature's mind, swapping the position of two things it can
 *   see that are of the same size and category (for example, two medium creatures or two 
 *   gargantuan buildings).
 * 
 *   The target creature must make a Wisdom saving throw. On failure, it is unaware the 
 *   two things have been swapped.
 * 
 *   Each time the creature:
 *     1. interacts with,
 *     2. attacks,
 *     3. or is attacked by a swapped targets,
 *   it can repeat its saving throw against the effect.
 * 
 * 01/11/22 0.1 Creation of Macro
 * 12/16/22 0.2 Update style and chase odd exit bug that triggers error based on targeted tokens
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 1;                               // Trace Level for this macro
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
let SAVE_DC = aItem.data.save.dc;
let SAVE_ABILITY = aItem.data.save.ability
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Butterflies/Butterflies_01_Bright_Yellow_Many_400x400.webm";
const VFX_OPACITY = 0.9;
const VFX_SCALE = 0.6;
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "on") await doOn({traceLvl:TL});                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          // Midi ItemMacro On Use
if (args[0] === "each") doEach({traceLvl:TL});					     // DAE everyround
// DamageBonus must return a function to the caller
if (args[0]?.tag === "DamageBonus") return(doBonusDamage({traceLvl:TL}));   
if (args[0] === "off") await doOff({traceLvl:TL});                   // DAE removal
if (TL>1) jez.trace(`${TAG} === Finished ===`);
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
 async function preCheck() {
    if (args[0].targets.length !== 1)
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, 'w')
    return true
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
    if (!await preCheck()) return(false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // https://www.w3schools.com/tags/ref_colornames.asp
    //
    // 
    if (args[0].saves.length !== 0) {   // Target must have saved (This should never occur)
        if (TL>1) jez.trace(`${TAG} ${tToken.name} saved (This should never occur)`)
        msg =  `<p style="color:Indigo;font-size:14px;">
                ${tToken.name} made its save and is unaffected by ${aItem.name}.
                </p>`
    } else {                            // Target failed save
        if (TL>1) jez.trace(`${TAG} ${tToken.name} failed`)
        msg = `<p style="color:DarkViolet;font-size:14px;">
        <b>${tToken.name}</b> failed its save and is now affected by ${aItem.name}.

        The <b>DC${SAVE_DC} ${SAVE_ABILITY.toUpperCase()}</b> save <u>may be repeated</u>,  
        each time ${tToken.name}: 
        <ol style="color:Indigo;font-size:14px;">
          <li>interacts with,</li>
          <li>attacks,</li>
          <li>or is attacked</li>
        </ol>
        <p style="color:DarkViolet;font-size:14px;">by a swapped target</p>
        </p>`
    }
    postResults(msg);
    if (TL>0) jez.trace(`${TAG} --- Finished ---`);
    return (true);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set On
 * This runs on actor that has the affected applied to it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 async function doOn(options={}) {
    const FUNCNAME = "doOn(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL>0) jez.trace(`${TAG} --- Starting ---`);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    new Sequence()
    .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)  
        .persist()
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(1000)            // Fade in for specified time in milliseconds
        .fadeOut(1000)           // Fade out for specified time in milliseconds
        .extraEndDuration(800)  // Time padding on exit to connect to Outro effect
    .play()
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
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
    await Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken._object });
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
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