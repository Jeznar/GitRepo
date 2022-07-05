const MACRONAME = "Hinder.0.3.js"
/*********************************************************************************************
 * Implement the "hurtful" half of the RAW Help Axtion in a somewhat approximate way.
 * 
 * "Alternatively, you can aid a friendly creature in attacking a creature within 5 feet of 
 * you. You feint, distract the target, or in some other way team up to make your ally's 
 * attack more effective. If your ally attacks the target before your next turn, the first 
 * attack roll is made with advantage."
 * 
 * This macro ammends that rule slightly, making the attack 
 * benefited the next one against that target regardless of 
 * source.
 * 
 * Midi-QoL Documentation: https://gitlab.com/tposney/midi-qol
 * 
 * List of Midi-QoL Flags:
 * https://docs.google.com/spreadsheets/u/0/d/1Vze_sJhhMwLZDj1IKI5w1pvfuynUO8wxE2j8AwNbnHE/htmlview
 * 
 * 11/17/21 0.1 JGB created from Help_0.1
 * 11/17/21 0.2 JGB Code Cleaning
 * 07/04/22 0.7 JGB Convert to CE for effect management
 **********************************************************************************************/
let trcLvl = 1
const debug = 0;
if (debug) console.log(`Starting: ${MACRONAME} arguments passed: ${args.length}`);
if (debug > 2) { let i = 0; for (let arg in args) { console.log(` ${i++}: ${arg}`) }; }
/************************************************************************
* Set Variables for execution
*************************************************************************/
let targetD = canvas.tokens.get(args[0].targets[0].id);
let itemD = args[0].item;
let player = canvas.tokens.get(args[0].tokenId);
/************************************************************************
* Check Initial Conditions
*************************************************************************/
// Need to have exactly one target selected
if (game.user.targets.ids.length != 1) {
    let message = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
    ui.notifications.warn(message);
    if (debug) console.log(message);
    return;
} else if (debug) console.log(` targeting one target`);
// Target needs to be in range
let range = 5; range += 2.5;    // Add a half square buffer for diagonal adjacancy 
let distance = canvas.grid.measureDistance(player, targetD);
distance = distance.toFixed(1);             // Chop the extra decimals, if any
if (debug) console.log(` Considering ${targetD.name} at ${distance} distance`);
if (distance > range) {
    let message = ` ${targetD.name} is not in range (${distance}), end ${MACRONAME}`;
    ui.notifications.warn(message);
    if (debug) console.log(message);
    return;
}
if (jezcon.hasCE("Hindered", targetD.actor.uuid))
    postResults(`${targetD.name} has already been hindered, no additional effect.`)
else {
    jezcon.add({ effectName: 'Hindered', uuid: targetD.actor.uuid })
    postResults(`${targetD.name} is hindered by the actions of ${player.name}, 
        granting advantage to next attacker within 1 turn.`)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
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