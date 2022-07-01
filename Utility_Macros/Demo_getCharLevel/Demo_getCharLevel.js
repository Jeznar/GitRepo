const MACRONAME = "Demo_getCharLevel.js"
/*****************************************************************************************
 * Macro to find the level of the targeted token and print it.
 * 
 * 05/05/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 4;
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(2, trcLvl, `  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
jez.trc(5, trcLvl, "LAST_ARG", LAST_ARG)
// Set the value for the Active Actor (aActor)
let aActor;
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else aActor = game.actors.get(LAST_ARG.actorId);
jez.trc(5, trcLvl, "aActor", aActor)
//
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
jez.trc(5, trcLvl, "aToken", aToken)
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
jez.trc(5, trcLvl, "aItem", aItem)
let msg = "";
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        postResults(msg);
        return (false);
    }
    return (true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("tToken.actor", tToken.actor)
    // jez.log("tToken.actor.data.data.classes", tToken.actor.data.data.classes) / Deprecated 9.x
    jez.log("tToken.actor.data.document?._classes", tToken.actor.data.document?._classes)

    /*let charLevel = 0
    for (const CLASS in tToken.actor.data.data.classes) {
        jez.log(CLASS, tToken.actor.data.data.classes[CLASS].levels)
        charLevel += tToken.actor.data.data.classes[CLASS].levels
    }
    if (!charLevel) {  // NPC's don't have classes, use CR instead
        charLevel =  tToken.actor.data.data.details.cr
    }*/

    // jez.log("by Actor", getCharLevel(tActor))
    // jez.log("by Token", getCharLevel(tToken))
    // jez.log(`by Token.id ${tToken.id}`, getCharLevel(tToken.id))
    // msg = `${tToken.name} is level: ${getCharLevel(tToken)}`

    // jez.log("by Actor", jez.getCharLevel(tActor))
    // jez.log("by Token", jez.getCharLevel(tToken))
    // jez.log(`by Token.id ${tToken.id}`, jez.getCharLevel(tToken.id))
    msg = `${tToken.name} is level: ${jez.getCharLevel(tToken)}`

    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Obtain and return the character level of the passed token, actor or token.id
 ***************************************************************************************************/
function getCharLevel(subject) {
    let trcLvl = 4
    //----------------------------------------------------------------------------------------------
    // Convert the passed parameter to Actor5e
    //
    let actor5e = null
    if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
        if (subject.constructor.name === "Token5e") actor5e = subject.actor
        else if (subject.constructor.name === "Actor5e") actor5e = subject
        else {
            let msg = `Object passed to jez.getCharacterLevel(subject) is type '${typeof (subject)}' 
        must be a Token5e or Actor5e`
            ui.notifications.error(msg)
            console.log(msg)
            return (false)
        }
    } else if ((typeof (subject) === "string") && (subject.length === 16))
        actor5e = jez.getTokenById(subject).actor
    else {
        let msg = `Parameter passed to jez.getCharacterLevel(subject) is not a Token5e, Actor5e, or 
    Token.id: ${subject}`
        ui.notifications.error(msg)
        console.log(msg)
        return (false)
    }
    //----------------------------------------------------------------------------------------------
    // Find the Actor5e's character level.
    //
    // actor.data.data.classes -- Deprecated 9.x
    // actor.data.document?._classes -- as of 9.x
    //
    let charLevel = 0
    // PC's can have multiple classes, add them all up
    jez.trc(3, trcLvl, "*** actor5e.data.document", actor5e.data.document)
    jez.trc(3, trcLvl, "*** actor5e.data.document?._classes", actor5e.data.document?._classes)
    if (actor5e.data.document?._classes) {
        jez.trc(3, trcLvl, "==> Found data in actor5e.data.document?._classes", actor5e.data.document?._classes)
        for (const CLASS in actor5e.data.document?._classes) {
            jez.trc(4, trcLvl, "Type of levels", jez.typeOf(actor5e.data.document._classes?.[CLASS]?.data?.data?.levels))
            let level = parseInt(actor5e.data.document._classes?.[CLASS]?.data?.data?.levels)
            jez.trc(4, trcLvl, "level", level)
            charLevel += level
        }
    }
    else {
        jez.trc(0, trcLvl, "==> Trying for classes actor5e.classes", actor5e.classes)
        for (const CLASS in actor5e.classes) {
            jez.trc(4, trcLvl, "Type of levels", jez.typeOf(actor5e.classes?.[CLASS]?.data?.data?.levels))
            let level = parseInt(actor5e.classes?.[CLASS]?.data?.data?.levels)
            jez.trc(4, trcLvl, "level", level)
            charLevel += level
        }
    }
    // NPC's don't have classes, use CR instead
    if (!charLevel) charLevel = actor5e.data.data.details.cr
    return (charLevel)
}