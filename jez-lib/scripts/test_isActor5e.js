for ( let token of canvas.tokens.controlled ){
    console.log(`Testing token ${token.name}`,token)
    console.log("jez.isActor5e(token)", token, jez.isActor5e(token))
    console.log(`jez.isActor5e(${token?.name})`, token?.name, jez.isActor5e(token?.name))
    console.log("jez.isActor5e(token.actor)", token.actor, jez.isActor5e(token.actor))
    console.log(`jez.isActor5e(${token?.actor?.name})`,token?.actor?.name, jez.isActor5e(token?.actor?.name))
}
/***************************************************************************************************
 * Test to see is the passed argument is a Token5e object. Return true it is; otherwise false
 ***************************************************************************************************/
function isActor5e(obj) {
    if (obj?.constructor.name === "Actor5e") return(true)
    return(false)
}