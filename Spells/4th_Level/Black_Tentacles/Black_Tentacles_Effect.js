const MACRONAME = "Black_Tentacles_Effect.js"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const BASEMACRO = "Black_Tentacles"
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
const RESTRAINED_JRNL = `@JournalEntry[${game.journal.getName("Restrained").id}]{Restrained}`
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 async function postResults() {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    await jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    if (args[0].targets.length === 0) {     
        msg = `Must target at least one target.  ${args[0].targets.length} were targeted.`
        await postResults();
        return (false);
    }
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    if (LAST_ARG.failedSaves.length === 0) return   // If no failed saves exit
    //---------------------------------------------------------------------------------------------
    // Stack all the failed IDs into a string delimited with spaces
    //
    let failedIds = ""
    for (let i = 0; i < LAST_ARG.failedSaves.length; i++) {
        jez.log(`${i+1} ${LAST_ARG.failedSaves[i].name} ${LAST_ARG.failedSaves[i].id}`)
        if (failedIds) {
            failedIds += " "   // Tack on a space if already has contents
            failedIds += LAST_ARG.failedSaves[i].id
        } else failedIds = LAST_ARG.failedSaves[i].id
    }
    jez.log(`${tToken.id}`,tToken.id)
    //---------------------------------------------------------------------------------------------
    // Append the failedIds to the flag
    //
    let currentValue = await DAE.getFlag(aToken.actor, BASEMACRO);
    jez.log(`Current value of ${BASEMACRO} flag:`, currentValue)
    if (currentValue) {
        currentValue += " "   // Tack on a space if already has contents
        currentValue += failedIds
    } else currentValue = failedIds
    jez.log(`Modified value of ${BASEMACRO} flag:`, currentValue)
    await DAE.setFlag(aToken.actor, BASEMACRO, currentValue);
    //---------------------------------------------------------------------------------------------
    // Add results to chat card
    //
    msg = `<b>${tToken.name}</b> ${RESTRAINED_JRNL} by Black Tentacles, taking damage each turn.`,
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Each turn pop a dialog asking if an escape should be attempted.  If requested perform the save.
 ***************************************************************************************************/
async function doEach() {
    const FUNCNAME = "doEach()";
    const CHECK_DC = args[1];
    const ORIGIN_TOKEN_ID = args[2]
    jez.log(`Check DC: ${CHECK_DC}, Origin Token ID: ${ORIGIN_TOKEN_ID}`)
    let strMod = await jez.getStatMod(aToken, "str");
    let dexMod = await jez.getStatMod(aToken, "dex");
    let chkStat = "Strength"; let chkSta = "str"; let chkMod = strMod
    let oToken = canvas.tokens.placeables.find(ef => ef.id === ORIGIN_TOKEN_ID)
    if (dexMod > strMod) { chkStat = "Dexterity"; chkSta = "dex"; chkMod = dexMod }
    jez.log(`------${FUNCNAME} Stats for escape check ------`, "chkStat", chkStat, "chkSta", chkSta, "chkMod", chkMod)
    const DIALOG_TITLE = `Does ${aToken.name} attempt to break restraint?`
    const DIALOG_TEXT = `The twisty tentacles are keeping <b>${aToken.name}</b> restrained, 
        damaging it each round. Does <b>${aToken.name}</b> want to use its
        action to attempt a ${chkStat} check against ${oToken.name}'s  Black Tentacles spell, 
        check <b>DC${CHECK_DC}?<br><br>`
    new Dialog({
        title: DIALOG_TITLE,
        content: DIALOG_TEXT,
        buttons: {
            yes: {
                label: "Attempt Escape", callback: async () => {
                    let flavor = `${aToken.name} uses this turn's <b>action</b> to attempt a 
                    ${CONFIG.DND5E.abilities[chkSta]} check vs <b>DC${CHECK_DC}</b> to end the 
                    effect from ${aItem.name}.`;
                    let check = (await aToken.actor.rollAbilityTest(chkSta,
                        { flavor: flavor, chatMessage: true, fastforward: true })).total;
                    jez.log("Result of check roll", check);
                    if (CHECK_DC < check) {
                        await aToken.actor.deleteEmbeddedDocuments("ActiveEffect", [LAST_ARG.effectId]);
                        jez.postMessage({
                            color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                            msg: `<b>${aToken.name}</b> succesfully broke free.<br>No longer ${RESTRAINED_JRNL}.`,
                            title: `Succesful Skill Check`, token: aToken
                        })
                    } else {
                        jez.postMessage({
                            color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                            msg: `<b>${aToken.name}</b> failed to break free.<br>Remains ${RESTRAINED_JRNL}.`,
                            title: `Failed Skill Check`, token: aToken,
                        })
                    }
                }
            },
            no: {
                label: "Ignore Tentacles", callback: async () => {
                    jez.postMessage({
                        color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                        msg: `<b>${aToken.name}</b> opted to ignore the Tentacles and remains ${RESTRAINED_JRNL}.`,
                        title: `Declined Skill Check`, token: aToken
                    })
                }
            },
        },
        default: "yes",
    }).render(true);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}