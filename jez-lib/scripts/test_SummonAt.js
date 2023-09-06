const MACRONAME = "test_SummonAt.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Harness for development and testing of the summonAt jez lib call.
 * 
 * 09/05/23 0.1 Changing template to be, by default either wrapped in %'s or naked.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 1;                               // Trace Level for this macro
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

//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
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
    // Constants
    //
    const MINION = "Raven, Undead"
    let counter = 1
    //--------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        // defaultRange: 30,                   // Defaults to 30, but this varies per spell
        // duration: 1000,                     // Duration of the intro VFX
        // introTime: 1000,                     // Amount of time to wait for Intro VFX
        // introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
        minionName: `Raven ${counter}`,
        // name: aItem.name,                   // Name of action (message only), typically aItem.name
        // outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        // scale: 0.7,								// Default value but needs tuning at times
        // source: aToken,                     // Coords for source (with a center), typically aToken
        // width: 1,                           // Width of token to be summoned, 1 is the default
        // traceLvl: TL                        // Trace level, matching calling function decent choice
    }
    //--------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    let summonData = await game.actors.getName(MINION)
    argObj.img = summonData ? summonData.img : aItem.img
    //--------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    return (await jez.spawnAt(MINION, aToken, aActor, aItem, argObj))
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
 * 
 * 23/09/06 Update to check for non=% wrapped minion and not require center explicit specification (use aToken as default)
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
// static async spawnAt(MINION, aToken, aActor, aItem, ARGS) {
async function spawnAt(MINION, aToken = null, aActor, aItem, ARGS) {
    // async function spawnAt(MINION, aToken, aActor, aItem, ARGS) {
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
    console.log('aToken.center: ', aToken.center)
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
        source: aToken,                     // Coords for source (within center), typically aToken
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
        token: aToken ?? defVal.token,      // Use aToken if provided
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
    // Make sure that dataObj.templateName exists in actor directory and stash its data object, try without % wraps if present
    //
    let summonData = await game.actors.getName(dataObj.templateName)
    let strippedName = dataObj.templateName.slice(1, dataObj.templateName.length - 1)
    if (!summonData) {
        let msg = `Could not find ${dataObj.templateName} in Actor directory, please fix`
        if (dataObj.templateName[0] === '%' && dataObj.templateName[dataObj.templateName.length - 1] === '%') {
            if (TL > 1) jez.trace(`${FNAME} | Trying stripped name for ${dataObj.templateName}:  ${strippedName}`)
            summonData = await game.actors.getName(strippedName)
            if (!summonData) msg = `Could not find ${dataObj.templateName} or ${strippedName} in Actor directory, please fix`
            dataObj.templateName = strippedName;
        }
    }
    if (!summonData) return jez.badNews(`${FNAME} | ${msg}`, "error")
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