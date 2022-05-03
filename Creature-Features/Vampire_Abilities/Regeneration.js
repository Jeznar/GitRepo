/***********************************************************************************
 * Macro to apply self healing.  Originally intended for use by Vampires for 
 * regeneration
 * 
 * Now obsolete.
 * 
 * 10/23/21 0.1 JGB Creation 
 **********************************************************************************/
async function wait(ms) {return new Promise(resolve => {setTimeout(resolve, ms);});}
if(args[0].hitTargets.length === 0) return {};

/*** Constants to customize how the macro inflicts damage **********************/
const healAmount = 10       // Amount of self healing to apply
/******************************************************************************/

let tokenD = canvas.tokens.get(args[0].tokenId);
let actorD = game.actors.get(args[0].actor._id);
let itemD = args[0].item;

/* Apply healing to user of the ability*/
await MidiQOL.applyTokenDamage([{damage: healAmount, type: "healing"}], healAmount, new Set([tokenD]), itemD.name, new Set());

let the_message = `<p>${tokenD.name}  <b>regenerates up to ${healAmount}</b> pts of health</p>`;

await wait(600);    // Pause for 0.6 second
ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({actorD: actorD}),
      content: the_message,
      type: CONST.CHAT_MESSAGE_TYPES.EMOTE
    });