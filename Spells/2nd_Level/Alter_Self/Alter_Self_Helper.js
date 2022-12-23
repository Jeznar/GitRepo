const MACRONAME = "Alter_Self_Helper.0.4"
/*****************************************************************************************
 * Alter Self Helper
 * 
 * Presents the user with an option to update the effects of a prexisting ALter Self spell
 * 
 * 01/15/22 0.1 Creation of Macro
 * 05/02/22 0.3 JGB Update for Foundry 9.x
 * 08/01/22 0.4 Added convenientDescriptions
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
jez.log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";
let gameRound = game.combat ? game.combat.round : 0;
const FIRST_BUFF = aItem.name;
const AQUATIC_BUFF = "Acquatic Adaptation"
const AQUATIC_IMG = "Icons_JGB/Spells/2nd_Level/Aquatic_Adaptation.png"
const CHANGE_BUFF = "Change Appearance"
const CHANGE_IMG = "Icons_JGB/Spells/1st%20Level/Disguised.png"
const WEAP_BUFF = "Natural Weapons"
const WEAP_IMG = "Icons_JGB/Monster_Features/claws.png"
const WEAP_NAME = "Natural Weapon (Alter Self)"
let chatCard = null;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
//if (args[0] === "off") await doOff();                   // DAE removal
//if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("A place for things to be done");

    const alterOptions = [
        "Aquatic Adaptation: Grants swim speed and water breathing.",
        "Change Appearance: Visual (only) changes to appearance.",
        "Slashing Natural Weapon, with +1 magical bonus.",
        "Piercing Natural Weapon, with +1 magical bonus.",
        "Bludgeoning Natural Weapon, with +1 magical bonus."
    ]
    const queryTitle = "Select Item in Question"
    const queryText = "Pick one from drop down list"
    pickFromListArray(queryTitle, queryText, pickItemCallBack, alterOptions);

    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}

/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);

    //---------------------------------------------------------------------------------------------
    // Remove prexisting effects of Alterself sell
    //
    let oldEffect = null;
    jez.log(`Removing: ${AQUATIC_BUFF} if present`)
    oldEffect = aActor.effects.find(ef => ef.data.label === AQUATIC_BUFF) ?? null; // Added a null case.
    await oldEffect?.delete();
    jez.log(`Removing: ${CHANGE_BUFF} if present`)
    oldEffect = aActor.effects.find(ef => ef.data.label === CHANGE_BUFF) ?? null; // Added a null case.
    await oldEffect?.delete();
    jez.log(`Removing: ${WEAP_BUFF} if present`)
    oldEffect = aActor.effects.find(ef => ef.data.label === WEAP_BUFF) ?? null; // Added a null case.
    await oldEffect?.delete();
    jez.log(`Deleting: ${WEAP_NAME} if present`)
    // await jezDeleteItem(WEAP_NAME);
    await jez.deleteItems(WEAP_NAME, "weapon", aActor);
    //---------------------------------------------------------------------------------------------
    // query the user for choice via a dialog, proceed from there to a callback.
    //
    const alterOptions = [
        "Aquatic Adaptation: Grants swim speed and water breathing.",
        "Change Appearance: Visual (only) changes to appearance.",
        "Slashing Natural Weapon, with +1 magical bonus.",
        "Piercing Natural Weapon, with +1 magical bonus.",
        "Bludgeoning Natural Weapon, with +1 magical bonus."
    ]
    const queryTitle = "Select Item in Question"
    const queryText = "Pick one from drop down list"
    pickFromListArray(queryTitle, queryText, pickItemCallBack, alterOptions);

    // https://www.w3schools.com/tags/ref_colornames.asp
    msg = `<p style="color:blue;font-size:14px;">
    ${aToken.name} is changing aspects of the magic that has altered him/her.<br><br>
    ${aToken.name} will be able to change this effect each turn at the cost of an action.`
    postResults(msg);
    
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}

/***************************************************************************************************
 * Callback function to handle menu choice.
 ***************************************************************************************************/
async function pickItemCallBack(selection) {
    jez.log("pickItemCallBack", selection)
    if (!selection) return;
    let choice = selection.split(" ")[0];     // Trim off the version number and extension
    jez.log(`Selection: ${choice}!`)
    let concEffect = aActor.effects.find(ef => ef.data.label === "Concentrating");
    let remainingSecs = concEffect ? concEffect?.data.duration.seconds : 3600
    jez.log(`Proceed with ${choice} for ${remainingSecs} seconds`, concEffect)
    let effectData = null;
    let cardImg = null;

    switch (choice) {
        case "Aquatic":
            jez.log(`acquire gills and fins`)
            ceDesc = `Now has gills and fins, can breathe underwater and gains swimming speed equal to walking.`
            let swimSpeed = aActor.data.data.attributes.movement?.walk || 1;
            effectData = {
                label: AQUATIC_BUFF, 
                icon: AQUATIC_IMG,
                origin: lastArg.uuid,
                disabled: false,
                duration: { seconds: remainingSecs, startTime: game.time.worldTime },
                flags: { convenientDescription: ceDesc },
                changes: [
                    {key: `data.attributes.movement.swim`, mode: UPGRADE, value: swimSpeed, priority: 20},
                    {key: `flags.gm-notes.notes`, mode: CUSTOM, value: "Water Breathing", priority: 20},
                ]
            };
            jez.log(`Add effect ${aItem.name} to ${aToken.name}`)  
            await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:aToken.actor.uuid, effects: [effectData] });
            msg=`${aToken.name} has alterered shape to adapt to an aquatic environment.  ${aToken.name} now has water 
            breathing and a swim speed equal to walking speed.`;
            cardImg = AQUATIC_IMG;
            break;
        case "Change":
            jez.log(`Change visual appearance`)
            ceDesc = `Altered visual appearance`
            effectData = {
                label: CHANGE_BUFF, 
                icon: CHANGE_IMG,
                origin: lastArg.uuid,
                disabled: false,
                duration: { seconds: remainingSecs, startTime: game.time.worldTime },
                flags: { convenientDescription: ceDesc },
                changes: [
                    {key: `flags.gm-notes.notes`, mode: CUSTOM, value: "Physical Appearance Changed", priority: 20},
                ]
            };
            jez.log(`Add effect ${aItem.name} to ${aToken.name}`)  
            await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:aToken.actor.uuid, effects: [effectData] });
            msg=`${aToken.name} has altered various aspects of physical appearance.`;
            cardImg = CHANGE_IMG;
            break;
        case "Slashing":
        case "Piercing":
        case "Bludgeoning":
            jez.log(`Natural Weapon with damage type: ${choice.toLowerCase()}`)
            ceDesc = `Has sprouted natural weapons`
            effectData = {
                label: WEAP_BUFF, 
                icon: WEAP_IMG,
                origin: lastArg.uuid,
                disabled: false,
                duration: { seconds: remainingSecs, startTime: game.time.worldTime },
                flags: { convenientDescription: ceDesc },
                changes: [
                    {key: `flags.gm-notes.notes`, mode: CUSTOM, value: `Natural ${choice} Weapon Added`, priority: 20},
                    {key: `data.traits.weaponProf.custom`, mode: CUSTOM, value: `${WEAP_NAME}`, priority: 20},                  
                ]
            };
            jez.log(`Add effect ${aItem.name} to ${aToken.name}`)  
            await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:aToken.actor.uuid, effects: [effectData] });
            createWeapon(choice)
            msg=`${aToken.name} has created a ${choice} natural weapon.<br><br>
            <b>FoundryVTT:</b> A new temporary item has been created in Inventory:Weapons, on ${aToken.name}'s sheet, 
            that can be used for attacks.`;
            cardImg = WEAP_IMG;
            break;
        default:
            errorMsg = `Disturbingly, reached end of switch without a match for ==>${choice}<==`
            ui.notifications.error(msg);
            jez.log(errorMsg)
            return (choice)
    }
    msg += "<br><br>This effect may be altered each turn at the cost of an action."
    // jezPostMessage({color:"purple", fSize:14, msg:msg, title:"Alter Self Effect", icon:cardImg })
    return(choice)
}

/****************************************************************************************
 * Create and instant and rather temprary item in inventory to represent the natural weap
 ****************************************************************************************/
async function createWeapon(damType) {
    const FUNCNAME = `createWeapon(${damType})`;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);

    let strMod = aActor.data.data.abilities.str.mod
    let dexMod = aActor.data.data.abilities.dex.mod
    let bestMod = "str"
    if (dexMod > strMod) bestMod = "dex"
    jez.log("Pick skill type", "strMod", strMod, "dexMod", dexMod, "bestMod ==>", bestMod)

    let descValue = `Use claws, fangs, spines, horns, or a different natural weapon 
    of your choice.<br><br>
    Your unarmed strike with this weapon deals <b>1d6+1 ${damType}</b> damage, you are 
    proficient with this weapon. Finally, the natural weapon is <b>magic</b> and you 
    have a <b>+1 bonus</b> to attack rolls you make using it.`
    let itemData = [{
        "name": WEAP_NAME,
        "type": "weapon",
        "data": {
            "ability": `${bestMod}`,
            "actionType": "mwak",
            "activation": {
                "cost": 1,
                "type": "action"
            },
            "attackBonus": 1,
            "damage": {
                "parts": [[`1d6 +1 +@mod`, `${damType.toLowerCase()}`]],  // Set base damage

            },
            "description": {"value": descValue },
            "equipped": true,
            "prof": { "hasProficiency": true },
            "proficient": true,
            "properties": {
                "mgc": "true",  // Mark the new item as magic
            },
            "source": `Alter Self: ${damType} Weapon`,
            "weaponType": "natural"
        },
        "img": WEAP_IMG,
        "effects": []
    }];
    await aActor.createEmbeddedDocuments("Item", itemData);

    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/****************************************************************************************
 * Create and process selection dialog, passing it onto specified callback function
 ***************************************************************************************/
 function pickFromListArray(queryTitle, queryText, pickCallBack, queryOptions) {
    const FUNCNAME = "pickFromList(queryTitle, queryText, ...queryOptions)";
    jez.log("---------------------------------------------------------------------------",
        `Starting`, `${MACRONAME} ${FUNCNAME}`,
        `queryTitle`, queryTitle,
        `queryText`, queryText,
        `pickCallBack`, pickCallBack,
        `queryOptions`, queryOptions);

    if (typeof(pickCallBack)!="function" ) {
        let msg = `pickFromList given invalid pickCallBack, it is a ${typeof(pickCallBack)}`
        ui.notifications.error(msg);
        jez.log(msg);
        return
    }   

    if (!queryTitle || !queryText || !queryOptions) {
        let msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, [queryOptions]),
                   but yours are: ${queryTitle}, ${queryText}, ${pickCallBack}, ${queryOptions}`;
        ui.notifications.error(msg);
        jez.log(msg);
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
                    jez.log('selected option', selectedOption)
                    pickCallBack(selectedOption)
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

    jez.log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
        return;
}
/***************************************************************************************
 * Function to delete an item from actor
 *
 * Parameters
 *  - itemName: A string naming the item to be found in actor's inventory
 *  - actor: Optional actor to be searched, defaults to actor launching this macro
 ***************************************************************************************/
/*async function jezDeleteItem(itemName, actor) {
    const FUNCNAME = "deleteItem(itemName, actor)";
    let defActor = null;
    if (lastArg.tokenId) defActor = canvas.tokens.get(lastArg.tokenId).actor; 
    else defActor = game.actors.get(lastArg.actorId);
    actor = actor ? actor : defActor; // Set actor if not supplied
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`,
        "itemName", itemName, `actor ${actor?.name}`, actor);

    if (!jezIsActor5e(actor)) {
        errorMsg = `Obtained actor argument is not of type Actor5E (${actor?.constructor.name})`
        jez.log(errorMsg)
        jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} ==> FALSE --------------`);
        return (false);
    }

    let item = actor.items.find(item => item.data.name === itemName && item.type === "weapon")
    if (item == null || item == undefined) {
        errorMsg = `${actor.name} does not have ${itemName}`
        jez.log(errorMsg);
        jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} ==> FALSE --------------`);
        return (false);
    }

    await aActor.deleteOwnedItem(item._id);
    jez.log(`${actor.name} had (past tense) ${item.name}`, item);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} ==> TRUE -----------------`);
    return (true);
}*/
/***************************************************************************************************
 * Return true if passed argument is of object type "Token5e"
 ***************************************************************************************************/
 function jezIsActor5e(obj) {
    if (obj?.constructor.name === "Actor5e") return(true)
    return(false)
}
/***************************************************************************************************
 * Obtain the Actor5e objext corresponding to the passed ID
 ***************************************************************************************************/
function jezGetActor5EfromID(passedID) {
    let myActor = game.actors.get(passedID)
    jez.log(`Obtained actor ${myActor.name}`, myActor)
    return(myActor)
}

/***************************************************************************************************
 * Post the results to chat card
 ***************************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    jez.log(`chatMessage: `,chatMessage);
    //const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    //const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}