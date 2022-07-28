const MACRONAME = "Stunning_Screech.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Stunning Screech (1/Day). The vrock emits a horrific screech. Each creature within 20 feet of it 
 * that can hear it and that isn't a demon must succeed on a DC 14 Constitution saving throw or be 
 * stunned until the end of the vrock's next turn.
 * 
 * Flow of this macro (all of this within a doOuse function):
 * - Obtain the range of the effect from the item card, defaulting to 25 to allow for the size of the 
 *   token.
 * - Play a VFX on the area affected
 * - Obtain a list of all the tokens that are in range, have an unobstructed Line of Sound, and do 
 *   not have the deafened condition on them.
 * - Prune out tokens that represent demons based on race (PC) and subtype (NPC)
 * - Quietly roll saving throws for potential victims keeping lists of successes and failures
 * - If any actor failed, build a Stunned condition that will be applied 
 * - Apply Stunned condition built in previous step to all those that failed saving throws
 * = Post a summary message of the effects
 * 
 * 07/28/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
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
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
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

    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} | `
    await jez.wait(100)
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${MACRONAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Obtain the range of the effect from the item card, adding padding based on the size of the 
    // token
    //
    const RANGE = getRangeOfSpell({ traceLvl: TL });
    //-----------------------------------------------------------------------------------------------
    // Play a VFX on the area affected
    //
    runVFX(2.00)
    //-----------------------------------------------------------------------------------------------
    // Obtain a list of all the tokens that are in range, have an unobstructed Line of Sound, and do 
    // not have the deafened condition on them.
    //
    if (TL > 2) console.log("");
    if (TL > 2) jez.trace(`${TAG} Obtain a list of all the tokens that are in range...`);
    let options = {
        direction: "t2o",       // t2o or o2t (Origin to Target) (t2o is default) 
        chkHear: true,         // Boolean (false is default)
        chkDeaf: true,          // Boolean (false is default)
        traceLvl: TL,           // Trace level, integer typically 0 to 5
    }
    let inRangeTokens = await jez.inRangeTargets(aToken, RANGE, options);
    if (inRangeTokens.length === 0) return jez.badNews(`No effectable targets in range`, "i")
    if (TL > 1) for (let i = 0; i < inRangeTokens.length; i++)
        jez.trace(`${FNAME} | ${i + 1}) Target: ${inRangeTokens[i].name}`)
    //-----------------------------------------------------------------------------------------------
    // Prune out tokens that represent demons based on race (PC) and subtype (NPC).  This needs to be
    // done differently for PC and NPC type tokens.
    //
    // In both cases, we are obtaining a text field that allows an unrestrcited string.  We're going 
    // to assume that if it contains the word "demon" then the token represents a demon. 
    //  PC -- Extraxt the race field, fold to lower case, and hope it was done usefully
    //  NPC - Extract the subtype field, fold to lower case and hope...
    //
    if (TL > 2) console.log("");
    if (TL > 2) jez.trace(`${TAG} We have ${inRangeTokens.length} potential victims`);
    for (let i = 0; i < inRangeTokens.length; i++) {    // Process each targetable token 
        let subject = inRangeTokens[i].actor
        if (TL > 3) jez.trace(`${TAG} Checking ${subject.name} for demon type`, subject);
        let isNPC, targetType;
        if (subject.data.type === "npc") isNPC = true; else isNPC = false;
        if (TL > 3) jez.trace(`${TAG} ${subject.name} is NPC?`, isNPC);
        if (isNPC) targetType = subject.data.data.details.type.subtype.toLowerCase()
        else targetType = subject.data.data.details.race.toLowerCase()
        if (TL > 3) jez.trace(`${TAG} ${subject.name} target type`, targetType);
        let words = targetType.split(/[^a-zA-Z0-9]+/)   // Parse data field into alphanumeric words
        if (TL > 2) jez.trace(`${TAG} Words found in targetType field`, words);
        for (let j = 0; j < words.length; j++) {        // Loop through the words 
            if ("demon" === words[j].toLowerCase()) {   // Looking for the magic "demon" string 
                if (TL > 2) jez.trace(`${TAG} Removing ${subject.name} from targets`, inRangeTokens[i]);
                inRangeTokens.splice(i, 1);             // Remove the demon from target array
            }
        }
    }
    if (TL > 2) jez.trace(`${TAG} ${inRangeTokens.length} remaining viable target(s)`, inRangeTokens);
    //-----------------------------------------------------------------------------------------------
    // Quietly roll saving throws for potential victims keeping lists of successes and failures
    //
    let failSaves = []  // Array to contain the tokens that failed their saving throws
    let madeSaves = []  // Array to contain the tokens that made their saving throws
    let madeNames = ""  // String with concatination of names that made saves
    let failNames = ""  // String with concatination of names that fail saves
    const SAVE_TYPE = "con"
    const SAVE_DC = aActor.data.data.attributes.spelldc;
    if (TL > 2) console.log("");
    if (TL > 2) jez.trace(`${TAG} Quietly roll ${inRangeTokens.length} saving throws...`);
    if (TL > 3) jez.trace(`${TAG} inRangeTokens`, inRangeTokens);
    for (let i = 0; i < inRangeTokens.length; i++) {
        const TARGET = inRangeTokens[i]
        let save = (await TARGET.actor.rollAbilitySave(SAVE_TYPE,
            { chatMessage: false, fastforward: true }));
        const ROLL = save.total
        if (ROLL < SAVE_DC) {
            if (TL > 2) jez.trace(`${TAG} ${TARGET.name} failed: ${SAVE_TYPE}${ROLL} vs ${SAVE_DC}`)
            failSaves.push(TARGET)
            failNames += `<b>${TARGET.name}</b>: ${ROLL} (${save._formula})<br>`
        } else {
            if (TL > 2) jez.trace(`${TAG} ${TARGET.name} saved: ${SAVE_TYPE}${ROLL} vs ${SAVE_DC}`)
            madeSaves.push(TARGET)
            madeNames += `<b>${TARGET.name}</b>: ${ROLL} (${save._formula})<br>`
        }
    }
    if (TL > 3) jez.trace(`${FNAME} | Failed Saves ===>`, failSaves)
    //-----------------------------------------------------------------------------------------------
    // If any actor failed, build a Stunned condition that will be appled 
    //
    let eData
    if (failSaves.length > 0) { // Define new condition to apply from existing CE Stunned
        const COND_APPLIED = "Stunned"
        if (TL > 2) console.log("");
        if (TL > 2) jez.trace(`${TAG} Build a ${COND_APPLIED} effect`);
        const SPECDUR = "turnEndSource"
        const CE_DESC = "Fail DEX and STR saves, grant advantage, can't move, and incapacitated"
        ceData = game.dfreds.effectInterface.findEffectByName(COND_APPLIED).convertToObject();
        if (TL > 3) jez.trace(`${FNAME} | ceData >`, ceData)
        let specialDuration = [SPECDUR, "newDay", "longRest", "shortRest"]
        eData = [{
            label: ceData.label,    // `Stunned`,
            icon: ceData.icon,      // `Icons_JGB/Conditions/Stun_Icon.png`,
            origin: LAST_ARG.uuid,
            disabled: false,
            duration: ceData.duration ?? { seconds: 60, startTime: game.time.worldTime },
            flags: {
                dae: {
                    itemData: aItem,
                    specialDuration: specialDuration
                },
                core: { statusId: ceData.statusId ?? "Convenient Effect: Stunned" },
                isConvenient: ceData.isConvenient ?? true,
                isCustomConvenient: ceData.isCustomConvenient ?? true,
                convenientDescription: ceData.convenientDescription ?? CE_DESC
            },
            changes: ceData.changes,
        }];
        if (TL > 3) jez.trace(`${FNAME} | updated ===>`, eData)
    }
    //-------------------------------------------------------------------------------------------------------------
    // Apply Stunned condition built in previous step to all those that failed saving throws
    //   
    for (let i = 0; i < failSaves.length; i++) {
        if (TL > 1) jez.trace(`${TAG} Adding Stunned to ${failSaves[i].name}`, "DataObj", failSaves[i], "eData", eData)
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: failSaves[i].actor.uuid, effects: eData });
    }
    //-----------------------------------------------------------------------------------------------
    // Post a summary message of the effects
    //
    let chatMessage = await game.messages.get(args[args.length - 1].itemCardId);
    await jez.wait(100)
    if (madeNames) {
        msg = `<b><u>Successful ${SAVE_TYPE.toUpperCase()} Save</u></b> vs DC${SAVE_DC}<br>${madeNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkgreen", fSize: 14, msg: msg, tag: "damage" })
    }
    if (failNames) {
        msg = `<b><u>Failed ${SAVE_TYPE.toUpperCase()} Save</u></b> vs DC${SAVE_DC}<br>${failNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkred", fSize: 14, msg: msg, tag: "damage" })
    }
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    await jez.wait(100)
    if (TL > 3) jez.trace(`${FNAME} | More Detailed Trace Info.`)
    msg = `Those that failed saves are stunned until the end of <b>${aToken.name}'s</b> next turn.`
    postResults(msg)
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Get the range of spell adding half of the width of the using token as additional range so that it
 * represents the distance from creatur's edge, not distance from creatures center.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function getRangeOfSpell(optionObj = {}) {
    const FUNCNAME = " getRangeOfSpell(optionObj = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} | `
    const TL = optionObj?.traceLvl ?? 0
    if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Proceed with function's task
    //
    const ALLOWED_UNITS = ["", "ft", "any"];
    let maxRangeObtained = jez.getRange(aItem, ALLOWED_UNITS) ?? 20; // Default range is 20 feet
    const SCALE = 5; // Feet per square on tactical scenes
    const GRID_SIZE = game.scenes.viewed.data.grid; // Pixel width of a square in the scene
    const TOKEN_WIDTH = aToken.w ?? 70;             // Pixel width of the token
    const HALF_WIDTH = Math.trunc(TOKEN_WIDTH / 2); // Half the pixel width
    const PADDING = HALF_WIDTH / GRID_SIZE * SCALE; // Additional feet to add to range
    maxRange = maxRangeObtained + PADDING;
    if (TL > 2) jez.trace(`${TAG} Values found and calculated`, "maxRange obtained", maxRangeObtained,
        "SCALE", SCALE, "GRID_SIZE", GRID_SIZE, "TOKEN_WIDTH", TOKEN_WIDTH, "HALF_WIDTH", HALF_WIDTH,
        "PADDING", PADDING, "maxRange returned", maxRange)
    return maxRange
}
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
async function runVFX(VFX_SCALE) {
    const VFX_NAME = `${MACRO}-${aToken.id}`
    const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Template/Circle/Vortex_01_Regular_Blue_600x600.webm"
    const VFX_INTRO = "modules/jb2a_patreon/Library/Generic/Template/Circle/VortexIntro_01_Regular_Blue_600x600.webm"
    const VFX_OUTRO = "modules/jb2a_patreon/Library/Generic/Template/Circle/VortexOutro_01_Regular_Blue_600x600.webm"
    const VFX_OPACITY = 0.8;
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