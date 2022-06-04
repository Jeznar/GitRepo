const MACRONAME = "Remove_Paired_Effect.0.2.js"
/*****************************************************************************************
 * Remove the effect specified in args[2] from token identified in args[1]. Both args 
 * are to be 16 character identifiers.
 * 
 * 06/03/22 0.1 Creation of Macro
 * 06/04/22 0.2 Removal of uneccesary comments and such
 *****************************************************************************************/
let fetchedToken = canvas.tokens.placeables.find(ef => ef.id === args[1])
if (fetchedToken) {
    let existingEffect = await fetchedToken.actor.effects.find(i => i.id === args[2]);
    if (existingEffect) await existingEffect.delete()
}