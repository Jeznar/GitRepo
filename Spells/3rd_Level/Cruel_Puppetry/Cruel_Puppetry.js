const MACRONAME = "Cruel_Puppetry.0.4.js"
/*****************************************************************************************
 * Create a temporary attack item to use against the victim of Cruel Puppetry
 *
 * 01/15/22 0.1 Creation of Macro
 * 01/16/22 0.2 Finishing up.  Still has issue with multiple targets
 * 05/17/22 0.3 FoundryVTT 9.x compatibility
 * 08/02/22 0.4 Add convenientDescription
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const TL = 5;                               // Trace Level for this macro
let msg = "";                               // Global message string
jez.log("")
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
let errorMsg, msgTitle = "";
let gameRound = game.combat ? game.combat.round : 0;
const SMASH_IMG = "Icons_JGB/Spells/3rd_Level/Cruel_Puppetry/Puppet.png"
const RIP_IMG = "Icons_JGB/Spells/3rd_Level/Cruel_Puppetry/Puppet_Broken.png"
const FORCE_IMG = "Icons_JGB/Spells/3rd_Level/Cruel_Puppetry/Puppet_Moved.png"
const HOLD_IMG = "Icons_JGB/Spells/3rd_Level/Cruel_Puppetry/Puppet_Restrained.png"
const FAIL_ICON = "Icons_JGB/Misc/Failure.png"
const RESTRAINED_JOURNAL = "<b>@JournalEntry[CZWEqV2uG9aDWJnD]{restrained}</b>"
const RESTRAINED_ICON = "modules/combat-utility-belt/icons/restrained.svg"
const RESTRAINED_NAME = "Restrained" // aItem.name || "Nature's Wraith";
const ERROR_ICON = "Icons_JGB/Misc/Error.png"
const ATTACK_ITEM = "Cruel Puppetry Repeat Effect";
let distance = 15
let numDice = 3
let repeatExe = false
if (args[0]?.item?.name.toLowerCase().includes("repeat")) repeatExe = true // e.g. "Cruel Puppetry Repeat Effect"
jez.log("Repeat execution", repeatExe)
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && (!repeatExe)) { // Only check on first doOnUse run
    if (!(await preCheck())) {
        jez.log(errorMsg)
        return;
    }
}
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
    // Check anything important...
    if (!oneTarget()) {
        jez.log(errorMsg)
        ui.notifications.error(errorMsg)

        msg = `No, no, NO!.<br><br><b>Cruel Puppetry</b> requires exactly one target! <br><br>${errorMsg}`
        msgTitle = "Suspected PEBCAK Error"
        await jez.postMessage({ color: "Crimson", fSize: 14, msg: msg, title: msgTitle, icon: ERROR_ICON })
        // await jezDeleteItem(ATTACK_ITEM, aActor); // Broken at FoundryVTT 9.x
        await jez.deleteItems(ATTACK_ITEM, "spell", aActor);
        await DAE.unsetFlag(aActor, `${MACRO}.spellData`);
        jez.log("aActor", aActor)
        let concentrating = await aActor.effects.find(ef => ef.data.label === "Concentrating");
        jez.log("concentrating", concentrating)
        if (concentrating) await concentrating.delete();

        return (false);
    }
    jez.log('All looks good, to quote Jean-Luc, "MAKE IT SO!"')
    return (true)
}

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 *
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let originID = lastArg.origin.split(".")[1] // aqNN90V6BjFcJpI5 (Origin  ID)
    jez.log("originID", originID);
    let oToken = canvas.tokens.objects.children.find(e => e.data.actorId === originID)
    jez.log("oToken", oToken)
    let oActor = oToken.actor
    jez.log("oActor", oActor)
    jez.log(`doOff ---> Delete ${ATTACK_ITEM} from ${oToken.data.name} if it exists`)
    //await jezDeleteItem(ATTACK_ITEM, oActor);
    await jez.deleteItems(ATTACK_ITEM, "spell", oActor);
    await DAE.unsetFlag(oActor, `${MACRO}.spellData`);
    jez.log("Actor to remove concentration from", oActor)
    let concentrating = await oActor.effects.find(ef => ef.data.label === "Concentrating");
    jez.log("Concentration effect", concentrating)
    if (concentrating) await concentrating.delete();
    // await deleteItem(ATTACK_ITEM, oActor);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("A place for things to be done");
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken, tActor, spellData;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);

    if (repeatExe) { // On repeat execution, get target and level info from data flag
        spellData = await DAE.getFlag(aActor, `${MACRO}.spellData`);
        jez.log("___Flag Data___",
            "targetID", spellData.targetID,
            "spellLevel", spellData.spellLevel);
        tToken = canvas.tokens.objects.children.find(e => e.data.actorId === spellData.targetID);
        tActor = tToken?.actor;
        // set spell effects based on flag data
        distance = Math.min(tActor.data.data.attributes.movement.walk, 5 * spellData.spellLevel)
        numDice = spellData.spellLevel;
        jez.log("Have Target Roll Save Again")
        let saveDC = aActor.data.data.attributes.spelldc;
        const SAVE_TYPE = "cha"
        const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${saveDC}</b> to end <b>Cruel Puppetry</b>`;
        let save = (await tActor.rollAbilitySave(SAVE_TYPE,
            { FLAVOR, chatMessage: true, fastforward: true, disadvantage: true }));
        jez.log("save", save);
        msgTitle = "Cruel Puppetry - "
        if (save.total > saveDC) {
            jez.log(`save was made with a ${save.total}`);
            let concentrating = await aActor.effects.find(ef => ef.data.label === "Concentrating");
            if (concentrating) await concentrating.delete();
            msg = `${tToken.name} has broken the Cruel Pupptry spell, with a CHA save of ${save.total}
            against a DC${saveDC}.  The doll used to cast the spell has been destroyed.`
            msgTitle += "Spell Broken"
            jez.postMessage({ color: "BlueViolet", fSize: 14, msg: msg, title: msgTitle, icon: FAIL_ICON })
            return;
        } else {
            jez.log(`save failed with a ${save.total}`);

            // Post results to game chat
            msg = `${tToken.name} failed to save against the Cruel Pupptry spell, with a CHA save of 
            ${save.total} against a DC${saveDC}.  ${aToken.name} may choose an effect.`
            msgTitle += "Save Failed"
            jez.postMessage({ color: "DarkGreen", fSize: 14, msg: msg, title: msgTitle, icon: FAIL_ICON })
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

    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
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
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const queryTitle = "Select How to Use Doll"
    const queryText = "Pick one from drop down list"
    const flavors = [
        "Hold the doll still: Restrains the victim.",
        `Force the doll to move: Victim moves ${distance} feet as you like.`,
        `Smash the doll: causing it take ${numDice}d6 bludgeoning damage.`,
        `Rip the doll in half: ends spell and does ${numDice}d12 necrotic damage.`
    ]
    pickFromListArray(queryTitle, queryText, pickFlavorCallBack, flavors);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/****************************************************************************************
 * Create and process selection dialog, passing it onto specified callback function
 ***************************************************************************************/
function pickFromListArray(queryTitle, queryText, pickCallBack, queryOptions) {
    const FUNCNAME = "pickFromList(queryTitle, queryText, ...queryOptions)";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    if (typeof (pickCallBack) != "function") {
        msg = `pickFromList given invalid pickCallBack, it is a ${typeof (pickCallBack)}`
        ui.notifications.error(msg);
        jez.log(msg);
        return
    }
    if (!queryTitle || !queryText || !queryOptions) {
        msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, [queryOptions]),
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

    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Callback function to handle menu choice.
 ***************************************************************************************************/
async function pickFlavorCallBack(selection) {
    const FUNCNAME = "pickFlavorCallBack(selection)"
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    if (!selection) {
        jez.log("No selection", selection)
        return;
    }
    let choice = selection.split(" ")[0];     // Obtain first token from the selection
    jez.log(`Choice made: ${choice}!`)

    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    msgTitle = "Cruel Puppetry - "

    switch (choice) {
        case "Hold":
            jez.log(`Hold Case: ${selection}`)
            applyRestrained(tActor.uuid)
            msg = `${tToken.name} is affected by the ${RESTRAINED_JOURNAL} condition until
                    ${aToken.name}'s next turn`
            msgTitle += "Hold Still"
            jez.postMessage({ color: "purple", fSize: 14, msg: msg, title: msgTitle, icon: HOLD_IMG })
            break;
        case "Force":
            jez.log(`Force Case: ${selection}`)
            msg = `<b>${tToken.name}</b> is forced to move up to ${distance} feet.
                   <b>${aToken.name}</b> chooses path and destination.`
            msgTitle += "Forced Move"
            jez.log("msg", msg)
            jez.postMessage({ color: "purple", fSize: 14, msg: msg, title: msgTitle, icon: FORCE_IMG })
            break;
        case "Smash":
            jez.log(`Smash Case: ${selection}`)
            applySmash()
            break;
        case "Rip":
            jez.log(`Rip Case: ${selection}`)
            await applyRip()
            jez.log(`Force Case: ${selection}`)
            break;
        default:
            jez.log(`Default Case: ${selection}`)
            errorMsg = `Disturbingly, reached end of switch without a match for ==>${choice}<==`
            ui.notifications.error(msg);
            jez.log(errorMsg)
            return (choice)
    }
    return (choice)

    //----------------------------------------------------------------------------------
    // Apply Restrained Condition to specified UUID
    //
    function applyRestrained(actorUUID) {
        const FUNCNAME = "applyRestrained(actorUUID)";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `${MACRO} ${FNAME} |`
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "actorUUID", actorUUID);
        //----------------------------------------------------------------------------------
        //jezcon.add({ effectName: RESTRAINED_NAME, uuid: actorUUID, traceLvl: TL });
        const CE_DESC = `Speed is 0, no bonuses to speed, grants advantage to attacks, disadvantage on attacks and DEX Saves`
        let effectData = [{
            label: RESTRAINED_NAME,
            icon: RESTRAINED_ICON,
            origin: aActor.uuid,
            disabled: false,
            flags: { 
                dae: { itemData: aItem }, 
                convenientDescription: CE_DESC
            },
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
        jez.log("msg", msg)
        jez.postMessage({ color: "Maroon", fSize: 14, msg: msg, title: msgTitle, icon: SMASH_IMG })

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
        jez.log("msg", msg)
        jez.postMessage({ color: "FireBrick", fSize: 14, msg: msg, title: msgTitle, icon: RIP_IMG })

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
        jez.log(errorMsg);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        errorMsg = `Please target a single token not ${game.user.targets.ids.length} tokens.`;
        jez.log(errorMsg);
        return (false);
    }
    jez.log(`Targeting one target, a good thing`);
    return (true);
}