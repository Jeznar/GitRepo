const MACRONAME = "Trampling_Charge_0.2.js"
/*****************************************************************************************
 * Implement the knockdown portion of trampling charge
 * 
 * Action Description: If the horse moves at least 20 ft. straight toward a creature and 
 * then hits it with a hooves attack on the same turn, that target must succeed on a DC 14 
 * Strength saving throw or be knocked prone. If the target is prone, the horse can make 
 * another attack with its hooves against it as a bonus action.
 * 
 * 12/11/21 0.1 Creation of Macro
 * 05/04/22 0.2 Update for Foundry 9.x
 *****************************************************************************************/
const DEBUG = true;
let msg = "";
const CONDITION = "Prone";
let actorID = canvas.tokens.get(args[0].tokenId);

if (DEBUG) {
    console.log(`************ Executing ${MACRONAME} ****************`)
    console.log(`args[0]: `,args[0]);
}

// ---------------------------------------------------------------------------------------
// Make sure exactly one target.
//
if (args[0].targets.length !== 1) {
    msg = `Funny business going on, one and only one target is allowed.  
           Tried to hit ${args[0].targets.length} targets.`;
    await postResults(msg);
    if (DEBUG) {
        console.log(` ${msg}`, args[0].saves); 
        console.log(`************ Ending ${MACRONAME} ****************`)
    }
    return;
}

// ---------------------------------------------------------------------------------------
// If no target was hit, post result and terminate 
//
if (args[0].hitTargets.length === 0) {
    msg = `${args[0].hitTargets[0]} avoids the knockdown by making its save.`;
    await postResults(msg);
    if (DEBUG) {
        console.log(` ${msg}`, args[0].saves); 
        console.log(`************ Ending ${MACRONAME} ****************`)
    }
    return;
}
// let targetID = args[0].hitTargets[0];
let targetID = canvas.tokens.get(args[0].targets[0].id);

// ---------------------------------------------------------------------------------------
// Make sure the target is the same size or smaller as the charger 
//
if (DEBUG) console.log(`actorID, targetID:`, actorID, targetID)
let sizeDiff = sizeDelta(actorID, targetID);
if (DEBUG) console.log(`sizeDiff ${sizeDiff}`);
if (sizeDiff === -99) {
    msg = `Something went sideways comparing the size of actor and target`;
    await postResults(msg);
    ui.notifications.error(message);
    return;
}
if (sizeDiff < 0) {
    msg = `${targetID.name} is larger than ${actorID.name} and can not be knocked @JournalEntry[FBPUaHRxNyNXAOeh]{prone}. 
    If ${targetID.name} is already prone, ${actorID.name} may make an extra attack as a 
    bonus action.`;
    await postResults(msg);
    return;
}

// ---------------------------------------------------------------------------------------
// If the target saved post that and exit 
//
let failCount = args[0].failedSaves.length 
if (DEBUG) console.log(`${failCount} args[0].failedSaves: `,args[0].failedSaves)
if (failCount === 0) {
    msg = `${targetID.name} made its saving throw. It is unaffected by knockdown.`
    await postResults(msg);
    if (DEBUG) {
        console.log(` ${msg}`, args[0].saves); 
        console.log(`************ Ending ${MACRONAME} ****************`)
    }
    return;
}

// ---------------------------------------------------------------------------------------
// Check to make sure the target isn't already prone
//
if (DEBUG) console.log(`targetID.actor.effects: `,targetID.actor.effects);
let proneEffect = targetID.actor.effects.find(ef => ef.data.label === CONDITION);
if (DEBUG) console.log(`proneEffect: `, proneEffect);
if (proneEffect) {
    if (DEBUG) console.log(`${targetID.name} is already ${CONDITION}.`);
    postResults(msg);
    return;
} else {
    msg = `${targetID.name} is knocked @JournalEntry[FBPUaHRxNyNXAOeh]{Prone} by the charge.`
}

// ---------------------------------------------------------------------------------------
// Add prone condition to target
//
const CUSTOM=0, MULTIPLY=1, ADD=2, DOWNGRADE=3, UPGRADE=4, OVERRIDE=5;
let gameRound = game.combat ? game.combat.round : 0;

let effectData = {
    label: CONDITION,
    icon: "modules/combat-utility-belt/icons/prone.svg",
    // origin: player.uuid,
    disabled: false,
    duration: { rounds: 99, startRound: gameRound },
    changes: [
        { key: `flags.midi-qol.disadvantage.attack.all`, mode: ADD, value: 1, priority: 20 },
        { key: `flags.midi-qol.grants.advantage.attack.mwak`, mode: ADD, value: 1, priority: 20 },
        { key: `flags.midi-qol.grants.advantage.attack.msak`, mode: ADD, value: 1, priority: 20 },
        { key: `flags.midi-qol.grants.disadvantage.attack.rwak`, mode: ADD, value: 1, priority: 20 },
        { key: `flags.midi-qol.grants.disadvantage.attack.rsak`, mode: ADD, value: 1, priority: 20 }
    ]
};
await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:targetID.actor.uuid, effects: [effectData] });

// ---------------------------------------------------------------------------------------
// Create and post success message.
//
msg = `${targetID.name} has been knocked @JournalEntry[FBPUaHRxNyNXAOeh]{Prone}. The trampler may make
        an extra attack as a bonus action.`
postResults(msg);
console.log(`************ Terminating ${MACRONAME} ****************`)

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
    //const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    //const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}

/************************************************************************
 * Determine the number of size category first argument is larger than 
 * second and return that. Send back a -99 on error conditions.
 ***********************************************************************/
function sizeDelta(entity1, entity2) {
    class CreatureSizes {
        constructor(size) {
            this.SizeString = size;

            switch (size) {
                case "tiny": this.SizeInt = 1; break;
                case "sm": this.SizeInt = 2; break;
                case "med": this.SizeInt = 3; break;
                case "lg": this.SizeInt = 4; break;
                case "huge": this.SizeInt = 5; break;
                case "grg": this.SizeInt = 6; break;
                default: this.SizeInt = 0;  // Error Condition
            }
        }
    }

    if (DEBUG) console.log(` entity1: `,entity1);
    let entity1SizeString = entity1.document._actor.data.data.traits.size;
    let entity1SizeObject = new CreatureSizes(entity1SizeString);
    let entity1Size = entity1SizeObject.SizeInt;  // Returns 0 on failure to match size string
    if (!entity1Size) {
        let message = `Size of ${entity1.name}, ${entity1SizeString} failed to parse.`;
        if (debug) console.log(message);
        ui.notifications.error(message);
        return(-99);
    }

    if (DEBUG) console.log(` entity2: `,entity2);
    let entity2SizeString = entity2.document._actor.data.data.traits.size;
    let entity2SizeObject = new CreatureSizes(entity2SizeString);
    let entity2Size = entity2SizeObject.SizeInt;  // Returns 0 on failure to match size string
    if (!entity2Size) {
        let message = `Size of ${entity2.name}, ${entity1SizeString} failed to parse.`;
        if (debug) console.log(message);
        ui.notifications.error(message);
        return(-99);
    }

    if (DEBUG) console.log(`${entity1.name} ${entity1SizeString} ${entity1Size} - ${entity2.name} ${entity2SizeString} ${entity2Size} `);
    return(entity1Size - entity2Size);
}