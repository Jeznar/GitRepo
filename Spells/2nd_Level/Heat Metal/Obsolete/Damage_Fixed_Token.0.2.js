const MACRONAME = "Damage_Fixed_Token_0.2"
console.log(MACRONAME)
/*****************************************************************************************
 * Create a temporary attack item to use against the victim of Heat Metal
 * 
 * 01/01/21 0.1 Creation of Macro
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
log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use

log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    log("--------------OnUse-----------------", "Starting", `${MACRONAME} ${FUNCNAME}`);

    // let actorId = "aqNN90V6BjFcJpI5" // Lizzy
    let actorId = "7BJKpNufDB5XseeU"
    log("actorId", actorId)
    log("canvas.tokens.objects.children",canvas.tokens.objects.children)
    let myToken = canvas.tokens.objects.children.find(e => e.data.actorId === actorId)
    log("myToken",myToken)
    let tActor = myToken.actor
    log("tActor",tActor)
    let target = myToken;
    //---------------------------------------------------------------------------------
    //
    //
    let DAMAGETYPE = "slashing";
    let numDice = 1;
    let itemD = aItem // player.actor.items.getName("Treebane");
    let secondDamage = `${numDice}d8`;
    log(` Dice to roll: ${secondDamage}`);

    let damageRoll = new Roll(`${secondDamage}`).evaluate({ async: false });
    log(` Damage Total: ${damageRoll.total} Type: ${DAMAGETYPE}`);
    log('aActor', aActor);
    log('aToken', aToken);
    log('target', target);
    log(`itemD`, itemD);
    log(`target name ${target.name}`);
    log(`item name: ${itemD.name}`);

    new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, DAMAGETYPE, [target], damageRoll,
        { flavor: `${target.name} withers on hit from ${itemD.name}`, itemCardId: args[0].itemCardId });

    postResults(msg);
    log("--------------OnUse-----------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
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