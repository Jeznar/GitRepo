const MACRONAME = "Stench_of_Death.0.1.js"
const TL = 0;                              
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * This macro checks for invulnerability and then applies effect as appropriate.
 * 
 * 10/04/23 0.1 Creation of Macro from Soul_Rend.0.1
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
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
const IMMUNE_RACES = new Set(['construct', 'undead'])
const EFFECT1_NAME = aItem.name
const EFFECT2_NAME = `Immune: ${aItem.name}`
const EFFECT1_IMG = aItem.img
const EFFECT2_IMG = 'Icons_JGB/Misc/Stench/Stench-immune.png'
const INCAPACITATED_JRNL = `@JournalEntry[${game.journal.getName('Incapacitated').id}]{Incapacitated}`
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.macroPass === 'preItemRoll') {       // Execute only when called before the item
   preItemRoll({ traceLvl: TL });               // Manipulate the data to set correct targets
   return
}
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
// DamageBonus must return a function to the caller
if (TL > 1) jez.log(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODYo
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (args[0].targets.length !== 1)
        return jez.badNews(`Must target exactly one target.  ${args[0].targets?.length} were targeted.`, 'w')
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
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
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // If the target is an NPC and is construct or undead it is naturally immune.  Not checking PCs as the field is free text
    //
    if (jez.isNPC(tToken)) {
        let race = jez.getRace(tToken).toLowerCase()
        if (TL > 1) jez.log(`${TAG} | Target's race`, race)
        if (IMMUNE_RACES.has(race)) return postResults(`${tToken.name} is immune (${race})`)
        let subRace = jez.getRaceSubType(tToken).toLowerCase()
        if (TL > 1) jez.log(`${TAG} | Target subRace`, subRace)
        if (IMMUNE_RACES.has(subRace)) return postResults(`${tToken.name} is immune (${race}: ${subRace})`)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // If the target already has an immunity effect it is, shockingly immune
    //
    if (jezcon.hasCE(EFFECT2_NAME, tToken.actor.uuid)) return postResults(`${tToken.name} is immune`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Determine if the target succeeded on the saving throw
    //
    let madeSave = L_ARG.saves.length === 1 ? true : false
    //-------------------------------------------------------------------------------------------------------------------------------
    // Determine if the target is immune or resistant to poison and thus auto-succeeds on the saving throw
    //
    if (TL > 1) jez.log(`${TAG} | Target's traits`, tToken.actor.data.data.traits)
    if (tToken.actor.data.data.traits.ci.value.includes("poisoned")) {
        msg = `${tToken.name} auto succeeds on save because of condition immunity.`
        postResults(msg)
        madeSave = true
        if (TL > 1) jez.log(TAG, msg)
        await jez.wait(500)
    } else if (tToken.actor.data.data.traits.di.value.includes("poison")) {
        msg = `${tToken.name} auto succeeds on save because of damage immunity.`
        postResults(msg)
        madeSave = true
        if (TL > 1) jez.log(TAG, msg)
        await jez.wait(500)
    } else if (tToken.actor.data.data.traits.dr.value.includes("poison")) {
        msg = `${tToken.name} auto succeeds on save because of damage resistance.`
        postResults(msg)
        madeSave = true
        if (TL > 1) jez.log(TAG, msg)
        await jez.wait(500)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // If target made its saving throw, give it the immunity effect
    //
    if (madeSave) {
        const CE_DESC = `Immune to ${EFFECT1_NAME} for some time.`
        let effectData = [{
            label: EFFECT2_NAME,
            icon: EFFECT2_IMG,
            origin: L_ARG.uuid,
            disabled: false,
            duration: { rounds: 14400, seconds: 86400, startRound: GAME_RND, startTime: game.time.worldTime },
            flags: {
                dae: { stackable: false },
                convenientDescription: CE_DESC,
                isConvenient: true,
                isCustomConvenient: true
            },
        }];
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: effectData });
        return postResults(`${tToken.name} resists and gains temporary immunity to ${aItem.name}`)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // If target failed its save, give it the debuff
    //
    if (!madeSave) {
        const CE_DESC = `Incapcitated by ${EFFECT1_NAME}`
        let effectData = [{
            label: EFFECT1_NAME,
            icon: EFFECT1_IMG,
            origin: L_ARG.uuid,
            disabled: false,
            duration: { rounds: 1, seconds: 6, startRound: GAME_RND, startTime: game.time.worldTime },
            flags: {
                dae: { stackable: false, specialDuration: ["turnEnd"] },
                convenientDescription: CE_DESC,
                isConvenient: true,
                isCustomConvenient: true
            },
            changes: [
                { key: `macro.CE`, mode: jez.CUSTOM, value: `Incapacitated`, priority: 20 },
            ]
        }];
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: effectData });
        return postResults(`${tToken.name} is ${INCAPACITATED_JRNL} by ${aItem.name}`)
    }
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Run a nice little VFX from active token to summoning token
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function runVFX(target, caster) {
    const BEAM_VFX = 'jb2a.energy_beam.normal.greenyellow.02'
    new Sequence()
        .effect()
            .file(BEAM_VFX)
            .atLocation(target)
            .stretchTo(caster)
        .play();
}