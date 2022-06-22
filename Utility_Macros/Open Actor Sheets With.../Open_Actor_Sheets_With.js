const MACRONAME = "Open_Actor_Sheets_With.0.4.js"
/******************************************************************************
 * Macro to find all actors who have a specified item and open their sheets
 * to make replacing items easier.
 * 
 * This macro should be run from the hotbar with a (one!) token of interest 
 * selected in a scene.
 *
 * 12/03/21 0.1 Creation
 * 01/23/22 0.2 Add Front end to enter the item name
 * 01/30/22 0.3 Add Radio Button possibility and change calls to jez-lib funcs
 * 06/20/22 0.4 Update to use jez-lib dialog function
 *****************************************************************************/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
 console.log(`       ============== Starting === ${MACRONAME} =================`);
 for (let i = 0; i < args.length; i++) console.log(`  args[${i}]`, args[i]);
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let msg = ""
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
main();
jez.log(`============== Finishing === ${MACRONAME} =================`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
async function preCheck() {
    if (canvas.tokens.controlled.length !== 1) {
        jez.badNews(`Must select one token to be used to find the item that will be searched for.  Selected ${canvas.tokens.controlled.length}`)
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: "Icons_JGB/Misc/Jez.png",
            msg: msg, title: `Try Again, Selecting One Token`,
        })
        return (false)
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Main function
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function main() {
    if (!preCheck()) return (false)
    //--------------------------------------------------------------------------------------------
    // Setup variables for main function & children
    //
    let sToken = canvas.tokens.controlled[0]
    let promptObj = {
        // title1: "What item of type of thing should be Refreshed?",
        // text1 : "Please, pick item type from list below.",
        // title2: "Which specific item should be Refreshed?",
        // text2 : "Pick one from list of items of the type picked in previous dialog.",
        title3: "Select Actors to Open",
        text3 : "Choose the actor(s) to have their sheets opened onto screen"
    }
    //--------------------------------------------------------------------------------------------
    // Start the real efforts
    //
    Dialog.confirm({
        title: "Open Selected Actor's Sheets",
        content: `<p>This macro will lead you through selecting an item located on 
        <b>${sToken.name}</b>'s actor's sheet.</p>  
        <p>It will then find all actors in the actor's directory that have that item and 
        ask you to select those that you would like to open onto the screen.</p>
        <p>Would you like to continue?</p>`,
        yes: () => jez.selectItemOnActor(sToken, promptObj, workHorse),
        no: () => console.log("You choose ... to quit"),
        defaultYes: true
       });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Use Selection Information...
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 async function workHorse(dataObj) {
    const FUNCNAME = "workHorse()";
    jez.log(`--- Starting --- ${MACRONAME} ${FUNCNAME} ---`, "dataObj.sToken",dataObj.sToken,"dataObj.idArray", dataObj.idArray, "dataObj.itemName", dataObj.itemName, "dataObj.itemType", dataObj.itemType)
    //----------------------------------------------------------------------------------------------
    // Update item in side bar, by calling a macro from this macro
    //
    let i = 0
    msg = `<u>Opened ${dataObj.idArray.length} actor(s) with ${dataObj.itemName} ${dataObj.itemType}</u><br>`
    for (let line of dataObj.idArray) {
        msg += `${++i}) ${game.actors.get(line).name}<br>`
        game.actors.get(line).sheet.render(true);
    }
    // jez.log(`Actors with ${dataObj.itemName}`)
    jez.postMessage({ color: "purple", fSize: 14, msg: msg, title: `Actors with ${dataObj.itemName} ${dataObj.itemType}` })
    // jez.log(`Ending ${MACRONAME}`);

    jez.log(`--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
}