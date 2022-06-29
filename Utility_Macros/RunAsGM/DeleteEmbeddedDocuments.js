const MACRONAME = "DeleteEmbeddedDocuments.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro will delete embedded documents per the passed arguments
 * 
 * args[0] = string naming the type of document, e.g. Tile
 * args[1] = array of ids to be deleted
 * 
 * 06/28/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 0;
jez.trc(1,trcLvl,`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.trc(2,trcLvl,`  args[${i}]`, args[i]);
if (jez.typeOf(args[0]) != "string") return jez.badNews(`${this.name}'s arg[0] must be a string naming a document type.`);
if (jez.typeOf(args[1]) != "array")  return jez.badNews(`${this.name}'s arg[1] must be an array of id's to delete.`);
await game.scenes.current.deleteEmbeddedDocuments(args[0], args[1])