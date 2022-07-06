const MACRONAME = "Grasping_Hand.0.3.js"
/*****************************************************************************************
 * Initiate a Grasping Hand grapple or squeeze if already grappling
 * 
 *   The hand attempts to grapple a Huge or smaller creature within 5 feet of it. You use 
 *   the hand's Strength score to resolve the grapple. If the target is Medium or smaller, 
 *   you have advantage on the check.
 * 
 *   While the hand is Grappling the target, you can use a Bonus Action to have the hand 
 *   crush it. When you do so, the target takes bludgeoning damage equal to 2d6 + your 
 *   Spellcasting ability modifier.
 * 
 * 06/03/22 0.1 JGB Creation
 * 07/05/22 0.3 JGB Changed to use CE and add Temporary ability to Crush grappled target
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const GRAPPLED_COND = "Grappled"
const GRAPPLING_COND = "Grappling"
const GRAPPLED_JRNL = `@JournalEntry[${game.journal.getName(GRAPPLED_COND).id}]{Grappled}`
const GRAPPLING_JRNL = `@JournalEntry[${game.journal.getName(GRAPPLING_COND).id}]{Grappling}`
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        postResults(msg);
        return (false);
    }
    return (true)
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    // Is the hand already grappling?  If so, it needs to damage its grappled target, if targeted, 
    // or drop the grapple and try to grapple the new target.
    //
    let grapplingEffect = await aActor.effects.find(i => i.data.label === "Grappling");
    if (grapplingEffect) {
        jez.log(`Already grappling, determine if current target is what we are grappling`)
        let grappledTokenId = null
        let found = false
        for (const ELEMENT of grapplingEffect.data.changes) {
            if (ELEMENT.key === "macro.execute") {
                grappledTokenId = ELEMENT.value.split(" ")[1]   // First arg is grappled's ID
                found = true
                break
            }
        }
        if (!found) {
            msg = `The grappling effect lacked macro.execute.  This is odd.  Need Help.  Quiting.`
            ui.notifications.error(msg)
            postResults(msg)
            return
        }
        if (tToken.id === grappledTokenId) { // Targeting currently grappled target, damage it!
            jez.log(`Need to do ${aItem.data.damage.versatile} force damage here!!!`)
            let damageRoll = new Roll(`${aItem.data.damage.versatile}`).evaluate({ async: false });
            let flavor = "Squeezes its grappled target"
            await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, "force", [tToken],
                damageRoll, { flavor: flavor, itemCardId: LAST_ARG.itemCardId });
            game.dice3d?.showForRoll(damageRoll);
            return
        }
        else await grapplingEffect.delete()  // Targeting a new token, clear current grappling
    }
    //----------------------------------------------------------------------------------------------
    // Get size of target and set advantage appropriately
    //
    let tSizeObj = await jez.getSize(tToken)
    if (tSizeObj.value >= 6) {
        msg = `${tToken.name} is too large for ${aToken.name} to grasp, no effect.`
        postResults(msg)
        return (false)
    }
    let advan = null
    if (tSizeObj.value <= 3) advan = true
    //----------------------------------------------------------------------------------------------
    // Roll strength check for the active actor
    //
    let aActorRoll = await aActor.rollAbilityTest('str',
        { chatMessage: false, fastforward: true, advantage: advan });
    jez.log("aActorRoll", aActorRoll)
    let rollType = aActorRoll.terms[0].modifiers[0] === "kh" ? " (Advantage)" :
        aActorRoll.terms[0].modifiers[0] === "kl" ? " (Disadvantage)" : "";
    jez.log("rollType", rollType)
    game.dice3d?.showForRoll(aActorRoll);
    jez.log(` Player's str check: ${aActorRoll.total}`);
    //----------------------------------------------------------------------------------------------
    // Determing the target's check result (roll dialog)
    //
    let tSkill = "ath"; // Assume it will be Ath then check to see if right
    if (tActor.data.data.skills.acr.total >= tActor.data.data.skills.ath.total) { tSkill = "acr" }
    // Set long form of skill
    let targetSkill = tSkill == "ath" ? "Atheletics" : "Acrobatics";
    let tActorRoll = await tActor.rollSkill(tSkill, { chatMessage: false, fastForward: true });
    game.dice3d?.showForRoll(tActorRoll);
    jez.log(` Target's check result: ${tActorRoll.total}`);
    //----------------------------------------------------------------------------------------------
    // Determine who won the contest (used in ugly dialog)
    //
    let playerWin = "";
    let targetWin = "";
    aActorRoll.total >= tActorRoll.total ? playerWin = `success` : targetWin = `success`;
    //----------------------------------------------------------------------------------------------
    // Build and post complex chat message reporting contested results
    //
    await postChatCard()
    await jez.wait(100)
    //----------------------------------------------------------------------------------------------
    // If grapple succeeded add apropriate conditions so they are mutually dependent.
    //
    if (playerWin) {
        await game.cub.addCondition("Grappling", aToken)
        await game.cub.addCondition("Grappled", tToken)
        await jez.wait(500) // Let things settle a bit
        // Find the Grappling and Grappled effects to access their Id's
        let aEffect = await aActor.effects.find(i => i.data.label === "Grappling");
        jez.log("aEffect", aEffect)
        let tEffect = await tActor.effects.find(i => i.data.label === "Grappled");
        jez.log("tEffect", tEffect)
        //
        // Modify the grapple effect on the aActor to remove the associated effect on the tActor
        let aValue = `Remove_Paired_Effect ${tToken.id} ${tEffect.id}`
        jez.log('aValue', aValue)
        aEffect.data.changes.push({ key: `macro.execute`, mode: jez.CUSTOM, value: aValue, priority: 20 })
        let aResult = await aEffect.update({ 'changes': aEffect.data.changes });
        if (aResult) jez.log(`Active Effect "Grappling" updated!`, aResult);
        //
        // Modify the grapple effect on the tActor to remove the associated effect on the aActor
        let tValue = `Remove_Paired_Effect ${aEffect.id} ${aToken.id}`
        jez.log('tValue', tValue)
        tEffect.data.changes.push({ key: `macro.execute`, mode: jez.CUSTOM, value: tValue, priority: 20 })
        let tResult = await tEffect.update({ 'changes': tEffect.data.changes });
        if (tResult) jez.log(`Active Effect "Grappling" updated!`, tResult);
    }
    //----------------------------------------------------------------------------------------------
    // Post results card 
    //
    if (playerWin) {
        let distance = 5 + Math.max(0, jez.getCastMod(aToken)) * 5
        msg = `<b>${tToken.name}</b> is grappled by <b>${aToken.name}</b>.`
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
            msg: msg, title: `${tToken.name} is Grappled`, token: aToken
        })
    }
    else {
        msg = `<b>${tToken.name}</b> avoids <b>${aToken.name}</b>'s grapple attempt.`
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
            msg: msg, title: `${tToken.name} remains free`, token: aToken
        })
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    /****************************************************************************************
     * Build godawful messy format for a chat card reporting results
     ***************************************************************************************/
    async function postChatCard() {
        (async () => {
            let damage_results = `
 <div class="flexrow 2">
 <div><div style="text-align:center">${aToken.name}</div></div><div><div style="text-align:center">${tToken.name}</div></div>
 </div>
 <div class="flexrow 2">
     <div>
         <div style="text-align:center">Strength${rollType}</div>
         <div class="dice-roll">
             <div class="dice-result">
                 <div class="dice-formula">${aActorRoll.formula}</div>
                 <div class="dice-tooltip">
                     <div class="dice">
                         <header class="part-header flexrow">
                             <span class="part-formula">${aActorRoll.formula}</span>
                             <span class="part-total">${aActorRoll.total}</span>
                         </header>
                     </div>
                 </div>
                 <h4 class="dice-total ${playerWin}">${aActorRoll.total}</h4>
             </div>
         </div>
     </div>
     <div>
         <div style="text-align:center">${targetSkill}</div>
         <div class="dice-roll">
             <div class="dice-result">
                 <div class="dice-formula">${tActorRoll.formula}</div>
                 <div class="dice-tooltip">
                     <div class="dice">
                         <header class="part-header flexrow">
                             <span class="part-formula">${tActorRoll.formula}</span>
                             <span class="part-total">${tActorRoll.total}</span>
                         </header>
                     </div>
                 </div>
                 <h4 class="dice-total ${targetWin}">${tActorRoll.total}</h4>
             </div>
         </div>
     </div>
     
 </div>`;
            jez.log(" Built damage results string");
            const chatMessage = game.messages.get(args[0].itemCardId);
            let content = duplicate(chatMessage.data.content);
            const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
            const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${damage_results}`;
            content = content.replace(searchString, replaceString);
            await chatMessage.update({ content: content });
            await ui.chat.scrollBottom();
        })();
    }
}