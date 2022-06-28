for ( let token of canvas.tokens.controlled ){
    console.log(`Testing token ${token.name}`,token)
    console.log("jez.isToken5e(token)", token, jez.isToken5e(token))
    console.log(`jez.isToken5e(${token?.name})`, token?.name, jez.isToken5e(token?.name))
    console.log("jez.isToken5e(token.actor)", token.actor, jez.isToken5e(token.actor))
    console.log(`jez.isToken5e(${token?.actor?.name})`,token?.actor?.name, jez.isToken5e(token?.actor?.name))
}
/***************************************************************************************************
 * Test to see is the passed argument is a Token5e object. Return true it is; otherwise false
 ***************************************************************************************************/
function isToken5e(obj) {
    if (obj?.constructor.name === "Token5e") return(true)
    return(false)
}