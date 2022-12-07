const MACRONAME = "Ensnaring_Strike_0.5.js"
/*******************************************************************************************
 * Implement Ensnaring Strike
 * 
 * Description: The next time you hit a creature with a weapon attack before this spell 
 *   ends, a writhing mass of thorny vines appears at the point of impact, and the target 
 *   must succeed on a Strength saving throw or be restrained by the magical vines until 
 *   the spell ends. A Large or larger creature has advantage on this saving throw. If the 
 *   target succeeds on the save, the vines shrivel away. 
 * 
 *   While restrained by this spell, the target takes 1d6 piercing damage at the start 
 *   of each of its turns. A creature restrained by the vines or one that can touch the 
 *   creature can use its action to make a Strength check against your spell save DC. 
 *   On a success, the target is freed. 
 * 
 *   At Higher Levels. If you cast this spell using a spell slot of 2nd level or higher, 
 *   the damage increases by 1d6 for each slot level above 1st.
 * 
 * The following steps need to be accomplished:
 * 1. OnUse - add buff to the caster to transfer to the next creature hit with a weap attack.
 *    Modeling this on Searing_Smite.0.1
 *
 * 
 * This will need an OnUse and a Each execution.
 * 
 * 12/27/21 0.1 JGB Creation
 * 12/28/21 0.2 JGB Continued Development
 * 12/28/21 0.3 JGB Add dialog to make skill check to escape an option
 * 07/29/22 0.4 JGB Add convenientDescription, fixed bug from Midi change, paired effect
 * 12/06/22 0.5 JGB Problem discovered: Error: User Joe M. lacks permission to update Token 
 *******************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
// const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;

const DEBUFF_NAME = "Restrained" // aItem.name || "Nature's Wraith";
const DEBUFF_ICON = "modules/combat-utility-belt/icons/restrained.svg"
const SAVE_TYPE = "str"
const JOURNAL_RESTRAINED = "<b>@JournalEntry[CZWEqV2uG9aDWJnD]{restrained}</b>"
log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME} or ${MACRO}`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

let gameRound = game.combat ? game.combat.round : 0;

//---------------------------------------------------------------------------------------
// Set some global variables and constants
//
let msg = "";
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro

//---------------------------------------------------------------------------------------
// Define some additional handy global variables that I need often.  Not all will be used
// in this macro, but I want them here for future use/reference.
//
// See https://gitlab.com/tposney/dae#lastarg for info on what is included in lastArg
//
const lastArg = args[args.length - 1];
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
let spellLevel = lastArg?.spellLevel;

log("------- Obtained Global Values -------",
    `Active Token (aToken) ${aToken.name}`, aToken,
    `Active Actor (aActor) ${aActor.name}`, aActor,
    `Active Item (aItem) ${aItem.name}`, aItem,
    "spellLevel", spellLevel);

//-------------------------------------------------------------------------------
// Depending on where invoked call appropriate function to do the work
//
if (args[0]?.tag === "OnUse") await doOnUse();      // Midi ItemMacro On Use
if (args[0] === "on") await doOn();          		        // DAE Application
if (args[0] === "each") await doEach();					    // DAE removal
if (args[0]?.tag === "DamageBonus") await doBonusDamage();    // DAE Damage Bonus

log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
return;

/***************************************************************************************
*    END_OF_MAIN_MACRO_BODY
*                                END_OF_MAIN_MACRO_BODY
*                                                             END_OF_MAIN_MACRO_BODY
***************************************************************************************/
/**************************************************************************************
* Execute code for a ItemMacro onUse
***************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let saveDC = aToken.actor.data.data.attributes.spelldc;
    log("---------------------------------------------------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "saveDC", saveDC);

    let effectData = [{
        changes: [
            { key: "flags.dnd5e.DamageBonusMacro", mode: jez.CUSTOM, value: `ItemMacro.${aItem.name}`, priority: 20 },
            { key: "flags.midi-qol.spellLevel", mode: jez.OVERRIDE, value: `${spellLevel}`, priority: 20 },
            { key: "flags.midi-qol.spellId", mode: jez.OVERRIDE, value: `${lastArg.uuid}`, priority: 20 },
        ],
        origin: lastArg.uuid,
        disabled: false,
        duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
        flags: { 
            dae: { itemData: aItem, specialDuration: ["DamageDealt"] },
            convenientDescription: `Next weapon attack forces DC${saveDC} STR Save or be Restrained and take DoT`
         },
        icon: aItem.img,
        label: aItem.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: effectData });

    //---------------------------------------------------------------------------------------
    // Thats all folks
    //
    msg = `<p style="color:blue;font-size:14px;">
        <b>${aToken.name}</b> will attemt to apply ${JOURNAL_RESTRAINED} on next hit.  
        Target may make a <b>DC${saveDC}</b> ${CONFIG.DND5E.abilities[SAVE_TYPE]} save to avoid.
        </p>`
    postResults(msg);
    log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Execute code for a DAE Macro application (on) 
 ***************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    let saveDC = args[1];
    log("--------------On----------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        `aActor ${aActor.name}`, aActor,
        `aToken ${aToken.name}`, aToken,
        `saveDC`, saveDC);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    //---------------------------------------------------------------------------------------
    // If the target is large or larger, it should have advantage on its save
    //
    let targetSize = getSizeInfo(aToken);
    let adv = false;
    let flavor = `<b>${aToken.name}</b> attempts a 
    ${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${saveDC}</b> save to avoid <b>${DEBUFF_NAME}</b>
    effect from ensnaring strike.`;
    log(`${aToken.name} is ${targetSize.nameStr} with a value of ${targetSize.value}`)
    if (targetSize.value > 3) {
        adv = true
        flavor += `<br><br>Roll is made with <b>advantage</b> as ${aToken.name} is <b>${targetSize.nameStr}</b>`;
    }
    log(`*** Make save with advantage? ${adv}`, flavor);
    //---------------------------------------------------------------------------------------
    // Have the target roll its saving throw
    //
    let save = null
    if (adv) save = (await aActor.rollAbilitySave(SAVE_TYPE, { flavor: flavor, advantage: "true", chatMessage: true, fastforward: true })).total;
    else save = (await aActor.rollAbilitySave(SAVE_TYPE, { flavor: flavor, chatMessage: true, fastforward: true })).total;
    log("Result of save roll", save);
    if (save >= saveDC) {
        log(`save was made with a ${save}`);
        postResults(`save was made`);
        // remove the effect.
    } else log(`save failed with a ${save}`);
    //---------------------------------------------------------------------------------------
    // If the target made the save remove the recently aplied effect
    //
    if (save >= saveDC) {
        msg = `${aToken.name} made its save.  Rolling ${save} vs ${saveDC} DC.`;
        log(msg)
        await wait(500)   // This pause allows the debuff to be placed by DAE before removal
        log("After a brief pause, tToken.data", aToken.data)
        //----------------------------------------------------------------------------------
        // Check for debuff matching DEBUFF_NAME.  If it exists, remove it.
        //
        log(" aToken.data.effects", aToken.data.actorData.effects)
        let existingEffect = aActor.effects.find(ef => ef.data.label === DEBUFF_NAME) ?? null;

        if (existingEffect) {
            msg = `${aToken.name} has ${DEBUFF_NAME} effect: `;
            log(msg, existingEffect);
            await existingEffect.delete();
        } else {
            msg = `${aToken.name} lacked ${DEBUFF_NAME} effect.`;
            log(msg);
        }
    }
    else {
        msg = `${aToken.name} failed its save.  Rolling ${save} vs DC${saveDC}.`;
        log(msg);
    }

    log("--------------On----------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Execute code for a DAE Macro application (on) - nothing other than place holding
 ***************************************************************************************/
async function doEach() {
    const FUNCNAME = "doEach()";
    let saveDC = args[1];
    log("--------------doEach---------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        `aActor ${aActor.name}`, aActor,
        `aToken ${aToken.name}`, aToken,
        `saveDC`, saveDC);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    //---------------------------------------------------------------------------------------
    // Have the target roll a strength check (rollAbilityTest)
    // 
    const dialogTitle = "Make a choice of how to use your action"
    const dialogText = `The nasty vines are keeping <b>${aToken.name}</b> restrained.  
        Would you like to use your action this round to attempt to break the vines 
        (<b>DC${saveDC} Strength</b> check), or simply ignore them and do something else 
        with your action?<br><br>`
    const buttonOne = "Break Vines"
    const buttonTwo = "Ignore Vines"
    await popSimpleDialog(dialogTitle, dialogText, doEachCallBack, buttonOne, buttonTwo)

    // do any clean up
    log("--------------doEach---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Create and process selection dialog, passing it onto specified callback function
 ***************************************************************************************/
async function popSimpleDialog(dialogTitle, dialogText, callBackFunc, buttonOne, buttonTwo) {
    const FUNCNAME = "popSimpleDialog(dialogTitle, dialogText, callBackFunc, buttonOne, buttonTwo)";
    log("---------------------------------------------------------------------------",
        `Starting`, `${MACRONAME} ${FUNCNAME}`,
        `dialogTitle`, dialogTitle,
        `dialogText`, dialogText,
        `buttonOne`, buttonOne,
        `buttonTwo`, buttonTwo);

    if (!dialogTitle || !dialogText || !buttonOne || !buttonTwo) {
        let msg = `pickFromList arguments should be (dialogTitle, dialogText, callBackFunc, buttonOne, buttonTwo),
                   but yours are: ${dialogTitle}, ${dialogText}, ${callBackFunc}, ${buttonOne}, ${buttonTwo}`;
        ui.notifications.error(msg);
        log(msg);
        return
    }

    new Dialog({
        title: dialogTitle,
        content: dialogText,
        buttons: {
            button1: {
                icon: '<i class="fas fa-check"></i>',
                label: buttonOne,
                callback: async () => {
                    log(`selected button 1: ${buttonOne}`)
                    callBackFunc(true) 
                },
            },
            button2: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Ignore Vines',
                callback: async () => {
                    log('canceled')
                    callBackFunc(false)
                },
            },
        },
        default: 'button2'
    }).render(true)

    log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
 * Callback to be executed when user chooses to attempt a skill test to get out of vines
 ***************************************************************************************/
async function doEachCallBack(doCheck) {
    const FUNCNAME = "doEachCallBack(doCheck)";
    log("---------------------------------------------------------------------------",
        `Starting`, `${MACRONAME} ${FUNCNAME}`,
        `doCheck`, doCheck);

    if (doCheck) { // Actor is attempting to break the vines
        let saveDC = args[1];

        let flavor = `${aToken.name} uses this turn's <b>action</b> to attempt a 
        ${CONFIG.DND5E.abilities[SAVE_TYPE]} check vs <b>DC${saveDC}</b> to end the 
        <b>${DEBUFF_NAME}</b> effect from ensnaring strike.`;
        let check = (await aActor.rollAbilityTest(SAVE_TYPE, {
            flavor: flavor,
            chatMessage: true,
            fastforward: true
        })).total;
        log("Result of check roll", check);
        //---------------------------------------------------------------------------------------
        // If the target made the save remove the effect
        //
        if (check >= saveDC) {
            msg = `${aToken.name} made its check.  Rolling ${check} vs ${saveDC} DC.`;
            log(msg);
            //----------------------------------------------------------------------------------
            // Check for debuff matching DEBUFF_NAME.  If it exists, remove it.
            //
            log(" aToken.data.effects", aToken.data.actorData.effects);
            let existingEffect = aActor.effects.find(ef => ef.data.label === DEBUFF_NAME) ?? null;

            if (existingEffect) {
                msg = `${aToken.name} has ${DEBUFF_NAME} effect: `;
                log(msg, existingEffect);
                await existingEffect.delete();
            } else {
                msg = `${aToken.name} lacked ${DEBUFF_NAME} effect.`;
                log(msg);
            }
        }
        else {
            msg = `${aToken.name} failed its check.  Rolling ${check} vs DC${saveDC}.`;
            log(msg);
        }
    }
    else { // Actor is ignoring the vines
        msg = "Ignoring the vines"
        log(msg)
    }
    log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
}
/****************************************************************************************
 * Execute code for a DAE Macro dobonusdamage
 ***************************************************************************************/
async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    log("--------------doBonusDamage---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);
    // do any clean up

    if (!oneTarget()) return;

    if (!["mwak"].includes(lastArg.item.data.actionType)) return {};
    let target = canvas.tokens.get(lastArg.hitTargets[0].id);
    log("target",target)
    let spellLevel = getProperty(lastArg.actor.flags, "midi-qol.spellLevel");
    log("spellLevel",spellLevel)
    let saveDC = aToken.actor.data.data.attributes.spelldc;
    log("saveDC",saveDC)
    let spellUuid = getProperty(lastArg.actor.flags, "midi-qol.spellId");
    log("spellUuid",spellUuid)
    let spellItem = await fromUuid(getProperty(lastArg.actor.flags, "midi-qol.spellId"));
    log("spellItem",spellItem)
    let damageType = "piercing";
    log("damageType",damageType)
    //---------------------------------------------------------------------------------------
    // Apply the debuff to the target
    //
    let value = `turn=start,label="Ensnaring Strike",damageRoll=${spellLevel}d6,damageType=${damageType}`
    let effectData = [{
        changes: [
            { key: `flags.midi-qol.OverTime`, mode: jez.OVERRIDE, value: value, priority: 20 },
            { key: "data.attributes.movement.walk", mode: jez.OVERRIDE, value: 1, priority: 20 },
            { key: "macro.itemMacro", mode: jez.CUSTOM, value: saveDC, priority: 20 },
            { key: "macro.CE", mode: jez.CUSTOM, value: "Restrained", priority: 20 },
        ],
        origin: spellUuid,
        flags: { 
            dae: { itemData: spellItem.data, macroRepeat: "startEveryTurn", token: target.uuid },
            convenientDescription: `${DEBUFF_NAME} and taking Damage over Time`        
        },
        disabled: false,
        duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
        icon: spellItem.img,
        label: spellItem.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: effectData });
    // Bug Fix?  Crymic had the following line execute to remove concentration, which I think is an incorrect 
    // interpretation of the spell.  Dropping concentration should end the DoT.  Keeping this line in case I want
    // to revert my change to Crymic's code.
    //
    // await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: aToken.actor.uuid, effects: [CONC.id] });
    await jez.wait(100)
    log(`jez.pairEffects(aActor, "Concentrating", target.actor, ${spellItem.name})`)
    jez.pairEffectsAsGM(aActor, "Concentrating", target.actor, spellItem.name) // --> Permission problem for players
    log("--------------doBonusDamage---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return {
        damageRoll: `${spellLevel}d6[${damageType}]`,
        flavor: `(Ensnaring Strike (${CONFIG.DND5E.damageTypes[damageType]}))`
    };
}

/****************************************************************************************
 * Fetch and return the save type and target number
 ***************************************************************************************/
function getSaveInfo(tToken) {
    let saveDC = args[1];
    let tarDexSaveMod = tToken.document._actor.data.data.abilities.dex.save;
    let tarStrSaveMod = tToken.document._actor.data.data.abilities.str.save;

    //---------------------------------------------------------------------------------------
    // Determine target's prefered stat for the save, and make save roll
    //
    let saveType = "";
    if (tarDexSaveMod > tarStrSaveMod) {
        log(`saveDC ${saveDC} - ${tToken.name} prefers Dex save, with a ${tarDexSaveMod} mod vs ${tarStrSaveMod}`);
        saveType = "dex";
    } else {
        log(`saveDC ${saveDC} - ${tToken.name} prefers Str save, with a ${tarStrSaveMod} mod vs ${tarDexSaveMod}`);
        saveType = "str";
    }
    return { saveType, saveDC };
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
    log(` chatmsg: `, chatmsg);
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    // log("============================ content before", content)
    content = await content.replace(searchString, replaceString);
    // log("============================ content after", content)
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

/****************************************************************************************
 * Tricksy little sleep implementation
 ***************************************************************************************/
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

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
                case "tiny": this.value = 1;
                    this.namestr = "tiny";
                    this.nameStr = "Tiny";
                    break;
                case "sm": this.value = 2;
                    this.nameStr = "small";
                    this.nameStr = "Small";
                    break;
                case "med": this.value = 3;
                    this.namestr = "medium";
                    this.nameStr = "Medium";
                    break;
                case "lg": this.value = 4;
                    this.nameStr = "large";
                    this.nameStr = "Large";
                    break;
                case "huge": this.value = 5;
                    this.nameStr = "huge";
                    this.nameStr = "Huge";
                    break;
                case "grg": this.value = 6;
                    this.nameStr = "gargantuan";
                    this.nameStr = "Gargantuan";
                    break;
                default: this.value = 0;  // Error Condition
                    this.nameStr = "unknown";
                    this.nameStr = "Unknown";
            }
        }
    }
    let token5ESizeStr = token5E.document?._actor.data.data.traits.size
        ? token5E.document?._actor.data.data.traits.size
        : token5E._actor.data.data.traits.size
    let token5ESizeInfo = new CreatureSizeInfos(token5ESizeStr);
    if (!token5ESizeInfo.value) {
        let message = `Size of ${token5E.name}, ${token5ESizeStr} failed to parse. End ${MACRONAME}<br>`;
        log(message);
        ui.notifications.error(message);
    }
    return (token5ESizeInfo);
}
