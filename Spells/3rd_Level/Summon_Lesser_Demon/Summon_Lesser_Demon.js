const MACRONAME = "Summon_Lesser_Demon.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Automate Summon Lesser Demon, based directly on Summon_Greater_Demon.0.1.js. Key things that this
 * macro accomplishes:
 *
 * 1. Roll a d6 to determine the CR & Qty of demon to summon
 * 2. Build list of available summons (scan sidebar), verifying existence of each
 * 3. Dialog to select a specific creature to summon
 * 4. Place summoned creatures, including making creature "hostile" (use warpgate)
 * 5. Mod concentration to run ItemMacro doEach with a list of summoned tokens.
 *   5a. doEach: loop through summons, despawn any defeated, drop conc if none remain active
 *   5b. doOff: despawn any remaining demons
 *
 * 11/17/22 0.1 Creation of Macro from Summon_Greater_Demon.0.1.js
 * 11/19/22 0.2 Replace direct calls with jez.lib calls: jez.combatAddRemove & jez.combatInitiative
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
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
const SPELL_LVL = args[0]?.spellLevel || 3
let fractialCRs = [0.5, 0.25, 0.125]
let demonList                                               // Summon candidates list array
let trueNameObj                                             // Object containing demon:trueName pairs
let demonArray = []                                         // Global array of demons
let demonCnt, demonCR
const TILE_FLAG = `${MACRONAME}-TileId`
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "each") doEach({ traceLvl: 0 });					    // DAE everyround
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    await jez.wait(100)
    if (TL === 1) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FUNCNAME} ---`);
    //--------------------------------------------------------------------------------------------//
    // 0. Ask player if they want to drop a protective tile with a simple dialog                  //
    //--------------------------------------------------------------------------------------------//
    const Q_TITLE = `Create Protective Circle`
    const Q_TEXT = `Does ${aToken.name} want to create a warding circle from the blood component?  
    While the spell lasts, the summoned demons can't cross the circle or harm it, and they can't 
    target anyone within it. Using the material component in this manner consumes it when the 
    spell ends.<br><br>
    Select Yes, to create the protective circle.<br><br>`
    const MAKE_CICRLE = await Dialog.confirm({ title: Q_TITLE, content: Q_TEXT, });
    if (TL > 1) jez.trace(`${TAG} Does ${aToken.name} wish to make a circle?`, MAKE_CICRLE)
    //----------------------------------------------------------------------------------------------
    // If a tile is desired, render it.
    // First, build the data object for the tile to be created
    //
    if (MAKE_CICRLE) {
        const GRID_SIZE = canvas.scene.data.grid;   // Stash the grid size
        const SCALER = 1.5
        const X = aToken.center.x - GRID_SIZE * 3 / 4
        const Y = aToken.center.y - GRID_SIZE * 3 / 4
        const COLOR_ARRAY = ["Green", "Blue", "Red"]
        const COLOR_INDEX = Math.floor(Math.random() * 3);
        if (TL > 2) jez.trace(`${TAG} Setting up to place tile`,
            "GRID_SIZE      ==>", GRID_SIZE,
            "SCALER         ==>", SCALER,
            "aToken.center.x==>", aToken.center.x,
            "X              ==>", X,
            "aToken.center.y==>", aToken.center.y,
            "Y              ==>", Y,
            "COLOR_ARRAY    ==>", COLOR_ARRAY,
            "COLOR_INDEX    ==>", COLOR_INDEX)
        let tileProps = {
            x: X,                           // X coordinate is center of the template
            y: Y,                           // Y coordinate is center of the template
            img: `modules/jb2a_patreon/Library/Generic/Magic_Signs/Abjuration_01_${COLOR_ARRAY[COLOR_INDEX]}_Circle_800x800.webm`,
            width: GRID_SIZE * SCALER,      // VFX should occupy 1.2 or so tiles
            height: GRID_SIZE * SCALER,     // ditto
            alpha: 0.9                      // Opacity of our placed tile 0 to 1.0  
        };
        //-----------------------------------------------------------------------------------------------
        // Call library function to create the new tile, catching the id returned.  This replaces a bunch 
        // of code including jez.createEmbeddedDocs("Tile", [tileProps])
        //
        let tileId = await jez.tileCreate(tileProps)
        if (TL > 2) jez.trace(`${TAG} Tile Data`,
            "tileId    ==>", tileId,
            "tileProps ==>", tileProps)
        //-----------------------------------------------------------------------------------------------
        // Stash that tileId as a DAE flag for later use to delete the tile on concentation drop
        //
        // await DAE.unsetFlag(aToken.actor, TILE_FLAG);
        await DAE.setFlag(aToken.actor, TILE_FLAG, tileId);
    }
    //--------------------------------------------------------------------------------------------//
    // 1. Roll a d6 to determine the CR & Qty of demon to summon                                  //
    //--------------------------------------------------------------------------------------------//
    let rollObj = new Roll(`1d6`).evaluate({ async: false });
    await game.dice3d?.showForRoll(rollObj);
    if (TL > 1) jez.trace(`${TAG} d6 Roll to pick category of demon`, rollObj.total);
    // switch (rollObj.total) {
        switch (1) {
        case 1:
        case 2: demonCnt = 2; demonCR = 1; break
        case 3:
        case 4: demonCnt = 4; demonCR = 0.5; break
        case 5:
        case 6: demonCnt = 8; demonCR = 0.25; fractialCRs = [0.25, 0.125]; break
        default: return jez.badNews(`The d6 seems to have rolled an illegal result`, rollObj)
    }
    const MAX_CR = demonCR  // Setting variable used in Greater Demon for compatibility
    //----------------------------------------------------------------------------------------------
    // If spell was upcast to level 6 or 7, 2x the count, 7 or 8 3x the count
    //
    if (SPELL_LVL === 6 || SPELL_LVL === 7) demonCnt *= 2
    if (SPELL_LVL === 8 || SPELL_LVL === 9) demonCnt *= 3
    //----------------------------------------------------------------------------------------------
    // Maybe print out values so far
    //
    if (TL > 2) jez.trace(`${TAG} Demon Quantity Determined!`,
        "SPELL_LVL ==>", SPELL_LVL,
        "d6 Rolled ==>", rollObj.total,
        "demonCnt  ==>", demonCnt,
        "demonCR   ==>", demonCR,
        "MAX_CR    ==>", MAX_CR,
        "fractialCRs=>", fractialCRs)
    //--------------------------------------------------------------------------------------------//
    // 2. Build list of available summons (scan sidebar), verifying existence of each             //
    //--------------------------------------------------------------------------------------------//
    demonList = buildDemonList(["Spiritual Weapon"], { traceLvl: 0 }) // Arg array is exclusions
    if (TL > 2) jez.trace(`${TAG} demonList`, demonList);
    const DEMONS = Object.keys(demonList);
    if (TL > 2) jez.trace(`${TAG} DEMONS`, DEMONS);
    //------------------------------------------------------------------------------------------------
    // Step down in integer CRs looking for matches at each value
    //
    for (let i = MAX_CR; i >= 1; i--) {
        for (let demon of DEMONS)
            if (i === demonList[demon].cr)
                demonArray.push(`${demon}`)
        if (TL > 3) jez.trace(`${TAG} Found ${demonArray.length} Demons, checking integer CR ${i}!`,
            "demonArray ==>", demonArray);
    }
    //------------------------------------------------------------------------------------------------
    // Step through fractional CRs looking for matches at each value
    //
    for (let i of fractialCRs) {
        for (let demon of DEMONS)
            if (i === demonList[demon].cr) {
                demonArray.push(`${demon}`)
                if (TL > 3) jez.trace(`${TAG} Found ${demonArray.length} Demons, checking CR ${i}!`,
                    "demonArray ==>", demonArray);
            }
    }
    if (TL > 2) jez.trace(`${TAG} Found ${demonArray.length} Demons!`,
        "demonArray ==>", demonArray);
    //--------------------------------------------------------------------------------------------//
    // 3. Dialog to select a specific creature to summon                                          //
    //--------------------------------------------------------------------------------------------//
    await callRadioDialog(demonArray)
    //---------------------------------------------------------------------------------------------
    // That's all folks
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Call Radio list array dialog (seperate function so it can be called by callback)
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function callRadioDialog(demonArray) {
    const ALLOWED_UNITS = ["", "ft", "any"];
    let maxRange = jez.getRange(aItem, ALLOWED_UNITS) ?? 60
    let title = `Select Desired Demon to Summon`
    msg = `Up to ${demonCnt} Demons of up to CR ${demonCR} may be summoned within ${maxRange} feet
    of ${aToken.name}.<br><br>
    See: </span><a style="box-sizing: border-box; user-select: text; font-size: 13px;"
    href="https://www.dndbeyond.com/spells/summon-lesser-demon" target="_blank" rel="noopener">
    D&amp;D Beyond Description</a> for spell details.<br><br>
    Options listed below are all unlinked NPC Demons in the Actor Directory.  Others are available
    at the GM's discretion.`
    jez.pickRadioListArray(title, msg, pickDemonCallBack, demonArray);
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
    let combatantIds = []
    //----------------------------------------------------------------------------------------------
    if (selection === undefined) {  // If nothing was selected, spin the dialog again
        callRadioDialog(demonArray)
        return
    }
    if (!selection) return false;
    const SEL_DEMON = selection.split(" ")[0]
    if (TL > 2) jez.trace(`${TAG} Selected Demon ${SEL_DEMON}`,
        "Demon Type ==>", demonList[SEL_DEMON].name,
        "SubType    ==>", demonList[SEL_DEMON].st,
        "CR         ==>", demonList[SEL_DEMON].cr,
        "DataObj    ==>", demonList[SEL_DEMON].data)
    //-----------------------------------------------------------------------------------------------
    // Fire off the summons, collecting the returned synthetic token UUIDs
    //
    let demonUuids = ""
    for (let i = 1; i <= demonCnt; i++) {
        let dUuid = await summonCritter(demonList[SEL_DEMON].data, i, { traceLvl: TL })
        await jez.combatAddRemove('Add', dUuid, { traceLvl: TL })           // Add new demon to combat
        await jez.wait(100)
        await jez.combatInitiative([ dUuid ], { formula: null, traceLvl: 0 })  // Roll demon initiative
        if (TL > 2) jez.trace(`${TAG} Demon UUID ${i}`, dUuid)
        if (demonUuids) demonUuids += ' ' + dUuid; else demonUuids += dUuid
    }
    if (TL > 2) jez.trace(`${TAG} Demon UUIDs`, demonUuids)
    //-----------------------------------------------------------------------------------------------
    // Modify the concentration effect
    //
    modConcentratingEffect(aToken, demonUuids, { traceLvl: 0 })
    //-----------------------------------------------------------------------------------------------
    // Scoop up Token5e data objects for the summoned demons
    //
    const DEMON_UUIDS = demonUuids.split(" ")
    if (TL > 2) jez.trace(`${TAG} DEMON UUIDS`, DEMON_UUIDS)
    //-----------------------------------------------------------------------------------------------
    // Force any player access defined for the token to 0.  This should find only the one match
    // created earlier by warpgate. Interesting thing here is ownership of a warpgate token is
    // removed from the player that created it.
    //
    let updates = {
        actor: {
            permission: {
                default: 0,
            }
        }
    }
    for (let i = 0; i < DEMON_UUIDS.length; i++) {
        let dToken = canvas.tokens.placeables.find(ef => ef.id === DEMON_UUIDS[i].split(".")[3])
        if (TL > 2) jez.trace(`${TAG} ${i} dToken `, dToken)
        for (let pId in dToken.actor.data.permission) {
            if (pId === "default") continue         // don't mess with the permissions for default
            let playerData = game.users.get(pId)    // Stash player data object
            if (TL > 2) jez.trace(`${TAG} | playerData for ${pId}`, playerData)
            if (playerData.isGM) continue           // don't mess with the permissions for GM
            msg = `Set permission for ${playerData.name} to 0 from ${aToken.actor.data.permission[pId]}`
            if (TL > 2) jez.trace(`${TAG} | ${msg}`)
            updates.actor.permission[pId] = 0       // Set player to no permissions
        }
        await warpgate.mutate(dToken.document, updates);
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Call back function called after demon is selected and then proceeds with execution.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function summonCritter(SUMMON_DATA, number, options = {}) {
    const FUNCNAME = "pickDemonCallBack(selection)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FUNCNAME} ---`,
        "SUMMON_DATA", SUMMON_DATA, "Number", number);
    //----------------------------------------------------------------------------------------------
    // Set handy variables
    //
    const TEMPLATE = SUMMON_DATA.name
    const NAME = `${SUMMON_DATA.name} ${number}`
    const WIDTH = SUMMON_DATA.data.token.width
    //----------------------------------------------------------------------------------------------
    // Build the dataObject for subsequent summon call
    //
    let argObj = {
        defaultRange: 60,                   // Defaults to 30, but this varies per spell
        duration: 1000,                     // Duration of the intro VFX
        introTime: 1000,                     // Amount of time to wait for Intro VFX
        introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
        minionName: NAME,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        scale: 0.5,								// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        templateName: TEMPLATE,
        width: WIDTH,                       // Width of token to be summoned, 1 is the default
        traceLvl: TL                        // Trace level, matching calling function decent choice
    }
    //----------------------------------------------------------------------------------------------
    // Define some updates for the spawned demon
    //
    argObj.updates = {
        actor: { // This seemingly does nothing useful
            permission: { default: 0 }
        },
        token: {
            name: NAME,
            disposition: -1,
        }
    }
    //----------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use
    // it to update the img attribute or set basic image to match this item
    //
    argObj.img = SUMMON_DATA ? SUMMON_DATA.img : aItem.img
    //--------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    let demonId = await jez.spawnAt(TEMPLATE, aToken, aActor, aItem, argObj)
    //--------------------------------------------------------------------------------------------------
    // Build a UUID that will be slapped on the concentrating effect for doOff call.  Should look like:
    //   Scene.MzEyYTVkOTQ4NmZk.Token.cBMsqVwfwf1MxRxV
    let demonUuid = `Scene.${game.scenes.viewed.id}.Token.${demonId}`
    return demonUuid
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
function buildDemonList(exclusions, options = {}) {
    const FUNCNAME = "buildDemonList(exclusions)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`, "exclusions", exclusions);
    //-----------------------------------------------------------------------------------------------
    let demonObj = {}
    for (const demon of game.actors.contents) {
        if (demon.data.type !== "npc") continue;
        if (demon.data.data.details.type.value !== "fiend") continue;
        if (demon.name[0] === "%") continue;
        if (exclusions.includes(demon.name)) continue;
        if (demon.data.data.details.type.subtype.toLowerCase() !== "demon") continue;
        //-------------------------------------------------------------------------------------------
        if (TL > 3) jez.trace(`${TAG} ${demon.name}`, demon);
        if (!demon.data.token.actorLink) {
            const CR = jez.getCharLevel(demon)                          // Challenge Rating
            let st = demon.data.data.details.type.subtype/*.toLowerCase()*/     // Sub Type
            if (!st) st = "Unknown"
            const ST = st
            if (TL > 1) jez.trace(`${TAG} ${demon.name} is CR ${CR} of subtype ${ST}`)
            const KEY = demon.name.replace(/ /g, "_");
            demonObj[KEY] = { cr: CR, st: ST, name: demon.name, data: demon }
        }
    }
    return (demonObj)
}
/***************************************************************************************************
 * Modify existing concentration effect to call this macro as an ItemMacro that can use doOff
 * function can be used to clean accumulated effects and fire this macro at turnStart for aToken
 ***************************************************************************************************/
async function modConcentratingEffect(token5e, arg, options = {}) {
    const FUNCNAME = "modConcentratingEffect(token5e, arg, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    await jez.wait(100)
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
        "token5e ==>", token5e, "arg     ==>", arg, "options ==>", options)
    //----------------------------------------------------------------------------------------------
    // Define local variables
    //
    const EFFECT = "Concentrating"
    //----------------------------------------------------------------------------------------------
    // Seach the token to find the just added concentrating effect
    //
    await jez.wait(100)
    let effect = await token5e.actor.effects.find(i => i.data.label === EFFECT);
    if (TL > 2) jez.trace(`${TAG} Concentrating Effect Object`, effect)
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect.
    //
    effect.data.changes.push({
        key: `macro.itemMacro`, mode: jez.CUSTOM, value: `${arg}`, priority: 20
    })
    effect.data.flags.dae.macroRepeat = "startEveryTurn"
    if (TL > 2) jez.trace(`${TAG} effect.data`, effect.data)
    //----------------------------------------------------------------------------------------------
    // Apply the modification to existing concentration effect so it will run at startEveryTurn
    //
    const result1 = await effect.update({
        'changes': effect.data.changes,
        'flags.dae.macroRepeat': effect.data.flags.dae.macroRepeat
    });
    if (TL > 2) jez.trace(`${TAG} result1`, result1)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 *
 * Typical Parms for two summoned demons
 *  args[0] : off
 *  args[1] : Scene.MzEyYTVkOTQ4NmZk.Token.g0uajGSB37fNRfnL
 *  args[2] : Scene.MzEyYTVkOTQ4NmZk.Token.XoCuvsT6bVc5lzl5
 *  args[3] : LAST_ARG Object from DAE
 *
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options ==>",options);
    //-----------------------------------------------------------------------------------------------
    // Build Array of Token ids received, discarding first and last argument
    //
    for (let i = 1; i < args.length - 1; i++) {
        if (TL > 2) jez.trace(`${TAG} ${i} Demon Info`, args[i])
        let sceneId = args[i].split(".")[1]
        let demonId = args[i].split(".")[3]
        let dToken = canvas.tokens.placeables.find(ef => ef.id === demonId)
        if (TL > 2) jez.trace(`${TAG} ${i} Demon Info`,
            "sceneId ==>", sceneId,
            "demonId ==>", demonId,
            "dToken  ==>", dToken)
        if (dToken) {
            if (TL > 2) jez.trace(`${TAG} ${i} Dismissing ${dToken.name}`,dToken)
            runVFXSmoke(dToken.center)
            warpgate.dismiss(demonId, sceneId)
            await jez.wait(750)
        }
    }
    //-----------------------------------------------------------------------------------------------
    // Delete the circle of protection tile
    //
    let tileId = await DAE.getFlag(aToken.actor, TILE_FLAG);
    jez.tileDelete(tileId)
    await DAE.unsetFlag(aToken.actor, TILE_FLAG);
    //-----------------------------------------------------------------------------------------------
    // Thats all folks
    //
    if (TL > 1) jez.trace(`${FNAME} | --- Finished --- ${MACRONAME} ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Run a simple smoke VFX on specified location
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function runVFXSmoke(coords) {
    const VFX_SMOKE = `modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Regular_Grey_400x400.webm`
    new Sequence()
        .effect()
        .file(VFX_SMOKE)
        .atLocation(coords)
        .scale(.5)
        .opacity(.5)
        .play()
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Each turn need to check health of ur summoned demons, if they are dead, dismiss them.
 * If they are all dead, drop concentration and post message.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doEach(options = {}) {
    const FUNCNAME = "doEach(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    let demonAlive = false      // Trackes if a Demon is alive, if none are, concetration removed
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options ==>", options);
    //-----------------------------------------------------------------------------------------------
    // Build Array of Token ids received, discarding first and last argument
    //
    for (let i = 1; i < args.length - 1; i++) {
        if (TL > 2) jez.trace(`${TAG} ${i} Demon Info`, args[i])
        let sceneId = args[i].split(".")[1]
        let demonId = args[i].split(".")[3]
        let dToken = canvas.tokens.placeables.find(ef => ef.id === demonId)
        if (TL > 2) jez.trace(`${TAG} ${i} Demon Info`,
            "sceneId ==>", sceneId,
            "demonId ==>", demonId,
            "dToken  ==>", dToken)
        if (dToken) {
            if (dToken?.actor?.data?.data?.attributes?.hp?.value <= 0) {
                if (TL > 0) jez.trace(`${TAG} ${dToken.name} appears to be dead, dismiss it`,dToken)
                runVFXSmoke(dToken.center)
                warpgate.dismiss(demonId, sceneId)
                await jez.wait(750)
            }
            else {
                if (TL > 0) jez.trace(`${TAG} ${dToken.name} appears to be alive`)
                demonAlive = true
            }
        }
    }
    //----------------------------------------------------------------------------------------------
    // If no demons remain alive, remove concentrating from originating token
    //
    if (!demonAlive) {
        let concentratingEffect = aToken.actor.effects.find(ef => ef.data.label === "Concentrating");
        if (concentratingEffect) await concentratingEffect.delete();
        jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img, 
                title: "Summoned Demons Dead", 
                msg: `${aToken.name} has noticed that all of the summoned demons are dead and 
                voluntarily drops concentration`, 
                token: aToken})
    }
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}