for ( let token of canvas.tokens.controlled ){
    console.log(`Process: ${token.name}`, token);
    console.log(`  token.actor.uuid`, token.actor.uuid);
    console.log(await getTokenObjFromUuid(token.actor.uuid, {traceLvl:0}))
}




/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********
 * Obtain and return Token5e or PrototypeTokenData object asociated with the uuid passed into this 
 * function. UUID is assumed to look like one of the following:
 * 
 *   Linked Actor Item  : Actor.lZ487ouiBiQs3lql.Item.fyhrudodjr8ooucb
 *   Unlinked Actor Item: Scene.MzEyYTVkOTQ4NmZk.Token.lZ487ouiBiQs3lql.Item.fyhrudodjr8ooucb
 * 
 * This function works by starting on the left and processing the UUID until a result is found so 
 * shorter UUIDs like these, also work:
 * 
 *   Linked Actor  : Actor.lZ487ouiBiQs3lql
 *   Unlinked Actor: Scene.MzEyYTVkOTQ4NmZk.Token.lZ487ouiBiQs3lql
 * 
 * Return: Token5e or PrototypeTokenData object.  If function fails, return false
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function getTokenObjFromUuid(uuid, optionObj = {}) {
    const FUNCNAME = "getTokenObjFromUuid(uuid, optionObj = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TL = optionObj?.traceLvl ?? 0
    if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "uuid", uuid, "optionObj", optionObj);
    let sUuid = null    // Sought after UUID
    let sToken = null   // Sought Token5e data object
    //-----------------------------------------------------------------------------------------------
    // Split the UUID up into tokens.  Bail out if odd number of tokens found
    //
    if (TL > 2) jez.trace(`${FNAME} | Our UUID of interest`, uuid);
    const UUID_ARRAY = uuid.split(".")
    let length = UUID_ARRAY.length
    if (TL > 4) for (let i = 0; i < length; i++)
        jez.trace(`${FNAME} | Part ${i} of uuid`, UUID_ARRAY[i]);
    if (length % 2) return jez.badNews(`${FNAME} | Passed UUID has odd number of tokens: ${uuid}`, "e")
    //-----------------------------------------------------------------------------------------------
    // Build the sought for UUID (sUuid)
    //
    if (UUID_ARRAY[0] === "Actor") {        // Apparently dealing with a linked Actor UUID
        if (UUID_ARRAY[1].length !== 16)
            return jez.badNews(`${FNAME} | Second token wrong length: ${uuid}`, "e")
        sUuid = `${UUID_ARRAY[0]}.${UUID_ARRAY[1]}`
    }
    else if (UUID_ARRAY[0] === "Scene") {   // Apparently dealing with an unlinked Actor UUID
        if (UUID_ARRAY[1].length !== 16)
            return jez.badNews(`${FNAME} | Second token (${UUID_ARRAY[1]}) wrong length: ${uuid}`, "e")
        if (UUID_ARRAY[2] !== "Token")
            return jez.badNews(`${FNAME} | Third token (${UUID_ARRAY[2]}) not "Token": ${uuid}`, "e")
        if (UUID_ARRAY[3].length !== 16)
            return jez.badNews(`${FNAME} | Forth token (${UUID_ARRAY[3]}) wrong length: ${uuid}`, "e")
        sUuid = `${UUID_ARRAY[0]}.${UUID_ARRAY[1]}.${UUID_ARRAY[2]}.${UUID_ARRAY[3]}`
    }
    if (!sUuid) return jez.badNews(`${FNAME} | Received UUID not parsed: ${uuid}`, "e");
    //-----------------------------------------------------------------------------------------------
    // Obtain the sought after token data (sToken) data object, looking different places for different
    // object types that can be found.
    //
    let oDataObj = await fromUuid(sUuid)    // Retrieves data object for the UUID
    if (oDataObj?.constructor.name === "TokenDocument5e") {
        if (TL > 2) jez.trace(`${FNAME} | Found a TokenDocument5e, must be unlinked caster`, oDataObj);
        sToken = oDataObj._object           // Nab the Token5e out of aTokenDocument5e
    }
    else if (oDataObj?.constructor.name === "Actor5e") {
        if (TL > 2) jez.trace(`${FNAME} | Found a Actor5e, must be linked caster`, oDataObj);
        sToken = oDataObj.data.token        // PrototypeTokenData object
    }
    else return jez.badNews(`${FNAME} | Obtained neither TokenDocument5e nor Actor5e from ${oDataObj}`, "e")
    if (TL > 4) jez.trace(`${FNAME} | sToken`, sToken)
    if (TL > 2) jez.trace(`${FNAME} | sToken.name`, sToken.name)
    return (sToken)
}