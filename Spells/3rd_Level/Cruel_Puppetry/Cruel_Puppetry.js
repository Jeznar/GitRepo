const MACRONAME = "Cruel_Puppetry.0.2"
console.log(MACRONAME)
/*****************************************************************************************
 * Create a temporary attack item to use against the victim of Heat Metal
 *
 * 01/15/22 0.1 Creation of Macro
 * 01/16/22 0.2 Finishing up.  Still has issue with multiple targets
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
log("")
log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg, errorMsg, msgTitle = "";
let gameRound = game.combat ? game.combat.round : 0;
const SMASH_IMG = "Icons_JGB/Spells/3rd_Level/Cruel_Puppetry/Puppet.png"
const RIP_IMG   = "Icons_JGB/Spells/3rd_Level/Cruel_Puppetry/Puppet_Broken.png"
const FORCE_IMG = "Icons_JGB/Spells/3rd_Level/Cruel_Puppetry/Puppet_Moved.png"
const HOLD_IMG  = "Icons_JGB/Spells/3rd_Level/Cruel_Puppetry/Puppet_Restrained.png"
const FAIL_ICON = "Icons_JGB/Misc/Failure.png"
const RESTRAINED_JOURNAL = "<b>@JournalEntry[CZWEqV2uG9aDWJnD]{restrained}</b>"
const RESTRAINED_ICON    = "modules/combat-utility-belt/icons/restrained.svg"
const RESTRAINED_NAME    = "Restrained" // aItem.name || "Nature's Wraith";
const ERROR_ICON         = "Icons_JGB/Misc/Error.png"
const ATTACK_ITEM = "Cruel Puppetry Repeat Effect";
let distance = 15
let numDice = 3

let repeatExe = false
if (args[0]?.item?.name.toLowerCase().includes("repeat")) repeatExe = true // e.g. "Cruel Puppetry Repeat Effect"
log("Repeat execution",repeatExe)


//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ( (args[0]?.tag === "OnUse") && (!repeatExe) ) { // Only check on first doOnUse run
    if (!(await preCheck())) {
        console.log(errorMsg)
        return;
    }
}

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off")  doOff();                   // DAE removal
//if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus

log(`============== Finishing === ${MACRONAME} =================`);
log("")
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
    // Check anything important...
    if (!oneTarget()) {
        log(errorMsg)
        ui.notifications.error(errorMsg)

        msg = `No, no, NO!.<br><br><b>Cruel Puppetry</b> requires exactly one target! <br><br>${errorMsg}`
        msgTitle = "Suspected PEBCAK Error"
        await jezPostMessage({ color: "Crimson", fSize: 14, msg: msg, title: msgTitle, icon: ERROR_ICON })
  
        await jezDeleteItem(ATTACK_ITEM, aActor);
        await DAE.unsetFlag(aActor, `${MACRO}.spellData`); 
        log("aActor", aActor)
        let concentrating = await aActor.effects.find(ef => ef.data.label === "Concentrating");
        log("concentrating", concentrating)
        if (concentrating) await concentrating.delete();

        return(false);
    }
    log('All looks good, to quote Jean-Luc, "MAKE IT SO!"')
    return (true)
}

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 *
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let originID = lastArg.origin.split(".")[1] // aqNN90V6BjFcJpI5 (Origin  ID)
    log("originID", originID);
    let oToken = canvas.tokens.objects.children.find(e => e.data.actorId === originID)
    log("oToken", oToken)
    let oActor = oToken.actor
    log("oActor", oActor)
    log(`doOff ---> Delete ${ATTACK_ITEM} from ${oToken.data.name} if it exists`)
    await jezDeleteItem(ATTACK_ITEM, oActor);
    await DAE.unsetFlag(oActor, `${MACRO}.spellData`); 
    log("Actor to remove concentration from", oActor)
    let concentrating = await oActor.effects.find(ef => ef.data.label === "Concentrating");
    log("Concentration effect", concentrating)
    if (concentrating) await concentrating.delete();
    // await deleteItem(ATTACK_ITEM, oActor);
    log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    log("A place for things to be done");
    log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken, tActor, spellData;
    log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);

    if (repeatExe) { // On repeat execution, get target and level info from data flag
        spellData = await DAE.getFlag(aActor, `${MACRO}.spellData`);
        log("___Flag Data___",
            "targetID", spellData.targetID,
            "spellLevel", spellData.spellLevel);
        tToken = canvas.tokens.objects.children.find(e => e.data.actorId === spellData.targetID);
        tActor = tToken?.actor;
        // set spell effects based on flag data
        distance = Math.min(tActor.data.data.attributes.movement.walk, 5 * spellData.spellLevel)
        numDice = spellData.spellLevel;
        log("Have Target Roll Save Again")
        let saveDC = aActor.data.data.attributes.spelldc;
        const SAVE_TYPE = "cha"
        const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${saveDC}</b> to end <b>Cruel Puppetry</b>`;
        let save = (await tActor.rollAbilitySave(SAVE_TYPE,
            { FLAVOR, chatMessage: true, fastforward: true, disadvantage: true }));
        log("save", save);
        msgTitle = "Cruel Puppetry - "
        if (save.total > saveDC) {
            log(`save was made with a ${save.total}`);
            let concentrating = await aActor.effects.find(ef => ef.data.label === "Concentrating");
            if (concentrating) await concentrating.delete();
            msg = `${tToken.name} has broken the Cruel Pupptry spell, with a CHA save of ${save.total}
            against a DC${saveDC}.  The doll used to cast the spell has been destroyed.`
            msgTitle += "Spell Broken"
            jezPostMessage({ color: "BlueViolet", fSize: 14, msg: msg, title: msgTitle, icon: FAIL_ICON })
            return;
        } else {
            log(`save failed with a ${save.total}`);

            // Post results to game chat
            msg = `${tToken.name} failed to save against the Cruel Pupptry spell, with a CHA save of 
            ${save.total} against a DC${saveDC}.  ${aToken.name} may choose an effect.`
            msgTitle += "Save Failed"
            jezPostMessage({ color: "DarkGreen", fSize: 14, msg: msg, title: msgTitle, icon: FAIL_ICON })
        }
    } else { // First time execution
        tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
        tActor = tToken?.actor;
        await createItem()
        // calculate spell effects based on level and target
        distance = Math.min(tActor.data.data.attributes.movement.walk, 5 * args[0].spellLevel)
        numDice = args[0].spellLevel;
        // Store info in a DAE flag on the caster
        spellData = {
            targetID: tActor?.id,
            spellLevel: args[0].spellLevel,
        }
        await DAE.unsetFlag(aActor, `${MACRO}.spellData`); 
        await DAE.setFlag(aActor, `${MACRO}.spellData`, spellData);
    }

    await pickFlavor()
 
    // https://www.w3schools.com/tags/ref_colornames.asp
    msg = `<p style="color:blue;font-size:14px;">
    Maybe say something useful...</p>`
    //postResults(msg);
    log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
    //----------------------------------------------------------------------------------
    //
    async function createItem() {
        let descValue = `As an action, this innate spell may be used to repeat one of the 
        effects of <b>Cruel Puppetry<b> to <b>${tToken.name}</b>.  
       <br><br>
       <b>FoundryVTT</b>: The target does not need to be targeted to use this ability.`;
        let itemData = [{
            "name": ATTACK_ITEM,
            "type": "spell",
            "flags": {
                "midi-qol": {
                    "onUseMacroName": "Cruel_Puppetry"
                }
            },
            "data": {
                "ability": "",
                "actionType": "other",
                "activation": {
                    "cost": 1,
                    "type": "action"
                },
                "description": { "value": descValue },
                "formula": "",
                "level": args[0].spellLevel,
                "preparation": {
                    "mode": "innate",
                    "prepared": false
                },
                "source": `${tToken.name}'s Cruel Puppetry`,
                "school": "nec",

            },
            "img": SMASH_IMG,
            "effects": []
        }];
        await aActor.createEmbeddedDocuments("Item", itemData);
    }
}

/***************************************************************************************************
 * Select Flavor of Spell this Round and Initiate Callback
 ***************************************************************************************************/
 async function pickFlavor() {
    const FUNCNAME = "pickFlavor()";
    log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const queryTitle = "Select How to Use Doll"
    const queryText = "Pick one from drop down list"
    const flavors = [
        "Hold the doll still: Restrains the victim.",
        `Force the doll to move: Victim moves ${distance} feet as you like.`,
        `Smash the doll: causing it take ${numDice}d6 bludgeoning damage.`,
        `Rip the doll in half: ends spell and does ${numDice}d12 necrotic damage.`
    ]
    pickFromListArray(queryTitle, queryText, pickFlavorCallBack, flavors);
    log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/****************************************************************************************
 * Create and process selection dialog, passing it onto specified callback function
 ***************************************************************************************/
 function pickFromListArray(queryTitle, queryText, pickCallBack, queryOptions) {
    const FUNCNAME = "pickFromList(queryTitle, queryText, ...queryOptions)";
    log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
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

    log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
        return;
}
/***************************************************************************************************
 * Callback function to handle menu choice.
 ***************************************************************************************************/
async function pickFlavorCallBack(selection) {
    const FUNCNAME = "pickFlavorCallBack(selection)"
    log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    if (!selection) {
        log("No selection", selection)
        return;
    }
    let choice = selection.split(" ")[0];     // Obtain first token from the selection
    log(`Choice made: ${choice}!`)

    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    msgTitle = "Cruel Puppetry - "

    switch (choice) {
        case "Hold":
            log(`Hold Case: ${selection}`)
            applyRestrained(tActor.uuid)
            msg = `${tToken.name} is affected by the ${RESTRAINED_JOURNAL} condition until
                    ${aToken.name}'s next turn`
            msgTitle += "Hold Still"
            jezPostMessage({ color: "purple", fSize: 14, msg: msg, title: msgTitle, icon: HOLD_IMG })
            break;
        case "Force":
            log(`Force Case: ${selection}`)
            msg = `<b>${tToken.name}</b> is forced to move up to ${distance} feet.
                   <b>${aToken.name}</b> chooses path and destination.`
            msgTitle += "Forced Move"
            log("msg", msg)
            jezPostMessage({ color: "purple", fSize: 14, msg: msg, title: msgTitle, icon: FORCE_IMG })
            break;
        case "Smash":
            log(`Smash Case: ${selection}`)
            applySmash()
            break;
        case "Rip":
            log(`Rip Case: ${selection}`)
            await applyRip()
            log(`Force Case: ${selection}`)
            break;
        default:
            log(`Default Case: ${selection}`)
            errorMsg = `Disturbingly, reached end of switch without a match for ==>${choice}<==`
            ui.notifications.error(msg);
            log(errorMsg)
            return (choice)
    }
    return (choice)

    //----------------------------------------------------------------------------------
    // Apply Restrained Condition to specified UUID
    //
    function applyRestrained(actorUUID) {
        let effectData = [{
            label: RESTRAINED_NAME,
            icon: RESTRAINED_ICON,
            origin: aActor.uuid,
            disabled: false,
            duration: { rounds: 1, startRound: gameRound },
            changes: [
                { key: `flags.VariantEncumbrance.speed`, mode: OVERRIDE, value: 1, priority: 20 },
                { key: `data.attributes.movement.walk`, mode: OVERRIDE, value: 1, priority: 20 },
                { key: `data.attributes.movement.swim`, mode: OVERRIDE, value: 1, priority: 20 },
                { key: `data.attributes.movement.fly`, mode: OVERRIDE, value: 1, priority: 20 },
                { key: `data.attributes.movement.climb`, mode: OVERRIDE, value: 1, priority: 20 },
                { key: `data.attributes.movement.burrow`, mode: OVERRIDE, value: 1, priority: 20 },
                { key: `flags.midi-qol.disadvantage.attack.all`, mode: OVERRIDE, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.all`, mode: OVERRIDE, value: 1, priority: 20 },
                { key: `flags.midi-qol.disadvantage.ability.save.dex`, mode: OVERRIDE, value: 1, priority: 20 },
            ]
        }]
        MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actorUUID, effects: effectData });
    }
    //----------------------------------------------------------------------------------
    // Apply Smash Damage
    //
    function applySmash() {
        let DAMAGETYPE = "bludgeoning";
        let damageDice = `${numDice}d6`;
        let damageRoll = new Roll(`${damageDice}`).evaluate({ async: false });
        new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, DAMAGETYPE, [tToken], damageRoll,
            { flavor: `${tToken.name} suffers from ${aItem.name} <b>Smash</b>`, itemCardId: args[0].itemCardId });

        msg = `<b>${aToken.name}</b> smashes the focused doll, inflicting ${damageRoll.total} ${DAMAGETYPE} 
               damage on <b>${tToken.name}</b>.`
        msgTitle += "Smash Doll"
        log("msg", msg)
        jezPostMessage({ color: "Maroon", fSize: 14, msg: msg, title: msgTitle, icon: SMASH_IMG })

    }
    //----------------------------------------------------------------------------------
    // Apply Rip Damage & End Spell
    //
    async function applyRip() {
        let DAMAGETYPE = "necrotic";
        let damageDice = `${numDice}d12`;
        let damageRoll = new Roll(`${damageDice}`).evaluate({ async: false });
        new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, DAMAGETYPE, [tToken], damageRoll,
            { flavor: `${tToken.name} suffers from ${aItem.name} <b>Rip</b>`, itemCardId: args[0].itemCardId });

        msg = `<b>${aToken.name}</b> rips the focused doll in twain, inflicting ${damageRoll.total} ${DAMAGETYPE} 
               damage on <b>${tToken.name}</b> and ending the spell effect.`
        msgTitle += "Rip Doll"
        log("msg", msg)
        jezPostMessage({ color: "FireBrick", fSize: 14, msg: msg, title: msgTitle, icon: RIP_IMG })

        let concentrating = await aActor.effects.find(ef => ef.data.label === "Concentrating");
        if (concentrating) await concentrating.delete();
    }
}

/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        errorMsg = `Targeted nothing, must target single token to be acted upon`;
        log(errorMsg);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        errorMsg = `Please target a single token not ${game.user.targets.ids.length} tokens.`;
        log(errorMsg);
        return (false);
    }
    log(`Targeting one target, a good thing`);
    return (true);
}

/***************************************************************************************
 * Function to delete an item from actor
 *
 * Parameters
 *  - itemName: A string naming the item to be found in actor's inventory
 *  - actor: Optional actor to be searched, defaults to actor launching this macro
 ***************************************************************************************/
 async function jezDeleteItem(itemName, actor) {
    const FUNCNAME = "deleteItem(itemName, actor)";
    let defActor = null;
    if (lastArg.tokenId) defActor = canvas.tokens.get(lastArg.tokenId).actor; 
    else defActor = game.actors.get(lastArg.actorId);
    actor = actor ? actor : defActor; // Set actor if not supplied
    log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`,
        "itemName", itemName, `actor ${actor?.name}`, actor);

    if (!jezIsActor5e(actor)) {
        errorMsg = `Obtained actor argument is not of type Actor5E (${actor?.constructor.name})`
        log(errorMsg)
        log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} ==> FALSE --------------`);
        return (false);
    }
    let item = actor.items.find(item => item.data.name === itemName && item.type === "spell")
    if (item == null || item == undefined) {
        errorMsg = `${actor.name} does not have ${itemName}`
        log(errorMsg);
        log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} ==> FALSE --------------`);
        return (false);
    }

    log("item.id", item.id)
    log(await actor.deleteOwnedItem(item.id));
    //log(await aActor.deleteEmbeddedDocuments(item.id));
    // await item.uuid.delete()
    log(`${actor.name} had (past tense) ${item.name}`, item);
    log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} ==> TRUE -----------------`);
    return (true);
}
/***************************************************************************************************
 * Return true if passed argument is of object type "Token5e"
 ***************************************************************************************************/
 function jezIsActor5e(obj) {
    if (obj?.constructor.name === "Actor5e") return(true)
    return(false)
}
/***************************************************************************************************
 * Post the results to chat card
 ***************************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    log(`chatMessage: `,chatMessage);
    //const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    //const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}

/***************************************************************************************************
 * Post a new chat message -- msgParm should be a string for a simple message or an object with
 * some or all of these fields set below for the chat object.
 *
 * Example Calls:
 *  jezPostMessage("Hi there!")
 *  jezPostMessage({color:"purple", fSize:18, msg:"Bazinga", title:"Sheldon says..." })
 *
 ***************************************************************************************************/
 async function jezPostMessage(msgParm) {
    const FUNCNAME = "postChatMessage(msgParm)";
    log(`--------------${FUNCNAME}-----------`, "Starting", `${MACRONAME} ${FUNCNAME}`,
        "msgParm", msgParm);
    let typeOfParm = typeof (msgParm)
    switch (typeOfParm) {
        case "string":
            await ChatMessage.create({ content: msgParm });
            break;
        case "object":
            let chat = {}
            chat.title = msgParm?.title || "Generic Chat Message"
            chat.fSize = msgParm?.fSize || 12
            chat.color = msgParm?.color || "black"
            chat.icon  = msgParm?.icon  || "icons/vtt-512.png"
            chat.msg   = msgParm?.msg   || "Maybe say something useful..."
            let chatCard = `
            <div class="dnd5e chat-card item-card midi-qol-item-card">
                <header class="card-header flexrow">
                    <img src="${chat.icon}" title="${chat.title}" width="36" height="36">
                    <h3 class="item-name">${chat.title}</h3>
                </header>
                <div class="card-buttons">
                    <p style="color:${chat.color};font-size:${chat.fSize}px">
                        ${chat.msg}</p>
                </div>
            </div>`
            await ChatMessage.create({ content: chatCard });
            break;
        default:
            errorMsg`Icky Poo Poo!  Parameter passed was neither a string nor object (${typeOfParm})`
            log(errorMsg, msgParm)
            ui.notifications.error(errorMsg)
    }
    await wait(100);
    await ui.chat.scrollBottom();
    log(`--------------${FUNCNAME}-----------`, "Finished", `${MACRONAME} ${FUNCNAME}`);
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