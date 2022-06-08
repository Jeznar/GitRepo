const macroName = "Bar_&_Name_Visibility.1.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9
 * Script to Update all tokens in currentr secene so that the name shows on hover and the 
 * bars always show.
 * 
 * Display Modes Defined: ALWAYS, CONTROL, HOVER, NONE, OWNER, OWNER_HOVER
 *  
 * 10/14/21 0.1 JGB Creation
 * 10/19/21 1.0 JGB Add dialogs before each action
 * 05/02/22 1.1 Updated for FoundryVTT 9.x
 *********1*********2*********3*********4*********5*********6*********7*********8*********/ 
 jez.log(`Starting: ${macroName}`);
 /*********1*********2*********3*********4*********5*********6*********7*********8*********9
 * Query user to make sure they want to execute this macro (fat finger protection).
 **********1*********2*********3*********4*********5*********6*********7*********8*********/ 
let dialogTitle1 = `Execute ${macroName}?`;
continueDialog();
/*********1*********2*********3*********4*********5*********6*********7*********8*********9
 * Do the actual work of the macro
 **********1*********2*********3*********4*********5*********6*********7*********8*********/ 
function main() {
    jez.log("Continue Execution");

    const tokens = canvas.tokens.placeables.map(token => {
        jez.log(`Token to process: ${token.name}`);
        processToken(token);
    });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9
 * Create, post and process dialog to confirm execution.
 **********1*********2*********3*********4*********5*********6*********7*********8*********/ 
function processToken(token) {
    let action = 0;              //Default action is to skip this token
    new Dialog({
        title: `Update token for ${token.name}?`,
        content: `<br>Do you want to set bar & name visibility for <br><br>
                  <b>${token.name}</b>?<br><br>`,
        buttons: {
            can: {label: "Cancel", callback: () => action = 0},
            con: {label: "Execute",callback: () => {
                action = 1
                jez.log(`Update ${token.name}`);
                    // TokenDocument.update({
                token.update({
                    "bar1.attribute": "attributes.hp",
                    "bar2.attribute": "attributes.ac.value",
                    "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
                    "displayBars": CONST.TOKEN_DISPLAY_MODES.HOVER,
                }) 
            }},
        },
        default: "can",         // Name of default button uwhen user presses return
    }).render(true);
}
 /*********1*********2*********3*********4*********5*********6*********7*********8*********9
 * Create, post and process dialog to confirm execution.
 **********1*********2*********3*********4*********5*********6*********7*********8*********/ 
  function continueDialog() {
    let action = 0;              //Default action is to abort
    new Dialog({
        title: dialogTitle1,
        content: `<br>Do you want to set bar and name visibility for actors in this scene?
                  <br><br>`,
        buttons: {
            can: {label: "Cancel", callback: () => action = 0},
            con: {label: "Execute",callback: () => action = 1},
        },
        default: "can",         // Name of default button uwhen user presses return
        close: () => { CloseActions(action); }
    }).render(true);
    jez.log(`Dialog rendered`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9
 * 
 **********1*********2*********3*********4*********5*********6*********7*********8*********/ 
    function CloseActions(choice) {
        switch (choice) {
            case 0:
                jez.log("Cancel button selected");
                break;
            case 1:
                jez.log("Continue button selected");
                main();
                break;
            default:
                jez.log("No Buttons were selected");
                action = 0;
                break;
        }
        jez.log(`Action set at close: ${choice}`);
        return(null);    
    }
}
