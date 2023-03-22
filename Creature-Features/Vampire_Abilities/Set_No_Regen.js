const MACRONAME = "Set_No_Regen.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Macro to apply No_Regen effect to selected tokens  
 * 
 * Method found on Discord to create this macro (Kandahi):
 *  To make the effect you want on a token, inspect the data 
 *  in the console and copy that then use 
 *    token.createEmbeddedDocuments("ActiveEffect", [data])
 * 
 * Interesting Commnads Used:
 * 1. Examine a token: game.actors.getName("Fiona Wachter")
 * 2. Examine effects on a token: target it and run on console:
 *    _token.actor.effects
 *  
 * 10/26/21 0.1 JGB Creation
 * 03/22/23 0.2 JGB Updated to run a macro at start of turn for those affected
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let effectData = [{
   label: "No_Regen",
   icon: "systems/dnd5e/icons/spells/light-air-fire-3.jpg",
   disabled: false,
   duration: { rounds: 1 },
   flags: { dae: { macroRepeat: "startEveryTurn" } },
   changes: [ { key: "macro.execute", mode: 2, priority: "0", value: "Remove_Delayed No_Regen 1000" } ]
}]
if (TL > 1) jez.trace(`${TAG} built effectData`,effectData);
for (let token of canvas.tokens.controlled) {
   if (TL > 2) jez.trace(`${TAG} token: ${token.name}`);
   await token.actor.createEmbeddedDocuments("ActiveEffect", effectData);
}