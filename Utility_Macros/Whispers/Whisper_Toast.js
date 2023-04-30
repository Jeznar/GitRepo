const MACRONAME = "Whisper_Toast.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * This is a macro bar macro to whisper each player with toast options.
 * 
 * 04/24/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 5;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro variables
//
const MACRO_RED = game.macros.find(ef => ef.data.name === 'Toast_Red');         // Find the macro for player to toast with red wine
if (!MACRO_RED) return jez.badNews('Could not find macro: Toast_Red','e')       // Exit if not found
const MACRO_WHITE = game.macros.find(ef => ef.data.name === 'Toast_White');     // Find the macro for player to toast with whitewine
if (!MACRO_WHITE) return jez.badNews('Could not find macro: Toast_White','e')   // Exit if not found
const MACRO_REFUSE = game.macros.find(ef => ef.data.name === 'Toast_Refuse');   // Find the macro for player to refuse to toast
if (!MACRO_REFUSE) return jez.badNews('Could not find macro: Toast_Refuse','e') // Exit if not found
const MSG_DATA = `<i>Please choose (click) one of the following options representing choice for toast:</i><br><br>
@Macro[${MACRO_RED.id}]{Toast with red wine}<br>
@Macro[${MACRO_WHITE.id}]{Toast with white wine}<br>
@Macro[${MACRO_REFUSE.id}]{Refuse to toast}`
//-----------------------------------------------------------------------------------------------------------------------------------
// Build an array of the user names currently active in the game
//
// Get an object containing the user data for players active in the game
let users = game.users.filter(user => user.active);
if (TL > 1) jez.trace(`${TAG} users`,users)
// Get an array of the user names active in the game to use as targets of whispers
let userNames = users.map(u => u.data?.name).filter(name => name !== undefined);
if (TL > 1) jez.trace(`${TAG} userNames`,userNames)
//-----------------------------------------------------------------------------------------------------------------------------------
// Send a whisper to each of the active players
//
for (let i = 0; i < userNames.length; i++) {
    if (TL > 1) jez.trace(`${TAG} ---`)
    if (TL > 1) jez.trace(`${TAG} Processing ${i}. ${userNames[i]}`)
    if (userNames[i] === "GM") continue
    if (TL > 1) jez.trace(`${TAG} Whispering: `, MSG_DATA[userNames[i]])
    ChatMessage.create({
        user : game.user._id,
        content: MSG_DATA,
        whisper: ChatMessage.getWhisperRecipients(userNames[i]),
    });
}