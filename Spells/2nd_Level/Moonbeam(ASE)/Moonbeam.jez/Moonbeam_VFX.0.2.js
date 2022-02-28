const MACRONAME = "Moonbeam_VFX.0.2"
/*****************************************************************************************
 * This spell macro built from a Sequencer example found at:
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Dynamic-Active-Effects-&-JB2A-Shield
 * 
 * JB2A Effects can be viewed at: https://www.jb2a.com/Library_Preview/
 * 
 * 12/29/21 0.1 Creation of Macro
 * 12/30/21 0.2 Reshuffle for inclusion in main macro
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME} or ${MACRO}`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

//---------------------------------------------------------------------------------------
// Set some global variables and constants
//
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro

//---------------------------------------------------------------------------------------
// See https://gitlab.com/tposney/dae#lastarg for info on what is included in lastArg
//
const lastArg = args[args.length - 1];
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const VFX_NAME  = `${MACRO}-${aToken.id}`
const VFX_INTRO = "modules/jb2a_patreon/Library/2nd_Level/Moonbeam/MoonbeamIntro_01_Regular_Blue_400x400.webm"
const VFX_LOOP  = "modules/jb2a_patreon/Library/2nd_Level/Moonbeam/Moonbeam_01_Regular_Blue_400x400.webm";
const VFX_OUTRO = "modules/jb2a_patreon/Library/2nd_Level/Moonbeam/MoonbeamOutro_01_Regular_Blue_400x400.webm";
const VFX_OPACITY = 0.9;
const VFX_SCALE = 0.6;
const MINION = "*Moonbeam*"

log("------- Obtained Global Values -------",
    `Active Token (aToken) ${aToken.name}`, aToken,
    `Active Item (aItem) ${aItem.name}`, aItem);

//----------------------------------------------------------------------------------------------
// Search for MINION in the current scene 
//
let eToken = await findTokenByName(MINION)
if (!eToken) {
    log("Found only tears")
    log("------------------------------ ", "Premature End", `${MACRONAME} ${FUNCNAME}`);
    return (false);
} else log("eToken =====> ", eToken)

//---------------------------------------------------------------------------------------
// Do something Useful
//
if (args[0] === "on")  await doOn();          		    // DAE Application
if (args[0] === "off") await doOff();        			    // DAE removal

//---------------------------------------------------------------------------------------
// That's all folks
//
log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/***************************************************************************************
 * Perform the steps that runs when this macro is executed by DAE to add to target
 ***************************************************************************************/
 async function doOn() {
    const FUNCNAME = "doOn()";
    log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    new Sequence()
    .effect()
        .file(VFX_INTRO)
        .attachTo(eToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)           
        .waitUntilFinished(-500) // Negative wait time (ms) clips the effect to avoid fadeout
    .effect()
        .file(VFX_LOOP)
        .attachTo(eToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)  
        .persist()
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(300)            // Fade in for specified time in milliseconds
        .fadeOut(300)           // Fade out for specified time in milliseconds
        .extraEndDuration(800)  // Time padding on exit to connect to Outro effect
    .play()

    log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

 /***************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************/
  async function doOff() {
    const FUNCNAME = "doOff()";
    log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    log("aToken", aToken)
    log("eToken._object", eToken._object)
    await Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: eToken._object });

    new Sequence()
    .effect()
        .file(VFX_OUTRO)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)  
        .attachTo(eToken)
    .play()

    log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/***************************************************************************************************
 * Find an owned token by name on current scene.  Return the token or null if not found
 ***************************************************************************************************/
 async function findTokenByName(name) {
    const FUNCNAME = "findTokenByName(name)";
    log("-----------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "name", name)
    let targetToken = ""
    //----------------------------------------------------------------------------------------------
    // Loop through toens on the canvas looking for the one we seek
    //
    let ownedTokens = canvas.tokens.ownedTokens
    for (let i = 0; i < ownedTokens.length; i++) {
        log(`  ${i}) ${ownedTokens[i].name}`, ownedTokens[i]);
        if (name === ownedTokens[i].name) {
            log("Eureka I found it!")
            targetToken = ownedTokens[i]
            break;
        }
    }
    if (targetToken) log(`${name}'s token has been found`, targetToken)
    else log(`${name}'s token was not found :-(`)
    log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (targetToken);
}

/****************************************************************************************
* DEBUG Logging
* 
* If passed an odd number of arguments, put the first on a line by itself in the log,
* otherwise print them to the log seperated by a colon.  
* 
* If more than two arguments, add numbered continuation lines. 
***************************************************************************************/
function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    }
}
