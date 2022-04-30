const MACRONAME = "Ray_of_Sickness"
/*****************************************************************************************
 * Built from Crymic's macro of the same name.  I added my structure, naming conventions,
 * and a VFX.
 * 
 * 02/19/22 0.1 Creation of Macro
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
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
const POISONED_JRNL = `@JournalEntry[${game.journal.getName("Poisoned").id}]{Poisoned}`

if((args[0]?.tag === "OnUse") && !preCheck()) return;

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus
jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
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
    jez.log('All looks good, to quote Jean-Luc, "MAKE IT SO!"')
    return (true)
}

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("Something could have been here")
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }
  
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("A place for things to be done");
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
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

    runVFX(aToken, tToken)

    const GAME_RND = game.combat ? game.combat.round : 0;
     const SPELL_DC = aToken.actor.data.data.attributes.spelldc;
     const SAVE_TYPE = "con";
     let save = await MidiQOL.socket().executeAsGM("rollAbility", { request: "save", targetUuid: tToken.actor.uuid, ability: SAVE_TYPE, options: { chatMessage: false, fastForward: true } });
     let success = "saves";
     let chatMessage = await game.messages.get(LAST_ARG.itemCardId);
     if (save.total < SPELL_DC) {
         success = "fails";
         let effectData = {
             label: "Poisoned",
             icon: "modules/combat-utility-belt/icons/poisoned.svg",
             origin: LAST_ARG.uuid,
             disabled: false,
             duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
             flags: { dae: { itemData: aItem, specialDuration: ['turnEndSource'] } },
             changes: [{ key: `flags.midi-qol.disadvantage.attack.all`, mode: 2, value: 1, priority: 20 },
                 { key: `flags.midi-qol.disadvantage.skill.check.all`, mode: 2, value: 1, priority: 20 },
                 { key: `flags.midi-qol.disadvantage.ability.check.all`, mode: 2, value: 1, priority: 20 }]
         };
         let effect = tToken.actor.effects.find(ef => ef.data.label === game.i18n.localize("Poisoned"));
         if (!effect) await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.uuid, effects: [effectData] });
         //----------------------------------------------------------------------------------------------
         // Post a message to the chatcard with results
         //
         msg = `${tToken.name} is ${POISONED_JRNL} until the end of its next turn`
         //let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
         jez.addMessage(chatMessage, { color: "mediumseagreen", fSize: 14, msg: msg, tag: "saves" })
         await jez.wait(250)
     }
     let saveResult = `<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${tToken.id}">${tToken.name} ${success} with a ${save.total}</div><img src="${tToken.data.img}" width="30" height="30" style="border:0px"></div>`;
     let saveMessage = `<div class="midi-qol-nobox midi-qol-bigger-text">${CONFIG.DND5E.abilities[SAVE_TYPE]} Saving Throw: DC ${SPELL_DC}</div><div class="midi-qol-nobox">${saveResult}</div>`;
     let content = await duplicate(chatMessage.data.content);
     let searchString = /<div class="midi-qol-saves-display">[\s\S]*<div class="end-midi-qol-saves-display">/g;
     let replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display">${saveMessage}`;
     content = await content.replace(searchString, replaceString);
     await chatMessage.update({ content: content });
     await ui.chat.scrollBottom();

    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        ui.notifications.warn(msg)
        jez.log(msg)
        return(false);
    }
    if (LAST_ARG.hitTargets.length === 0) {  // If target was missed, return
        msg = `Target was missed.`
        ui.notifications.info(msg)
        return(false);
    }
    return (true)
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
// COOL-THING: Run the VFX -- Beam from originator to the target
async function runVFX(token1, token2) {
const VFX_FILE = "modules/jb2a_patreon/Library/Cantrip/Ray_Of_Frost/RayOfFrost_01_Regular_Green_30ft_1600x400.webm"
new Sequence()
    .effect()
        .atLocation(token1)
        .stretchTo(token2)
        .file(VFX_FILE)
    .play();
}