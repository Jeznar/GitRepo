const MACRONAME = "Mace_of_Terror"
/*****************************************************************************************
 * This macro implements the item use ability for the Mace of terror.  Described as:
 * 
 *   This magic weapon has 3 charges. While holding it, you can use an action and expend 
 *   1 charge to release a wave of terror.
 * 
 *   Each creature of your choice in a 30-foot radius extending from you must succeed on 
 *   a DC 15 Wisdom saving throw or become frightened of you for 1 minute.
 * 
 *   While it is frightened in this way, a creature:
 *   o must spend its turns trying to move as far away from you as it can, and it can't 
 *     willingly move to a space within 30 feet of you.
 *   o It also can't take reactions.
 *   o For its action, it can use only the Dash action or try to escape from an effect 
 *     that prevents it from moving. If it has nowhere it can move, the creature can use 
 *     the Dodge action.
 * 
 *   At the end of each of its turns, a creature can repeat the saving throw, ending the 
 *   effect on itself on a success.
 * 
 * This macro will handle apply a DAE effect to mark affected creatures, create a reminder 
 * message in the chatlog and do an overtime save at the end of each affected creature's 
 * turn.  It expects the player tro pre target tokens to be affected.  It will do a range 
 * check.
 * 
 * 03/31/22 0.1 Creation of Macro
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
else aItem = LAST_ARG.efData?.flags?.dae?.aItemata;
let msg = "";
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
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
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //---------------------------------------------------------------------------------------------
    // Set useful variables
    //
    let maxRange = jez.getRange(aItem, "ft")
    jez.log("maxRange", maxRange)
    //---------------------------------------------------------------------------------------------
    // Step through the failed save tokens, discarding those out of range, apply effect to in range
    //
    let outOfRangeNames = ""
    let inRangeNames = ""
    let color = "purple" // jez.getRandomRuneColor()
    for (const element of args[0].failedSaves) {
        //-----------------------------------------------------------------------------------------
        // element is likely a TokenDocument5e and I am used to dealing with Token5e, so convert
        //
        let cToken = {}
        if (element.constructor.name === "TokenDocument5e") cToken = element._object
        else cToken = element
        //-----------------------------------------------------------------------------------------
        // check the range and do the job
        //
        if (jez.inRange(aToken, element, maxRange)) {
            if (inRangeNames) inRangeNames += `, ${cToken.name}`
            else inRangeNames = cToken.name
            jez.runRuneVFX(cToken, jez.getSpellSchool(aItem), color)
            new Sequence()
            .effect()
                .file("modules/jb2a_patreon/Library/Generic/Marker/MarkerFear_02_Dark_Purple_400x400.webm")
                .attachTo(cToken)
                .scale(0.6)
                .opacity(1)
                .scaleIn(0.1, 1000)
                .fadeIn(1000) 
                .fadeOut(2000) 
                .scaleOut(0.1, 2000)
            .play();
            applyEffect(cToken)
        } else {
            if (outOfRangeNames) outOfRangeNames += `, ${cToken.name}`
            else outOfRangeNames = cToken.name
        }
        jez.log("inRangeNames",inRangeNames)
        jez.log("outOfRangeNames",outOfRangeNames)
    }
    msg = `Saving throws In/Out of Range<br>In: ${inRangeNames}<br>Out: ${outOfRangeNames}`
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
    /***********************************************************************************************
    * Check the setup of things.  Setting the global errorMsg and returning true for ok!
    ************************************************************************************************/
   function preCheck() {
       jez.log("args[0].targets.length", args[0].targets.length)
       if (args[0].targets.length === 0) {     // If not exactly one target, return
           msg = `Must target at least one target.` 
           postResults(msg);
           return (false);
       }
       jez.log("args[0].failedSaves.length", args[0].failedSaves.length)
       if (args[0].failedSaves.length === 0) {  // No failed saves
           msg = `No targets affected by ${aItem.name}`
           postResults(msg);
           return(false);
       }
       return(true)
   }
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("A place for things to be done");
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
 async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    new Sequence()
    .effect()
        .file("modules/jb2a_patreon/Library/Generic/UI/IconFear_01_Dark_Purple_200x200.webm")
        .attachTo(aToken)
        .scale(0.8)
        .opacity(0.7)
        .scaleIn(0.1, 1000)
        .fadeIn(1000) 
        .fadeOut(2000) 
        .scaleOut(0.1, 2000)
    .play();
    msg = `Must move as far away from <b>${args[1]}</b> as it can and can not take reactions.
    For its action, it can use only the Dash action or try to escape from an effect that prevents 
    it from moving. If it has nowhere it can move, ${aToken.name} can use the Dodge action.`
    jez.postMessage({color: "purple", fSize: 14, icon: aToken.data.img, msg: msg, 
                title: `${aToken.name} is Terrified`, token: aToken})
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
 async function applyEffect(token5e) {
    const FUNCNAME = "applyEffect(token5e)";
    const TERRIFIED_COND = "Terrified"
    const TERRIFIED_ICON = "Icons_JGB/Items/Mace-of-Terror.png"
    const GAME_RND = game.combat ? game.combat.round : 0;

    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const SAVE_DC = LAST_ARG.item.data.save.dc
    const SAVE_TYPE = LAST_ARG.item.data.save.ability
    let overTimeValue = `turn=end,label=Terrified,saveDC=${SAVE_DC},saveAbility=${SAVE_TYPE},saveRemove=true`
    let effectData = [{
        label: TERRIFIED_COND,
        icon: TERRIFIED_ICON,
        origin: LAST_ARG.uuid,
        disabled: false,
        flags: { dae: { stackable: false, macroRepeat: "startEveryTurn" } },
        duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
        changes: [
            { key: `macro.itemMacro`, mode: jez.CUSTOM, value: `'${aToken.name}'`, priority: 20 },
            { key: `flags.midi-qol.OverTime`, mode: jez.OVERRIDE, value: overTimeValue, priority: 20 }
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token5e.actor.uuid, effects: effectData });
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}