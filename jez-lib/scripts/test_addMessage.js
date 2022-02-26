const MACRONAME = "test_addMessage"
/***************************************************************************************
 * Tester macro for the jez.addMessage function.  Just call with several different
 * argument configurations, etc.
 * 
 * This is intended to run as an OnUse ItemMacro from a Item of some sort.
 * 
 * 01/29/22 0.1 Added comments
 ***************************************************************************************/
console.log(`Start of ${MACRONAME}`)

let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
jez.log("chatMessage", chatMessage)

jez.addMessage(69, "Hey There")
await jez.wait(2000)
jez.addMessage(chatMessage, "and Again!!!")
await jez.wait(2000)
jez.addMessage(chatMessage, "Again! ")
await jez.wait(2000)
jez.addMessage(chatMessage, "Hey There ")
await jez.wait(2000)
let msg = "Saves-Display Message Area"
jez.addMessage(chatMessage, {color:"purple", fSize:15, msg:msg, tag:"saves" })
await jez.wait(2000)
msg = "Attack-Roll Message Area"
jez.addMessage(chatMessage, {color:"darkred", fSize:15, msg:msg, tag:"attack" })
await jez.wait(2000)
msg = "Damage-Roll Message Area"
jez.addMessage(chatMessage, {color:"blue", fSize:15, msg:msg, tag:"damage" })
await jez.wait(2000)
msg = "Hits-Display Message Area"
jez.addMessage(chatMessage, {color:"darkgreen", fSize:15, msg:msg, tag:"hits" })
await jez.wait(2000)
msg = "Other-Roll Message Area"
jez.addMessage(chatMessage, {color:"crimson", fSize:15, msg:msg, tag:"other" })

