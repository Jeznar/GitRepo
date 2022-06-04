const MACRONAME = "Forceful_Hand.0.2.js"
/*****************************************************************************************
 * Initiate a Forceful Hand push for Arcane Hand
 * 
 *   The hand attempts to push a creature within 5 feet of it in a direction you choose.
 * 
 *   Make a check with the hand's Strength contested by the Strength (Athletics) check of 
 *   the target. If the target is Medium or smaller, you have advantage on the check.
 * 
 *   If you succeed, the hand pushes the target up to 5 feet plus a number of feet equal 
 *   to five times your Spellcasting ability modifier. The hand moves with the target to 
 *   remain within 5 feet of it. 
 * 
 * 06/03/22 0.1 JGB Creation
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
     return(true)
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
    // Get size of target and set advantage appropriately
    //
    let tSizeObj = await jez.getSize(tToken)
    let advan = null
    if (tSizeObj.value <= 3) advan = true
    //----------------------------------------------------------------------------------------------
    // Roll strength check for the active actor
    //
    let aActorRoll = await aActor.rollAbilityTest('str', 
        { chatMessage: false, fastforward: true, advantage: advan });
    jez.log("aActorRoll",aActorRoll)
    let rollType = aActorRoll.terms[0].modifiers[0] === "kh" ? " (Advantage)" : 
        aActorRoll.terms[0].modifiers[0] === "kl" ? " (Disadvantage)" : "";
    jez.log("rollType",rollType)
    game.dice3d?.showForRoll(aActorRoll);
    jez.log(` Player's str check: ${aActorRoll.total}`);
    //----------------------------------------------------------------------------------------------
    // Roll athletics check for the targeted Actor
    //
    let tActorRoll = await tActor.rollSkill('ath', { chatMessage: false, fastForward: true });
    game.dice3d?.showForRoll(tActorRoll);
    jez.log(` Target's athletics check: ${tActorRoll.total}`);
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
    // Post results card 
    //
    if (playerWin) {
        let distance = 5 + Math.max(0,jez.getCastMod(aToken))*5
        msg = `<b>${tToken.name}</b> is pushed up to ${distance} feet. The hand moves with the 
        target to remain within 5 feet of it.`
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
            msg: msg, title: `${tToken.name} is pushed...`, token: aToken
        })
    }
    else {
        msg = `<b>${tToken.name}</b> is not moved by ${aToken.name}'s push.`
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
            msg: msg, title: `${tToken.name} holds firm!`, token: aToken
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
         <div style="text-align:center">Athletics</div>
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