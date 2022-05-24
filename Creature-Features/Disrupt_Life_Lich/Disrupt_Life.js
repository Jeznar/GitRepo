const MACRONAME = "Disrupt_Life.0.1.js"
/*****************************************************************************************
 * Implment Lich's Dirsupt Life
 * 
 *   Each non-undead creature within 20 feet of the lich must make a DC 18 CON Save 
 *   against this magic, taking 21 (6d6) necrotic damage on a failed save, or half as 
 *   much damage on a successful one.
 * 
 * SAVE DC is calculated as 8 + Proficiency Mod + Con Mod
 * 
 * 05/23/22 0.1 Creation of Macro from Wail.js
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim off the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
const ALLOWED_UNITS = ["", "ft", "any"];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
const DAMAGE_TYPE = "necrotic"
const DAMAGE_DICE = "6d6"
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Template/Circle/Vortex_01_Regular_Blue_600x600.webm"
const VFX_INTRO = "modules/jb2a_patreon/Library/Generic/Template/Circle/VortexIntro_01_Regular_Blue_600x600.webm"
const VFX_OUTRO = "modules/jb2a_patreon/Library/Generic/Template/Circle/VortexOutro_01_Regular_Blue_600x600.webm"
const VFX_OPACITY = 0.8;
const VFX_SCALE = 1.95;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let isNPC = false;
    let targetType = null;
    let tokensToSave = []
    const SAVE_TYPE = "con"
    //const SAVE_DC = aActor.data.data.attributes.spelldc;
    const CON_MOD = jez.getStatMod(aToken,"con")
    const PROF_MOD = jez.getProfMod(aToken)
    const SAVE_DC = 8 + PROF_MOD + CON_MOD;
    const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to resisit <b>${aItem.name}</b>`;
    let failSaves = []  // Array to contain the tokens that failed their saving throws
    let madeSaves = []  // Array to contain the tokens that made their saving throws
    let madeNames = ""
    let failNames = ""
    let immuneNames = ""
    let damTaken = ""
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //---------------------------------------------------------------------------------------------
    // Fetch the spell effect range
    //
    let RANGE = aItem.data.range?.value ? aItem.data.range?.value : 20
    let UNITS = aItem.data.range.units;
    jez.log(`range ${RANGE}, units ${UNITS}`);
    if (ALLOWED_UNITS.includes(UNITS)) {
        jez.log("Units are ok");
    } else {
        jez.log(`Unit ${UNITS} not in`, ALLOWED_UNITS);
        ui.notifications.error(`Unit ${UNITS} not in allowed units`);
        return (false);
    }
    //---------------------------------------------------------------------------------------------
    // Startup ye'ole VFX
    //
    runVFX();
    //---------------------------------------------------------------------------------------------
    // Proceed to doing actual things
    //
    let tTokens = await jez.tokensInRange(aToken, RANGE)
    let tTokenCnt = tTokens?.length
    jez.log(`${tTokenCnt} Token(s) found within ${RANGE} feet`, tTokens)
    for (let i = 0; i < tTokenCnt; i++) {
        //-----------------------------------------------------------------------------------------
        // Check to see if target is undead and thus immune
        //
        if (tTokens[i].document._actor.data.type === "npc") isNPC = true; else isNPC = false;
        if (isNPC) targetType = tTokens[i].document._actor.data.data.details.type.value
        else targetType = tTokens[i].document._actor.data.data.details.race.toLowerCase()
        if (targetType.includes("undead")) {
            jez.log(`${tTokens[i].name} is undead`)
            immuneNames += `<b>${tTokens[i].name}</b> (Undead)<br>`
            continue
        }
        //---------------------------------------------------------------------------------------------
        // Proceed with the tokens that might be affected (need to roll saves)
        //
        tokensToSave.push(tTokens[i])
        let save = (await tTokens[i].actor.rollAbilitySave(SAVE_TYPE, { FLAVOR, chatMessage: false, fastforward: true }));
        if (save.total < SAVE_DC) {
            jez.log(`${tTokens[i].name} failed: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            failSaves.push(tTokens[i])
            failNames += `<b>${tTokens[i].name}</b>: ${save.total} (${save._formula})<br>`
        } else {
            jez.log(`${tTokens[i].name} saved: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            madeSaves.push(tTokens[i])
            madeNames += `<b>${tTokens[i].name}</b>: ${save.total} (${save._formula})<br>`
        }
    }
    //---------------------------------------------------------------------------------------------
    // If no tokens need to roll saves, we're done, get on out of here.
    //
    if (tokensToSave.length < 1) {
        msg = `There are no targets that need to save against ${aToken.name}'s ${aItem.name}`
        jez.log(`msg`)
        let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
        await jez.addMessage(chatMessage, { color: "purple", fSize: 15, msg: msg, tag: "saves" })
        return;
    }
    //---------------------------------------------------------------------------------------------
    // Roll the damage that can be done to the targets
    //
    let damageRoll = new Roll(`${DAMAGE_DICE}`).evaluate({ async: false });
    //game.dice3d?.showForRoll(damageRoll);
    //---------------------------------------------------------------------------------------------
    // Process Tokens that Failed Saves. Apply the prescribed damage.
    //
    jez.log(`${failSaves.length} Tokens failed saves, need apply full damage from that roll`)
    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total,
        DAMAGE_TYPE, failSaves, damageRoll, { itemCardId: null, useOther: true });
    //-----------------------------------------------------------------------------------------------
    // Create a fake synthetic roll, fudged to come up with half the damage for when target saves
    //
    let damageRollSaved = new Roll(`${Math.floor(damageRoll.total / 2)}`).evaluate({ async: false });
    //-----------------------------------------------------------------------------------------------
    // Apply damage to those that saved
    //
    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRollSaved.total,
        DAMAGE_TYPE, madeSaves, damageRollSaved, { itemCardId: null, useOther: false });
    //---------------------------------------------------------------------------------------------
    // Craft results message and post it.
    //
    let chatMessage = await game.messages.get(args[args.length - 1].itemCardId);
    await jez.wait(100)
    if (immuneNames) {
        msg = `<b><u>Immune</u></b><br>${immuneNames}`
        await jez.wait(100)
        // https://www.w3schools.com/tags/ref_colornames.asp
        jez.addMessage(chatMessage, { color: "purple", fSize: 14, msg: msg, tag: "damage" })
    }
    if (madeNames) {
        msg = `<b><u>Successful ${SAVE_TYPE.toUpperCase()} Save</u></b> vs DC${SAVE_DC}, taking 
        ${damageRollSaved.total} ${DAMAGE_TYPE} damage.<br> ${madeNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkgreen", fSize: 14, msg: msg, tag: "damage" })
    }
    if (failNames) {
        msg = `<b><u>Failed ${SAVE_TYPE.toUpperCase()} Save</u></b> vs DC${SAVE_DC}, taking 
        ${damageRoll.total} ${DAMAGE_TYPE} damage.<br>${failNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkred", fSize: 14, msg: msg, tag: "damage" })
    }
    await jez.wait(100)
    msg = `Total of ${tTokenCnt} target(s) within ${RANGE}ft of ${aToken.name}<br>`
    jez.addMessage(chatMessage, { color: "darkblue", fSize: 14, msg: msg, tag: "damage" })
    if (damTaken) {
        await jez.wait(100)
        msg = "<b><u>Damage taken by individual</b></u><br>" + damTaken
        jez.addMessage(chatMessage, { color: "darkbrown", fSize: 14, msg: msg, tag: "saves" })
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
async function runVFX() {
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
        .opacity(VFX_OPACITY)
        .duration(3000)
        .name(VFX_NAME) // Give the effect a uniqueish name
        .fadeIn(10) // Fade in for specified time in milliseconds
        .fadeOut(1000) // Fade out for specified time in milliseconds
        .extraEndDuration(1200) // Time padding on exit to connect to Outro effect
        .effect()
        .file(VFX_OUTRO)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .attachTo(aToken)
        .play();
}