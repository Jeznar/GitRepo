const MACRONAME = "test_getActor5eDataObj"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro tests the getActor5eDataObj function
 * 
 * 06/29/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const TL = 0
let sToken = canvas.tokens.controlled[0]
if (!sToken) return jez.badNews(`Must select a token for this to run`, 'e')
console.log(`Selected Token ${sToken.name}`)
//---------------------------------------------------------------------------------------------------
// 
//
testIt('sToken Obj', sToken)
testIt('sToken.id', sToken.id)
testIt('sToken.actor', sToken.actor)
testIt('sToken.actor.id', sToken.actor.id)
testIt('sToken.actor.uuid', sToken.actor.uuid)
return

async function testIt(inputName, inputValue) {
    let rc = await jez.getActor5eDataObj(inputValue, {traceLvl: TL})
    console.log(`testIt(${inputName}, ${inputValue}) ${rc?.name} got`, rc)
}