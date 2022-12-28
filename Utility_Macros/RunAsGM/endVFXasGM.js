const MACRONAME = "endVFXasGM.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Run this macro with "Execute as GM" checked
 * 
 * args[0] = arguments to be passed to Sequencer.EffectManager.endEffects.
 *           object if used must be an id, it can not be a placeable object
 * 
 * 12/29/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
Sequencer.EffectManager.endEffects(args[0]);