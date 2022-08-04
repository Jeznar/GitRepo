const MACRONAME = "Bestow_Curse.1.5.js";
/*****************************************************************************************
 * Implemention of Bestow Curse.
 * 
 * Description: long....go read it elsewhere.  The suggested afllictions, and importantly 
 * the name I am giving each are:
 * 
 * Ineptitude    - The afflicted has disadvantage on ability checks and saving throws made 
 *                 with a caster selected ability score.
 * Aversion      - The afflicted has disadvantage on attack rolls against caster.
 * Lethergy      - The afflicted must make a Wisdom saving throw at the start of each of its 
 *                 turns. If it fails, it wastes its action that turn, doing nothing.
 * Vulnerability - Caster's attacks deal an extra 1d8 necrotic damage to the target.
 * Other         - Some other effect agreed on by player and GM
 * 
 * This is my attempt to implement this with a DAE itemm macro.
 * 
 * 12/16/21 0.1 Creation and basic application of curse
 * 12/16/21 0.2 Addition of curse selection menu to the doOn function and Ineptitude 
 *              automation
 * 12/16/21 0.3 Work with AE Flag setting to manage removal of bonus buff
 * 12/16/21 0.4 Add doEach to implment the saving through at the start of each round.
 * 12/17/21 0.6 Jon Replaced if statements with ternary statements and created the log() function.
 * 12/17/21 0.7 Jon Adding Vulnerability logic.
 * 12/18/21 0.8 JGB Replaced all the if(DEBUG) console.log calls with log function 
 * 12/18/21 0.9 JGB Work on a damageonlyworkflow for curse of vulnerability
 * 12/19/21 1.0 JGB Cleanups
 * 12/21/21 1.1 JGB Reshuffling looking for itemD not defined error
 * 12/21/21 1.2 JGB Combine nearly redundent selection functions
 * 05/02/22 1.3 JGB Update for Foundry 9.x
 * 05/05/22 1.4 JGB change createEmbeddedEntity to createEmbeddedDocuments for 9.x
 * 07/29/22 1.5 JGB Added Convenient Description and fixed logic error in Vulnerabilty 
 ******************************************************************************************/
const DEBUG = true;
const CURSENAME = "BestowCurse";
const CONDITION = "Cursed";
const ICON = "Icons_JGB/Misc/curse.png";
const NOACTIONSICON = "Icons_JGB/Misc/Stop_Sign.png";
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const LAST_ARG = args[args.length - 1]; 
const SAVE_DC = args[0]?.item?.data?.save?.dc


const CurseofLethergy = "Curse of Lethergy";
const CurseofIneptitude = "Curse of Ineptitude"
let msg = "";
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;         
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor; 

let tactor = (LAST_ARG.tokenId) 
	? canvas.tokens.get(LAST_ARG.tokenId).actor 
	: game.actors.get(LAST_ARG.actorId);

log("---------------------------------------------------------------------------",
    "Starting", MACRONAME,
    "Macro", MACRO,
    "Curse", CURSENAME,
    "tactor", tactor);
for (let i = 0; i < args.length; i++) log(`    args[${i}]`, args[i]);

if (args[0]?.tag === "OnUse") doOnUse();   			    // Midi ItemMacro On Use
 if (args[0] === "on") doOn();          			    // DAE Application
if (args[0] === "off") doOff();        			        // DAE removal
if (args[0] === "each") doEach();					    // DAE removal
if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus

log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
return;

 /***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/
/****************************************************************************************
 * Execute code for a ItemMacro onUse
 ***************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    log("---------------------------------------------------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "Curse", CURSENAME);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    let itemD = args[0]?.item;
    let targetD = canvas.tokens.get(args[0]?.targets[0]?.id);
    log("Obtained values", "itemD", itemD, "targetD", targetD);

    //---------------------------------------------------------------------------------------
    // Make sure exactly one token was targeted
    //
    if (oneTarget()) {
        log(` one target is targeted (a good thing)`);
    } else {
        log(` exception on number of targets selected: ${msg}`);
        await postResults(msg);
        log(`Ending ${MACRONAME} ${FUNCNAME}`);
        return;
    }

    //---------------------------------------------------------------------------------------
    // Make sure target failed its saving throw
    //
    if (failedCount() === 1) {
        log(`Target failed save, continue`);
    } else {
        log(`Target passed save, exit`);
        await postResults("Target made its saving thow, no effects added");
        log(`Ending ${MACRONAME} ${FUNCNAME}`);
        return;
    }

    //---------------------------------------------------------------------------------------
    // Select the curse to apply
    //
    const queryTitle = "Select Specific Curse to be Applied"
    const queryText = "Pick one from drop down list"
    //pickCurse(queryTitle, queryText, pickCurseCallBack,
    pickFromList(queryTitle, queryText, pickCurseCallBack,
        "Ineptitude - Disadvantage on one stat's ability checks and saves",
        "Aversion - Disadvantage on attack rolls against caster.",
        "Lethergy - Wisdom save or waste each turn.",
        "Vulnerability - Caster's attacks deal an extra damage",
        "Other - Other effect agreed on by player and GM");

    //------------------------------------------------------------------------------------
    // Set a flag with the saveDC for later use
    //
    log("itemD", itemD);
    const saveDC = itemD.data.save.dc
    log("saveDC", saveDC);

    await DAE.setFlag(targetD.actor, `${MACRO}.saveDC`, saveDC);
    await DAE.setFlag(targetD.actor, `${MACRO}.curseItemD`, itemD);
    log(`Set DAE flags on ${targetD.actor.name}`,
        `${MACRO}.saveDC`, saveDC,
        `${MACRO}.curseItemD`, itemD);

    log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Execute code for a DAE Macro application (on) - nothing other than place holding
 ***************************************************************************************/
 async function doOn() {
    const FUNCNAME = "doOn()";
    log("---------------------------------------------------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Execute code for a DAE Macro removal (off)
 ***************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOnOff()";
    let afflictedToken = canvas.tokens.get(args[1]);

    log("---------------------------------------------------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`, 
        "afflictedToken", afflictedToken, 
        "tactor", tactor);  
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    //----------------------------------------------------------------------------------
    // Check for existance of flags, log the values, and delete them.
    //
    let secondDebuff = DAE.getFlag(tactor, `${MACRO}.SecondDebuff`);
    let saveDC = DAE.getFlag(tactor, `${MACRO}.SecondDebuff`);
    let curseItemD = DAE.getFlag(tactor, `${MACRO}.SecondDebuff`);
    log("#### Flags Set and Values ####",
        "secondDebuff", secondDebuff,
        "saveDC", saveDC,
        "curseItemD", curseItemD);
    await DAE.unsetFlag(tactor, `${MACRO}.SecondDebuff`);
    await DAE.unsetFlag(tactor, `${MACRO}.saveDC`);
    await DAE.unsetFlag(tactor, `${MACRO}.curseItemD`); 

    //----------------------------------------------------------------------------------
    // Check for debuff matching the flag.  If it exists, remove it.
    //
    let secondDebuffEffect = tactor.effects
        .find(ef => ef.data.label === secondDebuff) ?? null; // Added a null case.
    if (secondDebuffEffect) {
        let message = `${tactor.name} has ${secondDebuff} effect: `;
        log(message, secondDebuffEffect);
        await secondDebuffEffect.delete();
    } else {
        let message = `${tactor.name} lacks ${secondDebuff} effect.`;
        log(message);
    }

    log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Execute code for a DAE Macro each time on the target's turn per DAE setting
 ***************************************************************************************/
async function doEach() {
    const FUNCNAME = "doEach()";
    log("===========================================================================",
        `Starting`, `${MACRONAME} ${FUNCNAME}`, "tactor", tactor);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    let secondDebuff = DAE.getFlag(tactor, `${MACRO}.SecondDebuff`);
    log(`### secondDebuff: `, secondDebuff);

    if (secondDebuff === CurseofLethergy) {
        let abilitySave = "wis";     // Set appropriate stat for save
        let saveDC = DAE.getFlag(tactor, `${MACRO}.saveDC`);
        log(`### saveDC = ${saveDC}`);

        let save = await tactor.rollAbilitySave(abilitySave, {
            // Does not return item card. TODO: Look into Crymic Macros for Midi Save.
            chatMessage: true,
            fastForward: true,
            flavor: `Wisdom save vs <b>DC${saveDC}</b>.<br>
            On failure, ${tactor.name} takes no actions this round.`
        });
        log('Result of save', save);

    save.flavor = "new message"    
        if (save.total >= saveDC) { // TODO Update flavor text, based on result of save
            msg = `${tactor.name} made its save.  Rolling ${save.total} vs ${saveDC} DC.`;
        }
        else {
            msg = `${tactor.name} failed its save.  Rolling ${save.total} vs ${saveDC} DC.`;
            //-------------------------------------------------------------------------------
            // Slap a 1 turn duration "No Actions" condition on the token -- 
            // TODO: Does not stick, flashes and vanishes
            //
            let gameRound = game.combat ? game.combat.round : 0;
            let effectData = {
                label: "No_Actions",
                icon: NOACTIONSICON,
                origin: tactor.uuid,
                disabled: false,
                duration: { rounds: 2, turns: 2, startRound: gameRound, seconds: 12, startTime: game.time.worldTime },
                flags: { 
                    dae: { macroRepeat: "none", specialDuration: ["turnStart"] },
                    convenientDescription: `No Actions or Bonus Actions (Reactions allowed)`
                },
            };

            await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:tactor.uuid, effects: [effectData] });
            log(`applied "No Actions" Debuff: `, effectData);
            msg = `No actions this turn!`
            bubbleForAll(aToken.id, msg, true, true)
            await jez.wait(10);
        }

        log(msg, "save roll", save);
    }
    
    log("===========================================================================",
        `Ending`, `${MACRONAME} ${FUNCNAME}`);

    return;
}

/****************************************************************************************
 * Create and process selection dialog, passing it onto specified callback function
 ***************************************************************************************/
 function pickFromList(queryTitle, queryText, pickCallBack, ...queryOptions) {
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
        let msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, ...queryOptions),
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

/****************************************************************************************
 * Receive selected Curse and continue main steps
 ***************************************************************************************/
async function pickCurseCallBack(selection) {
    const FUNCNAME = "pickCurseCallBack(selection)";
    let itemD = args[0]?.item;
    let curseName = selection?.split(" ")[0]     // Grab first word of the selection

    log("---------------------------------------------------------------------------",
        `Starting`, `${MACRONAME} ${FUNCNAME}`,   
        `selection`, selection,
        `itemD`, itemD, 
        `curseName`, curseName);

    let curseDiscription = "";
    let level = args[0].spellLevel;

    let gameRound = game.combat ? game.combat.round : 0;
    const rounds = level === 3 ? 10 : level === 4 ? 100 : level === 5 ? 800 : level === 6 ? 800 : 9999999;
    const seconds = rounds * 6;

    switch (curseName) {
        case "Ineptitude":
            curseDiscription = `<b>Curse of ${curseName}</b>: The afflicted has disadvantage on 
                ability checks and saving throws made with a caster selected ability score.`;
            postResults(curseDiscription);
            const queryTitle = "Select Stat to be Afflicted"
            const queryText = "Pick one from drop down list"
            //pickStat(queryTitle, queryText, 
            pickFromList(queryTitle, queryText, pickStatCallBack, 
                "Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma");
            break;
        case "Aversion":
            curseDiscription = `<b>Curse of ${curseName}</b>: The afflicted has disadvantage on 
            attack rolls against caster.
            <br><br><b>FoundryVTT</b>: This should be handled manually.`
            postResults(curseDiscription);
            applyCurseStub(curseName);
            break;
        case "Lethergy":
            curseDiscription = `<b>Curse of ${curseName}</b>: The afflicted must make a 
                <b>Wisdom save</b> against <b>DC${itemD.data.save.dc}</b> at the start of each 
                of its turns. If it fails, it wastes its action that turn, doing nothing.`
            postResults(curseDiscription);
            applyCurseStub(curseName);
            break;
        case "Vulnerability":
            curseDiscription = `<b>Curse of ${curseName}</b>: Caster's attacks deal an extra 
                1d8 necrotic damage to the target.`
            postResults(curseDiscription);
            applyCurseStub(curseName);
            bonusDamage(canvas.tokens.get(args[0].targets[0].id), itemD, args[0].uuid, 
                canvas.tokens.get(args[0].tokenId), game.actors.get(args[0].actor._id), 
                rounds, seconds, gameRound)
            break;
        case "Other":
            curseDiscription = `<b>Curse of ${curseName}</b>: Some other effect agreed on 
            by player and GM. <br><br><b>FoundryVTT</b>: This should be handled manually.`
            postResults(curseDiscription);
            applyCurseStub(curseName);
            break;
        default:
            curseDiscription = `Unfortunately, this is an undefined condition.`
            postResults(curseDiscription);
            break;
    }
    log(`${curseName} description: ${curseDiscription}`);

    log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Receive selected stat and continue main steps.  This is only used by Curse of Lethergy
 ***************************************************************************************/
async function pickStatCallBack(selection) {
    const FUNCNAME = "pickStatCallBack(selection)";

    let player = canvas.tokens.get(args[0]?.tokenId);
    let targetD = canvas.tokens.get(args[0]?.targets[0]?.id);
    let stat = "";
    log("---------------------------------------------------------------------------",
        `Starting`, `${MACRONAME} ${FUNCNAME}`, 
        `selection`, selection,
        `player`, player, 
        `targetD`, targetD);

    // ---------------------------------------------------------------------------------------
    // Add cursed condition to target
    //
    switch(selection) {
        case "Strength"     : stat = "str"; break;
        case "Dexterity"    : stat = "dex"; break;
        case "Constitution" : stat = "con"; break;
        case "Intelligence" : stat = "int"; break;
        case "Wisdom"       : stat = "wis"; break;
        case "Charisma"     : stat = "cha"; break;
        default             : stat = "XYZ"; break;
    }                   
    log(`Short Stat Name`, stat);
    
    const secondDebuff = `${CurseofIneptitude} (${selection})`
    let gameRound = game.combat ? game.combat.round : 0;
    let effectData = {
        label: secondDebuff,
        icon: ICON,
        origin: player.actor.uuid,
        disabled: false,
        duration: { rounds: 99, startRound: gameRound },
        flags: { convenientDescription: `${selection} ability checks and saves at disadvantage` }, 
        changes: [
            { key: `flags.midi-qol.disadvantage.ability.check.${stat}`, mode: ADD, value: 1, priority: 20 },
            { key: `flags.midi-qol.disadvantage.ability.save.${stat}`,  mode: ADD, value: 1, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:targetD.actor.uuid, effects: [effectData] });
    await DAE.setFlag(targetD.actor, `${MACRO}.SecondDebuff`, secondDebuff);

    log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Apply a stub effect with just the name of the effect for curse that are not automated
 ***************************************************************************************/
async function applyCurseStub(curseName) {
    const FUNCNAME = "applyCurseStub(curseName)";
    let player = canvas.tokens.get(args[0]?.tokenId);
    let targetD = canvas.tokens.get(args[0]?.targets[0]?.id);
    log("-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- ---",
        `Starting`, `${MACRONAME} ${FUNCNAME}`, 
        "curseName", curseName, 
        "player", player, 
        "targetD", targetD);
    // --------------------------------------------------------------------------------
    // Set the convenientDescription value based on curseName
    //
    let ceDesc = ""
    switch (curseName) {
        case "Aversion":
            ceDesc = `Disadvantage on attack rolls against ${aToken.name}`; break;
        case "Lethergy":
            ceDesc = `DC${SAVE_DC} WIS Save or No Actions each turn`; break;
        case "Vulnerability":
            ceDesc = `${aToken.name}'s attacks deal an extra 1d8 necrotic damage`; break;
        default:
            ceDesc = `Some other effect agreed on by player and GM`; break;
    }
    // --------------------------------------------------------------------------------
    // Add cursed condition to target
    //
    const secondDebuff = `Curse of ${curseName}`
    let gameRound = game.combat ? game.combat.round : 0;
    let effectData = {
        label: secondDebuff,
        icon: ICON,
        origin: player.actor.uuid,
        disabled: false,
        duration: { rounds: 999999, startRound: gameRound },
        flags: { convenientDescription: ceDesc }, 
    };
    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:targetD.actor.uuid, effects: [effectData] });
    await DAE.setFlag(targetD.actor, `${MACRO}.SecondDebuff`, secondDebuff);

    log(`Finishing`, FUNCNAME);
    log("-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- ---");
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
    let chatmsg = game.messages.get(LAST_ARG.itemCardId);
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

/****************************************************************************************
 * BonusDamage: When a target gets the curse of vulnerability, create this effect. 
 ***************************************************************************************/
async function bonusDamage(target, itemD, uuid, tokenD, actorD, rounds, seconds, gameRound) {
    const FUNCNAME = "bonusDamage(target, itemD, uuid, tokenD, actorD, rounds, seconds, gameRound)";
    log("+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +");
    log(`Starting ${MACRONAME} ${FUNCNAME}`, 
        "target", target, 
        "itemD", itemD, 
        "uuid", uuid, 
        "tokenD", tokenD, 
        "actorD", actorD, 
        "rounds", rounds, 
        "seconds", seconds,
        "gameRound", gameRound);

    // --------------------------------------------------------------------------------
    // Define and add the curse effect to caster
    //        
    let effectData = {
        label: itemD.name,
        icon: ICON,
        origin: uuid,
        disabled: false,
        duration: { rounds: rounds, seconds: seconds, startRound: gameRound, startTime: game.time.worldTime },
        flags: { dae: { itemData: itemD } },
        changes: [
            { key: "flags.midi-qol.hexMark", mode: OVERRIDE, value: target.id, priority: 20 },
            { key: "flags.dnd5e.DamageBonusMacro", mode: CUSTOM, value: `ItemMacro.${itemD.name}`, priority: 20 },
            { key: "flags.midi-qol.concentration-data.targets", mode: ADD, value: { "actorId": actorD.id, "tokenId": tokenD.id }, priority: 20 }
        ]
    };
    // await actorD.createEmbeddedEntity("ActiveEffect", effectData); // Depricated 
    await actorD.createEmbeddedDocuments("ActiveEffect", [effectData]);
    log("+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
}

/****************************************************************************************
 * Apply the Bonus Damage for Curse of Vulnerability
 ***************************************************************************************/
function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    const DAMAGETYPE = "necrotic";

    log("+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +",
        `Starting`, `${MACRONAME} ${FUNCNAME}`,
        "DAMAGETYPE", DAMAGETYPE);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    // --------------------------------------------------------------------------------
    // Obtain and optionally log a bunch of information for application of damage
    //  
    const target = canvas.tokens.get(args[0].targets[0].id);
    const actorD = game.actors.get(args[0].actor._id);
    const tokenD = canvas.tokens.get(args[0].tokenId);
    const itemD  = args[0].item; // Needed to determine if invoking effect is am attack
    let curseItemD = DAE.getFlag(target.actor, `${MACRO}.curseItemD`); 

    log(`Obtained values for function`,
        "target", target, "target.name", target.name,
        // "actorD", actorD, "actorD.name", actorD.name, 
        "tokenD", tokenD, "tokenD.name", tokenD.name,
        "itemD", itemD, "itemD.name", itemD.name,
        "curseItemD", curseItemD);

    // --------------------------------------------------------------------------------
    // Make sure the actor has midi-qol.hexmark which is being hijacked for this macro
    //   
    if (target.id !== getProperty(tokenD.actor.data.flags, "midi-qol.hexMark")) {
        log("Should not get here?", 'target.id', target.id,
            "tokenD.actor.data.flags", tokenD.actor.data.flags,
            'getProperty(tokenD.actor.data.flags, "midi-qol.hexMark")', 
            getProperty(tokenD.actor.data.flags, "midi-qol.hexMark"));
        return {};
    }

    // --------------------------------------------------------------------------------
    // Replace the image for the curse with ICON
    //      
    curseItemD.img = ICON;

    // --------------------------------------------------------------------------------
    // Was the action that invoked this an attack (mwak, msak, rwak, rsak)?  If it 
    // wasn't just return without extra damage.
    //  
    let action = itemD.data.actionType;
    if ((action === "mwak") || (action === "msak") ||
        (action === "rwak") || (action === "rsak")) {
            log("Action type is an attack!  Damage to be done.", action);
    } else {
        log("+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +",
            "Action type is not an attack. :(  No damage.", action,
            `Early Exit`, `${MACRONAME} ${FUNCNAME}`);
        return {};
    }

    // mwak, msak, rwak, rsak -- Following is voodoo code that was used previously
    /* if (!["ak"].some(actionType => (itemD.data.actionType || "").includes(actionType))) {
        log("Didn't find an ak");
        return {};
    } */

    // --------------------------------------------------------------------------------
    // Time to actually do some damage!
    //  
    //return { damageRoll: `1d8[${damageType}]`, flavor: `(Hex (${CONFIG.DND5E.damageTypes[damageType]}))`, 
    //         damageList: args[0].damageList, itemCardId: args[0].itemCardId };
    let damageRoll = new Roll(`1d8`).evaluate({ async: false });
    log(" damageRoll", damageRoll, " Damage Total", damageRoll.total);
    game.dice3d?.showForRoll(damageRoll);

    new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, DAMAGETYPE, 
        [target], damageRoll, {
        flavor: `<b>${target.name}</b> suffers further from <b>${actorD.name}</b>'s 
                    Curse of <b>Vulnerability</b>`,
        itemData: curseItemD,
        itemCardId: "new"
    });

    log("+ + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
}

/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        msg = `Targeted nothing, must target single token to be acted upon`;
        // ui.notifications.warn(msg);
        log(msg);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        msg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        // ui.notifications.warn(msg);
        log(msg);
        return (false);
    }
    log(` targeting one target`);
    return (true);
}

/****************************************************************************************
 * Return the number of tokens that failed their saving throw
 ***************************************************************************************/
function failedCount() {
    let failCount = args[0].failedSaves.length
    log(`${failCount} args[0].failedSaves: `, args[0].failedSaves)
    return (failCount);
}

/****************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************/
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