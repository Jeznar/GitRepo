const MACRONAME = "Open Sheet With....0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * This macro is intented to make "fixes" for misconfigured actors quicker to find. It does the following:
 *  1. checks every actor in the side bar against the thisOne() function. 
 *  2. Creates a dialog showing all the actors that matched 
 *  3. Opens the sheets slected by the user on screen for manual attention.
 * 
 * It should be run from the macro folder or the hot bar.
 * 
 * 12/19/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro Globals
//
let actorsWith = []         // array to hold actor data objects that passed the thisOne() test
let actorIdObj = {}       // Object with actor names as keys to their id values
//-----------------------------------------------------------------------------------------------------------------------------------
// Check all actors in the actor directory against our thisOne() function making an array of those that passed the check
//
const ALL_ACTORS = game.actors;
for (let entity of ALL_ACTORS) {
    if (await thisOne(entity, { traceLvl: TL })) {
        if (TL > 3) console.log(`Passed this one: ${entity.name} ${entity.id}`)
        actorsWith.push(entity.name);
        if (actorIdObj[entity.name]) jez.badNews(`${TAG} ${entity.name} is not unique in actor directory`, 'w')
        actorIdObj[entity.name] = entity.id
    }
}
if (!actorsWith.length) return jez.badNews(`No Actor passed the screening test`, 'i')
console.log('Results', actorIdObj)
//--------------------------------------------------------------------------------------------
// Pop a dialog asking user to pick actors to open
//
const Q_TITLE = `${actorsWith.length} Actors Passed Test, Open Which?`
const Q_TEXT = `Choose the actor(s) to have their sheet opened on screen.`
const SELECTIONS = await jez.pickCheckListArray(Q_TITLE, Q_TEXT, null, actorsWith);
if (!SELECTIONS) return jez.badNews(`${TAG} Operation Cancelled: Cancel Button Pressed`, 'w')
if (SELECTIONS.length === 0) return jez.badNews(`${TAG} Operation Cancelled: No Actor Selected`, 'w')
if (TL > 0) console.log(`Selections`, SELECTIONS)
//-----------------------------------------------------------------------------------------------------------------------------------
// Open sheets of the selected
//
for (let i = 0; i < SELECTIONS.length; i++) {
    const SUBJECT = SELECTIONS[i]
    if (TL > 0) console.log(`${TAG} Process: ${SUBJECT} ${actorIdObj[SUBJECT]}`)
    game.actors.get(actorIdObj[SUBJECT]).sheet.render(true);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Trait field names:
 *  di: Damage Immunity 
 *  dr: Damage Resistance 
 *  dv: Damage Vulnerability
 *  ci: Condition Immunity
 *  languages: 
 *  size: 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function thisOne(actor, options = {}) {
    const FUNCNAME = "thisOne(actor, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 3) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 3) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    const FIELD = 'languages'  // Plug in right field name for your test
    //-------------------------------------------------------------------------------------------------------------------------------
    // Return true if: Actor is an NPC and has custom FIELD text field contents
    //
    // let testField = actor.data.data.traits[FIELD]?.custom
    // if (await jez.isNPC(actor.uuid))
    //     if (jez.typeOf(testField) === 'string' && testField.length > 0) { 
    // let testField = actor.data.data.traits[FIELD]?.custom
    //         // if (testField.includes("Thie") && FIELD === "languages") return true
    //         if (TL > 1) jez.trace(`${TAG} PASSED: ${actor.name}`, testField);
    //         return true
    //     }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Return true if: Actor is an NPC and has the MAGIC_WORD damage resistance checked
    //
    // const MAGIC_WORD = "unconscious"
    // let testField = actor.data.data.traits[FIELD]?.value
    // if (await jez.isNPC(actor.uuid)) {
    //     if (actor.name === `Giant Eagle`) console.log(`${ actor.name } passed NPC check`)
    //     if (testField.includes(MAGIC_WORD)) {
    //         if (TL > 3) jez.trace(`${ TAG } PASSED: ${ actor.name } `, testField);
    //         return true
    //     }
    // }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Fish about based on displayName setting.
    //
    // token.data.displayName: 0 // Name Visible - Never
    // token.data.displayName: 40 // Name Visible - always for owner
    // token.data.displayName: 30 // Name Visible - hovered by anyone
    // let testField = actor.data.token.displayName
    // if (testField === 0 ) return true
    //-------------------------------------------------------------------------------------------------------------------------------
    // Look for tokens set to have vision 
    //
    // let testField = actor.data.token.vision
    // if (await jez.isNPC(actor.uuid)) {
    //     if (testField) return true
    // }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Look for tokens that have odd barX.attribute values
    //
    // let testField = actor.data.token.bar2.attribute 
    // if (testField === "" || testField === null ) return false
    // else return true
    //-------------------------------------------------------------------------------------------------------------------------------
    // Fish about based on displayBars setting.  30 is what I normally use
    //
    let testField = actor.data.token.displayBars
    if (testField !== 30 ) return true
    return false
}