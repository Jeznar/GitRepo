const MACRONAME = "Cleanse_Selected_Tokens.0.3.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Macro to remove all temprary condtions from selected tokens  
 * 
 * 10/26/21 0.1 JGB Creation 
 * 05/02/22 0.2 JGB Updated for 9.x
 * 12/19/22 0.3 JGB Added check to handle no tokens selected and a summary message
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 1;                               // Trace Level for this macro
let msg = "";                               // Global message string
let msgBody = "";
const tempOnly = true;

//  console.log(selectedTokens(MACRO))
const TOKEN_COUNT = jez.selectedTokens(MACRO)
if (TOKEN_COUNT) {
    for (let token of canvas.tokens.controlled) {
        msgBody += `<br>${token.name}`
        if (tempOnly) {             // Remove temp affects
            if (TL > 1) jez.trace(`${TAG}Cleanse temp effects on: ${token.name}`);
            await cleanse(token);
        } else {                    // Remove all effects 
            // This fork seems broken.  
            if (TL > 1) jez.trace(`${TAG} Cleanse all effects on: ${token.name}`);
            await token.document.update({ "effects": [] });
        }
    }
    msg = `Cleaned effects on ${TOKEN_COUNT} tokens<br>${msgBody}`
    jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: 'Icons_JGB/Misc/Jez.png', title: 'Cleanse Complete', msg: msg})
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Remove all temporary effects from the passed token  
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function cleanse(token) {
    let removeList = token?.actor?.temporaryEffects.map(e => e.id)
    token?.actor?.deleteEmbeddedDocuments("ActiveEffect",
        removeList)
}