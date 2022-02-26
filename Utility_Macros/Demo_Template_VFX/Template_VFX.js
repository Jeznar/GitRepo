const MACRONAME = "Template_VFX"
/*****************************************************************************************
 * Demonstrator Macro to place a Sequencer VFX on a template from an OnUse ItemMacro
 *
 * 02/18/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
return;
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
// COOL-THING: Effect will appear at template, center
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const VFX_NAME = `${MACRO}`
    const VFX_LOOP = "modules/jb2a_patreon/Library/1st_Level/Sleep/SleepMarker01_01_*_400x400.webm"
    const VFX_OPACITY = 1.0;
    const VFX_SCALE = 2.7;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const templateID = args[0].templateId
    jez.log('templateID', templateID)
    new Sequence()
    .effect()
        .file(VFX_LOOP)
        .atLocation(templateID) // Effect will appear at  template, center
        .scale(VFX_SCALE)
        .scaleIn(0.25, 1000)    // Expand from 0.25 to 1 size over 1 second
        .rotateIn(180, 1000)    // 1/2 Rotation over 1 second 
        .scaleOut(0.25, 1000)   // Contract from 1 to 0.25 size over 1 second
        .rotateOut(180, 1000)   // 1/2 Counter Rotation over 1 second
        .opacity(VFX_OPACITY)
        .duration(6000)
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(10)             // Fade in for specified time in milliseconds
        .fadeOut(1000)          // Fade out for specified time in milliseconds
        .extraEndDuration(1200) // Time padding on exit to connect to Outro effect
    .play();
    await jez.wait(100)         // Don't delete till VFX established
    canvas.templates.get(templateID).document.delete()
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
