const UUID = "Scene.MzEyYTVkOTQ4NmZk.Token.cBMsqVwfwf1MxRxV"

// let aTokenDocument5e = await fromUuid(UUID)     // Retrieves document for the UUID
// let aToken = aTokenDocument5e._object           // Nabs the Token5e out of a aTokenDocument5e
// jez.log("aTokenDocument5e", aTokenDocument5e)
// jez.log("aToken", aToken)


let uuid = canvas.tokens.controlled[0].document.uuid
let aTokenDocument5e = await fromUuid(uuid)     // Retrieves document for the UUID
let aToken = aTokenDocument5e._object           // Nabs the Token5e out of a aTokenDocument5e
jez.log("aTokenDocument5e", aTokenDocument5e)
jez.log("aToken", aToken)