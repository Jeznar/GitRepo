const MACRONAME = "ActorUpdate.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Run this macro with "Execute as GM" checked
 * 
 * args[0] = Token5e? id
 * args[1] = update data object 
 * 
 * 06/28/22 0.1 Creation of Macro from Crymic's Version 11.06.21
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

if(!args[0] || !args[1]) return ui.notifications.error(`${this.name}'s arguments are invalid.`);
jez.log("canvas.tokens.get(args[0])",canvas.tokens.get(args[0]))
await canvas.tokens.get(args[0]).document.actor.update(args[1]);