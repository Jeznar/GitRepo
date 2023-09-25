const MACRONAME = "Blood_Drain-Stirge_Swarm.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implement a stirge swarm bloood drain mechanic. Roll to hit is handled by the base item card, this macro handles remainer 
 * including damage and tracking progress to satiated.
 * 
 *   The stirge attaches to the target. While attached, the stirge doesn't attack. Instead, at the start of each of the stirge's 
 *   turns, the target loses 25 (6d4 + 4) hit points due to blood loss. The stirge swarm can detach itself by spending 5 feet of 
 *   its movement. It does so after become satiated when it has drained 50 hit points of blood from the target or the target dies.
 *   While attached to a victim, it is difficult to hit, forcing disadvantage on attacks.
 * 
 * This macro does a few interesting things:
 * 1. Looks at the calling actor's name to see if it includes "swarm" then sets values accordingly
 * 2. Uses paired effects to trigger removal of primary/secondary effects
 * 3. Uses a flag to track damage done as a drain and marks satiatiated effect when 'full'
 * 4. Uses tokenAttacher to attach the two tokens, moving the swarm with its victim
 * 
 * 09/24/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.log(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
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
const SATIATED_EFFECT_NAME = 'Satiated'
const SATIATED_IMG = 'Icons_JGB/Misc/blood2.svg'
const DRAINING_EFFECT_NAME = 'Draining'
const LATCHED_EFFECT_NAME = 'Latched'
const BLOOD_DRAINED_FLAG = `${MACRO}-Blood_Drained`
const LATCHED_TOKEN_ID_FLAG = `${MACRO}-Latched_Token`
//-------------------------------------------------------------------------------------------------------------------------------
// Set damage variables based on the name of the creature using this ability, either a swarm or not a swarm
//
let isSwarm = aToken.name.toLowerCase().includes('swarm') ? true : false
let biteDice = isSwarm ? 6 : 1      // Swarm or not swarm d4's to roll
let drainDice = isSwarm ? 12 : 2    // Swarm or not swarm d4's to roll
let satiated = isSwarm ? 50 : 10    // Swarm or not swarm hit points to stop drinking
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.log(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 2) jez.log("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Check to see if aActor has the Satiated condition.  If so, it will not be able to drain blood.
    //
    const SATIATED_EFFECT = await aToken?.actor?.effects?.find(ef => ef?.data?.label === SATIATED_EFFECT_NAME &&
        ef?.data?.origin === aToken.actor.uuid)
    let isSatiated = SATIATED_EFFECT ? true : false
    if (TL > 1) jez.log(`${TAG} ${aToken.name} is satiated?`, isSatiated)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Check to see if aActor is draining a target.  If so, it will not do bite damage, just drain blood.
    //
    const DRAINING_EFFECT = await aToken?.actor?.effects?.find(ef => ef?.data?.label === DRAINING_EFFECT_NAME &&
        ef?.data?.origin === L_ARG.uuid)
    let isDraining = DRAINING_EFFECT ? true : false
    if (TL > 1) jez.log(`${TAG} ${aToken.name} is draining?`, isDraining)
    //-------------------------------------------------------------------------------------------------------------------------------
    // If we were not draining, check to see if hit target, if so do damage and add draining effect if not satiated, then terminate 
    //
    if (TL > 3) jez.log(`${TAG} L_ARG.targetUuids[0]`, L_ARG.targetUuids[0])
    let tToken = (await fromUuid(L_ARG.targetUuids[0])).object   // tToken will be a Token5e
    let tActor = tToken?.actor;
    if (!isDraining) {
        if (TL > 1) jez.log(`${TAG} ${aToken.name} is trying to hit ${tToken?.name}`, tToken)
        if (!L_ARG.hitTargetUuids[0]) {
            postResults(`${aToken.name} missed ${tToken.name}.`)
        } else {
            let ceDesc, effectData
            //------------------------------------------------------------------------------------------------------------------------
            // Apply damage to our target
            //
            if (args[0].isCritical) biteDice = biteDice * 2;
            let dRoll = await new Roll(`${biteDice}d4[piercing] + ${aActor.data.data.abilities.dex?.mod}`).roll({ async: true });
            await game.dice3d?.showForRoll(dRoll);
            new MidiQOL.DamageOnlyWorkflow(aActor, aToken, dRoll.total, "piercing", [tToken], dRoll, {
                flavor: `${CONFIG.DND5E.damageTypes['piercing']}`, itemCardId: args[0].itemCardId
            })
            //------------------------------------------------------------------------------------------------------------------------
            // Check to see if aActor is Satiated
            //
            if (isSatiated) {
                await jez.wait(500)
                postResults(`${aToken.name} is satiatiated with blood.  It does not latch on to drink more.`)
                return
            }
            //------------------------------------------------------------------------------------------------------------------------
            // Add Draining effect to aActor
            //
            ceDesc = `Draining blood from ${tToken.name}.`
            effectData = {
                label: DRAINING_EFFECT_NAME,
                icon: aItem.img,
                // origin: aActor.uuid,
                origin: L_ARG.uuid,
                disabled: false,
                flags: {
                    convenientDescription: ceDesc,
                    core: { statusId: 'Force Display' }
                },
                changes: [
                    { key: `macro.itemMacro`, mode: jez.CUSTOM, value: DRAINING_EFFECT_NAME, priority: 20 },
                    { key: `flags.midi-qol.grants.disadvantage.attack.all`, mode: jez.ADD, value: 1, priority: 20 },
                ]
            };
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
            //------------------------------------------------------------------------------------------------------------------------
            // Add Latched token UUID as a flag
            //
            await DAE.setFlag(aActor, LATCHED_TOKEN_ID_FLAG, tToken.document.uuid)
            //------------------------------------------------------------------------------------------------------------------------
            // Add Latched effect to target
            //
            ceDesc = `Latched onto by ${aToken.name}.`
            effectData = {
                label: LATCHED_EFFECT_NAME,
                icon: aItem.img,
                origin: aActor.uuid,
                disabled: false,
                flags: {
                    convenientDescription: ceDesc,
                    core: { statusId: 'Force Display' }
                },
            };
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tActor.uuid, effects: [effectData] });
            //------------------------------------------------------------------------------------------------------------------------
            // Attach to just added effects to each other
            //
            // Find the latched effect on our target
            const LATCHED_EFFECT = await tToken?.actor?.effects?.find(ef => ef?.data?.label === LATCHED_EFFECT_NAME &&
                ef?.data?.origin === aActor.uuid)
            if (TL > 2) jez.log(`${TAG} Latch Effect applied: `, LATCHED_EFFECT)
            // Find the draining effect on our active actor
            const DRAINING_EFFECT = await aToken?.actor?.effects?.find(ef => ef?.data?.label === DRAINING_EFFECT_NAME &&
                ef?.data?.origin === L_ARG.uuid)
            if (TL > 2) jez.log(`${TAG} Drain Effect applied: `, DRAINING_EFFECT)
            // Don't really need to use a run as GM macro here, but it seems more future resistant
            const GM_PAIR_EFFECTS = jez.getMacroRunAsGM("PairEffects") 
            if (!GM_PAIR_EFFECTS) return jez.badNews(`Could not find PairEffects macro`,'e')
            GM_PAIR_EFFECTS.execute(LATCHED_EFFECT.uuid, DRAINING_EFFECT.uuid)
            //------------------------------------------------------------------------------------------------------------------------
            // Use tokenAttacher to attach the aToken to the tToken
            //
            let newCoords = { x: token.x, y: token.y };
            if (tToken.x + tToken.w - token.w < token.x) newCoords.x = tToken.x + tToken.w - token.w;
            else if (tToken.x > token.x) newCoords.x = tToken.x;
            if (tToken.y + tToken.h - token.h < token.y) newCoords.y = tToken.y + tToken.h - token.h;
            else if (tToken.y > token.y) newCoords.y = tToken.y;
            await token.document.update({ x: newCoords.x, y: newCoords.y });
            ui.chat.processMessage(`I grip onto ${tToken.name} to drink deeply`);
            await tokenAttacher.attachElementToToken(token, tToken, true);
            await tokenAttacher.setElementsLockStatus(token, false, true);
            await tokenAttacher.setElementsMoveConstrainedStatus(token, true, true, { type: tokenAttacher.CONSTRAINED_TYPE.TOKEN_CONSTRAINED });
            //------------------------------------------------------------------------------------------------------------------------
            // Completion message
            //
            postResults(`${aToken.name} has latched onto ${tToken.name} and begins drinking its fill.`)
        }
        return;
    } else { // Stirge swarm is currently draining!
        //---------------------------------------------------------------------------------------------------------------------------
        // Find our target based on the data embedded in Draining effect.  Our roll to hit is going to be ignored 
        //
        let latchedUuid = null, lToken = null;
        for (let i = 0; i < DRAINING_EFFECT.data.changes.length; i++) {
            const CHANGE_TOKENS = DRAINING_EFFECT.data.changes[i].value.split(" ")
            if (CHANGE_TOKENS[0] !== 'Remove_Paired_Effect') continue;  // If first token isn't what we need go to next line
            if (CHANGE_TOKENS.length !== 2) continue;                   // Must have two tokens on line we seek
            latchedUuid = CHANGE_TOKENS[1];                            // Second token is our effect UUID that contains UUID
            endOfTargetPhrase = latchedUuid.indexOf(".ActiveEffect.")  // Get position of end of our Uuid
            latchedUuid = latchedUuid.slice(0, endOfTargetPhrase)
            if (TL > 1) jez.log(`${TAG} Latched UUID`, latchedUuid)
            // if (TL > 1) jez.log(`${TAG} Effect Info`, 'Target UUID', tToken.actor.uuid, 'Latched UUID', latchedUuid)
            // if (latchedUuid !== tActor.uuid) return jez.badNews(`Must be targeting creature latched, when draining.`, 'i')
            // Get the lToken from the latchedUuid
            let lTokenDocument5e = await fromUuid(latchedUuid)          // Retrieves document for the UUID
            if (!lTokenDocument5e) return jez.badNews(`Could not find token ${latchedUuid}`)
            lToken = lTokenDocument5e._object                       // Nabs the Token5e out of a aTokenDocument5e
            break;
        }
        //------------------------------------------------------------------------------------------------------------------------
        // Apply damage to our target
        //
        let dRoll = await new Roll(`${drainDice}d4[piercing] + ${aActor.data.data.abilities.con?.mod}`).roll({ async: true });
        await game.dice3d?.showForRoll(dRoll);
        new MidiQOL.DamageOnlyWorkflow(aActor, aToken, dRoll.total, "piercing", [lToken], dRoll, {
            flavor: `${CONFIG.DND5E.damageTypes['piercing']}`, itemCardId: args[0].itemCardId
        })
        await jez.wait(500)
        //------------------------------------------------------------------------------------------------------------------------
        // Grab flag value that has been tracking our damage by draining so far add new drain check for Satiation
        //
        const FLAG_VALUE = await DAE.getFlag(aActor, BLOOD_DRAINED_FLAG)
        const BLOOD_DRAINED_SO_FAR = FLAG_VALUE ? FLAG_VALUE : 0;
        if (TL > 1) jez.log(`${TAG} ${BLOOD_DRAINED_SO_FAR} Blood drained previously plus new drain of ${dRoll.total}`)
        await DAE.setFlag(aActor, BLOOD_DRAINED_FLAG, dRoll.total + BLOOD_DRAINED_SO_FAR);
        if (dRoll.total + BLOOD_DRAINED_SO_FAR >= satiated) {
            isSatiated = true
            await DAE.unsetFlag(aActor, BLOOD_DRAINED_FLAG);
        }
        if (isSatiated) { // Add the DAE satiated effect
            ceDesc = `Filled with blood, can drink no more.`
            effectData = {
                label: SATIATED_EFFECT_NAME,
                icon: SATIATED_IMG,
                origin: aActor.uuid,
                disabled: false,
                flags: {
                    convenientDescription: ceDesc,
                    core: { statusId: 'Force Display' }
                },
            };
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
            //-----------------------------------------------------------------------------------------------------------------------
            // Call tokenAttacher to release the follow
            //
            await tokenAttacher.detachElementsFromToken([aToken], lToken, true);
            await DAE.unsetFlag(aActor, LATCHED_TOKEN_ID_FLAG)
            ui.chat.processMessage(`I have drank my fill.`);
            //-----------------------------------------------------------------------------------------------------------------------
            // Exit message
            //
            postResults(`${aToken.name} appears to be bloated with blood as it releases its grasp on ${lToken.name}`)
            //-----------------------------------------------------------------------------------------------------------------------
            // Clear the drinking effect
            //
            DRAINING_EFFECT.delete()
        } else postResults(`${aToken.name} maintains its grasp on ${tToken.name}, as it continues drinking.`)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    if (TL > 0) jez.log(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //---------------------------------------------------------------------------------------------------------------------------
    // Get the token from FLAG, then go get the token for the detacher to use.
    //
    const LATCHED_TOKEN_UUID = await DAE.getFlag(aActor, LATCHED_TOKEN_ID_FLAG)
    if (TL > 1) jez.log(`${TAG} ${LATCHED_TOKEN_ID_FLAG}`, LATCHED_TOKEN_UUID)
    if (!LATCHED_TOKEN_UUID) return                             // Can be blank if already deleted, in which case quit
    let tTokenDocument5e = await fromUuid(LATCHED_TOKEN_UUID)   // Retrieves document for the UUID
    let tToken = tTokenDocument5e._object                       // Nabs the Token5e out of a aTokenDocument5e
    await DAE.unsetFlag(aActor, LATCHED_TOKEN_ID_FLAG)
    //-----------------------------------------------------------------------------------------------------------------------
    // Call tokenAttacher to release the follow
    //
    await tokenAttacher.detachElementsFromToken([aToken], tToken, true);    // true is supressing notifications
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return;
}