const MACRONAME = "Consuming_Bite.1.0"
/*****************************************************************************************
 * Ilyas Consuming Bite per MandyMod
 * 
 * Mandy's Description
 * -------------------
 *  llya regains hit points equal to the necrotic damage dealt by this attack. Ilya's mouth 
 *  grows into a giant grotesque maw when this ability is used, Characters within 30 ft. of 
 *  Ilya when he makes this attack for the first time and can see him must make a DC 12 
 *  Wisdom saving throw or become frightened for 3 turns. 
 * 
 * This is buit from a Crymic macro and Horrifying_Visage.0.1
 * 
 * 02/06/22 0.1 Rebuild of Macro to include fear element
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim off the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
//----------------------------------------------------------------------------------
// My typical initializations
//
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
const ALLOWED_UNITS = ["", "ft", "any"];
let msg = ""
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const GAME_RND = game.combat ? game.combat.round : 0;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const HEAL_TYPE = "healing";
const DAMAGE_TYPE = "necrotic";
const BLIND_COND = "Blinded"
const FRIGHTENED_COND = "Ilya Fright"
const IMMUNIZED_COND = "Ilya Fright, Immune"
const FRIGHTENED_ICON = "Icons_JGB/Monster_Features/Frightened.png"
const IMMUNIZED_ICON = "Icons_JGB/Monster_Features/Frightened_Immune.png"
const FRIGHTENED_JRNL = "@JournalEntry[tjg0x0jXlwvbdI9h]{Frightened}"
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal

jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
return;


/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //---------------------------------------------------------------------------------------------
    // Startup ye'ole VFX
    //
    runVFX();
    //----------------------------------------------------------------------------------
    // Apply AOE Fear similar to Horrifying_Visage.0.1
    //
    doFear()
    //----------------------------------------------------------------------------------
    // Make sure a ONE target was selected and hit before doing damage steps
    //
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        ui.notifications.warn(msg)
        console.log(msg)
        return;
    }
    if (LAST_ARG.hitTargets.length === 0) {  // If target was missed, return
        msg = `Target was missed.`
        ui.notifications.info(msg)
        return;
    }
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // Targeted Token
    //----------------------------------------------------------------------------------
    // Perform the bite portion of this ability (borrowed from Crymic)
    //
    doBite();
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the fear bit of this ability
 ***************************************************************************************************/
async function doFear() {
    const FUNCNAME = "doOnUse()";
    let tokensToSave = []
    let failSaves = []  // Array to contain the tokens that failed their saving throws
    let madeSaves = []  // Array to contain the tokens that made their saving throws
    let madeNames = ""
    let failNames = ""
    let immuneNames = ""
    const SAVE_TYPE = "wis"
    const SAVE_DC = aActor.data.data.attributes.spelldc;
    const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to resisit <b>${aItem.name}</b>`;
    //---------------------------------------------------------------------------------------------
    // Fetch the spell effect range
    //
    let RANGE = aItem.data.range?.value ? aItem.data.range?.value : 60
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
    // Proceed to doing actual things
    //
    let tTokens = await jez.tokensInRange(aToken, RANGE)
    let tTokenCnt = tTokens?.length
    jez.log(`${tTokenCnt} Token(s) found within ${RANGE} feet`, tTokens)
    for (let i = 0; i < tTokenCnt; i++) {
        //-----------------------------------------------------------------------------------------
        // Check to see if the current target has the BLIND_COND
        //
        if (tTokens[i].actor.effects.find(ef => ef.data.label === BLIND_COND)) {
            jez.log(`${tTokens[i].name} is afflicted by ${BLIND_COND}`)
            immuneNames += `<b>${tTokens[i].name} (Blind)</b><br>`
            continue
        }
        //-----------------------------------------------------------------------------------------
        // Check to see if the current target has the IMMUNIZED_COND
        //
        if (tTokens[i].actor.effects.find(ef => ef.data.label === IMMUNIZED_COND)) {
            jez.log(`${tTokens[i].name} has ${IMMUNIZED_COND} condition`)
            immuneNames += `<b>${tTokens[i].name} (Immunized)</b><br>`
            continue
        }
        //-----------------------------------------------------------------------------------------
        // Check to see if vision is blocked by a wall between current pair
        //
        let blocked = canvas.walls.checkCollision(new Ray(tTokens[i].center, aToken.center),
            { type: "sight", mode: "any" })
        if (blocked) {
            jez.log(`${tTokens[i].name} has no LoS to ${aToken.name}`)
            immuneNames += `<b>${tTokens[i].name} (no LoS)</b><br>`
            continue
        }
        //---------------------------------------------------------------------------------------------
        // Proceed with the tokens that might be affected (need to roll saves)
        //
        tokensToSave.push(tTokens[i])
        let save = (await tTokens[i].actor.rollAbilitySave(SAVE_TYPE, { FLAVOR, chatMessage: false, fastforward: true }));
        if (save.total < SAVE_DC) {
            jez.log(`${tTokens[i].name} failed ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            failSaves.push(tTokens[i])
            failNames += `<b>${tTokens[i].name}</b> ${save.total} (${save._formula})<br>`
        } else {
            jez.log(`${tTokens[i].name} saved ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            madeSaves.push(tTokens[i])
            madeNames += `<b>${tTokens[i].name}</b> ${save.total} (${save._formula})<br>`
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
    // Process Tokens that Failed Saves, giving them the FRIGHTENED_COND
    //
    jez.log(`${failSaves.length} Tokens failed saves, need '${FRIGHTENED_COND}' added`)
    for (let i = 0; i < failSaves.length; i++) {
        jez.log(` ${i + 1}) ${failSaves[i].name}`, failSaves[i])
        applyFrightened(failSaves[i], SAVE_TYPE, SAVE_DC);
    }
    //---------------------------------------------------------------------------------------------
    // Process Tokens that made Saves, giving them the IMMUNIZED_COND
    //
    jez.log(`${madeSaves.length} Tokens passed saves, need '${IMMUNIZED_COND}' added`)
    for (let i = 0; i < madeSaves.length; i++) {
        jez.log(` ${i + 1}) ${madeSaves[i].name}`, madeSaves[i])
        applyImmunized(madeSaves[i])
    }
    //---------------------------------------------------------------------------------------------
    // Craft results message and post it.
    //
    let chatMessage = await game.messages.get(args[args.length - 1].itemCardId);
    await jez.wait(100)
    if (immuneNames) {
        msg = `<b><u>Immune</u></b><br>${immuneNames}`
        await jez.wait(100)
        // https://www.w3schools.com/tags/ref_colornames.asp
        jez.addMessage(chatMessage, { color: "purple", fSize: 14, msg: msg, tag: "saves" })
    }
    if (madeNames) {
        msg = `<b><u>Successful ${SAVE_TYPE.toUpperCase()} Save</u></b> vs DC${SAVE_DC}<br>${madeNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkgreen", fSize: 14, msg: msg, tag: "saves" })
    }
    if (failNames) {
        msg = `Creatures that failed their save are <b>${FRIGHTENED_JRNL}</b> for 3 rounds.<br>`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkred", fSize: 14, msg: msg, tag: "saves" })
        msg = `<b><u>Failed ${SAVE_TYPE.toUpperCase()} Save</u></b> vs DC${SAVE_DC}<br>${failNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkred", fSize: 14, msg: msg, tag: "saves" })
    }
    await jez.wait(100)
    msg = `Total of ${tTokenCnt} target(s) within ${RANGE}ft of ${aToken.name}<br>`
    jez.addMessage(chatMessage, { color: "darkblue", fSize: 14, msg: msg, tag: "saves" })

    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Apply the frightened condition
 ***************************************************************************************************/
async function applyFrightened(token, saveType, saveDC) {
    let effectData = [{
        label: FRIGHTENED_COND,
        icon: FRIGHTENED_ICON,
        origin: LAST_ARG.uuid,
        disabled: false,
        flags: { dae: { stackable: false, macroRepeat: "endEveryTurn" } },
        duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
        changes: [
            { key: `flags.midi-qol.disadvantage.ability.check.all`, mode: ADD, value: 1, priority: 20 },
            { key: `flags.midi-qol.disadvantage.skill.all`, mode: ADD, value: 1, priority: 20 },
            { key: `flags.midi-qol.disadvantage.attack.all`, mode: ADD, value: 1, priority: 20 },
            { key: `macro.itemMacro`, mode: CUSTOM, value: `Save_DC ${saveDC} ${saveType}`, priority: 20 },
            //{ key: `flags.dae.deleteUuid`, mode: 5, value: conc.uuid, priority: 20 },
            //{ key: `flags.midi-qol.OverTime`, mode: 5, value: `turn=start,label=Frightened,saveDC=${spellDC},saveAbility=${saveType},saveRemove=true`, priority: 20 }
        ]
    }];
    let frightened = token.actor.effects.find(i => i.data.label === FRIGHTENED_COND);
    if (!frightened) await applyEffect(token, effectData);
    await wait(500);
    // updateEffect(tokenD, target, conc);
}
/***************************************************************************************************
 * Apply the Immune to Frightened Condition
 ***************************************************************************************************/
async function applyImmunized(token) {
    let effectData = [{
        label: IMMUNIZED_COND,
        icon: IMMUNIZED_ICON,
        origin: LAST_ARG.uuid,
        disabled: false,
        flags: { dae: { stackable: false, macroRepeat: "none" } },
        duration: { rounds: 14400, seconds: 86400, startRound: GAME_RND, startTime: game.time.worldTime },
        changes: [
            { key: `flags.gm-notes.notes`, mode: CUSTOM, value: "Immune to Ilya's Fear", priority: 20 },
        ]
    }];
    let frightened = token.actor.effects.find(i => i.data.label === FRIGHTENED_COND);
    if (!frightened) await applyEffect(token, effectData);
}
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
async function runVFX() {
    const VFX_NAME = `${MACRO}-${aToken.id}`
    const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Template/Circle/OutPulse/OutPulse_02_Regular_PurplePink_Loop_600x600.webm"
    const VFX_OPACITY = 1.0;
    const VFX_SCALE = 2.25;

    new Sequence()
        .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .duration(2500)
        .name(VFX_NAME) // Give the effect a uniqueish name
        .fadeIn(10) // Fade in for specified time in milliseconds
        .fadeOut(1000) // Fade out for specified time in milliseconds
        .play();
}

/***************************************************************************************************
 * Perform the damage/heal portion of this ability
 ***************************************************************************************************/
async function doBite() {
    const fracRec = 1.0; // Fraction of necrotic damage healed

    let damageDetail = await LAST_ARG.damageDetail.find(i => i.type === DAMAGE_TYPE);
    let damageTotal = (damageDetail.damage - damageDetail.DR) * damageDetail.damageMultiplier;
    MidiQOL.applyTokenDamage([{ damage: damageTotal, type: HEAL_TYPE }],
        damageTotal * fracRec, new Set([aToken]), aItem.name, new Set());
    let healMsg = `<div class="midi-qol-flex-container">
    <div class="midi-qol-target-npc midi-qol-target-name" id="${tToken.id}">
    hits ${tToken.name}</div><img src="${tToken.data.img}" 
    width="30" height="30" style="border:0px"></div><div 
    class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" 
    id="${aToken.id}">Heals ${aToken.name} 
    <span style="color:green;font-size:20px">
    <b>${damageTotal * fracRec}</b></span></div><img src="${aToken.data.img}" 
    width="30" height="30" style="border:0px"></div>`;
    await jez.wait(400);
    let chatMessage = await game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatMessage.data.content);
    let srcStr = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
    let repStr = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${healMsg}`;
    content = await content.replace(srcStr, repStr);
    await chatMessage.update({ content: content });
}
/***************************************************************************************************
 * Applies an effect
 ***************************************************************************************************/
async function applyEffect(target, effectData) {
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: effectData });
}
/***************************************************************************************************
 * Legacy Function -- Related to concentration management
 ***************************************************************************************************/
async function updateEffect(tokenD, target, conc) {
    let frightened = target.actor.effects.find(i => i.data.label === "Frightened");
    await MidiQOL.socket().executeAsGM("updateEffects", {
        actorUuid: tokenD.actor.uuid,
        updates: [{
            _id: conc.id, changes: [{
                key: `flags.dae.deleteUuid`, mode: 5,
                value: frightened.uuid, priority: 20
            }]
        }]
    });
    // Following line seemingly needed in call ing function just after use of this function
    await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tokenD.actor.uuid, effects: [conc.id] });
}