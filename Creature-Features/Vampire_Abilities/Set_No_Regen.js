/**************************************************************
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
*************************************************************/
 const macroName = "Set_No_Regen_0.1"
 jez.log(`Starting: ${macroName}`); 
 let effectData = [{
    label: "No_Regen",
    icon: "systems/dnd5e/icons/spells/light-air-fire-3.jpg",
    disabled: false,
    duration: { rounds: 1 },
}]
jez.log(" built effectData"); 
for ( let token of canvas.tokens.controlled ){
     jez.log(` token: ${token.name}`); 
     await token.actor.createEmbeddedDocuments("ActiveEffect", 
        effectData);
}