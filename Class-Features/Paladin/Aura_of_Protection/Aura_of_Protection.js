const MACRONAME = "Aura_of_Protection.0.2.js"
/*****************************************************************************************
 * Macro that applies (doOn) and removes (doOff) 
 * 
 * 02/11/22 0.1 Creation of Macro
 * 06/16/22 0.2 Add flag to diable sparkles and set it to off
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
const VFX_LOOP1 = "modules/jb2a_patreon/Library/Generic/Item/GlintMany01_*_Regular_Yellow_200x200.webm"
const VFX_LOOP2 = "modules/jb2a_patreon/Library/Generic/Item/GlintFew01_*_Regular_Blue_200x200.webm"
const VFX_NAME1 = `${MACRO}-${aToken.name}-1`
const VFX_NAME2 = `${MACRO}-${aToken.name}-2`
const SPARKLES = false  
//----------------------------------------------------------------------------------
// Control the application of sparkles, false = none
//
if (SPARKLES) {
    //----------------------------------------------------------------------------------
    // Run the main procedures, choosing based on how the macro was invoked
    //
    if (args[0] === "off") await doOff();                   // DAE removal
    if (args[0] === "on") await doOn();                     // DAE Application
}
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    Sequencer.EffectManager.endEffects({ name: VFX_NAME1, object: aToken });
    Sequencer.EffectManager.endEffects({ name: VFX_NAME2, object: aToken });
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    new Sequence() 
        .effect()
            .file(VFX_LOOP1)
            .attachTo(aToken)
            .scale(1)
            .opacity(1)
            .persist()
            //.duration(4000)
            .name(VFX_NAME1) 
            //.waitUntilFinished(-500) 
        .effect()
            .file(VFX_LOOP2)
            .attachTo(aToken)
            .scale(0.9)
            .opacity(1)
            .persist()
            //.duration(4000)
            .name(VFX_NAME2) 
            //.waitUntilFinished(-500) 
        .play();
    return;
}