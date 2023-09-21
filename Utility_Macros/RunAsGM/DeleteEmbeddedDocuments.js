const MACRONAME = "DeleteEmbeddedDocuments.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro will delete embedded documents per the passed arguments
 * 
 * args[0] = string naming the type of document, e.g. Tile
 * args[1] = array of ids to be deleted
 * 
 * 06/28/22 0.1 Creation of Macro
 * 09/21/23 0.2 Replace jez.trc with jez.log
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
let TL = 0;
if (TL > 0) jez.log(`=== Starting === ${MACRONAME} ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
if (jez.typeOf(args[0]) != "string") return jez.badNews(`${this.name}'s arg[0] must be a string naming a document type.`);
if (jez.typeOf(args[1]) != "array")  return jez.badNews(`${this.name}'s arg[1] must be an array of id's to delete.`);
let rc = await game.scenes.current.deleteEmbeddedDocuments(args[0], args[1])
if (TL > 1) jez.log(`=== Completed === ${MACRONAME} ===`, rc);
