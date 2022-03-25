const MACRONAME = "Binding_Curse.0.1"
console.log(MACRONAME)
/*****************************************************************************************
 * Binding Curse.  Post a simple message to the chat card describing the effect
 * 
 * Description: You bind a creature to a point within 5 feet of it, causing a glowing 
 *   chains of light to connect it to that point.
 * 
 *   For the duration of the spell, if the creature attempts to move away from that point, 
 *   the must make a Wisdom saving throw, or be unable to move more than 5 feet away from 
 *   from that point until the start of their next turn.
 * 
 *   If a creature starts its turn more than 10 feet from the binding point, they must make 
 *   a Strength saving throw are dragged 5 feet toward the binding point.
 * 
 * 01/11/22 0.1 Creation of Macro
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
let SAVE_DC = aItem.data.save.dc;
let SAVE_ABILITY = aItem.data.save.ability
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_INTRO = "modules/jb2a_patreon/Library/Generic/Magic_Signs/EnchantmentCircleIntro_02_Regular_Blue_800x800.webm"
const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Magic_Signs/EnchantmentCircleLoop_02_Regular_Blue_800x800.webm";
const VFX_OUTRO = "modules/jb2a_patreon/Library/Generic/Magic_Signs/EnchantmentCircleOutro_02_Regular_Blue_800x800.webm";
const VFX_OPACITY = 0.9;
const VFX_SCALE = 0.25;

//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (!preCheck()) {
    console.log(errorMsg)
    ui.notifications.error(errorMsg)
    return;
}

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application

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
function preCheck() {
    // Check anything important...
    if (!oneTarget()) return(false)
    log('All looks good, to quote Jean-Luc, "MAKE IT SO!"')
    return (true)
}

/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    log("--------------OnUse-----------------", "Starting", `${MACRONAME} ${FUNCNAME}`,
    `First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken,
    `First Targeted Actor (tActor) ${tActor?.name}`, tActor);

    log(`save ${args[0].saves.length}`, args[0].saves) 
    log(`failed save ${args[0].failedSaves.length}`, args[0].failedSaves)
    // https://www.w3schools.com/tags/ref_colornames.asp
    if (args[0].saves.length !== 0) {   // Target must have saved (This should never occur)
        log(`${tToken.name} saved (This should never occur)`)
        msg =  `<p style="color:Indigo;font-size:14px;">
                ${tToken.name} made its save and is unaffected by ${aItem.name}.
                </p>`
    } else {                            // Target failed save
        log(`${tToken.name} failed`)
        msg = `<p style="color:DarkViolet;font-size:14px;">
        <b>${tToken.name}</b> failed its save and is now affected by ${aItem.name}.</p>
        <p style="color:DarkViolet;font-size:14px;">
        If <b>${tToken.name}</b> attempts to move from its anchor, it must succeed on a <b>DC${SAVE_DC} 
        WIS</b> saving throw, on <u>failure it may move no more than 5 feet this turn</u>.</p>
        <p style="color:DarkViolet;font-size:14px;">
        If <b>${tToken.name}</b> starts its turn more than 10 feet from the anchor, it must make 
        <b>DC${SAVE_DC} STR</b> saving throw or be dragged 5 feet toward the binding point and unable
        to move further.</p>`
    }
    postResults(msg);
    log("--------------OnUse-----------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}

/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
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

/***************************************************************************************
 * Perform the steps that runs when this macro is executed by DAE to add to target
 ***************************************************************************************/
 async function doOn() {
     const FUNCNAME = "doOn()";
     log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
     for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);


    new Sequence()
    .effect()
        .file(VFX_INTRO)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)           
        .waitUntilFinished(-500) // Negative wait time (ms) clips the effect to avoid fadeout
    .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY/2)  
        .persist()
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(1000)            // Fade in for specified time in milliseconds
        .fadeOut(1000)           // Fade out for specified time in milliseconds
        .extraEndDuration(800)  // Time padding on exit to connect to Outro effect
    .play()

    log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

 /***************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************/
  async function doOff() {
    const FUNCNAME = "doOff()";
    log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    log("aToken", aToken)
    log("aToken._object", aToken._object)
    await Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken._object });

    new Sequence()
    .effect()
        .file(VFX_OUTRO)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)  
        .attachTo(aToken)
    .play()

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
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
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