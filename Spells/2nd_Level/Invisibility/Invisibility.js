const MACRONAME = "Invisibility.0.2"
jez.log(MACRONAME)
/*****************************************************************************************
 * Implment Invisibility
 * 
 * 01/25/22 0.2 Revisions to make it actually work
 *****************************************************************************************/
//DAE Item Macro, no arguments passed
if (!game.modules.get("advanced-macros")?.active) {ui.notifications.error("Please enable the Advanced Macros module") ;return;}

const JOURNAL_ENTRY = "@JournalEntry[mQFiOglOh7YayBVP]{Invisible}"
const lastArg = args[args.length - 1];
const target = canvas.tokens.get(lastArg.tokenId)
let msg = ""

for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

jez.log("lastArg.efData.origin",lastArg.efData.origin)
const ICON = lastArg.efData.icon
let actorID = lastArg.efData.origin.split(".")[1]   // Grab originating actor ID from efData.origin
let itemID = lastArg.efData.origin.split(".")[3]    // Grab originating item ID from efData.origin
jez.log(`Origin icon ${ICON}, actorID ${actorID}, itemID ${itemID}`, actorID)

if (args[0] === "on") {  
    msg = `${target.name} becomes <b>${JOURNAL_ENTRY}</b>.`
    //ChatMessage.create({ content: `${target.name} turns invisible`, whisper: [game.user] });

    target.update({ "hidden": true });
    //---------------------------------------------------------------------------------------------
    // Dig through the chat log for all messages spoken by the originating actor, using the item
    // of interest.  The last one of this set will be the chat message that needs info appended 
    // to it.  Viola!!!
    //
    let msgHistory = [];                                            // Array to hold the history
    game.messages.reduce((list, message) => {                       // Tricksy reduce function
        if (message.data?.flags["midi-qol"]?.itemId === itemID &&   // Messages from origin item
            message.data.speaker.actor === actorID)                 // Messages from origin actor
                list.push(message.id);                              // Put'em in an array
        return list;}, msgHistory);                                 // Array will have all matched msgs 
    let itemCard = msgHistory[msgHistory.length - 1];               // Last entry will be most recent
    console.log(`Actor ${actorID}, item ${itemID} casd ${itemCard}`, msgHistory)
    //---------------------------------------------------------------------------------------------
    // Post a results message into the chat card recently found.
    //
    let chatMessage = game.messages.get(itemCard);
    jez.addMessage(chatMessage, { color: "steelblue", fSize: 14, msg: msg, tag: "saves", icon: ICON })
}

if (args[0] === "off") {
    msg = `${target.name} re-appears, no longer invisible.`;
    await jez.postMessage({color:"purple", fSize:14, msg:msg, title:"Invisibility Ends", icon:ICON })
    await target.update({ "hidden": false });
    await jez.wait(1000)
    target.refresh()
}