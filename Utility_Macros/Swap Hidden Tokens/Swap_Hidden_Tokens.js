const MACRONAME = "Swap_Hidden_Tokens"
jez.log(MACRONAME)
/*****************************************************************************************
 * This macro changes the hidden/visible state of all non-character tokens in the 
 * current scene.  
 * 
 * Inspired by macro posted by u/vtsandtrooper on Reddit.
 *  https://www.reddit.com/r/FoundryVTT/comments/ps7v1q/battle_map_change_macro/
 *
 * 02/01/22 0.1 Creation of Macro
 *****************************************************************************************/
const updates = [];
let tokensSelectedCount = canvas.tokens.controlled.length
//----------------------------------------------------------------------------------------
// If one or more tokens are selected, swap their visibility state
//
if (tokensSelectedCount) {
    jez.log("Selected token count", canvas.tokens.controlled.length)
    for (let token of canvas.tokens.controlled) {
        jez.log(`${token.name} was hidden`, token.data.hidden)
        if (token.actor.data.type === "character") {
            jez.log(`${token.name} is a character, skipping swap`)
            continue;
        }
        let newSee = (token.data.hidden == true) ? false : true;
        updates.push({
            _id: token.id,
            hidden: newSee
        });
    }
}
//----------------------------------------------------------------------------------------
// If no tokens were selected, then swap all non-character tokens visibiity
//
// canvas.tokens.controlled -- all selected tokens on canvas
// canvas.tokens.placeables -- all tokens on canvas
//
if (!tokensSelectedCount) {
    for (let token of canvas.tokens.placeables) {
        jez.log(`${token.name} was hidden`, token.data.hidden)
        if (token.actor.data.type === "character") {
            jez.log(`${token.name} is a character, skipping swap`)
            continue;
        }
        let newSee = (token.data.hidden == true) ? false : true;
        updates.push({
            _id: token.id,
            hidden: newSee
        });
    };
}
// use canvas.tokens.updateMany instead of token.update to prevent race conditions
// (meaning not all updates will be persisted and might only show locally)
canvas.tokens.updateMany(updates);
return