const MACRONAME = "Prismatic_Spray.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro implements Prismatic Spray.
 *
 *   Eight multicolored rays of light flash from your hand. Each ray is a different color and has a
 *   different power and purpose. Each creature in a 60-foot cone must make a Dexterity saving throw.
 *   For each target, roll a d8 to determine which color ray affects it.
 *   1. Red. The target takes 10d6 fire damage on a failed save, or half as much damage on success.
 *   2. Orange. The target takes 10d6 acid damage on a failed save, or half as much damage on success.
 *   3. Yellow. The target takes 10d6 lightning damage on a failed save, or half as much damage on a
 *      successful one.
 *   4. Green. The target takes 10d6 poison damage on a failed save, or half as much damage on a
 *      successful one.
 *   5. Blue. The target takes 10d6 cold damage on a failed save, or half as much damage on a
 *      successful one.
 *   6. Indigo. On a failed save, the target is Restrained. It must then make a Constitution saving
 *      throw at the end of each of its turns. If it successfully saves three times, the spell ends.
 *      If it fails its save three times, it permanently turns to stone and is subjected to the
 *      Petrified condition. The successes and failures don't need to be consecutive; keep track of
 *      both until the target collects three of a kind.
 *   7. Violet. On a failed save, the target is Blinded. It must then make a Wisdom saving throw at
 *      the start of your next turn. A successful save ends the blindness. If it fails that save,
 *      the creature is transported to another plane of existence of the DM's choosing and is no
 *      longer Blinded. (Typically, a creature that is on a plane that isn't its home plane is
 *      banished home, while other creatures are usually cast into the Astral or Ethereal planes.)
 *   8. Special. The target is struck by two rays. Roll twice more, rerolling any 8.
 *
 * 11/24/22 0.1 Creation of Macro from Gauth_Eye_Rays.0.2.js
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
const BEAM_CNT = 8     // Number of beams defined
let rayArray = []
const DELAY = 1500  // Time between ray attacks
const SAVE_DC = aActor.data.data.attributes.spelldc;
const GAME_RND = game.combat ? game.combat.round : 0;
const DICE_DELAY = 250
const BEAM_NAME_ARRAY = ["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet", "Special"]
const BEAM_TYPE_COUNT = BEAM_NAME_ARRAY.length
const VFX_PATH = 'modules/jb2a_patreon/Library/2nd_Level/Scorching_Ray'
const VFX_DURATION = 12  // Duration of VFX effects in seconds
const BEAM_VFX = [
    `${VFX_PATH}/ScorchingRay_01_Regular_Red_30ft_1600x400.webm`,
    `${VFX_PATH}/ScorchingRay_01_Regular_Orange_30ft_1600x400.webm`,
    `${VFX_PATH}/ScorchingRay_01_Regular_Yellow_30ft_1600x400.webm`,
    `${VFX_PATH}/ScorchingRay_01_Regular_Green_30ft_1600x400.webm`,
    `${VFX_PATH}/ScorchingRay_01_Regular_Blue_30ft_1600x400.webm`,
    `modules/jb2a_patreon/Library/Generic/Energy/EnergyBeam_02_Dark_PurpleRed_30ft_1600x400.webm`,
    `${VFX_PATH}/ScorchingRay_02_Regular_Blue_30ft_02_1600x400.webm`
]
const JRNL_BLINDED = `@JournalEntry[${game.journal.getName("Blinded").id}]{Blinded}`
const JRNL_RESTRAINED = `@JournalEntry[${game.journal.getName("Restrained").id}]{Restrained}`
const JRNL_PETRIFIED = `@JournalEntry[${game.journal.getName("Restrained").id}]{Restrained}`
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`=== Finished === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    await jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Post a new chat message
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function postBeamResult(beam, msg) {
   const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace(`${TAG} Parameters`, "beam", beam, "msg", msg)
    //-----------------------------------------------------------------------------------------------
    // map beam colors to HTML color
    //
    let textColor = ""
    switch(beam) {
        case "Red":
        case "Orange":
        case "Green":
        case "Blue":
        case "Violet": textColor = `Dark${beam}`; break;
        case "Yellow": textColor = `GoldenRod`; break;
        case "Indigo": textColor = beam; break;
        default: textColor = jez.randomDarkColor();
      }
    //-----------------------------------------------------------------------------------------------
    //
    jez.postMessage({
        color: textColor, fSize: 14, icon: aItem.img, msg: msg,
        title: `${aItem.name}: ${beam} Beam`, token: aToken })
    if (TL > 1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //----------------------------------------------------------------------------------
    // Define values for this function
    //
    const TEMPLATE_ID = args[0].templateId
    //----------------------------------------------------------------------------------
    // Delete the targeting template
    //
    canvas.templates.get(TEMPLATE_ID).document.delete()
    //-----------------------------------------------------------------------------------------------
    // Set some handy constant arrays and verufy at least one token targeted
    //
    const FSD = args[0].failedSaves
    const FSU = args[0].failedSaveUuids
    const MSD = args[0].saves
    const MSU = args[0].saveUuids
    if (TL > 2) jez.trace(`${TAG} Those who failed saves`,
        `Made Save UUID Array       ==>`, MSU,
        `Made Save Document Array   ==>`, MSD,
        `Failed Save UUID Array     ==>`, FSU,
        `Failed Save Document Array ==>`, FSD)
    if (FSU.length + MSU.length === 0) {
        postResults(`No targets in area of effect.  No effects.`)
        return
    }
    //-----------------------------------------------------------------------------------------------
    // Step through failured saves, firing at each
    //
    for (let i = 0; i < FSD.length; i++) {
        if (FSD[i]._object.id === aToken.id) continue;  // Skip self, if accidentally targeted
        if (TL > 2) jez.trace(`${TAG} ${FSD[i]._object.name} Failed save.`, FSD[i]._object)
        let beamRollObj = new Roll(`1d8`).evaluate({ async: false });
        game.dice3d?.showForRoll(beamRollObj);
        await fireBeam(aToken, FSD[i]._object, beamRollObj.total, { saved: false, traceLvl: TL })
        await jez.wait(DICE_DELAY) // Let the dice clear
    }
    //-----------------------------------------------------------------------------------------------
    // Step through successful saves, firing at each
    //
    for (let i = 0; i < MSD.length; i++) {
        if (MSD[i]._object.id === aToken.id) continue;  // Skip self, if accidentally targeted
        if (TL > 2) jez.trace(`${TAG} ${MSD[i]._object.name} Failed save.`, MSD[i]._object)
        let beamRollObj = new Roll(`1d8`).evaluate({ async: false });
        game.dice3d?.showForRoll(beamRollObj);
        await fireBeam(aToken, MSD[i]._object, beamRollObj.total, { saved: true, traceLvl: TL })
        await jez.wait(DICE_DELAY) // Let the dice clear
    }
    return
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Pick a Beam and fire it at target
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function fireBeam(aToken, tToken, beamIdx, options = {}) {
    const FUNCNAME = "fireBeam(aToken, tToken, beamIdx, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace(`${TAG} Parameters`, "aToken ", aToken, "tToken ", tToken,
        "beamIdx", beamIdx, "options", options)
    //-----------------------------------------------------------------------------------------------
    // Set Function Variables
    //
    const SAVED = options.saved ?? false
    // const FIRST = options.saved ?? true
    //-----------------------------------------------------------------------------------------------
    // If beam 8 was selected, call this function twice, with only beams 1-7 as choices
    //
    if (beamIdx === 8) {
        if (TL > 1) jez.trace(`${TAG} Rolling two beams to handle Special (8) on first pass`);
        let newBeamIdx = Math.floor(Math.random() * 8) + 1; // Random 1 to 7
        fireBeam(aToken, tToken, newBeamIdx, { saved: SAVED, traceLvl: TL })
        newBeamIdx = Math.floor(Math.random() * 8) + 1; // Random 1 to 7
        await jez.wait(DICE_DELAY) // Let the saving throw dice clear
        fireBeam(aToken, tToken, newBeamIdx, { saved: SAVED, traceLvl: TL })
        return
    }
    //-----------------------------------------------------------------------------------------------
    // Initiate the VFX at our poor sap
    //
    runVFX(aToken, tToken, BEAM_VFX[beamIdx - 1], { traceLvl: TL })
    //-----------------------------------------------------------------------------------------------
    // Perform actual beam effects
    //
    let tl = TL
    switch (beamIdx) {
        case 1: // Red. The target takes 10d6 fire damage
            await zapTarget(aToken, tToken, SAVED, "fire", beamIdx, { traceLvl: tl })
            break;
        case 2: // Orange. The target takes 10d6 acid damage
            await zapTarget(aToken, tToken, SAVED, "acid", beamIdx, { traceLvl: tl })
            break;
        case 3: // Yellow. The target takes 10d6 lightning damage
            await zapTarget(aToken, tToken, SAVED, "lightning", beamIdx, { traceLvl: tl })
            break;
        case 4: // Green. The target takes 10d6 poison damage
            await zapTarget(aToken, tToken, SAVED, "poison", beamIdx, { traceLvl: tl })
            break;
        case 5: // Blue. The target takes 10d6 cold damage
            await zapTarget(aToken, tToken, SAVED, "cold", beamIdx, { traceLvl: tl })
            break;
        case 6: // Indigo. On a failed save, the target is restrained...
            await zapTargetIndigo(aToken, tToken, SAVED, { traceLvl: tl })
            break;
        case 7: // Violet. On a failed save, the target is blinded...
            await zapTargetViolet(aToken, tToken, SAVED, { traceLvl: tl })
            break;
        default:
            return jez.badNews(`${TAG} Illegal beam index, shouldn't happen...`)
    }

}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function zapTarget(ACTIVE_TOKEN, TARGET_TOKEN, SAVED, DAMAGE_TYPE, BEAM_IDX, options = {}) {
    const FUNCNAME = "zapTarget(tToken, SAVED, DAMAGE_TYPE, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `jez.lib ${FNAME} |`
    const TL = options.traceLvl ?? 0
    const DAMAGE_ROLL = "10d6"
    let description = ""
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Start ${FNAME}`,
        "ACTIVE_TOKEN", ACTIVE_TOKEN,
        "TARGET_TOKEN", TARGET_TOKEN,
        "SAVED       ", SAVED,
        "DAMAGE_TYPE ", DAMAGE_TYPE,
        "BEAM_IDX    ", BEAM_IDX,
        "options     ", options);
    //-----------------------------------------------------------------------------------------------
    if (TL > 1) jez.trace(`${TAG} Apply ${DAMAGE_ROLL} ${DAMAGE_TYPE} damage to ${TARGET_TOKEN.name}`);
    let damageRoll = new Roll(`${DAMAGE_ROLL}`).evaluate({ async: false });
    if (TL > 2) jez.trace(`${TAG} Damage Rolled ${damageRoll.total}`, damageRoll)
    // game.dice3d?.showForRoll(damageRoll);
    // Apply full damage to target, if it failed its save, otherwise half
    if (!SAVED) {
        new MidiQOL.DamageOnlyWorkflow(ACTIVE_TOKEN.actor, TARGET_TOKEN, damageRoll, DAMAGE_TYPE, [], damageRoll,
            { flavor: "Prismatic Spray", itemCardId: args[0].itemCardId });
        MidiQOL.applyTokenDamage([{ damage: damageRoll.total, type: DAMAGE_TYPE }], damageRoll.total,
            new Set([TARGET_TOKEN]), aItem, new Set());
        description = `It took ${damageRoll.total} ${DAMAGE_TYPE} damage.`
    }
    else {
        let halfdam = Math.floor(damageRoll.total / 2)
        new MidiQOL.DamageOnlyWorkflow(ACTIVE_TOKEN.actor, TARGET_TOKEN, damageRoll, DAMAGE_TYPE, [], damageRoll,
            { flavor: "Prismatic Spray", itemCardId: args[0].itemCardId });
        MidiQOL.applyTokenDamage([{ damage: halfdam, type: DAMAGE_TYPE }], halfdam,
            new Set([TARGET_TOKEN]), aItem, new Set());
        description = `It took ${halfdam} ${DAMAGE_TYPE} damage.`
    }
    //-----------------------------------------------------------------------------------------------
    // Add an appropriate message
    //
    if (SAVED) msg = `<b>${TARGET_TOKEN.name}</b> saved versus <b>${BEAM_NAME_ARRAY[BEAM_IDX-1]}</b>
        beam. ${description}`
    else msg = `<b>${TARGET_TOKEN.name}</b> failed to save versus <b>${BEAM_NAME_ARRAY[BEAM_IDX-1]}
        </b>beam. ${description}.`
    if (TL > 1) jez.trace(`${TAG} Add Message`, msg)
    await postBeamResult(BEAM_NAME_ARRAY[BEAM_IDX-1], msg)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 async function zapTargetIndigo(ACTIVE_TOKEN, TARGET_TOKEN, SAVED, options = {}) {
    const FUNCNAME = "zapTargetIndigo(ACTIVE_TOKEN, TARGET_TOKEN, SAVED, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `jez.lib ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Start ${FNAME}`,
        "ACTIVE_TOKEN", ACTIVE_TOKEN,
        "TARGET_TOKEN", TARGET_TOKEN,
        "SAVED       ", SAVED,
        "options     ", options);
    //-----------------------------------------------------------------------------------------------
    // Actually do something, to tokens that failed.
    //
    if (!SAVED) {
        let overTimeValue = `turn=end,label=Indigo Paralysis,saveDC=${SAVE_DC},saveAbility=con`
        let effectData = {
            label: `Affected by Indigo Beam`,
            icon: aItem.img,
            origin: LAST_ARG.uuid,
            disabled: false,
            duration: { rounds: 6, startRound: GAME_RND },
            flags: {
                isConvenient: true,
                isCustomConvenient: true,
                convenientDescription: `Make DC${SAVE_DC} CON Save 3 times, before 3 failures (once end of each turn) or be Petrified`
            },
            changes: [
                { key: `macro.CE`, mode: jez.ADD, value: "Paralyzed", priority: 20 },
                { key: `flags.midi-qol.OverTime`, mode: jez.OVERRIDE, value: overTimeValue, priority: 20 }
            ]
        };
        await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:TARGET_TOKEN.actor.uuid, effects: [effectData] });

    }
    //-----------------------------------------------------------------------------------------------
    // Post an appropriate message
    //
    if (SAVED) msg = `<b>${TARGET_TOKEN.name}</b> saved versus <b>Indigo</b> beam.`
    else msg = `<b>${TARGET_TOKEN.name}</b> failed to save versus <b>Indigo</b> beam. 
    ${TARGET_TOKEN.name} is now ${JRNL_RESTRAINED} and will need to make a DC${SAVE_DC} CON save at 
    the end of each of its turns, needing 3 successes before 3 failures or become ${JRNL_PETRIFIED}.`
    if (TL > 1) jez.trace(`${TAG} Post Message`, msg)
    await postBeamResult("Indigo", msg)
 }
 /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * const  = `@JournalEntry[${game.journal.getName("Blinded").id}]{Blinded}`
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
  async function zapTargetViolet(ACTIVE_TOKEN, TARGET_TOKEN, SAVED, options = {}) {
    const FUNCNAME = "zapTargetViolet(ACTIVE_TOKEN, TARGET_TOKEN, SAVED, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `jez.lib ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Start ${FNAME}`,
        "ACTIVE_TOKEN", ACTIVE_TOKEN,
        "TARGET_TOKEN", TARGET_TOKEN,
        "SAVED       ", SAVED,
        "options     ", options);
    //-----------------------------------------------------------------------------------------------
    // Actually do something, to tokens that failed.
    //
    if (!SAVED) {
        let overTimeValue = `turn=end,label=Violet Blinded,saveDC=${SAVE_DC},saveAbility=wis`
        let effectData = {
            label: `Affected by Violet Beam`,
            icon: aItem.img,
            origin: LAST_ARG.uuid,
            disabled: false,
            duration: { rounds: 6, startRound: GAME_RND },
            flags: {
                isConvenient: true,
                isCustomConvenient: true,
                convenientDescription: `Make DC${SAVE_DC} WIS Save 3 times, before 3 failures (once end of each turn) or be Banished`
            },
            changes: [
                { key: `macro.CE`, mode: jez.ADD, value: "Blinded", priority: 20 },
                { key: `flags.midi-qol.OverTime`, mode: jez.OVERRIDE, value: overTimeValue, priority: 20 }
            ]
        };
        await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:TARGET_TOKEN.actor.uuid, effects: [effectData] });

    }
    //-----------------------------------------------------------------------------------------------
    // Post an appropriate message
    //
    if (SAVED) msg = `<b>${TARGET_TOKEN.name}</b> saved versus <b>Violet</b> beam.`
    else msg = `<b>${TARGET_TOKEN.name}</b> failed to save versus <b>Violet</b> beam.
    ${TARGET_TOKEN.name} is now ${JRNL_BLINDED} and will need to make a DC${SAVE_DC} CON save at 
    the end of each of its turns, needing 3 successes before 3 failures or be transported to another 
    plane of existence of the GM's choosing, no longer blinded.`
    if (TL > 1) jez.trace(`${TAG} Post Message`, msg)
    await postBeamResult("Violet", msg)
 }

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Run VFX from the aToken to the provded tToken, using the provided color.
 *
 * Cool-Thing: Uses template to adjust the animation to better attach to tokens. Also uses
 *             .playbackRate to slow down the animation.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function runVFX(aToken, tToken, VFX_FILENAME, options = {}) {
    const FUNCNAME = "runVFX(tToken, VFX_FILENAME, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `jez.lib ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Start ${FNAME}`, "aToken", aToken, "tToken", tToken,
        "VFX_FILENAME", VFX_FILENAME, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Set playback rate based on VFX provided's duration
    //
    const TEXTURE = await loadTexture(VFX_FILENAME);
    const DURATION = TEXTURE.baseTexture.resource.source.duration;
    if (TL > 2) jez.trace(`${DURATION} second duration for ${FILE_NAME}`)
    const PLAY_BACK_RATE = DURATION / VFX_DURATION // Find rate needed for desired VFX_DURATION
    if (TL > 1) jez.trace(`${TAG} DURATION ${DURATION} / VFX_DURATION ${VFX_DURATION} = 
        PLAY_BACK_RATE ${PLAY_BACK_RATE}`)
    //-----------------------------------------------------------------------------------------------
    // Launch the VFX
    new Sequence()
        .effect()
        .file(VFX_FILENAME)
        .template({ startPoint: 100, endPoint: 100 }) // Adjusts the start/end points just a bit
        .playbackRate(PLAY_BACK_RATE)
        .atLocation(aToken)
        .stretchTo(tToken)
        .play()
}