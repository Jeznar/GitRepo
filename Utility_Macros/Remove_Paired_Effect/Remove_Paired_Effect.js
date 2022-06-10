const MACRONAME = "Remove_Paired_Effect.0.3.js"
/*****************************************************************************************
 * Remove the effect specified in args[2] from token identified in args[1]. Both args
 * are to be 16 character identifiers.
 *
 * 06/03/22 0.1 Creation of Macro
 * 06/04/22 0.2 Removal of uneccesary comments and such
 * 06/09/22 0.3 Accept either a token or actor id
 *****************************************************************************************/
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
if (args[0] === "off") {  // Only execute this when removed from Token
    let fetchedToken = canvas.tokens.placeables.find(ef => ef.id === args[1])
    jez.log("fetchedToken", fetchedToken)
    if (fetchedToken) {
        let existingEffect = await fetchedToken.actor.effects.find(i => i.id === args[2]);
        if (existingEffect) await existingEffect.delete()
    }
    else {
        //let fetchedActor = game.actors.get(args[1])
        let fetchedActor = canvas.tokens.placeables.find(ef => ef.data.actorId === args[1]).actor
        jez.log("fetchedActor", fetchedActor)
        if (fetchedActor) {
            let existingEffect = await fetchedActor.effects.find(i => i.id === args[2]);
            if (existingEffect) await existingEffect.delete()
        }
    }
}
jez.log(`============== Finished === ${MACRONAME} =================`);
