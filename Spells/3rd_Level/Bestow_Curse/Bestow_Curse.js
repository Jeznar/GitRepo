const MACRONAME = "Bestow_Curse.1.6.js";
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
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
 * 12/17/21 0.6 Jon Replaced if statements with ternary statements and created the if (TL > 1) jez.trace(`${TAG} ) function.
 * 12/17/21 0.7 Jon Adding Vulnerability logic.
 * 12/18/21 0.8 JGB Replaced all the if(DEBUG) console.log calls with log function 
 * 12/18/21 0.9 JGB Work on a damageonlyworkflow for curse of vulnerability
 * 12/19/21 1.0 JGB Cleanups
 * 12/21/21 1.1 JGB Reshuffling looking for aItem not defined error
 * 12/21/21 1.2 JGB Combine nearly redundent selection functions
 * 05/02/22 1.3 JGB Update for Foundry 9.x
 * 05/05/22 1.4 JGB change createEmbeddedEntity to createEmbeddedDocuments for 9.x
 * 07/29/22 1.5 JGB Added Convenient Description and fixed logic error in Vulnerabilty 
 * 12/17/22 1.6 JGB Update logging and general style
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
let tactor = aActor
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
// let tactor = (L_ARG.tokenId) ? canvas.tokens.get(LAST_ARG.tokenId).actor : game.actors.get(LAST_ARG.actorId);
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const CURSENAME = "BestowCurse";
const CONDITION = "Cursed";
const ICON = "Icons_JGB/Misc/curse.png";
const NOACTIONSICON = "Icons_JGB/Misc/Stop_Sign.png";
const SAVE_DC = args[0]?.item?.data?.save?.dc
const CurseofLethergy = "Curse of Lethergy";
const CurseofIneptitude = "Curse of Ineptitude"
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "each") doEach({ traceLvl: TL });					     // DAE everyround
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
// DamageBonus must return a function to the caller
if (args[0]?.tag === "DamageBonus") return (doBonusDamage({ traceLvl: TL }));
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
return;
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
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Make sure target failed its saving throw
    //
    if (args[0].failedSaves.length !== 1) {
        msg = `${tToken.name} made save, spell has no effect`;
        postResults(msg);
        return;
    }
    //-------------------------------------------------------------------------------------------------------------------------------
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
    //-------------------------------------------------------------------------------------------------------------------------------
    // Set a flag with the saveDC for later use
    //
    if (TL > 1) jez.trace(`${TAG} aItem`, aItem);
    const saveDC = aItem.data.save.dc
    if (TL > 1) jez.trace(`${TAG} saveDC`, saveDC);

    await DAE.setFlag(tToken.actor, `${MACRO}.saveDC`, saveDC);
    await DAE.setFlag(tToken.actor, `${MACRO}.curseItemD`, aItem);
    if (TL > 1) jez.trace(`${TAG} Set DAE flags on ${tToken.actor.name}`,
        `${MACRO}.saveDC`, saveDC,
        `${MACRO}.curseItemD`, aItem);

    if (TL > 1) jez.trace(`${TAG} ---------------------------------------------------------------------------`,
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}
/****************************************************************************************
 * Execute code for a DAE Macro removal (off)
 ***************************************************************************************/
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
    let afflictedToken = canvas.tokens.get(args[1]);
    if (TL > 1) jez.trace(`${TAG} ---------------------------------------------------------------------------`,
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "afflictedToken", afflictedToken,
        "tactor", tactor);
    for (let i = 0; i < args.length; i++) if (TL > 1) jez.trace(`${TAG}   args[${i}]`, args[i]);

    //-------------------------------------------------------------------------------------------------------------------------------
    // Check for existance of flags, log the values, and delete them.
    //
    let secondDebuff = DAE.getFlag(tactor, `${MACRO}.SecondDebuff`);
    let saveDC = DAE.getFlag(tactor, `${MACRO}.SecondDebuff`);
    let curseItemD = DAE.getFlag(tactor, `${MACRO}.SecondDebuff`);
    if (TL > 1) jez.trace(`${TAG} #### Flags Set and Values ####`,
        "secondDebuff", secondDebuff,
        "saveDC", saveDC,
        "curseItemD", curseItemD);
    await DAE.unsetFlag(tactor, `${MACRO}.SecondDebuff`);
    await DAE.unsetFlag(tactor, `${MACRO}.saveDC`);
    await DAE.unsetFlag(tactor, `${MACRO}.curseItemD`);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Check for debuff matching the flag.  If it exists, remove it.
    //
    let secondDebuffEffect = tactor.effects
        .find(ef => ef.data.label === secondDebuff) ?? null; // Added a null case.
    if (secondDebuffEffect) {
        let message = `${tactor.name} has ${secondDebuff} effect: `;
        if (TL > 1) jez.trace(`${TAG} ${message}`, secondDebuffEffect);
        await secondDebuffEffect.delete();
    } else {
        let message = `${tactor.name} lacks ${secondDebuff} effect.`;
        if (TL > 1) jez.trace(`${TAG} ${message}`);
    }

    if (TL > 1) jez.trace(`${TAG} ---------------------------------------------------------------------------`,
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doEach(options = {}) {
    const FUNCNAME = "doEach(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    let secondDebuff = DAE.getFlag(tactor, `${MACRO}.SecondDebuff`);
    if (TL > 1) jez.trace(`${TAG} ### secondDebuff: `, secondDebuff);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (secondDebuff === CurseofLethergy) {
        let abilitySave = "wis";     // Set appropriate stat for save
        let saveDC = DAE.getFlag(tactor, `${MACRO}.saveDC`);
        if (TL > 1) jez.trace(`${TAG} ### saveDC = ${saveDC}`);
        //---------------------------------------------------------------------------------------------------------------------------
        let save = await tactor.rollAbilitySave(abilitySave, {
            // Does not return item card. TODO: Look into Crymic Macros for Midi Save.
            chatMessage: true,
            fastForward: true,
            flavor: `Wisdom save vs <b>DC${saveDC}</b>.<br>
            On failure, ${tactor.name} takes no actions this round.`
        });
        if (TL > 1) jez.trace(`${TAG} Result of save`, save);
        //---------------------------------------------------------------------------------------------------------------------------
        save.flavor = "new message"
        if (save.total >= saveDC) { // TODO Update flavor text, based on result of save
            msg = `${tactor.name} made its save.  Rolling ${save.total} vs ${saveDC} DC.`;
        }
        else {
            msg = `${tactor.name} failed its save.  Rolling ${save.total} vs ${saveDC} DC.`;
            //-----------------------------------------------------------------------------------------------------------------------
            // Slap a 1 turn duration "No Actions" condition on the token -- 
            // TODO: Does not stick, flashes and vanishes
            //
            let GAME_RND = game.combat ? game.combat.round : 0;
            let effectData = {
                label: "No_Actions",
                icon: NOACTIONSICON,
                origin: tactor.uuid,
                disabled: false,
                duration: { rounds: 2, turns: 2, startRound: GAME_RND, seconds: 12, startTime: game.time.worldTime },
                flags: {
                    dae: { macroRepeat: "none", specialDuration: ["turnStart"] },
                    convenientDescription: `No Actions or Bonus Actions (Reactions allowed)`
                },
            };
            //-----------------------------------------------------------------------------------------------------------------------
            // Apply the debuff
            //
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tactor.uuid, effects: [effectData] });
            if (TL > 1) jez.trace(`${TAG} applied "No Actions" Debuff: `, effectData);
            msg = `Curses! No actions this turn!`
            bubbleForAll(aToken.id, msg, true, true)
            await jez.wait(10);
        }

        if (TL > 1) jez.trace(`${TAG} ${msg}; save roll`, save);
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (secondDebuff === 'Curse of Aversion') {
        msg = `Curses! I have disadvantage on attack against my tormentor. (not automated)`
        bubbleForAll(aToken.id, msg, true, true)
        await jez.wait(10);
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (secondDebuff === 'Curse of Vulnerability') {
        msg = `Curses! That witch knows just how to hurt me.`
        bubbleForAll(aToken.id, msg, true, true)
        await jez.wait(10);
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (secondDebuff.includes("Curse of Ineptitude")) {
        const STAT = secondDebuff.split("(")[1].slice(0, -1)
        msg = `Curses! I feel inept when I try to use my ${STAT}!`
        bubbleForAll(aToken.id, msg, true, true)
        await jez.wait(10);
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Create and process selection dialog, passing it onto specified callback function
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function pickFromList(queryTitle, queryText, pickCallBack, ...queryOptions) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, `queryTitle  `, queryTitle, `queryText   `, queryText,
        `pickCallBack`, pickCallBack, `queryOptions`, queryOptions);
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
        let msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, ...queryOptions),
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
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Receive selected Curse and continue main steps
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function pickCurseCallBack(selection) {
    const FUNCNAME = "pickCurseCallBack(selection)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, `selection`, selection);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    // let aItem = args[0]?.item;
    let curseName = selection?.split(" ")[0]     // Grab first word of the selection
    let curseDiscription = "";
    let level = args[0].spellLevel;
    const rounds = level === 3 ? 10 : level === 4 ? 100 : level === 5 ? 800 : level === 6 ? 800 : 9999999;
    const seconds = rounds * 6;
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
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
                <b>Wisdom save</b> against <b>DC${aItem.data.save.dc}</b> at the start of each 
                of its turns. If it fails, it wastes its action that turn, doing nothing.`
            postResults(curseDiscription);
            applyCurseStub(curseName);
            break;
        case "Vulnerability":
            curseDiscription = `<b>Curse of ${curseName}</b>: Caster's attacks deal an extra 
                1d8 necrotic damage to the target.`
            postResults(curseDiscription);
            applyCurseStub(curseName);
            bonusDamage(canvas.tokens.get(args[0].targets[0].id), aItem, args[0].uuid,
                canvas.tokens.get(args[0].tokenId), game.actors.get(args[0].actor._id),
                rounds, seconds, GAME_RND)
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
    if (TL > 1) jez.trace(`${TAG} ${curseName} description: ${curseDiscription}`);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Receive selected stat and continue main steps.  This is only used by Curse of Lethergy
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function pickStatCallBack(selection) {
    const FUNCNAME = "pickCurseCallBack(selection)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, `selection`, selection);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    let player = canvas.tokens.get(args[0]?.tokenId);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id);
    let stat = "";
    //-------------------------------------------------------------------------------------------------------------------------------
    // Add cursed condition to target
    //
    switch (selection) {
        case "Strength": stat = "str"; break;
        case "Dexterity": stat = "dex"; break;
        case "Constitution": stat = "con"; break;
        case "Intelligence": stat = "int"; break;
        case "Wisdom": stat = "wis"; break;
        case "Charisma": stat = "cha"; break;
        default: stat = "XYZ"; break;
    }
    if (TL > 1) jez.trace(`${TAG} Short Stat Name`, stat);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    const secondDebuff = `${CurseofIneptitude} (${selection})`
    let effectData = {
        label: secondDebuff,
        icon: ICON,
        origin: player.actor.uuid,
        disabled: false,
        duration: { rounds: 99, startRound: GAME_RND },
        flags: { convenientDescription: `${selection} ability checks and saves at disadvantage` },
        changes: [
            { key: `flags.midi-qol.disadvantage.ability.check.${stat}`, mode: jez.ADD, value: 1, priority: 20 },
            { key: `flags.midi-qol.disadvantage.ability.save.${stat}`, mode: jez.ADD, value: 1, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
    await DAE.setFlag(tToken.actor, `${MACRO}.SecondDebuff`, secondDebuff);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Apply a stub effect with just the name of the effect for curse that are not automated
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function applyCurseStub(curseName) {
    const FUNCNAME = "applyCurseStub(curseName)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, `curseName`, curseName);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    let player = canvas.tokens.get(args[0]?.tokenId);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Set the convenientDescription value based on curseName
    //
    let ceDesc = ""
    switch (curseName) {
        case "Aversion": ceDesc = `Disadvantage on attack rolls against ${aToken.name} (not automated)`; break;
        case "Lethergy": ceDesc = `DC${SAVE_DC} WIS Save or No Actions each turn`; break;
        case "Vulnerability": ceDesc = `${aToken.name}'s attacks deal an extra 1d8 necrotic damage`; break;
        default: ceDesc = `Some other effect agreed on by player and GM`; break;
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Add cursed condition to target
    //
    const secondDebuff = `Curse of ${curseName}`
    let effectData = {
        label: secondDebuff,
        icon: ICON,
        origin: player.actor.uuid,
        disabled: false,
        duration: { rounds: 999999, startRound: GAME_RND },
        flags: { convenientDescription: ceDesc },
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
    await DAE.setFlag(tToken.actor, `${MACRO}.SecondDebuff`, secondDebuff);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post the results to chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function postResults(resultsString) {
    const FUNCNAME = "postResults(resultsString)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, `resultsString`, resultsString);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    // let chatmsg = await game.messages.get(itemCard.id)
    let chatmsg = game.messages.get(L_ARG.itemCardId);
    let content = await duplicate(chatmsg.data.content);
    if (TL > 1) jez.trace(`${TAG} chatmsg: `, chatmsg);
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * BonusDamage: When a target gets the curse of vulnerability, create this effect. 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function bonusDamage(target, aItem, uuid, tokenD, actorD, rounds, seconds, GAME_RND) {
    const FUNCNAME = "bonusDamage(target, aItem, uuid, tokenD, actorD, rounds, seconds, GAME_RND)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "target  ", target, "aItem   ", aItem, "uuid    ", uuid,
        "tokenD  ", tokenD, "actorD  ", actorD, "rounds  ", rounds, "seconds ", seconds, "GAME_RND", GAME_RND);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define and add the curse effect to caster
    //        
    let effectData = {
        label: aItem.name,
        icon: ICON,
        origin: uuid,
        disabled: false,
        duration: { rounds: rounds, seconds: seconds, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: { dae: { itemData: aItem } },
        changes: [
            { key: "flags.midi-qol.hexMark", mode: jez.OVERRIDE, value: target.id, priority: 20 },
            { key: "flags.dnd5e.DamageBonusMacro", mode: jez.CUSTOM, value: `ItemMacro.${aItem.name}`, priority: 20 },
            { key: "flags.midi-qol.concentration-data.targets", mode: jez.ADD, value: { "actorId": actorD.id, "tokenId": tokenD.id }, priority: 20 }
        ]
    };
    // await actorD.createEmbeddedEntity("ActiveEffect", effectData); // Depricated 
    await actorD.createEmbeddedDocuments("ActiveEffect", [effectData]);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Apply the Bonus Damage for Curse of Vulnerability
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function doBonusDamage(options = {}) {
    const FUNCNAME = "doBonusDamage(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Obtain and optionally log a bunch of information for application of damage
    //  
    const target = canvas.tokens.get(args[0].targets[0].id);
    const actorD = game.actors.get(args[0].actor._id);
    const tokenD = canvas.tokens.get(args[0].tokenId);
    const aItem = args[0].item; // Needed to determine if invoking effect is am attack
    let curseItemD = DAE.getFlag(target.actor, `${MACRO}.curseItemD`);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.trace(`${TAG} Obtained values for function`,
        "target", target, "target.name", target.name,
        // "actorD", actorD, "actorD.name", actorD.name, 
        "tokenD", tokenD, "tokenD.name", tokenD.name,
        "aItem", aItem, "aItem.name", aItem.name,
        "curseItemD", curseItemD);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Make sure the actor has midi-qol.hexmark which is being hijacked for this macro
    //   
    if (target.id !== getProperty(tokenD.actor.data.flags, "midi-qol.hexMark")) {
        if (TL > 1) jez.trace(`${TAG} Should not get here?`, 'target.id', target.id,
            "tokenD.actor.data.flags", tokenD.actor.data.flags,
            'getProperty(tokenD.actor.data.flags, "midi-qol.hexMark")',
            getProperty(tokenD.actor.data.flags, "midi-qol.hexMark"));
        return {};
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Replace the image for the curse with ICON
    //      
    curseItemD.img = ICON;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Was the action that invoked this an attack (mwak, msak, rwak, rsak)?  If it 
    // wasn't just return without extra damage.
    //  
    let action = aItem.data.actionType;
    if ((action === "mwak") || (action === "msak") ||
        (action === "rwak") || (action === "rsak")) {
        if (TL > 1) jez.trace(`${TAG} Action type is an attack!  Damage to be done.`, action);
    } else {
        if (TL > 1) jez.trace(`${TAG} + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +`,
            "Action type is not an attack. :(  No damage.", action,
            `Early Exit`, `${MACRONAME} ${FUNCNAME}`);
        return {};
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Time to actually do some damage!
    //  
    let damageRoll = new Roll(`1d8`).evaluate({ async: false });
    if (TL > 1) jez.trace(`${TAG}  damageRoll`, damageRoll, " Damage Total", damageRoll.total);
    game.dice3d?.showForRoll(damageRoll);

    new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, 'necrotic',
        [target], damageRoll, {
        flavor: `<b>${target.name}</b> suffers further from <b>${actorD.name}</b>'s Curse of <b>Vulnerability</b>`,
        itemData: curseItemD,
        itemCardId: "new"
    });
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}