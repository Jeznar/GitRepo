const MACRONAME = "Crocodile_Bite_0.6.js"
/*****************************************************************************************
 * Macro that applies on hit:
 *  - Grappled and Restrained conditions to the target
 *  - Grappling to the initator
 * 
 * 12/05/21 0.1 Creation of Macro
 * 12/05/21 0.2 Continuation
 * 12/06/21 0.3 Actually add code to apply conditions
 * 12/06/21 0.4 Seeking bug causing grappling not to be fully applied
 * 12/12/21 0.5 Eliminate cubCondition calls
 * 05/04/22 0.6 JGB Update for Foundry 9.x
 *****************************************************************************************/
const DEBUG = true;
const CUSTOM=0, MULTIPLY=1, ADD=2, DOWNGRADE=3, UPGRADE=4, OVERRIDE=5; 

actor = canvas.tokens.get(args[0].tokenId).actor;
let tokenName = token.data.name; 
let message = "";       // string to be appended to the itemCard reporting results
let actorID = canvas.tokens.get(args[0].tokenId);
let gameRound = game.combat ? game.combat.round : 0;
let effectData = [];

if (DEBUG) {
    console.log(`Starting: ${MACRONAME}`);
    console.log(`   Actor: ${actor.name}`);
    console.log(` tokenName: ${tokenName}`);
}

//--------------------------------------------------------------------------------------
// Make sure the invoking item actually reported a hit
if (wasHit()) {
    if (DEBUG) console.log(` a hit was reported`);
} else {
    if (DEBUG) console.log(` ${message}`);
    await postResults(message);
    if (DEBUG) console.log(`Ending ${MACRONAME}`);
    return;
}

//--------------------------------------------------------------------------------------
// Make sure one and only one token is targeted
//
if (oneTarget()) {
    if (DEBUG) console.log(` one target is targeted (a good thing)`);
} else {
    if (DEBUG) console.log(` exception on number of targets selected: ${message}`);
    await postResults(message);
    if (DEBUG) console.log(`Ending ${MACRONAME}`);
    return;
}
let targetID = canvas.tokens.get(args[0].targets[0].id);

//--------------------------------------------------------------------------------------
// Make sure the target is no more than one size category larger than the actor
//
let sizeDelta = sizesLarger(actorID, targetID)
if (DEBUG) console.log(` sizeDelta: ${sizeDelta}`);
if (sizeDelta > -2) {
    if (DEBUG) console.log(` Size delta ok`);
} else {
    message += `${targetID.name} is too large for ${tokenName} to grapple.`
    if (DEBUG) console.log(` Target is too large`);
    await postResults(message);
    if (DEBUG) console.log(`Ending ${MACRONAME}`);
    return;
}

//--------------------------------------------------------------------------------------
// Make sure the actor is not already grappling
//
let grappling = game.cub.hasCondition("Grappling", actorID, {warn:true});
if (DEBUG) console.log(` Already grappling: `, grappling);
if (grappling) {
    message += `<b>${actorID.name}</b> is already grappling, may not grapple a second time.<br>`
    await postResults(message);
    if (DEBUG) console.log(`Ending ${MACRONAME}`);
    return;
} else {
    if (DEBUG) console.log(`Ending ${MACRONAME}`);
}

//--------------------------------------------------------------------------------------
// Apply Grappled & Restrained condition to the target
//
if (DEBUG) {
    console.log(" Apply grappled & restrained conditions");
    console.log(` actorID.uuid  `, actorID.uiid);
    console.log(` targetID.uuid `,targetID.uuid);
}

effectData = [{
    label: "Grappled",
    icon: "modules/combat-utility-belt/icons/grappled.svg",
    origin: actorID.uuid,
    disabled: false,
    duration: { rounds: 99, startRound: gameRound }, 
    changes: [
        { key: `flags.VariantEncumbrance.speed`, mode: OVERRIDE, value: 1, priority: 20 },
        { key: `data.attributes.movement.walk`, mode: OVERRIDE, value: 1, priority: 20 },
        { key: `data.attributes.movement.swim`, mode: OVERRIDE, value: 1, priority: 20 },
        { key: `data.attributes.movement.fly`, mode: OVERRIDE, value: 1, priority: 20 },
        { key: `data.attributes.movement.climb`, mode: OVERRIDE, value: 1, priority: 20 },
        { key: `data.attributes.movement.burrow`, mode: OVERRIDE, value: 1, priority: 20 },
        // { key: ``, mode: OVERRIDE, value: 1, priority: 20 },
    ]
},{
    label: "Restrained",
    icon: "modules/combat-utility-belt/icons/restrained.svg",
    origin: actorID.uuid,
    disabled: false,
    duration: { rounds: 99, startRound: gameRound }, 
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
        // { key: ``, mode: OVERRIDE, value: 1, priority: 20 },
    ]
}]
await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:targetID.actor.uuid, effects: effectData });

/* game.cub.addCondition(["Grappled", "Restrained"], targetID, {
    allowDuplicates: true,
    replaceExisting: false,
    warn: true
}); */

message += `<b>${tokenName}</b> is now @JournalEntry[KmWFRyfFImaXM7O9]{Grappling}<br>
            <b>${targetID.name}</b> has been <b>@JournalEntry[QAwq9CcEg3fh3qZ3]{Grappled}</b> 
            and <b>@JournalEntry[CZWEqV2uG9aDWJnD]{Restrained}</b><br>`


//--------------------------------------------------------------------------------------
// Apply Grappling condition to the actor
//

effectData = [{
    label: "Grappling",
    icon: "Icons_JGB/Conditions/grappling.png",
    origin: actorID.uuid,
    disabled: false,
    duration: { rounds: 99, startRound: gameRound },
    changes: [
        { key: `flags.VariantEncumbrance.speed`, mode: MULTIPLY, value: 0.5, priority: 20 },
        { key: `data.attributes.movement.walk`, mode: MULTIPLY, value: 0.5, priority: 20 },
        { key: `data.attributes.movement.swim`, mode: MULTIPLY, value: 0.5, priority: 20 },
        { key: `data.attributes.movement.fly`, mode: MULTIPLY, value: 0.5, priority: 20 },
        { key: `data.attributes.movement.climb`, mode: MULTIPLY, value: 0.5, priority: 20 },
        { key: `data.attributes.movement.burrow`, mode: MULTIPLY, value: 0.5, priority: 20 },
        // { key: ``, mode: OVERRIDE, value: 1, priority: 20 },
    ]
}]
await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:actorID.uuid, effects: effectData });

/* game.cub.addCondition(["Grappling"], token, {
    allowDuplicates: true,
    replaceExisting: false,
    warn: true
}); */

//--------------------------------------------------------------------------------------
// Post the results
//
await postResults(message);
if (DEBUG) console.log(`Ending ${MACRONAME}`);

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/****************************************************************************************
* Check to see if at least one target was hit, Return false if missed.
 ***************************************************************************************/
function wasHit() {
    let DEBUG = false;

    if (args[0].hitTargets.length === 0) {
        message = ` Missed ${targetID.name}, will not check for effects`;
        if (DEBUG) console.log(message);
        return(false);
    } else {
        return(true);
    }
}

/****************************************************************************************
 * Verify exactly one target selected, boolean return
 ***************************************************************************************/
function oneTarget() {
    let DEBUG = false;

    if (!game.user.targets) {
        message = `Targeted nothing, must target single token to be acted upon`;
        // ui.notifications.warn(message);
        if (DEBUG) console.log(message);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        message = `Please target a single token to be acted upon. <br>Targeted ${game.user.targets.ids.length} tokens`;
        // ui.notifications.warn(message);
        if (DEBUG) console.log(message);
        return (false);
    }
    if (DEBUG) console.log(` targeting one target`);
    return (true);
}

/****************************************************************************************
 * Return the number of sizes larger the second token is than the first.  
 *  - Negative return indicates Token1 is smaller than Token2 by that many increments.
 *  - Zero return indicates the same size
 *  - Positive return indicates Token1 is larger than Token2 by that many increments.
 ***************************************************************************************/
function sizesLarger(token1, token2) {
    let DEBUG = false;

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

    // token1 = canvas.tokens.get(args[0].tokenId);
    let token1SizeString = token1.document._actor.data.data.traits.size;
    let token1SizeObject = new CreatureSizes(token1SizeString);
    let token1Size = token1SizeObject.SizeInt;  // Returns 0 on failure to match size string
    if (!token1Size) {
        let message = `Size of ${token1.name}, ${token1SizeString} failed to parse. End ${macroName}<br>`;
        if (debug) console.log(message);
        ui.notifications.error(message);
        return(99);
    }
    if (DEBUG) console.log(` Token1: ${token1SizeString} ${token1Size}`)

     //token2 = canvas.tokens.get(args[0].targets[0].id);
     let token2SizeString = token2.document._actor.data.data.traits.size;
     let token2SizeObject = new CreatureSizes(token2SizeString);
     let token2Size = token2SizeObject.SizeInt;  // Returns 0 on failure to match size string
     if (!token2Size) {
         message = `Size of ${token2.name}, ${token2SizeString} failed to parse. End ${macroName}<br>`;
         if (debug) console.log(message);
         ui.notifications.error(message);
         return(99);
     }
     if (DEBUG) console.log(` Token2: ${token2SizeString} ${token2Size}`)

     let sizeDelta = token1Size - token2Size;
     if (DEBUG) console.log(` sizeDelta ${sizeDelta}`)
     return(sizeDelta);
}

/****************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    if(DEBUG) console.log(`postResults: ${resultsString}`);
  
    let chatMessage = await game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
  }