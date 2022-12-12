const MACRONAME = "Ray_of_Sickness.0.4.js"
/*****************************************************************************************
 * Built from Crymic's macro of the same name.  I added my structure, naming conventions,
 * and a VFX.
 * 
 * 02/19/22 0.1 Creation of Macro
 * 05/02/22 0.2 Update for Foundry 9.x
 * 07/31/22 0.3 Convert to a CE appplication of effect
 * 12/12/22 0.4 Add missed VFX and update logging
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 0;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //-----------------------------------------------------------------------------------------------------------------------------------
 if (TL>0) jez.trace(`${TAG} === Starting ===`);
 if (TL>1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
 //-----------------------------------------------------------------------------------------------------------------------------------
 // Set standard variables
 //
 const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
 let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
 let aActor = aToken.actor; 
 let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
 const VERSION = Math.floor(game.VERSION);
 const GAME_RND = game.combat ? game.combat.round : 0;
 //-----------------------------------------------------------------------------------------------------------------------------------
 // Set Macro specific globals
 //
const POISONED_JRNL = `@JournalEntry[${game.journal.getName("Poisoned").id}]{Poisoned}`
const SPELL_DC = aToken.actor.data.data.attributes.spelldc;
const SAVE_TYPE = "con";
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          // Midi ItemMacro On Use
if (TL>1) jez.trace(`${TAG} === Finished ===`);
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
  * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (args[0].targets.length !== 1)
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, 'w')
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    if (!await preCheck()) return(false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Check for a miss and fire of the VFX
    //
    const MISSED = (L_ARG.hitTargets.length === 0) ? true : false
    runVFX(aToken, tToken, MISSED)
    if (MISSED) {
        msg = `${aToken.name}'s Ray of Sickness has missed ${tToken.name}.`
        postResults(msg)
        return jez.badNews(msg,'i')
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply effect
    //
    let save = await MidiQOL.socket().executeAsGM("rollAbility", { request: "save", targetUuid: tActor.uuid, ability: SAVE_TYPE, 
        options: { chatMessage: true, fastForward: true } });
    const SUCCESS = (save.total < SPELL_DC) ? false : true
    if (TL>1) jez.trace(`${TAG} Saved?`, SUCCESS)
    let chatMessage = await game.messages.get(L_ARG.itemCardId);
    if (!SUCCESS) {
        //---------------------------------------------------------------------------------------------------------------------------
        // Obtain and modify CE condition to be applied
        //
        let effect = game.dfreds.effectInterface.findEffectByName("Poisoned").convertToObject();
        if (effect.flags?.dae) effect.flags.dae.specialDuration.push(SPECDUR)
        else effect.flags.dae = { specialDuration: ['turnEndSource'] } 
        if (TL>1) jez.trace(`${TAG} Adding effect parms`, 'effect', effect, 'tActor.uuid', tActor.uuid, 'aActor.uuid', aActor.uuid)
        game.dfreds.effectInterface.addEffectWith({effectData:effect, uuid:tActor.uuid, origin:aActor.uuid });
        //---------------------------------------------------------------------------------------------------------------------------
        // Post a new message to the chatcard with results
        //
        msg = `${tToken.name} is ${POISONED_JRNL} until the end of ${aToken.name}'s next turn`
        jez.addMessage(chatMessage, { color: "mediumseagreen", fSize: 14, msg: msg, tag: "saves" })
        await jez.wait(250)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the item chat card
    //
    const SAVE_MSG = (SUCCESS) ? "saves" : "fails"
    let saveResult = `<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${tToken.id}">${tToken.name} ${SAVE_MSG} with a ${save.total}</div><img src="${tToken.data.img}" width="30" height="30" style="border:0px"></div>`;
    let saveMessage = `<div class="midi-qol-nobox midi-qol-bigger-text">${CONFIG.DND5E.abilities[SAVE_TYPE]} Saving Throw: DC ${SPELL_DC}</div><div class="midi-qol-nobox">${saveResult}</div>`;
    let content = await duplicate(chatMessage.data.content);
    let searchString = /<div class="midi-qol-saves-display">[\s\S]*<div class="end-midi-qol-saves-display">/g;
    let replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display">${saveMessage}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    //-------------------------------------------------------------------------------------------------------------------------------
    // All done
    //
    if (TL>0) jez.trace(`${TAG} --- Finished ---`);
    return (SUCCESS);
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
// COOL-THING: Run the VFX -- Beam from originator to the target
async function runVFX(token1, token2, miss) {
    const VFX_FILE = "modules/jb2a_patreon/Library/Cantrip/Ray_Of_Frost/RayOfFrost_01_Regular_Green_30ft_1600x400.webm"
    new Sequence()
        .effect()
        .atLocation(token1)
        .stretchTo(token2)
        .missed(miss)
        .file(VFX_FILE)
        .play();
}