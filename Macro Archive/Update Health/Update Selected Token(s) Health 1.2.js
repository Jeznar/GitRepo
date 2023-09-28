/*******************************************************************
 * Script to update health of selected NPC tokens, allowing
 * damage, setting, or healing while remaining in the allowed
 * range of health (0 to hp.max)
 * 
 * Update selected token HP, Original author: D. Coughler 
 * 
 * 10/12/21 1.0 JGB`Modification to sample found online
 * 10/14/21 1.1 JGB Changed starting text field value to max HP
 * 10/15/21 1.1 JGB Replace in memory assignments with .update
 ******************************************************************/
 const tokens = canvas.tokens.controlled;
 let action = 0;

 console.log("Launching JGB's Macro to set NPC health");

 /* Check if token is selected */
 if (tokens.length > 0){
     tokens.forEach(UpdateHP);
} else {
     ui.notifications.warn("No Tokens were selected");
}
   
 function UpdateHP(token, index){
   let actor = token.actor;
 
    /** Check if it is an npc selected **/
    if (actor.data.type != "npc") {
        console.log(token.name + ' is not an NPC');         // log the PC token's name
        return;                                             // Don't do anything else with the PC
    } else {
        console.log(token.name + ' is to be processed');    // log the PC token's name & continue 
    }

    new Dialog({
        title:actor.data.name,
        content:`<br/>
                 <label for="HPValue">
                 Current Health: ${actor.data.data.attributes.hp.value} of ${actor.data.data.attributes.hp.max} max<br><br>
                 Enter value to be used in health modification.
                 </label><br>
                 <input type="text" id="hpvalue" name="hpvalue" value=${actor.data.data.attributes.hp.max}>
                 <br/>`,
        buttons: {
            dmg: {
                label: "Apply Damage",
                callback: () => action = 1
            },
            upd: {
                label: "Update Health",
                callback: () => action = 2
            },
            heal: {
                label: "Apply Healing",
                callback: () => action = 3
            },
        },
        close: html => {
            let mod=0;
            let currentval = parseInt(actor.data.data.attributes.hp.value);
          switch(action) {
            case 1:
             mod = parseInt(html.find('[name="hpvalue"]')[0].value) * -1;
            break;
            case 3:
             mod = parseInt(html.find('[name="hpvalue"]')[0].value);
            break;
            default:
             mod=parseInt(html.find('[name="hpvalue"]')[0].value)-currentval;
           }
          // actor.data.data.attributes.hp.value = currentval + mod;
          
          /* Make sure the new hp value is between 0 and max hp */
          let newHP = currentval + mod;
          if (newHP < 0) {
              newHP = 0;
              console.log(token.name + ' is dead, setting to zero');
            };
          if (newHP > actor.data.data.attributes.hp.max) {
              newHP = actor.data.data.attributes.hp.max;
              console.log(token.name + ' set health to max: ' + actor.data.data.attributes.hp.max); 
             }

          /* Set the health of the token to its new value */
          // actor.data.data.attributes.hp.value = newHP;       // Only changes in memory copy not DB 
          actor.update({"data.attributes.hp.value": newHP});    // ACtually changes the database
        }  
     }).render(true);
 }