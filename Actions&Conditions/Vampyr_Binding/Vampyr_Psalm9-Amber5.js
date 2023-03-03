const MACRONAME = "Vampyr_Psalm9-Amber5.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 9th Psalm: Every living creature in the ritual area takes 7 (2d7) necrotic damage as their blood is forcibly drained through 
 *            their skin. No saving throw is made. Their blood coalesces together with the mists, and the Aspect of Vampyr 
 *            materializes.
 * 
 * This one needs to do the following:
 * 1. Find all of the "living" creatures
 * 2. Apply 2d7 necrotic damage to each
 * 3. Spawn in the Aspect of Vampyr
 * 
 * 01/08/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 5;                               // Trace Level for this macro
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
psalm9({ traceLvl: TL })
return
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
* 9th Psalm: Every living creature in the ritual area takes 7 (2d7) necrotic damage as their blood is forcibly drained through 
*            their skin. No saving throw is made. Their blood coalesces together with the mists, and the Aspect of Vampyr 
*            materializes.
* 
* This one needs to do the following:
* 1. Find all of the "living" creatures
* 2. Pick location for Aspect of Vampyr
* 3. Run VFX from each creature to spawn (modules/jb2a_patreon/Library/Generic/Energy/EnergyBeam_03_Dark_PurpleRed_30ft_1600x400.webm)
* 4. Spawn in the Aspect of Vampyr
* 5. Apply 2d6 necrotic damage to each
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function psalm9(options = {}) {
    const FUNCNAME = "psalm2(options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Set Macro variables
    //
    const SPAWN_NAME = 'Aspect of Vampyr'
    const DAMAGE_TYPE = 'necrotic'
    const DICE_NUM = 2
    const DICE_TYPE = "d6"
    const BONUS = 0
    //--------------------------------------------------------------------------------------------------------------------------------
    // 0. Setup needed values
    //
    const MAX_RANGE = 25
    let VampyrActor = game.actors.getName(SPAWN_NAME)
    if (!VampyrActor) return jez.badNews(`Could not find ${SPAWN_NAME} in actor directory`,'e')
    //-------------------------------------------------------------------------------------------------------------------------------
    // 1. Start spawn in of the Aspect of Vampyr
    //
    //--------------------------------------------------------------------------------------------------
    // Portals need the same color for pre and post effects, so get that set here. Even though only used
    // when we are doing portals
    //
    const PORTAL_COLORS = [ "Dark_Red", "Dark_RedYellow" ]
    let index = Math.floor((Math.random() * PORTAL_COLORS.length))
    let portalColor = PORTAL_COLORS[index]
    //--------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        defaultRange: MAX_RANGE,            // Defaults to 30, but this varies per spell
        duration: 6000,                     // Duration of the intro VFX
        introTime: 250,                     // Amount of time to wait for Intro VFX
        introVFX: `~Portals/Portal_${portalColor}_H_400x400.webm`, // default introVFX file
        minionName: SPAWN_NAME,
        templateName: SPAWN_NAME,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: `~Portals/Masked/Portal_${portalColor}_H_NoBG_400x400.webm`, // default outroVFX file
        scale: 1.0,								// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        width: 2,                           // Width of token to be summoned, 1 is the default
        traceLvl: TL                        // Trace level, matching calling function decent choice
    }
    //--------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    let summonData = await game.actors.getName(SPAWN_NAME)
    argObj.img = summonData ? summonData.img : aItem.img
    //--------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    const SPAWN_TOKEN_ID = await jez.spawnAt(SPAWN_NAME, aToken, aActor, aItem, argObj)
    // console.log('SPAWN_TOKEN_ID', SPAWN_TOKEN_ID)
    let fetchedTokenDoc = game.scenes.viewed.data.tokens.get(SPAWN_TOKEN_ID[0])
    // console.log('fetchedTokenDoc', fetchedTokenDoc)
    // console.log('fetchedTokenDoc center', fetchedTokenDoc._object.center)
    const SPAWN_COORDS = fetchedTokenDoc._object.center
    if (TL > 2) jez.trace(`${TAG} SPAWN_COORDS {${SPAWN_COORDS.x},${SPAWN_COORDS.y}}`, SPAWN_COORDS)
    //--------------------------------------------------------------------------------------------------------------------------------
    // 2. Find all of the "living" creatures
    // 
    const NOT_LIVING_NAMES = ['Amber Block', 'Torch']
    const NOT_LIVING_SUBNAMES = [ 'Dancing Light', 'Ceremonial Lantern - ']
    const NOT_LIVING_RACES = [ 'undead', 'construct']
    const TOKENS = canvas.tokens.placeables
    if (TL > 3) jez.trace(`${TAG} Tokens to choose from`, TOKENS)
    const LIVINGS = TOKENS.filter(checkLiving)
    if (TL > 3) jez.trace(`${TAG} LIVINGS found`, LIVINGS)
    if (LIVINGS.length === 0) return jez.badNews(`${TAG} No LIVINGS fround on scene`, 'w')
    // Return combat eligible boolean
    function checkLiving(subject) {
        if (NOT_LIVING_NAMES.includes(subject.name)) return false
        for (let i = 0; i < NOT_LIVING_SUBNAMES.length; i++) if (subject.name.startsWith(NOT_LIVING_SUBNAMES[i])) return false
        const RACE = jez.getRace(subject)
        for (let i = 0; i < NOT_LIVING_RACES.length; i++) if (RACE.startsWith(NOT_LIVING_RACES[i])) return false
        if (subject.actor.data.data.attributes.hp.value > 0) return true
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 3. Run VFX from each creature to spawn 
    //    (modules/jb2a_patreon/Library/Generic/Energy/EnergyBeam_03_Dark_PurpleRed_30ft_1600x400.webm)
    //
    for (let i = 0; i < LIVINGS.length; i++) runVFX(LIVINGS[i], SPAWN_COORDS)
    //-------------------------------------------------------------------------------------------------------------------------------
    async function runVFX(pos1, pos2) {
        const VFX_BEAM = "modules/jb2a_patreon/Library/Generic/Energy/EnergyStrand_Multiple01_Dark_Red_30ft_1600x400.webm"
        const VFX_CLOUD = "modules/jb2a_patreon/Library/Generic/Marker/EnergyStrands_01_Dark_Red_600x600.webm"
        new Sequence()
            .effect()
                .atLocation(pos1)
                .stretchTo(pos2)
                .scale(1)
                .repeats(5,1200)
                .file(VFX_BEAM)
                .waitUntilFinished(-2000) 
            .effect()
                .file(VFX_CLOUD)
                .atLocation(pos1)
                .scale(0.3)
                .opacity(1)
            .play();
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // 5. Apply 2d7 necrotic damage to each
    //
    await jez.wait(6500)
    let damageRoll = new Roll(`${DICE_NUM}${DICE_TYPE}+${BONUS}`).evaluate({ async: false });
    if (TL > 2) jez.trace(`${TAG} damageRoll`,damageRoll)
    game.dice3d?.showForRoll(damageRoll);
    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, DAMAGE_TYPE, LIVINGS, damageRoll,
        {
            flavor: `Vampyr Blood Drain`,
            itemCardId: "new",
            useOther: false
        }
    );
    //-----------------------------------------------------------------------------------------------------------------------------------
    // 6. Post Results
    // 
    msg = `Vampyr drains blood from every living creature in range and appears within the summoning circle.`
    postResults(msg)
    return



}