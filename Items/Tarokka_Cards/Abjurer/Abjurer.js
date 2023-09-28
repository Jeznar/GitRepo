const MACRONAME = "Tarokka_Card.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Intended to be triggered when an effect expires.  When triggered, it:
 *  1. Removes the card that provided the effect
 *  2. Plauys a VFX on actor
 *  3. Posts an appropriate message
 * 
 * 09/25/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 5;                               // Trace Level for this macro
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
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const CARDS = {
    Abjurer: {
        index: 14,  // The number of our card image
        msg: 'Tarokka card protects from death, this one time.',
        act: (aToken) => aToken.document.actor.update({"data.attributes.hp.value": 1})
    },
    Avenger: {
        index: 1,  // The number of our card image
        msg: 'Tarokka card guides the attack, assuring a critical.'
    },
    Paladin: {
        index: 2,  // The number of our card image
        msg: `Tarokka card heals ${aToken.name} in response to damage taken.`,
        act: (aToken) => {
            let healRollObj = new Roll(`3d6[healing]`).evaluate({ async: false });
            if (TL>1) jez.trace(`${TAG} healRollObj`, healRollObj);
            new MidiQOL.DamageOnlyWorkflow(aToken.actor, aToken, healRollObj.total, 
                "healing",[aToken], healRollObj,
                {
                    flavor: `(${CONFIG.DND5E.healingTypes["healing"]})`,
                    itemCardId: args[0].itemCardId,
                    useOther: false
                }
            );
        }
    },
    Soldier: {
        index: 3,  // The number of our card image
        msg: 'Defensive Skills of a Soldier fade, as the Tarokka card vanishes.'
    },
    Mercenary: {
        index: 4,  // The number of our card image
        msg: 'Deadly skills of a Mercenary do extra damage, as the Tarokka card vanishes.'
    },
    Berserker: {
        index: 6,  // The number of our card image
        msg: 'Rage of a Beserker maximizes damage, as the Tarokka card vanishes.'
    },
}
const CARD_DIR = "Icons_JGB/Cards/Tarokka/"     // Path to dir that holds 20 card images 
const CARD_POSTFIX = ".jpg"                     // Suffix for the card images
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
// if (args[0] === "on") await doOn({ traceLvl: TL });                     // DAE Application
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.log(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
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
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(1000)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Find the Tarokka card on the actor
    //
    if (TL > 1) jez.log(`${TAG} L_ARG.efData.label`, L_ARG.efData.label)
    let tarokkaCard = aActor.items.find(item => item.data.name === L_ARG.efData.label && item.type === "equipment")
    if (TL > 1) jez.log(`${TAG} tarokkaCard`, tarokkaCard)
    // if (!tarokkaCard) return jez.badNews(`Could not find ${L_ARG.efData.label} on ${aToken.name}`,'e');
    //-------------------------------------------------------------------------------------------------------------------------------
    // Nab the card name, it will be the last token in L_ARG.efData.label which should look like: Tarokka Card: Abjurer
    //
    const TOKENS = L_ARG.efData.label.split(" ")
    if (TL > 3) jez.log(`${TAG} Name Tokens`, TOKENS);
    const CARD_NAME = TOKENS[TOKENS.length - 1]
    if (TL > 2) jez.log(`${TAG} CARD_NAME`, CARD_NAME);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Make sure our card name is a key in our data object of supported cards.
    //
    if (CARD_NAME in CARDS) { if (TL > 1) jez.log(`${TAG} ${CARD_NAME} is supported.`) }
    else return kez.badNews(` ${CARD_NAME} is not supported.`,'w')
    //-------------------------------------------------------------------------------------------------------------------------------
    // Play a VFX on the using token.
    //
    runVFX(aToken, CARDS[CARD_NAME].index)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Post a message.
    //
    const CARD = `${CARD_DIR}${CARDS[CARD_NAME].index}${CARD_POSTFIX}`
    let RC = await jez.postMessage({
        color: jez.randomDarkColor(), 
        fSize: 14, 
        icon: CARD,
        msg: CARDS[CARD_NAME].msg, 
        title: `Tarokka Card Effect`,
        token: aToken
    })
    if (TL > 2) jez.log(`${TAG} Post Message Returned`, RC);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Delete the card
    //
    tarokkaCard.delete()
    //-------------------------------------------------------------------------------------------------------------------------------
    // Perform the action
    //
    if ( CARDS[CARD_NAME]?.act) {
        await jez.wait(500)
        CARDS[CARD_NAME].act(aToken)
    }
    // await aToken.document.actor.update({"data.attributes.hp.value": 1});
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return;
}
/***************************************************************************************************
* Launch the VFX effects
***************************************************************************************************/
async function runVFX(token1, value) {
   const CARD = `${CARD_DIR}${value}${CARD_POSTFIX}`
   new Sequence()
       .effect()
           .file(CARD)
           .attachTo(token1)
           .scale(0.5)
           .opacity(1)
           .scaleIn(0.1, 1000)
           .rotateIn(180, 1000)    // 1/2 Rotation over 1 second 
           .rotateOut(180, 1000)   // 1/2 Counter Rotation over 1 second
           .scaleOut(0.1, 1000)
           .duration(4000)
           .fadeIn(500) 
           .fadeOut(500) 
           //.waitUntilFinished(-1500) 
       .play();
}
// /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
//  * Perform the code that runs when this macro is removed by DAE, set On. This runs on actor that has the affected applied to it.
//  * Specifically, need to make sure teh card is equipped when the condition is applied
//  *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
// async function doOn(options = {}) {
//     const FUNCNAME = "doOn(options={})";
//     const FNAME = FUNCNAME.split("(")[0]
//     const TAG = `${MACRO} ${FNAME} |`
//     const TL = options.traceLvl ?? 0
//     if (TL === 1) jez.log(`${TAG} --- Starting ---`);
//     if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
//     //-------------------------------------------------------------------------------------------------------------------------------
//     // Comments
//     //
//     if (TL > 3) jez.log(`${TAG} | More Detailed Trace Info.`)
//     //-------------------------------------------------------------------------------------------------------------------------------
//     // 
//     if (TL > 1) jez.log(`${TAG} --- Finished ---`);
//     return true;
// }