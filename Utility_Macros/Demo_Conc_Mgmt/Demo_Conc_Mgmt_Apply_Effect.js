const MACRONAME = "Demo_Conc_Mgmt_Apply_Effect.js"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const FLAG = "Demo_Conc_Mgmt"
const CONDITION = "Prone"
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (!preCheck()) return;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id);    // First Targeted Token, if any
let tActor = tToken?.actor;                                 // Actor for first tareted token
jez.log(`-------------- Starting --- ${MACRONAME}  -----------------`);
await game.cub.addCondition(CONDITION, tToken)              // await completion of add of effect
let newValue = ""                                           // String to hold the new value
let oTokenId = await DAE.getFlag(aToken.actor, FLAG);       // Get the flag value
if (oTokenId) {                                             // If Flag was set clean old value
    let oToken = canvas.tokens.placeables.find(ef => ef.id === oTokenId)
    if (await game.cub.hasCondition(CONDITION, oToken)) {   // Does the original Token have condition?
        await game.cub.removeCondition(CONDITION, oToken);  // If so, remove it.
    }
}
await DAE.setFlag(aToken.actor, FLAG, tToken.id)            // Stash the flag value
postResults(`Added ${CONDITION} to ${tToken.name}`)
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        postResults();
        return (false);
    }
    return(true)
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}