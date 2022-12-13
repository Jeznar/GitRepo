const MACRONAME = "Flaming_Sphere.1.0.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implements Flaming Sphere, based on Moonbeam.0.8 and its Helper_DAE script
 * 
 * 01/01/22 0.1 Creation of Macro
 * 03/16/22 0.2 Move into GitRepo chasing what appears to be permissions issue
 * 05/16/22 0.5 Update for FoundryVTT 9.x
 * 07/15/22 0.6 Update to use warpgate.spawnAt with range limitation
 * 07/17/22 0.7 Update to use jez.spawnAt (v2) for summoning
 * 08/02/22 0.8 Add convenientDescription
 * 12/12/22 0.9 Update to current logging, changed attack item to be on the sphere, general cleanup
 * 12/13/22 1.0 Handle out of range flaming sphere summon, refund spell slot, drop concentration
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const ATTACK_ITEM = "Flaming Sphere Attack";
const MINION = "Flaming_Sphere"
const EFFECT = "Flaming Sphere"
const MINION_UNIQUE_NAME = `${aToken.name}'s Sphere`
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_OPACITY = 0.7;
const VFX_SCALE = 0.6;
let sphereID = null     // The token.id of the summoned fire sphere
let sphereToken = null  // Variable to hold the token5e for the Sphere
if (TL > 1) jez.trace(`${TAG} ------- Obtained Global Values -------`,
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem,
    "ATTACK_ITEM", ATTACK_ITEM,
    "MINION_UNIQUE_NAME", MINION_UNIQUE_NAME);
const SAVE_DC = jez.getSpellDC(aActor)
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0].tag === "OnUse") await doOnUse({ traceLvl: TL }); // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
//-----------------------------------------------------------------------------------------------------------------------------------
// All done
//
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Post the results to chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Check the setup of things.  Setting the global msg and returning true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (!game.modules.get("advanced-macros")?.active) return jez.badNews(`${TAG} Please enable the Advanced Macros module`, 'e')
    return (true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    if (!await preCheck()) return (false);

    //-------------------------------------------------------------------------------------------------------------------------------
    // Summon our flaming sphere
    //
    const SPHERE_DATA = await summonCritter(MINION, { traceLvl: TL })
    if (!SPHERE_DATA) {
        jez.refundSpellSlot(aToken, L_ARG.spellLevel, { traceLvl: TL, quiet: false, spellName: aItem.name })
        jez.dropConcentrating(aToken, { traceLvl: TL })
        return false
    }
    if (TL > 1) jez.trace(`${TAG} SPHERE_DATA`, SPHERE_DATA)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Modify the concentrating effect so that it deletes the sphere when it is removed
    //
    modConcentratingEffect(aToken, SPHERE_DATA.id)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Start the VFX
    //
    if (TL > 1) jez.trace(`${TAG} Start the VFX sequence on ${MINION_UNIQUE_NAME}`)
    await startVFX();
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Post final result message
    //
    msg = `<b>${aActor.name}</b> has summoned a <b>Flaming Sphere</b>.<br><br>
    It has an attack (inventory item: <b>Flaming Sphere Attack</b>) used to inflict damage on creatures that start their next to the 
    sphere.<br><br>
    ${aActor.name} can use an <b>Action</b> to move the sphere, inflicting damage and stopping on any collision.`
    postResults(msg);
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/***************************************************************************************************
 * Start the Visual Special Effects (VFX) on specified token
 ***************************************************************************************************/
async function startVFX() {
    new Sequence()
        .effect()
        .file("jb2a.smoke.puff.centered.dark_black.2")
        .attachTo(sphereToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .persist()
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(300)            // Fade in for specified time in milliseconds
        .fadeOut(300)           // Fade out for specified time in milliseconds
        .extraEndDuration(800)  // Time padding on exit to connect to Outro effect
        .play()
    return (true);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Summon the minion
 * 
 * https://github.com/trioderegion/warpgate
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function summonCritter(MINION, options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "MINION", MINION, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        defaultRange: 60,                   // Defaults to 30, but this varies per spell
        duration: 1000,                     // Duration of the intro VFX
        introTime: 1000,                     // Amount of time to wait for Intro VFX
        introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
        minionName: `${aToken.name}'s ${MINION}`,
        minionName: MINION_UNIQUE_NAME,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        scale: 0.7,								// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        width: 1,                           // Width of token to be summoned, 1 is the default
        traceLvl: TL                        // Trace level, matching calling function decent choice
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    let summonData = await game.actors.getName(MINION)
    argObj.img = summonData ? summonData.img : aItem.img
    //-------------------------------------------------------------------------------------------------------------------------------
    // Buikd updates data field to set the save dc on the fire sphere's attack to the caster's SAVE_DC
    // 
    //
    if (TL > 1) jez.trace(`${TAG} Building update to set save DC to ${SAVE_DC}`)
    argObj.updates = {
        actor: { name: MINION_UNIQUE_NAME },
        token: { name: MINION_UNIQUE_NAME },
        embedded: {
            Item: {
                "Flaming Sphere Attack": {
                    // 'data.damage.parts': [[`1d6[fire] + 3`, "fire"]],
                    // 'data.attackBonus': `2[mod] + 3[prof]`,   
                    'data.save.dc': SAVE_DC,
                },
            }
        }
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    let returned = await jez.spawnAt(MINION, aToken, aActor, aItem, argObj, { traceLvl: TL })
    // let returned = await spawnAt(MINION, aToken, aActor, aItem, argObj, { traceLvl: TL })
    if (TL > 1) jez.trace(`${TAG} spawnAt returned`, returned)
    if (!returned) false
    //-------------------------------------------------------------------------------------------------------------------------------
    // Fnish up
    //
    // sphereID = returned[0] // The token ID of the summoned sphere
    return canvas.tokens.placeables.find(ef => ef.id === returned[0])
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Modify existing concentration effect to call this macro as an ItemMacro that can use doOff to delete our Flaming Sphere
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function modConcentratingEffect(token5e, sphereID) {
    const EFFECT = "Concentrating"
    //-------------------------------------------------------------------------------------------------------------------------------
    // Seach the token to find the just added concentrating effect
    //
    await jez.wait(100)
    let effect = await token5e.actor.effects.find(i => i.data.label === EFFECT);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect. 
    //    
    effect.data.changes.push({ key: `macro.itemMacro`, mode: jez.CUSTOM, value: `${sphereID}`, priority: 20 })
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result && TL > 1) jez.trace(`${MACRO} | Active Effect ${EFFECT} updated!`, result);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Despawn our charge
    //
    let sceneId = game.scenes.viewed.id
    let sphereId = args[1]
    warpgate.dismiss(sphereId, sceneId)
    //-------------------------------------------------------------------------------------------------------------------------------
    // All done
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}





/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
     * Function to spawn in a token at a position to be selected within this function.  Key calls are
     * made to: 
     *  (1) jez.warpCrosshairs() which rides on warpgate.crosshairs.show()
     *  (2) jez.suppressTokenMoldRenaming which does what its name suggests
     *  (3) warpgate.spawnAt() to perform the actual summon
     * 
     * This funcion will return the id of the summoned token or false if an error occurs.
     * 
     * MINION is a string defining the name of the MINION
     * aToken token5e data object for the reference token (from which range is measured)
     * ARGS is a whopper of an object that can contain multiple values, read code or README
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
//  static async spawnAt(MINION, aToken, aActor, aItem, ARGS) {
async function spawnAt(MINION, aToken, aActor, aItem, ARGS) {
    const FUNCNAME = "jez.spawnAt(MINION, ARGS)";
    const FNAME = FUNCNAME.split("(")[0]
    const TL = ARGS?.traceLvl ?? 0
    const REQUIRED_MODULE = "warpgate"
    if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "MINION", MINION, "ARGS", ARGS);
    if (TL > 3) {
        jez.trace(`${FNAME} |`)
        for (let key in ARGS) jez.trace(`${FNAME} | ARGS.${key}`, ARGS[key])
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Create the defVal object 
    //
    let defVal = {
        allowedColorsIntro: null,
        allowedColorsOutro: null,
        allowedUnits: ["", "ft", "any"],
        colorIntro: "*",
        colorOutro: "*",
        defaultRange: 30,
        duration: 1000,                     // Duration of the introVFX
        img: "icons/svg/mystery-man.svg",   // Image to use on the summon location cursor
        introTime: 1000,                    // Amount of time to wait for Intro VFX
        introVFX: '~Explosion/Explosion_*_${color}_400x400.webm', // default introVFX file
        minionName: `${aToken.name}'s ${MINION}`,
        name: "Summoning",                  // Name of action (message only), typically aItem.name
        opacity: 1,                         // Opacity for the VFX
        options: { controllingActor: aActor }, // Aledgedly hides an open character sheet
        outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        scale: 0.7,                         // Scale for the VFX
        snap: -1,                           // Snap value passed to jez.warpCrosshairs
        source: { center: { x: 315, y: 385 } },  // Coords for source (within center), typically aToken
        suppressTokenMold: 2000,            // Time (in ms) to suppress TokenMold's renaming setting
        templateName: `%${MINION}%`,
        traceLvl: 0,
        // updates: {
        //     actor: { name: `${aToken.name}'s ${MINION}` },
        //     token: { name: `${aToken.name}'s ${MINION}` },
        // },
        waitForSuppress: 100,               // Time (in ms) to wait of for Suppression to being
        width: 1                            // Width of token to be summoned
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Create dataObj (data object) from the passed ARGS and the defVal object 
    //
    let dataObj = {
        allowedColorsIntro: ARGS.allowedColorsIntro ?? defVal.allowedColorsIntro,
        allowedColorsOutro: ARGS.allowedColorsOutro ?? defVal.allowedColorsOutro,
        allowedUnits: ARGS.allowedUnits ?? defVal.allowedUnits,
        colorIntro: ARGS.colorIntro ?? defVal.colorIntro,
        colorOutro: ARGS.colorOutro ?? defVal.colorOutro,
        defaultRange: ARGS.defaultRange ?? defVal.defaultRange,
        img: ARGS.img ?? defVal.img,
        duration: ARGS.duration ?? defVal.duration,
        img: ARGS.img ?? defVal.img,
        introTime: ARGS.introTime ?? defVal.introTime,
        introVFX: ARGS.introVFX ?? defVal.introVFX,
        minionName: ARGS.minionName ?? defVal.minionName,
        name: ARGS.name ?? defVal.name,
        opacity: ARGS.opacity ?? defVal.opacity,
        options: ARGS.options ?? defVal.options,
        outroVFX: ARGS.outroVFX ?? defVal.outroVFX,
        scale: ARGS.scale ?? defVal.scale,
        snap: ARGS.snap ?? defVal.snap, // This may be changed later based on width
        source: ARGS.source ?? defVal.source,
        suppressTokenMold: ARGS.suppressTokenMold ?? defVal.suppressTokenMold,
        templateName: ARGS.templateName ?? defVal.templateName,
        traceLvl: ARGS.traceLvl ?? defVal.templateName,
        updates: 'updates' in ARGS ? ARGS.updates : defVal.updates,
        waitForSuppress: ARGS.waitForSuppress ?? defVal.waitForSuppress,
        width: ARGS.width ?? defVal.width,
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Second Pass on defaults, using inputs that may have been passed into our function. 
    // The callbacks need to be recomputed based on varous inputs now established.
    //
    defVal.callbacks = {
        pre: async (template) => {
            jez.vfxPreSummonEffects(template, {
                allowedColors: dataObj.allowedColorsIntro,
                color: dataObj.colorIntro,
                opacity: dataObj.opacity,
                scale: dataObj.scale,
                traceLvl: dataObj.traceLvl,
                vfxFile: dataObj.introVFX
            });
            await jez.wait(dataObj.introTime);
        },
        post: async (template) => {
            jez.vfxPostSummonEffects(template, {
                allowedColors: dataObj.allowedColorsOutro,
                color: dataObj.colorOutro,
                opacity: dataObj.opacity,
                scale: dataObj.scale,
                traceLvl: dataObj.traceLvl,
                vfxFile: dataObj.outroVFX
            });
            // await jez.wait(dataObj.outroVFX);
        }
    }
    defVal.updates = {
        actor: { name: dataObj.minionName },
        token: { name: dataObj.minionName, disposition: aToken.data.disposition },
    }
    if (TL > 3) {
        jez.trace(`${FNAME} |`)
        for (let key in defVal) jez.trace(`${FNAME} | defVal.${key}`, defVal[key])
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // If not provided with ARGS.allowedColors, build the array of allowed color values based on
    // the introVFX / outroVFX names with special treatment for known types defaulting to a "*"
    //
    if (!dataObj.allowedColorsIntro) {
        if (dataObj.introVFX.startsWith("~Explosion/Explosion_"))
            dataObj.allowedColorsIntro = ["Blue", "Green", "Orange", "Purple", "Yellow", "*"];
        else if (dataObj.introVFX.startsWith("~Portals/Portal_"))
            dataObj.allowedColorsIntro = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple",
                "Dark_Red", "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange",
                "Bright_Purple", "Bright_Red", "Bright_Yellow", "*"];
        else if (dataObj.introVFX.startsWith("~Energy/SwirlingSparkles"))
            dataObj.allowedColorsIntro = ["Blue", "BluePink", "GreenOrange", "OrangePurple", "*"];
        else dataObj.allowedColorsIntro = ["*"];
    }
    if (!dataObj.allowedColorsOutro) {
        if (dataObj.introVFX.startsWith("~Smoke/SmokePuff"))
            dataObj.allowedColorsOutro = ["Blue", "Black", "Green", "Purple", "Grey", "*"];
        else if (dataObj.introVFX.startsWith("~Portals/Portal_"))
            dataObj.allowedColorsOutro = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple",
                "Dark_Red", "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange",
                "Bright_Purple", "Bright_Red", "Bright_Yellow", "*"];
        else if (dataObj.introVFX.startsWith("~Fireworks/Firework"))
            dataObj.allowedColorsOutro = ["BluePink", "Green", "GreenOrange", "GreenRed", "Orange",
                "OrangeYellow", "Yellow", "*"];
        else dataObj.allowedColorsOutro = ["*"];
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // If ARGS.snap is null, set snap to appropriate value based on width. Odd width should have 
    // snap = -1 to center the summon in a square, even width should be 1 to place on an intersection
    //
    if (!ARGS.snap) dataObj.snap = (dataObj.width % 2 === 0) ? 1 : -1
    //-----------------------------------------------------------------------------------------------
    // Second Pass on dataObj.  Update callbacks to reflect new default and make sure token mold is
    // suppressed for longed than the introVFX 
    //
    dataObj.callbacks = ARGS.callbacks ?? defVal.callbacks
    dataObj.updates = ARGS.updates ?? defVal.updates
    dataObj.suppressTokenMold = Math.max(dataObj.introTime + 500, dataObj.suppressTokenMold)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Depending on TL print out the dataObj to the console
    //
    if (TL > 2) {
        jez.trace(`${FNAME} |`)
        for (let key in dataObj) jez.trace(`${FNAME} | dataObj.${key}`, dataObj[key])
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Make sure that warpgate module is active
    //
    if (!game.modules.get(REQUIRED_MODULE)) return jez.badNews(`${FNAME} | ${REQUIRED_MODULE} must be active.  Please fix!`, "error")
    else if (TL > 1) jez.trace(`${FNAME} | Found ${REQUIRED_MODULE} continuing...`)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Make sure that dataObj.templateName exists in actor directory and stash its data object
    //
    let summonData = await game.actors.getName(dataObj.templateName)
    if (!summonData) return jez.badNews(`${FNAME} | Could not find ${dataObj.templateName} in Actor directory, please fix`, "error")
    else if (TL > 1) jez.trace(`${FNAME} | Found ${summonData} continuing...`, summonData)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Get and set maximum sumoning range
    //
    const MAX_RANGE = jez.getRange(aItem, dataObj.allowedUnits) ?? dataObj.defaultRange
    if (TL > 1) jez.trace(`${FNAME} | Set MAX_RANGE`, MAX_RANGE);
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Obtain location for spawn
    //
    let { x, y } = await jez.warpCrosshairs(dataObj.source, MAX_RANGE, dataObj.img, dataObj.name,
        { width: dataObj.width }, dataObj.snap, { traceLvl: TL })
    if (!x || !y) return jez.badNews(`Selected out of range.`, 'w')
    if (TL > 1) jez.trace(`${FNAME} | Set location for spawn to ${x}, ${y}`);
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Suppress Token Mold for a wee bit
    //
    jez.suppressTokenMoldRenaming(dataObj.suppressTokenMold)
    await jez.wait(dataObj.waitForSuppress)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Execute the summon
    //
    if (TL > 3) jez.trace("Calling warpgate.spawnAt(...)", "x", x, "y", y,
        "dataObj.templateName", dataObj.templateName, "dataObj.updates", dataObj.updates,
        "dataObj.callbacks", dataObj.callbacks, "dataObj.options", dataObj.options)
    return (await warpgate.spawnAt({ x, y }, dataObj.templateName, dataObj.updates, dataObj.callbacks, dataObj.options));
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Cancel (drop, delete) concentrating effect if any on passed token's actor
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
 async function dropConcentrating(token5e, options={}) {
    const FUNCNAME = "doOn(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `jez.${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'token5e',token5e,'options',options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Function Variables
    //
    const EFFECT_NAME = "Concentrating"
    //-------------------------------------------------------------------------------------------------------------------------------
    // Seach the token to find the just added concentrating effect
    //
    await jez.wait(50)
    const EFFECT = await aActor.effects.find(ef => ef.data.label === EFFECT_NAME) ?? null;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect. 
    //    
    if (EFFECT) await jez.deleteEffectAsGM(EFFECT.uuid, { traceLvl: TL })
}