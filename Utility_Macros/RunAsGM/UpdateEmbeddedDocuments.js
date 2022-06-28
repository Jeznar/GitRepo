const MACRONAME = "UpdateEmbeddedDocuments.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro will update embedded documents per the passed arguments
 * 
 * args[0] = string naming the type of document, e.g. Token
 * args[1] = update object to be applied
 * 
 * 06/28/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

if (jez.typeOf(args[0]) != "string") return jez.badNews(`${this.name}'s arg[0] must be a string naming a document type.`);
if (jez.typeOf(args[1]) != "array")  return jez.badNews(`${this.name}'s arg[1] must be an array of object with updates.`);

await game.scenes.current.updateEmbeddedDocuments(args[0], args[1])
