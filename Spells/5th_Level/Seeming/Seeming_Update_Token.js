const MACRONAME = "Seeming_Update_Token.0.1.js"
const TL = 0;                               // Trace Level for this macro
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
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const IMAGE_DIR = 'Icons_JGB/Seeming'
let onUseMacro = false
const TOKENS = canvas.tokens.controlled // Used by macro menu invocation
const TEMPLATE_NAME = "%%Revert Appearance%%"
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
    for (i = 0; i < fileTypeArray.length; i++) {
        for (j = 0; j < filesObj[fileTypeArray[i]].length; j++) {
            nameArray.push(filesObj[fileTypeArray[i]][j])
            nameExtArray.push(`${filesObj[fileTypeArray[i]][j]}.${fileTypeArray[i]}`)
        }
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Get list of tokens to act upon
    //
    if (onUseMacro) {  // Running as a On_Use Macro, need to get tokens from target(s)
        if (TL > 0) jez.log(`${TAG} Running as an On_Use Macro`);
        if (L_ARG.targets.length === 0)
        return jez.badNews(`Must target at least one token.`, 'w')
        for (i = 0; i < L_ARG.targets.length; i++) {
            if (TL > 3) jez.log(`${TAG} Process ${L_ARG.targets[i].name}`, L_ARG.targets[i]);
            await doIt(L_ARG.targets[i], nameArray, nameExtArray, { traceLvl: TL })
        }
    } else {            // Running from macro menu, need to get tokens from tokens value
        if (!TOKENS.length) jez.badNews(`Must select at least one token to operate on.`, 'e')
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
 * 
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
    //
    const TEMP_SPELL_NAME = `${subject.name}'s Revert Appearance`
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Present selection dialog for new icon/name
    //
    let queryTitle = `Select New Appearance`
    let queryText = `Pick a new appearance for <b>${subject.name}</b> from the list (or I'll do nothing!)`
    const PICKED_NAME = await jez.pickRadioListArray(queryTitle, queryText, () => { }, nameArray);
    if (PICKED_NAME === null) return  // Bail out if user selects cancel
    if (!PICKED_NAME) return          // Bail out if user selects nothing
    if (TL > 1) jez.trace(`${TAG} Name selected: ${PICKED_NAME}`)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Grab existing token file path and name
    //
    const OLD_NAME = subject.name
    const OLD_IMAGE = subject.data.img
    if (TL > 1) jez.trace(`${TAG} Existing Token Information`, "Name", OLD_NAME, "Image", OLD_IMAGE)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Define variables to hold new token file path and name, calling specialCasesPath() to build new image name considering special cases.
    //
    let index = nameExtArray.findIndex(element => element.includes(PICKED_NAME))
    const NEW_IMAGE = await specialCasesPath(nameArray[index], nameExtArray[index], { traceLvl: TL })
    const NEW_NAME = await specialCasesName(PICKED_NAME, {traceLvl: TL})
    // const NEW_IMAGE = IMAGE_DIR + '/' + nameExtArray[index]
    if (TL > 1) jez.trace(`${TAG} New Token Information`, "Name", NEW_NAME, "Image", NEW_IMAGE)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Begin to create a reversion from NEW data to old action for affected token
    //
    if (TL > 2) jez.trace(`${TAG} Adding ${TEMPLATE_NAME} to ${subject.name}`);
    await jez.itemAddToActor(subject, TEMPLATE_NAME)
    let itemUpdate = {
        name: TEMP_SPELL_NAME,
    }
    await jez.itemUpdateOnActor(subject, TEMPLATE_NAME, itemUpdate, "spell")
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Update the itemMacro in the just created spell
    //
    if (TL > 3) jez.trace(`${TAG} itemFindOnActor data`, "subject", subject, "TEMP_SPELL_NAME", TEMP_SPELL_NAME);
    let getItem = await jez.itemFindOnActor(subject, TEMP_SPELL_NAME, "spell");
    if (TL > 2) jez.trace(`${TAG} getItem`, getItem);
    //-------------------------------------------------------------------------------------------
    // Update the macro field
    //
    let macro = getItem.data.flags.itemacro.macro.data.command
    macro = macro.replace(/%OLD_NAME%/g, `${subject.data.name}`);
    macro = macro.replace(/%OLD_IMAGE%/g, `${subject.data.img}`);
    if (TL > 4) jez.trace(`${TAG} Updated Macro`, macro);
    //-------------------------------------------------------------------------------------------
    // Build a new itemUpdate Object
    //
    itemUpdate = {
        flags: {
            itemacro: {
                macro: {
                    data: {
                        command: macro,
                        name: TEMP_SPELL_NAME,
                    },
                },
            },
        },
    }
    //-------------------------------------------------------------------------------------------
    // Update the item with new information
    //
    if (TL > 3) jez.trace(`${TAG} Call jez.itemUpdateOnActor(`, 'subject', subject, 'TEMP_SPELL_NAME', TEMP_SPELL_NAME, 
        "itemUpdate", itemUpdate);
    await jez.itemUpdateOnActor(subject, TEMP_SPELL_NAME, itemUpdate, "spell")
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Update the OLD to NEW data on the token
    // ItemMacro subject will be of type TokenDocument5e, direct execution will be Token5e.  Need to point at document in Token5e 
    // if present.
    let doc = subject                                                   // Should be a TokenDocument5e
    if (subject.constructor.name === "Token5e") doc = subject.document  // Was a Token5e
    doc.update({
        name: NEW_NAME,
        img: NEW_IMAGE
    })
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Handle special case image selections -- multiple image files for generic types
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function specialCasesPath(newName, extension, options = {}) {
    const FUNCNAME = "specialCasesPath(newName, options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "newName", newName, "options", options);
    //-----------------------------------------------------------------------------------------------------------------------------------
    //
    let path = ""
    switch (newName) {
        case "Vistana Man": path = "Tokens/CoS_NPC/Vistani/AM_*.png"; break
        case "Vistana Woman": path = "Tokens/CoS_NPC/Vistani/AF_*.png"; break
        case "Barovian Man": path = "worlds/travels-in-barovia/characters/177_-_Barovian_Man/sides/side_*.png"; break
        case "Barovian Woman": path = "worlds/travels-in-barovia/characters/638_-_Barovian_Woman/sides/*.png"; break
        case "Spawn": path = "Tokens/CoS_NPC/Vamp_Spawn/*.png"; break
        case "Zombie": path = "Tokens/Undead/Tokens/Zombie.*.png"; break
        default:
            return IMAGE_DIR + '/' + extension
    }
    let dirMatches = await FilePicker.browse("data", path, { wildcard: true })
    return dirMatches.files[Math.floor(Math.random() * dirMatches.files.length)]
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Handle special cases, table look ups, for certain types of appearances
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function specialCasesName(newName, options = {}) {
    const FUNCNAME = "specialCasesName(newName, options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "newName", newName, "options", options);
    //----------------------------------------------------------------------------------
    // Nab something witty (I hope) from the tableName table
    //
    // console.log(await rollOnTable('Barovian Female', {traceLvl: 0}))
    // console.log(await rollOnTable('Barovian-Sir-Names-Female', {traceLvl: 0}))
    async function rollOnTable(tableName, options = {}) {
        const FUNCNAME = "rollOnTable(tableName, options = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `${MACRO} ${FNAME} |`
        const TL = options.traceLvl ?? 0
        if (TL === 1) jez.log(`${TAG} --- Starting ---`);
        if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "tableName", tableName, "options", options);
        //----------------------------------------------------------------------------------
        let table = game.tables.getName(tableName);
        if (table) {
            if (TL > 1) jez.trace(`${TAG} Name table`, table)
            let roll = await table.roll();
            msg = roll.results[0].data.text;
        } else {
            jez.badNews(`No name (${tableName}) table found.`, "e")
            msg = `${tableName} failed`;
        }
        return msg
    }
      //-----------------------------------------------------------------------------------------------------------------------------------
    //
    switch (newName) {
        case "Vistana Man": return await rollOnTable('Name-First-Vistani-Male') + ' ' + await rollOnTable('Name-Last-Vistani')
        case "Vistana Woman": return await rollOnTable('Name-First-Vistani-Female') + ' ' + await rollOnTable('Name-Last-Vistani')
        case "Barovian Man": return await rollOnTable('Barovian Male') + ' ' + await rollOnTable('Barovian-Sir-Names-Male')
        case "Barovian Woman": return await rollOnTable('Barovian Female') + ' ' + await rollOnTable('Barovian-Sir-Names-Female')
        default: return newName
    }
}