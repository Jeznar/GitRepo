const MACRONAME = "Overrun.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implment Overrun macro from my Tumble.0.2
 * 
 * 03/23/23 0.2 Creation of Macro
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
    // 
    const PLAYER_WIN = await doTumbleRolls(aToken, tToken, {traceLvl: TL})
    if (TL > 1) jez.trace(`${TAG} Player win:`, PLAYER_WIN)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    await jez.wait(1000) // Dramatic pause allows sidebae to finish updating
    if (PLAYER_WIN) {
        msg = `<b>${aToken.name}</b> has succesfully stiff armed past <b>${tToken.name}</b>.<br><br>
        <b>${aToken.name}'s</b> token needs to be manually moved beyond <b>${tToken.name}</b>.`
        postResults(msg)
    }
    else {
        msg = `<b>${aToken.name}</b> has failed to stiff arm past <b>${tToken.name}</b>.
        <b>${aToken.name}</b> may continue moving.`
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
async function doTumbleRolls(aToken, tToken, options = {}) {
    const FUNCNAME = "doTumbleRolls(aToken, tToken, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'aToken', aToken, 'tToken', tToken, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Perform checks and add dialog message.  This block of code taken from Crymic's posted implementation 
    //
    if (TL > 0) jez.trace(`${TAG} Evaluate ${aToken.name}'s ${aItem.name} vs ${tToken.name}.`)

    let playerSize = Object.keys(CONFIG.DND5E.actorSizes).indexOf(aToken.actor.data.data.traits.size);
    let targetSize = Object.keys(CONFIG.DND5E.actorSizes).indexOf(tToken.actor.data.data.traits.size);
    const SKILL = "ath";
    const ADVAN = "advantage";
    const DISADVAN = "disadvantage";
    let aOptions = { chatMessage: false, fastForward: true };
    let tOptions = { chatMessage: false, fastForward: true };
    playerSize > targetSize ? aOptions[ADVAN] = true : playerSize < targetSize ? aOptions[DISADVAN] = true : ""; // TODO: sizeCheck is not used
    let playerRoll = await MidiQOL.socket().executeAsGM("rollAbility", { request: "skill", targetUuid: aToken.actor.uuid, ability: SKILL, options: aOptions });
    game.dice3d?.showForRoll(playerRoll);
    let targetRoll = await MidiQOL.socket().executeAsGM("rollAbility", { request: "skill", targetUuid: tToken.actor.uuid, ability: SKILL, options: tOptions });
    game.dice3d?.showForRoll(targetRoll);
    //
    let playerRollType = playerRoll.terms[0].options.advantage ? " (Advantage)" : playerRoll.terms[0].options.disadvantage ? " (Disadvantage)" : "";
    let targetRollType = targetRoll.terms[0].options.advantage ? " (Advantage)" : targetRoll.terms[0].options.disadvantage ? " (Disadvantage)" : "";
    let playerWin = "";
    let targetWin = "";
    playerRoll.total >= targetRoll.total ? playerWin = `success` : targetWin = `success`;
    let damage_results = `
    <div class="flexrow 2">
    <div><div style="text-align:center">${aToken.name}</div></div><div><div style="text-align:center">${tToken.name}</div></div>
    </div>
    <div class="flexrow 2">
        <div>
            <div style="text-align:center">Athletics${playerRollType}</div>
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
            <div style="text-align:center">Athletics${targetRollType}</div>
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