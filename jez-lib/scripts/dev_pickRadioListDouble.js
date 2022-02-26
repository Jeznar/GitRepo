const MACRONAME = "dev_pickRadioListDouble"
/*******************************************************************************************
 * This macro is for development of a double radio list dialog
 * 
 * It is intended to be run as an ItemMacro from an actor's item and will present two 
 * hardcoded lists from which one choice each should be made.
 *******************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
 jez.log(`------------- Starting ${MACRONAME} --------------------`)
 for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
 const lastArg = args[args.length - 1];
 let aActor;         // Acting actor, creature that invoked the macro
 let aToken;         // Acting token, token for creature that invoked the macro
 let aItem;          // Active Item information, item invoking this macro
 let msg = ""
 if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
 if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
 if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;

//----------------------------------------------------------------------------------
//
const queryTitle = "Select Item in Question"
const QUERY1 = "Caster's Knowledge of the Target"
const QUERY2 = "Caster's Connection to the Target"

const LIST1 = [
    `Arbitrary error`,
    'Secondhand (you have heard of the target) [+5]',
    'Firsthand (you have met the target) [+0]',
    'Familiar (you know the target well) [-5]'
]
const LIST2 = [
    `Arbitrary error`,
    'Likeness or picture [-2]',
    'Possession or garment [-4]',
    'Body part, lock of hair, bit of nail, or the like [-10]'
]

//pickRadioListArray(queryTitle, queryText1, queryText2, pickRadioCallBack, actorItems.sort());
pickRadioListArray(queryTitle, QUERY1, QUERY2, pickRadioCallBack, LIST1, LIST2);

return
//--------------------------------------------------------------------------------------
//
function pickRadioCallBack(selection1, selection2) {
    jez.log("pickRadioCallBack", "selection1", selection1, "selection2", selection2)
    //----------------------------------------------------------------------------------
    // Grab the modifiers out of the selections
    //
    let mod1 = extractMod(selection1)
    if (!mod1) return(false)
    let mod2 = extractMod(selection2)
    if (!mod1) return(false)
    //----------------------------------------------------------------------------------
    // Post a dialog
    //
    jez.postMessage({
        color: "green",
        fSize: 14,
        icon: aToken.data.img,
        msg: `${aToken.name} selected <b>"${selection1}"</b> with a modifier of <b>${mod1}</b> and<br>
            <b>"${selection2}"</b> with a modifier of <b>${mod2}</b> in the dialog`,
        title: `${aToken.name} made a pick`,
        token: aToken
    })
    //----------------------------------------------------------------------------------
    // Check Selection Function.  Return value or null (if none)
    //
    function extractMod(selection) {
        let selArray = selection.match(/[+-]\d+/)
        jez.log('selArray',selArray)
        if (!selArray) {
            msg = `No numeric value found in the selection: '${selection}'`
            ui.notifications.warn(msg);
            console.log(`${MACRO} |`, msg)
            return(false)
        }
        let mod = selArray[0] // "+3"
        jez.log("Modifier extracted", mod)
        return(mod)
    }
}

/***************************************************************************************
 * Create and process radio button dialog, passing it onto specified callback function
 * 
 * const queryTitle = "Select Item in Question"
 * const queryText1 = "Pick one from following list"
 * pickCallBack = call back function
 * options1 array of strings to be offered as choices, perhaps pre-sorted
 * 
 * Sample Call:
 *   const queryTitle = "Select Item in Question"
 *   const queryText1 = "Pick one from the list" 
 *   pickRadioListArray(queryTitle, queryText1, pickRadioCallBack, actorItems.sort());
 ***************************************************************************************/
async function pickRadioListArray(queryTitle, queryText1, queryText2, pickCallBack, options1, options2) {
    const FUNCNAME = "jez.pickFromList(queryTitle, queryText1, [options1]";
    jez.log("---------Starting ---${FUNCNAME}-------------------------------------------",
        `queryTitle`, queryTitle,
        `queryText1`, queryText1,
        `queryText2`, queryText2,
        `pickCallBack`, pickCallBack,
        `options1`, options1,
        `options2`, options2);
    let msg = ""
    if (typeof (pickCallBack) != "function") {
        msg = `pickFromList given invalid pickCallBack, it is a ${typeof (pickCallBack)}`
        ui.notifications.error(msg);
        console.log(msg);
        return
    }
    if (!queryTitle || !queryText1 || !queryText2 || !options1) {
        msg = `pickFromList arguments should be (queryTitle, queryText1, queryText2, pickCallBack, [options1]),
       but yours are: ${queryTitle}, ${queryText1}, ${queryText2}, ${pickCallBack}, ${options1}`;
        ui.notifications.error(msg);
        console.log(msg);
        return
    }

    //----------------------------------------------------------------------------------------------------
    // Build HTML Template, first radio box
    //
    let template = `
<div>
<label>${queryText1}</label>
<div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">
`   // Back tick on its on line to make the console output better formatted
    for (let option of options1) {
        template += `<input type="radio" id="${option}" name="selectedLine1" value="${option}"> <label for="${option}">${option}</label><br>
`   // Back tick on its on line to make the console output better formatted
    }
    template += `</div></div>`
    jez.log("template 1", template)
    jez.log("")
    jez.log("")

    //----------------------------------------------------------------------------------------------------
    // Build HTML Template, second radio box
    //
    template += `
    <div>
    <label>${queryText2}</label>
    <div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">
`   // Back tick on its on line to make the console output better formatted
    for (let option2 of options2) {
        template += `<input type="radio" id="${option2}" name="selectedLine2" value="${option2}"> <label for="${option2}">${option2}</label><br>
`   // Back tick on its on line to make the console output better formatted
    }
    template += `</div></div>`
    jez.log("template 2", template)
    jez.log("")
    jez.log("")
    //----------------------------------------------------------------------------------------------------
    // Build Dialog 
    //
    new Dialog({
        title: queryTitle,
        content: template,
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: 'OK',
                callback: async (html) => {
                    jez.log("html contents", html)
                    const SELECTED_OPTION1 = html.find("[name=selectedLine1]:checked").val();
                    jez.log("Radio Button Selection", SELECTED_OPTION1)
                    jez.log('selected option', SELECTED_OPTION1)
                    const SELECTED_OPTION2 = html.find("[name=selectedLine2]:checked").val();
                    jez.log("Radio Button Selection", SELECTED_OPTION2)
                    jez.log('selected option', SELECTED_OPTION2)
                    pickCallBack(SELECTED_OPTION1, SELECTED_OPTION2)
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Cancel',
                callback: async (html) => {
                    jez.log('canceled')
                    pickCallBack(null)
                },
            },
        },
        default: 'cancel',
    }).render(true)
    jez.log(`--------Finished ${FUNCNAME}----------------------------------------`)
    return;
}