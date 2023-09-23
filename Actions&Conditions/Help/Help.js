const MACRONAME = "Help.0.9.js"
const TL = 0;
/*********************************************************************************************
 * Implement the "helpful" half of the RAW Help Axtion in a somewhat approximate way.
 * 
 * "You can lend your aid to another creature in the completion 
 * of a task. When you take the Help action, the creature you 
 * aid gains advantage on the next ability check it makes to 
 * perform the task you are helping with, provided that it 
 * makes the check before the start of your next turn."
 * 
 * This macro ammends that rule slightly, requiring adjacancy
 * to help (generally true) and simply providing advantage on
 * the target's next check.
 * 
 * Midi-QoL Documentation: https://gitlab.com/tposney/midi-qol
 * 
 * List of Midi-QoL Flags:
 * https://docs.google.com/spreadsheets/u/0/d/1Vze_sJhhMwLZDj1IKI5w1pvfuynUO8wxE2j8AwNbnHE/htmlview
 * 
 * 11/17/21 0.1 JGB created from Wooden_Sword_0.4
 * 11/17/21 0.2 JGB Code Cleanup
 * 11/20/21 0.3 JGB Change end condition to: 
 *                  isSkill: "Expires if the character rolls:  skill check"
 *                  isCheck: "Expires if the character rolls:  ability check"
 * 11/20/21 0.4 JGB More code cleanups
 * 11/20/21 0.5 JGB Posting error results to action card
 * 11/20/21 0.6 JGB Require target to be helped to be friendly
 * 07/04/22 0.7 JGB Convert to CE for effect management
 * 08/02/23 0.8 JGB Commented out range check and added CEDesc update
 * 09/23/23 0.9 JGB Replace jez-dot-trc with jez.log
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
// let target = canvas.tokens.get(args[0].failedSaves[0]._id);
let targetD = canvas.tokens.get(args[0].targets[0]?.id);
let itemD = args[0].item;
let player = canvas.tokens.get(args[0].tokenId);
let range = 5;
let effect = "Helped";
/************************************************************************
* Check Initial Conditions, bail out as appropriate
*************************************************************************/
if (!oneTarget()) {
    postResults(`${player.name} seems to have had a PEBCAK.<br>Target one entity, please`);
    return;  
}
if (jezcon.hasCE(effect,targetD.actor.uuid,{traceLvl: 0})) {  // Only apply if not already present
    postResults(`${targetD.name} has already been helped.`);
    return;  
}

/************************************************************************
 * Provide the target with a buff that gives advantage on next ability 
 * check.
*************************************************************************/
jezcon.add({ effectName: 'Helped', uuid: targetD.actor.uuid })
postResults(`${targetD.name} is helped by ${player.name}, gaining advantage on next ability check within 1 turn.`);

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Update the Convienet Description to contain some more yummy infos. 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const NEW_DESC = `Help from ${player.name} grants advantage on next ability check within one turn`;
await jez.setCEDesc(targetD.id, effect, NEW_DESC, { traceLvl: 0 });
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) 
        return jez.badNews(`Targeted nothing, must target single token to be acted upon`,'w');   
    if (game.user.targets.ids.length != 1) 
        return jez.badNews(`Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`,'w');
    if (TL > 0) jez.log(`${TAG} targeting one target`);
    return (true);
}