const MACRONAME = "Remove_Paired_Effect.0.4.js"
/*****************************************************************************************
 * Remove the specified  effect. 
 * 
 * First argument is the type of exectution, "off" being what we are needing.
 * Last argument is the DAE data blob that is not used.
 * 
 * If three argument supplied it must be an ActiveEffect UUID, of the form: 
 *    Scene.MzEyYTVkOTQ4NmZk.Token.pcAVMUbbnGZ1lz4h.ActiveEffect.1u3e6c1os77qhwha
 * 
 * If four arguments are provided:
 *    args[1] - token or actor id (16 character identifier)
 *    args[2] - effect id to be removed
 * 
 * 06/03/22 0.1 Creation of Macro
 * 06/04/22 0.2 Removal of uneccesary comments and such
 * 06/09/22 0.3 Accept either a token or actor id
 * 07/07/22 0.4 Added (preferred) option of supplying UUID of the effect
 *****************************************************************************************/
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
if (args[0] === "off") {  // Only execute this when removed from Token
    //------------------------------------------------------------------------------------
    // Random wait mitigates a race error caused by a DAE bug that executes each 
    // macro.execute for each line in an effect.  I have opened an issue on gitlab.
    // https://gitlab.com/tposney/dae/-/issues/319
    await jez.wait(Math.floor(Math.random() * 500))
    //------------------------------------------------------------------------------------
    if (args.length === 3) {
        const EFFECT = await fromUuid(args[1])
        jez.log("EFFECT", EFFECT)
        if (EFFECT) EFFECT.delete()
    }
    else {
        if (args.length === 4) {
            let fetchedToken = canvas.tokens.placeables.find(ef => ef.id === args[1])
            jez.log(`fetchedToken ${fetchedToken?.name}`, fetchedToken)
            if (fetchedToken) {
                let existingEffect = await fetchedToken.actor.effects.find(i => i.id === args[2]);
                if (existingEffect) await existingEffect.delete()
            }
            else {
                let fetchedActor = canvas.tokens.placeables.find(ef => ef.data.actorId === args[1]).actor
                jez.log(`fetchedActor ${fetchedActor?.name}`, fetchedActor)
                if (fetchedActor) {
                    jez.log("fetchedActor.effects", fetchedActor.effects)
                    let existingEffect = await fetchedActor.effects.find(i => i.id === args[2]);
                    if (existingEffect) {
                        jez.log("existingEffect to be deleted", existingEffect)
                        await existingEffect.delete()
                    }
                }
            }
        }
        else jez.badNews(`Bad Arguments received by Remove_Paired_Effect, count ${args.length}`,"error")
    }
}
jez.log(`============== Finished === ${MACRONAME} =================`);