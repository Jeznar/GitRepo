const MACRONAME = "Devourer_Imprison_Soul.0.1.js"
const TL = 5                               // Trace Level for this macro
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Implement Devourer's Imprison Soul.  This ability is a mess!
 * 
 *   The devourer chooses a living humanoid with 0 hit points that it can see within 30 feet of it.
 * 
 *   That creature is teleported inside the devourer's ribcage and imprisoned there. A creature 
 *   imprisoned in this manner has disadvantage on death saving throws.
 * 
 *   If it dies while imprisoned, the devourer regains 25 hit points, immediately recharges Soul 
 *   Rend, and gains an additional action on its next turn.
 * 
 *   Additionally, at the start of its next turn, the devourer regurgitates the slain creature as a 
 *   bonus action, and the creature becomes an undead. If the victim had 2 or fewer Hit Dice, it 
 *   becomes a zombie. If it had 3 to 5 Hit Dice, it becomes a ghoul. Otherwise, it becomes a wight. 
 *   A devourer can imprison only one creature at a time.
 * 
 * 10/02/23 0.1 Creation of Macro from Rutterkin_Crippling_Fear.0.1.js
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.log(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
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
const EFFECT_NAME = "Imprisoned Soul"
const EFFECT2_NAME = 'Digesting'
const EFFECT_IMAGE = aItem.img
const EFFECT2_IMAGE = "Icons_JGB/Misc/stomach.webp"
let ceDesc = ""
const GAME_RND = game.combat ? game.combat.round : 0;
const MAX_RANGE = 33 // feet
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });     // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.log(`=== Finished === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 2) jez.log("postResults Parameters", "msg", msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.log(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Do the things that need doing
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    // Function variables
    //
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;

    placeUndead(tToken, {traceLvl: TL})
return

    //-----------------------------------------------------------------------------------------------
    // Are we already digesting a target?
    //
    if (jezcon.hasCE(EFFECT2_NAME, aToken.actor.uuid)) {
        const DIGESTING_EFFECT = await aActor?.effects?.find(ef => ef?.data?.label === EFFECT2_NAME)
        if (TL > 2) jez.log(`${TAG} Digesting Effect`, DIGESTING_EFFECT)
        if (!DIGESTING_EFFECT) return jez.badNews(`Could not find ${DIGESTING_EFFECT}`,'e')
        const CE_DESC = DIGESTING_EFFECT.data.flags.convenientDescription
        if (TL > 2) jez.log(`${TAG} Description`, CE_DESC)
        const DESC_ATOMS = CE_DESC.split(' ')
        const TARGET_ID = DESC_ATOMS[DESC_ATOMS.length - 1]
        if (TL > 2) jez.log(`${TAG} Target ID`, TARGET_ID)
        const TARGET_TOKEN = canvas.tokens.placeables.find(ef => ef.id === TARGET_ID)
        if (TL > 2) jez.log(`${TAG} Target Token`, TARGET_TOKEN)
        // Is our target dead?  (3 failed saves, if so, drop the effect and spit out an undead)
        if (TARGET_TOKEN.actor.data.data.attributes.death.failure > 2) {
            await tokenAttacher.detachElementsFromToken([TARGET_TOKEN], aToken, true);
            const EFFECT = await aToken?.actor?.effects?.find(ef => ef?.data?.label === EFFECT2_NAME)
            EFFECT.delete()
            placeUndead(TARGET_TOKEN, {traceLvl: TL})
            return postResults(`${TARGET_TOKEN.name} is dead, remnants are vomited forth`)
        }
        if (TL > 1) jez.log(`${TAG} ${aToken.name} is already ${EFFECT2_NAME}.`)
        return postResults(`${aToken.name} is already ${EFFECT2_NAME} ${TARGET_TOKEN.name}`)





        // TODO: Check to see if our meal is finished and remains should be expelled


    }
    //-----------------------------------------------------------------------------------------------
    // Do we have a legitimate target?  It must meet the spell criteria:
    //  1. Within 30 feet 
    //  2. Must be a PC, NPCs are dead at 0 hp
    //  3. Must be at 0 HP
    //  4. Must not have three failed death saves.
    //
    const TOKEN_DATA = await tActor.getTokenData()
    if (TL > 1) jez.log(`${TAG} | TOKEN_DATA`,TOKEN_DATA)
    // Check the distance
    if (jez.getDistance5e(aToken, tToken) > MAX_RANGE) return postResults(`${tToken.name} is too far away.`)
    // Is the target a PC?
    if (await jez.isNPC(tActor.uuid))  return postResults(`${tToken.name} is an NPC.`)
    // Is the target at 0 HP?
    if (tActor.data.data.attributes.hp.value > 0) return postResults(`${tToken.name} is not dieing.`)
    // Has the target failed three death saves?
    if (tActor.data.data.attributes.death.failure > 2) return postResults(`${tToken.name} is already dead.`)
    //------------------------------------------------------------------------------------------------------------------------
    // Use tokenAttacher to attach the tToken to the aToken
    //
    let newCoords = { x: tToken.x, y: tToken.y };
    if (aToken.x + aToken.w - tToken.w < tToken.x) newCoords.x = aToken.x + aToken.w - tToken.w;
    else if (aToken.x > tToken.x) newCoords.x = aToken.x;
    if (aToken.y + aToken.h - tToken.h < tToken.y) newCoords.y = aToken.y + aToken.h - tToken.h;
    else if (aToken.y > tToken.y) newCoords.y = aToken.y;
    await tToken.document.update({ x: newCoords.x, y: newCoords.y });
    await tokenAttacher.attachElementToToken(tToken, aToken, true);
    await tokenAttacher.setElementsLockStatus(tToken, false, true);
    await tokenAttacher.setElementsMoveConstrainedStatus(tToken, true, true, { type: tokenAttacher.CONSTRAINED_TYPE.TOKEN_CONSTRAINED });
    //-----------------------------------------------------------------------------------------------
    // Apply EFFECT_NAME to tActor which forces disadvantage on death saves.
    //
    await applyImprisoned(tToken, aToken)
    //-----------------------------------------------------------------------------------------------
    // Apply EFFECT2_NAME to aActor keeping track of id of swallowed token.
    //
    await applyDigesting(aToken, tToken)
    //-----------------------------------------------------------------------------------------------
    // Pair the effects
    //
    // await jez.wait(1000)
    const EFFECT = await aToken?.actor?.effects?.find(ef => ef?.data?.label === EFFECT2_NAME)
    if (TL > 2) jez.log(`${TAG} EFFECT applied: `, EFFECT)
    // Find the draining effect on our active actor
    const EFFECT2 = await tToken?.actor?.effects?.find(ef => ef?.data?.label === EFFECT_NAME)
    if (TL > 2) jez.log(`${TAG} EFFECT2 applied: `, EFFECT2)
    const GM_PAIR_EFFECTS = jez.getMacroRunAsGM("PairEffects") 
    if (!GM_PAIR_EFFECTS) return jez.badNews(`Could not find PairEffects macro`,'e')
    GM_PAIR_EFFECTS.execute(EFFECT.uuid, EFFECT2.uuid)

    return

}
/***************************************************************************************************
 * Apply the Fear condition to a token, adding CEDesc
 ***************************************************************************************************/
async function applyImprisoned(token, actor) {
    const CE_DESC = `Imprisoned within ${actor.name}`
    let effectData = [{
        label: EFFECT_NAME,
        icon: EFFECT_IMAGE,
        origin: LAST_ARG.uuid,
        disabled: false,
        flags: {
            dae: { stackable: false },
            convenientDescription: CE_DESC,
            isConvenient: true,
            isCustomConvenient: true,
            core: { statusId: 'Force Display' }
        },
        changes: [
            { key: `flags.midi-qol.disadvantage.deathSave`, mode: jez.CUSTOM, value: '0', priority: 20 },
            { key: `macro.itemMacro`, mode: jez.CUSTOM, value: aToken.id, priority: 20 },
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token.actor.uuid, effects: effectData });
    // runVFX(token)
}
/***************************************************************************************************
 * Apply the Immunity condition to a token, adding CEDesc
 ***************************************************************************************************/
async function applyDigesting(token, target) {
    const CE_DESC = `Digesting ${target.name} ${target.id}`
    let effectData = [{
        label: EFFECT2_NAME,
        icon: EFFECT2_IMAGE,
        origin: LAST_ARG.uuid,
        disabled: false,
        // duration: { rounds: 14400, seconds: 86400, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: {
            dae: { stackable: false },
            convenientDescription: CE_DESC,
            isConvenient: true,
            isCustomConvenient: true,
            core: { statusId: 'Force Display' }
        },
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token.actor.uuid, effects: effectData });
}
/***************************************************************************************************
 * Additionally, at the start of its next turn, the devourer regurgitates the slain creature as a 
 * bonus action, and the creature becomes an undead. If the victim had 2 or fewer Hit Dice, it 
 * becomes a zombie. If it had 3 to 5 Hit Dice, it becomes a ghoul. Otherwise, it becomes a wight. 
 * A devourer can imprison only one creature at a time.
 ***************************************************************************************************/
async function placeUndead(tToken, options={}) {
    const FUNCNAME = "placeUndead(tToken, options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "tToken", tToken, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    const HIT_DICE_CNT = jez.isPC(tToken) ? tToken.actor.data.data.details.level : tToken.actor.data.data.details.cr
    if (TL > 2) jez.log(`${TAG} HIT_DICE_CNT`, HIT_DICE_CNT)
    let spawn = "Wight"
    if (HIT_DICE_CNT <= 2) spawn = "Zombie"
    if (HIT_DICE_CNT >= 3 && HIT_DICE_CNT <= 5) spawn = "Ghoul"
    //-------------------------------------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    let summonData = await game.actors.getName(spawn)
    if (TL > 2) jez.log(`${TAG} summonData`, summonData)
    if (!summonData) return jez.badNews(`Could not find ${spawn} template actor`, 'e')
    // Build the dataObject for our summon call, all we need to do is customize the name and elevation
    let argObj = {
        minionName: `${aToken.name}'s ${spawn}`,
        img: summonData?.img ?? aItem.img
    }
    if (TL > 2) jez.log(`${TAG} argObj`, argObj)
    // Do the actual summon
    summonedMinionId = await jez.spawnAt(spawn, aToken, aActor, aItem, argObj)
    if (TL > 2) jez.log(`${TAG} summonedMinionId`, summonedMinionId)
    // Add our summons to combat tracker after summoner if in combat
    const ATOKEN_INIT_VALUE = aToken?.combatant?.data?.initiative
    if (TL > 1) jez.trace(`${TAG} ${aToken.name} initiative`, ATOKEN_INIT_VALUE);
    if (ATOKEN_INIT_VALUE) {
        const SPAWN_INT = ATOKEN_INIT_VALUE - 1 / 1000;
        await jez.combatAddRemove('Add', summonedMinionId[0], { traceLvl: TL })
        await jez.wait(250)
        await jez.combatInitiative(summonedMinionId[0], { formula: SPAWN_INT, traceLvl: 0 })
    }
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Release the follow when effect goes away
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Comments
    //
    const TAR_TOKEN = canvas.tokens.placeables.find(ef => ef.id === args[1])
    await tokenAttacher.detachElementsFromToken([aToken], TAR_TOKEN, true);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return;
}
/***************************************************************************************************
 * Run Frightened VFX on Target
 ***************************************************************************************************/
async function runVFX(target) {
    const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/UI/IconHorror_*_200x200.webm"
    new Sequence()
        .effect()
        .fadeIn(1000)
        .fadeOut(1000)
        .file(VFX_LOOP)
        .atLocation(target)
        .scaleToObject(1.25)
        .play();
}