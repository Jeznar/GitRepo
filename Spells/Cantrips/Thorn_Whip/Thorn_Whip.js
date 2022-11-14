const MACRONAME = "Thorn_Whip.0.3"
/*****************************************************************************************
 * Perform the Thorn_whip action including automated movement of the target token.
 * 
 * Spell Description: You create a long, vine-like whip covered in thorns that lashes out 
 *   at your command toward a creature in range. Make a melee spell attack against the 
 *   target. If the attack hits, the creature takes 1d6 piercing damage, and if the  
 *   creature is Large or smaller, you pull the creature up to 10 feet closer to you.
 * 
 *   The spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6),
 *    and 17th level (4d6).
 * 
 * 12/11/21 0.1 Creation of Macro
 * 01/10/22 0.2 Working on automating the "pull" action if this spell
 * 03/26/22 0.3 Moving into GitRepo and doing some polishing
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
 const LAST_ARG = args[args.length - 1];
 let aToken;         // Acting token, token for creature that invoked the macro
 if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
    else aToken = game.actors.get(LAST_ARG.tokenId);
 let msg = "";
 let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
 jez.log(`************ Executing ${MACRONAME} ****************`)
 for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
 // ---------------------------------------------------------------------------------------
 // Make sure exactly one target.
 //
 if (args[0].targets.length !== 1) {
     msg = `Funny business going on, one and only one target is allowed.  
            Tried to hit ${args[0].targets.length} targets.`;
     await postResults(msg);
     jez.log(` ${msg}`, args[0].saves);
     jez.log(`************ Ending ${MACRONAME} ****************`)
     return;
 }
 // ---------------------------------------------------------------------------------------
 // If no target was hit, post result and terminate 
 //
 if (args[0].hitTargets.length === 0) {
     msg = `The attack missed, no additional effects.`;
     await postResults(msg);
         jez.log(` ${msg}`, args[0].saves); 
         jez.log(`************ Ending ${MACRONAME} ****************`)
     return;
 }
 // ---------------------------------------------------------------------------------------
 // Create object to convert size string to values
 //
 class CreatureSizes {
     constructor(size) {
         this.SizeString = size;
         switch (size) {
             case "tiny": this.SizeInt = 1; break;
             case "sm": this.SizeInt = 2; break;
             case "med": this.SizeInt = 3; break;
             case "lg": this.SizeInt = 4; break;
             case "huge": this.SizeInt = 5; break;
             case "grg": this.SizeInt = 6; break;
             default: this.SizeInt = 0;  // Error Condition
         }
     }
 }
 // ---------------------------------------------------------------------------------------
 // Obtain target size.  Must be Large or smaller
 //
 let target = args[0].targets[0]
 let targetSizeObject = new CreatureSizes(target._actor.data.data.traits.size);
 let targetSize = targetSizeObject.SizeInt;  // Returns 0 on failure to match size string
 if (!targetSize) {
     let message = `Size of ${target.data.name} failed to parse. End ${macroName}`;
     jez.log(message);
     ui.notifications.error(message);
     await postResults(msg);
     return;
 }
 // ---------------------------------------------------------------------------------------
 // Check target size.  Must be Large or smaller and pull (move) it closer 
 //
 if (targetSize > 4) {
     msg = `<b>${target.data.name}</b> is too big (${targetSizeString}) to be pulled by this spell.`
     await postResults(msg);
     return;
 }
//  jez.moveToken(aToken, tToken, -2, 2500)
jez.moveToken(aToken, tToken, -2, 2500)
 // ---------------------------------------------------------------------------------------
 // Post message with success
 //
 msg = `<b>${token.name}</b> pulls <b>${target.data.name}</b> up to 10 feet closer.`
 await postResults(msg);
  jez.log(`************ Terminating ${MACRONAME} ****************`)
 return;
/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
async function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}