const MACRONAME = "test_ceDesc.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro is intended to be run as an onUse macro from a testing ability with one token targeted.  
 * It does the following
 *   1. Apply a convientEffect that contains a convenientDescription already
 *   2. Use the get_ceDesc() function and display the initial effect description
 *   3. Update the description with set_ceDesc() function
 *   4. Use the get_ceDesc() function and display the updated effect description
 *  
 * 10/17/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
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
await jez.setCEDesc(tActor, EFFECT, NEW_DESC, { traceLvl: TL })
//-----------------------------------------------------------------------------------------------
// Read the convenientDescription from the effect after the modification
//
const CE_DESC2 = await jez.getCEDesc(tActor, EFFECT, { traceLvl: TL })
/***************************************************************************************************
 * Function that returns the convenientDescription from effectName of the subject
 ***************************************************************************************************/
// async function getCEDesc(subject, effectName, optionObj = {}) {
//     const FUNCNAME = "getCEDesc(subject, effect, optionObj={})";
//     const FNAME = FUNCNAME.split("(")[0]
//     const TL = optionObj?.traceLvl ?? 0
//     if (TL === 1) jez.trace(`--- Called ${FNAME} ---`);
//     if (TL > 1) jez.trace(`--- Called ${FUNCNAME} ---`, "subject", subject, "effectName", effectName,
//         "optionObj", optionObj);
//     //-----------------------------------------------------------------------------------------------
//     // Convert subject into actor5e data object
//     //
//     let actor5e = jez.subjectToActor(subject, FNAME)
//     if (TL > 2) jez.trace(`${TAG} actor5e`,actor5e)
//     if (!actor5e) jez.badNews(`${TAG} Can not continue`,"e")
//     //-----------------------------------------------------------------------------------------------
//     // Grab the data object from the subject for effectName, trying up to 20 times, chilling 10ms 
//     // after each attempt.
//     //
//     let effect
//     for (let i = 1; i <= 20; i++) {
//         effect = actor5e.effects.find(i => i.data.label === effectName);
//         if (effect) break
//         console.log(`Attempt #`,i)
//         await jez.wait(20)
//     }
//     if (TL > 2) jez.trace(`${TAG} actor5e effect`,effect)
//     if (!effect) return jez.badNews(`"${effectName}" not found on subject`,"i")
//     //-----------------------------------------------------------------------------------------------
//     // return the convienetDescription
//     //
//     return effect.data.flags.convenientDescription
// }
/***************************************************************************************************
 * Function that sets the convenientDescription to description on effectName of the subject
 ***************************************************************************************************/
//  async function setCEDesc(subject, effectName, description, optionObj = {}) {
//     const FUNCNAME = "setCEDesc(subject, effect, description, optionObj={})";
//     const FNAME = FUNCNAME.split("(")[0]
//     const TL = optionObj?.traceLvl ?? 0
//     if (TL === 1) jez.trace(`--- Called ${FNAME} ---`);
//     if (TL > 1) jez.trace(`--- Called ${FUNCNAME} ---`, "subject", subject, "effectName", effectName,
//         "description",description,"optionObj", optionObj);
//     if (TL > 3) jez.trace(`${TAG} data subject:`,subject)  
//     //-----------------------------------------------------------------------------------------------
//     // Chill for a little bit to make sure the effect being modified has settled down
//     //
//     await jez.wait(150)
//     //-----------------------------------------------------------------------------------------------
//     // Convert subject into actor5e data object
//     //
//     let actor5e = jez.subjectToActor(subject, FNAME)
//     if (TL > 2) jez.trace(`${TAG} actor5e`,actor5e)
//     if (!actor5e) jez.badNews(`${TAG} Can not continue`,"e")
//     //-----------------------------------------------------------------------------------------------
//     // Grab the data object from the subject for effectName
//     //
//     let effect = actor5e.effects.find(i => i.data.label === effectName);
//     if (TL > 2) jez.trace(`${TAG} actor5e effect`,effect)
//     if (!effect) return jez.badNews(`"${effectName}" not found on subject`,"i")
//     //-----------------------------------------------------------------------------------------------
//     // modify the description
//     //
//     effect.data.flags = { convenientDescription: description }
//     if (TL > 2) jez.trace(`${TAG} effect.data.flags`,effect.data.flags)
//     await effect.data.update({ 'flags': effect.data.flags });
//     if (TL > 2) jez.trace(`${TAG} effect.data`,effect.data)
//     await effect.update({ 'changes': effect.data.changes });
//     if (TL > 2) jez.trace(`${TAG} effect`,effect)
// }
/***************************************************************************************************
 * Process the subject passed returning an Actor5e if possible. 
 * 
 * Inputs
 *   subject: Actor5e, Token5e, or token id
 *   fname: Name of the function calling this
 * 
 * Output
 *   Returns either null or an actor5e data object
 ***************************************************************************************************/
// function processSubject(subject, fname) {
//     let actor5e
//     if (!subject) return jez.badNews(`${fname} subject false must be Token5e, Actor5e, or Token.id`,"e")
//     if (typeof (subject) === "object") { // Presumably we have a Token5e or Actor5e
//         if (subject.constructor.name === "Token5e") actor5e = subject.actor
//         else if (subject.constructor.name === "Actor5e") actor5e = subject
//         else return jez.badNews(`${fname} subject is type '${typeof (subject)}' not Token5e or Actor5e`,"e")
//     } else
//         if ((typeof (subject) === "string") && (subject.length === 16))
//             actor5e = jez.getTokenById(subject).actor
//         else
//             return jez.badNews(`${fname} subject is not a Token5e, Actor5e, or Token.id: ${subject}`,"e")
//     console.log("returning:", actor5e)
//     return actor5e
// }