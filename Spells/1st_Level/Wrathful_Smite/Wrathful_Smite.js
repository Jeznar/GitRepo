const MACRONAME = "Wrathful_Smite.0.3.js"
/*****************************************************************************************
 * Implment Wrathful Smite!
 * 
 * special thanks to theripper93
 * 
 * 01/25/22 0.1 Add headers and VFX
 * 05/04/22 0.2 Update for Foundry 9.x
 * 08/01/22 0.3 Fix to accomodate change in Midi (flags.midi-qol.itemDetails needs OVERIDE)
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]      // Trim of the version number and extension
 const TL = 0;                              // Trace Level for this macro
 let msg = "";                              // Global message string
 //---------------------------------------------------------------------------------------------------
 if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
 if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;         
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
if (TL > 3) jez.trace(`aToken`, aToken);
let aActor = aToken.actor; 
//
// Set the value for the Active Item (aItem)
let aItem;         
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
if (TL > 3) jez.trace(`aItem`, aItem);
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const gameRound = game.combat ? game.combat.round : 0;
const SAVE_DC = aToken.actor.data.data.attributes.spelldc;
const saveType = "wis";
// VFX Settings -------------------------------------------------------------------
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_TARGET = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Dark_Red_Target_400x400.webm"
const VFX_CASTER = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Dark_Red_Caster_400x400.webm"
const VFX_OPACITY = 1.0;
const VFX_SCALE = 0.70;
if (TL > 3) jez.trace(`Forking....${args[0]?.tag}`, args[0]);
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
// if (args[0] === "off") await doOff();                   // DAE removal
// if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE everyround
// DamageBonus must return a function to the caller
if (args[0]?.tag === "DamageBonus") return(doBonusDamage());    
if (TL>1) jez.trace(`=== Starting === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ****************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    await jez.wait(100)
    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    const tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    if (TL > 3) jez.trace(`tToken`, tToken);
    const tActor = tToken?.actor;
    //------------------------------------------------------------------------------------------------
    // Launch VFX on caster
    // 
    new Sequence()
        .effect()
        .file(VFX_CASTER)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        .name(VFX_NAME)          // Give the effect a uniqueish name
        .play()
    //-------------------------------------------------------------------------------------------------
    // Define and apply the effect
    // 
    const CE_DESC = `Next weapon hit does extra damage and forces a DC${SAVE_DC} WIS save or Frightened.`
    let effectData = [{
        changes: [
            { key: "flags.dnd5e.DamageBonusMacro", mode: jez.CUSTOM, value: `ItemMacro.${aItem.name}`, priority: 20 },
            { key: "flags.midi-qol.itemDetails", mode: jez.OVERRIDE, value: `${LAST_ARG.uuid}`, priority: 20 },
        ],
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 1, seconds: 6, startRound: gameRound, startTime: game.time.worldTime },
        flags: { 
            dae: { itemData: aItem, specialDuration: ["DamageDealt"] },
            convenientDescription: CE_DESC
        },
        icon: aItem.img,
        label: aItem.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:aToken.actor.uuid, effects: effectData });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "doBonusDamage"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (!["mwak"].includes(LAST_ARG.item.data.actionType)) return {};
    let tToken = canvas.tokens.get(LAST_ARG.hitTargets[0].id);
    let tActor = tToken.actor
    let itemUuid = getProperty(LAST_ARG.actor.flags, "midi-qol.itemDetails");
    if (TL>2) jez.trace(`${TAG} itemUuid`,itemUuid);
    let sItem = await fromUuid(itemUuid);
    if (TL>2) jez.trace(`${TAG} sItem`,sItem);
    let aItem = LAST_ARG.item;
    let numDice = LAST_ARG.isCritical ? 2 : 1;
    let saveOptions = tToken.actor.data.type === "character" ? { chatMessage: false, fastForward: false } : { chatMessage: false, fastForward: true };
    let save = await MidiQOL.socket().executeAsGM("rollAbility", { request: "save", targetUuid: tToken.actor.uuid, ability: saveType, options: saveOptions });
    let saveSuccess = "saves";
    let conc = aToken.actor.effects.find(i => i.data.label === "Concentrating");
    //-------------------------------------------------------------------------------------------------------------
    // Launch VFX on tToken
    // 
    new Sequence()
        .effect()
        .file(VFX_TARGET)
        .attachTo(tToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        .name(VFX_NAME)          // Give the effect a uniqueish name
        .play()
    //-------------------------------------------------------------------------------------------------------------
    // Apply Frightend condition with CV, modified to last until start of tToken's next turn
    //     
    if (save.total < SAVE_DC) {
        saveSuccess = "fails";
        if (TL>2) jez.trace("Next Frightened condition", tToken.actor)
        await jezcon.addCondition("Frightened", LAST_ARG.targetUuids, 
        {allowDups: true, replaceEx: false, origin: sItem.uuid, overlay: false, traceLvl: 5 }) 
        if (TL>2) jez.trace("Added Frightened condition", tToken.actor)
        //----------------------------------------------------------------------------------------------------------
        // Chill a bit and then pair the effects
        //
        await jez.wait(100);
        jez.pairEffects(aActor, "Concentrating", tActor, "Frightened")
        //----------------------------------------------------------------------------------------------------------
        // Chill again and update the frightened effect
        //
        await jez.wait(100);
        let effect = await tActor.effects.find(i => i.data.label === "Frightened");
        if (!effect) return jez.badNews(`Could not find Frightened on ${tToken.name}`,"e")
        effect.data.flags.dae = { macroRepeat: "startEveryTurn" }
        const CE_DESC = `Disadvantage on ability checks and attack rolls while ${aToken.name} is visible and may not approach.`
        effect.data.flags.convenientDescription = CE_DESC
        await effect.data.update({ flags: effect.data.flags });
        await jez.wait(50)
        effect.data.changes.push(
            { key: `macro.itemMacro`, mode: jez.CUSTOM, value: `'${aToken.name}' ${SAVE_DC}`, priority: 20 },
            // { key: "flags.midi-qol.itemDetails", mode: jez.OVERRIDE, value: `${LAST_ARG.uuid}`, priority: 20 },
        )
        // Update the change into game data
                const RESULT = await effect.update({ 'changes': effect.data.changes });
        if (RESULT && TL>1) jez.trace(`${FNAME} | Active Effect Frightened updated!`, RESULT);
    } else {
        await MidiQOL.socket().executeAsGM("removeEffects",{actorUuid:aToken.actor.uuid, effects: [conc.id] });
    }
    await jez.wait(500);
    let msgHistory = [];
    game.messages.reduce((list, message) => {
        if (message.data?.flags["midi-qol"]?.itemId === aItem._id && message.data.speaker.token === aToken.id) list.push(message.id);
        return list;
    }, msgHistory);
    let damageType = "psychic";
    let itemCard = msgHistory[msgHistory.length - 1];
    let saveResult = `<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${tToken.id}">${tToken.name} ${saveSuccess} with a ${save.total}</div><img src="${tToken.data.img}" width="30" height="30" style="border:0px"></div>`;
    let saveMessage = `<div class="midi-qol-nobox midi-qol-bigger-text">${CONFIG.DND5E.abilities[saveType]} Saving Throw: DC ${SAVE_DC}</div><div class="midi-qol-nobox">${saveResult}</div>`;
    let chatMessage = await game.messages.get(itemCard);
    let content = await duplicate(chatMessage.data.content);
    let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
    let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${saveMessage}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    return { damageRoll: `${numDice}d6[${damageType}]`, flavor: `(${sItem.name} (${CONFIG.DND5E.damageTypes[damageType]}))` };
}

async function updateEffect(aToken, target, conc) {
    let frightened = target.actor.effects.find(i => i.data.label === "Frightened");
    await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: aToken.actor.uuid, updates: [{ _id: conc.id, changes: [{ key: `flags.dae.deleteUuid`, mode: 5, value: frightened.uuid, priority: 20 }] }] });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doEach() {
    const FUNCNAME = "doEach()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    let oTokenName = args[1]
    const SAVE_DC = args[2]
    //------------------------------------------------------------------------------------------
    // Prepare for and pop a simple dialog asking the afflicted if they want to attempt a save
    //
    const Q_TITLE = `Does ${aToken.name} Make Check?`
    const Q_TEXT = `As an <b>action</b>, ${aToken.name} can attempt a Wisdom check against 
    DC${SAVE_DC} to steel its resolve and end this effect.<br><br>Select Yes, if you want to 
    make the check.<br><br>`
    //------------------------------------------------------------------------------------------
    // Very simple dialog to prompt confirmation after user clicks button, confirmation will be 
    // boolean for yes/no
    // 
    let confirmation = await Dialog.confirm({
        title: Q_TITLE,
        content: Q_TEXT,
    });
    //-----------------------------------------------------------------------------------------------
    // If we're attempting a check, do it!
    //
    if (confirmation) {
        if (TL>2) jez.trace(`${TAG} Attempting Saving Throw`);
        let check = (await aActor.rollAbilityTest("wis",
            { flavor: "Flavor Text", chatMessage: true, fastforward: true })).total;
        if (check >= SAVE_DC) {
            if (TL>2) jez.trace(`${TAG} Successful Saving Throw, ${check} vs DC${SAVE_DC}`);
            await jezcon.remove("Frightened", aActor.uuid, {traceLvl: 5});
            bubbleForAll(aToken.id, `${oTokenName} isn't that frightening after all!`, true, true)
        } else {
            if (TL>2) jez.trace(`${TAG} Failed Saving Throw, ${check} vs DC${SAVE_DC}`);
            bubbleForAll(aToken.id, `${oTokenName} is just too frightening.`, true, true)
        }
    } else {
        if (TL>2) jez.trace(`${TAG} Skipping Saving Throw`);
        bubbleForAll(aToken.id, `Maybe if I stay away from ${oTokenName}?`, true, true)
    }
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}