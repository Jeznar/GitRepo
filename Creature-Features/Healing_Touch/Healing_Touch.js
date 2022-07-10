const MACRONAME = "Healing_Touch"
/*****************************************************************************************
 * Implement The Abbot's healing touch ability, specifically, remove the CUB conditions:
 * curse, disease, poison, blindness, and deafness.  Also post a message suggesting the GM
 * may need to manually remove additional conditions.
 * 
 * 02/23/22 0.1 Creation of Macro
 * 07/09/22 Replace CUB.remove with CE
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
// const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && !preCheck())return;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
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
        ui.notifications.warn(msg)
        jez.log(msg)
        return(false);
    }
    return (true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)

    let badConditions = ["Blinded", "Diseased", "Poisoned", "Deafened"]  // No Cursed, 
    jez.log("badConditions", badConditions)
    for (let i = 0; i < badConditions.length; i++) {
        jez.log("Condition:", badConditions[i])
        await jezcon.remove(badConditions[i], tToken.actor.uuid, {traceLvl: 5});
        await jez.wait(100)

    }
    let effect = tToken.actor.effects.find(ef => ef.data.label === "Cursed") ?? null;
    if (effect) await effect.delete();
    //---------------------------------------------------------------------------------------------
    // Add a message to the chat window
    //
    let chatMessage = game.messages.get(LAST_ARG.itemCardId);
    let msg = `Most curse, disease, poison, blindness, and deafness conditions have been cleansed 
               from ${tToken.name}.<br><br><b>FoundryVTT:</b> This may require manual GM cleanup.`
    jez.addMessage(chatMessage, {color:"purple", fSize:14, msg:msg, tag:"saves" })
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
