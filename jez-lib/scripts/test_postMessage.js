const MACRONAME = "test_addMessage"
/***************************************************************************************
 * Tester macro for the jez.postMessage function.  Just call with several different
 * argument configurations, etc.
 * 
 * This is intended to run as an OnUse ItemMacro from a Item of some sort.
 * 
 * 01/29/22 0.1 Creation
 ***************************************************************************************/
const lastArg = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;

let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
jez.addMessage(chatMessage, {color:"darkred", fSize:14, msg:"This is from the testing item", tag:"saves" })

jez.postMessage({color: "dodgerblue", fSize: 18, icon: aItem.img, msg: "Sheldon said...", title: "Bazinga!!!" })
jez.postMessage({color: "dodgerblue", fSize: 16, msg: "Sheldon didn't say...", title: "Bazonga!!!", token: aToken})
jez.postMessage({color: "dodgerblue", 
                fSize: 14, 
                icon: aToken.data.img, 
                msg: "This is direct from the acting token", 
                title: `${aToken.name} says...`, 
                token: aToken})

