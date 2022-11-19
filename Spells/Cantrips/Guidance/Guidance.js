const MACRONAME = "Guidance.0.3.js"
/*****************************************************************************************
 * Macro does the following:
 * - Verify exactly one target is targeted
 * - Verify the target does not currently have guidance
 * - Apply the guidance effect
 * - When guidance drops, remove concentration on the caster
 * 
 * 05/20/22 0.1 Creation of Macro
 * 06/15/22 0.2 Expire buff after an ability check as well as after skill check
 * 08/02/22 0.3 Add convenientDescription
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
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
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    // Find the originating actor
    //
    let oToken = await canvas.tokens.placeables.find(ef => ef.id === args[1])
    if (!oToken) return (false)
    jez.log(`Originating token: ${oToken.name}`,oToken)
    //----------------------------------------------------------------------------------------------
    // Look for "Concentrating" effect on originating token's actor
    //
    let effect = await oToken.actor.effects.find(ef => ef.data.label === "Concentrating");
    if (effect) await effect.delete();
    //----------------------------------------------------------------------------------------------
    // Post completion message
    //
    jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img, 
    msg: `Guidance has been used or simply removed from ${aToken.name}.`, 
    title: `Guidance Used`, token: aToken})
    //----------------------------------------------------------------------------------------------
    // That's all folks
    //
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 * 
 * The expiration conditions are documented on my GitHub: 
 * https://github.com/Jeznar/GitRepo/blob/main/Documentation/Effect_Duration.md#other-special-durations
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const GAME_RND = game.combat ? game.combat.round : 0;
    const EXPIRE = ["isCheck", "isSkill", "newDay", "longRest", "shortRest"];
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    // Verify exactly one target is targeted
    //
    if (!await preCheck()) return(false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //----------------------------------------------------------------------------------------------
    // Verify the target does not currently have guidance, if it does remove concentration
    //
    let effect = await tActor.effects.find(ef => ef.data.label === aItem.name);
    if (effect) {
        let msg = `<b>${tToken.name}</b> already has the ${aItem.name} effect. Perhaps the <b>GM</b> 
        will allow <b>${aToken.name}</b> to do something more useful?`
        jez.log(msg, effect)
        ui.notifications.info(msg);
        postResults(msg)
        //----------------------------------------------------------------------------------------------
        // Remove concentrating from originating token
        //
        let concentratingEffect = aToken.actor.effects.find(ef => ef.data.label === "Concentrating");
        if (concentratingEffect) await concentratingEffect.delete();
        return(false)
    }
    //----------------------------------------------------------------------------------------------
    // Apply the guidance effect
    //
    const CE_DESC = `${aToken.name}'s spell adds 1d4 to one ability or skill check for 1 minute`
    let effectData = {
        label: aItem.name, 
        icon: aItem.img,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 10, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: { 
            dae: { macroRepeat: "none", specialDuration: EXPIRE },
            convenientDescription: CE_DESC
        },
        changes: [
            {key: `data.bonuses.abilities.check`, mode: jez.ADD, value: "+1d4", priority: 20},
            {key: `macro.itemMacro`, mode: jez.ADD, value: aToken.id, priority: 20},    
        ]
    };
    jez.log(`Add effect ${aItem.name} to ${tToken.name}`)  
    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:tToken.actor.uuid, effects: [effectData] });
    msg=`<b>${tToken.name}</b> has received ${aItem.name} from ${aToken.name} and has a 1d4 bonus to next 
    skill check within 10 turns.`;
    postResults(msg)
    //----------------------------------------------------------------------------------------------
    // That's all folks!
    //
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}