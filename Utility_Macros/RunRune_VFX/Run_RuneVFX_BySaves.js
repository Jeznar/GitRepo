const MACRONAME = "Run_RuneVFX_BySaves.js"
/*****************************************************************************************
 * This macro simply runs the Rune VFX on the targeted token(s) for the aItem school. It is 
 * intended to be run as an OnUse Macro from an Item.
 * 
 * 03/30/22 0.1 Creation of Macro
 *****************************************************************************************/
const LAST_ARG = args[args.length - 1];
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//--------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    let color = jez.getRandomRuneColor()
    let school = jez.getSpellSchool(aItem)
    for (const element of args[0].saves) {
        runRuneVFX(element, school, color)
    }
    for (const element of args[0].failedSaves) {
        jez.runRuneVFX(element, school, color)
    }
}
/***************************************************************************************************
 * Run a 3 part spell rune VFX on indicated token  with indicated rune, Color, scale, and opacity
 * may be optionally specified.
 * 
 * If called with an array of target tokens, it will recursively apply the VFX to each token 
 ***************************************************************************************************/
async function runRuneVFX(target, school, color, scale, opacity) {
    school = school || "enchantment"            // default school is enchantment \_(ツ)_/
    color = color || jez.getRandomRuneColor()   // If color not provided get a random one
    scale = scale || 1.2                        // If scale not provided use 1.0
    opacity = opacity || 1.0                    // If opacity not provided use 1.0
    // jez.log("runRuneVFX(target, school, color, scale, opacity)","target",target,"school",school,"scale",scale,"opacity",opacity)
    if (Array.isArray(target)) {                // If function called with array, do recursive calls
        for (let i = 0; i < target.length; i++) jez.runRuneVFX(target[i], school, color, scale, opacity);
        return (true)                           // Stop this invocation after recursive calls
    }
    //-----------------------------------------------------------------------------------------------
    // Build names of video files needed
    // 
    const INTRO = `jb2a.magic_signs.rune.${school}.intro.${color}`
    const BODY = `jb2a.magic_signs.rune.${school}.loop.${color}`
    const OUTRO = `jb2a.magic_signs.rune.${school}.outro.${color}`
    //-----------------------------------------------------------------------------------------------
    // Change TokenDocument5e to Token5e
    // 
    //let t1 = {}
    //if (token1.constructor.name === "TokenDocument5e") t1 = token1._object
    //else t1 = token1
    //-----------------------------------------------------------------------------------------------
    // Play the VFX
    // 
    new Sequence()
        .effect()
        .file(INTRO)
        .atLocation(target)
        .scaleToObject(scale)
        .opacity(opacity)
        .waitUntilFinished(-500)
        .fadeOut(1500)
        .effect()
        .file(OUTRO)
        .atLocation(target)
        .scaleToObject(scale)
        .opacity(opacity)
        .fadeOut(2000)
        .play();
}