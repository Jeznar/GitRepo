const MACRONAME = "Horrifying_Visage.0.1"
console.log(MACRONAME)
/*****************************************************************************************
 * Implment Banshee Horrifying Visage 
 * 
 *   Horrifying Visage. Each non-undead creature within 60 feet of the banshee that can see 
 *   her must succeed on a DC 13 Wisdom saving throw or be frightened for 1 minute. A 
 *   frightened target can repeat the saving throw at the end of each of its turns, with 
 *   disadvantage if the banshee is within line of sight, ending the effect on itself on a 
 *   success. If a target's saving throw is successful or the effect ends for it, the 
 *   target is immune to the banshee's Horrifying Visage for the next 24 hours.
 * 
 * 01/01/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim off the version number and extension
jez.log("")
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
const ALLOWED_UNITS = ["", "ft", "any"];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const GAME_RND = game.combat ? game.combat.round : 0;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
let errorMsg = "";
const BLIND_COND = "Blinded"
const HORRIFIED_COND = "Horrified"
const IMMUNIZED_COND = "Horrified, Immune"
const HORRIFIED_ICON = "Icons_JGB/Monster_Features/Horrified.png"
const IMMUNIZED_ICON = "Icons_JGB/Monster_Features/Horrified_Immune.png"
const HORRIFIED_JRNL = "@JournalEntry[tjg0x0jXlwvbdI9h]{Frightened}"

const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Template/Circle/Vortex_01_Regular_Purple_600x600.webm"
const VFX_INTRO = "modules/jb2a_patreon/Library/Generic/Template/Circle/VortexIntro_01_Regular_Purple_600x600.webm"
const VFX_OUTRO = "modules/jb2a_patreon/Library/Generic/Template/Circle/VortexOutro_01_Regular_Purple_600x600.webm"
const VFX_OPACITY = 0.8;
const VFX_SCALE = 5.50;


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
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`${aToken.name} immune to ${HORRIFIED_COND} for 24 hours`)
    applyImmunized(aToken)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }
  /***************************************************************************************************
 * Perform the code that runs every turn, a DAE feature
 ***************************************************************************************************/
 async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    // Expecting arguments passed of this form: Save_DC ${saveDC} ${saveType}
    let save = null;
    const SAVE_DC = args[args.length - 3]
    const SAVE_TYPE = args[args.length - 2]
    let flavor = "" 
    jez.log(`${aToken.name} attempts DC${SAVE_DC} ${SAVE_TYPE} saving to remove ${HORRIFIED_COND} effect.`);
    jez.log(`aActor ${aActor.name}`, aActor)

     //-----------------------------------------------------------------------------------------
     // Parse the passed data to find the origin token, etal.
     // It will be of form: Scene.MzEyYTVkOTQ4NmZk.Token.4k8NyJnKNvjALfja.Item.MTI3MDA4YzllNTZh
     //
     let origin = LAST_ARG.origin
     let goodLoS = false;
     const ORIGIN_TOKENS = origin.split(".")
     const ORIGIN_TOKENID = ORIGIN_TOKENS[3];
     const ORIGIN_ITEMID = ORIGIN_TOKENS[5];
     jez.log(`Origin Token ID ${ORIGIN_TOKENID}, Item ID ${ORIGIN_ITEMID}`)
     let oToken = canvas.tokens.placeables.find(ef => ef.id === ORIGIN_TOKENID)
     jez.log(`Origin token ${oToken.name}`, oToken)
     let oItem = oToken.actor.data.items.get(ORIGIN_ITEMID)
     jez.log(`Origin item ${oItem.name}`, oItem)
     //-----------------------------------------------------------------------------------------
     // Grab the horrified condition info
     //
     let condition = aActor.effects.find(ef => ef.data.label === HORRIFIED_COND)
     if (condition) {
         jez.log("Horrified Condition", condition)
         // Does the afflicted have a clear LoS to the originator?
         goodLoS = canvas.walls.checkCollision(new Ray(aToken.center, oToken.center), { type: "sight", mode: "any" })
         jez.log(`${aToken.name} LoS to ${oToken.name} clear?`, goodLoS)
     } else {
         msg = `Somehow ${aToken.name} lacks the ${HORRIFIED_COND} condition.  HeLp!`
         ui.notifications.error(msg)
         console.log(msg)
         return
     }
     //-----------------------------------------------------------------------------------------
     // Execute the save, imposing disadvantage if origin can not be seen.
     //
     if (goodLoS) {
         flavor = `${aToken.name} attempts ${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> 
            save to remove <b>${aItem.name}</b> normally as ${oToken.name} can not be seen.`;
         save = (await aActor.rollAbilitySave(SAVE_TYPE, { flavor: flavor, chatMessage: true, fastforward: true }));
     } else {
         flavor = `${aToken.name} attempts ${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> 
            save to remove <b>${aItem.name}</b> at disadvantage as ${oToken.name} can be seen.`;
         save = (await aActor.rollAbilitySave(SAVE_TYPE, { disadvantage: true, flavor: flavor, chatMessage: true, fastforward: true }));
     }
     jez.log(`Save`, save)
     //-----------------------------------------------------------------------------------------
     // Apply the save results
     //
     if (save.total < SAVE_DC) {
         jez.log(`${aToken.name} failed with a ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
     } else {
         jez.log(`${aToken.name} saved with a ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
         aActor.deleteEmbeddedEntity("ActiveEffect", LAST_ARG.effectId);
     }
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
    let isNPC = false;
    let targetType = null;
    let tokensToSave = []
    const SAVE_TYPE = "wis"
    const SAVE_DC = aActor.data.data.attributes.spelldc;
    const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to resisit <b>${aItem.name}</b>`;
    let failSaves = []  // Array to contain the tokens that failed their saving throws
    let madeSaves = []  // Array to contain the tokens that made their saving throws
    let madeNames = ""
    let failNames = ""
    let immuneNames = ""
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);

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
    // Startup ye'ole VFX
    //
    runVFX();
    //---------------------------------------------------------------------------------------------
    // Proceed to doing actual things
    //
    let tTokens = await jez.tokensInRange(aToken, RANGE)
    let tTokenCnt = tTokens?.length
    jez.log("")
    jez.log(`${tTokenCnt} Token(s) found within ${RANGE} feet`, tTokens)
    for (let i = 0; i < tTokenCnt; i++) {
        //-----------------------------------------------------------------------------------------
        // Check to see if the current target has the BLIND_COND
        //
        if (tTokens[i].actor.effects.find(ef => ef.data.label === BLIND_COND)) {
            jez.log(`${tTokens[i].name} is afflicted by ${BLIND_COND}`)
            immuneNames += `o <b>${tTokens[i].name} (Blind)</b><br>`
            continue
        }
        //-----------------------------------------------------------------------------------------
        // Check to see if the current target has the IMMUNIZED_COND
        //
        if (tTokens[i].actor.effects.find(ef => ef.data.label === IMMUNIZED_COND)) {
            jez.log(`${tTokens[i].name} has ${IMMUNIZED_COND} condition`)
            immuneNames += `o <b>${tTokens[i].name} (Immunized)</b><br>`
            continue
        }
        //-----------------------------------------------------------------------------------------
        // Check to see if target is undead and thus immune
        //
        if (tTokens[i].document._actor.data.type === "npc") isNPC = true; else isNPC = false;
        if (isNPC) targetType = tTokens[i].document._actor.data.data.details.type.value 
              else targetType = tTokens[i].document._actor.data.data.details.race.toLowerCase()
        if (targetType.includes("undead")) {
            jez.log(`${tTokens[i].name} is undead`)
            immuneNames += `o <b>${tTokens[i].name} (Undead)</b><br>`
            continue
        }
        //-----------------------------------------------------------------------------------------
        // Check to see if vision is blocked by a wall between current pair
        //
        let blocked = canvas.walls.checkCollision(new Ray(tTokens[i].center, aToken.center),
            {type:"sight", mode:"any"})
        if (blocked) {
            jez.log(`${tTokens[i].name} has no LoS to ${aToken.name}`)
            immuneNames += `o <b>${tTokens[i].name} (no LoS)</b><br>`
            continue
        }
        //---------------------------------------------------------------------------------------------
        // Proceed with the tokens that might be affected (need to roll saves)
        //
        tokensToSave.push(tTokens[i])
        let save = (await tTokens[i].actor.rollAbilitySave(SAVE_TYPE, { FLAVOR, chatMessage: false, fastforward: true }));
        if (save.total < SAVE_DC) {
            jez.log(`${tTokens[i].name} failed with a ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            failSaves.push(tTokens[i])
            failNames += `+ <b>${tTokens[i].name}</b> with a ${save.total} (${save._formula})<br>`
        } else {
            jez.log(`${tTokens[i].name} saved with a ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            madeSaves.push(tTokens[i])
            madeNames += `- <b>${tTokens[i].name}</b> with a ${save.total} (${save._formula})<br>`
        }
    }

    //---------------------------------------------------------------------------------------------
    // If no tokens need to roll saves, we're done, get on out of here.
    //
    if (tokensToSave.length < 1) {
        msg = `There are no targets that need to save against ${aToken.name}'s ${aItem.name}`
        jez.log(`msg`)
        let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
        await jez.addMessage(chatMessage, {color:"purple", fSize:15, msg:msg, tag:"saves" })
        return;
    }
    //---------------------------------------------------------------------------------------------
    // Process Tokens that Failed Saves, giving them the HORRIFIED_COND
    //
    jez.log(`${failSaves.length} Tokens failed saves, need '${HORRIFIED_COND}' added`)
    for (let i = 0; i < failSaves.length; i++) {
        jez.log(` ${i + 1}) ${failSaves[i].name}`, failSaves[i])
        applyHorrified(failSaves[i], SAVE_TYPE, SAVE_DC);
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
        msg = `Creatures that failed their save are <b>${HORRIFIED_JRNL}</b> for 1 minute or they 
            make a DC${SAVE_DC} ${SAVE_TYPE} save at the end of their turn, each round.<br>`
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
        //.persist()
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
/***************************************************************************************************
 * Apply the horrified condition
 ***************************************************************************************************/
async function applyHorrified(token, saveType, saveDC) {
    let effectData = [{
        label: HORRIFIED_COND,
        icon: HORRIFIED_ICON,
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
    let horrified = token.actor.effects.find(i => i.data.label === HORRIFIED_COND);
    if (!horrified) applyEffect(token, effectData);
    //await wait(500);
    //updateEffect(tokenD, target, conc);
}
/***************************************************************************************************
 * Apply the Immune to Horrified Condition
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
            { key: `flags.gm-notes.notes`, mode: CUSTOM, value: "Immune to Horrifying Visage", priority: 20 },
        ]
    }];
    let horrified = token.actor.effects.find(i => i.data.label === HORRIFIED_COND);
    if (!horrified) applyEffect(token, effectData);
    //await wait(500);
    //updateEffect(tokenD, target, conc);
}
/***************************************************************************************************
 * Applies an effect
 ***************************************************************************************************/
async function applyEffect(target, effectData){
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: effectData });
}