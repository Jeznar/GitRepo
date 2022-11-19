const MACRONAME = "ToggleCombatAsGM.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Run this macro with "Execute as GM" checked
 * 
 * args[0] = Token Uuid // 'Scene.MzEyYTVkOTQ4NmZk.Token.8iYyVcseEwCHAQG7'
 * 
 * 11/18/22 0.1 Creation of Macro from TokenUpdate.0.1.js 11/14/22
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------
// If we have received a token Uuid, use it to togglecombat
//
const UUID_TOKENS = args[0].split(".")
if (UUID_TOKENS[0] === 'Scene' && UUID_TOKENS[1].length === 16 &&
    UUID_TOKENS[2] === 'Token' && UUID_TOKENS[3].length === 16) {
        let myTokenDocument5e = await fromUuid(args[0])      // Retrieves document for the UUID
        let myToken = myTokenDocument5e._object              // Nabs the Token5e out of a aTokenDocument5e
        console.log(`${MACRO} | myToken`,myToken)
        myToken.toggleCombat()
}
else return jez.badNews(`${MACRO} received non-tokenUuid as argument`,"e")