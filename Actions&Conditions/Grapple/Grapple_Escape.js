const macroName = "Grapple_Escape_0.6"
/************************************************************
 * Attempt to escape grapple as an action 
 * 
 *  Steps:
 *  - Set needed variables
 *  - Determine initiator's atheletics or acrobatics roll
 *  - Obtain grapplers (targeted_ atheletics roll
 *  - Determine success/failure
 *  - Post results
 * 
 * 10/29/21 0.1 JGB created from vampire unarmed strike
 * 11/06/21 0.2 JGB Major rewrite from the grapple macro
 * 11/06/21 0.3 JGB Some minor cleanups
 * 11/07/21 0.4 JGB Add codeto remove effects asGM (Crymic)
 * 12/05/21 0.5 JGB Add line to force scroll to bottom of chat
 * 12/06/21 0.6 JGB Cleanup existing Restrained if any
 ***********************************************************/

 /**********************************************************/

 const DEBUG = 1; 
 if (DEBUG) console.log(`Starting: ${macroName} arguments passed: ${args.length}`);

// --------- >
// const lastArg = args[args.length - 1];
// if (lastArg.hitTargets.length === 0) return {};
// const actorD = game.actors.get(lastArg.actor._id);
// const tokenD = canvas.tokens.get(lastArg.tokenId);
// const target = canvas.tokens.get(lastArg.hitTargets[0].id);
// --------- 
let gameRound = game.combat ? game.combat.round : 0;
/************************************************************************
* Determine if ItemMacro or Hotbar execution and setup variables
*************************************************************************/
let ItemMacro = false;
let player = null;
let target = null;

if (args[0]) { // ItemMacro Invocation
    ItemMacro = true;
    if (DEBUG) console.log(` Executing as ItemMacro`);
    //-------------------------------------------------------------------------------
    // Obtain actor info, will only be one as it is an ItemMacro
    player = canvas.tokens.get(args[0].tokenId);
    if (DEBUG > 1) console.log(` Player: `, player);
    //-------------------------------------------------------------------------------
    // Verify that a single token to be acted upon is targeted & set it
    if (game.user.targets.ids.length != 1) {
        ui.notifications.warn("You must target a single token to attempt to escape grapple.");
        if (DEBUG) console.log(`Targeted ${game.user.targets.ids.length} tokens`);
        return
    }
    target = canvas.tokens.get(args[0].targets[0].id);
    if (DEBUG > 1) console.log(` Target: `, target);
} else { // Hotbar invocation
    if (DEBUG) console.log(` Executing as HotBar Macro`)
    //-------------------------------------------------------------------------------
    // Verify that a single acting token is selected
    if (canvas.tokens.controlled.length != 1) {
        ui.notifications.warn("You must select a single token attempting to escape grapple.");
        if (DEBUG) console.log(` Targeted ${canvas.tokens.controlled.length} tokens`);
        return
    }
    // Get Selected (player) Token & Name
    if (DEBUG > 2) console.log(`actor`, canvas.tokens.controlled);
    const selToken = canvas.tokens.controlled[0];
    //-------------------------------------------------------------------------------
    // Verify that a single token to be acted upon is targeted
    if (game.user.targets.ids.length != 1) {
        ui.notifications.warn("You must target a single token to attempt to escape grapple");
        if (DEBUG) console.log(`Targeted ${game.user.targets.ids.length} tokens`);
        return
    }
    // Get Target Token & Target Token's name
    const tarTokenId = game.user.targets.ids[0];
    const tarToken = canvas.tokens.get(tarTokenId);
    //-------------------------------------------------------------------------------
    // Set Variables to match ItemMacro definitions
    player = selToken;
    if (DEBUG > 1) console.log(` Player: `, player);
    target = tarToken;
    if (DEBUG > 1) console.log(` Target: `, target);
}
if (DEBUG) console.log(`Player: ${player.name}, Target: ${target.name}`);

/************************************************************************************
* If the originator isn't already grappled, can not break a grapple
************************************************************************************/
if (!player.actor.effects.find(ef => ef.data.label === "Grappled")) {
    let mesg = `${player.name} is not grappled.  May not escape a grapple.`
    ui.notifications.warn(mesg);
    if (DEBUG) console.log(mesg);
    return;
}

/***********************************************************************************
* If the target is not grappling, may not escape (non-existant) grapple
***********************************************************************************/
if (!target.actor.effects.find(ef => ef.data.label === "Grappling")) {
    let mesg = `${target.name} is not grappling. Nothing to break.`
    ui.notifications.warn(mesg);
    if (DEBUG) console.log(mesg);
    return;
}

/**************************************************************************
 * Determing the escapee's check result (roll dialog)
 *************************************************************************/
//if (DEBUG > 1) console.log(`player:`, player);
//if (DEBUG > 1) console.log(`player.actor:`, player.actor);
let skill = "ath";
if (DEBUG) console.log(` Escapee's (${player.name}) acrobatics bonus: ${player.actor.data.data.skills.acr.total}`);
if (DEBUG) console.log(` Escapee's (${player.name}) athletics bonus: ${player.actor.data.data.skills.ath.total}`);
if (target.actor.data.data.skills.acr.total >= target.actor.data.data.skills.ath.total) { skill = "acr" }
if (DEBUG) console.log(` Escapee's (${player.name}) selected skill: ${skill}`);
let playerRoll = await player.actor.rollSkill(skill, { chatMessage: false });
if (DEBUG) console.log(` Escapee's  (${player.name}) ${skill} check: ${playerRoll.total}`);
if (!playerRoll) return; // terminate this macro if dialog fails to return a roll
let rollType = playerRoll.terms[0].modifiers[0] === "kh" ? " (Advantage)" : playerRoll.terms[0].modifiers[0] === "kl" ? " (Disadvantage)" : "";
game.dice3d?.showForRoll(playerRoll);
let playerSkill = skill == "ath" ? "Atheletics" : "Acrobatics"; // Set long form of skill

/************************************************************************
* Determing the grapplers's check result (roll dialog)
*************************************************************************/
if (DEBUG) console.log(` Grapler's (${target.name}) athletics bonus: ${target.actor.data.data.skills.ath.total}`);
let targetRoll = await target.actor.rollSkill('ath', { chatMessage: false, fastForward: true });
if (!targetRoll) return; // terminate this macro if dialog fails to return a roll
game.dice3d?.showForRoll(targetRoll);
if (DEBUG) console.log(` Grapplers's (${target.name}) athletics check: ${targetRoll.total}`); 

/**************************************************************************
 * Determine if escape succeeded 
 *************************************************************************/
if (playerRoll.total > targetRoll.total) {
    if (DEBUG) console.log(" Target escaped grapple");
} else { // If grapple was avoided end of execution
    if (DEBUG) console.log(" Target remains grappled");
}
let playerWin = "";
let targetWin = "";
playerRoll.total >= targetRoll.total ? playerWin = `success`: targetWin = `success`;
if (playerWin) {
    let mesg = `${player.name} escaped from ${target.name}'s grapple`;
    if (DEBUG) console.log(mesg);
    // ui.notifications.info(mesg);
} else {       
    let mesg = `${player.name} remains grappled by ${target.name}`;
    if (DEBUG) console.log(mesg);
    // ui.notifications.info(mesg);
}

/**************************************************************************
 *  Remove grappled and grappling condition if player won the contest
 **************************************************************************/
if (playerWin) {
    if (DEBUG) console.log(" Need to remove grappled condition");

    // Player should always have authority to alter effects in their own token
    let playerExistingEffect = await player.actor.effects.find(ef => ef.data.label === "Grappled");
    if (playerExistingEffect) await playerExistingEffect.delete();

    let targetExistingEffect = await target.actor.effects.find(ef => ef.data.label === "Grappling");
    // Following line fails with permission error when run against a non-owned token
    // await targetExistingEffect.delete();
    // Crymic posted a snippet that includes essentially the preceding line and the following
    if (targetExistingEffect) await MidiQOL.socket().executeAsGM("removeEffects",
        { actorUuid: target.actor.uuid, effects: [targetExistingEffect.id] });

    let message = `<b>${player.name}</b> has escapped the grapple from <b>${target.name}</b>`
    if (DEBUG) console.log(message);
    await postResults(message);

    // ----------------------------------------------------------------------
    // If the player has a restrained condition, remove it too as this seems 
    // more often right than wrong
    let restrained = game.cub.hasCondition("Restrained", player, { warn: true });
    if (DEBUG) console.log(` Restrained: `, restrained);
    if (restrained) {
        await game.cub.removeCondition("Restrained", player, {warn:true})
        if (DEBUG) console.log(` Removed existing Restrained conditon from ${player.name}`);
        return;
    } else {
        if (DEBUG) console.log(` No Restrained conditon found on ${player.name}`);
    }
} else {
    let message = `<b>${player.name}</b> remains grappled by <b>${target.name}</b>`
    if (DEBUG) console.log(message);
    await postResults(message);
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
          <div style="text-align:center">${playerSkill}${rollType}</div>
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
          <div style="text-align:center">Atheletics</div>
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