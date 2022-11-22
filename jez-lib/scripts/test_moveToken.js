const MACRONAME = "test_ceDesc.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro is intended to be run as an onUse macro from a testing ability with one token targeted.  
 * It does the following
 *   1. Apply a convientEffect that contains a convenientDescription already
 *   2. Use the get_ceDesc() function and display the initial effect description
 *   3. Update the description with set_ceDesc() function
 *   4. Use the get_ceDesc() function and display the updated effect description
 *  
 * 10/17/22 0.1 Creation of Macro
 * 10/18/22 0.2 Addressing permission issue with setCEDesc
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 5;                               // Trace Level for this macro
let msg = "";                               // Global message string
const EFFECT = "Frightened"
//-----------------------------------------------------------------------------------------------
// Check that we have a token/actor targeted to be acted upon
//
if (args[0].targets.length !== 1)       // If not exactly one target 
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`,"w");
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
let tActor = tToken.actor
//-----------------------------------------------------------------------------------------------
// Apply the Convinent Effect (CE) named as EFFECT to our test subject
//
await jezcon.addCondition(EFFECT, tToken.actor.uuid,
    { allowDups: false, replaceEx: true, origin: actor.uuid, overlay: false, traceLvl: TL })
//-----------------------------------------------------------------------------------------------
// Read the convenientDescription from the effect just applied
//
const CE_DESC1 = await jez.getCEDesc(tToken, EFFECT, { traceLvl: TL })
//-----------------------------------------------------------------------------------------------
// Update the convenientDescription for the effect just applied
//
const NEW_DESC = "String describing the effect of the effect!"
if (TL > 3) jez.trace(`${TAG} data tActor:`,tActor)  
// await setCEDesc(tActor, EFFECT, NEW_DESC, { traceLvl: TL })
await jez.setCEDescAsGM(tToken.id, EFFECT, NEW_DESC, { traceLvl: TL })
//-----------------------------------------------------------------------------------------------
// Read the convenientDescription from the effect after the modification
//
const CE_DESC2 = await jez.getCEDesc(tActor, EFFECT, { traceLvl: TL })
