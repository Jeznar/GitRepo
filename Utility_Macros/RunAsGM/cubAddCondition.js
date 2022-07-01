const MACRONAME = "cubAddCondition.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro will call game.cub.addCondition with the passed arguments
 * 
 * Seems to only work for the GM, so it is absolutely useless.
 * 
 * 06/30/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const TRACE_LEVEL = 3
jez.trc(1,TRACE_LEVEL,`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.trc(2,TRACE_LEVEL,`  args[${i}]`, args[i]);
jez.trc(2,TRACE_LEVEL,args)
console.log(await game.cub.addCondition(args[0],args[1],args[2]))
jez.trc(3,TRACE_LEVEL,"Done now")
