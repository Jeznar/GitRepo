const MACRONAME = "Vampyr_Psalm3-Darkness.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 3rd Psalm:  The mists become Vampyr's Essence and heavily obscure the entire ritual area. Light sources can provide dim light 
 *             within the mists. Roll initiative.
 * 
 * This one needs to do the following:
 * 
 * 1. Change Scene Lighting
 * 2. Prompt GM to adjust light sources to only provide dim light
 * 3. Place all appropriate tokens into combat
 * 4. Spaen in Vampyr Essence 20 and Vampyr Essence 10 and add them to combat
 * 5. Adjust the initiative values of Vampyr Essence 10 & 20 to 10.99 and 20.99 respectively
 * 
 * 01/04/23 0.1 Creation of Macro
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
//-----------------------------------------------------------------------------------------------------------------------------------
// Set macro variables
//
const AMBER_ACTOR_NAME = 'Amber Block'
const LANTERN_DIST = 5.5
const GRID_SIZE = canvas.scene.data.grid;     // Stash the grid size
//-----------------------------------------------------------------------------------------------------------------------------------
// Go!
//
psalm3({ traceLvl: TL })
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
 * 3rd Psalm:  The mists become Vampyr's Essence and heavily obscure the entire ritual area. Light sources can provide dim light 
 *             within the mists. Roll initiative.
 * 
 * This one needs to do the following:
 * 
 * 1. Change Scene Lighting
 * 2. Prompt GM to adjust light sources to only provide dim light
 * 3. Place all appropriate tokens into combat
 * 4. Spawn in Vampyr Essence 20 and Vampyr Essence 10 relative to the Amber Block adding to combat at 10.99 and 20.99 respectively
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function psalm3(options = {}) {
    const FUNCNAME = "psalm3(options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Set Macro variables
    //
    const ESSENCE_NAME = 'Vampyr Essence'
    //-----------------------------------------------------------------------------------------------------------------------------------
    // 1. Change Scene Lighting
    // 
    await canvas.scene.update({ "darkness": 1 });
    //-----------------------------------------------------------------------------------------------------------------------------------
    // 2. Prompt GM to adjust light sources to only provide dim light
    //
    let dialogD = new Dialog({
        title: 'GM Adjust Lights',
        content: `Light sources can only emit dim light, manually adjust as needed please.`,
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: 'Ok',
            },
        }
    }).render(true);
    //-----------------------------------------------------------------------------------------------------------------------------------
    // 3. Place all appropriate tokens into combat (filter out the Lanterns, Amber Block, etc.)
    //
    const COMBAT_INELIGIBLE_NAMES = ['Amber Block', 'Flopsy', 'Rogue', 'Vindy', 'Torch']
    const COMBAT_INELIGIBLE_SUBNAMES = ['Dancing Light', 'Ceremonial Lantern - ']
    const TOKENS = canvas.tokens.placeables
    if (TL > 3) jez.trace(`${TAG} Tokens to choose from`, TOKENS)
    const COMBAT_TOKENS = TOKENS.filter(checkCombat)
    if (TL > 3) jez.trace(`${TAG} Combat Eligible Tokens`, COMBAT_TOKENS)
    if (COMBAT_TOKENS.length === 0) return jez.badNews(`${TAG} No combat eligible tokens fround on scene`, 'w')
    // Add first eligible to combat and roll its initiative -- avoids each combatant in their own combat
    await jez.combatAddRemove('Add', COMBAT_TOKENS[0], { traceLvl: 0 })
    await jez.wait(100)
    await jez.combatInitiative(COMBAT_TOKENS[0], { traceLvl: 0 })
    await jez.wait(100)
    // Add all eligiles to combat tracker
    await jez.combatAddRemove('Add', COMBAT_TOKENS, { traceLvl: 0 })
    // await jez.wait(250)
    // Roll initiatives
    await jez.wait(100)
    await jez.combatInitiative(COMBAT_TOKENS, { traceLvl: 0 })
    // Special case Sparky
    await jez.wait(100)
    await specialCaseSparky()
    // Begin combat encounter
    await game.combat.startCombat()
    // Return combat eligible boolean
    function checkCombat(subject) {
        if (COMBAT_INELIGIBLE_NAMES.includes(subject.name)) return false
        for (let i = 0; i < COMBAT_INELIGIBLE_SUBNAMES.length; i++)
            if (subject.name.startsWith(COMBAT_INELIGIBLE_SUBNAMES[i])) return false
        return true
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // 4. Spawn in Vampyr Essence 10 and Vampyr Essence 20 relative to the Amber Block adding to combat at 10.99 and 20.99 respectively
    //
    // First find the center of the circle by getting coords from Amber Block
    let amberToken = canvas.tokens.placeables.find(ef => ef.name === AMBER_ACTOR_NAME)
    if (!amberToken) return jez.badNews(`${TAG} Could not find ${AMBER_ACTOR_NAME} in scene`, 'e')
    console.log('Amber Block', amberToken)
    //
    let x = amberToken.center.x - GRID_SIZE * (LANTERN_DIST)
    let y = amberToken.center.y + GRID_SIZE * (LANTERN_DIST)
    await spawnEssence(x, y, 10);
    x = amberToken.center.x + GRID_SIZE * (LANTERN_DIST)
    await spawnEssence(x, y, 20);
    //------------------------------------------------------------------------------------------------------
    async function spawnEssence(X, Y, RND) {
        hidden = true
        const UPDATES = {
            token: {
                name: `Vampyr Essense ${RND}`,
                hidden: true
            }
        }
        const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
        const ESSENCE = await warpgate.spawnAt({ x: X, y: Y }, ESSENCE_NAME, UPDATES, {}, OPTIONS);
        await jez.wait(50)
        await jez.combatAddRemove('Add', ESSENCE, { traceLvl: 0 })
        await jez.wait(50)
        await jez.combatInitiative(ESSENCE, { formula: `${RND}.99`, traceLvl: 0 }) // Force 20 initiative
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // 5. Post Results
    //
    msg = `The mists become Vampyr's Essence and heavily obscure the entire ritual area. Light sources can provide only dim light 
    within the mists. Combat begins.`
    postResults(msg)
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
     * Wildfire Spirit needs to have initiative set to just after its summoner.  In this case, we're setting up a very hard coded 
     * special case for CAM and Sparky
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
    async function specialCaseSparky() {
        const MASTER_NAME = "CAM"
        const MINION_NAME = "Sparky"
        //-------------------------------------------------------------------------------------------------------------------------------
        // Need to fetch CAM's initiative value
        //
        await jez.wait(100)
        const MASTER_TOKEN = await canvas.tokens.placeables.find(ef => ef.name === MASTER_NAME)
        console.log('MASTER_TOKEN', MASTER_TOKEN)
        if (!MASTER_TOKEN) return
        const MASTER_INIT = MASTER_TOKEN?.combatant?.data?.initiative
        console.log('MASTER_INIT', MASTER_INIT)
        if (!MASTER_INIT) return
        //-------------------------------------------------------------------------------------------------------------------------------
        // Make sure MINION is already in tracker 
        //
        const MINION_TOKEN = await canvas.tokens.placeables.find(ef => ef.name === MINION_NAME)
        console.log('MINION_TOKEN', MINION_TOKEN)
        if (!MINION_TOKEN) return
        //-------------------------------------------------------------------------------------------------------------------------------
        // calculate MINION's intitiative needed to be to just after MASTER
        //
        const MINION_INIT = MASTER_INIT - 0.001
        console.log('MINION_INIT', MINION_INIT)
        //-------------------------------------------------------------------------------------------------------------------------------
        // Adjust MINION's intitiative to just after MASTER
        //
        console.log('MINION_TOKEN.id', MINION_TOKEN.id)
        // await jez.wait(250)
        await jez.combatInitiative([MINION_TOKEN.id], { formula: MINION_INIT, reroll: true, traceLvl: TL })
        await jez.wait(100)
    }
}