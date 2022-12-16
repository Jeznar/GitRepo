const MACRONAME = "Remove_Combatants.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 
 * Utility function that seeks to remove various hard coded combatants from combat
 * 
 * 1. Get all of the tokens on scene into an array
 * 2. Build list of those in combat by testing _token.combatant --> True indicates combat
 * 3. Loop through combatants testing against hardcoded exclusion list
 *    a. Remove them from combat _token.toggleCombat();
 *    b. Append to results message
 * 4. Post results
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
// Sparky gets his own extra special case in code below, so don't include in EXCLUDE_NAMES
const EXCLUDE_NAMES = ['Flopsy', 'Rogue', 'Vindy', 'Torch']
const EXCLUDE_SUBNAMES = [ 'Dancing Light']
const ICON = `Icons_JGB/Conditions/No_Combat.png`
let combatants = []
let msg = ""
const TL = 5
//-----------------------------------------------------------------------------------------------------------------------------------
// Get all of the tokens on scene into an array
//
const TOKENS = await canvas.tokens.placeables;
//-----------------------------------------------------------------------------------------------------------------------------------
// Build list of those in combat by testing _token.combatant --> True indicates combat
//
for (let i = 0; i < TOKENS.length; i++) if (TOKENS[i].combatant) combatants.push(TOKENS[i])
//-----------------------------------------------------------------------------------------------------------------------------------
// Loop through combatants testing against hardcoded (yuck!) exclusion list
//   a. Remove them from combat
//   b. Append to results message
//
if (combatants.length > 0) for (let i = 0; i < combatants.length; i++) {
    console.log(`Combatant ${i}`,combatants[i].name)
    if (exclude(combatants[i].name)) {
        await jez.wait(100)
        if (TL > 2) jez.trace(`Remove ${combatants[i].name} from combat`, combatants[i] )
        await combatants[i].toggleCombat();
        msg += ` - ${combatants[i].name}<br>`
    }
    // Special handling for Sparky, CAM's wildfire spirit who is supposed to be right after her in combat.
    if (combatants[i].name === "Sparky") {
        console.log('Need to handle Sparky')
        await specialCaseSparky()
        await jez.wait(100)
    }
}
//-----------------------------------------------------------------------------------------------------------------------------------
// Post results
//
if (msg) msg = `Removed Following from Combat Tracker<br><br>${msg}`
else msg = `No extraneous combatants found`
jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: ICON, msg: msg, title: "Remove Extraneous Combatants", token: null})
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check name received against exclusion logic, returning true if combatant should be removed from combat.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
 function exclude(name) {
    if (EXCLUDE_NAMES.includes(name)) return true
    for (let j = 0; j < EXCLUDE_SUBNAMES.length; j++) if (name.includes(EXCLUDE_SUBNAMES[j])) return true
    return false
 }
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Wildfire Spirit needs to have initiative set to just after its summoner.  In this case, we're setting up a very hard coded 
 * special case for CAM and Sparky
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function specialCaseSparky() {
    const MASTER_NAME = "CAM"
    const MINION_NAME = "Sparky"
    //-------------------------------------------------------------------------------------------------------------------------------
    // Need to fetch CAM's initiative value
    //
    await jez.wait(100)
    const MASTER_TOKEN = await canvas.tokens.placeables.find(ef => ef.name === MASTER_NAME)
    console.log('MASTER_TOKEN', MASTER_TOKEN)
    const MASTER_INIT = MASTER_TOKEN?.combatant?.data?.initiative
    console.log('MASTER_INIT',MASTER_INIT)
    if (!MASTER_INIT) return
    //-------------------------------------------------------------------------------------------------------------------------------
    // Make sure MINION is already in tracker 
    //
    const MINION_TOKEN = await canvas.tokens.placeables.find(ef => ef.name === MINION_NAME)
    console.log('MINION_TOKEN', MINION_TOKEN)
    //-------------------------------------------------------------------------------------------------------------------------------
    // calculate MINION's intitiative needed to be to just after MASTER
    //
    const MINION_INIT = MASTER_INIT - 0.001
    console.log('MINION_INIT',MINION_INIT)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Adjust MINION's intitiative to just after MASTER
    //
    console.log('MINION_TOKEN.id',MINION_TOKEN.id)
    // await jez.wait(250)
    await combatInitiative([MINION_TOKEN.id], { formula: MINION_INIT, reroll: true, traceLvl: TL })
    await jez.wait(100)
}


// static async combatInitiative(SUBJECT, options = {}) {
async function combatInitiative(SUBJECT, options = {}) {
    const FUNCNAME = "combatInitiative(SUBJECT, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `jez.lib ${FNAME} |`
    const TL = options.traceLvl ?? 0
    const REROLL = options.reroll ?? false
    let formula = options.formula ?? null  // Used to force a roll result, e.g. 20
    if (TL === 2) jez.trace(`${TAG} --- Starting --- ${FNAME} ---`);
    if (TL > 2) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
        "SUBJECT ==>", SUBJECT, "options ==>", options, 'TL', TL, 'REROLL', REROLL);
    //----------------------------------------------------------------------------------------------
    // Define Variables
    //
    let combatantIds = []
    //----------------------------------------------------------------------------------------------
    // Grab the RunAsGM Macros
    //
    const GM_ROLL_INITIATIVE = jez.getMacroRunAsGM("RollInitiativeAsGM")
    if (!GM_ROLL_INITIATIVE) { return false }
    //----------------------------------------------------------------------------------------------
    // If input Formula is a number, flip it to a string
    //
    if (typeof formula === 'number') formula = formula.toString();
    //----------------------------------------------------------------------------------------------
    // Validate SUBJECT received, it can be a single or array of the following types:
    // Token5e data object, Token Document obj, token.document.uuid, token.id (all must be same type)
    // and build array of combatant Ids.
    //
    if (jez.typeOf(SUBJECT) === "array")   // Processing an array of critters
        for (let i = 0; i < SUBJECT.length; i++) {
            combatantIds.push(await processOneEntity(SUBJECT[i], { traceLvl: TL, reroll: REROLL }))
        }
    else {
        combatantIds.push(await processOneEntity(SUBJECT, { traceLvl: TL, reroll: REROLL }))
    }
    //----------------------------------------------------------------------------------------------
    // Make call to roll initiatives
    //
    if (TL > 2) jez.trace(`${TAG} Call GM_ROLL_INITIATIVE`,'combatantIds',combatantIds,'formula',formula)
    await GM_ROLL_INITIATIVE.execute(combatantIds, formula)
    //----------------------------------------------------------------------------------------------
    // Process a single entity, may need to call for each element of an array
    //
    async function processOneEntity(SUBJECT, options = {}) {
        const FUNCNAME = "processOneEntity(SUBJECT, options = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez-lib ${FNAME} |`
        const TL = options.traceLvl ?? 0
        const REROLL = options.reroll ?? false
        if (TL === 2) jez.trace(`${TAG} --- Starting --- ${FNAME} ---`);
        if (TL > 2) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
            "SUBJECT ==>", SUBJECT, "options ==>", options, 'TL', TL, 'REROLL', REROLL);
        //----------------------------------------------------------------------------------------------
        // Determine the type of Subject
        //
        // let subjectType = jez.typeOf(SUBJECT)
        let subjectType = ""
        if (jez.typeOf(SUBJECT) === "object") {
            if (SUBJECT?.constructor?.name === "Token5e") subjectType = `Token5e`
            if (SUBJECT?.constructor?.name === "TokenDocument5e") subjectType = `TokenDocument5e`
        } else if (jez.typeOf(SUBJECT) === "string") {
            if (SUBJECT.length === 16) subjectType = `token.id`
            else if (SUBJECT.length === 45) subjectType = `token.document.uuid`
            else subjectType = `Garbage`
        } else subjectType = `Garbage`
        if (TL > 0) jez.trace(`${TAG} Processing ${subjectType}`, SUBJECT)
        if (subjectType === 'Garbage') return jez.badNews(`Seemingly passed some icky junk: ${SUBJECT}`)
        //----------------------------------------------------------------------------------------------
        // Need to extract a combatantId from SUBJECT data
        //
        let combatantId
        let initiative
        switch (subjectType) {
            case 'Token5e':
                if (!SUBJECT?.combatant?.id) return (null)
                combatantId = SUBJECT?.combatant?.id
                initiative = SUBJECT?.combatant?.data?.initiative
                break;
            case 'TokenDocument5e':
                if (!SUBJECT?.combatant?.id) return (null)
                combatantId = SUBJECT?.combatant?.id
                initiative = SUBJECT?.combatant?.data?.initiative
                break;
            case 'token.id':
                let dToken = await canvas.tokens.placeables.find(ef => ef.id === SUBJECT)
                if (!dToken?.combatant?.id) return (null)
                combatantId = dToken?.combatant?.id
                initiative = dToken?.combatant?.data?.initiative
                break;
            case 'token.document.uuid':
                let dTokenDocument5e = await fromUuid(SUBJECT)
                if (!dTokenDocument5e?.combatant?.id) return (null)
                combatantId = dTokenDocument5e?.combatant?.id
                initiative = dTokenDocument5e?.combatant?.data?.initiative
                break;
            default:
                return jez.badNews(`This should not happen! Choked on ${SUBJECT}`)
        }
        if (initiative && !REROLL) {
            if (TL > 2) jez.trace(`${TAG} Skipping ${dToken.name} already has an initiatve ${initiative} value and REROLL not specified`)
            return (null)
        }
        if (TL > 0) jez.trace(`${TAG} combatantId`, combatantId)
        if (TL > 2) jez.trace(`${TAG} Returning combatantId (${combatantId}) to roll initiatve`)
        return (combatantId)
    }
}