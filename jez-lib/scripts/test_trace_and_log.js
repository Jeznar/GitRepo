const MACRONAME = "test_Trace_and_Log"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro tests the trace (trc) and log library functions
 * 
 * 06/29/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);


//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let traceLevel = 3
let abc = {a:2, b:"b", c: null}
//---------------------------------------------------------------------------------------------------
// Exercise the functions
//
jez.log("Testing trc function")
jez.log("Longer message","part 2")
jez.log("Even Longer message","traceLevel",traceLevel,"abc",abc)
jez.trc(1, traceLevel, "Level 1")
jez.trc(2, traceLevel, "Level 2")
jez.trc(3, traceLevel, "Level 3")
jez.trc(4, traceLevel, "Level 4")


