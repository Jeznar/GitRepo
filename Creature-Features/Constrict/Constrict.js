const MACRONAME = "Constrict"
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
 *****************************************************************************************/
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
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
let errorMsg = "";
const GRAPPLED_ICON = "Icons_JGB/Conditions/grappling.svg"
const GRAPPLING_ICON = "Icons_JGB/Conditions/grappling.png"
const GRAPPLED_COND = "Grappled"
const GRAPPLING_COND = "Grappling"
const LARGE_VALUE = 4
// COOL-THING: Journal entries looked up by name and formatted as links for chat cards
const GRAPPLED_JRNL = `@JournalEntry[${game.journal.getName("Grappled").id}]{Grappled}`
const GRAPPLING_JRNL = `@JournalEntry[${game.journal.getName("Grappling").id}]{Grappling}`
const RESTRAINED_JRNL = `@JournalEntry[${game.journal.getName("Restrained").id}]{Restrained}`
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
        return(false);
    }
    if (LAST_ARG.hitTargets.length === 0) {  // If target was missed, return
        msg = `Target was missed.`
        // ui.notifications.info(msg)
        return(false);
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
        jez.addMessage(chatMsg, {color:"purple", fSize:15, msg:msg, tag:"saves" })
        return(false)
    }
    //----------------------------------------------------------------------------------
    // Check to see if the aActor is currently GRAPPLING_COND
    //
    let constricting = aToken.actor.effects.find(i => i.data.label === GRAPPLING_COND);
    if (constricting) {
        msg = `${aToken.name} is already ${GRAPPLING_JRNL} can not do this twice, simultaneously.`
        jez.addMessage(chatMsg, {color:"purple", fSize:15, msg:msg, tag:"saves" })
        return(false)
    }
    //----------------------------------------------------------------------------------
    // Perform saving throw
    //
    /*
    let save = (await tToken.actor.rollAbilitySave(SAVE_TYPE, { flavor:FLAVOR, chatMessage: true, fastforward: true }));
    if (save.total < SAVE_DC) {
        jez.log(`${tToken.name} failed ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
    } else {
        jez.log(`${tToken.name} saved ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
        msg = `${tToken.name} saved versus ${aToken.name} ${aItem.name} and is not restrained.`
        return(false)
    }
    */
    runVFX(tToken)
    //----------------------------------------------------------------------------------
    // Apply the GRAPPLED_COND effect to the target.
    //
    let restrainedEffect = [{
        label: GRAPPLED_COND,
        icon: GRAPPLED_ICON,
        // origin: aActor.uuid,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 99, startRound: GAME_RND }, 
        changes: [
            { key: `flags.VariantEncumbrance.speed`, mode: DOWNGRADE, value: 1, priority: 20 },
            { key: `data.attributes.movement.walk`, mode: DOWNGRADE, value: 1, priority: 20 },
            { key: `data.attributes.movement.swim`, mode: DOWNGRADE, value: 1, priority: 20 },
            { key: `data.attributes.movement.fly`, mode: DOWNGRADE, value: 1, priority: 20 },
            { key: `data.attributes.movement.climb`, mode: DOWNGRADE, value: 1, priority: 20 },
            { key: `data.attributes.movement.burrow`, mode: DOWNGRADE, value: 1, priority: 20 },
            { key: `flags.midi-qol.disadvantage.attack.all`, mode: OVERRIDE, value: 1, priority: 20 },
            { key: `flags.midi-qol.grants.advantage.attack.all`, mode: OVERRIDE, value: 1, priority: 20 },
            { key: `flags.midi-qol.disadvantage.ability.save.dex`, mode: OVERRIDE, value: 1, priority: 20 },
            // The value needs to have the id of the partner token and the name of the effect
            { key: `macro.itemMacro`, mode: CUSTOM, value: `${aToken.id} ${GRAPPLING_COND}`, priority: 20 },
        ]
    }]
    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:tToken.actor.uuid, effects: restrainedEffect });
    //----------------------------------------------------------------------------------
    // Apply the GRAPPLING_COND effect to the actor.
    //
// COOL-THING: Stashes info in itemMacro parameters to enable removal of partner effect
    let constrictingEffect = [{
        label: GRAPPLING_COND,
        icon: GRAPPLING_ICON,
        //origin: tActor.uuid,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 99, startRound: GAME_RND }, 
        changes: [
            { key: `flags.gm-notes.notes`, mode: CUSTOM, value: "Can only constrict one target at a time", priority: 20 },
            { key: `macro.itemMacro`, mode: CUSTOM, value: `${tToken.id} ${GRAPPLED_COND}`, priority: 20 },
        ]
    }]
    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:aToken.actor.uuid, effects: constrictingEffect });
    //----------------------------------------------------------------------------------
    // Post completion message
    //
    // https://www.w3schools.com/tags/ref_colornames.asp
    msg = `${tToken.name} has been ${GRAPPLED_JRNL} and ${RESTRAINED_JRNL} by ${aToken.name} who is 
        ${GRAPPLING_JRNL}.<br><br>${tToken.name} may attempt to end the grapple per standard grapple rules.`
    jez.addMessage(chatMsg, {color:"purple", fSize:15, msg:msg, tag:"saves" })
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let pairedId     = args[1];
    let pairedEffect = args[2];
    let pairedToken  = canvas.tokens.placeables.find(ef => ef.id === pairedId)
// COOL-THING: Remove a "paired" effect when either of the partner effects is deleted
    jez.log(`Attempt to remove ${pairedEffect} from ${pairedToken.name} as well.`)
    let pairedEffectObj = pairedToken.actor.effects.find(i => i.data.label === pairedEffect);
    if (pairedEffectObj) {
        jez.log(`Attempting to remove ${pairedEffectObj.id} from ${pairedToken.actor.uuid}`)
        MidiQOL.socket().executeAsGM("removeEffects",{actorUuid:pairedToken.actor.uuid, effects: [pairedEffectObj.id] });
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
 async function runVFX(token) {
    jez.log("***Execute VFX***",token,"VFX_LOOP",VFX_LOOP,"VFX_SCALE",VFX_SCALE,
           "VFX_OPACITY",VFX_OPACITY,"VFX_NAME",VFX_NAME)
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