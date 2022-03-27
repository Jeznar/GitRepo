const MACRONAME = "Guiding_Bolt.js"
/*****************************************************************************************
 * Modify DAE placed effect to include a special exipire clause on next incoming attack.
 * 
 * 03/27/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && preCheck()) await doOnUse(); 
jez.log(`============== Finishing === ${MACRONAME} =================`);
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
        postResults(msg);
        return (false);
    }
    if (LAST_ARG.hitTargets.length === 0) {  // If target was missed, return
        msg = `Target was missed.`
        postResults(msg);
        return(false);
    }
    jez.log("Pre-Check was successful")
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
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    //-------------------------------------------------------------------------------------------------------------
    // Modify the effects to have a proper termination time
    //
    modEffect(tToken, aItem.name)
    msg = `<b>${tToken.name}</b> is granting advantage to the next attack against it, until end of 
    ${aToken.name}'s next turn`
    postResults(msg)
    return (true);
}
/***************************************************************************************************
 * Modify existing effect to terminate the next time the token is attacked
 ***************************************************************************************************/
async function modEffect(token5e, EFFECT) {
    await jez.wait(500)     
    let effect = await token5e.actor.effects.find(i => i.data.label === EFFECT);
    jez.log(`${EFFECT} >>> effect`, effect,"effect.data.flags.dae",effect.data.flags.dae)
    if (effect.data.flags.dae === undefined) {
        jez.log("Adding DAE to our critter")
        effect.data.flags.dae = {}
    } else jez.log("flags.dae already existed, party time?")
    effect.data.flags.dae.specialDuration = ["turnEndSource", "isAttacked"]
    const result = await effect.update({ 'flags.dae.specialDuration': effect.data.flags.dae.specialDuration});
    jez.log(`${EFFECT} >>> result`,result)
    if (result) jez.log(`${EFFECT} >>> Active Effect ${EFFECT} updated!`, result);
    else jez.log(`${EFFECT} >>> Active Effect not updated! =(`, result);
}