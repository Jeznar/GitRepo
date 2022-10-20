const MACRONAME = "Shield_of_Faith.0.4.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This spell macro built from a Sequencer example found at:
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Dynamic-Active-Effects-&-JB2A-Shield
 * 
 * JB2A Effects can be viewed at: https://www.jb2a.com/Library_Preview/
 * 
 * 12/29/22 0.1 Creation of Macro
 * 01/23/22 0.2 Changed VFX opacity and placed beneath token
 * 10/18/22 0.3 General update, pair effects, create relevant convenientDescription
 * 10/19/22 0.4 Converted to use jez.pairEffectsAsGM to fix player permission issue
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 5;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL>1) jez.trace(`${TAG} === Starting ===`);
if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
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
const EFFECT_NAME = "Shield of Faith";
const EFFECT_ICON = "Icons_JGB/Spells/1st%20Level/Shield_Yellow.png";
const VFX_NAME  = `${MACRO}-${aToken.id}`
const VFX_INTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Yellow_Intro_400x400.webm"
const VFX_LOOP  = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Yellow_Loop_400x400.webm";
const VFX_OUTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Yellow_OutroExplode_400x400.webm";
//---------------------------------------------------------------------------------------
// Do something Useful
//
if (args[0] === "on") doOn({traceLvl:TL});          		    
if (args[0] === "off") doOff({traceLvl:TL});        			    
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          
//---------------------------------------------------------------------------------------
// That's all folks
//
if (TL>1) jez.trace(`=== Finished === ${MACRONAME} ===`);
return;
/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/***************************************************************************************
 * Perform the steps that runs when this macro is executed by DAE to add to target
 ***************************************************************************************/
 async function doOn(options={}) {
    const FUNCNAME = "doOn(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL>0) jez.trace(`${TAG} --- Starting ---`);
    //-----------------------------------------------------------------------------------------------
    // Update the convenientDescription of the Concentrating effect to describe the spell
    //
    await jez.wait(100)
    // const CE_DESC = `Benefiting from Shield spell`
    // await jez.setCEDesc(aToken, EFFECT_NAME, CE_DESC, { traceLvl: TL });
    //-----------------------------------------------------------------------------------------------
    // Run a VFX on the active (targeted) token
    //
    new Sequence()
    .effect()
        .file(VFX_INTRO)
        .attachTo(aToken)
        .scale(0.5)
        .opacity(1.0)           
        .waitUntilFinished(-500) // Negative wait time (ms) clips the effect to avoid fadeout
    .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .belowTokens()
        .scale(0.5)
        .opacity(1.0)  
        .persist()
        .name(VFX_NAME)      // Give the effect a uniqueish name
        .fadeIn(300)            // Fade in for specified time in milliseconds
        .fadeOut(300)           // Fade out for specified time in milliseconds
        .extraEndDuration(800)  // Time padding on exit to connect to Outro effect
    .play()
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}

 /***************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 ***************************************************************************************/
async function doOff(options = {}) {
    const FUNCNAME = "doOff()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
    //-----------------------------------------------------------------------------------------------
    // Terminate the effect on the token
    //
    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });
    //-----------------------------------------------------------------------------------------------
    // Run an temination VFX effect on the token
    //
    new Sequence()
    .effect()
        .file(VFX_OUTRO)
        .scale(0.5)
        .opacity(1.0)  
        .attachTo(aToken)
    .play()
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the "OnUse" code to:
 *  1. Check that a target was selected, dropping conc if it wasn't,
 *  2. Pair the two effects
 *  3. Update the convenientDescription on concentrating
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    // Verify something was targeted, if not clear concentrating and return a message of sadness
    //
    if (!await preCheck()) {
        msg = `This spell requires that a target be selected before casting.`
        postResults(msg);
        await jez.wait(100)
        let conc = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
        if (TL>1) jez.trace(`${TAG} Clearing concentration from ${aToken.name}`, conc)
        await conc.delete()
        return
    }
    //----------------------------------------------------------------------------------
    // Set the targeted token
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    // let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------
    // Pair the effects so concentrating will drop if the effect is terminated
    //
    await jez.wait(100)
    jez.pairEffectsAsGM(aToken.id, "Concentrating", tToken.id, EFFECT_NAME)
    //jez.pairEffects(aToken, "Concentrating", tToken, EFFECT_NAME)
    //-----------------------------------------------------------------------------------------------
    // Update the convenientDescription of the Concentrating effect to describe the spell
    //
    const CE_DESC1 = `Maintaining Shield of Faith spell on ${tToken.name}`
    await jez.setCEDesc(aActor, "Concentrating", CE_DESC1, { traceLvl: TL });
    const CE_DESC2 = `Benefiting from ${aToken.name}'s Shield of Faith`
    await jez.setCEDescAsGM(tToken.id, EFFECT_NAME, CE_DESC2, { traceLvl: TL });
    //-----------------------------------------------------------------------------------------------
    // Final message and close up shop
    //
    msg = `<b>${aToken.name}</b> is protecting <b>${tToken.name}</b> with a magical shield`
    postResults(msg)
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
* Check the setup of things.  Post bad message and return false fr bad, true for ok!
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
async function preCheck() {
   if (args[0].targets.length !== 1)       // If not exactly one target 
       return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`,"w");
   return(true)
}