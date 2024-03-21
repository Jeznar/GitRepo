const MACRONAME = "Seeming_Swap_Image.0.1.js"
const TL = 2;                               // Trace Level for this macro
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform swap of token image and name.
 * 
 * Can be run from macro bar, in which case it affects the selected tokens
 *  -or-
 * Run as an Item Macro affecting trageted tokens.
 * 
 * 03/20/24 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.log(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
// let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
// let aActor = aToken.actor;
// let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const IMAGE_DIR = 'Icons_JGB/Seeming'
let onUseMacro = false
const TOKENS = canvas.tokens.controlled // Used by macro menu invocation
//-----------------------------------------------------------------------------------------------------------------------------------
// Determine execution mode and take appropriate steps
//
if (args.length) {  // Implies we are running as a On_Use Macro
    if (TL > 0) jez.log(`${TAG} Running as an On_Use Macro`);
    onUseMacro = true

} else {            // Running from macro menu, no an On_Use
    if (TL > 0) jez.log(`${TAG} Running as a Menu Macro`);
    onUseMacro = false
}
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse" && onUseMacro) await doOnUse({ traceLvl: TL })          // Midi ItemMacro On Use
else await doOnUse({ traceLvl: TL })
if (TL > 1) jez.log(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Get the pre-setup images that are available in the IMAGE_DIR
    //
    let filesObj = await jez.getFileNames({ DIR: IMAGE_DIR })
    if (TL > 2) jez.log(`${TAG} file object for images`, filesObj)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Build Array of names from the collection of types and parallel array with extensions (and spaces replaced ??)
    //
    let nameArray = []
    let nameExtArray = []
    fileTypeArray = Object.getOwnPropertyNames(filesObj)
    console.log('fileTypeArray', fileTypeArray)
    for (i = 0; i < fileTypeArray.length; i++) {
        console.log('i', i, fileTypeArray[i])
        console.log('filesObj', filesObj)
        for (j = 0; j < filesObj[fileTypeArray[i]].length; j++) {
            nameArray.push(filesObj[fileTypeArray[i]][j])
            nameExtArray.push(`${filesObj[fileTypeArray[i]][j]}.${fileTypeArray[i]}`)
        }
        console.log(`done with ${fileTypeArray[i]}`)
    }
    console.log(nameArray)
    console.log(nameExtArray)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Get list of tokens to act upon
    //
    if (onUseMacro) {  // Running as a On_Use Macro, need to get tokens from target(s)
        if (TL > 0) jez.log(`${TAG} Running as an On_Use Macro`);

    } else {            // Running from macro menu, need to get tokens from tokens value
        if (!TOKENS.length) jez.badNews(`Must select at least one token to operate on.`,'e')
        if (TL > 2) jez.log(`${TAG} ${TOKENS.length} tokens selected`);
        for (i = 0; i < TOKENS.length; i++) {
            if (TL > 3) jez.log(`${TAG} Process ${TOKENS[i].name}`, TOKENS[i]);
            await doIt(TOKENS[i], nameArray, nameExtArray, { traceLvl: TL })
        }
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 0) jez.log(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doIt(subject, nameArray, nameExtArray, options = {}) {
    const FUNCNAME = "doIt(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "subject", subject, "nameArray", nameArray, 
        "nameExtArray", nameExtArray, "options", options);
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Present selection dialog for new icon/name
    //
    let queryTitle = `Select New Appearance`
    let queryText = "Pick a new appearance for <b>${subject.name}</b> from the list (or I'll pick one for you!)"
    const NEW_NAME = await jez.pickRadioListArray(queryTitle, queryText, () => { }, nameArray);
    if (NEW_NAME === null) return  // Bail out if user selects cancel
    if (!NEW_NAME) return          // Bail out if user selects nothing
    if (TL > 1) jez.trace(`${TAG} NEW_NAME selected: ${NEW_NAME}`)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Grab existing token file path and name
    //
    const OLD_NAME = subject.name
    const OLD_IMAGE = subject.img
    if (TL > 1) jez.trace(`${TAG} Existing Token Information`, "Name", OLD_NAME, "Image", OLD_IMAGE)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Define variables to hold new token file path and name
    //
    const NEW_IMAGE = IMAGE_DIR + '/' + NEW_NAME + '.'
    if (TL > 1) jez.trace(`${TAG} New Token Information`, "Name", NEW_NAME, "Image", NEW_IMAGE)

    // Create a reversion NEW_IMAGE for affected token

    // Replace the token file path and name
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return;
}