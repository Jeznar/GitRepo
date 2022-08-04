const MACRONAME = "Threat_Display_0.3.js"
/***************************************************************************************************
 * Apply the "Frighted" condition if target fails save.... 
 * 
 * It would be nice for the macro to post results in addition.
 * 
 * 10/29/21 0.1 JGB created from Grapple_Initiate_0.8
 * 05/03/22 0.2 JGB Updated for FoundryVTT 9.x
 * 07/28/22 0.3 JGB Update to provide CE descriptions and VFX
 * 08/02/22 0.4 Add convenientDescription and Table of things to say when frightened
 **************************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
// const CUSTOM = 0, MULTIPLY = 1, jez.ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
const TL = 5
const GAME_RND = game.combat ? game.combat.round : 0;
//----------------------------------------------------------------------------------
// Setup variables/constants specific to this macro
//
const CONDITION = "Frightened";
const SAVE_TYPE = "wis";
const COND_ICON = "Icons_JGB/Conditions/Scared.png"
const IMMUNE    = `Frightened, Immune ${aToken.name}`
const IMMU_ICON = "Icons_JGB/Conditions/Scared_Immune.png"
const SAVE_DC   = aActor.data.data.attributes.spelldc;
const FRIGHTENED_JRNL = "@JournalEntry[tjg0x0jXlwvbdI9h]{Frightened}"
const PHRASE_TABLE = "Frightened_by_Dog"
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE everyround
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    jez.log(` tToken ${tToken?.name} `, tToken);
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    //-------------------------------------------------------------------------------
    // Verify that a single token to be acted upon is targeted
    if (game.user.targets.ids.length != 1) {
        msg = `You must target a single token to be acted upon. Targeted 
            ${game.user.targets.ids.length} tokens`
        jez.log(msg);
        jez.addMessage(chatMsg, {color:"dodgerblue", fSize:15, msg:msg, tag: "saves" })
        return
    }
    jez.log(` Player: ${aToken.name}, tToken: ${tToken.name}`);
    //----------------------------------------------------------------------------------
    // Is the target in range?
    //
    const ALLOWED_UNITS = ["", "ft", "any"];
    let maxRange = jez.getRange(aItem, ALLOWED_UNITS)
    if (!maxRange) {
        msg = `Range is 0 or incorrect units on ${aItem.name} data card`;
        jez.log(msg);
        jez.addMessage(chatMsg, {color:"dodgerblue", fSize:15, msg:msg, tag: "saves" })
        return(false)
    }
    // maxRange obtained earlier with a jez.getRange(...) call
    if (!jez.inRange(aToken, tToken, maxRange)) {
        msg = `${tToken.name} is not in range for ${aItem.name}`;
        jez.log(msg);
        jez.addMessage(chatMsg, {color:"dodgerblue", fSize:15, msg:msg, tag: "saves" })
        return (false);
    }
    //----------------------------------------------------------------------------------
    // End if target is immune to this frighten
    //
    if (tActor.effects.find(ef => ef.data.label === IMMUNE)) {
        msg = `${tToken.name} is immune to ${aToken.name}'s ${aItem.name}.`;
        jez.log(msg);
        msg = `${tToken.name} has recently resisted ${aToken.name}'s ${aItem.name} 
            and is currently immune`
        jez.addMessage(chatMsg, {color:"dodgerblue", fSize:15, msg:msg, tag: "saves" })
        return;
    }
    //----------------------------------------------------------------------------------
    // End if target is already Frightened
    //
    if (tActor.effects.find(ef => ef.data.label === CONDITION)) {
        msg = `${tToken.name} is already ${FRIGHTENED_JRNL}`
        jez.log(msg);
        jez.addMessage(chatMsg, {color:"dodgerblue", fSize:15, msg:msg, tag: "saves" })
        return;
    }
    //----------------------------------------------------------------------------------
    // Obtain the size of the aActor and tActor to determine advantage/disadvantage
    // 
    jez.log("await jez.getSize(aToken)", await jez.getSize(aToken))

    let aTokenSizeValue = (await jez.getSize(aToken)).value
    let tTokenSizeValue = (await jez.getSize(tToken)).value
    jez.log(`${aToken.name} size = ${aTokenSizeValue}, ${tToken.name} size = ${tTokenSizeValue}`)
    if (aTokenSizeValue + 3 <= tTokenSizeValue) {
        msg = `${tToken.name} is too large to be frightend by ${aToken.name}`
        jez.log(msg);
        await jez.addMessage(chatMsg, {color:"dodgerblue", fSize:15, msg:msg, tag: "saves" })
        return;
    }
    //----------------------------------------------------------------------------------
    // Build data structure to do the save
    //
    let saved = true;
    let flavor = `${tToken.name} attempted ${SAVE_TYPE} DC${SAVE_DC} save to avoid 
    ${CONDITION} condition.`
    let saveInput = {
        request: "save",
        targetUuid: tActor.uuid,
        ability: SAVE_TYPE,
        options: { flavor: flavor, chatMessage: true, fastForward: true }
    }
    //----------------------------------------------------------------------------------
    // If the actor is larger than the target it has advantage.  If it is 2 size 
    // categories smaller it has disadvantage.  If it is 3 or more smaller it autofails.
    if (aTokenSizeValue > tTokenSizeValue) saveInput.options =
        { flavor: flavor, chatMessage: true, fastForward: true, disadvantage: true };
    else if (aTokenSizeValue === tTokenSizeValue-2) saveInput.options = 
        { flavor: flavor, chatMessage: true, fastForward: true, advantage: true }

    let saveObject = await MidiQOL.socket().executeAsGM("rollAbility", saveInput);
    if (saveObject.total < SAVE_DC) saved = false;
    //----------------------------------------------------------------------------------
    // Apply Frightened Condition if save failed or immune if tToken saved
    //
    let specDur = ["newDay", "longRest", "shortRest"]
    if (!saved) {   // Actor failed and is frightened
        runVFX(tToken)
        specDur.push("turnEnd")
        jez.log(`Player Wins - Apply ${CONDITION}`);
        let effectData = {
            label: CONDITION,
            icon: COND_ICON,
            origin: LAST_ARG.uuid,
            disabled: false,
            duration: { rounds: 99, startRound: GAME_RND },
            flags: {
                dae: {
                    itemData: aItem,
                    macroRepeat: "startEveryTurn",
                    specialDuration: specDur
                },
                isConvenient: true,
                isCustomConvenient: true,
                convenientDescription: `Frightened of ${aToken.name}, may not move closer`
            },
            changes: [
                { key: `flags.midi-qol.disadvantage.ability.check.all`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.disadvantage.attack.all`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.disadvantage.skill.check.all`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `macro.itemMacro`, mode: jez.CUSTOM, value: `'${aToken.name}' ${PHRASE_TABLE}`, priority: 20 }
            ]
        };
        await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:tToken.actor.uuid, effects: [effectData] });
        msg = `${tToken.name} now has ${FRIGHTENED_JRNL} from ${aToken.name}'s ${aItem.name} ability.`;
    } else {    // Actor succeeded and is now immune
        jez.log(`tToken Wins - Apply ${IMMUNE}`);
        let specDur = ["newDay", "longRest", "shortRest"]
        let effectData = {
            label: IMMUNE,
            icon: IMMU_ICON,
            origin: LAST_ARG.uuid,
            disabled: false,
            duration: { rounds: 99, startRound: GAME_RND },
            flags: { 
                dae: { 
                    itemData: aItem, 
                    specialDuration: specDur 
                },
                isConvenient: true,
                isCustomConvenient: true,
                convenientDescription: `Immmune to fear effect from ${aToken.name}`
            },
            changes: [
                { key: `flags.gm-notes.notes`, mode: jez.CUSTOM, value:`Immune to ${aToken.name}} ${CONDITION}`, priority: 20 },
            ]
        };
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
        msg = `${tToken.name} now is immune to ${aToken.name}'s ${aItem.name} for the duration of the combat.`;
    }
    jez.log("final message", msg)
    await jez.addMessage(chatMsg, {color:"dodgerblue", fSize:15, msg:msg, tag: "saves" })
    return
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doEach() {
    const FUNCNAME = "doEach()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) {
        jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`);
        for (let i = 0; i < args.length; i++) jez.trace(`${TAG} args[${i}]`, args[i]);
    }
    await jez.wait(100)
    //----------------------------------------------------------------------------------
    // Set Variables
    //
    let fearSource = args[1]
    let tableName = args[2]
    //----------------------------------------------------------------------------------
    // Nab something witty (I hope) from the tableName table
    //
    let table = game.tables.getName(tableName);
    if (table) {
        if (TL > 1) jez.trace(`${TAG} Frightened table`,table)
        let roll = await table.roll();
        msg = roll.results[0].data.text;
    } else {
        jez.badNews(`No mockery (${tableName}) table found, using default.`,"i")
        msg = `I not getting closer to ${fearSource}`;
    }
    msg = msg.replace("%SOURCE%", fearSource);
    //----------------------------------------------------------------------------------
    // Bubble that statement onto the screen
    //
    bubbleForAll(aToken.id, msg, true, true)
    //----------------------------------------------------------------------------------
    // Comments, perhaps
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/***************************************************************************************************
 * Run Frightened VFX on Target
 ***************************************************************************************************/
 async function runVFX(target) {
    const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/UI/IconHorror_*_200x200.webm"
    new Sequence()
        .effect()
        .fadeIn(1000)
        .fadeOut(1000)
        .file(VFX_LOOP)
        .atLocation(target)
        .scaleToObject(1.0)
        .play();
}