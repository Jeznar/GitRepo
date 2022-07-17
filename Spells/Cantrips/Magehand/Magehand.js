const MACRONAME = "Magehand.0.6.js"
/*****************************************************************************************
 * This macro just posts a msg providing basic instructions to teh spell card.
 * 
 * 12/02/21 0.1 Creation
 * 12/02/21 0.2 Drastic simplification and resouce consumption can be handled by base code
 * 02/25/22 0.3 Update to use jez.lib and rename the summoned hand
 * 05/25/22 0.4 Chasing Error: Sequencer | Effect | attachTo - could not find given object
 *              Issue was caused by a conflict with TokenMold/Name.  Now handled with a 
 *              warning.
 * 07/15/22 0.5 Update to use warpgate.spawnAt with range limitation and suppress tokenmold
 * 07/15/22 0.6 Build library function to generalize the warpgate.spawnAt thang
 *****************************************************************************************/
let msg = "";
const TL = 5;
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
jez.log(`Beginning ${MACRONAME}`);
const MINION = "Magehand"
const MINION_NAME = `${aToken.name}'s Magehand`
//--------------------------------------------------------------------------------------------------
// Portals need the same color for pre and post effects, so get that set here. Even though only used
// when we are doing portals
//
const PORTAL_COLORS = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple", "Dark_Red",
"Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange", "Bright_Purple", "Bright_Red", 
"Bright_Yellow"]
let index = Math.floor((Math.random() * PORTAL_COLORS.length))
let portalColor = PORTAL_COLORS[index]
//--------------------------------------------------------------------------------------------------
// Build the dataObject for our summon call
//
let argObj = {
    defaultRange: 30,                   // Defaults to 30, but this varies per spell
    duration: 4000,                     // Duration of the intro VFX
    img: aItem.img,                     // Image to use on the summon location cursor
    introTime: 250,                     // Amount of time to wait for Intro VFX
    introVFX: `~Portals/Portal_${portalColor}_H_400x400.webm`, // default introVFX file
    name: aItem.name,                   // Name of action (message only), typically aItem.name
    outroVFX: `~Portals/Masked/Portal_${portalColor}_H_NoBG_400x400.webm`, // default outroVFX file
    source: aToken,                     // Coords for source (with a center), typically aToken
    width: 1,                           // Width of token to be summoned, 1 is the default
    traceLvl: TL                        // Trace level, matching calling function decent choice
}
// jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
spawnAt(MINION, aToken, aActor, aItem, argObj)

//-------------------------------------------------------------------------------------
// Sets of values tested:
//
// duration:  1000
// introTime: 1000
// introVFX: '~Explosion/Explosion_01_${color}_400x400.webm'
// outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm'
//
// duration:  4000
// introTime: 250
// introVFX: `~Portals/Portal_${portalColor}_H_400x400.webm`
// outroVFX: `~Portals/Masked/Portal_${portalColor}_H_NoBG_400x400.webm`
//
// duration:  3000
// introTime: 250
// introVFX: '~Energy/SwirlingSparkles_01_Regular_${color}_400x400.webm'
// outroVFX: '~Fireworks/Firework*_02_Regular_${color}_600x600.webm'
//-------------------------------------------------------------------------------------
// Post message
//
let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
msg = `<b>${aToken.name}</b> summons <b>${MINION_NAME}</b> to the field.`;
jez.addMessage(chatMessage, { color: jez.randomDarkColor(), fSize: 15, msg: msg, tag: "saves" })
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
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
 * ARGUMENTS is a whopper of an object that can contain multiple values, read code or README
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 async function spawnAt(MINION, aToken, aActor, aItem, ARGUMENTS) {
    const FUNCNAME = "jez.spawnAt(MINION, ARGUMENTS)";
    const FNAME = FUNCNAME.split("(")[0]
    const TL = ARGUMENTS?.traceLvl ?? 0
    const REQUIRED_MODULE = "warpgate"
    if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "MINION", MINION, "ARGUMENTS", ARGUMENTS);
    if (TL > 2) {
        jez.trace(`${FNAME} * |`)
        for (let key in ARGUMENTS) jez.trace(`${FNAME} * | ARGUMENTS.${key}`, ARGUMENTS[key])
    }
    //-----------------------------------------------------------------------------------------------
    // Create the defaultValues object 
    //
    let defaultValues = {
        allowedUnits: ["", "ft", "any"],
        color: "*",
        defaultRange: 30,
        duration: 1000,                     // Duration of the introVFX
        img: "icons/svg/mystery-man.svg",   // Image to use on the summon location cursor
        introTime: 1000,                    // Amount of time to wait for Intro VFX
        introVFX: '~Explosion/Explosion_*_${color}_400x400.webm', // default introVFX file
        minionName: `${aToken.name}'s ${MINION}`,
        name: "Summoning",                  // Name of action (message only), typically aItem.name
        opacity: 1,                         // Opacity for the VFX
        options: {controllingActor:aActor}, // Aledgedly hides an open character sheet
        outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        scale: 0.7,                         // Scale for the VFX
        snap: -1,                           // Snap value passed to jez.warpCrosshairs
        source: { center: {x:315,y:385} },  // Coords for source (within center), typically aToken
        suppressTokenMold: 2000,            // Time (in ms) to suppress TokenMold's renaming setting
        templateName: `%${MINION}%`,
        updates: {
            actor: { name: `${aToken.name}'s ${MINION}` },
            token: { name: `${aToken.name}'s ${MINION}` },
        },
        waitForSuppress: 100,               // Time (in ms) to wait of for Suppression to being
        width: 1                            // Width of token to be summoned
    }
    //-----------------------------------------------------------------------------------------------
    // Create dataObj (data object) from the passed ARGUMENTS and the defaultValues object 
    //
    let dataObj = {
        allowedUnits: ARGUMENTS.allowedUnits ?? defaultValues.allowedUnits,
        color: ARGUMENTS.color ?? defaultValues.color,
        defaultRange: ARGUMENTS.defaultRange ?? defaultValues.defaultRange,
        img: ARGUMENTS.img ?? defaultValues.img,
        duration: ARGUMENTS.duration ?? defaultValues.duration,
        img: ARGUMENTS.img ?? defaultValues.img,
        introTime: ARGUMENTS.introTime ?? defaultValues.introTime,
        introVFX: ARGUMENTS.introVFX ?? defaultValues.introVFX,
        minionName: ARGUMENTS.minionName ?? defaultValues.minionName,
        name: ARGUMENTS.name ?? defaultValues.name,
        opacity: ARGUMENTS.opacity ?? defaultValues.opacity,
        options: ARGUMENTS.options ?? defaultValues.options,
        outroVFX: ARGUMENTS.outroVFX ?? defaultValues.outroVFX,
        scale: ARGUMENTS.scale ?? defaultValues.scale,
        snap: ARGUMENTS.snap ?? defaultValues.snap, // This may be changed later based on width
        source: ARGUMENTS.source ?? defaultValues.source,
        suppressTokenMold: ARGUMENTS.suppressTokenMold ?? defaultValues.suppressTokenMold,
        templateName: ARGUMENTS.templateName ?? defaultValues.templateName,
        updates: ARGUMENTS.updates ?? defaultValues.updates,
        waitForSuppress: ARGUMENTS.waitForSuppress ?? defaultValues.waitForSuppress,
        width: ARGUMENTS.width ?? defaultValues.width,
    }
    //-----------------------------------------------------------------------------------------------
    // Second Pass on defaults, using inputs that may have been passed into our function. 
    // The callbacks need to be recomputed based on varous inputs now established.
    //
    defaultValues.callbacks = {
        pre: async (template) => {
            // jez.vfxPreSummonEffects(template, {
            vfxPreSummonEffects(template, {
                color: dataObj.color, 
                introVFX: dataObj.introVFX,
                opacity: dataObj.opacity, 
                scale: dataObj.scale,
            });
            await jez.wait(dataObj.introTime);
        },
        post: async (template) => {
            // jez.vfxPostSummonEffects(template, {
            vfxPostSummonEffects(template, {
                color: dataObj.color, 
                opacity: dataObj.opacity, 
                outroVFX: dataObj.outroVFX,
                scale: dataObj.scale
            });
            // await jez.wait(dataObj.outroVFX);
        }
    }
    if (TL > 3) {
        jez.trace(`${FNAME} |`)
        for (let key in defaultValues) jez.trace(`${FNAME} | defaultValues.${key}`, defaultValues[key])
    }
    //-----------------------------------------------------------------------------------------------
    // If ARGUMENTS.snap is null, set snap to appropriate value based on width. Odd width should have 
    // snap = -1 to center the summon in a square, even width should be 1 to place on an intersection
    //
    if (!ARGUMENTS.snap) dataObj.snap = (dataObj.width % 2 === 0) ? 1 : -1
    //-----------------------------------------------------------------------------------------------
    // Second Pass on dataObj.  Update callbacks to reflect new default and make sure token mold is
    // suppressed for longed than the introVFX 
    //
    dataObj.callbacks = ARGUMENTS.callbacks ?? defaultValues.callbacks
    dataObj.suppressTokenMold = Math.max(dataObj.introTime + 500, dataObj.suppressTokenMold)
    if (TL > 2) {
        jez.trace(`${FNAME} |`)
        for (let key in dataObj) jez.trace(`${FNAME} | dataObj.${key}`, dataObj[key])
    }
    //-----------------------------------------------------------------------------------------------
    // Make sure that warpgate module is active
    //
    if (!game.modules.get(REQUIRED_MODULE))
        return jez.badNews(`${FNAME} | ${REQUIRED_MODULE} must be active.  Please fix!`, "error")
    else if (TL > 1) jez.trace(`${FNAME} | Found ${REQUIRED_MODULE} continuing...`)
    //-----------------------------------------------------------------------------------------------
    // Make sure that dataObj.templateName exists in actor directory and stash its data object
    //
    let summonData = await game.actors.getName(dataObj.templateName)
    if (!summonData) return jez.badNews(`${FNAME} | Could not find ${dataObj.templateName} in Actor
        directory (sidebar), please fix`, "error")
    else if (TL > 1) jez.trace(`${FNAME} | Found ${summonData} continuing...`, summonData)
    //-----------------------------------------------------------------------------------------------
    // Get and set maximum sumoning range
    //
    const MAX_RANGE = jez.getRange(aItem, dataObj.allowedUnits) ?? dataObj.defaultRange
    if (TL > 1) jez.trace(`${FNAME} | Set MAX_RANGE`, MAX_RANGE);
    //-----------------------------------------------------------------------------------------------
    // Obtain location for spawn
    //
    let { x, y } = await jez.warpCrosshairs(dataObj.source, MAX_RANGE, dataObj.img, dataObj.name,
        { width: dataObj.width }, dataObj.snap, { traceLvl: TL })
    if (TL > 1) jez.trace(`${FNAME} | Set location for spawn to ${x}, ${y}`);
    //-----------------------------------------------------------------------------------------------
    // Suppress Token Mold for a wee bit
    //
    jez.suppressTokenMoldRenaming(dataObj.suppressTokenMold)
    await jez.wait(dataObj.waitForSuppress)
    //-----------------------------------------------------------------------------------------------
    // Execute the summon
    //
    return (await warpgate.spawnAt({ x, y }, dataObj.templateName, dataObj.updates, dataObj.callbacks,
        dataObj.options));
}


/***************************************************************************************************/
/***************************************************************************************************/
/***************************************************************************************************/
/***************************************************************************************************/


async function vfxPreSummonEffects(location, optionObj) {
    const FUNCNAME = "jez.vfxPreSummonEffects(location, optionObj)";
    const FNAME = FUNCNAME.split("(")[0]
    const TL = optionObj?.traceLvl ?? 0
    const REQUIRED_MODULE = "sequencer"
    if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "location", location, "optionObj", optionObj);
    //-----------------------------------------------------------------------------------------------
    // Make sure that sequencer module is active
    //
    if (!game.modules.get(REQUIRED_MODULE))
        return jez.badNews(`${FNAME} | ${REQUIRED_MODULE} must be active.  Please fix!`, "error")
    else if (TL > 2) jez.trace(`${FNAME} | Found ${REQUIRED_MODULE} continuing...`)
    //-------------------------------------------------------------------------------------------------
    // Do some color validation for pre-defined types of effects
    //
    const EXPLOSION_COLORS = ["Blue", "Green", "Orange", "Purple", "Yellow", "*"];
    const PORTAL_COLORS = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple", "Dark_Red",
        "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange",
        "Bright_Purple", "Bright_Red", "Bright_Yellow", "*"]
    const SPARKLE_COLORS = ["Blue", "BluePink", "GreenOrange", "OrangePurple", "*"]
    let colors = null
    let introVFX = optionObj?.introVFX ?? '~Explosion/Explosion_*_${color}_400x400.webm'
    if (TL > 3) jez.trace("optionObj?.introVFX", optionObj?.introVFX)
    if (introVFX.startsWith("~Explosion/Explosion_")) colors = EXPLOSION_COLORS
    else if (introVFX.startsWith("~Portals/Portal_")) colors = PORTAL_COLORS
    else if (introVFX.startsWith("~Energy/SwirlingSparkles")) colors = SPARKLE_COLORS
    let color
    if (colors) {
        if (TL > 3) jez.trace("colors", colors)
        if (colors.includes(optionObj?.color)) color = optionObj?.color
        else color = "*"
    }
    else color = optionObj?.color ?? "*"
    if (TL > 3) jez.trace("Color selected", color)
    //-------------------------------------------------------------------------------------------------
    // Build the VFX file name
    //
    const VFX_DIR = 'modules/jb2a_patreon/Library/Generic'
    if (introVFX.charAt(0) === '~') introVFX = `${VFX_DIR}/${introVFX.substring(1)}`
    if (TL > 3) jez.trace("VFX with prefix", introVFX)
    introVFX = introVFX.replace("${color}", color)
    if (TL > 3) jez.trace("VFX with color ", introVFX)
    //-------------------------------------------------------------------------------------------------
    // Set the other adjustable values
    //
    const SCALE = optionObj?.scale ?? 1.0
    const OPACITY = optionObj?.opacity ?? 1.0
    const DURATION = optionObj?.duration ?? 1000

    new Sequence()
        .effect()
        .file(introVFX)
        .atLocation(location)
        .center()
        .scale(SCALE)
        .opacity(OPACITY)
        .duration(DURATION)
        .play()
}

/***************************************************************************************************/
/***************************************************************************************************/
/***************************************************************************************************/
/***************************************************************************************************/

async function vfxPostSummonEffects(template, optionObj) {
    const FUNCNAME = "jez.vfxPostSummonEffects(location, optionObj)";
    const FNAME = FUNCNAME.split("(")[0]
    const TL = optionObj?.traceLvl ?? 0
    const REQUIRED_MODULE = "sequencer"
    if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "location", location, "optionObj", optionObj);
    //-----------------------------------------------------------------------------------------------
    // Make sure that sequencer module is active
    //
    if (!game.modules.get(REQUIRED_MODULE))
        return jez.badNews(`${FNAME} | ${REQUIRED_MODULE} must be active.  Please fix!`, "error")
    else if (TL > 2) jez.trace(`${FNAME} | Found ${REQUIRED_MODULE} continuing...`)
    //-------------------------------------------------------------------------------------------------
    // Do some color validation for well supported types of effects
    //
    const SMOKE_COLORS = ["Blue", "Black", "Green", "Purple", "Grey", "*"];
    const PORTAL_COLORS = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple", "Dark_Red",
        "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange",
        "Bright_Purple", "Bright_Red", "Bright_Yellow", "*"]
    const FIREWORK_COLORS = ["BluePink", "Green", "GreenOrange", "GreenRed", "Orange", "OrangeYellow",
        "Yellow", "*"]
    let colors = null
    let outroVFX = optionObj?.outroVFX ?? '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm'
    if (TL > 3) jez.trace("optionObj?.outroVFX", optionObj?.outroVFX)
    if (outroVFX.startsWith("~Smoke/SmokePuff")) colors = SMOKE_COLORS
    else if (outroVFX.startsWith("~Portals/Portal_")) colors = PORTAL_COLORS
    else if (outroVFX.startsWith("~Fireworks/Firework")) colors = FIREWORK_COLORS
    let color
    if (colors) {
        if (TL > 3) jez.trace("colors", colors)
        if (colors.includes(optionObj?.color)) color = optionObj?.color
        else color = "*"
    }
    else color = optionObj?.color ?? "*"
    if (TL > 3) jez.trace("Color selected", color)
    //-------------------------------------------------------------------------------------------------
    // Build the VFX file name
    //
    const VFX_DIR = 'modules/jb2a_patreon/Library/Generic'
    if (outroVFX.charAt(0) === '~') outroVFX = `${VFX_DIR}/${outroVFX.substring(1)}`
    if (TL > 3) jez.trace("VFX with prefix", outroVFX)
    outroVFX = outroVFX.replace("${color}", color)
    if (TL > 3) jez.trace("VFX with color ", outroVFX)
    //-------------------------------------------------------------------------------------------------
    // Set the other adjustable values
    //
    const SCALE = optionObj?.scale ?? 1.0
    const OPACITY = optionObj?.opacity ?? 1.0
    new Sequence()
        .effect()
        .file(outroVFX)
        .atLocation(template)
        .center()
        .scale(SCALE)
        .opacity(OPACITY)
        .play()
}