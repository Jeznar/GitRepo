const MACRONAME = "dev_Protect_Dialog.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Development test bed for the pre-check slection dialog.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
console.log(`       ============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) console.log(`  args[${i}]`, args[i]);
//---------------------------------------------------------------------------------------------------
// 
//
let msg = ""

//---------------------------------------------------------------------------------------------------
// null: there are no differences in the field so option should not be provided
// true: there are differences and the target's value is to be retained
// false: there are differences and the target's value is to be overwritten
//
let protectFieldsObj = {
    prep: true,
    uses: false,
    consume: null,
    magic: true,
}
jez.log("protectFieldsObj", protectFieldsObj)
//---------------------------------------------------------------------------------------------------
// Override soem fields
//
protectFieldsObj.prep = false
protectFieldsObj.consume = true
//---------------------------------------------------------------------------------------------------
// Pop the dialog
//
let dialogTitle = "Select the fields to retain"
let dialogText = `This dialog lists fields where there are differences between the reference and the 
target actors. You may retain the target actor field values by checking the box next to each.<br><br>
When satisfied, click a button at the bottom to execute.`
customCheckDialog(dialogTitle, dialogText, pickCallBack, protectFieldsObj)

/***************************************************************************************
 * 
 ***************************************************************************************/
 function pickCallBack(selection) {
    //--------------------------------------------------------------------------------------------
    // If cancel button was selected on the preceding dialog, null is returned ==> Terminate
    //
    if (selection === null) return;
    msg = `pickCallBack: ${selection.length} items selected in the dialog`
    jez.log(msg)
    //--------------------------------------------------------------------------------------------
    // Start doing actual things to advance the mission...
    //
    jez.log("selecion", selection)
}
/***************************************************************************************
 * Create and process custom dialog, passing array onto specified callback function
 ***************************************************************************************/
async function customCheckDialog(queryTitle, queryText, pickCallBack, fieldsObj) {
    // const FUNCNAME = "jez.pickFromList(queryTitle, queryText, ...fieldsObj)";
    // jez.log("--- Starting --- ${FUNCNAME}---",`queryTitle`, queryTitle,`queryText`, queryText,`pickCallBack`, pickCallBack,`fieldsObj`, fieldsObj);
    let queryObjects = []
    let queryCheck = []
    //---------------------------------------------------------------------------------------------------
    // Setup the options to be provided in the dialog
    //
    addLine(fieldsObj.prep,"Preperation")
    addLine(fieldsObj.uses,"Uses")
    addLine(fieldsObj.consume,"Consume")
    addLine(fieldsObj.magic,"Magic")
    function addLine(entry, label) {
        if (entry != null) {                        // If value is null, don't create a line
            queryObjects.push(label)                // Add to array the string for this item
            if (entry) queryCheck.push("checked")   // Precheck if indicated by entry
            else queryCheck.push("")                // Leave blank otherwise
        }
    }
    //---------------------------------------------------------------------------------------------------
    // 
    //
    if (typeof (pickCallBack) != "function") {
        msg = `pickFromList given invalid pickCallBack, it is a ${typeof (pickCallBack)}`
        ui.notifications.error(msg);
        // jez.log(msg);
        return
    }
    if (!queryTitle || !queryText || !fieldsObj) {
        msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, [fieldsObj]),
   but yours are: ${queryTitle}, ${queryText}, ${pickCallBack}, ${fieldsObj}`;
        ui.notifications.error(msg);
        // jez.log(msg);
        return
    }
    let template = `
    <div>
    <label>${queryText}</label>
    <div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">`
    jez.log("queryObjects.length",queryObjects.length)
    for (let i = 0; i < queryObjects.length; i++) {
        template += `<input type="checkbox" ${queryCheck[i]} id=${queryObjects[i]} name="selectedLine" value="${queryObjects[i]}"> <label for="${queryObjects[i]}">${queryObjects[i]}</label><br>`
    }
    template += `</div></div>`
    // jez.log(template)
    let selections = []
    new Dialog({
        title: queryTitle,
        content: template,
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: 'Selected Only',
                callback: async (html) => {
                    // jez.log("html contents", html)

                    html.find("[name=selectedLine]:checked").each(function () {
                        //jez.log($(this).val());
                        selections.push($(this).val())
                    })
                    pickCallBack(selections)
                },
            },
            all: {
                icon: '<i class="fas fa-check-double"></i>',
                label: 'All Displayed',
                callback: async (html) => {
                    //jez.log("Selected All", queryOptions)
                    pickCallBack(queryOptions)
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Cancel',
                callback: async (html) => {
                    console.log('canceled')
                    pickCallBack(null)
                },
            },
        },
        default: 'cancel',
    }).render(true)
    // jez.log(`--------Finished ${FUNCNAME}----------------------------------------`)
    return;
}
