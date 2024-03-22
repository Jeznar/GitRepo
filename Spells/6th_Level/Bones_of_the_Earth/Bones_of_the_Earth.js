const MACRONAME = "Bones_of_the_Earth.0.1.js"
const TL = 0;                               // Trace Level for this macro
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Summon pillars to the scene to implement the 6th level spell Bones of the Earth
 * 
 * 03/22/24 0.1 Creation of Macro, borrowing from Animate_Objects.0.4.js
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.log(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
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
const SPELL_LEVEL = args[0].spellLevel
const SPELL_DC = aActor.data.data.attributes.spelldc
const NUM_BONES = 6 + (SPELL_LEVEL -6) * 2  // 6 plus 2 per spell cast level above 6
const BONE_TEMPLATE = '%Bone of the Earth%'
const ALLOWED_UNITS = ["", "ft", "any"];
const MAX_RANGE = jez.getRange(aItem, ALLOWED_UNITS) ?? 120
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.log(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Grab template creature data from actor's directory.
    //
    let summonData = game.actors.getName(BONE_TEMPLATE)
    if (!summonData) return jez.badNews(`$TAG "${BONE_TEMPLATE}" could not be found in actor directory`, "e")
    //--------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        defaultRange: MAX_RANGE,            // Defaults to 30, but this varies per spell
        duration: 1000,                     // Duration of the intro VFX
        img: aItem.img,                     // Image to use on the summon location cursor
        introTime: 1000,                    // Amount of time to wait for Intro VFX
        introVFX: '~Explosion/Explosion_01_${color}_400x400.webm', // default introVFX file
        minionName: `Bone of Earth`,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        scale: 0.7,								// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        width: 1,                           // Width of token to be summoned, 1 is the default
        traceLvl: TL                        // Trace level, matching calling function decent choice
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Modify template setting save DC to SPELL_DC
    //
    argObj.updates = customization(`Column`, SPELL_DC, summonData, { traceLvl: TL })
    //-------------------------------------------------------------------------------------------------------------------------------
    // Perform actual summons
    //
    for (let i = 0; i < NUM_BONES; i++) {
        if (TL > 1) jez.log(`${TAG} Summoning Bone #${i+1}`)
        const BONE_ID_ARRAY = await jez.spawnAt(BONE_TEMPLATE, aToken, aActor, aItem, argObj)
        await jez.wait(500)
        if (TL > 2) jez.log(`${TAG} Bone_ID_ARRAY`, BONE_ID_ARRAY) 
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `${NUM_BONES} columns have errupted, potentially pinning unfortunates who were standing on point of erruption.`
    postResults(msg)
    if (TL > 0) jez.log(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Customize the summon data and return it.  Specificially:
 *  - change %SPELL_DC% in action description
 *  - set save DC 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function customization(MINION_NAME, SPELL_DC, SUMMON_DATA, options = {}) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL > 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 2) jez.log(`${TAG} Customization Parms`, 'MINION_NAME', MINION_NAME, 'SPELL_DC   ', SPELL_DC,
        'SUMMON_DATA', SUMMON_DATA, "options    ", options)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Function Variables
    //
    let updates = {}
    const ITEM_NAME_TO_BE_UPDATED = "Pin to Ceiling"
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Grab the current contents of the item to be updated
    //
    let oldDescription = ""
    for([key,value] of SUMMON_DATA.data.items.entries()) {
        if (value.data.name === ITEM_NAME_TO_BE_UPDATED) {
            oldDescription = value.data.data.description.value
            break
        }
    }
    if (!oldDescription) return jez.badNews(`Could not find '${ITEM_NAME_TO_BE_UPDATED}'`,'w')
    if (TL > 3) jez.log(`${TAG} Description to update`, oldDescription)
    const regExp = new RegExp(`%SPELL_DC%`, "g");
    newDescription = oldDescription.replace(regExp, SPELL_DC);
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Modifications
    // 
    updates = {
        token: {
            "name": MINION_NAME,
        },
        actor: {
            "name": MINION_NAME,
        },
        embedded: {
            Item: {
                [ITEM_NAME_TO_BE_UPDATED]: {                    // Brackets needed to force evaluation before use
                    "data.description.value": newDescription,
                    "data.save.dc": SPELL_DC
                },
            },
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Done
    //
    return updates
}
