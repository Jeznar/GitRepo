const MACRONAME = "Enthrall.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * RAW Derscription 
 *   You weave a distracting string of words, causing creatures of your choice that you can see within range and that can hear you 
 *   to make a Wisdom saving throw. Any creature that can't be charmed succeeds on this saving throw automatically, and if you or 
 *   your companions are fighting a creature, it has advantage on the save. On a failed save, the target has disadvantage on Wisdom 
 *   (Perception) checks made to perceive any creature other than you until the spell ends or until the target can no longer hear 
 *   you. The spell ends if you are incapacitated or can no longer speak.
 * 
 * The steps to implment this spell are anticipated to be as follows, with part implmented as doOnUse, doEach, and doOff
 * 
 * doOnUse
 * -------
 * - Build an array of all potential targets within 60 feet that can be seen by the caster, 
 *   o checking for Line of Sight blocks
 *   o and that the caster is not blinded.
 * - Prune potential target array of any targets that can not hear (deafend or Line of Sound blocked) the caster
 * - If there are no eligible targets terminate with message 
 * - Present a dialog allowing caster to choose which of the eligible targets should be subject of enthrall
 * - If caster is in combat, present the list of selected targets and ask which are in combat with the caster or companions
 * - Run VFX on caster of spell 
 * - Roll saves for the targets
 *   o Those marked as in combat have advantage
 *   o Those that are immune to charm condition automatically save (roll forced 99)
 * - Present list of those that saved and those that failed the save and description of effect (which is manual)
 * - If no targets failed save, terminate
 * - Run VFX on those that failed their saves
 * - Place modified CE effect on those that failed that includes a run every turn to trigger the doEach steps 
 *   o Description needs to name the caster of the spell
 * - Place enthralling effect on the caster that includes a list of ids for affected targets and triggers doEach
 * 
 * doEach
 * ------
 * - Determine if active token is caster or a victim of this spell
 * - If the active token is caster, remove the enthralling effect if the caster has one or more SPELL_DROP_EFFECTS:
 *   Silenced, Dead, Unconscious, or Incapacitated
 * - Otherwise check to see if token can hear the caster, if they can't remove the enthralled effect
 * 
 * doOff
 * -----
 * - Determine if active token is caster or a victim of this spell
 * - If the active token is caster, attemot to remove the enthralled effect from all of the targets
 * - Otherwise, say that you have been freed from the enthrall and post a message
 * 
 * 02/08/23 0.1 Creation of Macro
 * 02/09/23 0.1 Outline the steps to implement
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
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
const SPELL_DROP_EFFECTS = [ 'Silenced', 'Dead', 'Unconscious', 'Incapacitated' ]
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const ENTHRALLED_JRNL = `@JournalEntry[${game.journal.getName("Enthralled").id}]{Enthralled}`
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "each") doEach({ traceLvl: TL });					    // DAE everyround
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
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
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * - Build an array of all potential targets within 60 feet that can be seen by the caster, 
 *   o checking for Line of Sight blocks
 *   o and that the caster is not blinded.
 * - Prune potential target array of any targets that can not hear (deafend or Line of Sound blocked) the caster
 * - If there are no eligible targets terminate with message 
 * - Present a dialog allowing caster to choose which of the eligible targets should be subject of enthrall
 * - If caster is in combat, present the list of selected targets and ask which are in combat with the caster or companions
 * - Run VFX on caster of spell 
 * - Roll saves for the targets
 *   o Those marked as in combat have advantage
 *   o Those that are immune to charm condition automatically save (roll forced 99)
 * - Present list of those that saved and those that failed the save and description of effect (which is manual)
 * - If no targets failed save, terminate
 * - Run VFX on those that failed their saves
 * - Place modified CE effect on those that failed that includes a run every turn to trigger the doEach steps 
 *   o Description needs to name the caster of the spell
 * - Place enthralling effect on the caster that includes a list of ids for affected targets and triggers doEach
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
    // Define function variables
    //
    let canSeeIds = []
    let canHearIds = []
    let targetableIds = []
    const SEP_CHAR = '-'
    let tokenNames = [] // Array that contains the token names of candidates, corresponds with tokenNames
    let tokenIds = []   // Array that contains the token Ids of those that can be seen and hear
    let filteredCnt = 0
    let combatantNames = []
    let combatantIds = []
    let combatantCnt = 0
    let opponentIndexs = []
    let opponentTokenIds = []
    let targetIds = []
    let bystanderTokenIds = []
    let bystanderTokens = []
    let opponentTokens = []
    const SAVE_TYPE = 'wis'
    const SAVE_DC = jez.getSpellDC(aToken)
    let failSaves = []  // Array to contain the tokens that failed their saving throws
    let madeSaves = []  // Array to contain the tokens that made their saving throws
    let madeNames = ""
    let failNames = ""
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Build an array of all potential targets within 60 feet that can be seen by the caster, checking for Line of Sight blocks and that the caster is not blinded.`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    // Does the caster have the blinded condition?
    let blindedEffect = await aActor.effects.find(i => i.data.label === "Blinded");
    if (blindedEffect) return jez.badNews(`${aToken.name} is blinded and can't see any targets. Spell has no effect.`, "i")
    // Build array of those within 60 feet that can be seen by the caster
    const CAN_BE_SEEN = await getThoseThatCanBeSeen(60, { traceLvl: TL })
    if (CAN_BE_SEEN.length === 0) return jez.badNews(`No targets in range can be seen`, "i")
    for (let i = 0; i < CAN_BE_SEEN.length; i++) {
        if (TL > 3) jez.trace(`${TAG} | Can Be Seen: ${CAN_BE_SEEN[i].name}${SEP_CHAR}${CAN_BE_SEEN[i].id}`)
        canSeeIds.push(`${CAN_BE_SEEN[i].name}${SEP_CHAR}${CAN_BE_SEEN[i].id}`)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Prune potential target array of any targets that can not hear (deafend or Line of Sound blocked) the caster`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    // Build array of tokens that can hear the caster
    const CAN_HEAR = await getThoseThatCanHear(60, { traceLvl: 0 })
    if (CAN_HEAR.length === 0) return jez.badNews(`No in range targets can hear the caster`, "i")
    for (let i = 0; i < CAN_HEAR.length; i++) {
        if (TL > 3) jez.trace(`${TAG} | Can Hear: ${CAN_HEAR[i].name}${SEP_CHAR}${CAN_HEAR[i].id}`)
        canHearIds.push(`${CAN_HEAR[i].name}${SEP_CHAR}${CAN_HEAR[i].id}`)
    }
    // Obtain the intersection of the two arrays as affectable targets 
    for (let i = 0; i < canHearIds.length; i++)
        // TODO: get correct syntax for this operation
        if (canSeeIds.includes(canHearIds[i])) targetableIds.push(canHearIds[i])
    if (TL > 2) jez.trace(`${TAG} Token Arrays:`, 
        `canSeeIds    `, canSeeIds, `canHearIds   `, canHearIds, `targetableIds`, targetableIds)
    // Example value of targetableIds (7) [
    //    'Acolyte-3LcEh5rpD6ax8Ll7', 'Acolyte-eIzYNsFkw8YKCBHh', 'Gate Guard-r78yGjIFRFzX6giL', 'Guard Captain-1CWFDI7gXlSrAjPs', 
    //    'Guard-qYxnYBuL8fWepCdR', 'Militia Leader-grzlDpnm3M8AOgmS', 'Minnie McWizard-VqULthPX1ZdfAPcs']
    targetableIds.sort()
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `If there are no eligible targets terminate with message`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    if (targetableIds.length === 0) return jez.badNews(`No valid targets in range`, "i")
    if (TL > 3) for (let i = 0; i < targetableIds.length; i++) jez.trace(`${TAG} | ${i + 1} Candidate ${i}: ${targetableIds[i]}`)
    //
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Present a dialog allowing caster to choose which of the eligible targets should be subject of enthrall`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    // Build array of token names to be presented to caster
    for (let i = 0; i < targetableIds.length; i++) {
        const ATOMS = targetableIds[i].split(SEP_CHAR)
        if (TL > 4) jez.trace(`${TAG} ${ATOMS.length} ATOMS`, ATOMS)
        if (ATOMS.length !== 2) return jez.badNews(`Bad Juju. Failed to parse ${targetableIds[i]}. Expected <Name>${SEP_CHAR}<ID>`)
        tokenNames.push(`${++filteredCnt}. ${ATOMS[0]}`)             // Push name into display array
        tokenIds.push(ATOMS[1])                                      // Push correponding id
    }
    if (TL > 1) jez.trace(`${TAG} array contents`, 'tokenNames', tokenNames, 'tokenIds', tokenIds)
    // Call pick targets function
    const TARGETS = await pickTargets(tokenNames, '', { traceLvl: TL })
    if (!TARGETS) return
    if (!TARGETS === undefined) return
    // Build array of Target Ids, subset of tokenIds
    for (let i = 0; i < TARGETS.length; i++) targetIds.push(tokenIds[parseInt(TARGETS[i]) - 1])
    if (TL > 2) jez.trace(`${TAG} targetIds`, targetIds);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Present list of selected targets that are in combat and ask which are in combat with the caster or companions`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    // Loop through the TARGETS making array of names and Ids in combat
    let targetedTokens = []
    let indexes = []
    if (TL > 2) jez.trace(`${TAG} Targets`, TARGETS);
    for (let i = 0; i < TARGETS.length; i++) indexes.push(parseInt(TARGETS[i])) // Nab leading integer as the array index for each
    if (TL > 3) jez.trace(`${TAG} indexes`, indexes);
    for (let i = 0; i < indexes.length; i++) {
        targetedTokens.push(canvas.tokens.placeables.find(ef => ef.id === tokenIds[indexes[i] - 1]))
        // Build list of those in combat by testing _token.combatant --> True indicates combat
        if (targetedTokens[i].combatant) {
            combatantNames.push(`${++combatantCnt}. ${targetedTokens[i].name}`)
            combatantIds.push(targetedTokens[i].id)
        }
        if (TL > 3) for (let i = 0; i < combatantIds.length; i++)
            jez.trace(`${TAG} | ${i + 1} Combatant: ${combatantNames[i]} ${combatantIds[i]}`)
    }
    // Have the caster select targets that are in combat with the caster or his/her companions
    if (combatantIds.length > 0) {
        const OPPONENTS = await pickOpponents(combatantNames, { traceLvl: TL })
        if (TL > 2) jez.trace(`${TAG} OPPONENTS`, OPPONENTS);
        // Build an array of the tokenIds that are in combat 
        if (OPPONENTS) {
            for (let i = 0; i < OPPONENTS.length; i++) opponentIndexs.push(parseInt(OPPONENTS[i])) // Nab leading integer 
            for (let i = 0; i < opponentIndexs.length; i++)
                opponentTokenIds.push(combatantIds[opponentIndexs[i] - 1])
        }
    }
    console.log('4')
    if (TL > 3) jez.trace(`${TAG} opponentTokenIds`, opponentTokenIds);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Run VFX on caster of spell`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    runVFXCaster(aToken)
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Roll saves for the targets, Those marked as in combat have advantage, Those that are immune to charm condition automatically save (roll forced 99)`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    // Build array of those not in combat by excluding those that are in combat
    for (let i = 0; i < targetIds.length; i++) if (!opponentTokenIds.includes(targetIds[i])) bystanderTokenIds.push(targetIds[i])
    if (TL > 2) {
        jez.trace(`${TAG} These targets are selected for the spell:`, targetIds)
        jez.trace(`${TAG} These targets are opponents in combat:`, opponentTokenIds)
        jez.trace(`${TAG} These targets are bystanders (not in combat):`, bystanderTokenIds)
    }
    // Build array of bystander Token5es
    for (let i = 0; i < bystanderTokenIds.length; i++)
        bystanderTokens.push(canvas.tokens.placeables.find(ef => ef.id === bystanderTokenIds[i]))
    if (TL > 2) jez.trace(`${TAG} bystanderTokens`, bystanderTokens)
    // Have the bystanders roll their saving throws
    for (let i = 0; i < bystanderTokens.length; i++) {
        // Handle immune to charm case 
        if (bystanderTokens[i].actor.data.data.traits.ci.value.includes('charmed')) {
            const PSEUDO_BONUS = Math.floor(Math.random() * 6);
            if (TL > 2) jez.trace(`${TAG} ${bystanderTokens[i].name} immune vs ${SAVE_DC}`)
            madeSaves.push(bystanderTokens[i])
            madeNames += `<b>${bystanderTokens[i].name}</b>: ${SAVE_DC - 1 + PSEUDO_BONUS} (1d20+${PSEUDO_BONUS})<br>`
            continue
        }
        // Handle not immune to charm
        let save = (await bystanderTokens[i].actor.rollAbilitySave(SAVE_TYPE, { chatMessage: false, fastforward: true }));
        if (save.total < SAVE_DC) {
            if (TL > 2) jez.trace(`${TAG} ${bystanderTokens[i].name} failed: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            failSaves.push(bystanderTokens[i])
            failNames += `<b>${bystanderTokens[i].name}</b>: ${save.total} (${save._formula})<br>`
        } else {
            if (TL > 2) jez.trace(`${TAG} ${bystanderTokens[i].name} saved: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            madeSaves.push(bystanderTokens[i])
            madeNames += `<b>${bystanderTokens[i].name}</b>: ${save.total} (${save._formula})<br>`
        }
    }
    // Build array of opponent (combatant) Token5es
    for (let i = 0; i < opponentTokenIds.length; i++)
        opponentTokens.push(canvas.tokens.placeables.find(ef => ef.id === opponentTokenIds[i]))
    // Have the combatants roll their saving throw (they get advantage)
    for (let i = 0; i < opponentTokens.length; i++) {
        // Handle immune to charm case 
        if (opponentTokens[i].actor.data.data.traits.ci.value.includes('charmed')) {
            const PSEUDO_BONUS = Math.floor(Math.random() * 6);
            if (TL > 2) jez.trace(`${TAG} ${opponentTokens[i].name} immune vs ${SAVE_DC}`)
            madeSaves.push(opponentTokens[i])
            madeNames += `<b>${opponentTokens[i].name}</b>: ${SAVE_DC - 1 + PSEUDO_BONUS} (1d20+${PSEUDO_BONUS})<br>`
            continue
        }
        // Handle not immune to charm
        let save = (await opponentTokens[i].actor.rollAbilitySave(SAVE_TYPE, { advantage: true, chatMessage: false, fastforward: true }));
        if (save.total < SAVE_DC) {
            if (TL > 2) jez.trace(`${TAG} ${opponentTokens[i].name} failed: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            failSaves.push(opponentTokens[i])
            failNames += `<b>${opponentTokens[i].name}</b>: ${save.total} (${save._formula})<br>`
        } else {
            if (TL > 2) jez.trace(`${TAG} ${opponentTokens[i].name} saved: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            madeSaves.push(opponentTokens[i])
            madeNames += `<b>${opponentTokens[i].name}</b>: ${save.total} (${save._formula})<br>`
        }
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Present list of those that saved and those that failed the save and description of effect (which is manual)`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    postResults(`${SAVE_TYPE.toUpperCase()} DC${SAVE_DC} saving throw to avoid effect. Effects of ${ENTHRALLED_JRNL} 
        are not automated.`)
    if (madeNames) {
        await jez.wait(100)
        postResults(`Successful saving throws:<br>` + madeNames)
    }
    if (failNames) {
        await jez.wait(100)
        postResults(`Failed saving throws:<br>` + failNames)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `If no targets failed save, terminate`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    if (failSaves.length === 0) return jez.badNews('Spell had no effect', 'i')
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Run VFX on those that failed their saves`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    runVFXAfflicted(failSaves)
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Place modified CE effect on those that failed that includes a run every turn to trigger the doEach steps. Description needs to name the caster of the spell.  Keeping a tokenId list of those effected`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    // Build a modified Enthralled effect appropriate to apply to the afflicted.  It needs:
    // - Effect added to call ItemMacro
    // - Macro Repeat at start of each turn
    // - a CE description added
    // - duration of the effect (1 ninute, 10 rounds)
    let effectData = game.dfreds.effectInterface.findEffectByName('Enthralled').convertToObject();
    effectData.changes.push({ key: 'macro.itemMacro', mode: jez.ADD, value: `Afflicted ${aToken.id}`, priority: 20 })
    effectData.flags.dae.macroRepeat = "startEveryTurn"
    const CE_DESC = `Disadvantage on WIS (Perception) checks made to perceive any creature other than ${aToken.name}.`
    effectData.description = CE_DESC
    // Add our fancy effect to all that failed saves
    for (let i = 0; i < failSaves.length; i++)
        game.dfreds.effectInterface.addEffectWith({ effectData: effectData, uuid: failSaves[i].actor.uuid, origin: aItem.uuid });
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Place enthralling effect on the caster that includes a list of ids for affected targets and triggers doEach`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    // Build a string containing space delimited token ids of the afflicted
    let failedTokenIds = ''
    for (let i = 0; i < failSaves.length; i++) {
        failedTokenIds += failSaves[i].id
        if (i < failSaves.length - 1) failedTokenIds += ' '
    }
    // Build data structure for our enthralling effect
    const CE_DESC_ENTHRALLING = `Maintaining enthralled effect`
    let effectDataOrigin = {
        label: 'Enthralling',
        icon: aItem.img,
        flags: {
            convenientDescription: CE_DESC_ENTHRALLING,
            dae: { itemData: aItem, stackable: false, macroRepeat: "startEveryTurn", specialDuration: ["shortRest", "longRest"] },
        },
        origin: actor.uuid,
        disabled: false,
        duration: { rounds: 10, startRound: GAME_RND, seconds: 60, startTime: game.time.worldTime },
        changes: [{ key: "macro.itemMacro", mode: jez.ADD, value: failedTokenIds, priority: 20 }]
    };
    // Apply the effect
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectDataOrigin] });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    // msg = `Say something useful...`
    // postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doEach(options = {}) {
    const FUNCNAME = "doEach(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Determine if ${aToken.name} is caster or a victim of this spell`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    const AFFLICTED = args[1] === 'Afflicted' ? true : false
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `If ${aToken.name} is caster, remove the enthralling effect if the caster has one of the SPELL_DROP_EFFECTS`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    let found = false
    if (!AFFLICTED) {
        if (TL > 2) jez.trace(`${TAG} ${aToken.name} is the origin of the spell`)
        for (let i = 0; i < SPELL_DROP_EFFECTS.length; i++) {
            if (TL > 1) jez.trace(`${TAG} Checking for condition: ${SPELL_DROP_EFFECTS[i]}`);
            let chkEffect = await aActor.effects.find(j => j.data.label === SPELL_DROP_EFFECTS[i]);
            if (TL > 2) jez.trace(`${TAG} aActor.effects:`, aActor.effects)
            if (TL > 2) jez.trace(`${TAG} chkEffect content:`, chkEffect)
            if (chkEffect) {
                found = true
                if (TL > 1) jez.trace(`${TAG} Found ${SPELL_DROP_EFFECTS[i]} on ${aToken.name}`);
                let enthrallingEffect = await aActor.effects.find(i => i.data.label === "Enthralling");
                if (enthrallingEffect) jez.deleteEffectAsGM(enthrallingEffect.uuid, { traceLvl: TL });
                msg = `<b>${aToken.name}</b> is ${SPELL_DROP_EFFECTS[i]} and can no longer maintain the <b>Enthralling</b> effect.`
                title = 'Enthralling spell ended'
                jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img, msg: msg, title: title, token: aToken})
                break
            }
        }
        // let silencedEffect = await aActor.effects.find(i => i.data.label === "Silenced");
        // if (silencedEffect) {
        //     let enthrallingEffect = await aActor.effects.find(i => i.data.label === "Enthralling");
        //     if (enthrallingEffect) jez.deleteEffectAsGM(enthrallingEffect.uuid, { traceLvl: TL })
        // }
        if (found === false) {
            bubbleForAll(aToken.id, `I am enthralling`, true, true)
            runVFXCaster(aToken)
        }
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Otherwise check to see if ${aToken.name} can hear the caster, if they can't remove the enthralled effect`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    if (AFFLICTED) {
        if (TL > 2) jez.trace(`${TAG} origin token id ${args[2]}`)
        let oToken = canvas.tokens.get(args[2])
        if (TL > 2) jez.trace(`${TAG} ${args[2]} oToken`, oToken)
        if (TL > 2) jez.trace(`${TAG} ${aToken.name} is afflicted by the spell from ${oToken.name}`)
        // Define the ray between the two locations
        let ray = new Ray(aToken.center, oToken.center)
        // check the line of sound
        let badLoS = canvas.walls.checkCollision(ray, { type: "sound", mode: "any" })
        if (badLoS) {
            let enthralledEffect = await aActor.effects.find(i => i.data.label === "Enthralled");
            if (enthralledEffect) jez.deleteEffectAsGM(enthralledEffect.uuid, { traceLvl: TL })
        }
        else {
            bubbleForAll(aToken.id, `${oToken.name} has my rapt attention`, true, true)
            runVFXAfflicted([aToken])
        }
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
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
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Determine if active token is caster or a victim of this spell`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    const AFFLICTED = args[1] === 'Afflicted' ? true : false
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `If the active token is caster, attempt to remove the enthralled effect from all of the targets`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    if (!AFFLICTED) {
        for (let i = 1; i < args.length - 1; i++) {
            let tToken = canvas.tokens.get(args[i])
            if (TL > 2) jez.trace(`${TAG} tToken`, tToken)
            let enthralledEffect = await tToken.actor.effects.find(i => i.data.label === "Enthralled");
            if (enthralledEffect) jez.deleteEffectAsGM(enthralledEffect.uuid, { traceLvl: TL })
        }
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    msg = `Otherwise, say that you have been freed from the enthrall and post a message`
    if (TL > 2) { jez.trace(`${TAG} -----------------`); jez.trace(`${TAG} ${msg}`) }
    if (AFFLICTED) {
        bubbleForAll(aToken.id, 'I am no longered enthralled', true, true)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/***********************************************************************************************************************************
* Finding the set of all creatures within defined distance that can be seen by the caster 
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function getThoseThatCanBeSeen(DISTANCE, options = {}) {
    const FUNCNAME = "getThoseThatCanBeSeen(DISTANCE, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'DISTANCE', DISTANCE, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let opts = {
        exclude: "self",        // self, friendly, or none (self is default)
        direction: "o2t",       // t2o or o2t (Origin to Target) (t2o is default) 
        chkSight: true,         // Boolean (false is default)
        chkBlind: false,        // Boolean (false is default)
        traceLvl: 0,           // Trace level, integer typically 0 to 5
    }
    let returned = await jez.inRangeTargets(aToken, DISTANCE, opts);
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return returned;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
* Find the set of all creatures within defined distance that can hear the caster 
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function getThoseThatCanHear(DISTANCE, options = {}) {
    const FUNCNAME = "getThoseThatCanHear(DISTANCE, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let opts = {
        exclude: "self",        // self, friendly, or none (self is default)
        direction: "t20",       // t2o or o2t (Origin to Target) (t2o is default) 
        chkHear: true,
        chkDeaf: true,          // Boolean (false is default)
        traceLvl: 0,           // Trace level, integer typically 0 to 5
    }
    let returned = await jez.inRangeTargets(aToken, DISTANCE, opts);
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return returned;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
* Pick Targets 
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function pickTargets(tokenNames, xtraMsg, options = {}) {
    const FUNCNAME = "pickTargets(tokenNames, xtraMsg, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting`, 'tokenNames', tokenNames, 'xtraMsg', xtraMsg, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let queryTitle = "Select Targets of Enthrall Spell"
    let queryText = `Pick creatures that should be forced to roll saves or be enthalled by ${aToken.name}.<br><br>${xtraMsg}`
    const SELECTIONS = await jez.pickCheckListArray(queryTitle, queryText, null, tokenNames);
    //-------------------------------------------------------------------------------------------------------------------------------
    // If cancel button was selected on the preceding dialog, null is returned ==> Terminate
    //
    if (SELECTIONS === null) return;
    //-------------------------------------------------------------------------------------------------------------------------------
    // If nothing was selected (empty array), call again and terminate this one
    //
    if (SELECTIONS.length === 0) {
        xtraMsg = `No creatures selected last try.  Please select at least one before clicking <b>Selected Only</b> button.<br><br>`
        pickTargets(tokenNames, xtraMsg, { traceLvl: TL })		// itemSelected is a global that is passed to preceding func
        return;
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return SELECTIONS;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
* Mark those in combat with the caster or companions 
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function pickOpponents(tokenNames, options = {}) {
    const FUNCNAME = "pickOpponents(tokenNames, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting`, 'tokenNames', tokenNames, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let queryTitle = "Select Opponents in Combat"
    let queryText = `Pick creatures that are in combat with ${aToken.name} or his/her companions.<br><br>`
    const SELECTIONS = await jez.pickCheckListArray(queryTitle, queryText, null, tokenNames);
    //-------------------------------------------------------------------------------------------------------------------------------
    // If cancel button was selected on the preceding dialog, null is returned ==> Terminate
    // 
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return SELECTIONS;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Play the VFX on the afflicted
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function runVFXAfflicted(tokens) {
    let vfxEffect = "Icons_JGB/Spells/2nd_Level/enthrall.png"
    console.log(`runVFXAfflicted`, tokens)
    for (let i = 0; i < tokens.length; i++) {
        await jez.wait(Math.floor(Math.random() * 1500))
        new Sequence()
            .effect()
            .file(vfxEffect)
            .scaleToObject(0.2)
            .scaleOut(16, 4000, { delay: -4000 })
            .fadeOut(4000)
            .atLocation(tokens[i])
            .opacity(1)
            .play();
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Play the VFX onthe caster
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function runVFXCaster(token) {
    new Sequence()
        .effect()
        .file(aItem.img)
        .duration(8000)
        .atLocation(token)
        .scaleToObject(0.25)
        .scaleOut(16, 4000, { delay: -4000 })
        .fadeOut(4000)
        .opacity(1)
        .play();
}