/*for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];

jez.log("lastArg.efData.origin", lastArg.efData.origin)
const ICON = lastArg.efData.icon
let actorID = lastArg.efData.origin.split(".")[1]   // Grab originating actor ID from efData.origin
let itemID = lastArg.efData.origin.split(".")[3]    // Grab originating item ID from efData.origin
jez.log(`Origin icon ${ICON}, actorID ${actorID}, itemID ${itemID}`, actorID)*/

for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;

jez.log("aActor", aActor)
jez.log("aItem", aItem)
let itemID = aItem._id
let actorID = aActor.id
jez.log(`actorID ${actorID}, itemID ${itemID}`, actorID)

//---------------------------------------------------------------------------------------------
// Dig through the chat log for all messages spoken by the originating actor, using the item
// of interest.  The last one of this set will be the chat message that needs info appended 
// to it.  Viola!!!
//
let msgHistory = [];                                            // Array to hold the history
game.messages.reduce((list, message) => {                       // Tricksy reduce function
    if (message.data?.flags["midi-qol"]?.itemId === itemID &&   // Messages from origin item
        message.data.speaker.actor === actorID)                 // Messages from origin actor
        list.push(message.id);                                  // Put'em in an array
    return list;
}, msgHistory);                                                 // Array will have all matched msgs 
let itemCard = msgHistory[msgHistory.length - 1];               // Last entry will be most recent
jez.log(`Actor ${actorID}, item ${itemID} card ${itemCard}`, msgHistory)

let itemObj = game.messages.get(itemCard)
jez.log("Most Recent Match", itemObj)
jez.log("Speaker", itemObj.data.speaker.alias)
jez.log("Flavor", itemObj.data.flavor)

let actor = game.actors.get(itemObj.data.speaker.actor)
jez.log("Actor", actor)
jez.log("Actor.name", actor.name)