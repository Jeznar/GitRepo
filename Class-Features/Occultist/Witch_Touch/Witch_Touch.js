const MACRONAME = "Witch_Touch"
/*****************************************************************************************
 * Implementatio0n macro for Occultist's Witch's Touch.  This macro powers an item that 
 * is to be used as a followup to an Occultist taking an action that should trigger the 
 * Witch's Touch.  Here's Kibble's description:
 * 
 *   Starting at 6th level, whenever you cast a spell with a range of touch (including 
 *   through your familiar), you can add one of the following modifiers to the spell
 * 
 *    o Bolster -- It grants one affected target temporary hit points equal to your Wisdom 
 *      modifier. Only one creature can have these temporary hit points at a time.
 *    o Wither -- It deals additional damage equal to your Wisdom modifier to one affected 
 *      creature.
 *    o Curse -- It adds or subtracts 1d4 from the target's next attack roll or saving  
 *      throw before the start of your next turn.
 * 
 *   You can also confer these effects to another spell with a range longer than touch by 
 *   making its range touch, or confer these effects as an action without casting a spell 
 *   by touching a target (making a melee spell attack to do if the target is an unwilling 
 *   creature). If you make the range of a curse spell touch, you no longer need the 
 *   material component for the spell.
 * 
 * 02/13/22 0.1 Creation of Macro
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
const CAST_MOD = jez.getCastMod(aToken)
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";

//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && !preCheck())return;

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
//if (args[0] === "off") await doOff();                   // DAE removal
//if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
//if (args[0] === "each") doEach();					    // DAE removal
// DamageBonus must return a function to the caller
//if (args[0]?.tag === "DamageBonus") return(doBonusDamage());    
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
        postResults(msg);
        return (false);
    }
    /*if (LAST_ARG.hitTargets.length === 0) {  // If target was missed, return
        msg = `Target was missed.`
        postResults();
        return(false);
    }*/
    /*if (args[0].failedSaveUuids.length !== 1) {  // If target made its save, return
        msg = `Saving throw succeeded.  ${aItem.name} has no effect.`
        postResults();

        return(false);
    }*/
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
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)

    const queryTitle = "Select Witch's Touch Effect"
    const queryText = "Pick one from the list.  Curse and Bless expire at the end of your next turn."
    let optionArray = [
        `Bolster -- Grant one creatire ${CAST_MOD} temp HP.`,
        `Wither -- Deal ${CAST_MOD} damage to target.`,
        `Curse -- Subtract 1d4 from target's next attack or save.`,
        `Bless -- Add 1d4 to target's next attack or save.`
    ];
    jez.pickRadioListArray(queryTitle, queryText, pickEffectCallBack, optionArray);

    //msg = `Maybe say something useful...`
    //postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}

/***************************************************************************************************
 * Process the callback from dialog and fork to correct function to apply effect
 ***************************************************************************************************/
function pickEffectCallBack(selection) {
    jez.log("pickRadioCallBack", selection)
    jez.postMessage({
        color: "green",
        fSize: 14,
        icon: aToken.data.img,
        msg: `${aToken.name} selected <b>"${selection}"</b> in the dialog`,
        title: `${aToken.name} made a pick`,
        token: aToken
    })
    const action = selection.split(" ")[0]     // Grab the first word from the selection

    switch(action) {
        case "Bolster":
            applyBolster();
            break;
        case "Wither":
            applyWither();
            break;
        case "Curse":
            applyCurse();
            break;
        case "Bless":
            applyBless();
            break;
        default:
            msg = `No valid selection made: ${action}.`
            postResults(msg);
            return (false);
      }
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
function applyBolster() {
    msg = `Bolster needs to be applied.`
    postResults(msg);
    return (false);
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
 function applyWither() {
    msg = `Wither needs to be applied.`
    postResults(msg);
    return (false);
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
 function applyCurse() {
    msg = `Curse needs to be applied.`
    postResults(msg);
    return (false);
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
 function applyBless() {
    msg = `Bless needs to be applied.`
    postResults(msg);
    return (false);
}