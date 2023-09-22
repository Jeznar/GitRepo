const MACRONAME = "Grapple_Escape_FixedDC.0.2.js"
const GRAPPLER_ACTOR_UUID = "%GRAPPLER_ACTOR_UUID%" // Actor.8D0C9nOodjwHDGQT
const GRAPPLER_TOKEN_UUID = "%GRAPPLER_TOKEN_UUID%" // Scene.MzEyYTVkOTQ4NmZk.Token.cBMsqVwfwf1MxRxV
const FIXED_DC = '%FIXED_DC%'                       // 15
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Attempt to escape grapple against a fixed DC 
 * 
 * 07/06/22 0.1 JGB Created from Grapple_Escape.0.8.js
 * 09/22/23 0.2 Replace jez.trc with jez.log
 **********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
let msg = ""
const TL = 4
if (TL > 1) jez.log(`${TAG}  === Starting === ${MACRONAME} ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.log(`${TAG}    args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Actor (aActor)
//
let aActor;
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else aActor = game.actors.get(LAST_ARG.actorId);
//
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData
if (TL > 3) jez.log(`${TAG} ----------------`, "aActor", aActor, "aToken", aToken, "aItem", aItem)
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
main()
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Do the real stuff
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function main() {
    let tTokenDocument5e = await fromUuid(GRAPPLER_TOKEN_UUID)     // Retrieves document for the UUID
    let aEffect = await aToken?.actor?.effects?.find(ef => ef?.data?.label === "Grappled" &&
        ef?.data?.origin === GRAPPLER_ACTOR_UUID)
    if (TL > 3) jez.log(`${TAG} Active Effect`, aEffect)
    //-----------------------------------------------------------------------------------------------
    // Obtain the origin Token data object from the UUID
    //
    if (!tTokenDocument5e) {    // Grappling actor not found, clear effect and delete escape item
        if (TL > 3) jez.log(`${TAG} tTokenDocument5e`, tTokenDocument5e)
        msg = `<b>${aToken.name}</b>'s grappler seems to have left the field, removing the effect and
        temporary item.  This did not require an action.`
        await aEffect?.delete();
        await jez.deleteItems(aItem.name, "feat", aToken.actor);
        if (TL > 2) jez.log(`${TAG} ${msg}`);
        postResults(msg);
        return
    }
    let tToken = tTokenDocument5e._object                   // Nab Token5e out of a aTokenDocument5e
    if (TL > 3) jez.log(`${TAG} tTokenDocument5e._actor.uuid`, tTokenDocument5e?._actor?.uuid)
    //-----------------------------------------------------------------------------------------------
    // Find the Grappled effect on active token that corresponds with this item
    //
    if (TL > 1) jez.log(`${TAG} aToken.actor.effects`, aToken.actor.effects)
    if (!aEffect) {         // Grappled effect not found on aToken, delete this macro
        msg = `<b>${aToken?.name}</b> lacks the grappled by <b>${tToken?.name}</b> effect, removing the
        temporary item.  This did not require an action.`
        if (TL > 2) jez.log(`${TAG} ${msg}`);
        await jez.deleteItems(aItem.name, "feat", aToken.actor);
        postResults(msg);
        return
    }
    if (TL > 3) jez.log(`${TAG} Current Grappled effect`, aEffect)
    //-----------------------------------------------------------------------------------------------
    // If the tToken is not grappling, delete grappled effect and this macro
    //
    if (!tToken.actor.effects.find(ef => ef.data.label === "Grappling")) {
        await aEffect.delete();
        await jez.deleteItems(aItem.name, "feat", aToken.actor);
        msg = `<b>${aToken.name}</b> was not being grappled by <b>${tToken.name}</b>, removed the effect and
        temporary item.  This did not require an action.`
        if (TL > 2) jez.log(`${TAG} ${msg}`);
        postResults(msg);
        return;
    }
    //-----------------------------------------------------------------------------------------------
    // Determing the escapee's check result (roll dialog)
    //
    let skill = "ath";
    if (aToken.actor.data.data.skills.acr.total >= aToken.actor.data.data.skills.ath.total) { skill = "acr" }
    let aTokenRoll = await aToken.actor.rollSkill(skill, { chatMessage: false });
    if (!aTokenRoll) return; // terminate this macro if dialog fails to return a roll
    if (TL > 3) jez.log(`${TAG} aTokenRoll`, aTokenRoll)
    let rollType = aTokenRoll.terms[0].modifiers[0] === "kh" ? " (Advantage)" : aTokenRoll.terms[0].modifiers[0] === "kl" ? " (Disadvantage)" : "";
    game.dice3d?.showForRoll(aTokenRoll);
    let aTokenSkill = skill == "ath" ? "Atheletics" : "Acrobatics"; // Set long form of skill
    /**************************************************************************
     * Determine if escape succeeded 
     *************************************************************************/
    let aTokenWin = "";
    let targetWin = "";
    aTokenRoll.total >= FIXED_DC ? aTokenWin = `success` : targetWin = `success`;
    if (TL > 2)
        if (aTokenWin) jez.log(`${TAG}  ${aToken.name} escaped from ${tToken.name}'s grapple`)
        else jez.log(`${TAG}  ${aToken.name} remains grappled by ${tToken.name}`)
    /**************************************************************************
     *  Remove grappled and grappling condition if aToken won the contest
     **************************************************************************/
    let message = ""
    if (aTokenWin) {
        // aToken should always have authority to alter effects in their own token
        let aTokenExistingEffect = await aToken.actor.effects.find(ef => ef.data.label === "Grappled");
        if (aTokenExistingEffect) await aTokenExistingEffect.delete();
        message = `<b>${aToken.name}</b> has escapped the grapple from <b>${tToken.name}</b> 
        with a check result of ${aTokenRoll.total} (${aTokenRoll.formula}) vs DC${FIXED_DC}`
    }
    else {
        message = `<b>${aToken.name}</b> remains grappled by <b>${tToken.name}</b>
        with a check result of ${aTokenRoll.total} (${aTokenRoll.formula}) vs DC${FIXED_DC}`
    }
    if (TL > 2) jez.log(`${TAG} ${message}`);
    await postResults(message);
    await jez.wait(100)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    if (TL > 1) jez.log(`${TAG}  --- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    if (TL > 2) jez.log(`${TAG} postResults Parameters`, "msg", msg)
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.log(`${TAG}  --- Finished --- ${MACRONAME} ${FUNCNAME} ---`);
}