const MACRONAME = "test_getSize"
/***************************************************************************************
 * Tester macro for the jez.getSize function which is intended to return an array 
 * containing size information, or false if this function fails to get useful data.
 * 
 * 02/10/22 0.1 Creation
 ***************************************************************************************/
const LAST_ARG = args[args.length - 1];
jez.log(`----------- ${MACRONAME} -------------`)
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
let chatMsg = game.messages.get(args[args.length - 1].itemCardId);

let tok1 = tToken || aToken
let sizeObj = await jez.getSize(tok1)
jez.log("sizeObj", sizeObj)
let msg = `${tok1.name} size info<br>
    - Size Value: ${sizeObj.value}<br>
    - Short string: ${sizeObj.str}<br>
    - Long string: ${sizeObj.string}<br>
    - Capitalized: ${sizeObj.String}<br>`
jez.addMessage(chatMsg, { color: "darkred", fSize: 14, msg: msg, tag: "saves" })
return

/***************************************************************************************************
 * getSize of passed token and return an object with information about that token's size.   
 * If a problem occurs getting the size, false will be returned. 
 *  
 * Example Call:
 *  let sizeObj = jez.getSize(tToken)
 * 
 * The returned object will be composed of:
 * @typedef  {Object} CreatureSizes
 * @property {integer} value  - Numeric value of size: 1 is tiny to 6 gargantuan
 * @property {string}  str    - Short form for size generally used in FoundryVTT data 
 * @property {string}  string - Spelled out size all lower case
 * @property {string}  String - Spelled out size with the first letter capitalized   
 ***************************************************************************************************/
function getSize(token1) {
    class CreatureSizes {
        constructor(size) {
            this.str = size;
            switch (size) {
                case "tiny": this.value = 1; this.string = "tiny"; this.String = "Tiny"; break;
                case "sm": this.value = 2; this.string = "small"; this.String = "Small"; break;
                case "med": this.value = 3; this.string = "medium"; this.String = "Medium"; break;
                case "lg": this.value = 4; this.string = "large"; this.String = "Large"; break;
                case "huge": this.value = 5; this.string = "huge"; this.String = "Huge"; break;
                case "grg": this.value = 6; this.string = "gargantuan"; this.String = "Gargantuan"; break;
                default: this.value = 0;  // Error Condition
            }
        }
    }
    let token1SizeString = token1.document._actor.data.data.traits.size;
    let token1SizeObject = new CreatureSizes(token1SizeString);
    let token1Size = token1SizeObject.value;  // Returns 0 on failure to match size string
    if (!token1Size) {
        let message = `Size of ${token1.name}, ${token1SizeString} failed to parse.<br>`;
        jez.console.log(message);
        ui.notifications.error(message);
        return (false);
    }
    jez.log(` Token1: ${token1SizeString} ${token1Size}`)
    return (token1SizeObject)
}