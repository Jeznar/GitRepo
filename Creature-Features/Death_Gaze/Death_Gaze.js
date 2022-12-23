const MACRONAME = "Death_Gaze.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * 
 * 1. Generate a list of tokens that are with 30 feet that can see the the source token
 * 2. Pop message reminding of the option to be voluntarily blinded with option to bail out
 * 3. Roll saves for each affected, keeping track of failures and superFailures
 * 4. Inflict damage to failures
 * 5. Inflict damage to superfailures
 * 
 * 11/05/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor;
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const SAVE_DC = aActor.data.data.attributes.spelldc;
const SAVE_TYPE = "con"
const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to partially resisit 
                    <b>${aItem.name}</b>`;
const DAMAGE_TYPE = "psychic";
const DAMAGE_DICE = `3d10`;
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //----------------------------------------------------------------------------------
    // Get the range from the item card
    //
    const ALLOWED_UNITS = ["", "ft", "any"];
    const MAX_RANGE = jez.getRange(aItem, ALLOWED_UNITS)
    let chatMessage = await game.messages.get(args[args.length - 1].itemCardId);
    //----------------------------------------------------------------------------------
    // Build a list of in-range targets that can see the source token
    //
    let rangeOpts = {
        exclude: "self",    // self, friendly, or none (self is default)
        direction: "t2o",       // t2o or o2t (Origin to Target) (t2o is default) 
        chkSight: true,         // Boolean (false is default)
        chkBlind: true,         // Boolean (false is default)
        traceLvl: TL,           // Trace level, integer typically 0 to 5
    }
    let targets = await jez.inRangeTargets(aToken, MAX_RANGE, rangeOpts);
    if (targets.length === 0) return jez.badNews(`No effectable targets in range`, "i")
    if (TL > 1) for (let i = 0; i < targets.length; i++) jez.trace(`${FNAME} | Targeting: ${targets[i].name}`)
    //------------------------------------------------------------------------------------------
    // Prepare for and pop a simple dialog asking if preconditions were met
    //
    const Q_TITLE = `Proceed with Death Gaze?`
    let qText = `Death Gaze allows actors to avert their eyes (become blinded) to avoid this 
    effect.  This dialog allows the effect to be cancelled if any of the following want to
    be voluntarily become blinded for this round, click "No"; otherwise "Yes" to continue.<br><br>`
    for (let i = 0; i < targets.length; i++) qText += `- ${targets[i].name}<br>`
    qText += `<br>`
    let confirmation = await Dialog.confirm({ title: Q_TITLE, content: qText, });
    if (!confirmation) {
        if (TL > 3) jez.trace(`${TAG} Dialog choice was no.`)
        msg = `Effect cancelled, so that Blinded condition can be applied or other adjustments made.`
        postResults(msg)
        return jez.badNews(`Effect canceled, so that Blinded can be applied.`, "i")
    }
    //------------------------------------------------------------------------------------------
    // Roll saving throws, keep track of saves made, fail, superFail
    //
    let failSaves = []  // Array to contain the tokens that failed their saving throws
    let madeSaves = []  // Array to contain the tokens that made their saving throws
    let superFailSaves = []
    let madeNames = ""
    let failNames = ""
    let superFailNames = ""
    if (TL > 1) jez.trace(`${TAG} ${targets.length} affectable tokens`)
    for (let i = 0; i < targets.length; i++) {
        let tToken = targets[i];
        let tActor = tToken?.actor;
        let save = (await tActor.rollAbilitySave(SAVE_TYPE,
            { FLAVOR, chatMessage: false, fastforward: true }));
        console.log(`==> save.total ${save.total} SAVE_DC, ${SAVE_DC}, ${SAVE_DC - save.total}`)
        if (save.total < SAVE_DC && save.total + 5 >= SAVE_DC) {
            failSaves.push(tToken)
            failNames += `<b>${tToken.name}</b>, ${save.total} (${save._formula})<br>`
            runVFX("fail", tToken)
        } else
            if (save.total + 5 < SAVE_DC) {
                const COND_IMMUNITIES = tActor.data.data.traits.ci.value
                if (COND_IMMUNITIES.includes('frightened')) {
                    if (TL > 1) jez.trace(`${TAG} ==> ${tToken.name} is immune to frightened!!!`)
                    failSaves.push(tToken)
                    failNames += `<b>${tToken.name}</b>, ${save.total} (${save._formula})<br>`
                    runVFX("fail", tToken)
                } else {
                    superFailSaves.push(tToken)
                    superFailNames += `<b>${tToken.name}</b>, ${save.total} (${save._formula})<br>`
                    runVFX("superFail", tToken)
                }
            } else
                if (save.total >= SAVE_DC) {
                    madeNames += `<b>${tToken.name}</b>, ${save.total} (${save._formula})<br>`
                    madeSaves.push(tToken)
                }
        await jez.wait(500) // Add a bit of dramatic pause
    }
    if (TL > 1) jez.trace(`${TAG} Results`, "Made Saves", madeSaves, "Failed Saves",
        failSaves, "Super Failures", superFailSaves)
    //----------------------------------------------------------------------------------
    // Roll the damage Dice
    //
    let damageRoll = new Roll(`${DAMAGE_DICE}`).evaluate({ async: false });
    if (TL > 1) jez.trace(`${TAG} Damage Rolled ${damageRoll.total}`, damageRoll)
    game.dice3d?.showForRoll(damageRoll);
    //----------------------------------------------------------------------------------
    // Apply damage to those that failed saving throws
    //
    if (TL > 2) jez.trace(`${TAG} Applying damage to failed saves`)
    new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll, DAMAGE_TYPE, [], damageRoll,
        { flavor: `Damage from ${aItem.name}`, itemCardId: args[0].itemCardId });
    MidiQOL.applyTokenDamage([{ damage: damageRoll.total, type: DAMAGE_TYPE }],
        damageRoll.total, new Set(failSaves), aItem, new Set());
    //----------------------------------------------------------------------------------
    // Apply huge damage to those that super failed saving throws
    //
    if (TL > 2) jez.trace(`${TAG} Applying huge damage to super failed saves`)
    new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll, DAMAGE_TYPE, [], damageRoll,
        { flavor: `Damage from ${aItem.name}`, itemCardId: args[0].itemCardId });
    MidiQOL.applyTokenDamage([{ damage: 1000, type: DAMAGE_TYPE }],
        10000, new Set(superFailSaves), aItem, new Set());
    //----------------------------------------------------------------------------------
    // Add results to chat card
    //
    await jez.wait(100)
    let msg1 = "";
    if (madeNames) {
        msg1 = `<b><u>Successful Save</u></b><br>${madeNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkgreen", fSize: 14, msg: msg1, tag: "saves" })
    }
    if (failNames) {
        msg1 = `<b><u>Failed Save</u></b><br>${failNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkred", fSize: 14, msg: msg1, tag: "saves" })
    }
    if (superFailNames) {
        msg1 = `<b><u>Utterly Failed Save</u></b><br>${superFailNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "purple", fSize: 14, msg: msg1, tag: "saves" })
    }
    await jez.wait(100)
    msg = `Total of ${targets.length} target(s), rolling ${SAVE_TYPE.toUpperCase()} save vs DC ${SAVE_DC}.<br>`
    jez.addMessage(chatMessage, { color: "darkblue", fSize: 14, msg: msg, tag: "saves" })

    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/***************************************************************************************************
 * Play the VFX for the fire effect, type is "heal" or "fire" and nothing else
 ***************************************************************************************************/
async function runVFX(type, token5e) {
    let vfxEffect = ""
    switch (type) {
        case "fail": vfxEffect = "jb2a.markers.02.dark_bluewhite"; break
        case "superFail": vfxEffect = "jb2a.divine_smite.target.dark_purple"; break
        default: return
    }
    new Sequence()
        .effect()
        .file(vfxEffect)
        .atLocation(token5e)
        .scaleToObject(1.0)
        // .scale(0.5)
        .opacity(1)
        .play();
}

