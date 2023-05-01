const MACRONAME = "Parse_Quip.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Development script that is intended to parse and display quips which will be a string of the following
 * form:
 * 
 * Quip text here...2000...Another message...The last thing
 * 
 * In the above, only the first phrase up to the ellipsis (three periods) '...' is required. The ellipsis
 * may be followed by:
 * - number which will serve as a delay override in milliseconds
 * - another phrase
 * - end of quip.
 *
 * 05/01/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const QUIP = 'Quip text here...3000...Another message...The last thing'
const DELAY = 500 // Default delay in replay in milliseconds
//-----------------------------------------------------------------------------------------------------------------------------------
// Do it!
//
await processQuip('Quip text here...3000...Another message...The last thing', {traceLvl: TL})
console.log('')
await processQuip('Simple Statement', {traceLvl: TL})
console.log('')
await processQuip('', {traceLvl: TL})
console.log('')
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Process that Quip!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function processQuip(QUIP, options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Go!
    //
    let ATOMS = QUIP.split("...")
    jez.trace(`${TAG} ${ATOMS.length} atoms:`, ATOMS)
    for (let i = 0; i < ATOMS.length; i++) {
        jez.trace(`${TAG} ${i} ${ATOMS[i]}`)
        if (!isNaN(ATOMS[i+1])) { // Returns true is value is a number
            jez.trace(`${TAG} >>> ${i+1} is a number ${ATOMS[i+1]}`)
            await jez.wait(ATOMS[++i])
        }
        else await jez.wait(DELAY)
    }
}