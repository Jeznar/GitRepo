const MACRONAME = "Entangling_Plants"
/*****************************************************************************************
 * Vine Blight's Entangling Plant ability
 *
 *   Grasping roots and vines sprout in a 15-foot radius centered on the blight, withering
 *   away after 1 minute. For the duration, that area is difficult terrain for nonplant
 *   creatures. In addition, each creature of the blight’s choice in that area when the
 *   plants appear must succeed on a DC 12 Strength saving throw or become restrained. A
 *   creature can use its action to make a DC 12 Strength check, freeing itself or another
 *   entangled creature within reach on a success.
 *
 * Currently has an odd behavior that sometimes allows double debuffs on targets, seemingly
 * never more than 2 copies and randomly repeatable. 
 * 
 * Has a partner macro that allows "allies" to attempt to remove the effect from adjacent 
 * tokens.
 * 
 * 02/14/22 0.1 Creation of Macro
 *****************************************************************************************/
// COOL-THING: Manages two VFX sets, one on targets, one on caster
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
const SAVE_TYPE = "str"
const SAVE_DC = args[0]?.tag === "OnUse" ? aActor.data.data.attributes.spelldc : args[2] // Second arg should be save DC
let msg = "";
let immuneNames = [];
let failSaves = []  // Array to contain the tokens that failed their saving throws
let madeSaves = []  // Array to contain the tokens that made their saving throws
let madeNames = ""
let failNames = ""
const DEBUFF_NAME = "Restrained by Entangling Plants" // aItem.name || "Nature's Wraith";
const DEBUFF_ICON = "modules/combat-utility-belt/icons/restrained.svg"
const GAME_RND = game.combat ? game.combat.round : 0;

const VFX_TARGET_LOOP = "modules/jb2a_patreon/Library/1st_Level/Entangle/Entangle_01_Green_400x400.webm"
const VFX_TARGET_OPACITY = 0.8;
const VFX_TARGET_SCALE = 0.4;
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_INTRO = "modules/jb2a_patreon/Library/Generic/Magic_Signs/ConjurationCircleIntro_02_Regular_Green_800x800.webm"
const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Magic_Signs/ConjurationCircleLoop_02_Regular_Green_800x800.webm";
const VFX_OUTRO = "modules/jb2a_patreon/Library/Generic/Magic_Signs/ConjurationCircleOutro_02_Regular_Green_800x800.webm";
const VFX_OPACITY = 1.0;
const VFX_SCALE = 0.9;
const RESTRAINED_JRNL = `@JournalEntry[${game.journal.getName("Restrained").id}]{Restrained}`
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    Sequencer.EffectManager.endEffects({ name: `${MACRO}-${aToken.id}`, object: aToken });
    //----------------------------------------------------------------------------------
    // If this is invoked on a target (not origin token) reture without more VFX
    //
    const ORIGIN_ARRAY = LAST_ARG.origin.split(".")    
    if (aToken.id !== ORIGIN_ARRAY[3]) return;  // Don't apply the VFX to target tokens
    new Sequence()
    .effect()
        .file(VFX_OUTRO)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)  
        .attachTo(aToken)
    .play()
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is added by DAE
 * 
 * This function is run on each application of an effect, but the VFX should only apply to the 
 * original user of the effect.
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const ORIGIN_ARRAY = LAST_ARG.origin.split(".")    
    if (aToken.id !== ORIGIN_ARRAY[3]) return;  // Don't apply the VFX to target tokens
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
            .belowTokens()
            .scale(VFX_SCALE)
            .opacity(VFX_OPACITY)
            .persist()
            .name(VFX_NAME)         // Give the effect a uniqueish name
            .fadeIn(300)            // Fade in for specified time in milliseconds
            .fadeOut(300)           // Fade out for specified time in milliseconds
            .extraEndDuration(800)  // Time padding on exit to connect to Outro effect
        .play()
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const DIALOG_TITLE = "Make a choice of how to use your action"
    const DIALOG_TEXT = `The nasty vines are keeping <b>${aToken.name}</b> restrained.  
        Would you like to use your action this round to attempt to break the vines 
        (<b>DC${SAVE_DC} Strength</b> check), or simply ignore them and do something else 
        with your action?<br><br>`
    new Dialog({
        title: DIALOG_TITLE,
        content: DIALOG_TEXT,
        buttons: {
            yes: {
                label: "Break Vines", callback: async () => {
                    let flavor = `${aToken.name} uses this turn's <b>action</b> to attempt a 
                    ${CONFIG.DND5E.abilities[SAVE_TYPE]} check vs <b>DC${SAVE_DC}</b> to end the 
                    <b>${DEBUFF_NAME}</b> effect from ${aItem.name}.`;
                    let check = (await aActor.rollAbilityTest(SAVE_TYPE, {
                        flavor: flavor,
                        chatMessage: true,
                        fastforward: true
                    })).total;
                    jez.log("Result of check roll", check);
                    await aActor.deleteEmbeddedDocuments("ActiveEffect", [LAST_ARG.effectId]);
                }
            },
            no: { label: "Ignore Vines", callback: () => { } }
        },
        default: "yes",
    }).render(true);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    let isNPC = true;
    let targetType = ""

    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    // Grab the max range of this item
    //
    const ALLOWED_UNITS = ["", "ft", "any"];
    const MAX_RANGE = jez.getRange(aItem, ALLOWED_UNITS)
    if (!MAX_RANGE) {
        msg = `Range is 0 or incorrect units on ${aItem.name}`;
        jez.log(msg);
        ui.notifications.warn(msg);
        return (false)
    }
    jez.log(`Range of ${aItem.name} is ${MAX_RANGE} feet`)
    //----------------------------------------------------------------------------------------------
    // Get a list of all the tokens within range that could be affected by this spell.
    //
    let inRangers = await jez.tokensInRange(aToken, MAX_RANGE)
    let inRangeCount = inRangers?.length
    let nonPlantTokens = [];
    let nonPlantNamesAndIds = [];
    let exemptType = "plant"
    jez.log(`${inRangeCount} Token(s) found within ${MAX_RANGE} feet`, inRangers)
    for (let i = 0; i < inRangers.length; i++) {
        //-----------------------------------------------------------------------------------------
        // Remove plants from the list to be considered (they are immune)
        //
        if (inRangers[i].document._actor.data.type === "npc") isNPC = true; else isNPC = false;
        if (isNPC) targetType = inRangers[i].document._actor.data.data.details.type.value
        else targetType = inRangers[i].document._actor.data.data.details.race.toLowerCase()
        if (targetType.includes(exemptType)) {
            jez.log(`====> ${inRangers[i].name} is ${exemptType}`)
            immuneNames += `<b>${inRangers[i].name}</b> (${exemptType})<br>`
        } else nonPlantTokens.push(inRangers[i])
    }
    for (let i = 0; i < nonPlantTokens.length; i++) 
        nonPlantNamesAndIds.push(`${nonPlantTokens[i].name} (${nonPlantTokens[i].id})`)
    //----------------------------------------------------------------------------------------------
    // Pop dialog to determine which tokens should be forced to make a save to avoid being rooted.
    //
    const queryTitle = "Select Creatures that Should be Forced to Roll Saves"
    const queryText = "Pick any number from the below list"
    jez.pickCheckListArray(queryTitle, queryText, pickCheckCallBack, nonPlantNamesAndIds.sort());
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function pickCheckCallBack(selection) {
    let tokenId = null
    let tokensIdsToSave = []
    //----------------------------------------------------------------------------------------------
    // Build an array of the token IDs that correspond with the tokens that are going to be forced
    // to roll saving throws. The names embedded in the selection array are followed by  a tokenId 
    // that is wrapped in parens.  Of this form:  Lecherous Meat Bag, Medium (eYstNJefUUgrHk8Q)
    //
    for (let i = 0; i < selection.length; i++) {
        let tokenArray = []     // Array for tokens seperated by "(", there will be 2 or more
        tokenArray = selection[i].split("(")
        tokenId = tokenArray[tokenArray.length-1].slice(0, -1)  // Chop off last character a ")"
        tokensIdsToSave.push(tokenId)  // Stash tha actual tokenId from the selection line
    }
    //----------------------------------------------------------------------------------------------
    // Build an array of Tokens from the array of TokenIds just built.
    //
    let token5esToSave = [];
    for (let i = 0; i < tokensIdsToSave.length; i++) {
        token5esToSave.push(canvas.tokens.placeables.find(ef => ef.id === tokensIdsToSave[i]))
        msg += `${i + 1}) ${token5esToSave[i].name}<br>`
    }
    //----------------------------------------------------------------------------------------------
    // Roll saves for the selected tokens and create list of successes and failures, applying debuff
    // as appropriate.
    //
    for (let i = 0; i < token5esToSave.length; i++) {
        let save = (await token5esToSave[i].actor.rollAbilitySave(SAVE_TYPE, 
            { chatMessage: false, fastforward: true }));
        if (save.total < SAVE_DC) {
            jez.log(`${token5esToSave[i].name} failed: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            failSaves.push(token5esToSave[i])
            failNames += `<b>${token5esToSave[i].name}</b>: ${save.total} (${save._formula})<br>`
            runVfxToken(token5esToSave[i])
            applyRestrained(token5esToSave[i])
        } else {
            jez.log(`${token5esToSave[i].name} saved: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            madeSaves.push(token5esToSave[i])
            madeNames += `<b>${token5esToSave[i].name}</b>: ${save.total} (${save._formula})<br>`
        }
    }
    if (madeNames) {
        await jez.wait(500)
        jez.postMessage({
            color: "darkblue",
            fSize: 14,
            icon: aItem.img,
            msg: `The following made succesful ${SAVE_TYPE.toUpperCase()} DC${SAVE_DC} saving throws<br><br>`
                + madeNames + `<br>They are not ${RESTRAINED_JRNL}.`,
            title: `Succesful Saves vs ${aItem.name}`,
            token: aToken
        })
    }
    if (failNames) {
        await jez.wait(500)
        jez.postMessage({
            color: "darkred",
            fSize: 14,
            icon: aItem.img,
            msg: `The following failed ${SAVE_TYPE.toUpperCase()} DC${SAVE_DC} saving throws<br><br>`
                + failNames + `<br>They are ${RESTRAINED_JRNL} for a minute or until someone succeeds on a 
        ${SAVE_TYPE.toUpperCase()} DC${SAVE_DC} Skill check.`,
            title: `Failed Saves vs ${aItem.name}`,
            token: aToken
        })
    }
}

/***************************************************************************************************
 * Apply the Restrained Effect
 ***************************************************************************************************/
async function applyRestrained(token5e) {
    //----------------------------------------------------------------------------------------------
    // Apply new Restrained effect
    //
    let restrainedEffect = [{
        label: DEBUFF_NAME,
        icon: DEBUFF_ICON,
        // origin: aActor.uuid,
        origin: LAST_ARG.uuid,
        flags: { dae: { itemData: aItem, macroRepeat: "startEveryTurn", token: token5e.uuid } },
        disabled: false,
        duration: { rounds: 10, startRound: GAME_RND },
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
            { key: "macro.itemMacro", mode: CUSTOM, value: `@token ${SAVE_DC}`, priority: 20 }
            // The value needs to have the id of the partner token and the name of the effect
            // { key: `macro.itemMacro`, mode: CUSTOM, value: `${aToken.id} ${GRAPPLING_COND}`, priority: 20 },
        ]
    }]
    //----------------------------------------------------------------------------------------------
    // Check to see if already restrained by this ability, if so, remove it before applying again
    //
    jez.log(`XXX${token5e.name} token5e.actor.effects`, token5e.actor.effects)
    let debuffEffect = await token5e.actor.effects.find(i => i.data.label === DEBUFF_NAME);
    //let debuffEffect = token5e.actor.effects.find(i => i.value.data.label === DEBUFF_NAME);
    if (debuffEffect) {
        jez.log(`XXX${token5e.name} ${DEBUFF_NAME} found on ${token5e.name}, removing existing copy.`)
        let rtn = await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: token5e.actor.uuid, effects: [debuffEffect.id] });
        jez.log(`XXX${token5e.name} Result of removal`, rtn)
    } else jez.log(`XXX${token5e.name} ${DEBUFF_NAME} missing on ${token5e.name}`)

    //----------------------------------------------------------------------------------------------
    // Apply the fresh debuff
    //
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token5e.uuid, effects: restrainedEffect });
}
/***************************************************************************************************
 * Launch the VFX effect on affected Token
 ***************************************************************************************************/
 async function runVfxToken(token) {
    let vfxName = `${MACRO}-${token.id}`
    let gridSize = game.scenes.viewed.data.grid
    let size = Math.max(token.w/gridSize, token.h/gridSize, 1)
    let scale = 0.3 * size // 0.25 fills the grid completely
    //----------------------------------------------------------------------------------------------
    // Cancel existing VFX on token (if any)
    //
    if (await Sequencer.EffectManager.endEffects({ name: `${MACRO}-${token.id}`, object: token })) {
        jez.log (`Removed existing VFX from ${token.name}`)
        await jez.wait(1500)
    }
    //----------------------------------------------------------------------------------------------
    // Apply new VFX
    //
    new Sequence()
       .effect()
       .file(VFX_TARGET_LOOP)
       //.atLocation(token)
       .attachTo(token)
       .scale(scale)
       .belowTokens()
       .opacity(VFX_TARGET_OPACITY)
       .persist()
       .name(vfxName)          // Give the effect a uniqueish name
       .fadeIn(1000)           // Fade in for specified time in milliseconds
       .fadeOut(1000)          // Fade out for specified time in milliseconds
       .play();   
   jez.log("VFX Launched")
}