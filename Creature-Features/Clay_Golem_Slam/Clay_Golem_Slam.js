const MACRONAME = "Clay_Golem_Slam.0.2.js"
/*****************************************************************************************
 * Implement the reduction in HP Max portion of this ability.
 * 
 *   If the target is a creature, it must succeed on a DC 15 Constitution saving throw or 
 *   have its hit point maximum reduced by an amount equal to the damage taken. The target 
 *   dies if this attack reduces its hit point maximum to 0. The reduction lasts until 
 *   removed by the greater restoration spell or other magic.
 * 
 * 04/17/22 0.1 Creation of Macro
 * 08/02/22 0.2 Add convenientDescription
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
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
    const FUNCNAME = "doOnUse()";
    if (!preCheck()) return(false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    //---------------------------------------------------------------------------------------------
    // Find how much damage was done by triggering attack
    //
    const DAM_TYPE = "bludgeoning"
    let damageDetail = await LAST_ARG.damageDetail.find(i=> i.type === DAM_TYPE);
    if (!damageDetail) {
        ui.notifications.error(`Oh no, Mister Bill!  Couldn't find any ${DAM_TYPE} damage.`)
        return;
    }
    jez.log("damageDetail",damageDetail)
    const DAM_DONE = damageDetail.damage
    jez.log("Damage Done", DAM_DONE)
    //---------------------------------------------------------------------------------------------
    // Apply DAE effect to reduce target's max health by amount of damage just done
    //
    const CE_DESC = `Maximum health reduced by ${DAM_DONE}.`
    let effectData = {
        label: aItem.name,
        icon: aItem.img,
        flags: { dae: { itemData: aItem, stackable: true, macroRepeat: "none" } },
        origin: LAST_ARG.uuid,
        disabled: false,
        flags: { 
            dae: { itemData: aItem }, 
            convenientDescription: CE_DESC
        },
        //duration: {seconds: 86400, hours: 24, startRound: gameRound, startTime: game.time.worldTime },
        changes: [{ key: "data.attributes.hp.max", mode: jez.ADD, value: -DAM_DONE, priority: 20 }]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
    //---------------------------------------------------------------------------------------------
    // Post a results message
    //
    msg = `<b>${tToken.name}</b>'s maximum health has been reduced by ${DAM_DONE}.`
    postResults(msg)
    return (true);
}