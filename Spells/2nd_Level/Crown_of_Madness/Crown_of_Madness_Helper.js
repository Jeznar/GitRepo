const MACRONAME = "Crown_of_Madness_Helper.0.2.js"
/*****************************************************************************************
 * This helper function is intended to be run as a world macro launched by the 
 * Crown_of_Madness as an everyturn macro.  It will prompt the caster, removing 
 * concentration if they choose to use action for a different purpose.
 * 
 * 03/01/22 0.1 Creation of Macro
 * 08/01/22 0.2 Add convenientDescription
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "each") doEach();					    // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
 async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("The do Each code")

    msg = `<br><b>${aToken.name}</b> may use his/her <b>action</b> this turn to continue the ${aItem.name} 
    effect or they may drop concentration and take some other action.  Would you like to maintain the 
    spell?<br><br>`
    let titleMsg = "Maintain Control of Madness?"
    Dialog.confirm({
        title: titleMsg,
        content: msg,
        yes: () => {/*ui.notifications.info("Yes was pressed!")*/},
        no: async () => {
            let concEffect = await aToken.actor.effects.find(i => i.data.label === "Concentrating");          
            let crwnEffect = await aToken.actor.effects.find(i => i.data.label === "Crown of Madness");
            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: aToken.actor.uuid, effects: [concEffect.id, crwnEffect.id] });
            //if (concEffect) {
            //    jez.log(`Concentrating found on ${aToken.name}, dropping it.`)
            //    await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: aToken.actor.uuid, effects: [concEffect.id] });
            //} else jez.log(`Oddly, Concentrating was missing on ${aToken.name}`);
        },
        defaultYes: false
    })
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set On
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOn() {
    const FUNCNAME = "doOn()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TL = 2
    if (TL>1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL>1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}