const macroName = "Toggle_Dodge_0.1"
//###############################################################################
// READ THIS -  Requires Midi-QoL on use -or- Hotbar usage
/********************************************************************************
* Macro to toggle Dodge condition. 
* This macro is intended to be used as an ItemMacro -or- from
* the hotbar.  If used on hotbar, multi-select is supported.
*
* 12/22/21 0.1 JGB Creation from Toggle_Flanking_1.0
********************************************************************************/
const DEBUG = true;
const EFFECT = "Dodge";
const gameRound = game.combat ? game.combat.round : 0;
const iconImage = args[0]?.item.img  || "Icons_JGB/Misc/Dodge.png"
let target = null
const JOURNALENTRY = "@JournalEntry[N6QY1xs1xkYYSRma]{Dodge}"

 // Constants to be used as mode values for midi-qol
 const CUSTOM=0, MULTIPLY=1, ADD=2, DOWNGRADE=3, UPGRADE=4, OVERRIDE=5;

if (args[0]) {  // If ItemMacro, run just once on using token
    target = canvas.tokens.get(args[0].tokenId).actor;
    log(` ItemMacro - token: ${target.name}`);
    processTarget(target, false);
    return;
} else {        // If hotbar, run against all selected tokens
    for (target of canvas.tokens.controlled) {
        log(` HotBar - token: ${target.name}`);
        processTarget(target.actor, true);
    }
}

/**************************************************************************** 
* Process passed the passed target to toggle Three-Quarters_Cover Condition
****************************************************************************/
async function processTarget(target, parm) {
    let quiet = parm ? parm : false;    // quiet defaults to false

    if (quiet) log(`Quietly Processing ${target.name}`, target);
    else log(`Processing ${target.name} with dialog`, target);

    let chatMessage = "";
    let the_message = "";

    if (target.effects.find(ef => ef.data.label === EFFECT)) {
        log(` ${EFFECT} turning off for ${target.data.token.name}`);
        /* game.cub.removeConditions(effect,target.data.token.name,{warn:true}); */
        let existingEffect = await target.effects.find(ef => ef.data.label === EFFECT);
        await existingEffect.delete();
        if (!quiet) {
            the_message = `<em>${target.data.token.name} is <strong>no longer</strong> benefiting from ${JOURNALENTRY}.</em>`;
            chatMessage = game.messages.get(args[0].itemCardId);
        }
    } else {
        log(` ${EFFECT} turning on for ${target.data.token.name}`);
        let effectData = [{
            label: EFFECT,
            icon: iconImage,
            duration: { rounds: 1, startRound: gameRound, startTime: game.time.worldTime },
            /*origin: args[0].uuid,*/
            changes: [
                { key: "flags.midi-qol.grants.disadvantage.attack.all", mode: ADD, value: 1, priority: 20 },
                { key: "flags.midi-qol.advantage.ability.save.dex", mode: ADD, value: 1, priority: 20 }
            ]
        }];
        await target.createEmbeddedDocuments("ActiveEffect", effectData);
        if (!quiet) {
            the_message = `<em>${target.data.token.name} is <strong>now benefiting</strong> from ${JOURNALENTRY}!</em>`;
            chatMessage = game.messages.get(args[0].itemCardId);
        }
    }
    if (!quiet) {
        let content = await duplicate(chatMessage.data.content);
        let searchString = /<div class="midi-qol-saves-display">[\s\S]*<div class="end-midi-qol-saves-display">/g;
        let replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display">${the_message}`;
        content = content.replace(searchString, replaceString);
        await chatMessage.update({ content: content });
        await ui.chat.scrollBottom();
    }
    return;
}
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsString) {
    const FUNCNAME = "postResults(resultsString)";
    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
    log(`Starting ${MACRONAME} ${FUNCNAME}`,
        `resultsString`, resultsString);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    // let chatmsg = await game.messages.get(itemCard.id)
    let chatmsg = game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatmsg.data.content);
    log(`chatmsg: `, chatmsg);
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();

    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
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
        for (i; i < numParms; i = i + 2) console.log(` ${lines++})`, parms[i], ":", parms[i + 1]);
    } else {            // Even number of arguments
        console.log(parms[i], ":", parms[i + 1]);
        i = 2;
        for (i; i < numParms; i = i + 2) console.log(` ${lines++})`, parms[i], ":", parms[i + 1]);
    }
}
