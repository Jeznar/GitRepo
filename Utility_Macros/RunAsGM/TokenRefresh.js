const MACRONAME = "TokenRefresh.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro will call the refresh method(?) on the passed argument, which is assumed to be a 
 * Token5e.  It must have the runAsGM flag checked on.
 * 
 * args[0] = Token5e object
 * 
 * 06/28/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

if (!jez.isToken5e(args[0])) return jez.badNews(`${this.name}'s argument must be a Token5e.`);
await args[0].refresh()