const MACRONAME = "TokenUpdate.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Run this macro with "Execute as GM" checked
 * 
 * args[0] = Token5e(?) id
 * args[1] = update data object 
 * 
 * 11/14/22 0.1 Creation of Macro from ActorUpdate.0.1.js 06/28/22
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

if(!args[0] || !args[1]) return jez.badNews(`${this.name}'s arguments are invalid.`,'e');
jez.log("canvas.tokens.get(args[0])",canvas.tokens.get(args[0]))
await canvas.tokens.get(args[0]).document.update(args[1]);