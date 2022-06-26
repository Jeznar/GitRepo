const MACRONAME = "Search_Items_In_Sidebar.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * 
 * 06/25/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let msg = "";
//----------------------------------------------------------------------------------------
// Items searched for are coded below
//
const EFFECT = "macro.CUB"              // Name of effect to be found
const TARGET = "DisplayDescription"     // Name of ItemMacro to be found
//----------------------------------------------------------------------------------------
// Build Array of item names
//
let itemNameArray = []
for (const element of game.items.contents) itemNameArray.push(element.name);
itemNameArray.sort
//----------------------------------------------------------------------------------------
// Print duplicate item names, if any
//
jez.log("")
jez.log("Duplicate Items Found (if any)")
jez.log("------------------------------")
for (let i = 0; i < itemNameArray.length; i++) 
    if (itemNameArray[i] === itemNameArray[i+1]) jez.log(itemNameArray[i])
//----------------------------------------------------------------------------------------
// Search for effects that utilize CUB 
//
jez.log("")
jez.log(`Searching Items for ${EFFECT} effects`)
jez.log("-----------------------------------------")
for (const element of game.items.contents) {
    if (element.data?.effects?.contents.length > 0) {
        for (const ACTIVE_EFFECT of element.data.effects.contents) {
            for (const changes of ACTIVE_EFFECT.data?.changes) {
                if (changes.key.includes(EFFECT))
                    jez.log(`Item "${element.name}" effect "${ACTIVE_EFFECT.data.label}" has "${changes.key}"`)
            }
        }
    }
}
//----------------------------------------------------------------------------------------
// Search for instances of a string in itemMacro fields -- Find calls to a specific macro
//
jez.log("")
jez.log(`Searching Items for ${TARGET}`)
jez.log("-----------------------------------------")
for (const element of game.items.contents) {
    // jez.log(element.data.flags)
    if (element.data?.flags["midi-qol"]?.onUseMacroName?.includes(TARGET)) {
        jez.log(`${element.name} calls ${element.data?.flags["midi-qol"]?.onUseMacroName}`)
    }
}