const MACRONAME = "Conjure_Elemental.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Automate Conjure Elemental
 * 
 * - Build list of available summons, verifying existence of each template creature
 * - Dialog to select creature to summon
 * - Place summoned creature, including making creature "friendly" (same disposition as caster)
 * - Mod concentration to flip creature to opposite attitude on concentration break
 * - Place timer effect on summoned elemental to delete itself at end of spell duration. Dismiss_Token perhaps?
 * 
 * 07/21/22 0.1 Creation of Macro
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
const MAX_CR = args[0]?.spellLevel || 5
if (TL > 2) jez.trace("MAX_CR", MAX_CR)
let fractialCRs = [0.5, 0.25, 0.125]
// let allowedSubTypes = ["air", "earth", "fire", "water"]
let elList                                              // Elemental list array
const VFX_FILE = "Icons_JGB/Misc/Angry.gif"
const CLOCK_IMG = "Icons_JGB/Misc/alarm_clock.png"
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
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
    await jez.wait(100)
    if (TL === 1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Starting --- ${MACRO} ${FUNCNAME} ---`);
    await jez.wait(100)
    //----------------------------------------------------------------------------------------------
    // Items searched for are coded below
    //
    elList = buildElementalList(["Spiritual Weapon"])
    const ELEMENTALS = Object.keys(elList);
    let elementalArray = []
    //------------------------------------------------------------------------------------------------
    // Step down in integer CRs looking for matches at each value
    //
    for (let i = MAX_CR; i > 0; i--)
        for (let element of ELEMENTALS)
            if (i === elList[element].cr)
                elementalArray.push(`${element} (${elList[element].st})`)
    //------------------------------------------------------------------------------------------------
    // Step through fractional CRs looking for matches at each value
    //
    for (let i of fractialCRs)
        for (let element of ELEMENTALS)
            if (i === elList[element].cr)
                elementalArray.push(`${element} (${elList[element].st})`)
    //------------------------------------------------------------------------------------------------
    // Build and pop selection dialog
    //
    let title = `Select Desired Elemental to Conjure`
    msg = `Elemental must be summoned within 10 feet of a source (10-foot cube) of its elemental 
    component (air, earth, fire, or water).<br><br>
    See: </span><a style="box-sizing: border-box; user-select: text; font-size: 13px;" 
    href="https://www.dndbeyond.com/spells/conjure-elemental" target="_blank" rel="noopener">
    D&amp;D Beyond Description</a> for spell details.<br><br>
    Options listed below are all unlinked NPC Elementals in the Actor Directory.  Others are available
    at the GM's discretion.`
    jez.pickRadioListArray(title, msg, pickEleCallBack, elementalArray);
    //-----------------------------------------------------------------------------------------------
    // That's all folks
    //
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Call back function called after elemental is selected and then proceeds with execution.  
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function pickEleCallBack(selection) {
    const FUNCNAME = "pickEleCallBack(selection)";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL === 1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Starting --- ${MACRO} ${FUNCNAME} ---`, "selection", selection);
    //----------------------------------------------------------------------------------------------
    if (!selection) return false;
    const SEL_ELE = selection.split(" ")[0]
    if (TL > 2) jez.trace(`${SEL_ELE}: ${elList[SEL_ELE].name} SubType ${elList[SEL_ELE].st}  
        CR ${elList[SEL_ELE].cr}`, elList[SEL_ELE].data)
    //--------------------------------------------------------------------------------------------------
    // Set handy variables
    //
    let summons = elList[SEL_ELE].name
    let width = elList[SEL_ELE].data.data.token.width
    let summonData = elList[SEL_ELE].data
    //--------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        defaultRange: 90,                   // Defaults to 30, but this varies per spell
        duration: 1000,                     // Duration of the intro VFX
        introTime: 1000,                     // Amount of time to wait for Intro VFX
        introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
        minionName: `${aToken.name}'s ${summons}`,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        scale: 0.7,								// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        templateName: summons,
        width: width,                       // Width of token to be summoned, 1 is the default
        traceLvl: TL                        // Trace level, matching calling function decent choice
    }
    //--------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    // let summonData = await game.actors.getName(MINION)
    argObj.img = summonData ? summonData.img : aItem.img
    //--------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    let elementalId = await jez.spawnAt(summons, aToken, aActor, aItem, argObj)
    //--------------------------------------------------------------------------------------------------
    // Build a UUID that will be slapped on the concentrating effect for doOff call.  Should look like:
    //   Scene.MzEyYTVkOTQ4NmZk.Token.cBMsqVwfwf1MxRxV
    let elemementalUuid = `Scene.${game.scenes.viewed.id}.Token.${elementalId}`
    modConcentratingEffect(aToken, elemementalUuid)
    //--------------------------------------------------------------------------------------------------
    // Convert Item Card's duration into seconds, if supported units, otherwise go with 3600
    //
    let duration = 3600
    if (aItem.data.duration.units === "turn") duration = aItem.data.duration.value * 6
    if (aItem.data.duration.units === "round") duration = aItem.data.duration.value * 6
    if (aItem.data.duration.units === "minute") duration = aItem.data.duration.value * 60
    if (aItem.data.duration.units === "hour") duration = aItem.data.duration.value * 3600
    //--------------------------------------------------------------------------------------------------
    // Add an effect to our recently summoned elemental to delete itself at the end of the spell duration
    //
    const EXPIRE = ["newDay", "longRest", "shortRest"];
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
        flags: { dae: { macroRepeat: "none", specialDuration: EXPIRE } },
        changes: [
            { key: `macro.execute`, mode: jez.CUSTOM, value: `Dismiss_Tokens ${elemementalUuid}`, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: elemementalUuid, effects: [effectData] });
    //--------------------------------------------------------------------------------------------------
    // Post completion message to item card
    //
    msg = `${aToken.name} has summoned a ${summons} which will serve for the spell duration.`
    postResults(msg)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Build Object of elemenatals that are NPCs whose name doesn't start with a % and isn't excluded
 * 
 * Returned Object will have a property for each elemental that met the criteria, it will contain
 * 
 * key: String - Name of the actor with underscrores in place of spaces
 * cr: Real - Challenge Rating
 * st: String - Subtype, hopefully: air, earth, fire, or water otherwise will be forced to unknown
 * name: String - Name of the actor
 * data: Object - Actor's data object
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function buildElementalList(exclusions) {
    const FUNCNAME = "buildElementalList(exclusions)";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL === 1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`, "exclusions", exclusions);
    //-----------------------------------------------------------------------------------------------
    let elementalObj = {}
    for (const element of game.actors.contents) {
        let ed = element.data
        if (ed.type !== "npc") continue;
        let type = ed.data.details.type.value
        if (type !== "elemental") continue;
        let name = element.name
        if (name[0] === "%") continue;
        if (exclusions.includes(name)) continue;
        //-------------------------------------------------------------------------------------------
        if (TL > 3) jez.trace(`${FNAME} | ${element.name}`, element);
        if (type === "elemental" && name[0] !== "%") {
            if (!ed.token.actorLink) {
                const CR = jez.getCharLevel(element)                    // Challenge Rating
                let st = ed.data.details.type.subtype/*.toLowerCase()*/     // Sub Type
                // if (!allowedSubTypes.includes(st)) st = "unknown"
                if (!st) st = "Unknown"
                const ST = st
                if (TL > 1) jez.trace(`${FNAME} | Elemental ${name} is CR ${CR} of subtype ${ST}`)
                const KEY = name.replace(/ /g, "_");
                elementalObj[KEY] = { cr: CR, st: ST, name: name, data: element }
            }
        }
    }
    return (elementalObj)
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
        key: `macro.itemMacro`, mode: jez.CUSTOM, value:
            `${arg} "${aToken.name}"`, priority: 20
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
        <b>${game.users.current.name}</b> has lost control of elemental.`,
        title: `Control of Elemental Lost`,
        token: aToken
    })
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 1) jez.trace(`${FNAME} | --- Finished --- ${MACRONAME} ---`);
    return;
}