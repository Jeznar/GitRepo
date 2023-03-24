const MACRONAME = "Inspiring_Leader.1.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Total rewrite of Inspiring_Leader.0.6.js that implemements the Inspiring Leader Feat.
 * 
 * This version uses MidiQOL.DamageOnlyWorkflow to handle the application of tempoary HP to up to six tokens. bThe majority of the
 * code deals with picking those targets.  There is no checking to see if they are "friendly" as this can shift unpredictably in 
 * a game session.   
 * 
 * Major Steps:
 *  1. Finding the set of all creatures within 30 feet that can see the caster 
 *  2. Find the set of all creatures within 30 feet that can hear the caster 
 *  3. Build a superset of the first two sets
 *  4. Filter out actors that have the marker buff indicating they have received this effect since last short or long rest
 *  5. Present dialog to obtain selections for the buff
 *  6. Use the return value (BUFFIES) to build an array of the tokens to be bolsetered. 
 *  7. Launch VFX on caster
 *  8. Launch VFX on tokens receiving bolster
 *  9. Make the Midi call to apply the temp health (temphp)
 * 10. Apply a marker buff indicating that Inspiring Leader has been applied
 * 
 * 12/19/22 1.0 Creation of Macro
 * 12/23/22 1.1 Some polish applied
 * 03/24/23 1.2 Updated mdialog text to always include maximum number of targets
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const FNAME = MACRO
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
// Set Macro variables
//
const RANGE = 30
let canSeeIds = []
let canHearIds = []
const SEP_CHAR = '-'
const TEMP_HP = aActor.data.data.details.level + aActor.data.data.abilities.cha.mod;
//-----------------------------------------------------------------------------------------------------------------------------------
// 1. Finding the set of all creatures within 30 feet that can see the caster 
//
const CAN_SEE = await getThoseThatCanSee({ traceLvl: 0 })
for (let i = 0; i < CAN_SEE.length; i++) {
    if (TL > 4) jez.trace(`${FNAME} | Can See: ${CAN_SEE[i].name}${SEP_CHAR}${CAN_SEE[i].id}`)
    canSeeIds.push(`${CAN_SEE[i].name}${SEP_CHAR}${CAN_SEE[i].id}`)
}
//-----------------------------------------------------------------------------------------------------------------------------------
// 2. Find the set of all creatures within 30 feet that can hear the caster 
//
const CAN_HEAR = await getThoseThatCanHear({ traceLvl: 0 })
for (let i = 0; i < CAN_HEAR.length; i++) {
    if (TL > 4) jez.trace(`${FNAME} | Can Hear: ${CAN_HEAR[i].name}${SEP_CHAR}${CAN_HEAR[i].id}`)
    canHearIds.push(`${CAN_HEAR[i].name}${SEP_CHAR}${CAN_HEAR[i].id}`)
}
//-----------------------------------------------------------------------------------------------------------------------------------
// 3. Build a superset of the first two sets
//
let canSeeOrHearIds = canSeeIds.concat(canHearIds);
canSeeOrHearIds = canSeeOrHearIds.filter((item, index) => { return (canSeeOrHearIds.indexOf(item) == index) }).sort()
if (TL > 2) for (let i = 0; i < canSeeOrHearIds.length; i++) {
    jez.trace(`${FNAME} | ${i + 1} Candidate: ${canSeeOrHearIds[i]}`)
}
// Example value of canSeeOrHearIds (7) [
//    'Acolyte-3LcEh5rpD6ax8Ll7', 'Acolyte-eIzYNsFkw8YKCBHh', 'Gate Guard-r78yGjIFRFzX6giL', 
//    'Guard Captain-1CWFDI7gXlSrAjPs', 'Guard-qYxnYBuL8fWepCdR', 'Militia Leader-grzlDpnm3M8AOgmS', 
//    'Minnie McWizard-VqULthPX1ZdfAPcs']
//-----------------------------------------------------------------------------------------------------------------------------------
// 4. Filter out actors that have the marker buff indicating they have received this effect since last short or long rest
//
let unFilteredTokenNames = [] // Array that contains the token names of candidates, corresponds with tokenNames
let unFilteredtTokenIds = []  // Array that contains the token Ids of those that can see or hear
let filteredTokenNames = []
let filteredTokenIds = []
let filteredOut = []
let filteredCount = 0
for (let i = 0; i < canSeeOrHearIds.length; i++) {
    const ATOMS = canSeeOrHearIds[i].split(SEP_CHAR)
    if (TL > 2) jez.trace(`${TAG} ${ATOMS.length} ATOMS`, ATOMS)
    if (ATOMS.length === 1) return jez.badNews(`Bad Juju. id value found for ${canSeeOrHearIds[i]}`)
    let unFilteredTokenName = ''
    for (let j = 0; j < ATOMS.length - 1; j++) unFilteredTokenName += ATOMS[j] // Rebuild name
    unFilteredTokenNames.push(unFilteredTokenName)              // Push name into display array
    unFilteredtTokenIds.push(ATOMS[ATOMS.length - 1])                          // Push correponding id
    // Search for the token data that matches our current id
    let unFilteredToken5e = canvas.tokens.placeables.find(ef => ef.id === unFilteredtTokenIds[i])
    if (!unFilteredToken5e) return jez.badNews(`Could not find ${unFilteredTokenNames[i]} ${unFilteredtTokenIds[i]}`,'w')
    // Search our subject token for the marker buff from this item
    let aEffect = await unFilteredToken5e.actor?.effects?.find(ef => ef?.data?.label === aItem.name)
    if (aEffect) {
        if (TL > 2) jez.trace(`${TAG} ${aItem.name} found on ${unFilteredToken5e.name}, skipping`)
        filteredOut.push(unFilteredToken5e.name)
        continue
    }
    filteredTokenNames.push(`${++filteredCount}. ${unFilteredTokenNames[i]}`)
    filteredTokenIds.push(unFilteredtTokenIds[i])
}
if (TL > 1) jez.trace(`${TAG} array contents`,'filteredTokenNames',filteredTokenNames,'filteredTokenIds',filteredTokenIds,
    'filteredOut',filteredOut)
//-----------------------------------------------------------------------------------------------------------------------------------
// 5. Present dialog to obtain selections for the buff
//
const BUFFIES = await pickBuffies(filteredTokenNames, '', filteredOut, { traceLvl: TL })
if (!BUFFIES) {
    if (TL > 3) jez.trace(`${TAG} BUFFIES`, BUFFIES)
    return
}
if (!BUFFIES === undefined) return
//-----------------------------------------------------------------------------------------------------------------------------------
// 6. Use the return value (BUFFIES) to build an array of the tokens to be bolsetered.  
// Buffies might contain: ['4. Guard Captain', '6. Militia Leader', '7. Minnie McWizard']
// The number indicates the position in the array of potential targets.
//
let bolsterTokens = []
let indexes = []
if (TL > 2) jez.trace(`${TAG} Buffies`, BUFFIES);
for (let i = 0; i < BUFFIES.length; i++) indexes.push(parseInt(BUFFIES[i]))
if (TL > 3) jez.trace(`${TAG} indexes`, indexes);
for (let i = 0; i < indexes.length; i++) {
    bolsterTokens.push(canvas.tokens.placeables.find(ef => ef.id === filteredTokenIds[indexes[i] - 1]))
}
if (TL > 3) jez.trace(`${TAG} bolsterTokens`, bolsterTokens);
//-----------------------------------------------------------------------------------------------------------------------------------
// 7. Launch VFX on caster
//
runVFXCaster(aToken)
//-----------------------------------------------------------------------------------------------------------------------------------
// 8. Launch VFX on tokens receiving bolster
//
runVFX(bolsterTokens)
//-----------------------------------------------------------------------------------------------------------------------------------
// 9. Make the Midi call to apply the temp health (temphp)
//
const DAM_TYPE = 'temphp'
let TEMP_HP_ROLL = new Roll(`${TEMP_HP}`).evaluate({ async: false });
await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, TEMP_HP, DAM_TYPE, bolsterTokens, TEMP_HP_ROLL, {
    flavor: `(${CONFIG.DND5E.healingTypes[DAM_TYPE]})`, itemCardId: args[0].itemCardId, useOther: false
});
replaceHitsWithBolsters() // Updates chat card to say "Bolsters" instead of "hits"
//-----------------------------------------------------------------------------------------------------------------------------------
// 10. Apply a marker buff indicating that Inspiring Leader has been applied
//
const EXPIRE = ["longRest", "shortRest"];
let effectData = [{
    label: aItem.name,
    icon: aItem.img,
    disabled: false,
    origin: aItem.uuid,
    flags: {
        dae: {
            macroRepeat: "none",
            specialDuration: EXPIRE
        },
        convenientDescription: `${aToken.name}'s Inspiring Leader Benefit Received.`
    },
}];
for (let i = 0; i < bolsterTokens.length; i++) {
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: bolsterTokens[i].actor.uuid, effects: effectData });
}
//-----------------------------------------------------------------------------------------------------------------------------------
// All Done
//
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Finding the set of all creatures within 30 feet that can see the caster 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function getThoseThatCanSee(options = {}) {
    const FUNCNAME = "getThoseThatCanSee(options = {}";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let opts = {
        exclude: "none",        // self, friendly, or none (self is default)
        chkSight: true,         // Boolean (false is default)
        chkBlind: true,         // Boolean (false is default)
        traceLvl: TL,            // Trace level, integer typically 0 to 5
    }
    let returned = await jez.inRangeTargets(aToken, RANGE, opts);
    // if (returned.length === 0) return jez.badNews(`No effectable targets in range`, "i")
    // if (TL>1) for (let i = 0; i < returned.length; i++) jez.trace(`${FNAME} | Targeting: ${returned[i].name}`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return returned;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
* Find the set of all creatures within 30 feet that can hear the caster 
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function getThoseThatCanHear(options = {}) {
    const FUNCNAME = "getThoseThatCanSee(options = {}";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let opts = {
        exclude: "none",        // self, friendly, or none (self is default)
        chkHear: true,
        chkDeaf: true,          // Boolean (false is default)
        traceLvl: TL,           // Trace level, integer typically 0 to 5
    }
    let returned = await jez.inRangeTargets(aToken, RANGE, opts);
    // if (returned.length === 0) return jez.badNews(`No effectable targets in range`, "i")
    // if (TL>1) for (let i = 0; i < returned.length; i++) jez.trace(`${FNAME} | Targeting: ${returned[i].name}`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return returned;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
* Find the set of all creatures within 30 feet that can hear the caster 
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function pickBuffies(tokenNames, xtraMsg, filteredNames, options = {}) {
    const FUNCNAME = "pickBuffies(tokenNames, xtraMsg, filteredNames, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting`, 'tokenNames', tokenNames, 'xtraMsg', xtraMsg, "filteredNames", filteredNames,
        "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let queryTitle = "Select Up to Six to Receive Buff"
    if (filteredNames.length <= 6) queryTitle = "Select Creatures to Receive Buff"
    let queryText = `Pick up to six (6) creatures that should be bolsetered by this spell.<br><br>${xtraMsg}`
    let filterMsg = ""
    if (filteredNames.length > 0) {
        if (!filterMsg) filterMsg = `Some in range creatures (${filteredNames.length}) have benefited from <b>${aItem.name}</b> since 
            last rest: `
        for (let i = 0; i < filteredNames.length; i++) {
            filterMsg += filteredNames[i]
            if (i < (filteredNames.length - 1) ) filterMsg += ', '
            else filterMsg += '<br><br>'
        }
        queryText += filterMsg
    }
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
        pickBuffies(tokenNames, xtraMsg, filteredNames, { traceLvl: TL })		// itemSelected is a global that is passed to preceding func
        return;
    }
    //--------------------------------------------------------------------------------------------
    // If more than six selected (empty array), call again and terminate this one
    //
    if (SELECTIONS.length > 6) {
        xtraMsg = `Pick no more than six creatures. You selected ${SELECTIONS.length}.<br><br>`
        pickBuffies(tokenNames, xtraMsg, { traceLvl: TL })		// itemSelected is a global that is passed to preceding func
        return;
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return SELECTIONS;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Replace first " hits" with " Bolsters" on chat card
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function replaceHitsWithBolsters() {
    let chatmsg = game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatmsg.data.content);
    const searchString = / hits/g;
    const replaceString = `<p style="color:Green;"> Bolsters</p>`;
    content = await content.replace(searchString, replaceString);
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Play the VFX on the beneficiaries
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function runVFX(tokens) {
    let vfxEffect = "modules/jb2a_patreon/Library/Generic/Template/Circle/OutPulse/OutPulse_01_Regular_PurplePink_Burst_600x600.webm"
    for (let i = 0; i < tokens.length; i++) {
        await jez.wait(Math.floor(Math.random() * 2000))
        new Sequence()
            .effect()
            .file(vfxEffect)
            .playbackRate(0.4)
            .atLocation(tokens[i])
            .scale(0.3)
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
        // .fadeIn(500)
        // .scaleIn(0.5, 1000)
        .scaleToObject(0.5)
        .scaleOut(16, 4000, { delay: -4000 })
        .fadeOut(4000)
        .opacity(1)
        .play();
}