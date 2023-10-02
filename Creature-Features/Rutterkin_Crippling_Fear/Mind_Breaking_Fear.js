const MACRONAME = "Rutterkin_Crippling_Fear.0.1.js"
const TL = 5;                               // Trace Level for this macro
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Implement Rutterkin's Crippling Fear.  This ability should be used at the start of each creature's 
 * turn when they are close enough to Rutterkins (3+) to be potentially affected.
 * 
 *   When a creature that isn’t a demon starts its turn within 30 feet of three or more rutterkins, 
 *   it must make a DC 11 WIS Save. The creature has disadvantage on the save if it’s within 30 feet 
 *   of six or more rutterkins. On a successful save, the creature is immune to the Crippling Fear of 
 *   all rutterkins for 24 hours. On a failed save, the creature becomes frightened of the rutterkins 
 *   for 1 minute. While frightened in this way, the creature is restrained.
 * 
 * 10/02/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.log(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor;
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const EFFECT_NAME = "Crippling Fear of Rutterkins"
const EFFECT_IMMUNE_NAME = "Crippling Fear Immune"
const EFFECT_IMAGE = 'systems/dnd5e/icons/spells/horror-red-3.jpg'
const EFFECT_IMMUNE_IMAGE = 'systems/dnd5e/icons/spells/horror-eerie-1.jpg'
let ceDesc = ""
const GAME_RND = game.combat ? game.combat.round : 0;
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });     // Midi ItemMacro On Use
if (TL > 1) jez.log(`=== Finished === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 2) jez.log("postResults Parameters", "msg", msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.log(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Do the things that need doing
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    const FAILED_SAVES = LAST_ARG.failedSaves
    const MADE_SAVES = LAST_ARG.saves
    let affectedTokens = []
    const INCAPACITATED_JRNL = `@JournalEntry[${game.journal.getName('Incapacitated').id}]{Incapacitated}`
    //-----------------------------------------------------------------------------------------------
    // Function variables
    //
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-----------------------------------------------------------------------------------------------
    // 1. If our target is a demon, it is immune
    //
    let race = jez.getRace(tToken)
    if (race.includes("demon")) {
        postResults(`${tToken.name} is immune (${race})`)
        return; 
    }
    //-----------------------------------------------------------------------------------------------
    // 2. Find Rutterkins that are within 30 feet of target
    //
    let returned = await jez.inRangeTargets(tToken, 30, { traceLvl: 0 });
    if (returned.length === 0) return jez.badNews(`No tokens in range`, "i")
    if (TL>1) for (let i = 0; i < returned.length; i++) jez.log(`${FNAME} | ${i} Tokens: ${returned[i].name}`)
    
return

    //-----------------------------------------------------------------------------------------------
    // 1. Weed out tokens that either have the deafened or immunity condition from those that failed
    //    saving throws. 
    //
    if (TL>2) jez.log(`${TAG} Saves failed by`, FAILED_SAVES)
    if (FAILED_SAVES?.length === 0) {                // All targets made saves
        if (TL > 2) jez.log(`${TAG} No targets failed saving throws`);
        console.log(aItem)
        postResults(`No targets failed saves against <b>${aToken.name}</b>'s ${aItem.name}.`)
        return;
    }
    for (let i = 0; i < FAILED_SAVES.length; i++) {
        if (jezcon.hasCE("Deafened", FAILED_SAVES[i].actor.uuid, { traceLvl: 0 })) {
            if (TL > 2) jez.log(`${TAG} ${FAILED_SAVES[i].name} is deaf, skipping.`)
            continue
        }
        if (jezcon.hasCE(EFFECT_IMMUNE_NAME, FAILED_SAVES[i].actor.uuid, { traceLvl: 0 })) {
            if (TL > 2) jez.log(`${TAG} ${FAILED_SAVES[i].name} is immune, skipping.`)
            continue
        }
        affectedTokens.push(FAILED_SAVES[i]._object)
    }
    if (TL>1) jez.log(`${TAG} Tokens affected`, affectedTokens)
    //-----------------------------------------------------------------------------------------------
    // 2. For those that saved, if they are not deaf and are not immune, hand out immunity effect 
    //
    if (TL>2) jez.log(`${TAG} made saves`, MADE_SAVES)
    if (MADE_SAVES?.length === 0) if (TL > 2) jez.log(`${TAG} No targets made saving throws`);
    for (let i = 0; i < MADE_SAVES.length; i++) {
        if (jezcon.hasCE("Deafened", MADE_SAVES[i].actor.uuid, { traceLvl: 0 })) {
            if (TL > 2) jez.log(`${TAG} ${MADE_SAVES[i].name} is deaf, skipping.`)
            continue
        }
        if (jezcon.hasCE(EFFECT_IMMUNE_NAME, MADE_SAVES[i].actor.uuid, { traceLvl: 0 })) {
            if (TL > 2) jez.log(`${TAG} ${MADE_SAVES[i].name} is immune, skipping.`)
            continue
        }
        await jez.wait(250 + 500 * Math.random());  // Delay a random bit
        applyImmune(MADE_SAVES[i]._object)
    }
    //-----------------------------------------------------------------------------------------------
    // 3. If no tokens affected, post message and quit
    //
    if (affectedTokens?.length === 0) { 
        msg = `No eligible targets failed save, no effect applied.`
        if (TL > 2) jez.log(`${TAG} ${msg}`)
        postResults(msg);
        return;
    }
    //-----------------------------------------------------------------------------------------------
    // 4. Loop through those that failed saves and apply the fear effect
    //
    let afflicted = ''
    if (TL > 2) jez.log(`${TAG} Affected tokens`, affectedTokens)
    for (let i = 0; i < affectedTokens.length; i++) {
        let token5e = affectedTokens[i]
        if (TL > 2) jez.log(`${TAG} Adding fear`, token5e)
        if (TL > 2) jez.log(`${TAG} ${token5e.name} is affected`)
        await jez.wait(250 + 500 * Math.random());  // Delay a random bit
        if (!jezcon.hasCE(EFFECT_NAME, token5e.actor.uuid)) applyFear(token5e)
        afflicted += '- ' + token5e.name
        if (i < affectedTokens.length - 1) afflicted += `,<br>`
    }
    postResults(`Speed halved and ${INCAPACITATED_JRNL}:<br>${afflicted}`)
    return
}
/***************************************************************************************************
 * Apply the Fear condition to a token, adding CEDesc
 ***************************************************************************************************/
async function applyFear(token) {
    const CE_DESC = `Affected by ${aToken.name}'s ${EFFECT_NAME}, speed is halved and incapacitated`
    let effectData = [{
        label: EFFECT_NAME,
        icon: EFFECT_IMAGE,
        origin: LAST_ARG.uuid,
        disabled: false,
        flags: {
            dae: { stackable: false, specialDuration: ["turnEnd"] },
            convenientDescription: CE_DESC,
            isConvenient: true,
            isCustomConvenient: true
        },
        duration: { rounds: 2, seconds: 12, startRound: GAME_RND, startTime: game.time.worldTime },
        changes: [
            { key: `data.attributes.movement.all`, mode: jez.CUSTOM, value: "*0.5", priority: 20 },
            { key: `macro.CE`, mode: jez.CUSTOM, value: `Incapacitated`, priority: 20 },
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token.actor.uuid, effects: effectData });
}
/***************************************************************************************************
 * Apply the Immunity condition to a token, adding CEDesc
 ***************************************************************************************************/
async function applyImmune(token) {
    const CE_DESC = `Immune to ${aToken.name}'s ${EFFECT_NAME} for some time.`
    let effectData = [{
        label: EFFECT_IMMUNE_NAME,
        icon: EFFECT_IMMUNE_IMAGE,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 14400, seconds: 86400, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: {
            dae: { stackable: false },
            convenientDescription: CE_DESC,
            isConvenient: true,
            isCustomConvenient: true
        },
    }];
    // let horrified = token.actor.effects.find(i => i.data.label === HORRIFIED_COND);
    // if (!horrified) applyEffect(token, effectData);
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token.actor.uuid, effects: effectData });
}