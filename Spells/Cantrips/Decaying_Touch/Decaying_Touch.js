const MACRONAME = "Decaying_Touch.0.3.js"
/*****************************************************************************************
 * Implementation of a Decaying Touch
 * 
 * Description: You wreath your hand in necrotic decay that causes anything you touch to 
 *   wither and die. Make a melee spell attack against the target. On a hit, the target 
 *   takes 1d4 necrotic damage and starts to rot and decay. The first time they take 
 *   damage from another source before the start of your next turn, they take an 
 *   additional 1d6 necrotic damage. Targets immune to diseases are immune to this 
 *   effect.
 * 
 *   The both the initial and secondary damage of the spell increases by a die when you 
 *   reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).
 *   
 * 12/14/21 0.1 Creation of Macro headers and inclusion of Booming Blade as starter code
 * 10/14/22 0.3 Trying to revive this function, update to new formats, ....
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
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
if (args[0] === "off") doOff();         // DAE removal
if (args[0] === "on") doOn();           // DAE Application
if (args[0].tag === "OnUse") doOnUse(); // Midi ItemMacro On Use
return;
/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************
 * Code to execute on effect application
 ***************************************************************************************/
async function doOn() {
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    // let hookId = Hooks.on("updateToken", tokenDamage); <--
    //----------------------------------------------------------------------------------
    // Look up the level of the source actor. Note, originID might be Linked or Unlinked
    //   Linked:   Actor.qvVZIQGyCMvDJFtG.Item.4tptuQLQGWdxNll8
    //   Unlinked: Scene.MzEyYTVkOTQ4NmZk.Token.0hevcNwN4wwXPEUv.Item.1xzrc1y43ujcafbo
    //
    const ORIGIN_UUID = LAST_ARG.origin
    if (TL > 2) jez.trace(`${TAG} ORIGIN_UUID`, ORIGIN_UUID);
    let oActor
    if (ORIGIN_UUID.includes("Actor")) {    // Find actor data for a linked actor
        let oActorId = ORIGIN_UUID.split(".")[1]
        if (TL > 2) jez.trace(`${TAG} oActorId`, oActorId);
        oActor = game.actors.get(oActorId)
    } else {                                // Find actor data for an unlinked actor
        let oTokenId = ORIGIN_UUID.split(".")[3]
        if (TL > 2) jez.trace(`${TAG} oTokenId`, oTokenId);
        let oToken = canvas.tokens.placeables.find(ef => ef.id === oTokenId)
        oActor = oToken.actor
    }
    if (TL > 2) jez.trace(`${TAG} oActor`, oActor);
    //----------------------------------------------------------------------------------
    // Get the level of the origin based on actor found in previous step
    // 
    let oLevel = await jez.getCharLevel(oActor)
    if (TL > 2) jez.trace(`${TAG} oLevel`, oLevel);
    //----------------------------------------------------------------------------------
    // Set the hook
    //
    let hookId = Hooks.on("updateToken", (tokenData, tokenId, diff, userid) => {
        if (tokenId._id === aToken.id) tokenDamage(tokenData, tokenId, diff, userid, oLevel)
    })
    DAE.setFlag(aToken.actor, `${MACRONAME}hookId`, hookId);
}
/***************************************************************************************
 * Actor Damage -- Did the actor take damage?
 ***************************************************************************************/
async function tokenDamage(tokenData, tokenId, diff, userid, oLevel) {
    // Following line checks to see if the damaged token is the one carrying this effect
    const FUNCNAME = "tokenDamage(tokenData, tokenId, diff, userid)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} Starting`)
    if (TL > 1) jez.trace(`${MACRO} ${FUNCNAME} | Input Data`,
        `tokenData`, tokenData, `tokenId`, tokenId, `diff`, diff, `userid`, userid, "oLevel", oLevel)
    //----------------------------------------------------------------------------------
    // Grab some funky data (I don't understand why this should work)
    //
    let oldHp = tokenData.data.actorData.oldHpVal;
    let newHp = tokenData.data.actorData.data.attributes.hp.value;
    if (TL > 1) jez.trace(`${TAG} Funky Data`, `oldHp`, oldHp, `newHp`, newHp)
    //----------------------------------------------------------------------------------
    // 
    //
    await jez.wait(500);
    if (newHp >= oldHp) return {};
    dealDamage(oLevel);
    MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: aToken.actor.uuid, effects: [LAST_ARG.effectId] });
    if (TL > 0) jez.trace(`${TAG} Finished`)
    return;
}
/***************************************************************************************
 * Apply Damage
 ***************************************************************************************/
async function dealDamage(oLevel) {
    const FUNCNAME = "dealDamage(oLevel)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} Starting`)
    if (TL > 1) jez.trace(`${MACRO} ${FUNCNAME} | Input Data`, "oLevel", oLevel)
    //----------------------------------------------------------------------------------
    // 
    //
    await jez.wait(500);
    let lastDamage = DAE.getFlag(aToken.actor, `${MACRONAME}`);
    if (lastDamage) {
        if (TL > 0) jez.trace(`${TAG} Already damaged for ${lastDamage}`)
        return;
    }
    let numDice = 1 + (Math.floor((oLevel + 1) / 6));
    if (TL > 1) jez.trace(`${TAG} numDice`, numDice)
    let damageType = "necrotic";
    let damageRoll = new Roll(`${numDice}d6`).evaluate({ async: false });
    game.dice3d?.showForRoll(damageRoll);
    new MidiQOL.DamageOnlyWorkflow(aToken.actor, aToken, damageRoll.total, damageType,
        [aToken], damageRoll, {
        flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`,
        itemData: aItem, itemCardId: "new"
    }
    );
    if (TL > 1) jez.trace(`${TAG} damageRoll.total `, damageRoll.total);
    if (damageRoll.total > 0) DAE.setFlag(aToken.actor, `${MACRONAME}`, damageRoll.total);
    if (TL > 0) jez.trace(`${TAG} Finished`)
    return;
}
/***************************************************************************************
 * Code to execute on effect removal 
 ***************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 0) jez.trace(`${TAG} Starting`)
    //----------------------------------------------------------------------------------
    // 
    //
    let hookId = DAE.getFlag(aToken.actor, `${MACRONAME}hookId`);
    Hooks.off("updateToken", hookId);
    DAE.unsetFlag(aToken.actor, `${MACRONAME}hookId`);
    DAE.unsetFlag(aToken.actor, `${MACRONAME}`);
    if (TL > 0) jez.trace(`${TAG} Finished`)
}

/***************************************************************************************
 * Code to execute on onUse ItemMacro
 ***************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 0) jez.trace(`${TAG} Starting`)
    //----------------------------------------------------------------------------------
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //----------------------------------------------------------------------------------
    // 
    //
    let msg = `<b>${tToken.name}</b> appears to rot and decay.  The next damage they receive
    may cause additional damage.`
    postResults(msg);
    if (TL > 0) jez.trace(`${TAG} Finished`)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function preCheck() {
    if (args[0].targets.length !== 1)       // If not exactly one target 
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, "w");
    if (LAST_ARG.hitTargets.length === 0)   // If target was missed, return
        return jez.badNews(`Target was missed.`, "w")
    return (true)
}
/***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
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