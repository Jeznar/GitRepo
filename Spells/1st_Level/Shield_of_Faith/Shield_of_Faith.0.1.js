const MACRONAME = "Shield_of_Faith.0.1"
/*****************************************************************************************
 * This spell macro built from a Sequencer example found at:
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Dynamic-Active-Effects-&-JB2A-Shield
 * 
 * JB2A Effects can be viewed at: https://www.jb2a.com/Library_Preview/
 * 
 * 12/29/22 0.1 Creation of Macro
 * 01/23/22 0.2 Changed VFX opacity and placed beneath token
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
const EFFECT_NAME = aItem.name || MACRO || "Shield";
//const EFFECT_ICON = aItem.img || "Icons_JGB/Spells/1st%20Level/Shield.png";
const EFFECT_ICON = "Icons_JGB/Spells/1st%20Level/Shield_Yellow.png";
const VFX_NAME  = `${MACRO}-${aToken.id}`
const VFX_INTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Yellow_Intro_400x400.webm"
const VFX_LOOP  = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Yellow_Loop_400x400.webm";
const VFX_OUTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Yellow_OutroExplode_400x400.webm";

log("------- Obtained Global Values -------",
    `Active Token (aToken) ${aToken.name}`, aToken,
    `Active Item (aItem) ${aItem.name}`, aItem,
    "EFFECT_NAME", EFFECT_NAME,
    "EFFECT_ICON", EFFECT_ICON);

//---------------------------------------------------------------------------------------
// Do something Useful
//
if (args[0] === "on") doOn();          		    // DAE Application
if (args[0] === "off") doOff();        			    // DAE removal

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

    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });

    new Sequence()
    .effect()
        .file(VFX_OUTRO)
        .scale(0.5)
        .opacity(1.0)  
        .attachTo(aToken)
    .play()

    log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
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