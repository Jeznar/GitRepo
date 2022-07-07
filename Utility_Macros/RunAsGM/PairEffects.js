const MACRONAME = "PairEffects.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Wrapper for jez.pairEffects to runAsGM.
 * 
 * Input Arguments required: subject1, effectName1, subject2, effectName2
 * 
 * 07/05/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
let trcLvl = 2
jez.trc(1,trcLvl,`=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(2,trcLvl,`PairEffects | args[${i}]`, args[i]);
switch (args.length) {
    case 2: jez.pairEffects(args[0], args[1]); break;
    case 4: jez.pairEffects(args[0], args[1], args[2], args[3]); break;
    default: jez.badNews(`Incorrect argument count (${args.length}) given to ${MACRONAME}`)
}
