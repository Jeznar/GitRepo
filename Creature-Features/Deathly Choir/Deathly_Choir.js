const MACRONAME = "Deathly_Choir.0.2.js"
console.log(MACRONAME)
/*****************************************************************************************
 * Implement Rahadin's Ghostly Choir abiity.  Described as:
 * 
 *   Any creature within 10 feet that isn't protected by a mind blank spell hears in its 
 *   mind the screams of the thousands of people Rahadin has killed.
 * 
 *   As a bonus action, Rahadin can force all creatures that can hear the screams to make 
 *   a DC 16 Wisdom saving throw. Each creature takes 16 (3d10) psychic damage on a failed 
 *   save, or half as much damage on a successful one.
 * 
 * 01/23/22 0.1 Creation of Macro
 * 01/22/22 0.2 Add VFX
 * 08/05/22 0.3 Fix for breakage along the way
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
 const TAG = `${MACRO} |`
 const TL = 0;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //---------------------------------------------------------------------------------------------------
 if (TL>1) jez.trace(`=== Starting === ${MACRONAME} ===`);
 if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
 // Set Macro specific globals
 //
const DEBUG = true;
const IMMUNE_CONDITION = "Mind Blank"
let errorMsg = "";
const VFX_NAME = `${MACRO}-${aToken.id}`
//const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Marker/MusicMarker_01_Dark_Red_400x400";
//const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Butterflies/Butterflies_01_Bright_Yellow_Many_400x400.webm";
//const VFX_LOOP = "modules/JB2A_DnD5e/Library/Generic/Lightning/StaticElectricity_01_Regular_Blue_400x400.webm"
const VFX_LOOP = "modules/JB2A_DnD5e/Library/Generic/Template/Circle/TemplateMusicNoteCircle_01_Regular_Blue_800x800.webm"

const VFX_OPACITY = 1.0;
const VFX_SCALE = 0.70;

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use

if (TL>1) jez.trace(`=== Starting === ${MACRONAME} ===`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG}--- Finished ---`);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let chatMessage = await game.messages.get(args[args.length - 1].itemCardId);
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const SAVE_DC = aActor.data.data.attributes.spelldc;
    const SAVE_TYPE = "wis"
    const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to partially resisit 
                        <b>${aItem.name}</b>`;
    const DAM_TYPE = "psychic";
    const DAMAGE_DICE = `3d10`;
    let failSaves = []  // Array to contain the tokens that failed their saving throws
    let madeSaves = []  // Array to contain the tokens that made their saving throws
    let damaged = [] 
    let madeNames = ""
    let failNames = ""
    let immuneNames = ""

    //----------------------------------------------------------------------------------
    // Obtain and check range for validity.
    //
    const ALLOWED_UNITS = ["", "ft", "any"];
    const RANGE = jez.getRange(aItem, ALLOWED_UNITS) ?? 10
    //----------------------------------------------------------------------------------
    // Startup ye'ole VFX
    //
    runVFX();
    //----------------------------------------------------------------------------------
    // Get a list of in range tokens that can hear the user of this ability
    //
    let options = {
        exclude: "self",    // self, friendly, or none (self is default)
        direction: "t2o",       // t2o or o2t (Origin to Target) (t2o is default) 
        chkHear: false,         // Boolean (false is default)
        chkDeaf: true,          // Boolean (false is default)
        traceLvl: TL,           // Trace level, integer typically 0 to 5
    }
    let candidates = await jez.inRangeTargets(aToken, RANGE, options);
    if (candidates.length === 0) return jez.badNews(`No targets with ${RANGE} feet`, "i")
    if (TL>2) for (let i = 0; i < candidates.length; i++) 
        jez.trace(`${TAG} Targeting: ${candidates[i].name}`)
    //----------------------------------------------------------------------------------
    // Roll saves weeding out any immunes
    //
    let inRangeCount = candidates.length
    if (TL > 1) jez.trace(`${TAG} ${inRangeCount} Token(s) found within ${RANGE} feet`)
    msg = `Total of ${inRangeCount} target(s) within ${RANGE}ft of ${aToken.name}<br>`
    for (let i = 0; i < inRangeCount; i++) {
        let tToken = candidates[i];
        let tActor = tToken?.actor;
        // If the target has the immune condition, skip it
        if (await tActor.effects.find(ef => ef.data.label === IMMUNE_CONDITION)) {
            immuneNames += `o <b>${tToken.name}</b>`
            continue
        }
        // If the target has the Defeated condition, skip it
        if (await tActor.effects.find(ef => ef.data.label === "Defeated")) {
            immuneNames += `o <b>${tToken.name}</b>`
            continue
        }
        let save = (await tActor.rollAbilitySave(SAVE_TYPE,
            { FLAVOR, chatMessage: false, fastforward: true }));
        if (save.total < SAVE_DC) {
            failSaves.push(tToken)
            damaged.push(tToken)
            failNames += `+ <b>${tToken.name}</b> ${save.total} (${save._formula})<br>`
        } else {
            madeNames += `- <b>${tToken.name}</b> ${save.total} (${save._formula})<br>`
            damaged.push(tToken)
            madeSaves.push(tToken)
        }
    } 
    if (TL > 1) jez.trace(`${TAG} Results`,"Made Saves", madeSaves,"Failed Saves", failSaves, "Immune", immuneNames)
    //----------------------------------------------------------------------------------
    // Roll the damage Dice
    //
    let damRoll = new Roll(`${DAMAGE_DICE}`).evaluate({ async: false });
    if (TL > 1) jez.trace(`${TAG} Damage Rolled ${damRoll.total}`,damRoll)
    game.dice3d?.showForRoll(damRoll);
    //----------------------------------------------------------------------------------
    // Apply damage to those that failed saving throws
    //
    if (TL > 2) jez.trace(`${TAG} Applying damage to failed saves`)
    new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damRoll, DAM_TYPE, [], damRoll,
                                   {flavor: `Damage from ${aItem.name}`, itemCardId: args[0].itemCardId });
    let fd = damRoll.total
    MidiQOL.applyTokenDamage([{damage:fd, type:DAM_TYPE}], fd, new Set(failSaves), aItem, new Set());
    //----------------------------------------------------------------------------------
    // Apply damage to those that made saving throws
    //
    if (TL > 2) jez.trace(`${TAG} Applying damage to made saves`)
    let hd = Math.floor(damRoll.total/2)
    MidiQOL.applyTokenDamage([{damage:hd, type:DAM_TYPE}], hd, new Set(madeSaves), aItem, new Set());
    //----------------------------------------------------------------------------------
    // Add results to chat card
    //
    await jez.wait(100)
    let msg1 = "";
    if (immuneNames) {
        msg1 = `<b><u>Immune</u></b><br>${immuneNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "purple", fSize: 14, msg: msg1, tag: "saves" })
    }
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
    await jez.wait(100)
    jez.addMessage(chatMessage, { color: "darkblue", fSize: 14, msg: msg, tag: "saves" })
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}


/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Play the VFX 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function runVFX() {
    new Sequence()
        .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .duration(10000)
        .name(VFX_NAME)          // Give the effect a uniqueish name
        .fadeIn(10)            // Fade in for specified time in milliseconds
        .fadeOut(1000)           // Fade out for specified time in milliseconds
        .extraEndDuration(1200)   // Time padding on exit to connect to Outro effect
        .play()
}