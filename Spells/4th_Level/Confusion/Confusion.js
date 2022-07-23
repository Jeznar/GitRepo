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
const DIRECTION = [ 
    "East (Right)", "South East (Down/Right)",
    "South (Down)", "South West (Down/Left)",
    "West (Left)", "North West (Up/Left)",
    "North (Up)", "North East (Up/Right)"];
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


    let roll = await new Roll(`1d10`).roll();   // Roll a d10 to decide what the actor can/will do
    console.log("ROLL", roll)
    if (roll.result === 1) {
        let dRoll = await new Roll(`1d8`).roll();   // Roll a d8 to pick a direction
        msg = `<b>${aToken.name}</b> must use all its Movement to move ${DIRECTION[dRoll.result]}. 
        ${aToken.name} can take no action this turn.`;
        runVFX(VFX_FACE_CONFUSED)
    } else if (roll.result >= 2 && roll.result <= 6 ) {
        msg = `<b>${aToken.name}</b> can not move or take Actions this turn.`;
        runVFX(VFX_FACE_DRUNK)
    } else if (roll.result >= 7 || roll.result <= 8) {
        msg = `<b>${aToken.name}</b> must use its action to make a melee Attack against a randomly determined 
        creature within its reach. If there is no creature within its reach, ${aToken.name} does nothing this 
        turn.`
        runVFX(VFX_FACE_ANGRY)
    } else if (roll.result >= 9) {
        msg = `<b>${aToken.name}</b> can act and move normally this turn.`;
    }
    let cont = `<div class="dnd5e chat-card item-card midi-qol-item-card">
        <header class="card-header flexrow">
        <img src="systems/dnd5e/icons/spells/wind-magenta-3.jpg" title="Confusion" width="36" height="36" />
        <h3 class="item-name">Confusion</h3>
      </header></div>
      <div class="dice-roll">
        <div class="dice-result">
          <p style="color:${jez.randomDarkColor()};font-size:14px">${msg}</p>
          <h4 class="dice-total">${roll.result}</h4>
          </div>`;
    ChatMessage.create({ roll: roll, speaker: { alias: aToken.name }, content: cont });
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${FNAME} | More Detailed Trace Info.`)

    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;

    function runVFX(fileName) {
        //-----------------------------------------------------------------------------------------------
        // Run simple video on the token with the attitude change
        //
        new Sequence()
            .effect()
            .file(fileName)
            .atLocation(aToken)
            .center()
            // .scale(.2)
            .scaleToObject(1)
            .opacity(1)
            .fadeIn(1500)
            .duration(7000)
            .fadeOut(1500)
            .play()
    }
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