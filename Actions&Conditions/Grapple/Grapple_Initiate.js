const MACRONAME = "Grapple_Initiate_1.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Initiate a grapple as an action, if already grappling, drop the grapple
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
 * 07/04/22 1.2 JGB Convert to CE for effect management
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
let msg = ""
let trcLvl = 4
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(2, trcLvl, `  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Actor (aActor)
//
let aActor;
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else aActor = game.actors.get(LAST_ARG.actorId);
//
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// 
//
main()
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function main() {
    //-------------------------------------------------------------------------------
    // Verify that a single token to be acted upon is targeted & set it
    if (!oneTarget()) {
        postResults(`${aToken.name} is frutrated, can only grapple exactly one target.`);
        return;
    }
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    //-------------------------------------------------------------------------------
    // If the originator of the grapple is already grappling, may not again
    //
    if (aToken.actor.effects.find(ef => ef.data.label === "Grappling")) {
        postResults(`${aToken.name} may not initiate a grapple while alreay grappling.`);
        return;
    }
    /************************************************************************
    * Determing the attacker's check result (roll dialog)
    *************************************************************************/
    let playerRoll = await aToken.actor.rollSkill('ath', { chatMessage: false });
    if (!playerRoll) return; // terminate this macro if dialog fails to return a roll
    let rollType = playerRoll.terms[0].modifiers[0] === "kh" ? " (Advantage)" : 
                   playerRoll.terms[0].modifiers[0] === "kl" ? " (Disadvantage)" : "";
    game.dice3d?.showForRoll(playerRoll);
    /*************************************************************************
     * Determing the target's check result (roll dialog)
     *************************************************************************/
    let skill = "ath";
    if (tToken.actor.data.data.skills.acr.total >= tToken.actor.data.data.skills.ath.total) { skill = "acr" }
    let targetRoll = await tToken.actor.rollSkill(skill, { chatMessage: false, fastForward: true });
    game.dice3d?.showForRoll(targetRoll);
    // Set long form of skill
    let targetSkill = skill == "ath" ? "Atheletics" : "Acrobatics";
    /**************************************************************************
     *  Determine if grapple succeeded
     *************************************************************************/
    let playerWin = "";
    let targetWin = "";
    playerRoll.total >= targetRoll.total ? playerWin = `success` : targetWin = `success`;
    if (playerWin) jez.trc(2, trcLvl, " Target is grappled");
    else jez.trc(2, trcLvl, " Target avoided grapple");
    /**************************************************************************
     *  Apply Grappled Condition
     *************************************************************************/
    if (playerWin) {
        jez.trc(2, trcLvl, " Apply grappled condition");
        jezcon.add({ effectName: 'Grappled', uuid: tToken.actor.uuid, origin: aActor.uuid })
        let message = `<b>${aToken.name}</b> has grappled <b>${tToken.name}</b>`
        jez.trc(2, trcLvl, message);
        postResults(message);
    } else {
        let message = `<b>${aToken.name}</b> failed to grapple <b>${tToken.name}</b>`
        jez.trc(2, trcLvl, message);
        postResults(message);
    }
    /**************************************************************************
     *  Apply Grappling Condition
     *************************************************************************/
    if (playerWin) {
        jez.trc(2, trcLvl, "Apply grappled condition");
        await jez.wait(250)
        jezcon.add({ effectName: 'Grappling', uuid: aToken.actor.uuid })
        //-------------------------------------------------------------------------------
        // Find the two just added effect data objects so they can be paired, to expire 
        // together.
        //
        await jez.wait(100)
        let tEffect = tToken.actor.effects.find(ef => ef.data.label === "Grappled" && ef.data.origin === aActor.uuid)
        if (!tEffect) return jez.badNews(`Sadly, there was no Grappled effect from ${aToken.name} found on ${tToken.name}.`, "warn")
        let oEffect = aToken.actor.effects.find(ef => ef.data.label === "Grappling")
        if (!oEffect) return jez.badNews(`Sadly, there was no Grappling effect found on ${aToken.name}.`, "warn")
        jez.pairEffects(aToken.actor, oEffect, tToken.actor, tEffect)
        //-------------------------------------------------------------------------------
        // Create an Action Item to allow the target to attempt escape
        //
        const GM_MACRO = jez.getMacroRunAsGM(jez.GRAPPLE_ESCAPE_MACRO)
        if (!GM_MACRO) { return false }
        GM_MACRO.execute("create", aToken.document.uuid, tToken.document.uuid, aToken.actor.uuid)
    }
    await jez.wait(250)
    updateChatCard()
    /**************************************************************************
     *  Build and Display dialog
     *************************************************************************/
    async function updateChatCard() {
        jez.log("updateChatCard()")
        let damage_results = `
 <div class="flexrow 2">
 <div><div style="text-align:center">${aToken.name}</div></div><div><div style="text-align:center">${tToken.name}</div></div>
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
        jez.trc(2, trcLvl, " Built damage results string");
        const chatMessage = game.messages.get(args[0].itemCardId);
        let content = duplicate(chatMessage.data.content);
        const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
        const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${damage_results}`;
        content = content.replace(searchString, replaceString);
        await chatMessage.update({ content: content });
        await ui.chat.scrollBottom();
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    jez.trc(1, trcLvl, `--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    jez.trc(2, trcLvl, "postResults Parameters", "msg", msg)
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    jez.trc(1, trcLvl, `--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
}
/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) return jez.badNews(
        `Targeted nothing, must target single token to be acted upon`, "info")
    if (game.user.targets.ids.length != 1)
        return jez.badNews(`Target a single token to be acted upon. Targeted 
        ${game.user.targets.ids.length} tokens`);
    return (true);
}
