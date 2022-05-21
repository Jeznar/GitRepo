const MACRONAME = "Inspiring_Leader.0.5.js"
/*****************************************************************************************
 * Implemement the Inspiring Leader Feat.  This was originally added by Jon.
 * 
 * Process added temp HP to all FRIENDLY tokens within allowed distance who didn't already 
 * have temp HP. 
 * 
 * 11/15/21 0.1 JGB created from version on Rue sheet added 
 *                  debug and fixed distance bug. 
 * 11/15/21 0.2 JGB Verify a single token is selected
 * 11/23/21 0.3 JGB Fix Not working on non-accessible tokens
 *                  Requires callback macro ActorUpdate
 * 11/23/21 0.4 JGB Improve feedback to item card
 * 05/20/22 0.5 JGB General update when adding to GitRepo
*****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);

// Token dispostions, strings as shown in UI  
const FRIENDLY = 1;
const NEUTRAL = 0;
const HOSTILE = -1;
jez.log(`Starting: ${MACRONAME} arguments passed: ${args.length}`);
//---------------------------------------------------------------------------------------
// Grab the ActorUpdate macro which does magic to run asGM, contents embedded.
// if(!args[0] || !args[1]) return ui.notifications.error(`${this.name}'s arguments are invalid.`);
// ActorUpdate must run with "Execute as GM" checked
// Version 11.06.21
// args[0] = actor ID
// args[1] = update data
// if(!args[0] || !args[1]) return ui.notifications.error(`${this.name}'s arguments are invalid.`);
// await canvas.tokens.get(args[0]).document.actor.update(args[1]);
//----------------------------------------------------------------------------------------
const MAGICMACRO = "ActorUpdate";
const ActorUpdate = game.macros.getName(MAGICMACRO);
if (!ActorUpdate) return ui.notifications.error(`Cannot locate ${MAGICMACRO} GM Macro`);
if (!ActorUpdate.data.flags["advanced-macros"].runAsGM) return ui.notifications.error(`${MAGICMACRO} "Execute as GM" needs to be checked.`);
jez.log(` Found ${MAGICMACRO}, verified Execute as GM is checked`);
jez.log(ActorUpdate);
//----------------------------------------------------------------------------------------
// Add caster's level plus CHA mod as temp HP to tokens within 10 units 
//
let tokenD = canvas.tokens.controlled[0];
jez.log(tokenD);
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

jez.log(` Adding up to ${thp} temp HP`)

canvas.tokens.placeables.forEach(token => {
    let d = canvas.grid.measureDistance(sel, token);
    d = d.toFixed(1);
    jez.log(` Considering ${token.name} at ${d} distance`);
    if (d > dist) {
        jez.log(`  ${token.name} is too far away, no HP added`);
        if (toFarCount++) {toFar += ", "};
        toFar += token.name;
        jez.log(`  To Far #${toFarCount} ${token.name} is ${d} feet. To Fars: ${toFar}`);
    } else {
        if (token.data.disposition !== FRIENDLY) {
            jez.log(`  ${token.name} is not friendly, no HP added`);
            if (unFriendlyCount++) {unFriendly += ", "};
            unFriendly += token.name;
            jez.log(`  Unfriendly #${unFriendlyCount} ${token.name}. Unfriendlies: ${unFriendly}`);
        } else {
            // if (d <= dist && token.data.disposition === FRIENDLY) {
            let curthp = token.actor.data.data.attributes.hp.temp;
            if (curthp < thp || curthp == "") {
              // token.actor.update({ "data.attributes.hp.temp": thp });            // My original line
              // ActorUpdate.execute(target.id, { "data.attributes.hp.value": 0 }); // Crymic's line from MaceofDisruption.js
                ActorUpdate.execute(token.id, { "data.attributes.hp.temp": thp }); // target equiv token.id?
                jez.log(`  Setting ${token.name} temp hp to ${thp}.`);
                if (benefittedCount++) {receivedTempHP += ", "};
                receivedTempHP += token.name;
                jez.log(`  Benefit #${benefittedCount} ${receivedTempHP}`)
            } else {
                if (fullTempHPCount++) {fullTempHP += ", "};
                fullTempHP += token.name;
                jez.log(`  Skipped #${fullTempHPCount} ${token.name} had ${curthp} temp HP. Skips: ${fullTempHP}`);
            }
        }
    }
});

// ui.notifications.info(`${MACRONAME} provided HP to ${benefittedCount} creatures`);
jez.log(` Benefited: ${receivedTempHP}`);
if (benefittedCount) results += `${benefittedCount} Benefited : ${receivedTempHP}<br>`;
if (fullTempHPCount) results += `${fullTempHPCount} Full tmpHP: ${fullTempHP}<br>`;
if (unFriendlyCount) results += `${unFriendlyCount} Unfriendly: ${unFriendly}<br>`;
if (toFarCount) results += `${toFarCount} out of range.`
postResults(results);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post the results to chart card
 ***************************************************************************************************/
function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}