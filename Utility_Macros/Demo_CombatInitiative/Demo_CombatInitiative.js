const MACRONAME = "Demo_CombatInitiative.0.1.js"
/*****************************************************************************************
 * Macro intended to be used as a onUse ItemMacro macro targeting on screen 
 * token(s) causing them to roll initiatve.
 * It also allows forcing of the initiative roll result.
 * 
 * 11/18/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
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
//---------------------------------------------------------------------------------------
// 
//
console.log(`${args[0]?.targets.length} Targets ==>`,args[0]?.targets)
jez.combatInitiative(args[0]?.targets, { formula: null, traceLvl: TL })
console.log(`============== Finishing === ${MACRONAME} =================`);
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/
/***************************************************************************************************
 * Roll initatives for passed token(s) (SUBJECT) this can be an atomic value or an array of any of 
 * these data types:
 *  - Token5e Data Object
 *  - TokenDocument5e Data Object
 *  - Token ID
 *  - Token Document UUID
 * 
 * Options has two defined fields:
 *  - traceLvl: Trace Level for this function call.
 *  - formula: forumla passed to Roll function, if not using default, this might be a "20" if
 *    forcing the initiative roll result.
 * 
 * This function will roll initiative for the tokens that are in combat and don't currently have an
 * initiative value. 
 ***************************************************************************************************/
// async function combatInitiative(SUBJECT, options = {}) {
//     const FUNCNAME = "combatInitiative(SUBJECT, options = {})";
//     const FNAME = FUNCNAME.split("(")[0]
//     const TAG = `${MACRO} ${FNAME} |`
//     const TL = options.traceLvl ?? 0
//     const FORMULA = options.formula ?? null  // Used to force a roll result, e.g. 20
//     if (TL === 2) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FNAME} ---`);
//     if (TL > 2) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FUNCNAME} ---`,
//         "SUBJECT ==>", SUBJECT, "options ==>", options);
//     //----------------------------------------------------------------------------------------------
//     // Define Variables
//     //
//     let combatantIds = []
//     //----------------------------------------------------------------------------------------------
//     // Grab the RunAsGM Macros
//     //
//     const GM_ROLL_INITIATIVE = jez.getMacroRunAsGM("RollInitiativeAsGM")
//     if (!GM_ROLL_INITIATIVE) { return false }
//     //----------------------------------------------------------------------------------------------
//     // Validate SUBJECT received, it can be a single or array of the following types:
//     // Token5e data object, Token Document obj, token.document.uuid, token.id (all must be same type)
//     // and build array of combatant Ids.
//     //
//     if (jez.typeOf(SUBJECT) === "array")   // Processing an array of critters
//         for (let i = 0; i < SUBJECT.length; i++) {
//             combatantIds.push(await processOneEntity(SUBJECT[i], { traceLvl: TL }))
//         }
//     else {
//         combatantIds.push(await processOneEntity(SUBJECT, { traceLvl: TL }))
//     }
//     //----------------------------------------------------------------------------------------------
//     // Make call to roll initiatives
//     //
//     await GM_ROLL_INITIATIVE.execute(combatantIds, FORMULA)
//     //----------------------------------------------------------------------------------------------
//     // Process a single entity, may need to call for each element of an array
//     //
//     async function processOneEntity(SUBJECT, options = {}) {
//         const FUNCNAME = "processOneEntity(SUBJECT, options = {})";
//         const FNAME = FUNCNAME.split("(")[0]
//         const TAG = `${MACRO} ${FNAME} |`
//         const TL = options.traceLvl ?? 0
//         if (TL === 2) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FNAME} ---`);
//         if (TL > 2) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FUNCNAME} ---`,
//             "SUBJECT ==>", SUBJECT, "options ==>", options);
//         //----------------------------------------------------------------------------------------------
//         // Determine the type of Subject
//         //
//         // let subjectType = jez.typeOf(SUBJECT)
//         let subjectType = ""
//         if (jez.typeOf(SUBJECT) === "object") {
//             if (SUBJECT?.constructor?.name === "Token5e") subjectType = `Token5e`
//             if (SUBJECT?.constructor?.name === "TokenDocument5e") subjectType = `TokenDocument5e`
//         } else if (jez.typeOf(SUBJECT) === "string") {
//             if (SUBJECT.length === 16) subjectType = `token.id`
//             else if (SUBJECT.length === 45) subjectType = `token.document.uuid`
//             else subjectType = `Garbage`
//         } else subjectType = `Garbage`
//         if (TL > 0) jez.trace(`${TAG} Processing ${subjectType}`, SUBJECT)
//         if (subjectType === 'Garbage') return jez.badNews(`Seemingly passed some icky junk: ${SUBJECT}`)
//         //----------------------------------------------------------------------------------------------
//         // Need to extract a combatantId from SUBJECT data
//         //
//         let combatantId
//         let initiative
//         switch (subjectType) {
//             case 'Token5e':
//                 if (!SUBJECT?.combatant?.id) return(null)
//                 combatantId = SUBJECT?.combatant?.id
//                 initiative = SUBJECT?.combatant?.data?.initiative
//                 break;
//             case 'TokenDocument5e':
//                 if (!SUBJECT?.combatant?.id) return(null)
//                 combatantId = SUBJECT?.combatant?.id
//                 initiative = SUBJECT?.combatant?.data?.initiative
//                 break;
//             case 'token.id':
//                 let dToken = await canvas.tokens.placeables.find(ef => ef.id === SUBJECT)
//                 if (!dToken?.combatant?.id) return(null)
//                 combatantId = dToken?.combatant?.id
//                 initiative = dToken?.combatant?.data?.initiative
//                 break;
//             case 'token.document.uuid':
//                 let dTokenDocument5e = await fromUuid(SUBJECT) 
//                 if (!dTokenDocument5e?.combatant?.id) return(null)
//                 combatantId = dTokenDocument5e?.combatant?.id
//                 initiative = dTokenDocument5e?.combatant?.data?.initiative
//                 break;
//             default:
//                 return jez.badNews(`This should not happen! Choked on ${SUBJECT}`)
//         }
//         if (initiative) return (null)
//         if (TL > 0) jez.trace(`${TAG} combatantId`, combatantId)
//         return (combatantId)
//     }
// }