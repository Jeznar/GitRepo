/****************************************************************************************************
 * Script to allow rest of selected NPC tokens.
 * If token represents a PC or is dead (0 HP) skip it.
 * 
 * 10/12/21 0.1 JGB Creation
 * 10/14/21 1.0 JGB Altered to force HP to max on rest even if LongRest function doesn't        
 * 10/14/21 1.1 JGB Reset legendary resistances on a long rest   
 * 10/15/21 1.2 JGB Replace in memory assignments with .update
 **************************************************************************************************/
 const tokens = canvas.tokens.controlled;
 let action = 0;
 let RestSetMaxHP = true;

console.log("Launching JGB's Macro to rest NPCs");

/* Check if token is selected */
if (tokens.length > 0) {                                    // If token(s) selected, fetch data
    tokens.forEach(RestNPC);
} else {                                                     // No selection, bail out with warning
    ui.notifications.warn("No Tokens were selected");
    return;
}  
   
function RestNPC(token, index) {
    let actor = token.actor;                                // Set actor to the token.actor structure
    // console.log(token.actor);

    console.log(token.name + ' current health is: ' + actor.data.data.attributes.hp.value); 
    if (actor.data.data.attributes.hp.value === 0) {        // Is the token dead?
        console.log(token.name + ' dead, can not rest');    // log dead state to console
        return; }                                           // If dead, bail out
    else {  
        if (actor.data.type != "npc") {                         // Check if it is an npc selected 
            console.log(token.name + ' is not an NPC');         // log the PC token's name
            return;                                             // Don't do anything else with the PC
        } else {
            console.log(token.name + ' is to be processed');    // log the PC token's name & continue 
            }
        }

   /******************************************************************************
   * Pop and process a simple dialog to decide if the token should receive a rest 
   *******************************************************************************/
   new Dialog({
        title: token.name,
        content: `<br/>
                 <label for="HPValue">
                 Current Health: ${actor.data.data.attributes.hp.value} of ${actor.data.data.attributes.hp.max} max<br><br>
                 Should ${token.name} receive a full rest?`,
        buttons: {
            can: {
                label: "Do NOT Rest",
                callback: () => action = 1
            },
            con: {
                label: "Complete Rest",
                callback: () => action = 2
            },
        },
        close: async function () {
            switch (action) {
                case 1: // Do not rest
                    console.log(token.name + ' selected no rest');
                    break;
                case 2: // Rest
                    await token.actor.longRest({dialog:false, chat:false});
                    if (RestSetMaxHP && (actor.data.data.attributes.hp.value < actor.data.data.attributes.hp.max)) {
                        // actor.data.data.attributes.hp.value = actor.data.data.attributes.hp.max;
                        let newHP = actor.data.data.attributes.hp.max;
                        actor.update({"data.attributes.hp.value": newHP})
                    }
                    console.log(token.name + ' rested, new HP: ' + actor.data.data.attributes.hp.value);
                    if (actor.data.data.resources.legres.max) { // Does the actor have legendary resistances?
                        let legMAX = actor.data.data.resources.legres.max;
                        let legValue = actor.data.data.resources.legres.value;
                        if (legMAX > 0 && (legValue < legMAX)) {
                            console.log(token.name + ' had ' + legValue + ' of ' + legMAX + ' leg resists');
                            // actor.data.data.resources.legres.value = actor.data.data.resources.legres.max;
                            actor.update({"data.resources.legres.value": legMAX});
                       }
                    } 
                    break;
                default: // Do not rest
                    console.log(token.name + ' canceled rest');
            }
        }
    }).render(true);
}