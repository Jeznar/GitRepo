const MACRONAME = "Lay_On_Hands.0.3"
/*****************************************************************************************
 * Based on a Lay-on-Hands macro found online at:
 * https://github.com/foundry-vtt-community/macros/blob/4e25a66ef7990dbcb0c9015b554286de147c5116/actor/5e_lay_on_hands.js
 *  READ First!
 *  Themed after Kandashi's create item macro
 * 
 * 12/24/21 0.1 Creation of Macro
 * 12/26/21 0.2 Correcting the type of spell to require a save
 * 12/27/21 0.3 Add cure disease/poison option
 *****************************************************************************************/
const DEBUG = false;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const RESOURCE = "primary";
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME} or ${MACRO}`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

//---------------------------------------------------------------------------------------
// Set some global variables and constants
//
let msg = "";
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
//---------------------------------------------------------------------------------------
const LASTARG = args[args.length - 1];
if (LASTARG.tokenId) aActor = canvas.tokens.get(LASTARG.tokenId).actor; else aActor = game.actors.get(LASTARG.actorId);
if (LASTARG.tokenId) aToken = canvas.tokens.get(LASTARG.tokenId); else aToken = game.actors.get(LASTARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LASTARG.efData?.flags?.dae?.itemData;

const getData = await aActor.getRollData();
const mainRes = getData.resources[RESOURCE];
let tTokenIds = game.user.targets.ids                       // Targeted Tokens
let tToken = canvas.tokens.get(tTokenIds[0])                // Targeted Token (First)
let tActor = tToken?.document?._actor;                      // Targeted Actor
let hpMax = tActor?.data.data.attributes.hp.max;
let hpVal = tActor?.data.data.attributes.hp.value;


log("------- Obtained Global Values -------",
    `Active Token (aToken) ${aToken.name}`, aToken,
    `Active Actor (aActor) ${aActor.name}`, aActor,
    `Active Item (aItem) ${aItem.name}`, aItem,
    `${tTokenIds.length} Targeted Token(s) (tTokens)`, tTokenIds,
    `First target (if any)`, canvas.tokens.get(tTokenIds[0]),
    "getData", getData,
    "RESOURCE", RESOURCE,
    "mainRes", mainRes,
    `Targeted token ${tToken?.data?.name}`, tToken,
    `Targeted actor ${tActor?.name}`, tActor);

//---------------------------------------------------------------------------------------
// Make sure exactly one token was targeted
//
if (!oneTarget()) {
    await postResults(msg);
    log("msg", msg);
    log(`Ending ${MACRONAME}`);
    return;
}
/**
 * System: D&D5e
 * Apply lay-on-hands feat to a target character.  Asks the player how many HP to heal and
 * verifies the entered value is within range before marking down usage counter. If the player
 * has OWNER permissions of target (such as GM or self-heal) the HP are applied automatically; 
 * otherwise, a 'roll' message appears allowing the target character to right-click to apply healing.
 */

let confirmed = false;
let featUpdate = duplicate(aItem);

// math.clamp(x, min, max) returns x if between min and max, otherwise min or max
let maxHeal = Math.clamped(mainRes.value, 0, hpMax - hpVal);
log(`Calc of maxHeal (${maxHeal}): ${mainRes.value} available, target's max hp ${hpMax}, current hp ${hpVal}`);

let maxDoP = math.floor(mainRes.value / 5);

let content = `<p><em><b>${aActor.name}</b> lays hands on <b>${tToken.name}</b>.</em>
                  <br><br>You have a total of <b>${mainRes.value} remaining</b> in your resource pool.
                  <br><br>How many health do you want to restore to ${tToken.name}? 
                  <br><br>You may attempt to cure up to <b>${maxDoP} diseases/poisons</b> on 
                    ${tToken.name} at the cost of 5 each.</p>
               <form>
                  <div class="form-group">
                    <label for="num">HP to Restore: (Max: ${maxHeal}) </label>
                    <input id="num" name="num" type="number" min="0" max="${maxHeal}"></input>
                  </div>
                  <div class="form-group">
                    <label for="numDoP">Disease/Poison Cures: </label>
                    <input id="numDoP" name="numDoP" type="number" min="0" max="${maxDoP}"></input>
                  </div>
              </form>`;                  
new Dialog({
    title: "Lay on Hands Healing",
    content: content,
    buttons: {
        heal: { label: "Heal!", callback: () => confirmed = true },
        cancel: { label: "Cancel", callback: () => confirmed = false }
    },
    default: "heal",

    close: async html => {
        if (confirmed) {
            let healAmount = Math.floor(Number(html.find('#num')[0].value));
            let dopAmount = Math.floor(Number(html.find('#numDoP')[0].value));
            log("dopAmount", dopAmount);
            let chargesUsed = healAmount + 5*dopAmount;
            log("charges used", chargesUsed);
            log("mainRes.value", mainRes.value)
            if (chargesUsed < 1 || chargesUsed > mainRes.value) {
                msg = `${healAmount} healing and (${dopAmount} disease/poison)*5 exceeds ${mainRes.value}. Aborting action.`
                ui.notifications.warn(msg);
                log(msg);
            } else if (healAmount > maxHeal) {
                msg = `Attemting to heal for more than ${maxHeal} not allowed. Aborting action.`
                ui.notifications.warn(msg);
                log(msg);
            } else {
                msg = `${aToken.name} applied healing to ${tToken.name}.<br>`
                if (healAmount > 0) msg += `${healAmount} point of health has been restored.<br>`
                if (dopAmount > 0) msg += `${dopAmount} disease/poison(s) perhaps cured.<br>
                    <p style="color:black;"><b>FoundryVTT</b>: Disease/poison(s) done manually.</p>`
                await PerformHeal(aActor, aToken, tToken, healAmount);
                await replaceHitsWithHeals();
                DecrementResource(aToken, RESOURCE, mainRes.value, chargesUsed);
                // postChatMessage(healAmount, "Here is a message");
                await postResults(msg);
            }
        };
    }
}).render(true);



/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/************************************************************************
 * Perform the healing 
*************************************************************************/
async function PerformHeal(aActor, aToken, tToken, healAmount) {
    const FUNCNAME = "PerformHeal(aActor, aToken, [tToken], healAmount)";
    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
    log(`Starting ${MACRONAME} ${FUNCNAME}`, 
        "`aActor", aActor, "aToken", aToken, 
        "[tToken]", [tToken], "healAmount", healAmount);

    let healRollObj = new Roll(`${healAmount}`).evaluate({ async: false });
    log(`healRollObj`, healRollObj);
    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, healAmount, 
        "healing",[tToken], healRollObj,
        {
            flavor: `(${CONFIG.DND5E.healingTypes["healing"]})`,
            itemCardId: args[0].itemCardId,
            useOther: false
        }
    );

    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -",
    `Finished`, `${MACRONAME} ${FUNCNAME}`);
}


/************************************************************************
 * Decrement the resource
*************************************************************************/
async function DecrementResource(tokenD, typeRes, curRes, spentRes) {
    const FUNCNAME = "DecrementResource(tokenD, typeRes, curRes, spentRes)";
    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
    log(`Starting ${MACRONAME} ${FUNCNAME}`, 
        `tokenD`, tokenD, "curRes", curRes, "spentRes", spentRes);

    let newRes = Number(curRes - spentRes);
    let resType = typeRes === "primary" 
        ? "data.resources.primary.value" 
        : resourceType === "secondary" 
            ? "data.resources.secondary.value" 
            : "data.resources.tertiary.value";
    let resUpdate = {};
    resUpdate[resType] = newRes;

    log("Values set", 
        "newRes",newRes,"resType",resType,"resUpdate[resType]",resUpdate[resType]);

    await tokenD.actor.update(resUpdate);

    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -",
    `Finished`, `${MACRONAME} ${FUNCNAME}`);
}

/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        msg = `Targeted nothing, must target single token to be acted upon`;
        ui.notifications.warn(msg);
        log(msg);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        msg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        ui.notifications.warn(msg);
        log(msg);
        return (false);
    }
    log(` targeting one target`);
    return (true);
}
/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function postChatMessage(number, flavor) {
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: `${aToken.name} lays hands on ${tToken.name} for ${number} HP.<br>${flavor}`
    });
}

/***************************************************************************************
 * Replace first string with second on chat card
 ***************************************************************************************/
 async function replaceHitsWithHeals() {
    const FUNCNAME = "replaceHitsWithHeals()";
    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
    log(`Starting ${MACRONAME} ${FUNCNAME}`);

    // let chatmsg = await game.messages.get(itemCard.id)
    let chatmsg = game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatmsg.data.content);
    const searchString = / hits/g;
    const replaceString = `<p style="color:Green;"> Heals</p>`;
    // log("============================ content before", content)
    content = await content.replace(searchString, replaceString);
    // log("============================ content after", content)
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();

    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
async function postResults(resultsString) {
    const FUNCNAME = "postResults(resultsString)";
    log("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
    log(`Starting ${MACRONAME} ${FUNCNAME}`, `resultsString`, resultsString);

    // let chatmsg = await game.messages.get(itemCard.id)
    let chatmsg = game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatmsg.data.content);
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display"></div>
        <div><p style="color:blue;font-size:15px;">${resultsString}<p>`;
    // log("============================ content before", content)
    content = await content.replace(searchString, replaceString);
    // log("============================ content after", content)
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();
    log(` chatmsg 3 `, chatmsg);

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

/****************************************************************************************
 * Tricksy little sleep implementation
 ***************************************************************************************/
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }