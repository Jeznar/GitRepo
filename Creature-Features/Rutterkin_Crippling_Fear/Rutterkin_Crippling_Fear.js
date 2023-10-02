const MACRONAME = "Rutterkin_Crippling_Fear.0.1.js"
const TL = 0;                               // Trace Level for this macro
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Implement Rutterkin's Crippling Fear.  This ability should be used at the start of each creature's 
 * turn when they are close enough to Rutterkins (3+) to be potentially affected.
 * 
 *   When a creature that isn't a demon starts its turn within 30 feet of three or more rutterkins, 
 *   it must make a DC 11 WIS Save. The creature has disadvantage on the save if it's within 30 feet 
 *   of six or more rutterkins. On a successful save, the creature is immune to the Crippling Fear of 
 *   all rutterkins for 24 hours. On a failed save, the creature becomes frightened of the rutterkins 
 *   for 1 minute. While frightened in this way, the creature is restrained.
 * 
 * 10/02/23 0.1 Creation of Macro
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
const EFFECT_NAME = "Crippling Fear of Rutterkins"
const EFFECT_IMMUNE_NAME = "Crippling Fear Immune"
const EFFECT_IMAGE = 'systems/dnd5e/icons/spells/horror-red-2.jpg'
const EFFECT_IMMUNE_IMAGE = 'systems/dnd5e/icons/spells/horror-eerie-2.jpg'
let ceDesc = ""
const GAME_RND = game.combat ? game.combat.round : 0;
const SAVE_DC = 11
const SAVE_STAT = 'wis'
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });     // Midi ItemMacro On Use
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
    //-----------------------------------------------------------------------------------------------
    // 1. If our target is a demon or already immune, it is immune.  Also skip if already affected.
    //
    let race = jez.getRace(tToken)
    if (TL > 1) jez.log(`${TAG} | Target race`,race)
    if (race.includes("demon")) {
        postResults(`${tToken.name} is immune (${race})`)
        return; 
    }
    let subRace = jez.getRaceSubType(tToken)
    if (TL > 1) jez.log(`${TAG} | Target subRace`,subRace)
    if (subRace.includes("demon")) {
        postResults(`${tToken.name} is immune (${subRace})`)
        return; 
    }
    if (jezcon.hasCE(EFFECT_IMMUNE_NAME, tToken.actor.uuid, { traceLvl: 0 })) {
        if (TL > 1) jez.log(`${TAG} ${tToken.name} is already.`)
        return postResults(`${tToken.name} is immune`)
    }
    if (jezcon.hasCE(EFFECT_NAME, tToken.actor.uuid, { traceLvl: 0 })) {
        if (TL > 1) jez.log(`${TAG} ${tToken.name} is already affected.`)
        return postResults(`${tToken.name} is already affected.`)
    }
    //-----------------------------------------------------------------------------------------------
    // 2. Find Rutterkins that are within 30 feet of target
    //
    let returned = await jez.inRangeTargets(tToken, 30, { traceLvl: 0 });
    let rutterkinCount = 0
    if (returned.length === 0) return jez.badNews(`No tokens in range`, "i")
    for (let i = 0; i < returned.length; i++) {
        // I'll assume if the string rutterkin is in the creature's actor name it is a Rutterkin
        jez.log(`${FNAME} | ${i} Tokens: ${returned[i].actor.name}`)
        if (returned[i].actor.name.toLowerCase().includes('rutterkin')) rutterkinCount++;
    }
    if (TL > 1) jez.log(`${FNAME} | Rutterkin count`, rutterkinCount)
    if (rutterkinCount < 3) return postResults(`Not enough Rutterkins near ${tToken.name} to worry about.`)
    //-----------------------------------------------------------------------------------------------
    // 3. Set disadvantage boolean, 6+ rutterkins is true
    //
    const HAS_DISADVANTAGE = rutterkinCount >= 6 ? true : false
    if (TL>1) jez.log(`${FNAME} | Disadvantage on saving throw`, HAS_DISADVANTAGE)
    //-----------------------------------------------------------------------------------------------
    // 4. Roll saving throw for the target 
    //
    if (HAS_DISADVANTAGE)
        save = (await tToken.actor.rollAbilitySave(SAVE_STAT, { disadvantage: true, chatMessage: true, fastforward: true }));
    else
        save = (await tToken.actor.rollAbilitySave(SAVE_STAT, { flavor: null, chatMessage: true, fastforward: true }));
    //-----------------------------------------------------------------------------------------------
    // 5. On a save, grant immunity to the target, on failure give bad stuff
    //
    if (save.total >= SAVE_DC) {    // Save was made
        applyImmune(tToken)
        postResults(`${tToken.name} resists the effect and is now immune to it for some time.`)
    } else {
        let aEffect = await tActor?.effects?.find(ef => ef?.data?.label === EFFECT_NAME)
        if (aEffect) {
            await aEffect.delete(); // clear prexisiting effect
            await jez.wait(250)
        }
        applyFear(tToken)
        postResults(`${tToken.name} is effected by ${aItem.name}.`)
    }
}
/***************************************************************************************************
 * Apply the Fear condition to a token, adding CEDesc
 ***************************************************************************************************/
async function applyFear(token) {
    const CE_DESC = `Frightened of Rutterkins`
    let effectData = [{
        label: EFFECT_NAME,
        icon: EFFECT_IMAGE,
        origin: LAST_ARG.uuid,
        disabled: false,
        flags: {
            dae: { stackable: false },
            convenientDescription: CE_DESC,
            isConvenient: true,
            isCustomConvenient: true
        },
        duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
        changes: [
            { key: `macro.CE`, mode: jez.CUSTOM, value: `Restrained`, priority: 20 },
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token.actor.uuid, effects: effectData });
    runVFX(token)
}
/***************************************************************************************************
 * Apply the Immunity condition to a token, adding CEDesc
 ***************************************************************************************************/
async function applyImmune(token) {
    const CE_DESC = `Immune to ${aToken.name}'s ${EFFECT_NAME} for some time.`
    let effectData = [{
        label: EFFECT_IMMUNE_NAME,
        icon: EFFECT_IMMUNE_IMAGE,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 14400, seconds: 86400, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: {
            dae: { stackable: false },
            convenientDescription: CE_DESC,
            isConvenient: true,
            isCustomConvenient: true
        },
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token.actor.uuid, effects: effectData });
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