const MACRONAME = "Rebuke_Trespass.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Inflict damage to the caster equal to the basic damage caused to the target, that is don't 
 * consider potential target resistance/vulerabilities
 * 
 * 08/04/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
const TL = 5;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL>1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
const MAGICMACRO = "ActorUpdate";
const ActorUpdate = game.macros.getName(MAGICMACRO);
if (!ActorUpdate) return jez.badNews(`Cannot locate ${MAGICMACRO} GM Macro`,"e");
if (!ActorUpdate.data.flags["advanced-macros"].runAsGM) 
    return jez.badNews(`${MAGICMACRO} "Execute as GM" needs to be checked.`);
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (TL>1) jez.trace(`=== Starting === ${MACRONAME} ===`);
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
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`);
    // await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    // Must only target one token
    //
    let targetCnt = args[0].targets.length
    if (targetCnt !== 1) return jez.badNews(`Target one target, you targeted ${targetCnt}.`,"w")
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-----------------------------------------------------------------------------------------------
    // If the target made its save, deduct 20 from our hosts health
    //
    if (args[0].saves.length === 1){
        if (TL>1) jez.trace(`${TAG} ${tToken.name} made it's save!`)
        let hpVal = aActor.data.data.attributes.hp.value - 10
        ActorUpdate.execute(token.id, { "data.attributes.hp.value": hpVal }); // Clip off some HP
    }
    //-----------------------------------------------------------------------------------------------
    // If the target failed its save, deduct 10 from our hosts health
    //
    if (args[0].failedSaves.length === 1){
        if (TL>1) jez.trace(`${TAG} ${tToken.name} failed it's save`)
        let hpVal = aActor.data.data.attributes.hp.value - 20
        ActorUpdate.execute(token.id, { "data.attributes.hp.value": hpVal }); // Clip off some HP
    }
    //-----------------------------------------------------------------------------------------------
    // If our host reached zero health, remove the watch dog from our summoning actor
    //
    await jez.wait(100)
    if (aActor.data.data.attributes.hp.value <= 0) {
        if (TL>1) jez.trace(`${TAG} Remove our watchdog effect`)
        let flagValue = await DAE.getFlag(aToken.actor, "Guardian_of_Faith");
        if (TL>1) jez.trace(`${TAG} ${aToken.name} flag value ${flagValue}`)
        oToken = await canvas.tokens.placeables.find(ef => ef.id === flagValue)
        if (!oToken) return jez.badNews(`Unable to find token associated with ID #${flagValue}`,"w")
        if (TL>2) jez.trace(`${TAG} UUID of actor for ${oToken.name}`,oToken.actor.uuid)
        await jezcon.remove("Guardian of Faith", oToken.actor.uuid, {traceLvl: TL});
    }
    //-----------------------------------------------------------------------------------------------
    // If our host reached zero health, remove our host from the scene
    //
    if (aActor.data.data.attributes.hp.value <= 0) {
        if (TL>1) jez.trace(`${TAG} Despawn our host`)
    }
    //-----------------------------------------------------------------------------------------------
    // Exit message
    //
    msg = `${aToken} rebukes the trespass of ${tToken.name}`
    postResults(msg)
    if (TL>1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}