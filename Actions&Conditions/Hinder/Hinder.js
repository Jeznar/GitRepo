const MACRONAME = "Hinder.0.5.js"
const TL = 0;
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
 * 07/04/22 0.3 JGB Convert to CE for effect management
 * 08/02/23 0.4 JGB Commented out range check and added CEDesc update
 * 09/23/23 0.9 Replace jez-dot-trc with jez.log
 **********************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let msg = ""
const TAG = `${MACRO} |`
if (TL > 0) jez.log(`============== Starting === ${MACRONAME} =================`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const L_ARG = args[args.length - 1];
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
if (game.user.targets.ids.length != 1) 
    return jez.badNews(`Target a single. Targeted ${game.user.targets.ids.length} tokens`, 'w')
else if (TL>1) jez.log(`${TAG} targeting one target`);
if (jezcon.hasCE("Hindered", targetD.actor.uuid))
    postResults(`${targetD.name} has already been hindered, no additional effect.`)
else {
    jezcon.add({ effectName: 'Hindered', uuid: targetD.actor.uuid })
    postResults(`${targetD.name} is hindered by the actions of ${player.name}, 
        granting advantage to next attacker within 1 turn.`)
    const NEW_DESC = `Hindered by ${player.name}, grants advantage to next attacker within one turn`;
    await jez.setCEDesc(targetD.id, 'Hindered', NEW_DESC, { traceLvl: 0 });
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
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}