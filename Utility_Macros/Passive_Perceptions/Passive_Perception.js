const MACRONAME = "Passive_Perception.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Calculate the passive perception of all selected tokens and whisper the result to the GM
 * 
 * 05/02/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let dataArray = []
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures
//
//  console.log(selectedTokens(MACRO))
const TOKEN_COUNT = jez.selectedTokens(MACRO)
if (TOKEN_COUNT) {
    for (let token of canvas.tokens.controlled) {
        let newEntry = {
            name: token.name,
            statMod: jez.getStatMod(token, "wis"),
            profMod: jez.getProfMod(token),
            passPer: 10 + jez.getStatMod(token, "wis") + jez.getProfMod(token)
        }
        dataArray.push(newEntry)
    }
    if (TL > 1) jez.trace(`${TAG} Data Array Built`, dataArray)
    // Sort the data array by passive perception score
    let sData = dataArray.sort((a, b) => b.passPer - a.passPer);
    if (TL > 1) jez.trace(`${TAG} Sorted Data Array`, sData)
    // Build the message to be displayed
    msg = `Passive Perception of Selected Tokens:<br>`
    for (let i = 0; i < sData.length; i++) {
        msg = msg + `<br><b>${sData[i].passPer}</b> - ${sData[i].name} (10+${sData[i].statMod}+${sData[i].profMod})`
    }
    console.log(msg)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Build an array of the user names currently active in the game
    //
    // Get an object containing the user data for players active in the game
    let users = game.users.filter(user => user.active);
    if (TL > 1) jez.trace(`${TAG} users`, users)
    // Get an array of the user names active in the game to use as targets of whispers
    let userNames = users.map(u => u.data?.name).filter(name => name !== undefined);
    if (TL > 1) jez.trace(`${TAG} userNames`, userNames)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Whisper the results to the GM
    //
    for (let i = 0; i < userNames.length; i++) {
        if (TL > 1) jez.trace(`${TAG} ---`)
        if (TL > 1) jez.trace(`${TAG} Processing ${i}. ${userNames[i]}`)
        if (userNames[i] != "GM") continue
        ChatMessage.create({
            user: game.user._id,
            content: msg,
            whisper: ChatMessage.getWhisperRecipients(userNames[i]),
        });
    }
}