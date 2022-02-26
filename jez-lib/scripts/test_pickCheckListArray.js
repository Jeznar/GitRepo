const MACRONAME = "test_pickCheckListArray"
/*******************************************************************************************
 * This macro is a testing harness for the pickCheckListArray function.
 * 
 * It is intended to be run as an ItemMacro from an actor's item and will present a list 
 * of all the actor's Weapons and Equipment to choose from. 
 * 
 *******************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
 jez.log(`------------- Starting ${MACRONAME} --------------------`)
 for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
 const lastArg = args[args.length - 1];
 let aActor;         // Acting actor, creature that invoked the macro
 let aToken;         // Acting token, token for creature that invoked the macro
 let aItem;          // Active Item information, item invoking this macro
 if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
 if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
 if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
//----------------------------------------------------------------------------------
//
let actorItems = [];
const EXCLUDED_TYPES = ["spell", "feat", "class"]
const INCLUDED_TYPES = ["weapon", "equipment"]
//----------------------------------------------------------------------------------
//
for (let i = 0; i < aActor.items.contents.length; i++) {
    if (INCLUDED_TYPES.includes(aActor.items.contents[i].type)) {
        jez.log(` ${i}) ${aActor.items.contents[i].name} ${aActor.items.contents[i].type}`);
        actorItems.push(aActor.items.contents[i].name);
    }
}
for (let i = 0; i < actorItems.length; i++) {
    jez.log(` Item ${i}) ${actorItems[i]}`);
}
//----------------------------------------------------------------------------------
//
const queryTitle = "Select Items to be Operated on"
const queryText = "Pick from the list, or click All button to select everything"
jez.pickCheckListArray(queryTitle, queryText, pickCheckCallBack, actorItems.sort());
//pickCheckListArray(queryTitle, queryText, pickCheckCallBack, actorItems.sort());

return
//----------------------------------------------------------------------------------
//
function pickCheckCallBack(selection) {
    let msg = ""
    jez.log("pickRadioCallBack", selection)
    for (let i = 0; i < selection.length; i++) {
        msg += `${i+1}) ${selection[i]}<br>`
    }
    jez.postMessage({
        color: "green",
        fSize: 14,
        icon: aToken.data.img,
        msg: `${aToken.name} selected the following:<br><br>${msg}<br> in the dialog`,
        title: `${aToken.name} made a pick`,
        token: aToken
    })
}

/***************************************************************************************
     * Create and process check box dialog, passing array onto specified callback function
     * 
     * Font Awesome Icons: https://fontawesome.com/icons
     * 
     * const queryTitle = "Select Item in Question"
     * const queryText = "Pick one from following list"
     * pickCallBack = call back function
     * queryOptions array of strings to be offered as choices, perhaps pre-sorted 
     * 
     * Sample Call:
     *   const queryTitle = "Select Item in Question"
     *   const queryText = "Pick one from the list" 
     *   pickCheckListArray(queryTitle, queryText, pickRadioCallBack, actorItems.sort());
     ***************************************************************************************/
  async function pickCheckListArray(queryTitle, queryText, pickCallBack, queryOptions) {
    const FUNCNAME = "jez.pickFromList(queryTitle, queryText, ...queryOptions)";
    jez.log("---------Starting ---${FUNCNAME}-------------------------------------------",
        `queryTitle`, queryTitle,
        `queryText`, queryText,
        `pickCallBack`, pickCallBack,
        `queryOptions`, queryOptions);
    let msg = ""
    if (typeof (pickCallBack) != "function") {
        msg = `pickFromList given invalid pickCallBack, it is a ${typeof (pickCallBack)}`
        ui.notifications.error(msg);
        console.log(msg);
        return
    }
    if (!queryTitle || !queryText || !queryOptions) {
        msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, [queryOptions]),
   but yours are: ${queryTitle}, ${queryText}, ${pickCallBack}, ${queryOptions}`;
        ui.notifications.error(msg);
        console.log(msg);
        return
    }
    let template = `
<div>
<label>${queryText}</label>
<div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">
`   // Back tick on its on line to make the console output better formatted
    for (let option of queryOptions) {
        template += `<input type="checkbox" id="${option}" name="selectedLine" value="${option}"> <label for="${option}">${option}</label><br>
`   // Back tick on its on line to make the console output better formatted
    }
    template += `</div></div>`
    jez.log(template) 

    let selections = []
    new Dialog({
        title: queryTitle,
        content: template,
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: 'Selected Only',
                callback: async (html) => {
                    jez.log("html contents", html)

                    html.find("[name=selectedLine]:checked").each(function () {
                        jez.log($(this).val());
                        selections.push($(this).val())
                    })
                    pickCallBack(selections)
                },
            },
            all: {
                icon: '<i class="fas fa-check-double"></i>',
                label: 'All Displayed',
                callback: async (html) => {
                    jez.log("Selected All", queryOptions)
                    pickCallBack(queryOptions)
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