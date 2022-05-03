/*********1*********2*********3*********4*********5*********6*********7*********8*********9
 * Script to Update all tokens in currentr secene so that the name shows on hover and the 
 * bars always show.
 * 
 * Display Modes Defined: ALWAYS, CONTROL, HOVER, NONE, OWNER, OWNER_HOVER
 *  
 * 10/14/21 0.1 JGB Creation
 * 10/19/21 0.2 JGB Add dialogs before each action
 *********1*********2*********3*********4*********5*********6*********7*********8*********/ 
 const macroName = "Set Bar & Name Visibility 0.2"
 const debug = true;   

 /*********1*********2*********3*********4*********5*********6*********7*********8*********9
 * Query user to make sure they want to execute this macro (fat finger protection).
 **********1*********2*********3*********4*********5*********6*********7*********8*********/ 
let dialogTitle1 = "Execute " + macroName + "?";

async function continueExecution() {
    let action = 0;              //Default action is to abort
    new Dialog({
         title: dialogTitle1,
        content: `<br/>
                 <br>Do you want to set bar and name visibility for actors in this scene?<br><br>`,
        buttons: {
            can: {
                label: "Cancel", 
                callback: () => action = 0
            },
            con: {
                label: "Execute",
                callback: () => action = 1
            },
        },
        close: function () {
            switch (action) {
                case 0:         // abort execution, return false
                    if (debug) console.log('...Aborting macro execution');
                    break;
                case 1:         // continue execution, return true
                    if (debug) console.log('...Continuing macro execution');
                    break;
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
                   break;
                } 
                default: // Do not rest
                console.log(token.name + ' canceled rest');
            }
        }
    }).render(true);

/*********1*********2*********3*********4*********5*********6*********7*********8*********9
 * Main execution loop follows
 * 
 **********1*********2*********3*********4*********5*********6*********7*********8*********/ 
const tokens = canvas.tokens.placeables.map(token => {
  return {
    _id: token.id,
    "bar1.attribute": "attributes.hp",
    "bar2.attribute": "attributes.ac.value",
    "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
    "displayBars": CONST.TOKEN_DISPLAY_MODES.HOVER,
  };
});

canvas.scene.updateEmbeddedEntity('Token', tokens)