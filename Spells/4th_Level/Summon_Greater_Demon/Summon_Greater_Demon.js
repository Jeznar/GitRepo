const MACRONAME = "Summon_Greater_Demon.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Automate Summon Greater Demon, based directly on Conjure_Elemental.0.1.js
 * 
 * - Build list of available summons, verifying existence of each template creature
 * - Dialog to select creature to summon
 * - Place summoned creature, including making creature "friendly" (same disposition as caster)
 * - Mod concentration to flip creature to opposite attitude on concentration break
 * - Place timer effect on summoned demon to delete itself at end of spell duration. Dismiss_Token perhaps?
 * 
 * 07/21/22 0.1 Creation of Macro
 * 11/16/22 0.2 Fix dialog text and add summoned demon to the combat tracker
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
// Set Macro specific globals
//
const SPELL_LVL = args[0]?.spellLevel || 4
const MAX_CR = SPELL_LVL + 1
if (TL > 2) jez.trace("MAX_CR", MAX_CR)
let fractialCRs = [0.5, 0.25, 0.125]
let demonList                                               // Summon candidates list array
let trueNameObj                                             // Object containing demon:trueName pairs
const FLAG_BASE = "Demon_True_Name"
const VFX_FILE = "Icons_JGB/Misc/Angry.gif"
const CLOCK_IMG = "Icons_JGB/Misc/alarm_clock.png"
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE everyround
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
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
    const TAG = `${MACRO} ${FNAME} |`
    await jez.wait(100)
    if (TL === 1) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FUNCNAME} ---`);
    await jez.wait(100)
    //----------------------------------------------------------------------------------------------
    // Items searched for are coded below
    //
    demonList = buildDemonList(["Spiritual Weapon"])
    if (TL > 1) jez.trace(`${TAG} demonList`,demonList);
    const DEMONS = Object.keys(demonList);
    if (TL > 1) jez.trace(`${TAG} DEMONS`,DEMONS);
    let demonArray = []
    //------------------------------------------------------------------------------------------------
    // Step down in integer CRs looking for matches at each value
    //
    for (let i = MAX_CR; i > 0; i--)
        for (let demon of DEMONS)
            if (i === demonList[demon].cr)
                demonArray.push(`${demon}`)
    //------------------------------------------------------------------------------------------------
    // Step through fractional CRs looking for matches at each value
    //
    for (let i of fractialCRs)
        for (let demon of DEMONS)
            if (i === demonList[demon].cr)
                demonArray.push(`${demon}`)
    if (TL > 1) jez.trace(`${TAG} demonArray`,demonArray);
    //------------------------------------------------------------------------------------------------
    // Build and pop selection dialog
    //
    let title = `Select Desired Demon to Summon`
    msg = `See: </span><a style="box-sizing: border-box; user-select: text; font-size: 13px;" 
    href="https://www.dndbeyond.com/spells/summon-greater-demon" target="_blank" rel="noopener">
    D&amp;D Beyond Description</a> for spell details.<br><br>
    Options listed below are all unlinked NPC Demons in the Actor Directory.  Others are available
    at the GM's discretion.`
    jez.pickRadioListArray(title, msg, pickDemonCallBack, demonArray);
    //-----------------------------------------------------------------------------------------------
    // That's all folks
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Call back function called after demon is selected and then proceeds with execution.  
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function pickDemonCallBack(selection) {
    const FUNCNAME = "pickDemonCallBack(selection)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FUNCNAME} ---`, "selection", selection);
    //----------------------------------------------------------------------------------------------
    if (!selection) return false;
    const SEL_DEMON = selection.split(" ")[0]
    if (TL > 2) jez.trace(`${SEL_DEMON}: ${demonList[SEL_DEMON].name} SubType ${demonList[SEL_DEMON].st}  
        CR ${demonList[SEL_DEMON].cr}`, demonList[SEL_DEMON].data)
    //--------------------------------------------------------------------------------------------------
    // Obtain the true name of demons object 
    //
    let trueName = await DAE.getFlag(aToken.actor, `${FLAG_BASE}_${selection}`);
    let demonType = selection.replace(/ /g, "_");   // Replace spaces in selection with underscores
    if (TL > 3) jez.trace(`${TAG} demonType`, demonType)
    if (!trueName) trueName= ""                         // Swap any falsey value to empty string
    if (TL > 2) jez.trace(`${TAG} trueName "${trueName}"`)
    //--------------------------------------------------------------------------------------------------
    // Pop a dialog to solicit new name input or to confirm name provided earlier and call next callback
    //
    let template = `<div><label>Do you know the true name of the ${selection}? If so enter the name in 
                    the box below, then press the "Known" button; otherwise, click "Unknown"</label>
                <div class="form-group" style="font-size: 14px; padding: 5px; 
                    border: 2px solid silver; margin: 5px;">
                    <input name="TEXT_SUPPLIED" style="width:350px" value=${trueName}></div>`
    let d = await new Dialog({
        title: `Set ${aToken.name}'s Familiar's Name`,
        content: template,
        buttons: {
            done: {
                label: "Known",
                callback: (html) => {
                    summonDemon(html, "Known", SEL_DEMON, demonType);
                }
            },
            cancel: {
                label: "Unknown",
                callback: (html) => {
                    summonDemon(html, "Unknown", SEL_DEMON, demonType);
                }
            }
        },
        default: "done"
    })
    d.render(true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Call back function called after demon name (if any) selected and then proceeds with execution.  
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function summonDemon(html, mode, SEL_DEMON, demonType) {
    const FUNCNAME = "summonDemon(html, name)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`, "html", html, "mode", mode,
        "SEL_DEMON", SEL_DEMON, "demonType", demonType);
    console.log("demonType", demonType)
    //-----------------------------------------------------------------------------------------------
    // Set handy variables
    //
    const SAVE_DC = aActor.data.data.attributes.spelldc;
    let summons = demonList[SEL_DEMON].name
    let width = demonList[SEL_DEMON].data.data.token.width
    let summonData = demonList[SEL_DEMON].data
    if (TL > 3) jez.trace(`${TAG} Variable values`,"summons",summons,"width",width,
        "summonData",summonData)
    //----------------------------------------------------------------------------------------------
    // Grab the RunAsGM Macros
    //
    const GM_TOGGLE_COMBAT = jez.getMacroRunAsGM("ToggleCombatAsGM")
    if (!GM_TOGGLE_COMBAT) { return false }
    const GM_ROLL_INITIATIVE = jez.getMacroRunAsGM("RollInitiativeAsGM")
    if (!GM_ROLL_INITIATIVE) { return false }
    //-----------------------------------------------------------------------------------------------
    const TEXT_SUPPLIED = html.find("[name=TEXT_SUPPLIED]")[0].value;
    if (TL > 1) jez.trace(`${TAG} Name supplied: "${TEXT_SUPPLIED}"`)
    let demonName = `${aToken.name}'s ${summons}`
    if (TEXT_SUPPLIED) demonName = TEXT_SUPPLIED
    //-----------------------------------------------------------------------------------------------
    // If we have a Known demon, stash the value as a flag for future useage 
    //
    if (mode === "Known") await DAE.setFlag(aActor, `${FLAG_BASE}_${SEL_DEMON}`, demonName);
    //----------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        defaultRange: 90,                   // Defaults to 30, but this varies per spell
        duration: 1000,                     // Duration of the intro VFX
        introTime: 1000,                     // Amount of time to wait for Intro VFX
        introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
        minionName: demonName,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        scale: 0.7,								// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        templateName: summons,
        width: width,                       // Width of token to be summoned, 1 is the default
        traceLvl: TL                        // Trace level, matching calling function decent choice
    }
    //----------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use
    // it to update the img attribute or set basic image to match this item
    //
    argObj.img = summonData ? summonData.img : aItem.img
    //--------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    let demonId = await jez.spawnAt(summons, aToken, aActor, aItem, argObj)
    if (TL > 2) jez.trace(`${TAG} demon Id ==>`,demonId)
    //--------------------------------------------------------------------------------------------------
    // Build a UUID that will be slapped on the concentrating effect for doOff call.  Should look like:
    //   Scene.MzEyYTVkOTQ4NmZk.Token.cBMsqVwfwf1MxRxV
    let demonUuid = `Scene.${game.scenes.viewed.id}.Token.${demonId}`
    if (TL > 2) jez.trace(`${TAG} demonUuid ==>`,demonUuid)
    modConcentratingEffect(aToken, demonUuid)
    //--------------------------------------------------------------------------------------------------
    // Convert Item Card's duration into seconds, if supported units, otherwise go with 3600
    //
    let duration = 3600
    if (aItem.data.duration.units === "turn") duration = aItem.data.duration.value * 6
    if (aItem.data.duration.units === "round") duration = aItem.data.duration.value * 6
    if (aItem.data.duration.units === "minute") duration = aItem.data.duration.value * 60
    if (aItem.data.duration.units === "hour") duration = aItem.data.duration.value * 3600
    //--------------------------------------------------------------------------------------------------
    // Add an effect to our recently summoned demon to delete itself at the end of the spell duration
    //
    console.log(`TODO: Do something to leverage the true name being known, or not known`)
    const CE_DESC = `Summoned ${summons} will remain for up to an hour`
    const EXPIRE = ["newDay", "longRest", "shortRest"];
    const VALUE = `"${aToken.name}" ${SAVE_DC} ${mode}`
    const GAME_RND = game.combat ? game.combat.round : 0;
    let effectData = {
        label: aItem.name,
        icon: CLOCK_IMG,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: {
            rounds: duration / 6, startRound: GAME_RND,
            seconds: duration, startTime: game.time.worldTime,
            token: aToken.uuid, stackable: false
        },
        flags: { 
            dae: { macroRepeat: "endEveryTurn", specialDuration: EXPIRE }, 
            convenientDescription: CE_DESC 
        },
        changes: [
            { key: `macro.execute`, mode: jez.CUSTOM, value: `Dismiss_Tokens ${demonUuid}`, priority: 20 },
            { key: `macro.itemMacro`, mode: jez.OVERRIDE, value: VALUE, priority: 20 }
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: demonUuid, effects: [effectData] });
    //--------------------------------------------------------------------------------------------------
    // Add the newly summoned demon to the combat tracker and roll initiative
    //
    if (TL > 1) jez.trace(`${TAG} Id of the summoned elemental token`, demonId)
    let dToken = await canvas.tokens.placeables.find(ef => ef.id === demonId[0])
    if (TL > 2) jez.trace(`${TAG} demon Info`,
        `demonId    ==>`, demonId,
        `dToken ==>`, dToken)
    // await dToken.toggleCombat();    
    await GM_TOGGLE_COMBAT.execute(dToken.document.uuid)
    await jez.wait(100)
    /**
     * Roll initiative for one or multiple Combatants within the Combat document
     * @param {string|string[]} ids     A Combatant id or Array of ids for which to roll
     * @param {object} [options={}]     Additional options which modify how initiative rolls are created or presented.
     * @param {string|null} [options.formula]         A non-default initiative formula to roll. Otherwise the system default is used.
     * @param {boolean} [options.updateTurn=true]     Update the Combat turn after adding new initiative scores to keep the turn on the same Combatant.
     * @param {object} [options.messageOptions={}]    Additional options with which to customize created Chat Messages
     * @return {Promise<Combat>}        A promise which resolves to the updated Combat document once updates are complete.
     * 
     * async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={})
     **/
    //  let combatDoc = await game.combat.rollInitiative(dToken.combatant.id, {formula: null, updateTurn: true, 
    //     messageOptions: { rollMode: CONST.DICE_ROLL_MODES.PRIVATE }})
    // if (TL > 2) jez.trace(`${TAG} combatDoc ==>`,combatDoc)
    await GM_ROLL_INITIATIVE.execute(dToken.combatant.id)
    //--------------------------------------------------------------------------------------------------
    // Post completion message to item card
    //
    msg = `${aToken.name} has summoned a ${summons} which will serve for the spell duration.`
    postResults(msg)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Build Object of demons that are NPCs whose name doesn't start with a % and isn't excluded
 * 
 * Returned Object will have a property for each demon that met the criteria, it will contain
 * 
 * key: String - Name of the actor with underscrores in place of spaces
 * cr: Real - Challenge Rating
 * ty: String - Must be fiend
 * st: String - Must be demon (case insensitive)
 * name: String - Name of the actor
 * data: Object - Actor's data object
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function buildDemonList(exclusions) {
    const FUNCNAME = "buildDemonList(exclusions)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`, "exclusions", exclusions);
    //-----------------------------------------------------------------------------------------------
    let demonObj = {}
    for (const demon of game.actors.contents) {
        let ed = demon.data
        if (ed.type !== "npc") continue;
        let type = ed.data.details.type.value
        if (type !== "fiend") continue;
        let name = demon.name
        if (name[0] === "%") continue;
        if (exclusions.includes(name)) continue;
        let subtype = ed.data.details.type.subtype.toLowerCase()
        if (subtype !== "demon") continue;
        //-------------------------------------------------------------------------------------------
        if (TL > 3) jez.trace(`${TAG} ${demon.name}`, demon);
        if (!ed.token.actorLink) {
            const CR = jez.getCharLevel(demon)                          // Challenge Rating
            let st = ed.data.details.type.subtype/*.toLowerCase()*/     // Sub Type
            // if (!allowedSubTypes.includes(st)) st = "unknown"
            if (!st) st = "Unknown"
            const ST = st
            if (TL > 1) jez.trace(`${TAG} Demon ${name} is CR ${CR} of subtype ${ST}`)
            const KEY = name.replace(/ /g, "_");
            demonObj[KEY] = { cr: CR, st: ST, name: name, data: demon }
        }
    }
    return (demonObj)
}
/***************************************************************************************************
 * Modify existing concentration effect to call this macro as an ItemMacro that can use doOff
 * function can be used to clean accumulated effects.  
 ***************************************************************************************************/
async function modConcentratingEffect(token5e, arg) {
    const EFFECT = "Concentrating"
    //----------------------------------------------------------------------------------------------
    // Seach the token to find the just added concentrating effect
    //
    await jez.wait(100)
    let effect = await token5e.actor.effects.find(i => i.data.label === EFFECT);
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect. 
    //    
    effect.data.changes.push({
        key: `macro.itemMacro`, mode: jez.CUSTOM, value:`${arg} "${aToken.name}"`, priority: 20
    })
    //----------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result && TL > 1) jez.trace(`${MACRO} | Active Effect ${EFFECT} updated!`, result);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * Typical Parms: Scene.MzEyYTVkOTQ4NmZk.Token.RjB0uStEVMzKDwUE "Lizzie McWizardress"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff() {
    const FUNCNAME = "doOff()";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    let uuid = args[1]
    let summoner = args[2]
    let aTokenDocument5e = await fromUuid(uuid)     // Retrieves document for the UUID
    if (!aTokenDocument5e) return
    let aToken = aTokenDocument5e._object           // Nabs the Token5e out of a aTokenDocument5e
    //-----------------------------------------------------------------------------------------------
    // Build New Name
    //
    let uncontrolledName = aToken.name.replace(`${summoner}'s`, 'Uncontrolled')
    //-----------------------------------------------------------------------------------------------
    // Display the permissions set in the game for this token.
    //
    // if (TL > 1) for (let property in aToken.actor.data.permission) 
    //     if (property !== "default") jez.trace(`${FNAME} | Permission for ${property}`, 
    //         aToken.actor.data.permission[property])
    //-----------------------------------------------------------------------------------------------
    // Define the updates to be defined, rename, default to 0 (no access), flip disposition 
    //
    let updates = {
        actor: {
            permission: {
                default: 0,
            }
        },
        token: {
            name: uncontrolledName,
            disposition: aToken.data.disposition * -1,
        },
    }
    //-----------------------------------------------------------------------------------------------
    // Force any player access defined for the token to 0.  This should find only the one match 
    // created earlier by warpgate.
    //
    for (let pId in aToken.actor.data.permission) {
        if (pId === "default") continue         // don't mess with the permissions for default
        let playerData = game.users.get(pId)    // Stash player data object
        if (TL > 0) jez.trace(`${FNAME} | playerData for ${pId}`,playerData)
        if (playerData.isGM) continue           // don't mess with the permissions for GM
        msg = `Set permission for ${playerData.name} to 0 from ${aToken.actor.data.permission[pId]}`
        if (TL > 0) jez.trace(`${FNAME} | ${msg}`)
        updates.actor.permission[pId] = 0       // Set player to no permissions
    }
    //-----------------------------------------------------------------------------------------------
    // Display the permissions set in the game for this token.
    //
    await warpgate.mutate(aToken.document, updates);
    //-----------------------------------------------------------------------------------------------
    // Run simple video on the token with the attitude change
    //
    new Sequence()
        .effect()
        .file(VFX_FILE)
        .atLocation(aToken)
        .center()
        .scale(.2)
        .opacity(1)
        .fadeIn(1500)
        .duration(5000)
        .fadeOut(1500)
        .play()
    //-----------------------------------------------------------------------------------------------
    // Display message about released token
    //
    game.users.current.name
    jez.postMessage({
        color: "dodgerblue",
        fSize: 14,
        icon: aToken.data.img,
        msg: `${aToken.name} may well want vengence upon ${summoner}.<br><br>
        <b>${game.users.current.name}</b> has lost control of demon.`,
        title: `Control of Demon Lost`,
        token: aToken
    })
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 1) jez.trace(`${FNAME} | --- Finished --- ${MACRONAME} ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doEach() {
    const FUNCNAME = "doEach()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>0) jez.trace(`${TAG} --- Starting ---`);
    //-----------------------------------------------------------------------------------------------
    // Stash the Arguments into reasonably named constants
    //
    const ORIGIN_NAME = args[1]
    const SAVE_DC = args[2]
    const MODE = args[3]
    if (!ORIGIN_NAME || !SAVE_DC || !MODE) return jez.badNews(`${TAG} Unhappy Args received`,"e")
    //-----------------------------------------------------------------------------------------------
    // We need to roll a save
    //
    if (TL>1) jez.trace(`${TAG} Save vs spell from ${ORIGIN_NAME} DC${SAVE_DC}DC ${MODE} true name`)
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL>3) jez.trace(`${TAG} More Detailed Trace Info.`)

    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}