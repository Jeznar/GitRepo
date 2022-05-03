const MACRONAME = "Riding_Familiar.0.2.js"
console.log(MACRONAME)
/*****************************************************************************************
 * Implement Occultist's Rining Familiar ability, based on Enlarge_Reduce.0.5.js 
 * 
 * Description: If you have a familiar without a flying speed, as an action you can make 
 *   them become a creature one size larger than you (up to Large sized) for 8 hours. As 
 *   an action, you can revert your familiar to it's normal size. 
 * 
 *   At 12th level, you can use this ability on familiar with flying speed. Once you do 
 *   this, you cannot do so again until you complete a short or long rest.
 * 
 * HTML Color Codes: https://www.w3schools.com/tags/ref_colornames.asp
 * 
 * 01/10/22 0.1 Creation
 * 05/03/22 0.2 Update for FoundryVTT 9.x (updateMany)
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME}`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const SIZE_ARRAY = ["error", "tiny", "sm", "med", "lg", "huge", "grg"]
let msg = "";
let errorMsg = "";
let saveMsg = "";
const FLAG_NAME = "familiar_name"
const FAMILIAR_NAME = DAE.getFlag(aActor, FLAG_NAME)
log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.constructor.name} ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.constructor.name} ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.constructor.name} ${aItem?.name}`, aItem,
    `Familiar name`, FAMILIAR_NAME);
const EFFECT_NAME = "Riding Familiar"
const GAME_RND = game.combat ? game.combat.round : 0;

let tToken = (args[0]?.targets) ? canvas.tokens.get(args[0]?.targets[0]?.id) : null
// let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
log("tToken", tToken)
let tActor = tToken?.actor;
log("tActor", tActor)

//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (args[0]?.tag === "OnUse") {
    if (!preCheck()) {
        console.log(errorMsg)
        ui.notifications.error(errorMsg)
        return;
    }
}
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                       // DAE removal
//if (args[0] === "on") await doOn();                       // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();              // Midi ItemMacro On Use

log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);

return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
    if (!FAMILIAR_NAME) {
        msg = `<p style="color:DarkRed;">No name was found for ${aToken.name}'s familiar.  
            Please set it with the <b>Set Familiar Name</b> item.</p>`
        errorMsg = `No name was found for ${aToken.name}'s familiar.  Please set it with the 
            Set Familiar Name item.`
        postNewChatMessage(msg);
        return (false)
    }
    if (!oneTarget()) return (false)
    log(`tToken.name ${tToken.name}`)
    if (tToken.name === FAMILIAR_NAME) {
        log(`Targeting ${aToken.name}'s familiar (${FAMILIAR_NAME}), all good so far.`)
    } else {
        msg = `<p style="color:DarkRed;">${aToken.name} is not targeting his/her/its familiar, 
            <b>${FAMILIAR_NAME}</b>, please target the correct token and try again.</p>`
        errorMsg = `${aToken.name} is not targeting his/her/its familiar, 
            <b>${FAMILIAR_NAME}</b>, please target the correct token and try again.`
        postNewChatMessage(msg);
        return (false)
    }

    log('All looks good, to quote Jean-Luc, "MAKE IT SO!"')
    return (true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    // let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    // let tActor = tToken?.actor;
    log("--------------OnUse-----------------", "Starting", `${MACRONAME} ${FUNCNAME}`);

    let aTokenSize = sizeOfToken(aToken); // Original Size of token, 1 = Tiny, ..., 6 = Gargantuan
    log("aTokenSize", aTokenSize)
    let newFamiliarSize = Math.min(4, aTokenSize + 1)
    log("newFamiliarSize", newFamiliarSize)
    let newWidth = (newFamiliarSize === 4) ? 2 : 1
    log("newWidth", newWidth)

    // DialogSaveOrAccept();

    let origWidth = tToken.data.width;
    let mwak = tActor.data.data.bonuses.mwak.damage;
    let ogSizeValue = sizeOfToken(tToken); // Original Size of token, 1 = Tiny, ..., 6 = Gargantuan
    let ogSize = tActor.data.data.traits.size;
    await DAE.setFlag(tActor, MACRO, {
        "width": origWidth,
        "ogMwak": mwak,
        "ogSize": ogSize
    });
    let bonus = mwak + "+1d4";
    if (ogSizeValue > 3) { 
        msg = `<p style="color:Brown;"><b>${aToken.name}'s</b> attempt to <b>enlarge</b> ${tToken.name} 
               fizzles. <b>${tToken.name}</b> is too large to be further enlarged<p>`
        postResults(msg);
        return (false);
    }
    await tActor.update({ "data.bonuses.mwak.damage": bonus, 
                          "data.traits.size": SIZE_ARRAY[newFamiliarSize] });
    await jezUpdateTokenHeightWidth(tToken, newWidth);
    tToken.refresh();  // Causes the token to be redrawn *NOW*
    log(`tToken ${tToken.name}`, tToken)
    msg = `<p style="color:DarkGreen;">
           <b>${aToken.name}'s</b> attempt to <b>enlarge</b> ${tToken.name} is met with success!.</p>
           ${saveMsg}
           <p>${tToken.name} is now larger.</p>`
    postResults(msg);

    log("--------------OnUse-----------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);

    
     //----------------------------------------------------------------------------------
     // Obtain size of the target
     //
     function sizeOfToken(token1) {
         const FUNCNAME = "sizeOfToken(token1)";
         log(`--------------${FUNCNAME}---------------------`, "Starting", `${MACRONAME} ${FUNCNAME}`, "token1", token1);
         class CreatureSizes {
             constructor(size) {
                 this.SizeString = size;
                 switch (size) {
                     case "tiny": this.SizeInt = 1; break;
                     case "sm": this.SizeInt = 2; break;
                     case "med": this.SizeInt = 3; break;
                     case "lg": this.SizeInt = 4; break;
                     case "huge": this.SizeInt = 5; break;
                     case "grg": this.SizeInt = 6; break;
                     default: this.SizeInt = 0;  // Error Condition
                 }
             }
         }
         
         let token1SizeString = token1.document._actor.data.data.traits.size;
         let token1SizeObject = new CreatureSizes(token1SizeString);
         let token1Size = token1SizeObject.SizeInt;  // Returns 0 on failure to match size string
         if (!token1Size) {
             errorMsg = `Size of ${token1.name}, ${token1SizeString} failed to parse. End ${macroName}<br>`;
             log(errorMsg);
             ui.notifications.error(errorMsg);
             return (99);
         }
         log(`=====> Token1 ${token1.name}: ${token1SizeString} ${token1Size}`)
         return (token1Size);
     }
}

/************************************************************************
 * Verify exactly one target selected, boolean return
 ************************************************************************/
async function jezUpdateTokenHeightWidth(tok, newWidth) {
    if (jezIsToken5e(tok)) {
        log(`Update ${tok.name} updating width to ${newWidth}`)
        let updates = [];
        updates.push({
            _id: tok.id,
            height: newWidth,
            width: newWidth
        });
        // canvas.tokens.updateMany(updates);                           // Depricated 
        game.scenes.current.updateEmbeddedDocuments("Token", updates);  // FoundryVTT 9.x 
        return(true);
    } else {
        errorMsg = `Argument passed was not of object type Token5e`
        log(errorMsg, tok)
        ui.notifications.error(errorMsg)
        return(false)
    }
}

/************************************************************************
 * Verify exactly one target selected, boolean return
 ************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        errorMsg = `Targeted nothing, must target single token to be acted upon`;
        log(errorMsg);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        errorMsg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        log(errorMsg);
        return (false);
    }   
    log(`Targeting one target, a good thing`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    let flag = DAE.getFlag(aActor, MACRO);
    log("flag", flag)
    if (flag) {
        await aActor.update({
            "data.bonuses.mwak.damage": flag.ogMwak,
            "data.traits.size": flag.ogSize
        });

        await jezUpdateTokenHeightWidth(aToken, flag.width);
        aToken.refresh();  // Causes the token to be redrawn *NOW*

        // await aToken.document.data.update({"width": flag.width,"height": flag.width});
        await DAE.unsetFlag(aActor, MACRO);
        ChatMessage.create({ content: `<b>${aToken.name}</b> is returned to normal size` });
    } else {
        msg = `"DAE.getFlag(aActor, ${MACRO}) did not find flag value.`
        log(msg)
    }
    log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/***************************************************************************************************
 * Post the results to chat card
 ***************************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    log(`chatMessage: `,chatMessage);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}
/***************************************************************************************************
 * Post a new chat message
 ***************************************************************************************************/
 async function postNewChatMessage(msgString) {
    const FUNCNAME = "postChatMessage(msgString)";
    log(`--------------${FUNCNAME}-----------`, "Starting", `${MACRONAME} ${FUNCNAME}`,
        "msgString",msgString);
    await ChatMessage.create({ content: msgString });
    await wait(1000);
    await ui.chat.scrollBottom();
    log(`--------------${FUNCNAME}-----------`, "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
/***************************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************************/
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
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

/***************************************************************************************************
 * Return true if passed argument is of object type "Token5e"
 ***************************************************************************************************/
function jezIsToken5e(obj) {
    if (obj?.constructor.name === "Token5e") return(true)
    return(false)
}

/***************************************************************************************************
 * Return true if passed argument is of object type "Token5e"
 ***************************************************************************************************/
 function jezIsActor5e(obj) {
    if (obj?.constructor.name === "Actor5e") return(true)
    return(false)
}