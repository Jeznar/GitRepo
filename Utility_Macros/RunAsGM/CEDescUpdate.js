const MACRONAME = "CEDescUpdate.0.3.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Run this macro with "Execute as GM" checked. It updates an effect,
 * See code for loading the variables for required arguments.
 * 
 * 10/18/22 0.1 Creation of Macro 
 * 10/19/22 0.3 Removed support for optionObj that was causing pain
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const FUNCNAME = `${MACRO}(subject, effect, description)`;
const FNAME = FUNCNAME.split("(")[0]
const TAG = `${FNAME} |`
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(` CEDescUpdate >>> args[${i}]`, args[i]);
//---------------------------------------------------------------------------------------------------
// Load our variables from the passed arguments
//
let subject = args[0]       // Must be a token.id
let effectName = args[1]    
let description = args[2]
//---------------------------------------------------------------------------------------------------
// Do some input validation
//
if (typeof subject !== "string") return jez.badNews(`${TAG} First argument must be a string`,"e")           
if (subject.length !== 16) return jez.badNews(`${TAG} First argument must be 16 characters`,"e")           
if (typeof effectName !== "string") return jez.badNews(`${TAG} Second argument must be a string`,"e")           
if (typeof description !== "string") return jez.badNews(`${TAG} Third argument must be a string`,"e")           
//---------------------------------------------------------------------------------------------------
// Make library call, importantly as GM
//
jez.setCEDesc(subject, effectName, description)
