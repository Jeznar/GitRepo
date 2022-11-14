/*** Remove_Combatants ***
 * Utility function that seeks to remove various hard coded combatants from combat
 * 
 * 1. Get all of the tokens on scene into an array
 * 2. Build list of those in combat by testing _token.combatant --> True indicates combat
 * 3. Loop through combatants testing against hardcoded exclusion list
 *    a. Remove them from combat _token.toggleCombat();
 *    b. Append to results message
 * 4. Post results
 * 
 ***/
const EXCLUDE_NAMES = ['Flopsy', 'Sparky', 'Rogue', 'Vindy']
const EXCLUDE_SUBNAMES = [ 'Dancing Light']
const ICON = `Icons_JGB/Conditions/No_Combat.png`
let combatants = []
let msg = ""
//---------------------------------------------------------------------------------------
// Get all of the tokens on scene into an array
//
const TOKENS = await canvas.tokens.placeables;
//---------------------------------------------------------------------------------------
// Build list of those in combat by testing _token.combatant --> True indicates combat
//
for (let i = 0; i < TOKENS.length; i++) if (TOKENS[i].combatant) combatants.push(TOKENS[i])
//---------------------------------------------------------------------------------------
// Loop through combatants testing against hardcoded (yuck!) exclusion list
//   a. Remove them from combat
//   b. Append to results message
//
if (combatants.length > 0) for (let i = 0; i < combatants.length; i++)
    if (exclude(combatants[i].name)) {
        await combatants[i].toggleCombat();
        msg += ` - ${combatants[i].name}<br>`
    }
//---------------------------------------------------------------------------------------
// Post results
//
if (msg) msg = `Removed Following from Combat Tracker<br><br>${msg}`
else msg = `No extraneous combatants found`
jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: ICON, 
                msg: msg, title: "Remove Extraneous Combatants", token: null})
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check name received against exclusion logic, returning true if combatant should be removed 
 * from combat.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 function exclude(name) {
    if (EXCLUDE_NAMES.includes(name)) return true
    for (let j = 0; j < EXCLUDE_SUBNAMES.length; j++) if (name.includes(EXCLUDE_SUBNAMES[j])) return true
    return false
 }