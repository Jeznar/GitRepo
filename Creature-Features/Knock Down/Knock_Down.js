const MACRONAME = "Knock_Down.0.6.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Apply the "Prone" condition if tToken fails save.  This is
 * intended to be used to automate "Chomp" for Galahad 
 * 
 *  - Set needed variables
 *  - End if tToken is already prone
 *  - Determine DC of save
 *  - Determine success/failure
 *  - Apply results
 * 
 * It would be nice for the macro to post results in addition.
 * 
 * 11/14/21 0.1 JGB created from Grapple_Initiate_0.8
 * 11/15/21 0.2 JGB Add logic to abourt macro if no hit and
 *                  eliminate uneeded hotbar protection
 * 11/15/21 0.3 JGB add limitation that tToken must be no more 
 *                  one size larger than aToken
 * 11/20/21 0.4 JGB Add card updates for errors
 * 05/04/22 0.5 JGB Update for Foundry 9.x
 * 08/02/22 0.6 JGB Add convenientDescription and general cleanup
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
const TL = 4;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL>1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;         
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor; 
//
// Set the value for the Active Item (aItem)
let aItem;         
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const debug = 1;
let gameRound = game.combat ? game.combat.round : 0;
const CONDITION = "Prone";
/************************************************************************
* Set Variables for aToken and tToken
*************************************************************************/
if (game.user.targets.ids.length != 1) {
    let message = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
    ui.notifications.warn(message);
    if (debug) console.log(message);
    return // Abort execution if a single token wasn't targeted
}
//-----------------------------------------------------------------------------------------------
// Get the target for this macro
//
let tToken = canvas.tokens.get(args[0].targets[0].id);
if (!tToken) return jez.badNews(`Need to target a token.`,"i")
if (debug) console.log(` Player: ${aToken.name}, Target: ${tToken.name}`);
let tActor = tToken.actor
//-----------------------------------------------------------------------------------------------
// End if tToken was missed in calling action.
//
if (args[0].hitTargets.length === 0) return jez.badNews(`Missed ${tToken.name}`,"i")
//----------------------------------------------------------------------------------
// Obtain the size of the aActor and tActor to determine advantage/disadvantage
// 
if (TL>2) jez.trace(`${TAG} await jez.getSize(aToken)`, await jez.getSize(aToken))
let aTokenSizeValue = (await jez.getSize(aToken)).value
let tTokenSizeValue = (await jez.getSize(tToken)).value
if (TL>1) jez.trace(`${TAG} ${aToken.name} size = ${aTokenSizeValue}, ${tToken.name} size = ${tTokenSizeValue}`)
//-----------------------------------------------------------------------------------------------
// End if tToken is more than one size category larger than aToken
//
if (aTokenSizeValue + 1 < tTokenSizeValue) {
    msg = `${tToken.name} is too large for ${aToken.name} to knock down.`
    if (TL>0) jez.trace(`${TAG} ${msg}`);
    postResults(msg);
    return;
}
//-----------------------------------------------------------------------------------------------
// End if tToken is already affected by CONDITION
//
if (tToken.actor.effects.find(ef => ef.data.label === CONDITION)) {
    let message = ` ${tToken.name} already prone, end ${MACRO}`;
    if (debug) console.log(message);
    postResults(`${tToken.name} is already ${CONDITION}.`);
    return;
}
//-----------------------------------------------------------------------------------------------
// Determine DC of save (10 + Athletics total bonus)
//
const SAVE_DC = 10 + aToken.actor.data.data.skills.ath.total;
if (debug) console.log(` DC = ${SAVE_DC}`);
//-----------------------------------------------------------------------------------------------
// Determine success/failure
//
let saveType = "str";
let saveObject = await MidiQOL.socket().executeAsGM("rollAbility", {
    request: "save",
    targetUuid: tToken.actor.uuid,
    ability: saveType,
    options: { chatMessage: true, fastForward: true }
});
let saved = true;
if (saveObject.total < SAVE_DC) {
    if (debug) console.log(`Target Failed! ${saveObject.total} vs ${SAVE_DC}`);
    saved = false;
} 
if (debug && saved) console.log(`${tToken.name} Saved!`); 
else console.log(`${tToken.name} Failed!`);
//-----------------------------------------------------------------------------------------------
//  Apply Prone Condition, if tToken did not win (save)
//
if (!saved) {
    if (debug) console.log(`Player Wins - Apply ${CONDITION}`);
    await jezcon.addCondition("Prone", tActor.uuid,
        { allowDups: false, replaceEx: false, origin: aActor.uuid, overlay: false, traceLvl: TL })
    // let effectData = {
    //     label: CONDITION,
    //     icon: "modules/combat-utility-belt/icons/prone.svg",
    //     origin: aToken.uuid,
    //     disabled: false,
    //     duration: { rounds: 99, startRound: gameRound },
    //     changes: [
    //         { key: `flags.midi-qol.disadvantage.attack.all`, mode: jez.ADD, value: 1, priority: 20 },
    //         { key: `flags.midi-qol.grants.advantage.attack.mwak`, mode: jez.ADD, value: 1, priority: 20 },
    //         { key: `flags.midi-qol.grants.advantage.attack.msak`, mode: jez.ADD, value: 1, priority: 20 },
    //         { key: `flags.midi-qol.grants.disadvantage.attack.rwak`, mode: jez.ADD, value: 1, priority: 20 },
    //         { key: `flags.midi-qol.grants.disadvantage.attack.rsak`, mode: jez.ADD, value: 1, priority: 20 }
    //     ]
    // };
    // await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:tToken.actor.uuid, effects: [effectData] });
    msg = `${tToken.name} is knocked prone.`;
    ui.notifications.info(msg);
    postResults(msg);
} else {
    if (debug) console.log("Target Wins");
    postResults(`${tToken.name} avoids a knock down.`);
}
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *         END OF MAIN MACRO BODY
 *                                        END OF MAIN MACRO BODY
 ****************************************************************************************************
 * Post the results to chat card
 *************************************************************************/
 async function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 

    if (TL>1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
}