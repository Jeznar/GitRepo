const MACRO = "Convenient_Effects_Exercise.js"
const COND_APPLIED = "Stunned"  // A pre-existing custom effect managed by CE
const SPECDUR = "turnEndSource" // Special Duration that I want applied this one time

// Need to have selected at least one token
let aToken = canvas.tokens.controlled[0]
// ---------------------------------------------------------------------------------------
// Obtain and modify condition to be applied
//
let effect = game.dfreds.effectInterface.findEffectByName(COND_APPLIED).convertToObject();
effect.name = `${COND_APPLIED} ${SPECDUR}`;     // Change the effect's name
effect.flags.dae.specialDuration.push(SPECDUR)  // Add to the effect's special duration
// ---------------------------------------------------------------------------------------
// Loop through all of the selected tokens and apply the condition
//
for ( let tToken of canvas.tokens.controlled ) 
    game.dfreds.effectInterface.addEffectWith({effectData:effect, 
        uuid:tToken.actor.uuid, origin:aToken.actor.uuid });