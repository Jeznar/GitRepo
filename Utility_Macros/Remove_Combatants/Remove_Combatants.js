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
        await jez.wait(250)
        if (TL > 2) jez.trace(`Remove ${combatants[i].name} from combat`, combatants[i] )

        jez.combatAddRemove("Remove", combatants[i], {traceLvl: TL})

        // let rc = await combatants[i].toggleCombat();
        // console.log(`combatants[i].toggleCombat() returned`,rc)
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
    await jez.combatInitiative([MINION_TOKEN.id], { formula: MINION_INIT, reroll: true, traceLvl: TL })
    await jez.wait(100)
}