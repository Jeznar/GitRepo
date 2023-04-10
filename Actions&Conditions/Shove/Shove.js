const MACRONAME = "Shove.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implment Shove macro from my Overrun.0.1
 * 
 * 04/10/23 0.1 Creation of Macro
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
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (args[0].targets.length !== 1)
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, 'w')
    return true
}
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
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Check relatve sizes, target can be no more than one size larger than actor
    let playerSize = Object.keys(CONFIG.DND5E.actorSizes).indexOf(aToken.actor.data.data.traits.size);
    let targetSize = Object.keys(CONFIG.DND5E.actorSizes).indexOf(tToken.actor.data.data.traits.size);
    if (targetSize-1 > playerSize) return postResults(`${tToken.name} is too large for ${aToken.name} to shove.`)
    console.log('playerSize',playerSize,'targetSize',targetSize)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    const PLAYER_WIN = await doShoveRolls(aToken, tToken, {traceLvl: TL})
    if (TL > 1) jez.trace(`${TAG} Player win:`, PLAYER_WIN)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    await jez.wait(150) // Dramatic pause allows sidebar to finish updating
    if (PLAYER_WIN) {
        msg = `<b>${aToken.name}</b> has succesfully shoved <b>${tToken.name}</b>.<br><br>
        <b>${tToken.name}'s</b> token needs to be manually moved 5 feet or marked prone, ${aToken.name}'s choice.</b><br><br>`
        postResults(msg)
    }
    else {
        msg = `<b>${aToken.name}</b> has failed to shove <b>${tToken.name}</b>.<br><br>`
        postResults(msg)
        // await jezcon.addCondition("Prone", aActor.uuid, {allowDups: false, traceLvl: TL }) 
    }
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Evaluate attempt to tumble, return true on success, false on failure.
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doShoveRolls(aToken, tToken, options = {}) {
    const FUNCNAME = "doShoveRolls(aToken, tToken, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'aToken', aToken, 'tToken', tToken, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pick defender's better roll (Acrobatics or Athletics)
    let TARGET_SKILL = "ath";
    if (tToken.actor.data.data.skills.acr.total >= tToken.actor.data.data.skills.ath.total) { TARGET_SKILL = "acr" }
    let TARGET_SKILL_NAME = TARGET_SKILL == "ath" ? "Atheletics" : "Acrobatics"; // Set long form of TARGET_SKILL
    //-------------------------------------------------------------------------------------------------------------------------------
    // Perform checks and add dialog message.  This block of code taken from Crymic's posted implementation 
    //
    if (TL > 0) jez.trace(`${TAG} Evaluate ${aToken.name}'s ${aItem.name} vs ${tToken.name}.`)
    const SKILL = "ath";
    let aOptions = { chatMessage: false, fastForward: true };
    let tOptions = { chatMessage: false, fastForward: true };
    let playerRoll = await MidiQOL.socket().executeAsGM("rollAbility", { request: "skill", targetUuid: aToken.actor.uuid, ability: SKILL, options: aOptions });
    game.dice3d?.showForRoll(playerRoll);
    let targetRoll = await MidiQOL.socket().executeAsGM("rollAbility", { request: "skill", targetUuid: tToken.actor.uuid, ability: TARGET_SKILL, options: tOptions });
    game.dice3d?.showForRoll(targetRoll);
    //
    let playerWin = "";
    let targetWin = "";
    playerRoll.total >= targetRoll.total ? playerWin = `success` : targetWin = `success`;
    let damage_results = `
    <div class="flexrow 2">
    <div><div style="text-align:center">${aToken.name}</div></div><div><div style="text-align:center">${tToken.name}</div></div>
    </div>
    <div class="flexrow 2">
        <div>
            <div style="text-align:center">Athletics</div>
            <div class="dice-roll">
                <div class="dice-result">
                    <div class="dice-formula">${playerRoll.formula}</div>
                    <div class="dice-tooltip">
                        <div class="dice">
                            <header class="part-header flexrow">
                                <span class="part-formula">${playerRoll.formula}</span>
                                <span class="part-total">${playerRoll.total}</span>
                            </header>
                        </div>
                    </div>
                    <h4 class="dice-total ${playerWin}">${playerRoll.total}</h4>
                </div>
            </div>
        </div>
        <div>
            <div style="text-align:center">${TARGET_SKILL_NAME}</div>
            <div class="dice-roll">
                <div class="dice-result">
                    <div class="dice-formula">${targetRoll.formula}</div>
                    <div class="dice-tooltip">
                        <div class="dice">
                            <header class="part-header flexrow">
                                <span class="part-formula">${targetRoll.formula}</span>
                                <span class="part-total">${targetRoll.total}</span>
                            </header>
                        </div>
                    </div>
                    <h4 class="dice-total ${targetWin}">${targetRoll.total}</h4>
                </div>
            </div>
        </div>    
    </div>`;
    const chatMessage = game.messages.get(args[0].itemCardId);
    let content = duplicate(chatMessage.data.content);
    const searchString = /<div class="midi-qol-saves-display">[\s\S]*<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display">${damage_results}`;
    content = content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await jez.wait(500);
    await ui.chat.scrollBottom();
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    console.log('playerWin', playerWin)
    return (playerWin) ? true : false
}