const MACRONAME = "Turn_the_Faithless.0.4.js";
/*******************************************************************************************
 * Source: Unknown
 * Requires: DAE, Callback macros ActorUpdate
 * 
 * 12/21/21 0.1 JGB Imported code added headers
 * 12/22/21 0.2 JGB Working on getting the set of targets 
 * 12/22/21 0.3 JGB Remove stray existance of Frightened 
 * 05/04/22 0.4 Update for Foundry 9.x
 *******************************************************************************************/
const DEBUG = true;
log("---------------------------------------------------------------------------",
    "Starting", MACRONAME);

const ActorUpdate = game.macros?.getName("ActorUpdate");
if (!ActorUpdate) return ui.notifications.error(`Cannot locate ActorUpdate GM Macro`);
if (!ActorUpdate.data.flags["advanced-macros"].runAsGM) return ui.notifications.error(`ActorUpdate "Execute as GM" needs to be checked.`);

const activeToken = token; // Token is preset in the execution environment to active token
const tokenId = args[0].tokenId;
const actorD = game.actors.get(args[0].actor._id);
const level = actorD.getRollData().classes.paladin.levels;
const dc = actorD.getRollData().attributes.spelldc;
const itemD = args[0].item;
const saveType = "wis";
const RANGEPAD = 4.9;
const TURNEDICON = "Icons_JGB/Misc/Turned.png";
const allowedUnits = ["", "ft", "any"];
const EFFECT = "Turned"
const faithlessTypes = ["undead", "fey", "fiend"]
const CUSTOM=0, MULTIPLY=1, ADD=2, DOWNGRADE=3, UPGRADE=4, OVERRIDE=5; // midi-qol mode values
const TURNED_JRNL = `@JournalEntry[${game.journal.getName("Turned").id}]{Turned}`

let toFarCount = 0;
let toFar = "";
let turnTargets = [];
let isNPC = true;
let targetType = "";
let isFaithless = false;


log('Inititial Values Set as follows:',
    "actorD", actorD,
    "activeToken", activeToken,
    "tokenId", tokenId,
    "token", token,     // Preset in the execution environment to active token
    "level", level,
    "dc", dc,
    "itemD", itemD,
    "itemD.data.range.value", itemD.data.range.value,
    "itemD.data.range.units", itemD.data.range.units,
    "saveType", saveType);
log("rollData", actorD.getRollData());

let spellRange = getSpellRange(itemD, allowedUnits) + RANGEPAD;
log("Values from Item Card", "spellRange", `${spellRange} including ${RANGEPAD} padding`);

let targetList = getInRangeTokens(activeToken, spellRange);

log(`Total of ${targetList.length} tokens in range`, targetList);
if (DEBUG) for (let i = 0; i < targetList.length; i++) log(` ${i + 1} ${targetList[i].name}`);

for (let targeted of targetList) {
    let target = canvas.tokens.get(targeted.id);
    log("Targeting", target.actor.name);
    //------------------------------------------------------------------------------------------
    // Need the creature type, but PCs and NPCs store that data differently.  Some important 
    // data hidden in the data structures:
    //   target.document._actor.data.type contains npc or character 
    // 
    // For NPCs:
    //   target.document._actor.data.data.details.type.value has the creature type
    //   target.document._actor.data.data.details.type.subtype has the creature subtype
    //
    // For PCs:
    //   target.document._actor.data.data.details.race has the race, free form
    //
    if (targeted.document._actor.data.type === "npc") isNPC = true;
    else isNPC = false;
    // log(`${targeted.name} is NPC? ${isNPC}`)
    if (isNPC) targetType = target.document._actor.data.data.details.type.value 
    else targetType = target.document._actor.data.data.details.race.toLowerCase()
    // log(`targetType`,targetType);

    isFaithless = false;
    for (let i = 0; i < faithlessTypes.length; i++) {
        if (targetType.search(faithlessTypes[i]) != -1) {
            isFaithless = true;
            break;
        }
    }
    log(`${targeted.name} is faithless?`, isFaithless);

    if (isFaithless) {
        let resist = ["Turn Resistance", "Turn Defiance"];
        let getResistance = target.actor.items.find(i => resist.includes(i.name));
        let immunity = ["Turn Immunity"];
        let getImmunity = target.actor.items.find(i => immunity.includes(i.name));
        let save = "";
        getResistance ? save = await target.actor.rollAbilitySave(saveType, { advantage: true, chatMessage: false, fastForward: true }) : save = await target.actor.rollAbilitySave(saveType, { chatMessage: false, fastForward: true });
        if (getImmunity) {
            turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} immune</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
        }
        else {
            /****************************************************************************************
            * A turned creature:
            * - Must spend its turns trying to move as far away from you as it can, and
            * - Can not willingly move to a space within 30 feet of you.
            * - Can not take reactions.
            * - Must use the Dash action or try to escape from an effect that prevents it from 
            *   moving. If it can not move, it uses the Dodge action.
            * - If true form is concealed by an illusion, shapeshifting, or other 
            *   effect, that form is revealed while it is turned.
            ***************************************************************************************/
            if (dc > save.total) {
                log(" -- Failed Save --", `Target name ${target.name}`, target, `save.total ${save.total}`, save);
                let gameRound = game.combat ? game.combat.round : 0;
                let effectData = {
                    label: EFFECT,
                    icon: TURNEDICON,
                    origin: args[0].uuid,
                    disabled: false,
                    duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
                    flags: { dae: { macroRepeat: "none", specialDuration: ["isDamaged"] } },
                    changes: [
                        { key: `flags.gm-notes.notes`, mode: CUSTOM, value: `Applied by ${activeToken.name}`, priority: 20 },
                    ]};
                let effect = target.actor.effects.find(ef => ef.data.label === game.i18n.localize(`${EFFECT}`));
                if (!effect) await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:target.actor.uuid, effects: [effectData] });
                turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} fails with ${save.total} [${EFFECT}]</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);

            } else {
                console.log(target.name, save.total, `Save`);
                turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} succeeds with ${save.total}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
            }
        }
    }
}
await wait(800);
let turn_list = turnTargets.join('');
let turn_results = `<div class="midi-qol-nobox midi-qol-bigger-text">${itemD.name} DC ${dc} ${CONFIG.DND5E.abilities[saveType]} Saving Throw:</div><div><div class="midi-qol-nobox">${turn_list}</div></div>`;
const chatMessage = await game.messages.get(args[0].itemCardId);
let content = await duplicate(chatMessage.data.content);
const searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${turn_results}`;
content = await content.replace(searchString, replaceString);
await chatMessage.update({ content: content });
await ui.chat.scrollBottom();


postResults(`Creatures that failed their saving throw are affected by the <b>${TURNED_JRNL}</b> condition.`)

log("---------------------------------------------------------------------------",
    "Finished", MACRONAME);
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

/****************************************************************************************
* Functrion is no longer used, keeping just-in-case
***************************************************************************************/
async function cr_lookup(level) {
    if ((level >= 5) && (level < 8)) { return 0.5; }
    if ((level >= 8) && (level < 11)) { return 1; }
    if ((level >= 11) && (level < 14)) { return 2; }
    if ((level >= 14) && (level < 17)) { return 3; }
    if ((level >= 17) && (level <= 20)) { return 4; }
}

/****************************************************************************************
* Return an array of the tokens that are within range of primeToken
***************************************************************************************/
function getInRangeTokens(primeToken, range) {
    let tokenSet = [];
    let placeables = canvas.tokens.placeables;
    log(`canvas.tokens.placeables`, canvas.tokens.placeables)

    for (let i = 0; i < placeables.length; i++) {
        let thisToken = placeables[i];
        let distance = canvas.grid.measureDistance(primeToken, thisToken).toFixed(1);
        if (distance > range || activeToken.name === thisToken.name) {
            log(` Droping ${thisToken.name} at ${distance} feet, from consideration`);
            if (toFarCount++) { toFar += ", "; };
            toFar += thisToken.name;
            // log(`  To Far #${toFarCount} ${token.name} is ${distance} feet. To Fars: ${toFar}`);
        } else {
            log(` Adding ${thisToken.name} at ${distance} feet, to inRangeTokens`);
            tokenSet.push(thisToken);
        }
    };
    return tokenSet;
}

/****************************************************************************************
 * Get spell range
 ***************************************************************************************/

function getSpellRange(itemD, allowedUnits) {
    const FUNCNAME = "getSpellRange(itemD, allowedUnits)";
    log("---------------------------------------------------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`);

    let range = itemD.data.range?.value;
    let unit = itemD.data.range.units;
    log("range", range, "unit", unit);
    range = range ? range : 30;

    if (allowedUnits.includes(unit)) {
        log("Units are ok");
        return (range);
    } else {
        log(`Unit ${unit} not in`, allowedUnits);
        ui.notifications.error(`Unit ${unit} not in allowed units`);
        return (0);
    }
}

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