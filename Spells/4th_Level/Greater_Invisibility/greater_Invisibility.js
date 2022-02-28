const MACRONAME = "Greater_Invisibility"
/*****************************************************************************************
 * Implment Greater Invisibility -- Just a copy of invisibility with different DAE 
 * settings.
 * 
 * 02/27/22 0.2 Revisions to make it actually work
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = ""
//DAE Item Macro, no arguments passed
if (!game.modules.get("advanced-macros")?.active) { ui.notifications.error("Please enable the Advanced Macros module"); return; }
const JOURNAL_ENTRY = "@JournalEntry[mQFiOglOh7YayBVP]{Invisible}"
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let affectedNumber = args[0].targets.length
    jez.log("affectedNumber",affectedNumber)
    let tTokensStr = `<b>${args[0].targets[0].name}</b>`
    jez.log("args[0].targets",args[0].targets)
    jez.log("args[0].targets.length",args[0].targets.length)
    if (args[0].targets.length > 2) {
        for (let i = 1; i < args[0].targets.length - 1; i++) {
            tTokensStr += `, <b>${args[0].targets[i].name}</b>`
        }  
    }
    if (args[0].targets.length > 1) tTokensStr += ` and <b>${args[0].targets[args[0].targets.length - 1].name}</b>`
    jez.log(`Selected creature types: ${tTokensStr}`)
    let plural = ""
    if (args[0].targets.length === 1) plural ="s"
    msg = `${tTokensStr} become${plural} <b>${JOURNAL_ENTRY}</b>.`
    //---------------------------------------------------------------------------------------------
    // Post a results message into the chat card recently found.
    //
    const CHAT_MSG = game.messages.get(args[args.length - 1].itemCardId);
    jez.log("chatMessage", CHAT_MSG)
    await jez.addMessage(CHAT_MSG, { color: "steelblue", fSize: 14, msg: msg, tag: "saves"})
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
 async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("LAST_ARG.efData.origin",LAST_ARG.efData.origin)
    const ICON = LAST_ARG.efData.icon
    let actorID = LAST_ARG.efData.origin.split(".")[1]   // Grab originating actor ID from efData.origin
    let itemID = LAST_ARG.efData.origin.split(".")[3]    // Grab originating item ID from efData.origin
    jez.log(`Origin icon ${ICON}, actorID ${actorID}, itemID ${itemID}`, actorID)
    const target = canvas.tokens.get(LAST_ARG.tokenId)
    target.update({ "hidden": true });
    //---------------------------------------------------------------------------------------------
    // Dig through the chat log for all messages spoken by the originating actor, using the item
    // of interest.  The last one of this set will be the chat message that needs info appended 
    // to it.  Viola!!!
    //
    /*let msgHistory = [];                                            // Array to hold the history
    game.messages.reduce((list, message) => {                       // Tricksy reduce function
        if (message.data?.flags["midi-qol"]?.itemId === itemID &&   // Messages from origin item
            message.data.speaker.actor === actorID)                 // Messages from origin actor
                list.push(message.id);                              // Put'em in an array
        return list;}, msgHistory);                                 // Array will have all matched msgs 
    let itemCard = msgHistory[msgHistory.length - 1];               // Last entry will be most recent
    jez.log(`Actor ${actorID}, item ${itemID} casd ${itemCard}`, msgHistory)
    let chatMessage = game.messages.get(itemCard);*/
    //---------------------------------------------------------------------------------------------
    // Check for multiple affected tokens and build appropriate message string.
    //
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const ICON = LAST_ARG.efData.icon
    const target = canvas.tokens.get(LAST_ARG.tokenId)
    msg = `${target.name} re-appears, no longer invisible.`;
    await jez.postMessage({color:"purple", fSize:14, msg:msg, title:"Greater Invisibility Ends", icon:ICON })
    await target.update({ "hidden": false });
    await jez.wait(1000)
    target.refresh()
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }