const MACRONAME = "test_addCondition.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Development and test harness for CE's intendedto provide function similiar to CUB's addCondition
 * 
 * A typical cub.addCondition that I want to replace
 * -------------------------------------------------
 *  await game.cub.addCondition(["Prone"], failures[i], {
 *      allowDuplicates: false,
 *      replaceExisting: false,
 *      warn: true
 *  });
 * 
 * async game.dfreds.effectInterface.addEffect({ effectName, uuid, origin, overlay, metadata })
 * @param {object} params - the params for adding an effect
 * @param {string} params.effectName - the name of the effect to add
 * @param {string} params.uuid - the UUID of the actor to add the effect to
 * @param {string} params.origin - the origin of the effect
 * @param {boolean} params.overlay - if the effect is an overlay or not
 * @param {object} params.metadata - additional contextual data for the application of the effect 
 *                                   (likely provided by midi-qol) -- Seemingly unused in code
 * @returns {Promise} a promise that resolves when the GM socket function completes
 * 
 * Example
 * -------
 * const uuid = canvas.tokens.controlled[0].actor.uuid; 
 * const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Bane', uuid);
 * 
 * if (!hasEffectApplied) {
 *     game.dfreds.effectInterface.addEffect({ effectName: 'Bane', uuid });
 * }
 * 
 * 07/07/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
 const TL = 1
 if (TL>0) jez.trace(`=== Starting === ${MACRONAME} ===`);
 for (let i = 0; i < args.length; i++) if (TL>1) jez.trace(`  args[${i}]`, args[i]);
 const LAST_ARG = args[args.length - 1];
 let msg = "";
 //---------------------------------------------------------------------------------------------------
 // Set the value for the Active Token (aToken)
 let aToken;         
 if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
 else aToken = game.actors.get(LAST_ARG.tokenId);
 let aActor = aToken.actor; 
 //
 // Set the value for the Active Item (aItem)
 let aItem;         
 if (args[0]?.item) aItem = args[0]?.item; 
 else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
 //---------------------------------------------------------------------------------------------------
 // Set Macro specific globals
 //
await jezcon.addCondition("Prone", LAST_ARG.targetUuids, 
    {allowDups: false, replaceEx: false, origin: aActor.uuid, overlay: false, traceLvl: TL })
await jez.wait(2000)
console.log("")
console.log("Calling addCondition with null target")
await jezcon.addCondition("Prone", null, 
    {allowDups: false, replaceEx: false, origin: aActor.uuid, overlay: false, traceLvl: TL })
await jez.wait(2000)
console.log("")
console.log("Calling addCondition with empty array of targets")
await jezcon.addCondition("Prone",[], 
    {allowDups: false, replaceEx: false, origin: aActor.uuid, overlay: false, traceLvl: TL })
// await addCondition("Garbage")
// await addCondition(2)
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************/

// /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
//  * This function wraps the CE add function, providing options that come close to duplicating 
//  * game.cub.addCondition().  It does not allow application of an array of effects, that would need 
//  * to be done with a call to this function for each effect.
//  * 
//  * Arguments expected
//  * ==================
//  * effectName -- string naming an existant CE effect
//  * targets -- an array or single UUID of actor(s) (e.g. Scene.MzEyYTVkOTQ4NmZk.Token.pcAVMUbbnGZ1lz4h)
//  * options -- an object that can have several fields, table below shows those defined in this function
//  * 
//  *  | Property  | Type       | Default | Description                                      |
//  *  |-----------+:----------:+:-------:+--------------------------------------------------|
//  *  | allowDups | boolean    | false   | Should this effect can be duplicated on target?  |
//  *  | replaceEx | boolean    | false   | Does this effect replace existing on target?     |
//  *  | origin    | actor.uuid | null    | Origin of the effect                             |
//  *  | overlay   | boolean    | false   | boolean, if true effect will be overlay on token |
//  *  | traceLvl  | integer    |  0      | Trace level to be used                           |
//  * 
//  * Example Call
//  * ============
//  * const TL = 4
//  * await jezcon.addCondition("Prone", LAST_ARG.targetUuids, 
//  *  {allowDups: false, replaceEx: true, origin: aActor.uuid, overlay: false, traveLvl: TL }) 
//  *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
// async function addCondition(effectName, targets, options) {
//     const FUNCNAME = 'addCondition(effectName, targets, options)'
//     const FNAME = FUNCNAME.split("(")[0]     
//     const TL = options?.traceLvl ?? 0
//     if (TL>1) jez.trace(`--- Starting --- ${FUNCNAME} ---`)
//     if (TL>2) jez.trace(` ${FNAME}(parameters)....`,"effectName",effectName,"targets",targets,"options",options)
//     // ----------------------------------------------------------------------------------------------
//     // Process the options object, setting default values as needed.
//     //
//     let allowDups = options?.allowDups ?? false
//     let replaceEx = options?.replaceEx ?? false
//     let origin = options?.origin ?? null
//     let overlay = options?.overlay ?? false
//     if (TL>3) jez.trace(`${FNAME} | Options Set`, 'allowDups', allowDups, 'replaceEx', replaceEx, 
//         'origin', origin, 'overlay', overlay, 'TL', TL)
//     // ----------------------------------------------------------------------------------------------
//     // Validate first argument and validate it.
//     //
//     if (typeof effectName !== "string")
//         return jez.badNews(`First argument needs to be a string naming an existant effect`, 'error')
//     let effectObj = await game.dfreds.effectInterface.findEffectByName(effectName);
//     if (!effectObj)
//         return jez.badNews(`Could not find effect data for ${effectName}`, 'error')
//     // ----------------------------------------------------------------------------------------------
//     // Process the options object, setting default values as needed.
//     //
//     if (jez.typeOf(targets) === "array") {  // Process each element of array
//         if (TL>3) jez.trace(`${FNAME} | Targets is an array.`)
//         for (const TARGET of targets) {
//             if (TL>3) jez.trace(`${FNAME} | Process ${TARGET}`)
//             addEffect(TARGET)
//         }
//     }
//     else {                                  // Presumably a single target's identifier
//         if (TL>3) jez.trace(`${FNAME} | Process ${targets}`)
//         addEffect(targets)
//     }
//     // ----------------------------------------------------------------------------------------------
//     // Function to add effect to a single target
//     //
//     function addEffect(targetUuid) {
//         const FNAME = 'addEffect   '
//         if (!jez.isActorUUID(targetUuid, {traceLvl:TL})) return false
//         let hasEffect = false
//         if (!allowDups || replaceEx) {  // Need to know if target currently has our effect 
//             hasEffect = jezcon.hasCE(effectName, targetUuid)
//             if (TL>3) jez.trace(`${FNAME} | hasEffect?`, hasEffect)
//             if (hasEffect) {
//                 if (!allowDups) {        // Skip applying as duplicates not allowed
//                     if (TL>3) jez.trace(`${FNAME} | Has effect and duplicates not allowed.`)
//                     return false
//                 }
//                 if (replaceEx) {        // Delete existing effect so new application can replace it        
//                     if (TL>3) jez.trace(`${FNAME} | Remove existing effect so new can replace it.`)
//                     jezcon.remove(effectName, targetUuid)
//                 }
//             }
//         }
//         jezcon.add({ effectName: effectName, uuid: targetUuid, origin: origin, overlay: overlay })
//     }
//     return true
// }

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Determines if the passed argument "looks like" an actor's UUID, returning a boolean result.
 * effectUUID will be like: 
 *     Actor.8D0C9nOodjwHDGQT
 * or 
 *     Scene.MzEyYTVkOTQ4NmZk.Token.Snu5Wo5FRsogPmGO
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
//  function isActorUUID(string, options={}) {
//     const FUNCNAME = 'isActorUUID(string, options={})'
//     const FNAME = FUNCNAME.split("(")[0]     
//     const TL = options?.traceLvl ?? 1
//     console.log(`${FNAME} | TL is `,TL)

//     if (TL>1) jez.trace(`${FNAME} | Is passed string an Actor UUID?`,string)
//     if (typeof string !== "string") return false            // Must be a string
//     if (TL>2) jez.trace(`${FNAME} | Argument passed in is a string`,string)
//     // ---------------------------------------------------------------------------------------------
//     // If we have an actor's UUID, process it, returning result
//     //
//     if (string.includes("Actor")) {
//         if (TL>2) jez.trace(`${FNAME} | Processing ${string} as an Actor`)
//         if (string.length !== 22) return false                  // Must be 75 characters long
//         if (TL>2) jez.trace(`${FNAME} | Length of ${string} - Ok`)
//         let stringArray = string.split(".")                     // Must be delimited by period characters
//         if (stringArray.length !== 2) return false              // Must contain 4 parts
//         if (TL>2) jez.trace(`${FNAME} | Count of tokens, ${stringArray.length} - Ok`)
//         if (stringArray[0] !== "Actor") return false           // First part must be "Actor"
//         if (TL>2) jez.trace(`${FNAME} | First token is "Actor" - Ok`)
//         if (stringArray[1].length !== 16) return false         // Second part must be 16 characters
//         if (TL>2) jez.trace(`${FNAME} | ID token length (${stringArray[1].length}) - Ok`)
//         if (TL>1) jez.trace(`${FNAME} | linked Actor UUID confirmed!`)
//         return true
//      }
//      if (string.includes("Token")) {
//         if (TL>2) jez.trace(`${FNAME} | Processing ${string} as a Token actor`)
//         if (string.length !== 45) return false                  // Must be 75 characters long
//         if (TL>2) jez.trace(`${FNAME} | Length of ${string} - Ok`)
//         let stringArray = string.split(".")                     // Must be delimited by period characters
//         if (stringArray.length !== 4) return false              // Must contain 4 parts
//         if (TL>2) jez.trace(`${FNAME} | Count of tokens, ${stringArray.length} - Ok`)
//         if (stringArray[0] !== "Scene") return false           // First part must be "Scene"
//         if (TL>2) jez.trace(`${FNAME} | First token is "Scene" - Ok`)
//         if (stringArray[1].length !== 16) return false         // Second part must be 16 characters
//         if (TL>2) jez.trace(`${FNAME} | Second token length ${stringArray[1].length} - Ok`)
//         if (stringArray[2] !== "Token") return false           // First part must be "Token"
//         if (TL>2) jez.trace(`${FNAME} | Third token is "Token" - Ok`)
//         if (stringArray[3].length !== 16) return false         // Second part must be 16 characters
//         if (TL>2) jez.trace(`${FNAME} | Forth token length (${stringArray[1].length}) - Ok`)
//         if (TL>1) jez.trace(`${FNAME} | unlinked Actor UUID confirmed!`)
//         return true
//      }
//      if (TL>0) jez.trace(`${FNAME} | Argument "${string}" lacks keyword "Actor" or "Token`)
//      return(false)
// }
