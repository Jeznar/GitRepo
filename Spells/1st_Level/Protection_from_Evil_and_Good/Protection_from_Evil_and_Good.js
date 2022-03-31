const MACRONAME = "Protection_from_Evil_and_Good.0.3.js"
/*****************************************************************************************
 * This spell macro built from a Sequencer example found at:
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Dynamic-Active-Effects-&-JB2A-Shield
 * 
 * JB2A Effects can be viewed at: https://www.jb2a.com/Library_Preview/
 * 
 * 12/31/21 0.1 Creation of Macro
 * 12/31/21 0.2 Additions
 * 03/31/21 0.3 Adjustments to VFX
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME} or ${MACRO}`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

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
const VFX_INTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_01_Regular_Green_Intro_400x400.webm"
const VFX_LOOP  = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Green_Loop_400x400.webm";
const VFX_OUTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Green_OutroExplode_400x400.webm";
const VFX_OPACITY = 0.7;
const VFX_SCALE = 1.9;

//---------------------------------------------------------------------------------------
// Do something Useful
//
if (args[0] === "on") doOn();          		    // DAE Application
if (args[0] === "off") doOff();        			    // DAE removal

//---------------------------------------------------------------------------------------
// That's all folks
//
jez.log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
return;
/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************
 * Perform the steps that runs when this macro is executed by DAE to add to target
 ***************************************************************************************/
 async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
    jez.runRuneVFX(aToken, jez.getSpellSchool(aItem), "green")
    new Sequence()
    .effect()
        .file(VFX_INTRO)
        .attachTo(aToken)
        .scaleToObject(VFX_SCALE)
        .opacity(VFX_OPACITY)           
        .waitUntilFinished(-500) // Negative wait time (ms) clips the effect to avoid fadeout
    .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .scaleToObject(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(true)  
        .persist()
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .extraEndDuration(800)  // Time padding on exit to connect to Outro effect
    .play()

    jez.log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

 /***************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************/
  async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });

    new Sequence()
    .effect()
        .file(VFX_OUTRO)
        .scaleToObject(VFX_SCALE)
        .opacity(VFX_OPACITY)  
        .attachTo(aToken)
    .play()

    jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}