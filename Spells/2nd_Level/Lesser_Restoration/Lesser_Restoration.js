const MACRONAME = "Lesser_Restoration.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Import of Crymic's macro with some update to fit my world.
 * 
 * Changed to use a radio dialog and to recognize cureable conditions within effects names.  That is
 * this allows curing of: "Diseased" & "Diseased: Covid" as seperate choices.
 * 
 * 11/27/22 0.1 Creation from Crymic's 10/16/22 version with Foundry 10.0 support
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 3;                               // Trace Level for this macro
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
const CON_LIST = ["Blinded", "Deafened", "Paralyzed", "Diseased", "Poisoned"]; // Curable Conditions 
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function preCheck() {
    if (args[0].targets.length !== 1)       // If not exactly one target 
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, "w");
    return (true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //----------------------------------------------------------------------------------
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(LAST_ARG?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken.actor;
    //-----------------------------------------------------------------------------------------------
    // Build a list of effects that can be removed from those found on target
    //
    let effectList = tActor.effects.filter(checkConditions);
    if (TL > 1) jez.trace(`${TAG} Conditions found that can be cured`, effectList)
    function checkConditions(effects) {
        for (let i = 0; i < CON_LIST.length; i++) {
            if (effects.data.label.includes(CON_LIST[i])) {
                if (TL > 3) jez.trace(`${TAG} Found cureable effect: ${effects.data.label}`, effects)
                return effects
            }
        }
        return null
    }
    if (TL > 1) jez.trace(`${TAG} ${effectList.length} Conditions found that can be cured`, effectList)
    if (TL > 2) for (let i = 0; i < effectList.length; i++) 
        jez.trace(`${TAG} ${i + 1}. ${effectList[i].data.label}`)
    //-----------------------------------------------------------------------------------------------
    // Make sure at least one effect that can be cured was found
    //
    msg = `Nothing found on ${tToken.name} that can be cured by this spell.`
    if (effectList.length === 0) return jez.badNews(msg, 'i')
    //-----------------------------------------------------------------------------------------------
    // Build some variables for the dialog
    //
    let queryText = "Select the condition that you would like to cure."
    let template = `<div>
    <label>${queryText}</label>
    <div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">`
    for (let option of effectList) {
        console.log(`=== option`, option)
        template += `<input type="radio" id="${option.data.label}" 
                    name="selectedLine" value="${option.data.label}"> 
                    <label for="${option.data.label}">${option.data.label}</label><br>`
    }
    template += `</div></div>`
    //-----------------------------------------------------------------------------------------------
    // Pop a radio dialog and do the cleansing
    //
    new Dialog({
        title: `${aItem.name} : ${tToken.name}`,
        content: template,
        buttons: {
            yes: {
                icon: '<i class="fas fa-check"></i>',
                label: 'Remove it!',
                callback: async (html) => {
                    // let element = html.find('#element').val();
                    let element = html.find("[name=selectedLine]:checked").val();
                    let effect = tActor.effects.find(i => i.data.label === element);
                    let chatMessage = game.messages.get(LAST_ARG.itemCardId);
                    let chatContent = `<div class="midi-qol-nobox"><div class="midi-qol-flex-container"><div>Cures ${element}:</div><div class="midi-qol-target-npc midi-qol-target-name" id="${tToken.data._id}"> ${tToken.name}</div><div><img src="${tToken.data.img}" width="30" height="30" style="border:0px"></img></div></div></div>`;
                    let content = duplicate(chatMessage.data.content);
                    let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
                    let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${chatContent}`;
                    content = content.replace(searchString, replaceString);
                    await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tActor.uuid, effects: [effect.id] });
                    await chatMessage.update({ content: content });
                    await ui.chat.scrollBottom();
                }
            }
        },
        default: "yes"
    }).render(true);
    //-----------------------------------------------------------------------------------------------
    // All Done
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}