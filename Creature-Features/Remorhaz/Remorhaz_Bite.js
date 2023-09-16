const MACRONAME = "Remorhaz_Bite.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Initiate a grapple as a result of a successful Remorhaz_Bite. The grapple is automatically applied
 * if the target is hit.
 * 
 * 09/15/23 0.1 JGB created from Grapple_Initiate_1.3
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const STOMACH = 'Icons_JGB/Conditions/stomach.webp'
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (args[0]?.targets?.length !== 1)
        return jez.badNews(`Illegal number of targets.  ${args[0]?.targets?.length} were targeted.`, 'w')
    if (args[0].hitTargets.length !== 1)
        return jez.badNews(`Target was not hit, no effect.`, 'i')
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Function Variables
    //
    let isGrappling = false;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Make sure we tried to bite exactly one target and we hit it.
    //
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    //-------------------------------------------------------------------------------------------------------------------------------
    // If aToken is already grappling make sure it is trying to bite the target it has grappled
    //
    const GRAPPLING_EFFECT = aToken.actor.effects.find(ef => ef.data.label === "Grappling")
    if (GRAPPLING_EFFECT) {
        if (TL > 1) jez.trace(`${TAG} ${aToken.name} is already Grappling: `, GRAPPLING_EFFECT);
        isGrappling = true;
        // Loop through GRAPPLING_EFFECT.data.changes looking for a value that starts with Remove_Paired_Effect and then a UUID
        // Example Value: Remove_Paired_Effect Scene.4tpZknfj8JM7LtyZ.Token.WXE1sSUaNcYG3LlO.ActiveEffect.fug05lrijjcgz0s5
        let grappledUuid = null;
        let isRightTarget = false;
        for (let i = 0; i < GRAPPLING_EFFECT.data.changes.length; i++) {
            const CHANGE_TOKENS = GRAPPLING_EFFECT.data.changes[i].value.split(" ")
            if (CHANGE_TOKENS[0] !== 'Remove_Paired_Effect') continue;  // If first token isn't what we need go to next line
            if (CHANGE_TOKENS.length !== 2) continue;                   // Must have two tokens on line we seek
            grappledUuid = CHANGE_TOKENS[1];                            // Second token is our effect UUID that contains UUID
            endOfTargetPhrase = grappledUuid.indexOf(".ActiveEffect.")  // Get position of end of our Uuid
            grappledUuid = grappledUuid.slice(0, endOfTargetPhrase)
            if (TL > 1) jez.trace(`${TAG} Effect Info`, 'Target UUID', tToken.actor.uuid, 'Grappled UUID', grappledUuid)
            if (grappledUuid === tToken.actor.uuid) {
                isRightTarget = true;
                break;
            }
        }
        if (TL > 1) jez.trace(`${TAG} isRightTarget: `, isRightTarget)
        if (!isRightTarget) {
            msg = `${tToken.name} is not in ${aToken.name}'s mouth, and can not be bitten.`
            postResults(msg)
            return jez.badNews(msg, "i")
        }
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply damage to our target, first piercing.
    //
    let numDice = 6;
    if (args[0].isCritical) numDice = numDice * 2;
    let dRoll = await new Roll(`${numDice}d10[piercing] + ${aActor.data.data.abilities.str?.mod}`).roll({ async: true });
    await game.dice3d?.showForRoll(dRoll);
    new MidiQOL.DamageOnlyWorkflow(aActor, aToken, dRoll.total, "piercing", [tToken], dRoll, {
        flavor: `${CONFIG.DND5E.damageTypes['piercing']}`, itemCardId: args[0].itemCardId
    })
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Now the fire damage.
    //
    numDice = 3;
    if (args[0].isCritical) numDice = numDice * 2;
    dRoll = await new Roll(`${numDice}d6[fire]`).roll({ async: true });
    dRoll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }) });
    MidiQOL.applyTokenDamage([{ damage: dRoll.total, type: "fire" }], dRoll.total, new Set([tToken]), null, new Set());
    postResults(`Additional ${dRoll.total} fire damage.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Now the fire damage.
    //
    //-------------------------------------------------------------------------------------------------------------------------------
    // If target was previously grappled, check to see if it becomes swallowed and proceed with that, exiting after.
    //
    // RAW Description
    //   The remorhaz makes one bite attack against a Medium or smaller creature it is grappling. If the attack hits, that creature 
    //   takes the bite's damage and is swallowed, and the grapple ends. While swallowed, the creature is blinded and restrained, it
    //   has total cover against attacks and other effects outside the remorhaz, and it takes 21 (6d6) acid damage at the start of 
    //   each of the remorhaz's turns.
    //
    // I'm going to change medium or smaller to be 2 sizes or more smaller than the aActor, which is the same unless something 
    // chnaged the size of the aActor.  DoT is applied at start of tActor's not aActor's turn (cause it is easier)
    //
    if (isGrappling) {
        let aTokenSizeValue = (await jez.getSize(aToken)).value
        let tTokenSizeValue = (await jez.getSize(tToken)).value
        if (TL > 1) jez.trace(`${TAG} Token Sizes: `, 'Active Token: ', aTokenSizeValue, 'Target Token: ', tTokenSizeValue)
        if (aTokenSizeValue >= tTokenSizeValue + 2) { // Target can and will be swallowed
            let ceDesc = `Swallowed by ${aToken.name}.`
            let overTimeVal = `turn=start,label=Digestive juices,damageRoll=6d6,damageType=acid`
            let effectData = {
                label: 'Swallowed',
                icon: STOMACH,
                origin: L_ARG.uuid,
                disabled: false,
                flags: {
                    convenientDescription: ceDesc,
                    core: {
                        overlay: true,
                        statusId: 'Force Display'
                    }
                },
                changes: [
                    { key: `macro.CE`, mode: jez.CUSTOM, value: 'Blinded', priority: 20 },
                    { key: `macro.CE`, mode: jez.CUSTOM, value: 'Restrained', priority: 20 },
                    { key: `flags.midi-qol.OverTime`, mode: jez.OVERRIDE, value: overTimeVal, priority: 20 },
                ]
            };
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
            // Clear the grappling condition
            await GRAPPLING_EFFECT.delete();
            await jez.wait(250);    // Seemingly needed to allow the completion of paired effect removal
            // Add a tracking effect to the aActor for this swallow
            ceDesc = `Digesting ${tToken.name}`
            effectData = {
                label: `Digesting ${tToken.name}`,
                icon: STOMACH,
                origin: L_ARG.uuid,
                disabled: false,
                flags: {
                    convenientDescription: ceDesc,
                    core: {
                        statusId: 'Force Display'
                    }
                },
                changes: [
                    { key: `flags.gm-notes.notes`, mode: jez.ADD, value: `Digesting: ${tToken.name}`, priority: 20 },
                ]
            };
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });
            // Pair the swallowed/digesting effects so they expire together
            // await jez.wait(500)
            let tEffect = tToken.actor.effects.find(ef => ef.data.label === "Swallowed" && ef.data.origin === aItem.uuid)
            if (!tEffect) return jez.badNews(`Sadly, there was no Swallowed effect from ${aToken.name} found on ${tToken.name}.`, "warn")
            let oEffect = aToken.actor.effects.find(ef => ef.data.label === `Digesting ${tToken.name}`)
            if (!oEffect) return jez.badNews(`Sadly, there was no Digesting ${tToken.name} effect found on ${aToken.name}.`, "warn")
            const GM_PAIR_EFFECTS = jez.getMacroRunAsGM("PairEffects")
            if (!GM_PAIR_EFFECTS) { return false }
            // await jez.wait(500)
            await GM_PAIR_EFFECTS.execute(oEffect.uuid, tEffect.uuid)
            postResults(`${tToken.name} has been swallowed.  Digestion will now begin.`)
            return  // End evaluation for newly swallowed target.
        }
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply grappled conditions, if not already applied
    //
    if (TL > 1) jez.trace(`${TAG} Apply grappled condition`);
    await jezcon.add({ effectName: 'Grappled', uuid: tToken.actor.uuid, origin: aActor.uuid })
    msg = `<b>${aToken.name}</b> has grabed (grappled) <b>${tToken.name} in its mouth </b>`
    if (TL > 1) jez.trace(`${TAG} message: `, msg);
    postResults(msg);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply Grappling Condition
    //
    if (TL > 1) jez.trace(`${TAG} Apply grappling condition`);
    // await jez.wait(250)
    await jezcon.add({ effectName: 'Grappling', uuid: aToken.actor.uuid })
    //-------------------------------------------------------------------------------------------------------------------------------
    // Find the two just added effect data objects so they can be paired, to expire together.
    //
    await jez.wait(250)
    let tEffect = tToken.actor.effects.find(ef => ef.data.label === "Grappled" && ef.data.origin === aActor.uuid)
    if (!tEffect) return jez.badNews(`Sadly, there was no Grappled effect from ${aToken.name} found on ${tToken.name}.`, "warn")
    let oEffect = aToken.actor.effects.find(ef => ef.data.label === "Grappling")
    if (!oEffect) return jez.badNews(`Sadly, there was no Grappling effect found on ${aToken.name}.`, "warn")
    if (TL > 1) jez.trace(`${TAG} Grappling Effects`, `tEffect: `, tEffect, `oEffect`, oEffect);
    const GM_PAIR_EFFECTS = jez.getMacroRunAsGM("PairEffects")
    if (!GM_PAIR_EFFECTS) { return false }
    // await jez.wait(500)
    await GM_PAIR_EFFECTS.execute(oEffect.uuid, tEffect.uuid)
    //-------------------------------------------------------------------------------
    // Create an Action Item to allow the target to attempt escape
    //
    const GM_MACRO = jez.getMacroRunAsGM(jez.GRAPPLE_ESCAPE_MACRO)
    if (!GM_MACRO) { return false }
    await GM_MACRO.execute("create", aToken.document.uuid, tToken.document.uuid, aToken.actor.uuid)
}
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
