const MACRONAME = "Aura_Icon_of_Ravenloft.js"
/*****************************************************************************************
 * Macro that applies (doOn) and removes (doOff) 
 * 
 * 02/11/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const VFX_NAME  = `${MACRO}-${aToken.id}`
const VFX_INTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_01_Regular_Yellow_Intro_400x400.webm"
const VFX_LOOP  = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Yellow_Loop_400x400.webm";
const VFX_OUTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Yellow_OutroExplode_400x400.webm";
const VFX_OPACITY = 0.7;
const VFX_SCALE = 1.9;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    new Sequence() 
    jez.runRuneVFX(aToken, jez.getSpellSchool(aItem), "yellow")
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
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {

    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });

    new Sequence()
    .effect()
        .file(VFX_OUTRO)
        .scaleToObject(VFX_SCALE)
        .opacity(VFX_OPACITY)  
        .attachTo(aToken)
    .play()
    return;
}