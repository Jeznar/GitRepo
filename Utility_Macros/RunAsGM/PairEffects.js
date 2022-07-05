const MACRONAME = "PairEffects.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Wrapper for jez.pairEffects to runAsGM.
 * 
 * Input Arguments required: subject1, effectName1, subject2, effectName2
 * 
 * 07/05/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
//jez.log(`=== Starting === ${MACRONAME} ===`);
//for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
jez.pairEffects(args[0], args[1], args[2], args[3])