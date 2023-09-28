const MACRONAME = "Farie_Fire_0.2"
/*****************************************************************************************
 * DAE Macro to do Faerie Fire
 * 
 * 12/11/21 0.1 Creation of Macro
 * 12/14/21 0.2 Continued effrots to get the code to consistently work
 *****************************************************************************************/
const DEBUG = false;
if(DEBUG) {
    console.log(`************ Executing ${MACRONAME} ****************`)
    console.log(`tag ${args[0].tag}, args[0]:`,args[0]);
}

const lastArg = args[args.length - 1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
let target = canvas.tokens.get(lastArg.tokenId)

//----------------------------------------------------------------------------------------
// async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
// await wait(600);

//----------------------------------------------------------------------------------------
// DAE macro, just call the macro, nothing else
// setup the spell as normal
if (!game.modules.get("advanced-macros")?.active) {ui.notifications.error("Please enable the Advanced Macros module");return;}

//----------------------------------------------------------------------------------------
// Run appropriate code depending on how the macro was called
//
if (args[0].tag === "OnUse") {
    doOnUse(); // Midi ItemMacro On Use
} else {  
    const DAEItem = lastArg.efData.flags.dae.itemData
    if (DEBUG) console.log(` DAEItem:`, DAEItem);
    const saveData = DAEItem.data.save
    if (DEBUG) console.log(` saveData:`, saveData);

    if (args[0] === "off") doOff();         // DAE removal
    if (args[0] === "on") doOn();           // DAE Application
}


//----------------------------------------------------------------------------------------
// Wrap things up
//
console.log(`************ Terminating ${MACRONAME} ****************`)
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/***************************************************************************************
 * Code to execute on effect application
 ***************************************************************************************/
async function doOn() {
    new Dialog({
        title: `Choose the color for Faerie Fire on ${target.name}`,
        buttons: {
            one: { label: "Blue", callback: applyLight("#5ab9e2") },
            two: { label: "Green", callback: applyLight("#55d553") },
            three: { label: "Purple", callback: applyLight("#844ec6") },
        }
    }).render(true);

    function applyLight(newColor) {
        return async () => {
            let color = target.data.lightColor ? target.data.lightColor : "";
            let dimLight = target.data.dimLight ? target.data.dimLight : "0";
            await DAE.setFlag(target, 'FaerieFire', {
                color: color,
                alpha: target.data.lightAlpha,
                dimLight: dimLight
            });
            await target.document.update({
                "lightColor": newColor,
                "lightAlpha": 0.10,          // Lower values are less intense light on screen
                "dimLight": 10,
                "lightAnimation.intensity": 3
            });
            if (DEBUG)
                console.log(`...Applied: ${newColor}, ${newAlpha}, ${newLightLevel}`, target);
        };
    }
}

/***************************************************************************************
 * Code to execute on effect removal
 ***************************************************************************************/
async function doOff() {
    //if (args[0] === "off") {
    let { color, alpha, dimLight } = await DAE.getFlag(target, "FaerieFire")
    target.update({ "lightColor": color, "lightAlpha": alpha, "dimLight": dimLight })
    DAE.unsetFlag(tactor, "FaerieFire")
}

/***************************************************************************************
 * Code to execute on onUse ItemMacro
 ***************************************************************************************/
 async function doOnUse() {
    let msg = `Creatures that failed their a <b>Dexterity saving throw</b>, shed dim light in a 10-foot radius.`
    postResults(msg);
}

/***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    if (DEBUG) console.log(`chatMessage: `,chatMessage);
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}