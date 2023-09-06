const MACRONAME = "Divine_Smite.0.4.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Original downloaded from https://www.patreon.com/posts/divine-smite-47781600
 * 
 * Starting at 2nd level, when you hit a creature with a melee weapon attack, you can expend one spell slot to deal radiant damage 
 * to the target, in addition to the weapon's damage. The extra damage is 2d8 for a 1st level spell slot, plus 1d8 for each spell 
 * level higher than 1st, to a maximum of 5d8. The damage increases by 1d8 if the target is an undead or a fiend, to a max of 6d8.
 * 
 * 12/24/21 0.0 Cry 12/25/21 Posted Version which didn't work for me
 * 12/26/21 0.1 JGB Adding headers and some debug to see what might be going sideways
 * 01/26/22 0.2 JGB Add VFX
 * 06/07/22 0.3 JGB Reorganize and add trace statements looking for apparent transitory bug
 * 08/02/23 0.4 JGB Address bug where wrong damage applied.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Define standard macro variables
//
const LAST_ARG = args[args.length - 1];
let msg = "";
//
// Set the value for the Active Actor (aActor)
let aActor;         
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
else aActor = game.actors.get(LAST_ARG.actorId);
//
// Set the value for the Active Token (aToken)
let aToken;         
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
//
// Set the value for the Active Item (aItem)
let aItem;         
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//-----------------------------------------------------------------------------------------------------------------------------------
// Define specific macro variables
//
let numDice = Math.min(5, Number(LAST_ARG.spellLevel) + 1); // Caps damage dice from level at 5.
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_TARGET = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Regular_GreenYellow_Target_400x400.webm"
const VFX_CASTER = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Regular_GreenYellow_Caster_400x400.webm"
const VFX_OPACITY = 1.0;
const VFX_SCALE = 0.70;
//-----------------------------------------------------------------------------------------------------------------------------------
// Execute the actual code
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let creatureTypes = ["undead", "fiend"];
    let damageType = "radiant";
    let improved = aActor.items.find(i => i.name === "Improved Divine Smite");
    jez.log("improved", improved)
    if (improved) numDice = numDice + 1;        // Add one damage die if improved divine smite is on actor
    let msgHistory = Object.values(MidiQOL.Workflow.workflows).filter(i => i.actor.id === aActor.id && 
        i.workflowType === "Workflow" && i.item?.name != aItem.name);
    jez.log("msgHistory", msgHistory)
    if (msgHistory.length === 0) {
        msg = `You need to successfully attack first.`
        postResults(msg)
        return ui.notifications.error(msg);
    }
    let lastAttack = msgHistory[msgHistory.length - 1];
    jez.log("lastAttack", lastAttack)
    let tToken = canvas.tokens.get(lastAttack.damageList[0].tokenId);
    jez.log("tToken", tToken)
    let undead = creatureTypes.some(i => (tToken.actor.data.data.details?.type?.value || 
        tToken.actor.data.data.details?.race).toLowerCase().includes(i));
    jez.log("undead or fiend",undead)
    if (undead) numDice = numDice + 1;   // Add one damage die if target is undead or fiend
    //-------------------------------------------------------------------------------------------------------------------------------
    // Launch VFX on tToken
    // 
    runVFX(tToken);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let damageRoll = lastAttack.isCritical ? 
        new Roll(`${numDice * 2}d8[${damageType}]`).evaluate({ async: false }) : 
        new Roll(`${numDice}d8[${damageType}]`).evaluate({ async: false });
    jez.log("damageRoll",damageRoll)
    await game.dice3d?.showForRoll(damageRoll);
    let damageWorkflow = await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, damageType, [tToken], 
        damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemCardId: LAST_ARG.itemCardId, 
        itemData: aItem, useOther: false });
    jez.log("damageWorkflow",damageWorkflow)
    let damageBonusMacro = getProperty(aActor.data.flags, `${game.system.id}.DamageBonusMacro`);
    jez.log("damageBonusMacro", damageBonusMacro)
    if (damageBonusMacro) {
        await damageWorkflow.rollBonusDamage(damageBonusMacro);
    } else {
        await damageWorkflow;
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Run some VFX on the target
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function runVFX(target) {
    new Sequence()
        .effect()
        .file(VFX_TARGET)
        .attachTo(target)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        //.repeats(3,1000,2000)
        .name(VFX_NAME) // Give the effect a uniqueish name
        .waitUntilFinished(-2000) // Negative wait time (ms) clips the effect to avoid fadeout*/
        .effect()
        .file(VFX_CASTER)
        .attachTo(target)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        .repeats(numDice - 1, 1000, 2000)
        .name(VFX_NAME) // Give the effect a uniqueish name
        .play();
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
 function postResults(msg) {
    //jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}