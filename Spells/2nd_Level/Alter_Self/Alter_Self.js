const MACRONAME = "Alter_Self.0.6.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Alter Self
 * 
 * Present a dialog that allows caster to choose one of the three effects, one has three 
 * sub choices, so 5 options on dialog.
 *  - Aquatic Adaptation: Active effect granting a swim speed equal to walking
 *  - Change Appearance: Active effect with notation about appearance change.
 *  - Natural Weapon: Create a temporary item giving a proficient 1d6+1 damage, magical, 
 *    and +1 to hit, weapon of 
 *    - bludgeoning, 
 *    - piercing, or 
 *    - slashing damage type.
 *  - Each turn at start of turn present another dialog that asks if actor wants to spend 
 *    an action to repeat the choice.  If they repeat, present same dialog choice.  
 * 
 * 01/14/22 0.1 Creation of Macro
 * 01/15/22 0.2 Another Day Another Version
 * 05/02/22 0.3 Update for Foundry 9.x
 * 05/16/22 0.4 Update (again) for Foundry 9.x
 * 08/01/22 0.5 Added convenientDescriptions
 * 12/17/22 0.6 Update logging and general style
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const FIRST_BUFF = aItem.name;
const AQUATIC_BUFF = "Acquatic Adaptation"
const AQUATIC_IMG = "Icons_JGB/Spells/2nd_Level/Aquatic_Adaptation.png"
const CHANGE_BUFF = "Change Appearance"
const CHANGE_IMG = "Icons_JGB/Spells/1st_Level/Disguised.png"
const WEAP_BUFF = "Natural Weapons"
const WEAP_IMG = "Icons_JGB/Monster_Features/claws.png"
const WEAP_NAME = "Natural Weapon (Alter Self)"
const MACRO_HELPER = "Alter_Self_Helper"
const UPDATE_EFFECT_NAME = "Update Alter Self Effect"
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "on") await doOn({ traceLvl: TL });                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let oldEffect = null;
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    if (TL > 1) jez.trace(`${TAG} Removing: >${AQUATIC_BUFF}< if present`)
    oldEffect = aActor.effects.find(ef => ef.data.label === AQUATIC_BUFF) ?? null; // Added a null case.
    await oldEffect?.delete();
    if (TL > 1) jez.trace(`${TAG} Removing: >${CHANGE_BUFF}< if present`)
    oldEffect = aActor.effects.find(ef => ef.data.label === CHANGE_BUFF) ?? null; // Added a null case.
    await oldEffect?.delete();
    if (TL > 1) jez.trace(`${TAG} Removing: >${WEAP_BUFF}< if present`)
    oldEffect = aActor.effects.find(ef => ef.data.label === WEAP_BUFF) ?? null; // Added a null case.
    await oldEffect?.delete();
    if (TL > 1) jez.trace(`${TAG} Deleting: >${WEAP_NAME}< if present`)
    await jez.deleteItems(WEAP_NAME, "weapon", aActor);
    if (TL > 1) jez.trace(`${TAG} Deleting: >${UPDATE_EFFECT_NAME}< if present`)
    await jez.deleteItems(UPDATE_EFFECT_NAME, "spell", aActor);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set On
 * This runs on actor that has the affected applied to it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOn(options = {}) {
    const FUNCNAME = "doOn(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    if (TL > 1) jez.trace(`${TAG} Deleting: >${WEAP_NAME}< if present`)
    await jez.deleteItems(WEAP_NAME, "weapon", aActor);
    if (TL > 1) jez.trace(`${TAG} Deleting: >${UPDATE_EFFECT_NAME}< if present`)
    await jez.deleteItems(UPDATE_EFFECT_NAME, "spell", aActor);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build the dialog variables
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
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pop the dialog and connect to callback
    //
    pickFromListArray(queryTitle, queryText, pickItemCallBack, alterOptions);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Modify recently created effect to have a convenientDescription
    //
    let effect = await aToken.actor.effects.find(i => i.data.label === FIRST_BUFF);
    if (!effect) return jez.badNews(`Could not find ${FIRST_BUFF} effect on ${aToken.name}`, "e")
    const C_DESC = `With an Action may alter certain elements of body or appearance`
    await effect.update({ flags: { convenientDescription: C_DESC } });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    createEffectUpdate()
    // https://www.w3schools.com/tags/ref_colornames.asp
    msg = `<p style="color:blue;font-size:14px;"> 
    ${aToken.name} is using magic to change appearance and some features.<br><br>
    ${aToken.name} will be able to change this effect each turn at the cost of an action.`
    postResults(msg);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return (true);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Callback function to handle menu choice.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function pickItemCallBack(selection, options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'selection', selection, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (!selection) return;
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    let choice = selection.split(" ")[0];     // Trim off the version number and extension
    if (TL > 1) jez.trace(`${TAG} Selection: ${choice}!`)
    let concEffect = aActor.effects.find(ef => ef.data.label === "Concentrating");
    let remainingSecs = concEffect ? concEffect?.data.duration.seconds : 3600
    if (TL > 1) jez.trace(`${TAG} Proceed with ${choice} for ${remainingSecs} seconds`, concEffect)
    let effectData = null;
    let cardImg = null;

    let ceDesc
    switch (choice) {
        case "Aquatic":
            if (TL > 1) jez.trace(`${TAG} acquire gills and fins`)
            ceDesc = `Now has gills and fins, can breathe underwater and gains swimming speed equal to walking.`
            let swimSpeed = aActor.data.data.attributes.movement?.walk || 1;
            effectData = {
                label: AQUATIC_BUFF,
                icon: AQUATIC_IMG,
                origin: L_ARG.uuid,
                disabled: false,
                duration: { seconds: remainingSecs, startTime: game.time.worldTime },
                flags: { convenientDescription: ceDesc },
                changes: [
                    { key: `data.attributes.movement.swim`, mode: jez.UPGRADE, value: swimSpeed, priority: 20 },
                    { key: `flags.gm-notes.notes`, mode: jez.CUSTOM, value: "Water Breathing", priority: 20 },
                ]
            };
            if (TL > 1) jez.trace(`${TAG} Add effect ${aItem.name} to ${aToken.name}`)
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });
            msg = `${aToken.name} has alterered shape to adapt to an aquatic environment.  ${aToken.name} now has water 
            breathing and a swim speed equal to walking speed.`;
            cardImg = AQUATIC_IMG;
            break;
        case "Change":
            if (TL > 1) jez.trace(`${TAG} Change visual appearance`)
            ceDesc = `Altered visual appearance`
            effectData = {
                label: CHANGE_BUFF,
                icon: CHANGE_IMG,
                origin: L_ARG.uuid,
                disabled: false,
                duration: { seconds: remainingSecs, startTime: game.time.worldTime },
                flags: { convenientDescription: ceDesc },
                changes: [
                    { key: `flags.gm-notes.notes`, mode: jez.CUSTOM, value: "Physical Appearance Changed", priority: 20 },
                ]
            };
            if (TL > 1) jez.trace(`${TAG} Add effect ${aItem.name} to ${aToken.name}`)
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });
            msg = `${aToken.name} has altered various aspects of physical appearance.`;
            cardImg = CHANGE_IMG;
            break;
        case "Slashing":
        case "Piercing":
        case "Bludgeoning":
            if (TL > 1) jez.trace(`${TAG} Natural Weapon with damage type: ${choice.toLowerCase()}`)
            ceDesc = `Has sprouted natural weapons`
            effectData = {
                label: WEAP_BUFF,
                icon: WEAP_IMG,
                origin: L_ARG.uuid,
                disabled: false,
                duration: { seconds: remainingSecs, startTime: game.time.worldTime },
                flags: { convenientDescription: ceDesc },
                changes: [
                    { key: `flags.gm-notes.notes`, mode: jez.CUSTOM, value: `Natural ${choice} Weapon Added`, priority: 20 },
                    { key: `data.traits.weaponProf.custom`, mode: jez.CUSTOM, value: `${WEAP_NAME}`, priority: 20 },
                ]
            };
            if (TL > 1) jez.trace(`${TAG} Add effect ${aItem.name} to ${aToken.name}`)
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });
            createWeapon(choice)
            msg = `${aToken.name} has created a ${choice} natural weapon.<br><br>
            <b>FoundryVTT:</b> A new temporary item has been created in Inventory:Weapons, on ${aToken.name}'s sheet, 
            that can be used for attacks.`;
            cardImg = WEAP_IMG;
            break;
        default:
            jez.badNews(`Disturbingly, reached end of switch without a match for ==>${choice}<==`,'e')
            return (choice)
    }
    msg += "<br><br>This effect may be altered each turn at the cost of an action."
    // jezPostMessage({ color: "purple", fSize: 14, msg: msg, title: "Alter Self Effect", icon: cardImg })
    jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: cardImg, msg: msg, title: "Alter Self Effect", token: aToken})
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return (choice)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Create an instant and rather temprary item in inventory to represent the natural weap
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function createWeapon(damType, options = {}) {
    const FUNCNAME = "doOn(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let strMod = aActor.data.data.abilities.str.mod
    let dexMod = aActor.data.data.abilities.dex.mod
    let bestMod = "str"
    if (dexMod > strMod) bestMod = "dex"
    if (TL > 1) jez.trace(`${TAG} Pick skill type`, "strMod", strMod, "dexMod", dexMod, "bestMod ==>", bestMod)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
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
            "description": { "value": descValue },
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
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Create and instant and rather temprary item in inventory to represent the natural weap
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function createEffectUpdate(options = {}) {
    const FUNCNAME = "doOn(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let descValue = `<b>${aToken.name}</b> may spend an action to update the effect(s) of their current <b>Alter Self</b> spell.`
    if (TL > 1) jez.trace(`${TAG} descValue`, descValue)
    let itemData = [{
        "data": {
            "ability": "",
            "actionType": "util",
            "activation": {
                "condition": "Must have pre-existing Alter Self effect.",
                "type": "action",
                "cost": 1,
            },
            "description": { "value": descValue },
            "formula": "",
            "level": 0,
            "preparation": {
                "mode": "innate",
                "prepared": false
            },
            "school": "trs",
            "source": "Alter Self Spell",
        },
        "effects": [],
        "flags": {
            "midi-qol": {
                "onUseMacroName": "Alter_Self_Helper"
            }
        },
        "img": args[0].item.img,
        "name": UPDATE_EFFECT_NAME,
        "type": "spell",
    }];
    if (TL > 1) jez.trace(`${TAG} itemData`, itemData)
    await aActor.createEmbeddedDocuments("Item", itemData);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Create and process selection dialog, passing it onto specified callback function
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function pickFromListArray(queryTitle, queryText, pickCallBack, queryOptions, options = {}) {
    const FUNCNAME = "doOn(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, `queryTitle  `, queryTitle, `queryText   `, queryText,
        `pickCallBack`, pickCallBack, `queryOptions`, queryOptions, "options     ", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (typeof (pickCallBack) != "function") {
        let msg = `pickFromList given invalid pickCallBack, it is a ${typeof (pickCallBack)}`
        ui.notifications.error(msg);
        if (TL > 1) jez.trace(`${TAG} ${msg}`);
        return
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (!queryTitle || !queryText || !queryOptions) {
        let msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, [queryOptions]),
                   but yours are: ${queryTitle}, ${queryText}, ${pickCallBack}, ${queryOptions}`;
        ui.notifications.error(msg);
        if (TL > 1) jez.trace(`${TAG} ${msg}`);
        return
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
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
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    new Dialog({
        title: queryTitle,
        content: template,
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: 'OK',
                callback: async (html) => {
                    const selectedOption = html.find('#selectedOption')[0].value
                    if (TL > 1) jez.trace(`${TAG} selected option`, selectedOption)
                    pickCallBack(selectedOption)
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Cancel',
                callback: async (html) => {
                    if (TL > 1) jez.trace(`${TAG} canceled`)
                    pickCallBack(null)
                },
            },
        },
        default: 'cancel',
    }).render(true)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}