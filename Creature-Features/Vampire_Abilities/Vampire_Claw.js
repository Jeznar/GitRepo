const MACRONAME = "Vampire_Claw.1.3.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Allows option to autograpple or do damage on a hit.  I've 
 * added paramaeters at the top to make it easier to adjust
 * power of particular vamp. Based on Crymic's macro.
 * 
 * Eliminated the save vs being grappled.
 * 
 * 10/29/21 1.0 JGB Updated starting from Cyrmic's code
 * 11/06/21 1.1 JGB Add Grappling condition parallel as done
 *                  in grapple/escape macros
 * 05/04/22 1.2 JGB Update for Foundry 9.x
 * 07/06/22 1.3 JGB Converting to CE for conditions
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 5;
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(2, trcLvl, `  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let msg = "";
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
const GRAPPLED_COND = "Grappled"
const GRAPPLING_COND = "Grappling"
const GRAPPLED_JRNL = `@JournalEntry[${game.journal.getName(GRAPPLED_COND).id}]{Grappled}`
const GRAPPLING_JRNL = `@JournalEntry[${game.journal.getName(GRAPPLING_COND).id}]{Grappling}`
//
const numDice =   2;     // Number of dice to roll for damage
const typeDice = "d4"; // Type of dice to roll for damage
const atckStat = "str";// Stat to add, typically str or dex
const damageType = "slashing";
/*********************************************************/
jez.trc(1, trcLvl, "Starting: " + MACRONAME);

jez.log("aItem",aItem)
jez.log("aItem",aItem)

main()
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function preCheck() {
    if (LAST_ARG.hitTargets.length === 0) return jez.badNews("No targets were hit", "info");
    return (true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    jez.trc(1, trcLvl, `--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    jez.trc(2, trcLvl, "postResults Parameters", "msg", msg)
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    jez.trc(1, trcLvl, `--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * main
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function main() {
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(LAST_ARG.hitTargets[0].id);
    jez.trc(2, trcLvl, ` tToken ${tToken?.name}`, tToken);
    //----------------------------------------------------------------------------------------------
    // Check to see if target is already Grappled by the active token
    //
    const EFFECT = tToken.actor.effects.find(ef => ef.data.label === GRAPPLED_COND && 
        ef.data.origin === aActor.uuid)
    jez.trc(3, trcLvl, ` EFFECT:`, EFFECT);
    //----------------------------------------------------------------------------------------------
    // If target is not already grappled ask if this is an attack or a grapple in a dialog
    //
    if (!EFFECT) {
        new Dialog({
            title: aItem.name,
            content: `Pick an attack`,
            buttons: {
                attack: {
                    label: "Attack", callback: async () => {
                        doAttack(aToken, tToken)
                    }
                },
                grapple: {
                    label: GRAPPLED_COND, callback: async () => {
                        doGrapple(aToken, tToken)
                    }
                }
            },
            default: "attack"
        }).render(true);
    } else doAttack(aToken, tToken)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doAttack(aToken, tToken) {
    const FUNCNAME = "doAttack(aToken, tToken)";
    jez.trc(1, trcLvl, `--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    jez.trc(2, trcLvl, `---   Args   ---`, `${aToken.name}`, aToken, `${tToken.name}`, tToken);
    //----------------------------------------------------------------------------------------------
    // Roll up the damage
    //
    const damageRoll = new Roll(`${numDice}${typeDice} + @abilities.${atckStat}.mod`,
        aActor.getRollData()).evaluate({ async: false });
    jez.trc(3, trcLvl, ` Damage: ${damageRoll.total}`, damageRoll);
    game.dice3d?.showForRoll(damageRoll);
    //----------------------------------------------------------------------------------------------
    // Apply the damage
    //
    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total,
        damageType, [tToken], damageRoll,
        {
            flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`,
            itemCardId: LAST_ARG.itemCardId, useOther: false
        });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doGrapple(aToken, tToken) {
    const FUNCNAME = "doGrapple(aToken, tToken)";
    jez.trc(1, trcLvl, `--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    jez.trc(2, trcLvl, `---   Args   ---`, `${aToken.name}`, aToken, `${tToken.name}`, tToken);
    //-----------------------------------------------------------------------------------------------
    // Apply Grappled Effect
    //
    jez.trc(2, trcLvl, " Apply grappled condition");
    jezcon.add({ effectName: 'Grappled', uuid: tToken.actor.uuid, origin: aActor.uuid })
    //-----------------------------------------------------------------------------------------------
    // Add GRAPPLING_COND effect to originating token 
    //
    jezcon.add({ effectName: 'Grappling', uuid: aToken.actor.uuid })
    //-----------------------------------------------------------------------------------------------
    // Find the two just added effect data objects so they can be paired, to expire 
    // together.
    //
    await jez.wait(250)
    let tEffect = tToken.actor.effects.find(ef => ef.data.label === GRAPPLED_COND &&
        ef.data.origin === aToken.actor.uuid)
    jez.trc(3,trcLvl,`===> tEffect ${tEffect?.uuid}`, tEffect)
    if (!tEffect) return jez.badNews(`Sadly, there was no Grappled effect from ${aToken.name} found 
        on ${tToken.name}.`, "warn")
    let aEffect = aToken.actor.effects.find(ef => ef.data.label === GRAPPLING_COND)
    jez.trc(3,trcLvl,`===> aEffect ${aEffect?.uuid}`, aEffect)
    if (!aEffect) return jez.badNews(`Sadly, there was no Grappling effect found on ${aToken.name}.`
        , "warn")
    const GM_PAIR_EFFECTS = jez.getMacroRunAsGM("PairEffects")
    if (!GM_PAIR_EFFECTS) { return false }
    await jez.wait(100)
    // await GM_PAIR_EFFECTS.execute(aToken.id, aEffect.data.label, tToken.id, tEffect.data.label)
    await GM_PAIR_EFFECTS.execute(aEffect.uuid, tEffect.uuid)
    //-----------------------------------------------------------------------------------------------
    // Create an Action Item to allow the target to attempt escape
    //
    await jez.wait(500)
    const GM_ESCAPE = jez.getMacroRunAsGM(jez.GRAPPLE_ESCAPE_MACRO)
    if (!GM_ESCAPE) { return false }
    await GM_ESCAPE.execute("create", aToken.document.uuid, tToken.document.uuid, aToken.actor.uuid)
    //------------------------------------------------------------------------------------------------
    // Post completion message
    //
    msg = `<b>${tToken.name}</b> has been ${GRAPPLED_JRNL} by <b>${aToken.name}</b> who is now
       ${GRAPPLING_JRNL}.<br><br>${tToken.name} may attempt to end the grapple per standard 
       grapple rules.`
    postResults(msg)
    jez.trc(1, trcLvl, `--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
    return true;
}