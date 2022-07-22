const MACRONAME = "Confusion.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro is very much based on the one provided with Midi SRD.  I've done a lot of formatting 
 * and adding of VFX and polish to the messages.
 * 
 * 07/22/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TL = 5;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
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
const VFX_FACE_CONFUSED = 'Icons_JGB/Misc/Confusion_Befuddled.png'  // Move in random direction
const VFX_FACE_DRUNK = 'Icons_JGB/Misc/Confusion_Drunk.png'         // No actions
const VFX_FACE_ANGRY = 'Icons_JGB/Misc/Confusion_Angry.png'         // Attack random target
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE everyround
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
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

    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    await jez.wait(100)

    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${FNAME} | More Detailed Trace Info.`)


    msg = `Maybe say something useful...`
    postResults(msg)
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doEach() {
    const FUNCNAME = "doEach()";
    const FNAME = FUNCNAME.split("(")[0]

    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);


    let tactor = canvas.tokens.get(lastArg.tokenId);
    let r = await new Roll(`1d10`).roll();
    let message;
    if (r._total == 1) {
        message = "The creature uses all its Movement to move in a random direction. To determine the direction, roll a [[1d8]] and assign a direction to each die face. The creature doesn't take an action this turn.";
    } else if (r._total < 7 && r._total > 1) {
        message = "The creature doesn't move or take Actions this turn.";
    } else if (r._total == 7 || r._total == 8) {
        message = "The creature uses its action to make a melee Attack against a randomly determined creature within its reach. If there is no creature within its reach, the creature does nothing this turn."
    } else if (r._total > 8) {
        message = "The creature can act and move normally.";
    }
    let cont = `<div class="dnd5e chat-card item-card midi-qol-item-card">
        <header class="card-header flexrow">
        <img src="systems/dnd5e/icons/spells/wind-magenta-3.jpg" title="Confusion" width="36" height="36" />
        <h3 class="item-name">Confusion</h3>
      </header></div>
      <div class="dice-roll">
        <div class="dice-result">${message}
          <h4 class="dice-total">${r._total}</h4>
          </div>`;
    ChatMessage.create({ roll: r, speaker: { alias: tactor.name }, content: cont });

    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${FNAME} | More Detailed Trace Info.`)

    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff() {
    const FUNCNAME = "doOff()";
    const FNAME = FUNCNAME.split("(")[0]

    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${FNAME} | More Detailed Trace Info.`)

    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return;
}