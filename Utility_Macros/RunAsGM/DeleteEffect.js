const MACRONAME = "DeleteEffect.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro will delete an effect...
 * 
 * args[0] = UUID of effect to be deleted, example:
 *           Scene.MzEyYTVkOTQ4NmZk.Token.KVTYA7FwushIK9h9.ActiveEffect.ztlq9s7jopvvevn9
 * 
 * 11/01/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const EFFECT = await fromUuid(args[0])
EFFECT.delete()