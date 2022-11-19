const MACRONAME = "RollInitiativeAsGM.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Run this macro with "Execute as GM" checked
 * 
 * This macro should receive one or more combatabt Ids (16 character Ids), that should be pushed
 * into an array and then forced to roll initiative
 * 
 * args[0] should be a combatant id (this is not a token id)
 * args[1] is optional, if used would be forumala for roll, e.g. "20" to force a 20 result.
 * 
 * 11/18/22 0.1 Creation of Macro from ToggleCombatAsGM.0.1.js 11/18/22
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------
// Toss arg[0] which could be an array to game.combat.rollInitiative()
//
let combatDoc = await game.combat.rollInitiative(args[0], {formula: args[1], updateTurn: true, 
    messageOptions: { rollMode: CONST.DICE_ROLL_MODES.PRIVATE }})
