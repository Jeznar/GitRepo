const MACRONAME = "Earth_Tremor_0.1"
/*****************************************************************************************
 * Slap a text message on the item card indicating Who and What should be moved by the 
 * spell.
 * 
 * Spell Description: You cause a tremor in the ground within range. Each creature other 
 *   than you in that area must make a Dexterity saving throw. On a failed save, a  
 *   creature takes 1d6 bludgeoning damage and is knocked prone. If the ground in that 
 *   area is loose earth or stone, it becomes difficult terrain until cleared, with 
 *   each 5-foot-diameter portion requiring at least 1 minute to clear by hand.
 * 
 *   At Higher Levels. When you cast this spell using a spell slot of 2nd level or 
 *   higher, the damage increases by 1d6 for each slot level above 1st.
 * 
 * 12/11/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
const CONDITION = `Prone`;
const ICON = `modules/combat-utility-belt/icons/prone.svg`;
let msg = "";
let xtraMsg=`<br><br>
    If the ground in that area is loose earth or stone, it becomes difficult terrain 
    until cleared. <i><b>FoundryVTT:</b> Effect represented by a tile, that can be 
    manually removed.</i>`
if(DEBUG) {
    console.log(`************ Executing ${MACRONAME} ****************`)
    console.log(`args[0]: `,args[0]);
}

// ---------------------------------------------------------------------------------------
// If no target failed, post result and terminate 
//
let failCount = args[0].failedSaves.length 
if (DEBUG) console.log(`${failCount} args[0].failedSaves: `,args[0].failedSaves)
if (failCount === 0) {
    msg = `No creatures failed their saving throw.` + xtraMsg;
    await postResults(msg);
    if (DEBUG) {
        console.log(` ${msg}`, args[0].saves); 
        console.log(`************ Ending ${MACRONAME} ****************`)
    }
    return;
}

// ---------------------------------------------------------------------------------------
// Build an array of the ID's of the chumps that failed.
//
let failures = [];
for (let i = 0; i < failCount; i++) {
    const FAILED = args[0].failedSaves[i];
    console.log(` ${i} --> ${FAILED.data.actorId}`, FAILED);
    if (DEBUG) console.log(` ${i} Adding chump: `,FAILED)
    failures.push(FAILED);
    // await game.cub.addCondition(CONDITION, FAILED, {allowDuplicates:true, replaceExisting:true, warn:true});
}

// ---------------------------------------------------------------------------------------
// Apply the CONDITION to the chumps that failed their save, if not already affected
//
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let gameRound = game.combat ? game.combat.round : 0;
for (let i = 0; i < failCount; i++) {
    if (DEBUG) console.log(` ${i} Processing: `, failures[i])

    // Determine if target already has the affect
    //if (target.effects.find(ef => ef.data.label === effect)) {
    //if (failures[i].data.actorData.effects.find(ef => ef.data.label === CONDITION)) {
    if (failures[i].data.actorData.effects.find(ef => ef.label === CONDITION)) {
        if (DEBUG) console.log(` ${failures[i].name} is already ${CONDITION}. `, failures[i])
    } else {
        if (DEBUG) console.log(` ${failures[i].name} is not yet ${CONDITION}. `, failures[i])
        let effectData = {
            label: CONDITION,
            icon: ICON,
            // origin: player.uuid,
            disabled: false,
            duration: { rounds: 99, startRound: gameRound },
            changes: [
                { key: `flags.midi-qol.disadvantage.attack.all`, mode: ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.mwak`, mode: ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.msak`, mode: ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rwak`, mode: ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rsak`, mode: ADD, value: 1, priority: 20 },
                { key: `data.attributes.movement.walk`, mode: MULTIPLY, value: 0.5, priority: 20 }
            ]
        };
        await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:failures[i].uuid, effects: [effectData] });
    }
}

// ---------------------------------------------------------------------------------------
// Post that the target failed and the consequences.
//
msg = `Creatures that failed their saving have been knocked @JournalEntry[FBPUaHRxNyNXAOeh]{prone}.` + xtraMsg;
await postResults(msg);
if (DEBUG) {
    console.log(` ${msg}`);
    console.log(`************ Terminating ${MACRONAME} ****************`)
}
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    /***************************************** 
     * Some Special div's per Posney's docs
     *  - midi-qol-attack-roll
     *  - midi-qol-damage-roll
     *  - midi-qol-hits-display
     *  - midi-qol-saves-display
     * 
     * One other that I have been using
     *  - midi-qol-other-roll
    ******************************************/

    const DIV = "midi-qol-damage-roll"; 

    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    if (DEBUG) console.log(`chatMessage: `,chatMessage);
    // const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    // const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}