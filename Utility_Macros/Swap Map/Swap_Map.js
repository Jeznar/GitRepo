const MACRONAME = "Swap_Map"
console.log(MACRONAME)
/*****************************************************************************************
 * This macro will find the "next" map for a given scene.  
 * 
 * 1. Obtain the file namd and path for the background image of the current scene
 * 2. Parse the file name, into tokens deliminatd by periods (.)
 * 3. Increment the second from last token which must process as a number (sequenceNum)
 * 4. Check to see if the "next" (squenceNum + 1) exists
 *    - If it does, swap it in as the background image
 *    - Otherwise, look for a file with a sequenceNum of zero and swap that in.
 * 
 * Inspired by macro posted by u/vtsandtrooper on Reddit.
 *  https://www.reddit.com/r/FoundryVTT/comments/ps7v1q/battle_map_change_macro/
 * 
 * 02/01/22 0.1 Creation of Macro
 *****************************************************************************************/
let msg = ""
let targetExists = false
//----------------------------------------------------------------------------------------
// Get the existing background image path with file name and burst it into an array
//
jez.log("canvas.scene.data.img", canvas.scene.data.img)
if (!canvas.scene.data.img) {
    msg = `Background image file is not defined in this scene`
    console.log(msg)
    ui.notifications.warn(msg)
    return
}
const PATH_PARTS = canvas.scene.data.img.split("/");
for (let i = 0; i < PATH_PARTS.length; i++) jez.log(`  PATH_PARTS[${i}]`, PATH_PARTS[i]);
//----------------------------------------------------------------------------------------
// Remove the actual file name from the array and stash it to a new constant.
//
const FILE_NAME = PATH_PARTS.pop();
//----------------------------------------------------------------------------------------
// Put the path into a single variable
//
let path = ""
for (let i = 0; i < PATH_PARTS.length; i++) path += PATH_PARTS[i] + "/";
jez.log("File Path", path)
//----------------------------------------------------------------------------------------
// Burst the filename into tokens delimited by period characters
//
const FILE_PARTS = FILE_NAME.split(".");
if (FILE_PARTS < 3) {
    msg = `${FILE_PARTS} is not enough tokens delimited by periods in scene file, must of form: Name.#.ext`
    console.log(msg)
    ui.notifications.error(msg)
    return
}
//----------------------------------------------------------------------------------------
// Stash the last token as the file extension
//
const EXTENSION = FILE_PARTS.pop();
jez.log("Extension", EXTENSION)
//----------------------------------------------------------------------------------------
// Stash the next to last token as the sequence number (it has to be a number)
//
const SEQ_NUM = FILE_PARTS.pop();
jez.log("File SeqNum", SEQ_NUM)
let num = Number(SEQ_NUM)
jez.log("typeof(num)", typeof (num))
if (Number.isNaN(num)) {
    let fileName = ""
    for (let i = 0; i < FILE_PARTS.length; i++) fileName += FILE_PARTS[i];
    msg = `Last period delimited token in scene file name (${fileName}) is not a number`
    console.log(msg)
    ui.notifications.error(msg)
    return
}
jez.log("Current Number", num)
//----------------------------------------------------------------------------------------
// Rebuild the base file name, in case it had more delimiters
//
let baseName = ""
for (let i = 0; i < FILE_PARTS.length; i++) baseName += FILE_PARTS[i];
jez.log("File Base", baseName)
//----------------------------------------------------------------------------------------
// Check for existance of next file
//
let next = num + 1
jez.log("Next Number", next)
let nextFile = path + baseName + "." + next + "." + EXTENSION
jez.log("nextFile", nextFile)
targetExists = await srcExists(nextFile)
jez.log("next file exists", targetExists)
//----------------------------------------------------------------------------------------
// If next file in sequence didn't exist, go back and see of 0 or 1 is start of sequence
//
if (!targetExists) {                                // Need to go to start of sequence
    nextFile = path + baseName + ".0." + EXTENSION  // Check seq number 0 for existance
    jez.log("nextFile", nextFile)
    targetExists = await srcExists(nextFile)
    jez.log("base file exists at sequence #0", targetExists)   
}
if (!targetExists) {                                // No file at 0, try 1
    nextFile = path + baseName + ".1." + EXTENSION  // Check seq number 1 for existance
    jez.log("nextFile", nextFile)
    targetExists = await srcExists(nextFile)
    jez.log("base file exists at sequence #1", targetExists)   
}
jez.log("Swap to file", nextFile)
//----------------------------------------------------------------------------------------
// Now, actually execute the swap (silly easy versus the checking above)
//
canvas.scene.update({img: nextFile});
return