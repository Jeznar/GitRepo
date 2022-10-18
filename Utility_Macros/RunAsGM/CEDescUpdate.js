const MACRONAME = "CEDescUpdate.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Run this macro with "Execute as GM" checked. It updates an effect,
 * See code for loading the variables for required arguments.
 * 
 * 10/18/22 0.1 Creation of Macro 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const FUNCNAME = `${MACRO}(subject, effect, description, optionObj={})`;
const FNAME = FUNCNAME.split("(")[0]
const TAG = `${FNAME} |`
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(` CEDescUpdate >>> args[${i}]`, args[i]);
if (args.length != 4) return jez.badNews(`${TAG} Wrong number of arguments`)
//---------------------------------------------------------------------------------------------------
// Load our variables from the passed arguments
//
let subject = args[0]       // Must be a token.id
let effectName = args[1]    
let description = args[2]
let optionObj = args[3]
const TL = optionObj?.traceLvl ?? 0
//---------------------------------------------------------------------------------------------------
// Print some log messages
//
if (TL === 1) jez.trace(`--- Called ${FNAME} ---`);
if (TL > 1) jez.trace(`--- Called ${FUNCNAME} ---`, "subject", subject, "effectName", effectName,
    "description", description, "optionObj", optionObj);
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
jez.setCEDesc(subject, effectName, description, optionObj)