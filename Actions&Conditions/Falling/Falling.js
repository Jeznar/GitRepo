const MACRONAME = "Falling.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * This macro is intended to be used from the hot bar.  It does the following major things:
 * - Check to make sure exactly one token is selected representing the falling actor
 * - Present a dialog asking for distance fallen and if it is into water or onto another creature
 * - If it is onto another creature, check to see if one is targeted.  If not post that requirement and try again
 * - 
 * 
 * 04/10/23 0.1 Falling
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const DAM_TYPE = "bludgeoning"
const SAVE_DC = 15
const ICON = 'Icons_JGB/Effects/Falling.png'
//-----------------------------------------------------------------------------------------------------------------------------------
// Do we have a selected token (one, only one)
//
if (canvas.tokens.controlled.length !== 1) {
    let msg = `Need to select exactly one token for <b>${MACRO}</b> to work`
    jez.postMessage(
        { color: jez.randomDarkColor(), fSize: 14, icon: 'Icons_JGB/Misc/Jez.png', title: 'Select Something, Peas', msg: msg }
    )
    return
}
let aToken = canvas.tokens.controlled[0]
//-----------------------------------------------------------------------------------------------------------------------------------
// Pop dialog to obtain fall distance
//
const INPUTS = await popDialog1({ traceLvl: TL })
if (INPUTS === null) jez.badNews('Macro canceled in dialog', 'i')
//-----------------------------------------------------------------------------------------------------------------------------------
// Parse the Distance field, nabbing the first integer and convert it to how many 10 feets were fallen
//
let distNumbers = INPUTS.distance.match(/\d+/);
if (distNumbers === null) return jez.badNews('Could not find a number in the distance field', 'w')
let tenFeets = Math.ceil((distNumbers[0]) / 10 + 0.1) /** 10*/ - 1;
//-----------------------------------------------------------------------------------------------------------------------------------
// If the fall is landing on another creature, then it needs to be targeted.
//
let tToken = null
if (INPUTS.creature) {
    do {
        if (game.user.targets.size === 1) {
            [tToken] = game.user.targets;   // Destructure the set, nabbing the first and only element as our target
        }
        else {
            // Pop a syncronous dialog to await user setting the target
            const myPromise = await new Promise((myResolve, myReject) => {  // Added to allow synchronicity
            /*let dialogueD =*/ new Dialog({
                title: 'Target Creature',
                content: `Please target the creature that is being fallen onto.  Click <b>Ok</b> when targeted.`,
                buttons: {
                    ok: {
                        icon: '<i class="fas fa-check"></i>',
                        label: 'Ok',
                        callback: async (html) => {
                            myResolve('Keep going')          // Added for synchronicity
                        }
                    },
                }
            }).render(true);
            })
        }
    }
    while (tToken === null)
}
//-----------------------------------------------------------------------------------------------------------------------------------
// Roll the damage dice
//
const DAMAGE_DICE = `${tenFeets>20?20:tenFeets}d6`  // Cap damage dice at 20
let dRoll = new Roll(`${DAMAGE_DICE}[DAM_TYPE]`).evaluate({ async: false })
//-----------------------------------------------------------------------------------------------------------------------------------
// If actor fell on a target, the damage needs to be split between them.
//
if (INPUTS.creature) {
    // If either the falling creature or target are tiny, skip the special handling
    let playerSize = Object.keys(CONFIG.DND5E.actorSizes).indexOf(aToken.actor.data.data.traits.size);
    let targetSize = Object.keys(CONFIG.DND5E.actorSizes).indexOf(tToken.actor.data.data.traits.size);
    if (playerSize === 0) {
        MidiQOL.applyTokenDamage([{ damage: dRoll.total, type: DAM_TYPE }], dRoll.total, new Set([aToken]), null, new Set());
        jez.badNews(`${aToken.name} is tiny and does no impact damage`, 'i')
    }
    else if (targetSize === 0) {
        MidiQOL.applyTokenDamage([{ damage: dRoll.total, type: DAM_TYPE }], dRoll.total, new Set([aToken]), null, new Set());
        jez.badNews(`${tToken.name} is tiny and avoids impact damage`, 'i')
    }
    else {
        save = (await tToken.actor.rollAbilitySave("dex", { flavor: null, chatMessage: true, fastforward: true }));
        if (save.total >= SAVE_DC) {    // Save was made
            MidiQOL.applyTokenDamage([{ damage: dRoll.total, type: DAM_TYPE }], dRoll.total, new Set([aToken]), null, new Set());
            msg = `${tToken.name} dodged the falling creature. ${aToken.name} takes ${dRoll.total} bludgeoning from its fall of 
            ${distNumbers[0]} feet.<br><br>If they take less/more damage from bludgeoning, this needs to be adjusted.`
            jez.postMessage(
                { color: jez.randomDarkColor(), fSize: 14, icon: ICON, title: 'Falling Damage', msg: msg }
            )
        }
        else {                          // Save failed
            MidiQOL.applyTokenDamage([{ damage: dRoll.total / 2, type: DAM_TYPE }], dRoll.total / 2, new Set([aToken, tToken]), null, new Set());
            msg = `${aToken.name} crashes into ${tToken.name} sharing the ${dRoll.total} bludgeoning damage from its fall of 
            ${distNumbers[0]} feet.<br><br>If they take less/more damage from bludgeoning, this needs to be adjusted.`
            jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: ICON, title: 'Falling Damage', msg: msg })
            // mark target creature prone if it took damage (fell 10 or more feet) && is not 2+ sizes larger
            if ((dRoll.total > 0) && (playerSize >= (targetSize - 2)))
                await jezcon.addCondition("Prone", tToken.actor.uuid, { allowDups: false, replaceEx: true, overlay: false, traceLvl: TL })
        }
    }
    await game.dice3d?.showForRoll(dRoll);
    // mark falling creature prone if it took damage (fell 10 or more feet)
    if (dRoll.total > 0)
        await jezcon.addCondition("Prone", aToken.actor.uuid, { allowDups: false, replaceEx: true, overlay: false, traceLvl: TL })
    return
}
//-----------------------------------------------------------------------------------------------------------------------------------
// If actor fell into liquid they get to attempt a save to reduce the damage.
//
if (INPUTS.water) {
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pop a simple dialog to determine if aToken want to use its reaction to attempt a save?
    const Q_TITLE = `Reaction to Attempt Proper Dive?`
    const Q_TEXT = ` Would ${aToken.name} use their reaction to attempt a dive into the liquid (reducing damage)?<br><br>
        Select Yes, if ${aToken.name} is using a reaction.<br><br>`
    const DIVE = await Dialog.confirm({ title: Q_TITLE, content: Q_TEXT, });
    if (DIVE) {
        //---------------------------------------------------------------------------------------------------------------------------
        // Pick actor's better roll (Acrobatics or Athletics)
        //
        let tSkill = "ath";
        if (aToken.actor.data.data.skills.acr.total >= aToken.actor.data.data.skills.ath.total) { tSkill = "acr" }
        const T_SKILL_NAME = tSkill == "ath" ? "atheletics" : "acrobatics"; // Set long form of TARGET_SKILL
        //---------------------------------------------------------------------------------------------------------------------------
        // Attempt the save
        //
        save = (await aToken.actor.rollAbilitySave(tSkill, { flavor: null, chatMessage: true, fastforward: true }));
        //---------------------------------------------------------------------------------------------------------------------------
        // Apply Damage, half on successful save
        //
        if (save.total >= SAVE_DC) {    // Save was made
            MidiQOL.applyTokenDamage([{ damage: dRoll.total / 2, type: DAM_TYPE }], dRoll.total / 2, new Set([aToken]), null, new Set());
            msg = `${aToken.name} reacts to the fall and successfully uses ${T_SKILL_NAME} to slice into the water head or feat first, 
            taking half damage, ${dRoll.total / 2} ${DAM_TYPE} damage from its fall of ${distNumbers[0]} feet.<br><br>
            If they take less/more damage from ${DAM_TYPE}, this needs to be adjusted.`
        }
        else {
            MidiQOL.applyTokenDamage([{ damage: dRoll.total, type: DAM_TYPE }], dRoll.total, new Set([aToken]), null, new Set());
            msg = `${aToken.name} reacts to the fall but fails to use ${T_SKILL_NAME} slamming into the unforgiving liquid, taking 
            full damage, ${dRoll.total} ${DAM_TYPE} damage from its fall of ${distNumbers[0]} feet.<br><br>
            If they take less/more damage from ${DAM_TYPE}, this needs to be adjusted.`
        }
    }
    else {
        MidiQOL.applyTokenDamage([{ damage: dRoll.total, type: DAM_TYPE }], dRoll.total, new Set([aToken]), null, new Set());
        msg = `${aToken.name} slams into the unforgiving liquid, taking full damage,
        ${dRoll.total} ${DAM_TYPE} damage from its fall of ${distNumbers[0]} feet.<br><br>If they take less/more damage from 
        ${DAM_TYPE}, this needs to be adjusted.`
    }
    jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: ICON, title: 'Falling Damage', msg: msg })
    await game.dice3d?.showForRoll(dRoll);
    return
}
//-----------------------------------------------------------------------------------------------------------------------------------
// Roll and apply full normal falling damage 1d6 per ten foot fallen
//
MidiQOL.applyTokenDamage([{ damage: dRoll.total, type: DAM_TYPE }], dRoll.total, new Set([aToken]), null, new Set());
msg = `${aToken.name} takes ${dRoll.total} bludgeoning from its fall of ${distNumbers[0]} feet.<br><br>If they take less/more damage 
from bludgeoning, this needs to be adjusted.`
jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: ICON, title: 'Falling Damage', msg: msg })
// mark falling creature prone if it took damage (fell 10 or more feet)
if (dRoll.total > 0)
    await jezcon.addCondition("Prone", aToken.actor.uuid, { allowDups: false, replaceEx: true, overlay: false, traceLvl: TL })
await game.dice3d?.showForRoll(dRoll);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function popDialog1(options = {}) {
    const FUNCNAME = "popDialog1(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    let dialogContent = `
                    <div>Enter the falling distance (feet) for ${aToken.name}.  Damage depends on how many 10 foot increments fallen 
                    up to a maximum of 200 feet.  Also, check appropriate special case box if applicable.<br><br><div>
                    <div>Distance: <input name="DISTANCE_INPUT" style="width:200px" autofocus></div>
                    <div><br></div>
                    <div><input name="CREATURE" type="checkbox"/> Falling onto a creature?</div>
                    <div><input name="WATER" type="checkbox"/> Falling into body of water (or liquid)?<br><br></div>
                    `;
    // let stayOpen = false;
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Pop the syncronous dialog
    //
    const myPromise = await new Promise((myResolve, myReject) => {  // Added to allow synchronicity
        let d = new Dialog({
            title: `${aToken.name} Falling...`,
            content: dialogContent,
            buttons: {
                done: {
                    label: "Fall!",
                    callback: async (html) => {
                        const RETURN_VAL = {
                            distance: html.find("[name=DISTANCE_INPUT]")[0].value,
                            water: html.find("[name=WATER]")[0].checked,
                            creature: html.find("[name=CREATURE]")[0].checked
                        }
                        myResolve(RETURN_VAL)          // Added for synchronicity
                    }
                },
                show: {
                    label: "Cancel",
                    callback: async (html) => {
                        myResolve(null)      // Added for synchronicity
                    }
                }
            },
            default: "done",
        },
            {
                left: 100,
                top: 100
            }).render(true);
    })
    return (myPromise);                                 // changed for synchronicity
}