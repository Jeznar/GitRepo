const MACRONAME = "Dialog_Select_Item.0.2"
/*******************************************************************
 *  
 * 01/03/22 1.0 JGB Creation
 * 01/23/22 1.1 JGB Changes to use library function for dialog
 ******************************************************************/
 const DEBUG = true;
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
 log("---------------------------------------------------------------------------",
     "Starting", `${MACRONAME}`);
 for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);
 const lastArg = args[args.length - 1];
 let aActor;         // Acting actor, creature that invoked the macro
 let aToken;         // Acting token, token for creature that invoked the macro
 let aItem;          // Active Item information, item invoking this macro
 if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
 if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
 if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
 const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
 const ATTACK_ITEM = "Heat Metal Damage";
 log("------- Global Values Set -------",
     `Active Token (aToken) ${aToken?.name}`, aToken,
     `Active Actor (aActor) ${aActor?.name}`, aActor,
     `Active Item (aItem) ${aItem?.name}`, aItem)
 let msg = "";
 let errorMsg = "";



//----------------------------------------------------------------------------------
// Below is the unique code for this macro
//
//const CAST = "Cast"
// const ABORT = "Cancel"

//----------------------------------------------------------------------------------
// Build a list of the potentially items on the actor, excluding known "non-items"
//
let actorItems = [];
const EXCLUDED_TYPES = ["spell", "feat", "class"]
const INCLUDED_TYPES = ["weapon", "equipment"]

for (let i = 0; i < aActor.items.contents.length; i++) {
    if (INCLUDED_TYPES.includes(aActor.items.contents[i].type)) {
        log(` ${i}) ${aActor.items.contents[i].name} ${aActor.items.contents[i].type}`);
        actorItems.push(aActor.items.contents[i].name);
    }
}
for (let i = 0; i < actorItems.length; i++) {
    log(` Item ${i}) ${actorItems[i]}`);
}

const queryTitle = "Select Item in Question"
const queryText = "Pick one from drop down list"
pickFromListArray(queryTitle, queryText, pickItemCallBack, actorItems);
return

 function pickItemCallBack(selection) {
     log("pickItemCallBack", selection)
     postResults(`The entity named <b>"${selection}"</b> was selected in the dialog`)
 }

/****************************************************************************************
 * Create and process selection dialog, passing it onto specified callback function
 ***************************************************************************************/
 function pickFromListArray(queryTitle, queryText, pickCallBack, queryOptions) {
    const FUNCNAME = "pickFromList(queryTitle, queryText, ...queryOptions)";
    log("---------------------------------------------------------------------------",
        `Starting`, `${MACRONAME} ${FUNCNAME}`,
        `queryTitle`, queryTitle,
        `queryText`, queryText,
        `pickCallBack`, pickCallBack,
        `queryOptions`, queryOptions);

    if (typeof(pickCallBack)!="function" ) {
        let msg = `pickFromList given invalid pickCallBack, it is a ${typeof(pickCallBack)}`
        ui.notifications.error(msg);
        log(msg);
        return
    }   

    if (!queryTitle || !queryText || !queryOptions) {
        let msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, [queryOptions]),
                   but yours are: ${queryTitle}, ${queryText}, ${pickCallBack}, ${queryOptions}`;
        ui.notifications.error(msg);
        log(msg);
        return
    }

    let template = `
    <div>
    <div class="form-group">
        <label>${queryText}</label>
        <select id="selectedOption">`
    for (let option of queryOptions) {
        template += `<option value="${option}">${option}</option>`
    }
    template += `</select>
    </div></div>`

    new Dialog({
        title: queryTitle,
        content: template,
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: 'OK',
                callback: async (html) => {
                    const selectedOption = html.find('#selectedOption')[0].value
                    log('selected option', selectedOption)
                    pickCallBack(selectedOption)
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Cancel',
                callback: async (html) => {
                    log('canceled')
                    pickCallBack(null)
                },
            },
        },
        default: 'cancel',
    }).render(true)

    log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
        return;
}

/***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
async function postResults(resultsString) {
    const FUNCNAME = "postResults(resultsString)";
    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
    log(`Starting ${MACRONAME} ${FUNCNAME}`,
        `resultsString`, resultsString);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    // let chatmsg = await game.messages.get(itemCard.id)
    let chatmsg = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatmsg.data.content);
    log(`chatmsg: `, chatmsg);
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();

    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/***************************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************************/
function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    }
}
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }