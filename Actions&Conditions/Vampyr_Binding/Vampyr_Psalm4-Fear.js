const MACRONAME = "Vampyr_Psalm4-Fear.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 4th Psalm:  You (all LIVINGS) must succeed on a DC 19 Wisdom saving throw or become frightened of the mists until the ritual 
 *             is completed. You must use your action and movement to get to the light of a ritual lantern. You can repeat this 
 *             saving throw at the end of each of your turns.
 * 
 * This one needs to do the following:
 * 1. Find all of the friendly tokens
 * 2. For each friendly token
 *    a. Roll saving throw continue if save made
 *    b. Apply an effect that implements a fear effect with turn end save 
 * 
 * 01/08/23 0.1 Creation of Macro
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
psalm4({ traceLvl: TL })
return
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
 * 4th Psalm:  You (all LIVINGS) must succeed on a DC 19 Wisdom saving throw or become frightened of the mists until the ritual 
 *             is completed. You must use your action and movement to get to the light of a ritual lantern. You can repeat this 
 *             saving throw at the end of each of your turns.
 * 
 * This one needs to do the following:
 * 1. Find all of the friendly tokens
 * 2. For each friendly token
 *    a. Roll saving throw continue if save made
 *    b. Apply an effect that implements a fear effect with turn end save 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function psalm4(options = {}) {
    const FUNCNAME = "psalm2(options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Set Macro variables
    //
    const SAVE_TYPE = 'wis'
    const SAVE_DC = 19
    const FLAVOR = "Does this provide flavor?"
    let failSaves = []  // Array to contain the tokens that failed their saving throws
    let madeSaves = []  // Array to contain the tokens that made their saving throws
    let madeNames = ""
    let failNames = ""
    const EFFECT_NAME = "Frightened of the Mists"
    const GAME_RND = game.combat ? game.combat.round : 0;
    //-----------------------------------------------------------------------------------------------------------------------------------
    // 1. Find all of the friendly tokens
    // 
    const LIVINGS = getLiving({traceLvl: TL})
    if (LIVINGS.length === 0) return jez.badNews(`${TAG} No LIVINGS fround on scene`, 'w')
    //-----------------------------------------------------------------------------------------------------------------------------------
    // 2. For each friendly token do the things
    // 
    for (let i = 0; i < LIVINGS.length; i++) {
        if (TL > 1) jez.trace(`${TAG} Processing friendly #${i + 1} ${LIVINGS[i].name}`);
        //-------------------------------------------------------------------------------------------------------------------------------
        // a. Roll saving throw continue if save made
        //
        let fToken = LIVINGS[i];
        let save = (await fToken.actor.rollAbilitySave(SAVE_TYPE, { flavor: FLAVOR, chatMessage: false, fastforward: true }));
        if (save.total < SAVE_DC) {
            if (TL > 2) jez.trace(`${TAG} ${fToken.name} failed save`)
            failSaves.push(fToken)
            failNames += `<b>${fToken.name}</b> ${save.total} (${save._formula})<br>`
        } else {
            if (TL > 2) jez.trace(`${TAG} ${fToken.name} made save`)
            madeNames += `<b>${fToken.name}</b> ${save.total} (${save._formula})<br>`
            madeSaves.push(fToken)
            continue
        }
        // }
        if (TL > 1) jez.trace(`${TAG} Results`, "Made Saves", madeSaves, "Failed Saves", failSaves)
        //-------------------------------------------------------------------------------------------------------------------------------
        // b. Apply a Fear with a end of turn repeating save effect
        //
        if (TL > 1) jez.trace(`${TAG} ${fToken.name} gets a Fear effect`)
        runVFX(fToken)
        if (TL > 1) jez.trace(`${TAG} Apply debuff that reduces speed by 5 to ${fToken.name}`)
        await jez.wait(100)
        let existingPsalm4 = await fToken.actor.effects.find(ef => ef.data.label === EFFECT_NAME);
        if (TL > 1) jez.trace(`${TAG} Existing effect (if any)`, existingPsalm4)
        if (existingPsalm4) await existingPsalm4.delete()
        await jez.wait(100)
        applyFear(fToken)
        //-------------------------------------------------------------------------------------------------------------------------------
        // Function to apply Fear condition to a token, adding CEDesc and OverTime save
        //
        async function applyFear(token) {
            const CE_DESC = `Frightened of the mists, must use action and move to get to the light of a ritual lantern and remain there.`
            const OVERTIME = `turn=end,label=${EFFECT_NAME} save,saveDC=${SAVE_DC},saveAbility=${SAVE_TYPE},saveRemove=true,saveMagic=true,rollType=save`
            let effectData = [{
                label: EFFECT_NAME,
                icon: 'Icons_JGB/Monster_Features/Frighten.png',
                origin: L_ARG.uuid,
                disabled: false,
                flags: {
                    dae: { stackable: false, macroRepeat: "endEveryTurn" },
                    convenientDescription: CE_DESC
                },
                duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
                changes: [
                    { key: `flags.midi-qol.disadvantage.attack.all`, mode: jez.CUSTOM, value: `1`, priority: 20 },
                    { key: `flags.midi-qol.disadvantage.ability.check.all`, mode: jez.CUSTOM, value: `1`, priority: 20 },
                    { key: `flags.midi-qol.disadvantage.skill.all`, mode: jez.CUSTOM, value: `1`, priority: 20 },
                    { key: 'flags.midi-qol.OverTime', mode: jez.OVERRIDE, value: OVERTIME, priority: 20 },
                ]
            }];
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token.actor.uuid, effects: effectData });
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // 3. Post Results
    // 
    let chatMessage = await game.messages.get(args[args.length - 1].itemCardId);
    await jez.wait(100)
    let msg1 = "";
    if (madeNames) {
        msg1 = `<b><u>Successful Save(s)</u></b><br>${madeNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkgreen", fSize: 14, msg: msg1, tag: "saves" })
    }
    if (failNames) {
        msg1 = `<b><u>Failed Save(s)</u></b><br>${failNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkred", fSize: 14, msg: msg1, tag: "saves" })
    }
    await jez.wait(100)
    if (failSaves.length === 0) msg = `All creatures made their saves, no effect<br>`
    else if (failSaves.length === 1) msg = `Until the ritual completes ${failSaves[0].name} must use his/her action and move to get to 
        the light of a ritual lantern and remain there. The saving throw is repeatable at the end of each turn.<br>`
    else msg = `Until the ritual completes all affected must use their action and move to get to the light of a ritual lantern and remain
        there. The saving throw is repeatable at the end of each creature's turn.<br>`
    jez.addMessage(chatMessage, { color: "darkblue", fSize: 14, msg: msg, tag: "saves" })
    return
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Function:  Play the VFX 
    //
    async function runVFX(target) {
        await jez.wait(Math.floor(Math.random() * 10)*200)
        new Sequence()
            .effect()
            .file(`modules/jb2a_patreon/Library/Generic/UI/IconHorror_*_200x200.webm`)
            .attachTo(target)
            .scaleToObject(1.2)
            .opacity(1)
            .fadeIn(1000)            // Fade in for specified time in milliseconds
            .fadeOut(1000)           // Fade out for specified time in milliseconds
            .play()
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Return an array of Token5e's representing all of the living creatures in the scene.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function getLiving(options = {}) {
    const FUNCNAME = "getLiving(options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Function constants & variables
    //
    const NOT_LIVING_NAMES = ['Amber Block', 'Torch']
    const NOT_LIVING_SUBNAMES = [ 'Dancing Light', 'Ceremonial Lantern - ']
    const NOT_LIVING_RACES = [ 'undead', 'construct']
    const TOKENS = canvas.tokens.placeables
    if (TL > 3) jez.trace(`${TAG} Tokens to choose from`, TOKENS)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Filter the tokens on the scene against our filter
    //
    const LIVINGS = TOKENS.filter(checkLiving)
    if (TL > 3) jez.trace(`${TAG} LIVINGS found`, LIVINGS)
    if (LIVINGS.length === 0) return jez.badNews(`${TAG} No LIVINGS fround on scene`, 'w')
    //-------------------------------------------------------------------------------------------------------------------------------
    // Local function used by the filter method
    //
    function checkLiving(subject) {
        if (NOT_LIVING_NAMES.includes(subject.name)) return false
        for (let i = 0; i < NOT_LIVING_SUBNAMES.length; i++) if (subject.name.startsWith(NOT_LIVING_SUBNAMES[i])) return false
        const RACE = jez.getRace(subject)
        for (let i = 0; i < NOT_LIVING_RACES.length; i++) if (RACE.startsWith(NOT_LIVING_RACES[i])) return false
        if (subject.actor.data.data.attributes.hp.value > 0) return true
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return(LIVINGS);
}