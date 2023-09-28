const MACRONAME = "Pick_Stat_From_List_0.1"
/*****************************************************************************************
 * List Selection Widget to Pick a Stat to be affected.  
 * 
 * Based on: --- query-from-list ---
 * Will open a dialog for the user to select an option, and call a callback when it's complete.
 * args:
 * 0  - query title
 * 1  - query text
 * 2+ - options
 * source:
 * https://github.com/itamarcu/foundry-macros/blob/master/query-from-list.js
 * suggested icon: https://i.imgur.com/iw4sH39.png
 * 
  * 12/15/21 0.1 Wrapping the sample as a function and creating a mini-macro to run it
 ******************************************************************************************/
const DEBUG = true;

const queryTitle = args[0] ? args[0] : "Select Stat to be Affected"
const queryText = args[1] ? args[1] : "Pick one from drop down list"
//let queryOptions = args.slice(2)

if (DEBUG) {
    console.log(`Starting: ${MACRONAME}`);
    console.log(`   queryTitle: ${queryTitle}`);
    console.log(`    queryText: ${queryText}`);
}

pickStat(queryTitle, queryText, "Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma");

if (DEBUG) {
    console.log(`Finishing: ${MACRONAME}`);
}
return;

 /***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/****************************************************************************************
 * Create and process dialog
 ***************************************************************************************/
function pickStat(queryTitle, queryText, ...queryOptions) {
    if (DEBUG) {
        console.log(`Starting: pickStat`);
        console.log(`   queryTitle: ${queryTitle}`);
        console.log(`    queryText: ${queryText}`);
        console.log(` queryOptions: `, queryOptions);
    }

    if (!queryTitle || !queryText || !queryOptions) {
        return ui.notifications.error(
            `query-from-list arguments should be (queryTitle, queryText, ...queryOptions),` +
            `but yours are: ${queryTitle}, ${queryText}, ${queryOptions}`,
        )
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
                    console.log('selected option', selectedOption)
                    selCallBack(selectedOption)
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Cancel',
                callback: async (html) => {
                    console.log('canceled')
                    selCallBack(null)
                },
            },
        },
        default: 'cancel',
    }).render(true)
}

/****************************************************************************************
 * Create and process dialog
 ***************************************************************************************/
function selCallBack(selection) {
    ui.notifications.info(`stubCallBack received: ${selection}`);
    console.log(`stubCallBack received: `,selection);
    return;
}
