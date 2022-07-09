const MACRONAME = "test_addCon.0.1.js"
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
let trcLvl = 1;
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(2, trcLvl, `  args[${i}]`, args[i]);
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
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
addCondition("Prone")
addCondition("Garbage")
addCondition(2)
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************/

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Arguments expected:
 * 
 * effectName -- string naming an existant CE effect
 * targets -- an array or single UUID of actor(s) to receive the effect
 * options -- an object that can have several fields defined
 *      allowDups -- boolean indicating if this effect can be duplicated on target
 *      replaceEx -- boolean indicating if this effect should replace existing on target
 *      origin    -- Origin of the effect (what types of identifiers?)
 *      overlay   -- boolean, if true effect will be overlay on token  
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
async function addCondition(effectName, targets, options) {
    // ----------------------------------------------------------------------------------------------
    // Validate first argument and validate it.
    //
    if (typeof effectName === "string")  
        return jez.badNews(`First argument needs to be a string naming an existant effect`,'error')
    let effectObj = await game.dfreds.effectInterface.findEffectByName(effectName);
    if (typeof effectName === "string")  
        return jez.badNews(`Could not find effect data for ${effectName}`,'error')
    jez.trc(3,trcLvl,`${effectName} effectObj`,effectObj) 

    return(true)
}