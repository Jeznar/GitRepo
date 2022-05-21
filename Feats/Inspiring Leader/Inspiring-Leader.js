const macroName = "Inspiring_Leader_0.4"
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
 * 11/23/21 0.3 JGB Fix Not working on non-accessible tokens
 *                  Requires callback macro ActorUpdate
 * 11/23/21 0.4 JGB Improve feedback to item card
 ***********************************************************/
const debug = true;

// Token dispostions, strings as shown in UI  
const FREINDLY = 1;
const NEUTRAL = 0;
const HOSTILE = -1;

if (debug) console.log(`Starting: ${macroName} arguments passed: ${args.length}`);

//-------------------------------------------------------------------------------
// Grab the ActorUpdate macro which does magic to run asGM, contents embedded.
// if(!args[0] || !args[1]) return ui.notifications.error(`${this.name}'s arguments are invalid.`);
// ActorUpdate must run with "Execute as GM" checked
// Version 11.06.21
// args[0] = actor ID
// args[1] = update data
// if(!args[0] || !args[1]) return ui.notifications.error(`${this.name}'s arguments are invalid.`);
// await canvas.tokens.get(args[0]).document.actor.update(args[1]);
//-------------------------------------------------------------------------------
const MAGICMACRO = "ActorUpdate";
const ActorUpdate = game.macros.getName(MAGICMACRO);
if (!ActorUpdate) return ui.notifications.error(`Cannot locate ${MAGICMACRO} GM Macro`);
if (!ActorUpdate.data.flags["advanced-macros"].runAsGM) return ui.notifications.error(`${MAGICMACRO} "Execute as GM" needs to be checked.`);
if (debug) console.log(` Found ${MAGICMACRO}, verified Execute as GM is checked`);
if (debug>1) console.log(ActorUpdate);

//-------------------------------------------------------------------------------
// Verify that a single acting token is selected
/*if (canvas.tokens.controlled.length != 1) {
    ui.notifications.warn(`You must select a single token for ${macroName}`);
    if (debug) console.log(` Targeted ${canvas.tokens.controlled.length} tokens`);
    return
} */

// Add caster's level plus CHA mod as temp HP to tokens within 10 units 
let tokenD = canvas.tokens.controlled[0];
console.log(tokenD);
let dist = 30;
let sel = canvas.tokens.controlled[0];
let level = tokenD.actor.data.data.details.level;
let chaMod = tokenD.actor.data.data.abilities.cha.mod;
let thp = level + chaMod;
let benefittedCount = 0;
let receivedTempHP = "";
let unFriendlyCount = 0;
let unFriendly = "";
let fullTempHPCount = 0;
let toFarCount = 0;
let toFar = "";
let fullTempHP = "";
let results = "";

if (debug) console.log(` Adding up to ${thp} temp HP`)

canvas.tokens.placeables.forEach(token => {
    let d = canvas.grid.measureDistance(sel, token);
    d = d.toFixed(1);
    if (debug) console.log(` Considering ${token.name} at ${d} distance`);
    if (d > dist) {
        if (debug) console.log(`  ${token.name} is too far away, no HP added`);
        if (toFarCount++) {toFar += ", "};
        toFar += token.name;
        if (debug) console.log(`  To Far #${toFarCount} ${token.name} is ${d} feet. To Fars: ${toFar}`);
    } else {
        if (token.data.disposition !== FREINDLY) {
            if (debug) console.log(`  ${token.name} is not friendly, no HP added`);
            if (unFriendlyCount++) {unFriendly += ", "};
            unFriendly += token.name;
            if (debug) console.log(`  Unfriendly #${unFriendlyCount} ${token.name}. Unfriendlies: ${unFriendly}`);
        } else {
            // if (d <= dist && token.data.disposition === FREINDLY) {
            let curthp = token.actor.data.data.attributes.hp.temp;
            if (curthp < thp || curthp == "") {
              // token.actor.update({ "data.attributes.hp.temp": thp });            // My original line
              // ActorUpdate.execute(target.id, { "data.attributes.hp.value": 0 }); // Crymic's line from MaceofDisruption.js
                ActorUpdate.execute(token.id, { "data.attributes.hp.temp": thp }); // target equiv token.id?
                if (debug) console.log(`  Setting ${token.name} temp hp to ${thp}.`);
                if (benefittedCount++) {receivedTempHP += ", "};
                receivedTempHP += token.name;
                if (debug) console.log(`  Benefit #${benefittedCount} ${receivedTempHP}`)
            } else {
                if (fullTempHPCount++) {fullTempHP += ", "};
                fullTempHP += token.name;
                if (debug) console.log(`  Skipped #${fullTempHPCount} ${token.name} had ${curthp} temp HP. Skips: ${fullTempHP}`);
            }
        }
    }
});

// ui.notifications.info(`${macroName} provided HP to ${benefittedCount} creatures`);
if (debug) console.log(` Benefited: ${receivedTempHP}`);
if (benefittedCount) results += `${benefittedCount} Benefited : ${receivedTempHP}<br>`;
if (fullTempHPCount) results += `${fullTempHPCount} Full tmpHP: ${fullTempHP}<br>`;
if (unFriendlyCount) results += `${unFriendlyCount} Unfriendly: ${unFriendly}<br>`;
if (toFarCount) results += `${toFarCount} out of range.`
postResults(results);

return;

/*************************************************************************
 *         END_OF_MAIN_MACRO_BODY
 *                                        END_OF_MAIN_MACRO_BODY
 ************************************************************************/

/************************************************************************
 * Post the results to chart card
 *************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    let chatMessage = await game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}