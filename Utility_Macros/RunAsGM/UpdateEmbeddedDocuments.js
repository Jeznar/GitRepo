const MACRONAME = "UpdateEmbeddedDocuments.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro will update embedded documents per the passed arguments
 * 
 * args[0] = string naming the type of document, e.g. Token
 * args[1] = update object to be applied
 * 
 * 06/28/22 0.1 Creation of Macro
 * 09/21/23 0.2 Updated for conditional logging
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
let TL = 0;
if (TL > 0) jez.log(`=== Starting === ${MACRONAME} ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

if (jez.typeOf(args[0]) != "string") return jez.badNews(`${this.name}'s arg[0] must be a string naming a document type.`);
if (jez.typeOf(args[1]) != "array")  return jez.badNews(`${this.name}'s arg[1] must be an array of object with updates.`);

let rc = await game.scenes.current.updateEmbeddedDocuments(args[0], args[1])
if (TL > 1) jez.log(`=== Completed === ${MACRONAME} ===`, rc);

