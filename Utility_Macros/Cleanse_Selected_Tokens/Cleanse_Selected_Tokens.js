/**************************************************************
 * Macro to remove all temprary condtions from selected tokens  
 * 
 * 10/26/21 0.1 JGB Creation 
 * 05/02/22 0.2 JGB Updated for 9.x
 *************************************************************/
 const macroName = "Cleanse_Selected_Tokens_0.1"
 const debug = true; 
 const tempOnly = true;

 if (debug) console.log("Starting: " + macroName); 
 
 for ( let token of canvas.tokens.controlled ){
    if (debug) console.log(`Cleanse: ${token.name}`);
    if (tempOnly) {             // Remove temp affects
        await cleanse(token);
    } else {                    // Remove all effects 
        // This fork seems broken.  
        await token.document.update({"effects": []}); 
    }
 }

/*************************************************************/
/*** Remove all temporary effects from the passed token    ***/
/*************************************************************/
async function cleanse(token) {
    let removeList=token?.actor?.temporaryEffects.map(e=>e.id)
    token?.actor?.deleteEmbeddedDocuments("ActiveEffect", 
        removeList)
}