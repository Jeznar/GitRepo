const MACRONAME = "dismiss_tokens.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Macro to be called with a list of token UUID's that will be dismissed
 * 
 * UUIDs must be of the form: Scene.<scene ID>.Token.<token ID>
 *  
 * e.g. Scene.MzEyYTVkOTQ4NmZk.Token.jMrQNpQTkteJJoaW 
 *      Scene.MzEyYTVkOTQ4NmZk.Token.7fmaYOm5uCIO8bvE
 * 
 * 06/24/22 0.1 Creation of Macro
 * 07/21/22 0.2 Update for new library functions
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
if (args[0] === "off") await doOff();             // DAE removal
async function doOff() {
    for (let i = 1; i <= args.length - 2; i++) {
        jez.log(`Dismiss Token #${i}`, args[i])
        let parts = args[i].split(".")
        await jez.wait(500)
        let token5e = canvas.tokens.placeables.find(ef => ef.id === parts[3])
        if (token5e) jez.vfxPostSummonEffects({x: token5e.x+token5e.w/2, y:token5e.y+token5e.h/2})
        await jez.wait(200)
        warpgate.dismiss(parts[3], parts[1])
    }
}