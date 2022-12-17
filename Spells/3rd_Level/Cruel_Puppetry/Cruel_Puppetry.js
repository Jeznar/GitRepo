const MACRONAME = "Cruel_Puppetry.0.5.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Create a temporary attack item to use against the victim of Cruel Puppetry.
 * 
 * This macro needs to be in the macro folder and attached as an Item Macro.
 *
 * 01/15/22 0.1 Creation of Macro
 * 01/16/22 0.2 Finishing up.  Still has issue with multiple targets
 * 05/17/22 0.3 FoundryVTT 9.x compatibility
 * 08/02/22 0.4 Add convenientDescription
 * 12/17/22 0.5 Update logging and general style
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
let msgTitle = "";
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
// let repeatExe = false
// if (args[0]?.item?.name.toLowerCase().includes("repeat")) repeatExe = true // e.g. "Cruel Puppetry Repeat Effect"
const REPEAT_EXE = (args[0]?.item?.name.toLowerCase().includes("repeat")) ? true : false
if (TL > 1) jez.trace(`${TAG} Repeat execution`, REPEAT_EXE) 
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "each") doEach({ traceLvl: TL });					     // DAE everyround
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && (!REPEAT_EXE)) { // Only check on first doOnUse run
    if (!(await preCheck())) {
        if (TL > 1) jez.trace(`${TAG} `, errorMsg)
        return;
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
 async function preCheck() {
    if (args[0].targets.length !== 1)
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, 'w')
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
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
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
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
    let originID = L_ARG.origin.split(".")[1] // aqNN90V6BjFcJpI5 (Origin  ID)
    if (TL > 1) jez.trace(`${TAG} originID`, originID);
    let oToken = canvas.tokens.objects.children.find(e => e.data.actorId === originID)
    if (TL > 1) jez.trace(`${TAG} oToken`, oToken)
    let oActor = oToken.actor
    if (TL > 1) jez.trace(`${TAG} oActor`, oActor)
    if (TL > 1) jez.trace(`${TAG} doOff ---> Delete ${ATTACK_ITEM} from ${oToken.data.name} if it exists`)
    //await jezDeleteItem(ATTACK_ITEM, oActor);
    await jez.deleteItems(ATTACK_ITEM, "spell", oActor);
    await DAE.unsetFlag(oActor, `${MACRO}.spellData`);
    if (TL > 1) jez.trace(`${TAG} Actor to remove concentration from`, oActor)
    let concentrating = await oActor.effects.find(ef => ef.data.label === "Concentrating");
    if (TL > 1) jez.trace(`${TAG} Concentration effect`, concentrating)
    if (concentrating) await concentrating.delete();
    // await deleteItem(ATTACK_ITEM, oActor);
    if (TL > 1) jez.trace(`${TAG} -------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    let spellData;
    //-------------------------------------------------------------------------------------------------------------------------------
    // On repeat execution, get target and level info from data flag
    //
    if (REPEAT_EXE) { 
        spellData = await DAE.getFlag(aActor, `${MACRO}.spellData`);
        if (TL > 1) jez.trace(`${TAG} ___Flag Data___`,
            "targetID", spellData.targetID,
            "spellLevel", spellData.spellLevel);
        tToken = canvas.tokens.objects.children.find(e => e.data.actorId === spellData.targetID);
        tActor = tToken?.actor;
        // set spell effects based on flag data
        distance = Math.min(tActor.data.data.attributes.movement.walk, 5 * spellData.spellLevel)
        numDice = spellData.spellLevel;
        if (TL > 1) jez.trace(`${TAG} Have Target Roll Save Again`)
        let saveDC = aActor.data.data.attributes.spelldc;
        const SAVE_TYPE = "cha"
        const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${saveDC}</b> to end <b>Cruel Puppetry</b>`;
        let save = (await tActor.rollAbilitySave(SAVE_TYPE,
            { FLAVOR, chatMessage: true, fastforward: true, disadvantage: true }));
        if (TL > 1) jez.trace(`${TAG} save`, save);
        msgTitle = "Cruel Puppetry - "
        if (save.total > saveDC) {
            if (TL > 1) jez.trace(`${TAG} save was made with a ${save.total}`);
            let concentrating = await aActor.effects.find(ef => ef.data.label === "Concentrating");
            if (concentrating) await concentrating.delete();
            msg = `${tToken.name} has broken the Cruel Pupptry spell, with a CHA save of ${save.total}
            against a DC${saveDC}.  The doll used to cast the spell has been destroyed.`
            msgTitle += "Spell Broken"
            jez.postMessage({ color: "BlueViolet", fSize: 14, msg: msg, title: msgTitle, icon: FAIL_ICON })
            return;
        } else {
            if (TL > 1) jez.trace(`${TAG} save failed with a ${save.total}`);

            // Post results to game chat
            msg = `${tToken.name} failed to save against the Cruel Pupptry spell, with a CHA save of 
            ${save.total} against a DC${saveDC}.  ${aToken.name} may choose an effect.`
            msgTitle += "Save Failed"
            jez.postMessage({ color: "DarkGreen", fSize: 14, msg: msg, title: msgTitle, icon: FAIL_ICON })
        }
    //-------------------------------------------------------------------------------------------------------------------------------
    // First time execution
    //
    } else { // First time execution
        await createItem({traceLvl: TL})
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
    //---------------------------------------------------------------------------------------------------------------------------------
    await pickFlavor({traceLvl: TL})
    //---------------------------------------------------------------------------------------------------------------------------------
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return (true);
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
     * 
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
    async function createItem(options = {}) {
        const FUNCNAME = "createItem(options={})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `${MACRO} ${FNAME} |`
        const TL = options.traceLvl ?? 0
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
        //-------------------------------------------------------------------------------------------------------------------------------
        // 
        //
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
        if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Select Flavor of Spell this Round and Initiate Callback
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function pickFlavor(options = {}) {
    const FUNCNAME = "createItem(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    const queryTitle = "Select How to Use Doll"
    const queryText = "Pick one from drop down list"
    const flavors = [
        "Hold the doll still: Restrains the victim.",
        `Force the doll to move: Victim moves ${distance} feet as you like.`,
        `Smash the doll: causing it take ${numDice}d6 bludgeoning damage.`,
        `Rip the doll in half: ends spell and does ${numDice}d12 necrotic damage.`
    ]
    pickFromListArray(queryTitle, queryText, pickFlavorCallBack, flavors);
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return (true);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Create and process selection dialog, passing it onto specified callback function
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function pickFromListArray(queryTitle, queryText, pickCallBack, queryOptions) {
    const FUNCNAME = "pickFromList(queryTitle, queryText, ...queryOptions)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'queryTitle', queryTitle, 'queryText', queryText, 
        'pickCallBack', pickCallBack, 'queryOptions', queryOptions);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    if (typeof (pickCallBack) != "function") {
        msg = `pickFromList given invalid pickCallBack, it is a ${typeof (pickCallBack)}`
        ui.notifications.error(msg);
        if (TL > 1) jez.trace(`${TAG} ${msg}`);
        return
    }
    if (!queryTitle || !queryText || !queryOptions) {
        msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, [queryOptions]),
                   but yours are: ${queryTitle}, ${queryText}, ${pickCallBack}, ${queryOptions}`;
        ui.notifications.error(msg);
        if (TL > 1) jez.trace(`${TAG} ${msg}`);
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
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Callback function to handle menu choice.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function pickFlavorCallBack(selection) {
    const FUNCNAME = "pickFlavorCallBack(selection)"
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'selection', selection);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    if (!selection) {
        if (TL > 1) jez.trace(`${TAG} No selection`, selection)
        return;
    }
    let choice = selection.split(" ")[0];     // Obtain first token from the selection
    if (TL > 1) jez.trace(`${TAG} Choice made: ${choice}!`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    msgTitle = "Cruel Puppetry - "
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    switch (choice) {
        case "Hold":
            if (TL > 1) jez.trace(`${TAG} Hold Case: ${selection}`)
            applyRestrained(tActor.uuid)
            msg = `${tToken.name} is affected by the ${RESTRAINED_JOURNAL} condition until
                    ${aToken.name}'s next turn`
            msgTitle += "Hold Still"
            jez.postMessage({ color: "purple", fSize: 14, msg: msg, title: msgTitle, icon: HOLD_IMG })
            msg = `Drat! ${aToken.name}'s cruel puppet has restrained me.`
            bubbleForAll(tToken.id, msg, true, true)
            break;
        case "Force":
            if (TL > 1) jez.trace(`${TAG} Force Case: ${selection}`)
            msg = `<b>${tToken.name}</b> is forced to move up to ${distance} feet.
                   <b>${aToken.name}</b> chooses path and destination.`
            msgTitle += "Forced Move"
            if (TL > 1) jez.trace(`${TAG} ${msg}`)
            jez.postMessage({ color: "purple", fSize: 14, msg: msg, title: msgTitle, icon: FORCE_IMG })
            msg = `Run Away! ${aToken.name} has forced me to move.`
            bubbleForAll(tToken.id, msg, true, true)
            break;
        case "Smash":
            if (TL > 1) jez.trace(`${TAG} Smash Case: ${selection}`)
            applySmash()
            msg = `Ouch! ${aToken.name} is abusing that doll, and it hurts me.`
            bubbleForAll(tToken.id, msg, true, true)
            break;
        case "Rip":
            if (TL > 1) jez.trace(`${TAG} Rip Case: ${selection}`)
            await applyRip()
            if (TL > 1) jez.trace(`${TAG} Force Case: ${selection}`)
            msg = `Double Ouch! ${aToken.name} has destroyed that doll, and it really hurts.`
            bubbleForAll(tToken.id, msg, true, true)
            break;
        default:
            if (TL > 1) jez.trace(`${TAG} Default Case: ${selection}`)
            jez.badNews(`Disturbingly, reached end of switch without a match for ==>${choice}<==`,'e')
            return (choice)
    }
    return (choice)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply Restrained Condition to specified UUID
    //
    function applyRestrained(actorUUID) {
        const FUNCNAME = "applyRestrained(actorUUID)";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `${MACRO} ${FNAME} |`
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "actorUUID", actorUUID);
        //---------------------------------------------------------------------------------------------------------------------------
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
            duration: { rounds: 1, startRound: GAME_RND },
            changes: [
                { key: `flags.VariantEncumbrance.speed`, mode: jez.OVERIDE, value: 1, priority: 20 },
                { key: `data.attributes.movement.walk`, mode: jez.OVERIDE, value: 1, priority: 20 },
                { key: `data.attributes.movement.swim`, mode: jez.OVERIDE, value: 1, priority: 20 },
                { key: `data.attributes.movement.fly`, mode: jez.OVERIDE, value: 1, priority: 20 },
                { key: `data.attributes.movement.climb`, mode: jez.OVERIDE, value: 1, priority: 20 },
                { key: `data.attributes.movement.burrow`, mode: jez.OVERIDE, value: 1, priority: 20 },
                { key: `flags.midi-qol.disadvantage.attack.all`, mode: jez.OVERIDE, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.all`, mode: jez.OVERIDE, value: 1, priority: 20 },
                { key: `flags.midi-qol.disadvantage.ability.save.dex`, mode: jez.OVERIDE, value: 1, priority: 20 },
            ]
        }]
        MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actorUUID, effects: effectData });
    }
    //-------------------------------------------------------------------------------------------------------------------------------
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
        if (TL > 1) jez.trace(`${TAG} ${msg}`)
        jez.postMessage({ color: "Maroon", fSize: 14, msg: msg, title: msgTitle, icon: SMASH_IMG })

    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply Rip Damage & End Spell
    //
    async function applyRip() {
        let DAMAGETYPE = "necrotic";
        let damageDice = `${numDice}d12`;
        let damageRoll = new Roll(`${damageDice}`).evaluate({ async: false });
        new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, DAMAGETYPE, [tToken], damageRoll,
            { flavor: `${tToken.name} suffers from ${aItem.name} <b>Rip</b>`, itemCardId: args[0].itemCardId });
        //---------------------------------------------------------------------------------------------------------------------------
        msg = `<b>${aToken.name}</b> rips the focused doll in twain, inflicting ${damageRoll.total} ${DAMAGETYPE} 
               damage on <b>${tToken.name}</b> and ending the spell effect.`
        msgTitle += "Rip Doll"
        if (TL > 1) jez.trace(`${TAG} ${msg}`)
        jez.postMessage({ color: "FireBrick", fSize: 14, msg: msg, title: msgTitle, icon: RIP_IMG })
        //---------------------------------------------------------------------------------------------------------------------------
        let concentrating = await aActor.effects.find(ef => ef.data.label === "Concentrating");
        if (concentrating) await concentrating.delete();
    }
}