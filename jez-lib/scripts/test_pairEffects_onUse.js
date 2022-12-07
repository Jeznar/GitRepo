const MACRONAME = "test_pair_Effects.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * 
 * 12/06/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 1;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set standard variables
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
let tActor = tToken?.actor;
//---------------------------------------------------------------------------------------------------
// Slap an effect on active and targetted actor that will be paired
//
let subjects = [aActor.uuid, tActor.uuid]
await jezcon.addCondition("Prone", subjects,
    { allowDups: false, replaceEx: true, origin: aActor.uuid, overlay: false, traceLvl: TL })
await jez.wait(100)
pairEffectsAsGM(aActor, "Prone", tToken.actor, "Prone")

return

// Remove_Paired_Effect 7BJKpNufDB5XseeU Scene.MzEyYTVkOTQ4NmZk.Token.77b4Lt7sbTG6Dkts.ActiveEffect.6hxyrr4v7dc2284c
/**************************************************************************************************************
 * Add a macro execute line calling the macro "Remove_Paired_Effect" which must exist in the macro folder to
 * named effect on the pair of tokens supplied.
 *
 * Note: This operates on effect by name which can result in unexpected results if multiple effects on a an
 * actor have the same name.  Not generally an issue, but it might be.
 *
 * subject1 & subject2 are types supported by jez.getActor5eDataObj (actor5e, token5e, token5e.id, actor5e.id)
 * effectName1 & effectName2 are strings that name effects on their respective token actors.
 * 
 * ***ALTERNATIVELY***
 * 
 * Can be called with just two arguments, UUID's for the effects to be paired.  This approach is recommended.
 **************************************************************************************************************/
// async function pairEffects(subject1, effectName1, subject2, effectName2) {
async function pairEffectsAsGM(...args) {
    const FUNCNAME = "jez.pairEffectsAsGM(...args)"
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${FNAME} |`
    const TL = 5
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Process the args to see what we have.  Two is effect.uuid mode, Four is older, others are bad
    //
    if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`${TAG} args[${i}]`, args[i]);
    if (args.length !== 2 && args.length !== 4)
        return jez.badNews(`Bad Argument count (${args.length}) provided to ${FNAME}`)
    let uuidMode = false                    // False indicates subject & effect pairs
    if (args.length === 2) uuidMode = true  // True indicates uuid call approach
    //-----------------------------------------------------------------------------------------------
    // Load up the runAsGM wrapper, quit if can not be found
    //
    const GM_PAIR_EFFECTS = jez.getMacroRunAsGM("PairEffects")
    if (!GM_PAIR_EFFECTS) return
    //-----------------------------------------------------------------------------------------------
    // If we are in uuidMode, call the runAsGM wrapper macro with the two arguments and quit
    //
    if (uuidMode) {
        let effectUuid1 = args[0]
        let effectUuid2 = args[1]
        if (TL > 1) jez.trace(`${TAG} Running in uuidMode`);
        GM_PAIR_EFFECTS.execute(effectUuid1, effectUuid2)
        return
    }
    //-----------------------------------------------------------------------------------------------
    // Must have four arguments.  If the subjects are Token5e or Actor5e objects, need to change them
    // to token.id or actor.id values.
    //
    if (TL > 1) jez.trace(`${TAG} Running in 4 Argument mode`);
    let subject1 = getSubjectId(args[0])
    let effectName1 = args[1]
    let subject2 = getSubjectId(args[2])
    let effectName2 = args[3]
    if (!subject1 || !subject2) return  // subject will be false if could not be parsed
    if (TL > 1) jez.trace(`${TAG} Subject Id's: ${subject1}, ${subject2}`);
    function getSubjectId(subject) {
        const TAG = `${FNAME} getSubjectId |`
        if (typeof (subject) === "object") {                   // Hopefully we have a Token5e or Actor5e
            // if (subject.constructor.name === "Token5e" || subject.constructor.name === "Actor5e")
            //     return (subject.id)
            if (subject.constructor.name === "Token5e" ) return (subject.id)
            if (subject.constructor.name === "Actor5e" ) return (subject.uuid)
            return jez.badNews(`${TAG} subject (${subject.name}) is object but not Token5e or Actor5e`)
        }
        if ((typeof (subject) === "string") && (subject.length === 16)) return (subject)
        return jez.badNews(`${TAG} subject (${subject}) could not be parsed`)
    }
    //-----------------------------------------------------------------------------------------------
    // If we are in uuidMode, call the runAsGM wrapper macro with the two arguments and quit
    //
    if (TL > 1) jez.trace(`${TAG} Inputs to GM_PAIR_EFFECTS.execute`,
        'subject1', subject1,
        'effectName1', effectName1,
        'subject2', subject2,
        'effectName2', effectName2)
    GM_PAIR_EFFECTS.execute(subject1, effectName1, subject2, effectName2)
}