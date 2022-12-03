const MACRONAME = "View_Delete_Flags.0.1.js"
/******************************************************************************
 * Macro to view and optionally clear some or all flags on a token
 * 
 * This macro should be run from the hotbar with a (one!) token of interest 
 * selected in a scene.
 *
 * 12/02/22 0.1 Creation
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
        jez.badNews(`Must select one token that will be read and optionally have flag(s) cleared.  
            Selected ${canvas.tokens.controlled.length}`)
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
        title: "Open Selected Actor's DAE Flags",
        content: `<p>This macro will show currently set DAE flags on <b>${sToken.name}</b>'s 
        actor's sheet.</p>  
        <p>It will allow the selection of flags to clear and then clear those selected.</p>
        <p>Would you like to continue?</p>`,
        yes: () => workHorse(sToken),
        no: () => console.log("You choose ... to quit"),
        defaultYes: true
       });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Use Selection Information...
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 async function workHorse(dataObj) {
    const FUNCNAME = "workHorse()";
    jez.log(`--- Start ${FUNCNAME} ---`, 
        "dataObj  ", dataObj, 
        "DAE Flags", dataObj.actor.data.flags.dae)
    //----------------------------------------------------------------------------------------------
    // Update item in side bar, by calling a macro from this macro
    //
    const DAE_FLAGS = dataObj.actor.data.flags.dae
    console.log(`DAE Flags for ${dataObj.name}`,DAE_FLAGS)

    let propTextArray = []
    let propHtmlArray = []

    for (const property in DAE_FLAGS) {
        console.log(`Flag ${property} value`,DAE_FLAGS[property])
        const TYPE = jez.typeOf(DAE_FLAGS[property])
        const PROP_OBJ = padString(`${property}`, 10)
        const TYPE_OBJ = padString(`${TYPE}`, 10)
        propTextArray.push(`${PROP_OBJ.text} ${TYPE_OBJ.text} ${DAE_FLAGS[property]}`)
        propHtmlArray.push(`${PROP_OBJ.html} ${TYPE_OBJ.html} ${DAE_FLAGS[property]}`)
      }
    // for (let i = 0; i < propTextArray.length; i++) console.log(`  propTextArray[${i}]`, propTextArray[i]);
    // for (let i = 0; i < propHtmlArray.length; i++) console.log(`  propHtmlArray[${i}]`, propHtmlArray[i]);

    const queryTitle = "Select Flags to be Cleared"
    const queryText = "Pick as many as you like from the list"
    // jez.pickCheckListArray(queryTitle, queryText, pickCheckCallBack, actorItems.sort());
    const MOOD = await jez.pickCheckListArray(queryTitle, queryText, null, propHtmlArray.sort());

    if (MOOD === null) return jez.badNews(`Selected "Cancel" on dialog`,'i')
    if (MOOD.length === 0) return jez.badNews(`Didn't select any flags to be cleared`,'i')

    for (let i = 0; i < MOOD.length; i++) {
        const FLAG = MOOD[i].split('.')[0]
        console.log(`Clear: "${FLAG}"`)
        let msg = `Cleared DAE flag "${FLAG}". <br>${MOOD[i]}`
        let title = `Cleared ${FLAG} flag`
        jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: dataObj.data.img, 
            msg: msg, title: title, token: dataObj})
        await DAE.unsetFlag(dataObj.actor, FLAG);
    }

    return
    
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

function padString(input, size) {
    let output = {
        text: input,
        html: input
    }
    if (output.length >= size) return(output)
    do {
        output.text += ' '
        output.html += '. '
    }
    while  (output.text.length < size)
    return(output)
}