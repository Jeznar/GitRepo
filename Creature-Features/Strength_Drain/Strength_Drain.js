const MACRONAME = "Strength_Drain.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Applies the strength drain debuff bit of a Shadow's basic attack.
 * 
 *   The target's Strength score is reduced by 1d4. The target dies if this reduces its Strength to 0. 
 *   Otherwise, the reduction lasts until the target finishes a short or long rest. If a non-evil 
 *   humanoid dies from this attack, a new shadow rises from the corpse 1d4 hours later.
 * 
 * 11/15/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL>1) jez.trace(`${TAG} === Starting ===`);
if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;         
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor; 
//
// Set the value for the Active Item (aItem)
let aItem;         
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const EFFECT_NAME = `Strength Drain`
const GAME_RND = game.combat ? game.combat.round : 0;
let killzIt = false
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          // Midi ItemMacro On Use
if (TL>1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
async function preCheck() {
    if (args[0].targets.length !== 1)       // If not exactly one target 
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`,"w");
    if (LAST_ARG.hitTargets.length === 0)   // If target was missed, return
        return jez.badNews(`Target was missed.`, "w")
    return(true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //----------------------------------------------------------------------------------
    if (!await preCheck()) return(false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-----------------------------------------------------------------------------------------------
    // Determine how much stength should be drained
    //
    let rollObj = new Roll(`1d4`).evaluate({ async: false });
    await game.dice3d?.showForRoll(rollObj);
    if (TL>1) jez.trace(`${TAG} Strength to drain`, rollObj.total);
    //-----------------------------------------------------------------------------------------------
    // Will this attack drop str to (or below) zero?
    //
    let strDrain = rollObj.total
    let targetStr = tToken.actor.data.data.abilities.str.value
    if (targetStr - strDrain <= 0) {
        killzIt = true
        strDrain = targetStr
    }
    msg = `${tToken.name} has ${strDrain} points of strength drained. `
    //-----------------------------------------------------------------------------------------------
    // Define and apply appropriate debuff effect
    //
    const CE_DESC = `Strength reduced by ${rollObj.total}`
    let EFFECT_DATA = {
        label: EFFECT_NAME,
        icon: aItem.img,
        origin: LAST_ARG.uuid,
        disabled: false,
        flags: {
            dae: { stackable: true, specialDuration: [ "longRest", "shortRest"] },
            convenientDescription: CE_DESC
        },
        duration: { rounds: 14400, seconds: 86400, startRound: GAME_RND, startTime: game.time.worldTime },
        changes: [
            { key: `data.abilities.str.value`, mode: jez.ADD, value: `-${strDrain}`, priority: 20 },
        ]
    }
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [EFFECT_DATA] });
    //-----------------------------------------------------------------------------------------------
    // Check to see if target is killed by strength zero, is os killz it!
    //
    if (killzIt) {
        if (TL>1) jez.trace(`${TAG} ${tToken} has 0 or less str, killz it!`);
        damDone = await applyDamage(tToken, 99999)
        msg += `It dies as its strength is now zero.`
    }
    //-----------------------------------------------------------------------------------------------
    // Say goodbye!
    //
    postResults(msg)
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Handy function to apply damage
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
async function applyDamage(token1, amount) {
    let hpVal = token1.actor.data.data.attributes.hp.value;
    let hpTmp = token1.actor.data.data.attributes.hp.temp;
    let damageDone = Math.min(hpVal+hpTmp, amount)
    let damageRollObj = new Roll(`${damageDone}`).evaluate({ async: false });
    jez.log(`damageRollObj`, damageRollObj);
    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageDone, 
        /*DAMAGE_TYPE*/null,[token1], damageRollObj,
        {
            flavor: `Strength Drain`,
            itemCardId: "new",
            useOther: false
        }
    );
    return(damageDone)
}