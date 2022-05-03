const macroName = "Grapple_Initiate_1.1.js"
/************************************************************
 * Initiate a grapple as an action 
 * 
 *  Steps:
 *  - Set needed variables
 *  - Determine initiator's atheletics roll
 *  - Obtain targets atheletics or acrobatics roll
 *  - Determine success/failure
 *  - Post results
 * 
 * 10/29/21 0.1 JGB created from vampire unarmed strike
 * 11/30/21 0.2 JGB Failed branch that was eliminated
 * 11/05/21 0.3 JGB Set up fast forwarding rolls
 * 11/05/21 0.4 JGB Incorporate dialogs from Crymic Tumble
 * 11/06/21 0.5 JGB Setup to work as hotbar or ItemMacro
 * 11/06/21 0.6 JGB Handle cancelled roll dialog that errors 
 * 11/06/21 0.7 JGB Add "Grappling" condition to originator
 * 11/06/21 0.8 JGB Check for grappling on originator, abort if found
 * 11/20/21 0.9 JGB Post result of attempt in text to the card
 *                  for error conditions
 * 12/06/21 1.0 JGB Add scroll to bottom and results message
 * 05/04/22 1.1 JGB Update for Foundry 9.x
 ***********************************************************/
const DEBUG = 1;
if (DEBUG) console.log(`Starting: ${macroName} arguments passed: ${args.length}`);

if (DEBUG>2) {
    let i = 0;
    for (let arg in args) {console.log(` ${i++}: ${arg}`)};
}

let gameRound = game.combat ? game.combat.round : 0;
/************************************************************************
* Determine if ItemMacro or Hotbar execution and setup variables
*************************************************************************/
let ItemMacro = false;
let player = null;
let target = null;
//const lastArg = args[args.length - 1];

if (args[0]) { // ItemMacro Invocation
    ItemMacro = true;
    if (DEBUG) console.log(` Executing as ItemMacro`);
    //-------------------------------------------------------------------------------
    // Obtain actor info, will only be one as it is an ItemMacro
    player = canvas.tokens.get(args[0].tokenId); 
    if (DEBUG>1) console.log(` Player: `,player);
    //-------------------------------------------------------------------------------
    // Verify that a single token to be acted upon is targeted & set it
    if (!oneTarget()) {
        postResults(`${player.name} is frutrated, can only grapple exactly one target.`);
        return;
    } else {
        target = canvas.tokens.get(args[0].targets[0].id);
        if (DEBUG > 1) console.log(` Target: `, target);
    }
} else { // Hotbar invocation
    if (DEBUG) console.log(` Executing as HotBar Macro`)
    //-------------------------------------------------------------------------------
    // Verify that a single acting token is selected
    if (canvas.tokens.controlled.length != 1) {
        ui.notifications.warn("You must select a single token to initiate action.");
        if (DEBUG) console.log(` Targeted ${canvas.tokens.controlled.length} tokens`);
         return;
    }
    // Get Selected (player) Token & Name
    if (DEBUG > 2) console.log(`actor`,canvas.tokens.controlled);
    const selToken = canvas.tokens.controlled[0];
    //-------------------------------------------------------------------------------
    // Verify that a single token to be acted upon is targeted
    if (game.user.targets.ids.length != 1) {
        ui.notifications.warn("You must target a single token to be acted upon.");
        if (DEBUG) console.log(`Targeted ${game.user.targets.ids.length} tokens`);
        return
    }
    // Get Target Token & Target Token's name
    const tarTokenId = game.user.targets.ids[0];
    const tarToken = canvas.tokens.get(tarTokenId);
    //-------------------------------------------------------------------------------
    // Set Variables to match ItemMacro definitions
    player = selToken;
    if (DEBUG>1) console.log(` Player: `,player);
    target = tarToken;
    if (DEBUG>1) console.log(` Target: `,target);
}
if (DEBUG) console.log(`Player: ${player.name}, Target: ${target.name}`); 

/************************************************************************
* If the originator of the grapple is already grappling, may not again
*************************************************************************/
//if (target.effects.find(ef => ef.data.label === effect)) {
if (player.actor.effects.find(ef => ef.data.label === "Grappling")) {
    // ui.notifications.warn(`${player.name} is already grappling.  May not grapple twice.`);
    postResults(`${player.name} may not initiate a grapple while alreay grappling.`);
    return;
}

/************************************************************************
* Determing the attacker's check result (roll dialog)
*************************************************************************/
if (DEBUG>1) console.log(`player:`,player);
if (DEBUG>1) console.log(`player.actor:`,player.actor);
if (DEBUG) console.log(` Player's athletics bonus:    ${player.actor.data.data.skills.ath.total}`);

let playerRoll = await player.actor.rollSkill('ath', { chatMessage: false });
if (!playerRoll) return; // terminate this macro if dialog fails to return a roll
let rollType = playerRoll.terms[0].modifiers[0] === "kh" ? " (Advantage)" : playerRoll.terms[0].modifiers[0] === "kl" ? " (Disadvantage)" : "";
game.dice3d?.showForRoll(playerRoll);

if (DEBUG) console.log(` Player's ath check: ${playerRoll.total}`); 

/*************************************************************************
 * Determing the target's check result (roll dialog)
 *************************************************************************/
let skill = "ath"; 
if (DEBUG) console.log(" Target's acrobatics bonus: " + target.actor.data.data.skills.acr.total); 
if (DEBUG) console.log(" Target's athletics bonus:  " + target.actor.data.data.skills.ath.total);
if (target.actor.data.data.skills.acr.total >= target.actor.data.data.skills.ath.total) {skill = "acr"}
if (DEBUG) console.log(" Target's selected skill:   " + skill);
//let targetCheck = await target.actor.rollSkill(skill, { fastForward: true }); 
let targetRoll = await target.actor.rollSkill(skill, { chatMessage: false, fastForward: true });
game.dice3d?.showForRoll(targetRoll);
if (DEBUG) console.log(` Target's ${skill} check: ${targetRoll.total}`); 

// Set long form of skill
let targetSkill = skill == "ath" ? "Atheletics" : "Acrobatics";

/**************************************************************************
 *  Determine if grapple succeeded
 *************************************************************************/
let playerWin = "";
let targetWin = "";
playerRoll.total >= targetRoll.total ? playerWin = `success`: targetWin = `success`;
if (playerWin) {
    if (DEBUG) console.log(" Target is grappled");
    // ui.notifications.info(`${player.name} has grappled ${target.name}`);
} else {       
    if (DEBUG) console.log(" Target avoided grapple");
    // ui.notifications.info(`${player.name} failed to grapple ${target.name}`);
}

/**************************************************************************
 *  Apply Grappled Condition
 *************************************************************************/
 if (playerWin) {
    if (DEBUG) console.log(" Apply grappled condition");

    let effectData = {
        label: "Grappled",
        icon: "modules/combat-utility-belt/icons/grappled.svg",
        /*origin: lastArg.uuid,*/
        origin: player.actor.uuid,
        disabled: false,
        duration: { rounds: 99, startRound: gameRound }, 
        changes: [{ key: `data.attributes.movement.all`, mode: 5, value: 0, priority: 20 }]
    };
    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:target.actor.uuid, effects: [effectData] });

    let message = `<b>${player.name}</b> has grappled <b>${target.name}</b>`
    if (DEBUG) console.log(message);
    await postResults(message);
} else {
    let message = `<b>${player.name}</b> failed to grapple <b>${target.name}</b>`
    if (DEBUG) console.log(message);
    await postResults(message);
}

/**************************************************************************
 *  Apply Grappling Condition
 *************************************************************************/
 if (playerWin) {
    if (DEBUG) console.log(" Apply grappled condition");
    
    let effectData = {
        label: "Grappling",
        icon: "Icons_JGB/Conditions/grappling.png",
        /*origin: lastArg.uuid,*/
        origin: player.actor.uuid,
        disabled: false,
        duration: { rounds: 99, startRound: gameRound },
        changes: [{ key: `data.attributes.movement.all`, mode: 1, value: 0.5, priority: 20 }] // half speed would be cool
    };
    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:player.actor.uuid, effects: [effectData] });
}

/**************************************************************************
 *  Build and Display dialog, only for ItemMacro execution
 *************************************************************************/
if (!ItemMacro) return;

(async () => {
    let damage_results = `
 <div class="flexrow 2">
 <div><div style="text-align:center">${player.name}</div></div><div><div style="text-align:center">${target.name}</div></div>
 </div>
 <div class="flexrow 2">
     <div>
         <div style="text-align:center">Atheletics${rollType}</div>
         <div class="dice-roll">
             <div class="dice-result">
                 <div class="dice-formula">${playerRoll.formula}</div>
                 <div class="dice-tooltip">
                     <div class="dice">
                         <header class="part-header flexrow">
                             <span class="part-formula">${playerRoll.formula}</span>
                             <span class="part-total">${playerRoll.total}</span>
                         </header>
                     </div>
                 </div>
                 <h4 class="dice-total ${playerWin}">${playerRoll.total}</h4>
             </div>
         </div>
     </div>
     <div>
         <div style="text-align:center">${targetSkill}</div>
         <div class="dice-roll">
             <div class="dice-result">
                 <div class="dice-formula">${targetRoll.formula}</div>
                 <div class="dice-tooltip">
                     <div class="dice">
                         <header class="part-header flexrow">
                             <span class="part-formula">${targetRoll.formula}</span>
                             <span class="part-total">${targetRoll.total}</span>
                         </header>
                     </div>
                 </div>
                 <h4 class="dice-total ${targetWin}">${targetRoll.total}</h4>
             </div>
         </div>
     </div>
     
 </div>`;
    if (DEBUG) console.log(" Built damage results string");
    const chatMessage = game.messages.get(args[0].itemCardId);
    let content = duplicate(chatMessage.data.content);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${damage_results}`;
    content = content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
})();

/*************************************************************************
 *         END OF MAIN MACRO BODY
 *                                        END OF MAIN MACRO BODY
 ************************************************************************/

/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        let message = `Targeted nothing, must target single token to be acted upon`;
        // ui.notifications.warn(message);
        if (DEBUG) console.log(message);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        let message = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        // ui.notifications.warn(message);
        if (DEBUG) console.log(message);
        return (false);
    }
    if (DEBUG) console.log(` targeting one target`);
    return (true);
}

/*************************************************************************
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