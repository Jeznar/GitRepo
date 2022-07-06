const MACRONAME = "Constrict.0.3.js"
/*****************************************************************************************
 * Vine Blight's Constrict Attack
 * 
 *  Melee Weapon Attack: +4, Reach 10 ft., one target. Hit: 9 (2d6 + 2) bludgeoning damage, 
 *  and a Large or smaller target is grappled, escape DC 12. Until this grapple ends, the 
 *  target is restrained, and the blight can’t constrict another target.
 * 
 * An interesting element of this macro is that it teaches the effects to know about their
 * partner and remove it when either partner is removed.
 * 
 * 02/11/22 0.1 Creation of Macro
 * 05/03/22 0.2 JGB Updated for FoundryVTT 9.x
 * 07/05/22 0.3 JGB Changed to use CE 
 ******************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
jez.log("aItem", aItem)
let msg = "";
let errorMsg = "";
const GRAPPLED_ICON = "Icons_JGB/Conditions/grappling.svg"
const GRAPPLING_ICON = "Icons_JGB/Conditions/grappling.png"
const GRAPPLED_COND = "Grappled"
const GRAPPLING_COND = "Grappling"
const RESTRAINED_COND = "Restrained"
const LARGE_VALUE = 4
// COOL-THING: Journal entries looked up by name and formatted as links for chat cards
const GRAPPLED_JRNL = `@JournalEntry[${game.journal.getName(GRAPPLED_COND).id}]{Grappled}`
const GRAPPLING_JRNL = `@JournalEntry[${game.journal.getName(GRAPPLING_COND).id}]{Grappling}`
const RESTRAINED_JRNL = `@JournalEntry[${game.journal.getName(RESTRAINED_COND).id}]{Restrained}`
const GAME_RND = game.combat ? game.combat.round : 0;
const VFX_LOOP = "modules/jb2a_patreon/Library/1st_Level/Entangle/Entangle_01_Regular_Green02_400x400.webm"
const VFX_NAME = `${MACRO}`
const VFX_OPACITY = 1.0;
const VFX_SCALE = 0.4;
// const SAVE_TYPE = "wis"
// const SAVE_DC = aActor.data.data.attributes.spelldc;
// const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to avoid <b>${aToken.name}'s ${aItem.name}</b>`;

//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (args[0]?.tag === "OnUse" && !preCheck()) return
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                       // DAE removal
// if (args[0] === "on") await doOn();                      // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();              // Midi ItemMacro On Use
// if (args[0] === "each") doEach();					    // DAE removal
// if (args[0]?.tag === "DamageBonus") doBonusDamage();     // DAE Damage Bonus
jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/***************************************************************************************************
 * Check the setup of things. 
 ***************************************************************************************************/
function preCheck() {
    //----------------------------------------------------------------------------------
    // Make sure a ONE target was selected and hit before continuing
    //
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        ui.notifications.warn(msg)
        jez.log(msg)
        return (false);
    }
    if (LAST_ARG.hitTargets.length === 0) {  // If target was missed, return
        msg = `Target was missed.`
        // ui.notifications.info(msg)
        return (false);
    }
    return (true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    //----------------------------------------------------------------------------------
    // If target is larger than size large, can not be constricted.
    //
    let tTokenSize = await jez.getSize(tToken)
    jez.log(`${tToken.name} size ${tTokenSize.value}, ${tTokenSize.String}`, tTokenSize)
    if (tTokenSize.value > LARGE_VALUE) {
        msg = `${tToken.name} is size ${tTokenSize.String} which is too large to be ${aItem.name}.`
        jez.addMessage(chatMsg, { color: "purple", fSize: 15, msg: msg, tag: "saves" })
        return (false)
    }
    //----------------------------------------------------------------------------------
    // Check to see if the aActor is currently GRAPPLING_COND
    //
    let constricting = aToken.actor.effects.find(i => i.data.label === GRAPPLING_COND);
    if (constricting) {
        msg = `${aToken.name} is already ${GRAPPLING_JRNL} can not do this twice, simultaneously.`
        jez.addMessage(chatMsg, { color: "purple", fSize: 15, msg: msg, tag: "saves" })
        return (false)
    }
    //----------------------------------------------------------------------------------
    // Run the VFX
    //
    runVFX(tToken)
    //----------------------------------------------------------------------------------
    // Apply the GRAPPLED and GRAPPLING Cconditions
    //
    jezcon.add({ effectName: 'Grappled', uuid: tToken.actor.uuid, origin: aActor.uuid })
    jezcon.add({ effectName: 'Grappling', uuid: aToken.actor.uuid, origin: aActor.uuid })
    //----------------------------------------------------------------------------------
    // Find the two just added effect data objects so they can be paired, to expire 
    // together.
    //
    await jez.wait(100)
    let tEffect = tToken.actor.effects.find(ef => ef.data.label === GRAPPLED_COND && ef.data.origin === aActor.uuid)
    if (!tEffect) return jez.badNews(`Sadly, there was no Grappled effect from ${aToken.name} found on ${tToken.name}.`, "warn")
    let oEffect = aToken.actor.effects.find(ef => ef.data.label === GRAPPLING_COND)
    if (!oEffect) return jez.badNews(`Sadly, there was no Grappling effect found on ${aToken.name}.`, "warn")
    const GM_PAIR_EFFECTS = jez.getMacroRunAsGM("PairEffects")
    if (!GM_PAIR_EFFECTS) { return false }
    await jez.wait(100)
    await GM_PAIR_EFFECTS.execute(aToken.id, oEffect.data.label, tToken.id, tEffect.data.label)
    //----------------------------------------------------------------------------------
    // Pile onto the target with a Restrained effect
    //
    await jez.wait(100)
    jezcon.add({ effectName: 'Restrained', uuid: tToken.actor.uuid, origin: aActor.uuid })
    //----------------------------------------------------------------------------------
    // Pair the target's grappled and restrained effects
    //
    await jez.wait(100)
    tEffect = tToken.actor.effects.find(ef => ef.data.label === GRAPPLED_COND && ef.data.origin === aActor.uuid)
    if (!tEffect) return jez.badNews(`Sadly, there was no Grappled effect from ${aToken.name} found on ${tToken.name}.`, "warn")
    oEffect = tToken.actor.effects.find(ef => ef.data.label === RESTRAINED_COND)
    if (!oEffect) return jez.badNews(`Sadly, there was no Restrained effect from ${aToken.name}.`, "warn")
    await jez.wait(100)
    await GM_PAIR_EFFECTS.execute(tToken.id, oEffect.data.label, tToken.id, tEffect.data.label)
    //-------------------------------------------------------------------------------
    // Create an Action Item to allow the target to attempt escape
    //
    const GM_ESCAPE = jez.getMacroRunAsGM(jez.GRAPPLE_ESCAPE_MACRO)
    if (!GM_ESCAPE) { return false }
    await GM_ESCAPE.execute("create", aToken.document.uuid, tToken.document.uuid, aToken.actor.uuid)
    //----------------------------------------------------------------------------------
    // Post completion message
    //
    // https://www.w3schools.com/tags/ref_colornames.asp
    msg = `${tToken.name} has been ${GRAPPLED_JRNL} and ${RESTRAINED_JRNL} by ${aToken.name} who is 
        ${GRAPPLING_JRNL}.<br><br>${tToken.name} may attempt to end the grapple per standard grapple rules.`
    jez.addMessage(chatMsg, { color: "purple", fSize: 15, msg: msg, tag: "saves" })
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let pairedId = args[1];
    let pairedEffect = args[2];
    let pairedToken = canvas.tokens.placeables.find(ef => ef.id === pairedId)
    // COOL-THING: Remove a "paired" effect when either of the partner effects is deleted
    jez.log(`Attempt to remove ${pairedEffect} from ${pairedToken.name} as well.`)
    let pairedEffectObj = pairedToken.actor.effects.find(i => i.data.label === pairedEffect);
    if (pairedEffectObj) {
        jez.log(`Attempting to remove ${pairedEffectObj.id} from ${pairedToken.actor.uuid}`)
        MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: pairedToken.actor.uuid, effects: [pairedEffectObj.id] });
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
async function runVFX(token) {
    jez.log("***Execute VFX***", token, "VFX_LOOP", VFX_LOOP, "VFX_SCALE", VFX_SCALE,
        "VFX_OPACITY", VFX_OPACITY, "VFX_NAME", VFX_NAME)
    new Sequence()
        .effect()
        .file(VFX_LOOP)
        .attachTo(token)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .duration(5000)
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(10)             // Fade in for specified time in milliseconds
        .fadeOut(1000)          // Fade out for specified time in milliseconds
        .extraEndDuration(1200) // Time padding on exit to connect to Outro effect
        .play();
    jez.log("VFX Launched")
}