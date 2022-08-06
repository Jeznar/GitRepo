const MACRONAME = "Demo_Update_convenientDescription.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Modify convenientDescription on an applied effect
 * 
 * 08/06/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const LAST_ARG = args[args.length - 1];
let aToken;         
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor; 
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
const EFFECT_NAME = "Sample Effect"
const CE_DESC = `Here is an effect description, if only it was helpful`
//-----------------------------------------------------------------------------------------------
// Seach the active actor to find the just added effect
let effect = await aActor.effects.find(i => i.data.label === EFFECT_NAME);
//-----------------------------------------------------------------------------------------------
// Define the desired modification to the changes data
effect.data.flags = { convenientDescription: CE_DESC }
await effect.data.update({ 'flags': effect.data.flags });
//----------------------------------------------------------------------------------------------
// Apply the modification to add changes into existing effect
const result = await effect.update({ 'changes': effect.data.changes });