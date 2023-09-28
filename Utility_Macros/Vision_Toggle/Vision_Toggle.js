const MACRONAME = "Fiddle_with_Vision.0.1.js"
const TL = 5;                               // Trace Level for this macro
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * This macro offers a menu that allows the user (GM) to choose which of four actions to perform on all of the player controlled
 * tokens on the map.  It runs against the selected tokens, or if none selected, all in the scene.
 * 
 * NOTE: This is not to be run from inside an item.  It is not an ItemMacro.Macro.
 * 
 * The four actions are:
 *  1. Turn off shared vision (if it is on), stashing the original state in a flag
 *  2. Restore shared vision to that state stored in flag, clearing the flag after use
 *  3. Turn off special vision modes (darkvision, devil sight, etc.) and light emissions.  Set sight to minium and stash values
 *  4. Restore vision to original state and clear flag used to store the data.
 * 
 * 09/27/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.log(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const NONE = 0
const OBSERVER = 2
const OBSERVER_FLAG = `${MACRO}-Observers`
const VISION_FLAG = `${MACRO}-Vision`
const BASIC_DIM_SIGHT = 2.5
const BASIC_BRIGHT_SIGHT = 0
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedure
//
main({ traceLvl: TL });
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 * This runs on actor that has the affected applied to it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function main(options = {}) {
    const FUNCNAME = "main(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Function Variables
    //
    let pcTokens = [];
    let pcNames = [];
    const BOTH_REMOVE = 'Remove observer & vision';
    const OBSERVER_REMOVE = 'Remove observer';
    const VISION_REMOVE = 'Remove vision';
    const BOTH_RESET = 'Reset observer & vision';
    const OBSERVER_RESET = 'Reset observer';
    const VISION_RESET = 'Reset vision';
    const ACTION_CHOICES = [BOTH_REMOVE, OBSERVER_REMOVE, VISION_REMOVE, BOTH_RESET, OBSERVER_RESET, VISION_RESET]
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build a list of eligible tokens, if we don't have at least one selected, then use all tokens on the canvas
    //
    const TOKENS = canvas.tokens?.controlled?.length ? canvas.tokens?.controlled : canvas.tokens.ownedTokens
    if (TOKENS.length === 0) return jez.badNews(`Must have at least one token on the scene`, 'w')
    if (TL > 2) jez.log(`${TAG} | Selected tokens`, TOKENS)
    // Loop through the tokens looking only for PCs
    for (let i = 0; i < TOKENS.length; i++) {
        if (TOKENS[i].actor.data.type === "character") {                                  // Check if it is an npc selected 
            if (TL > 2) jez.log(`${TAG} ${TOKENS[i].name} is a PC, adding`);
            if (TOKENS[i].name.includes('---')) return jez.badNews(`Names with triple dashs not supported: ${TOKENS[i].name}`, 'e')
            pcTokens.push(TOKENS[i])
        } else if (TL > 2) jez.log(`${TAG} Skipping ${TOKENS[i].name} not a PC`);         // log the PC token's name
    }
    // Did we get at least one PC?
    if (pcTokens.length === 0) return jez.badNews(`Must have at least one PC token selected`, 'w')
    if (TL > 2) for (let i = 0; i < pcTokens.length; i++) {
        jez.log(`${TAG} PC ${i + 1} ${pcTokens[i].name}`)
        pcNames.push(`${pcTokens[i].name} --- ${pcTokens[i].id}`)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Offer a list of things this macro can do
    //
    let queryTitle = "Select Action from List"
    let queryText = "Pick one from the list (or I'll just quit)"
    const ACTION = await jez.pickRadioListArray(queryTitle, queryText, () => { }, ACTION_CHOICES);
    if (ACTION === null) return  // Bail out if user selects cancel
    if (!ACTION) return          // Bail out if user selects nothing
    if (TL > 1) jez.trace(`${TAG} Action selected: ${ACTION}`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Show list of PCs and have the GM pick the PCs to be updated
    //
    queryTitle = "Select Tokens to be Updated"
    queryText = "Pick as many as you like from the list"
    const SELECTED_TOKENS = await jez.pickCheckListArray(queryTitle, queryText, null, pcNames.sort());
    if (SELECTED_TOKENS === null) return jez.badNews(`Selected "Cancel" on dialog`, 'i')
    if (SELECTED_TOKENS.length === 0) return jez.badNews(`Didn't select any tokens to be acted on`, 'i')
    if (TL > 2) jez.log(`${TAG} PC's selected`, SELECTED_TOKENS)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build an array of the tokens we're going to update
    //
    let cTokenIds = []
    let cTokens = []
    for (let i = 0; i < SELECTED_TOKENS.length; i++) {
        if (TL > 2) jez.log(`${TAG} ${i + 1} SELECTED_TOKENS[${i}]`, SELECTED_TOKENS[i])
        cTokenIds.push(SELECTED_TOKENS[i].split(" --- ")[1]);
        for (let j = 0; j < pcTokens.length; j++) {
            if (TL > 2) jez.log(`${TAG} checking ${i} ${cTokenIds[i]}, ${j} ${pcTokens[j].id}`,)
            if (pcTokens[j].id === cTokenIds[i]) cTokens.push(pcTokens[j])
        }
    }
    if (TL > 2) jez.log(`${TAG} Chosen token IDs`, cTokenIds)
    if (TL > 2) jez.log(`${TAG} Chosen tokens   `, cTokens)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Do the thing selected to the eligible tokens (cTokens) selected
    //
    switch (ACTION) {
        case OBSERVER_REMOVE:
            if (TL > 1) jez.trace(`${TAG} Execute: ${OBSERVER_REMOVE}`)
            await observerRemove(cTokens, { traceLvl: TL });
            break;
        case OBSERVER_RESET:
            if (TL > 1) jez.trace(`${TAG} Execute: ${OBSERVER_RESET}`)
            await observerReset(cTokens, { traceLvl: TL });
            break;
        case VISION_REMOVE:
            if (TL > 1) jez.trace(`${TAG} Execute: ${VISION_REMOVE}`)
            await visionRemove(cTokens, { traceLvl: TL });
            break;
        case VISION_RESET:
            if (TL > 1) jez.trace(`${TAG} Execute: ${VISION_RESET}`)
            await visionReset(cTokens, { traceLvl: TL });
            break;
        case BOTH_REMOVE:
            if (TL > 1) jez.trace(`${TAG} Execute: ${OBSERVER_REMOVE}`)
            await observerRemove(cTokens, { traceLvl: TL });
            if (TL > 1) jez.trace(`${TAG} Execute: ${VISION_REMOVE}`)
            await visionRemove(cTokens, { traceLvl: TL });
            break;
        case BOTH_RESET:
            if (TL > 1) jez.trace(`${TAG} Execute: ${OBSERVER_RESET}`)
            await observerReset(cTokens, { traceLvl: TL });
            if (TL > 1) jez.trace(`${TAG} Execute: ${VISION_RESET}`)
            await visionReset(cTokens, { traceLvl: TL });
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function observerRemove(cTokens, options = {}) {
    const FUNCNAME = "observerRemove(cTokens, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "cTokens", cTokens, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // function variables.
    //  
    let keys = []
    let observerPermissionIds = []
    //-------------------------------------------------------------------------------------------------------------------------------
    // Need to build an array of the userids that have observer (2) permission which needs to be set to none (0). 
    // The data we need lives in token.actor.data.permission which is an object with pairs of userId: value.
    //   permission might look like this:
    //     N2Q1YzM3NzZkYjY1: 3  // User is Jen M. with Owner (3) permission
    //     Y2Q0MmZjODY5ODI3: 2  // User is Joe B. with Observer (2) permission
    //     ZjFlOWYxZjM5ZTZj: 3  // User is Sean D. with Owner (3) permission (I have no idea why)
    //     default: 0           // Default has no permissions
    //
    for (let i = 0; i < cTokens.length; i++) {
        if (TL > 1) jez.trace(`${TAG} Finding permissions that need changed on ${cTokens[i].name}`)
        let permissions = cTokens[i].actor.data.permission;
        keys = Object.keys(permissions) // Puts array of the keys of object into keys.
        if (TL > 2) jez.trace(`${TAG} Keys`, keys)
        //--------------------------------------------------------------------------------------------------------------------------
        // Get the flag (if any) that contains previously downgraded permissions
        //
        const OLD_VALUE = await DAE.getFlag(cTokens[i].actor, OBSERVER_FLAG);
        observerPermissionIds = OLD_VALUE ? OLD_VALUE : []
        //--------------------------------------------------------------------------------------------------------------------------
        // Step through the keys, adding any with Obeserver permission to our array
        for (let j = 0; j < keys.length; j++) {
            if (permissions[keys[j]] === OBSERVER) {
                if (!observerPermissionIds.includes(keys[j])) observerPermissionIds.push(keys[j])
                permissions[keys[j]] = NONE;    // Set the OBSERVER permission to none
            }
        }
        if (TL > 2) jez.trace(`${TAG} observerPermissionIds`, observerPermissionIds)
        if (TL > 2) jez.trace(`${TAG} permissions`, permissions)
        if (observerPermissionIds.length === 0) continue    // Go to next token if nothing need to be changed
        //--------------------------------------------------------------------------------------------------------------------------
        // Write a flag to our actor recording who had observer status that we are going to remove
        //
        if (TL > 2) jez.trace(`${TAG} cTokens[${i}].actor`, cTokens[i].actor)
        await DAE.setFlag(cTokens[i].actor, OBSERVER_FLAG, observerPermissionIds);
        //--------------------------------------------------------------------------------------------------------------------------
        // Update our actor so that observer have no permissions (NONE)
        //
        cTokens[i].actor.update({ 'permission': permissions })
    }
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function observerReset(cTokens, options = {}) {
    const FUNCNAME = "observerReset(cTokens, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "cTokens", cTokens, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Step through the tokens, get flag value and update Observer permissions
    //
    for (let i = 0; i < cTokens.length; i++) {
        if (TL > 1) jez.trace(`${TAG} Finding permissions that need changed on ${cTokens[i].name}`)
        let permissions = cTokens[i].actor.data.permission;
        //--------------------------------------------------------------------------------------------------------------------------
        // Get the flag (if any) that contains previously downgraded permissions
        //
        const RESTORE_VALUES = await DAE.getFlag(cTokens[i].actor, OBSERVER_FLAG);
        if (TL > 2) jez.trace(`${TAG} RESTORE_VALUES`, RESTORE_VALUES)
        if (!RESTORE_VALUES) continue        // if nothing needs updated, go to next token
        //--------------------------------------------------------------------------------------------------------------------------
        // Step through the values in the flag setting OBSERVER permission 
        for (let j = 0; j < RESTORE_VALUES.length; j++) {
            if (TL > 2) jez.trace(`${TAG} ${j} RESTORE_VALUES`, RESTORE_VALUES[j])
            permissions[RESTORE_VALUES[j]] = OBSERVER
        }
        if (TL > 2) jez.trace(`${TAG} permissions`, permissions)
        //--------------------------------------------------------------------------------------------------------------------------
        // Update our actor so that observer has reset permissions
        //
        cTokens[i].actor.update({ 'permission': permissions })
    }
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Loop through the supplied tokens.  For tghose with vision, stash current values and set them to basic
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function visionRemove(cTokens, options = {}) {
    const FUNCNAME = "visionRemove(cTokens, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "cTokens", cTokens, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // function variables.
    //  
    let dimSight, brightSight
    //-------------------------------------------------------------------------------------------------------------------------------
    // Loop through the tokens, servicing each
    //
    for (let i = 0; i < cTokens.length; i++) {
        if (TL > 1) jez.trace(`${TAG} Does ${cTokens[i].name} have vision?`, cTokens[i].data)
        if (cTokens[i].data.vision !== true) {
            if (TL > 1) jez.trace(`${TAG} Nope ${cTokens[i].name} lacks vision, skip it`)
            continue;
        }
        //--------------------------------------------------------------------------------------------------------------------------
        // Obtain their current vision values
        //
        dimSight = cTokens[i].data.dimSight
        brightSight = cTokens[i].data.brightSight
        //--------------------------------------------------------------------------------------------------------------------------
        // If sight already basic, stop processing this token
        //
        if (dimSight === BASIC_DIM_SIGHT && brightSight === BASIC_BRIGHT_SIGHT) {
            if (TL > 1) jez.trace(`${TAG} Nope ${cTokens[i].name} already has basic vision, skip it`)
            continue
        }
        //--------------------------------------------------------------------------------------------------------------------------
        // Add a flag to our actor to store the original vision settings
        //
        let vision = { dimSight: dimSight, brightSight: brightSight }
        if (TL > 2) jez.trace(`${TAG} Setting ${VISION_FLAG} for ${cTokens[i].name} to`, vision)
        await DAE.setFlag(cTokens[i].actor, VISION_FLAG, vision);
        //--------------------------------------------------------------------------------------------------------------------------
        // Update the token to have basic vision
        //
        cTokens[i].document.update({ "dimSight": BASIC_DIM_SIGHT, "brightSight": BASIC_BRIGHT_SIGHT})
    }
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Loop through the supplied tokens.  Read stashed values and restore them on the token
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function visionReset(cTokens, options = {}) {
    const FUNCNAME = "visionReset(cTokens, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "cTokens", cTokens, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Loop through the tokens, servicing each
    //
    for (let i = 0; i < cTokens.length; i++) {
        const OLD_VALUES = await DAE.getFlag(cTokens[i].actor, VISION_FLAG);
        if (TL > 1) jez.trace(`${TAG} ${cTokens[i].name} had vision stashed?`, cTokens[i].actor.data.flags)
        if (!OLD_VALUES) {
            if (TL > 1) jez.trace(`${TAG} Nope ${cTokens[i].name} had no stashed vision values, skip it`)
            continue;
        }
        if (TL > 1) jez.trace(`${TAG} ${cTokens[i].name} had stashed vision values`, OLD_VALUES)
        //--------------------------------------------------------------------------------------------------------------------------
        // Update the token to have stashed vision values
        //
        cTokens[i].document.update({ "dimSight": OLD_VALUES.dimSight, "brightSight": OLD_VALUES.brightSight})
        //--------------------------------------------------------------------------------------------------------------------------
        // Remove the flag that had stored the data
        //
        await DAE.unsetFlag(cTokens[i].actor, VISION_FLAG);
    }
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return;
}