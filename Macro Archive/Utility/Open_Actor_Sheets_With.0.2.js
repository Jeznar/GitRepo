const MACRONAME = "Open_Actor_Sheets_With.0.2.js"
/******************************************************************************
 * Macro to find all actors who have a specified item and oen their sheets
 * to make replaceing items easier.
 *
 * 12/03/21 0.1 Creation
 * 01/23/22 0.2 Add Font end to enter the item name
 *****************************************************************************/
let cnt = 0;
let cntFound = 0;
let itemFound = null;
let actorsWithItem = [];
let msg = ""
let queryTitle = ""
let queryText = ""
let type = ""
let item = ""

jez.log(`Beginning ${MACRONAME}`);

let sToken = canvas.tokens.controlled[0]
jez.log(`Source Token ${sToken.name}`, sToken);

if (!sToken) {
    msg = `Must select one token to be used to find the item that will be searched for.`
    jez.postMessage({color:"crimson", fSize:14, msg:msg, title:`ERROR: Select a Token`})
    return
}
let sActor = sToken.actor
let itemsFound = []
let typesFound = []
for (let i=0; i < sActor.items.contents.length; i++) {
    jez.log(`${i} ${sActor.items.contents[i].data.type} ${sActor.items.contents[i].data.name}`)
    if (!typesFound.includes(sActor.items.contents[i].data.type)) typesFound.push(sActor.items.contents[i].data.type)
    //if (sActor.items.contents[i].data.type === "spell") itemsFound.push(sActor.items.contents[i].data.name)
}
jez.log(`Found ${typesFound.length} types}`, typesFound.sort())


queryTitle = "What type of thing?"
queryText = "Pick one from drop down list"
await jez.pickFromListArray(queryTitle, queryText, typeCallBack, typesFound)

async function typeCallBack(itemType) {
    jez.log("typeCallBack", itemType)
    msg = `The type named <b>"${itemType}"</b> was selected in the dialog`
    //--------------------------------------------------------------------------------------------
    // Find all the item of type "itemType"
    //
    for (let i=0; i < sActor.items.contents.length; i++) {
        jez.log(`${i} ${sActor.items.contents[i].data.type} ${sActor.items.contents[i].data.name}`)
        if (sActor.items.contents[i].data.type === itemType) itemsFound.push(sActor.items.contents[i].data.name)
    }
    jez.log(`Found ${itemsFound.length} ${itemType}(s)`, itemsFound.sort())
    //--------------------------------------------------------------------------------------------
    // From the Items found, ask which shall be searched for now...
    //
    queryTitle = "Sheets with which item should be opened?"
    queryText = "Pick one from drop down list"
    await jez.pickFromListArray(queryTitle, queryText, itemCallBack, itemsFound.sort())


    function itemCallBack(itemSelected) {
        jez.log("typeCallBack", itemSelected)
        msg = `The item named <b>"${itemSelected}"</b> was selected in the dialog`
        //--------------------------------------------------------------------------------------------
        // Find and open all the actor sheets that contain the selected item
        //
        jez.log("Item Type", itemType)
        jez.log("Item Seletced", itemSelected)

        let allActors = game.actors

        for (let entity of allActors) {
            cnt++
            itemFound = entity.items.find(item => item.data.name === itemSelected && item.type === itemType)
            if (itemFound) {
                cntFound++;
                actorsWithItem.push(entity.name);
            }
        }

        msg = `<u>Found ${cntFound} actor(s) with ${itemSelected}</u><br>`

        let i = 0;
        console.log(`Searched ${cnt} entities, found ${cntFound} with ${itemSelected} ${itemType}:`)
        for (let line of actorsWithItem) {
            jez.log(`${++i}) ${line}`);
            msg += `${line}<br>`
            game.actors.getName(line).sheet.render(true);
        }

        jez.log(`Actors with ${itemSelected}`)
        jez.postMessage({ color: "purple", fSize: 14, msg: msg, title: `Actors with ${itemSelected} ${itemType}` })
        jez.log(`Ending ${MACRONAME}`);
    }
}
return