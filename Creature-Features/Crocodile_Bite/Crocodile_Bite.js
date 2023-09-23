const MACRONAME = "Crocodile_Bite.0.9.js"
const TL = 5;
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
 * 07/06/22 0.7 JGB Changed to use CE
 * 07/07/22 0.8 JGB Update to use uuid for pair effects call 
 * 09/23/23 0.9 Replace jez-dot-trc with jez.log
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let msg = ""
const TAG = `${MACRO} |`
if (TL > 0) jez.log(`============== Starting === ${MACRONAME} =================`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const L_ARG = args[args.length - 1];
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;         
if (L_ARG.tokenId) aToken = canvas.tokens.get(L_ARG.tokenId); 
else aToken = game.actors.get(L_ARG.tokenId);
let aActor = aToken.actor; 
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const GRAPPLED_COND = "Grappled"
const GRAPPLING_COND = "Grappling"
const RESTRAINED_COND = "Restrained"
const GRAPPLED_JRNL = `@JournalEntry[${game.journal.getName(GRAPPLED_COND).id}]{Grappled}`
const GRAPPLING_JRNL = `@JournalEntry[${game.journal.getName(GRAPPLING_COND).id}]{Grappling}`
const RESTRAINED_JRNL = `@JournalEntry[${game.journal.getName(RESTRAINED_COND).id}]{Restrained}`
//--------------------------------------------------------------------------------------
// Make sure the invoking item actually reported a hit
if (wasHit()) {
    if (TL > 1) jez.log(`${TAG} a hit was reported`);
} else {
    if (TL > 1) jez.log(`${TAG} ${msg}`);
    await postResults(msg);
    if (TL > 1) jez.log(`${TAG} Ending ${MACRONAME}`);
    return;
}
//--------------------------------------------------------------------------------------
// Make sure one and only one token is targeted
//
if (oneTarget()) {
    if (TL > 1) jez.log(`${TAG} one target is targeted (a good thing)`);
} else {
    if (TL > 1) jez.log(`${TAG} exception on number of targets selected: ${msg}`);
    await postResults(msg);
    if (TL > 1) jez.log(`${TAG} Ending ${MACRONAME}`);
    return;
}
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
//--------------------------------------------------------------------------------------
// Make sure the target is no more than one size category larger than the actor
//
let sizeDelta = sizesLarger(aToken, tToken)
if (TL > 1) jez.log(`${TAG} sizeDelta: ${sizeDelta}`);
if (sizeDelta > -2) {
    if (TL > 1) jez.log(`${TAG} Size delta ok`);
} else {
    msg += `${tToken.name} is too large for ${tToken.name} to grapple.`
    if (TL > 1) jez.log(`${TAG} Target is too large`);
    await postResults(msg);
    if (TL > 1) jez.log(`${TAG} Ending ${MACRONAME}`);
    return;
}
//--------------------------------------------------------------------------------------
// Make sure the actor is not already grappling
//
if (jezcon.hasCE(GRAPPLING_COND, aToken.actor.uuid))
    return postResults(`<b>${aToken.name}</b> is already grappling, may not grapple a second time.<br>`)
//----------------------------------------------------------------------------------
// Apply the GRAPPLED and GRAPPLING Cconditions
//
jezcon.add({ effectName: GRAPPLED_COND, uuid: tToken.actor.uuid, origin: aActor.uuid })
jezcon.add({ effectName: GRAPPLING_COND, uuid: aToken.actor.uuid, origin: aActor.uuid })
//----------------------------------------------------------------------------------
// Pile onto the target with a Restrained effect
//
await jez.wait(100)
jezcon.add({ effectName: 'Restrained', uuid: tToken.actor.uuid, origin: aActor.uuid })
//----------------------------------------------------------------------------------
// Find the two just added effect data objects so they can be paired, to expire 
// together.
//
await jez.wait(100)
let tEffect = tToken.actor.effects.find(ef => ef.data.label === GRAPPLED_COND && ef.data.origin === aActor.uuid)
if (!tEffect) return jez.badNews(`Sadly, there was no Grappled effect from ${aToken.name} found on ${tToken.name}.`, "warn")
let oEffect = aToken.actor.effects.find(ef => ef.data.label === GRAPPLING_COND)
if (!oEffect) return jez.badNews(`Sadly, there was no Grappling effect found on ${aToken.name}.`, "warn")
const GM_PAIR_EFFECTS = jez.getMacroRunAsGM("PairEffects")
if (!GM_PAIR_EFFECTS) { return false }
await jez.wait(100)
// await GM_PAIR_EFFECTS.execute(aToken.id, oEffect.data.label, tToken.id, tEffect.data.label)
await GM_PAIR_EFFECTS.execute(oEffect.uuid, tEffect.uuid)
//----------------------------------------------------------------------------------
// Pair the target's grappled and restrained effects
//
await jez.wait(100)
tEffect = tToken.actor.effects.find(ef => ef.data.label === GRAPPLED_COND && ef.data.origin === aActor.uuid)
if (!tEffect) return jez.badNews(`Sadly, there was no Grappled effect from ${aToken.name} found on ${tToken.name}.`, "warn")
oEffect = tToken.actor.effects.find(ef => ef.data.label === RESTRAINED_COND && ef.data.origin === aActor.uuid)
if (!oEffect) return jez.badNews(`Sadly, there was no Restrained effect from ${aToken.name}.`, "warn")
await jez.wait(100)
// await GM_PAIR_EFFECTS.execute(tToken.id, oEffect.data.label, tToken.id, tEffect.data.label)
await GM_PAIR_EFFECTS.execute(oEffect.uuid, tEffect.uuid)
//-------------------------------------------------------------------------------
// Create an Action Item to allow the target to attempt escape
//
const GM_ESCAPE = jez.getMacroRunAsGM(jez.GRAPPLE_ESCAPE_MACRO)
if (!GM_ESCAPE) { return false }
await GM_ESCAPE.execute("create", aToken.document.uuid, tToken.document.uuid, aToken.actor.uuid)
//--------------------------------------------------------------------------------------
// Post results
//
msg = `${tToken.name} has been ${GRAPPLED_JRNL} and ${RESTRAINED_JRNL} by ${aToken.name} who is 
       ${GRAPPLING_JRNL}.<br><br>${tToken.name} may attempt to end the grapple per standard grapple rules.`
 postResults(msg);
/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************
 * Check to see if at least one target was hit, Return false if missed.
 ***************************************************************************************/
function wasHit() {
    if (args[0].hitTargets.length === 0) {
        return jez.badNews(` Missed ${tToken.name}, will not check for effects`, 'i');
    } else {
        return(true);
    }
}
/****************************************************************************************
 * Verify exactly one target selected, boolean return
 ***************************************************************************************/
function oneTarget() {
    if (!game.user.targets) 
        return jez.badNews(`Targeted nothing, must target single token to be acted upon`,'w')
    if (game.user.targets.ids.length != 1) 
        return jez.badNews(`Please target a single token. <br>Targeted ${game.user.targets.ids.length} tokens`,'w');
    if (TL > 1) jez.log(`${TAG} targeting one target`);
    return (true);
}
/****************************************************************************************
 * Return the number of sizes larger the second token is than the first.  
 *  - Negative return indicates Token1 is smaller than Token2 by that many increments.
 *  - Zero return indicates the same size
 *  - Positive return indicates Token1 is larger than Token2 by that many increments.
 ***************************************************************************************/
function sizesLarger(token1, token2) {
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
    let token1SizeString = token1.document._actor.data.data.traits.size;
    let token1SizeObject = new CreatureSizes(token1SizeString);
    let token1Size = token1SizeObject.SizeInt;  // Returns 0 on failure to match size string
    if (!token1Size) {
        jez.badNews(`Size of ${token1.name}, ${token1SizeString} failed to parse. End ${macroName}<br>`, 'e')
        return (99);
    }
    if (TL > 1) jez.log(`${TAG} Token1: ${token1SizeString} ${token1Size}`)

    let token2SizeString = token2.document._actor.data.data.traits.size;
    let token2SizeObject = new CreatureSizes(token2SizeString);
    let token2Size = token2SizeObject.SizeInt;  // Returns 0 on failure to match size string
    if (!token2Size) {
        jez.badNews(`Size of ${token2.name}, ${token2SizeString} failed to parse. End ${macroName}<br>`, 'e');
        return (99);
    }
    if (TL > 1) jez.log(`${TAG} Token2: ${token2SizeString} ${token2Size}`)

    let sizeDelta = token1Size - token2Size;
    if (TL > 1) jez.log(`${TAG} sizeDelta ${sizeDelta}`)
    return (sizeDelta);
}
/****************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}