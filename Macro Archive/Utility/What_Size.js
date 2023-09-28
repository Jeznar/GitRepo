const MACRONAME = "what_Size_0.1"
/*****************************************************************************************
 * Obtain Size Information for a given Token
 * 
 * 12/28/21 0.1 Creation
 *  *****************************************************************************************/
const DEBUG = true;
const CUSTOM=0, MULTIPLY=1, ADD=2, DOWNGRADE=3, UPGRADE=4, OVERRIDE=5; 

const lastArg = args[args.length - 1];
let aActor = null;
let aToken = null;
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
let msg = "";       // string to be appended to the itemCard reporting results
let sizeInfoObj = {};

log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME}`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);
log("------- Obtained Global Values -------",
    `Active Token (aToken) ${aToken.name}`, aToken,
    `Active Actor (aActor) ${aActor.name}`, aActor);


//--------------------------------------------------------------------------------------
// Fetch size info for the active token
//
let sizeInfo = getSizeInfo(aToken);
log("sizeInfo", sizeInfo)
msg = `${aToken.name} is ${sizeInfo.nameStr} or ${sizeInfo.namestr} which has a value of ${sizeInfo.key}:${sizeInfo.value}`;

//--------------------------------------------------------------------------------------
// Fetch size info for Targets is any
//
if (args[0].targets.length) msg += "<br><br><b>TARGETS</b>"
for (let i = 0; i < args[0].targets.length; i++) {
    const TARGET = args[0].targets[i];
    // log(` ${i} Token Name: ${TARGET.data.name}, Actor Name: ${TARGET._actor.data.name}`,TARGET);
    let line = `<br>${i+1}) ${TARGET.data.name} is ${getSizeInfo(TARGET).nameStr} sized, value ${getSizeInfo(TARGET).value}`
    log(line)
    msg += line;

    let targetSizeInfo = getSizeInfo(TARGET);
    log(targetSizeInfo);
}



//---------------------------------------------------------------------------------------
// Thats all folks
//
postResults(msg);
log("---------------------------------------------------------------------------",
    `Finished`, `${MACRONAME}`);
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/****************************************************************************************
 * Return an object describing the size of a passed TokenID.  The object will contain:
 *   this.key     - short form of size used as a key to obtain other info
 *   this.value   - numeric value of size, 1 is tiny, 6 is gargantuan, 0 is error case
 *   this.namestr - size string in lowercase, e.g. medium
 *   this.nameStr - size string in mixedcase, e.g. Gargantuan
  ***************************************************************************************/
function getSizeInfo(token5E) {
    log("getSizeInfo(token5E)", token5E)
    class CreatureSizeInfos {
        constructor(size) {
            this.key = size;
            switch (size) {
                case "tiny":this.value = 1; 
                            this.namestr = "tiny";
                            this.nameStr = "Tiny";
                            break;
                case "sm":  this.value = 2; 
                            this.nameStr = "small";
                            this.nameStr = "Small";
                            break;
                case "med": this.value = 3; 
                            this.namestr = "medium";
                            this.nameStr = "Medium";
                            break;
                case "lg":  this.value = 4; 
                            this.nameStr = "large";
                            this.nameStr = "Large";
                            break;
                case "huge":this.value = 5; 
                            this.nameStr = "huge";
                            this.nameStr = "Huge";
                            break;
                case "grg": this.value = 6; 
                            this.nameStr = "gargantuan";
                            this.nameStr = "Gargantuan";
                            break;
                default:    this.value = 0;  // Error Condition
                            this.nameStr = "unknown";
                            this.nameStr = "Unknown";
            }
        }
    }
    let token5ESizeStr  = token5E.document?._actor.data.data.traits.size 
                        ? token5E.document?._actor.data.data.traits.size 
                        : token5E._actor.data.data.traits.size
    let token5ESizeInfo = new CreatureSizeInfos(token5ESizeStr);
    if (!token5ESizeInfo.value) {
        let message = `Size of ${token5E.name}, ${token5ESizeStr} failed to parse. End ${MACRONAME}<br>`;
        log(message);
        ui.notifications.error(message);
    }
    return(token5ESizeInfo);
}

/****************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsStr) {
    const lastArg = args[args.length - 1];

    if(DEBUG) console.log(`postResults: ${resultsStr}`);
  
    let chatMessage = await game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsStr}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
  }

/****************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************/
function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    }
}