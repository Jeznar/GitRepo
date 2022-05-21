/************************************************************
 * Implemement the Inspiring Leader Feat.  This was originally
 * added by Jon.
 * 
 * Process added temp HP to all FRIENDLY tokens within allowed 
 * distance who didn't already have temp HP. 
 * 
 * 11/15/21 0.1 JGB created from version on Rue sheet added 
 *                  debug and fixed distance bug. 
 * 11/15/21 0.2 JGB Verify a single token is selected
 ***********************************************************/
const macroName = "Inspiring-Leader-0.2"
const debug = true;

// Token dispostions, strings as shown in UI  
const FREINDLY = 1;
const NEUTRAL = 0;
const HOSTILE = -1;
let affectedCount = 0;
let receivedTempHP = "";

if (debug) console.log(`Starting: ${macroName} arguments passed: ${args.length}`);

//-------------------------------------------------------------------------------
// Verify that a single acting token is selected
if (canvas.tokens.controlled.length != 1) {
    ui.notifications.warn(`You must select a single token for ${macroName}`);
    if (debug) console.log(` Targeted ${canvas.tokens.controlled.length} tokens`);
    return
}

// Add caster's level plus CHA mod as temp HP to tokens within 10 units 
let tokenD = canvas.tokens.controlled[0];
console.log(tokenD);
let dist = 30;
let sel = canvas.tokens.controlled[0];
let level = tokenD.actor.data.data.details.level;
let chaMod = tokenD.actor.data.data.abilities.cha.mod;
let thp = level + chaMod;

if (debug) console.log(` Adding up to ${thp} temp HP`)

canvas.tokens.placeables.forEach(token => {
    let d = canvas.grid.measureDistance(sel, token);
    d = d.toFixed(1);
    if (debug) console.log(` Considering ${token.name} at ${d} distance`);
    if (d > dist) {
        if (debug) console.log(` ${token.name} is too far away, no HP added`);
    } else {
        if (token.data.disposition !== FREINDLY) {
            if (debug) console.log(` ${token.name} is not friendly, no HP added`);
        } else {
            // if (d <= dist && token.data.disposition === FREINDLY) {
            let curthp = token.actor.data.data.attributes.hp.temp;
            if (curthp < thp || curthp == "") {
                token.actor.update({ "data.attributes.hp.temp": thp });
                if (debug) console.log(` Setting ${token.name} temp hp to ${thp}.`);
                affectedCount++;
                receivedTempHP = receivedTempHP + token.name + ", ";
            } else {
                if (debug) console.log(` Skipped ${token.name} who already had ${curthp} temp HP.`);
            }
        }
    }
});

ui.notifications.info(`${macroName} provided HP to ${affectedCount} creatures`);
if (debug) console.log(` Benefited: ${receivedTempHP}`);
