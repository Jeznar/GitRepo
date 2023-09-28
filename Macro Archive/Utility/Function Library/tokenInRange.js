let sel = canvas.tokens.controlled[0];
jez.log(`Measuring from ${sel.name}`)
let range = 10
let inRangers = await jez.tokensInRange(sel, range)
jez.log(``)
jez.log("Tokens in Range",inRangers)
let msg = "";

let inRangeCount = inRangers?.length
if (inRangeCount) {
    msg = `Total of ${inRangeCount} target(s) within ${range}ft of ${sel.name}<br><br>`
    for (let i = 0; i < inRangeCount; i++) {
        msg += ` ${i + 1}) ${inRangers[i].name}<br>`
    }
} else {
    msg = `No Targets are within ${range}ft of ${sel.name}` 
}
let chatMessage = await game.messages.get(args[args.length - 1].itemCardId);
jez.addMessage(chatMessage, {color:"darkblue", fSize:14, msg:msg, tag:"saves" })

/***************************************************************************************************
 * tokensInRange
 * 
 * Function that returns an array of the tokens that are within a specified range -or- null if no
 * tokens are in range from the specified token. Exclude the origin token.
 ***************************************************************************************************/
async function tokensInRange(sel, range) {
    let inRangeTokens = [];
    let toFarCnt, inRangeCnt = 0
    let toFar = ""
    let fudge = 4 //fudge factor to allow diagonals to work better
    //----------------------------------------------------------------------------------------------
    // Check the types of parameters passed 
    //
    if (sel?.constructor.name !== "Token5e") {
        let msg = `Coding error. Selection (${sel}) is a ${sel?.constructor.name} must be a Token5e`
        ui.notifications.error(msg)
        jez.log(msg)
        return (null)
    }
    if (typeof (range) !== "number") {
        let msg = `Coding error. Range (${range}) is a ${typeof (range)} must be a number`
        ui.notifications.error(msg)
        jez.log(msg)
        return (null)
    }
    //----------------------------------------------------------------------------------------------
    // Perform the interesting bits
    //
    canvas.tokens.placeables.forEach(token => {
        let d = canvas.grid.measureDistance(sel, token);
        d = d.toFixed(1);
        if (sel === token) { // Skip the origin token
            jez.log(` Skipping the origin token, ${sel.name}`,"sel",sel,"token",token)
        } else {
            jez.log(` Considering ${token.name} at ${d} distance`);
            if (d > range + fudge) {
                jez.log(`  ${token.name} is too far away`);
                if (toFarCnt++) { toFar += ", " };
                toFar += token.name;
                jez.log(`  To Far #${toFarCnt} ${token.name} is ${d} feet. To Fars: ${toFar}`);
            } else {
                jez.log(`  ${token.name} is in range`);
                inRangeTokens.push(token);
                jez.log(`  In Range #${++inRangeCnt} ${token.name} is ${d} feet. In Ranges:`, inRangeTokens);
            }
        }
    });
    if (!inRangeCnt) return (null)
    return (inRangeTokens)
}