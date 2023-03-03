const MACRONAME = "Relight_Vampyr_Lantern.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *   Relighting one of the ritual lanterns requires a bonus action and a successful DC 13 Wisdom (Survival), 
 *   Dexterity (Sleight of Hand) or Intelligence (Religion) check, as the mists will attempt to smother any flame about 
 *   to be lit and dampen the spirits or drag at the fingers of those who are attempting the task.
 * 
 * 12/31/22 0.1 Creation of Macro
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
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (args[0].targets.length !== 1) return jez.badNews(`Target one target.  ${args[0]?.targets?.length} were targeted.`, 'w')
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
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
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Make sure target is a Ceremonial Lantern that needs lit
    //
    if (!tToken.name.startsWith('Ceremonial Lantern')) return jez.badNews(`Must target a Ceremonial Lantern`, 'i')
    if (tToken.data.light.bright) return jez.badNews(`${tToken.name} is already lit`, 'i')
    //-------------------------------------------------------------------------------------------------------------------------------
    // Make DC 13 Wisdom (Survival), Dexterity (Sleight of Hand) or Intelligence (Religion) check
    //
    const SKILL_DC = 13
    const SURVIVAL = aActor.data.data.skills.sur.total
    const SLEIGHTH = aActor.data.data.skills.slt.total
    const RELIGION = aActor.data.data.skills.rel.total
    const MOD = Math.max(SURVIVAL, SLEIGHTH, RELIGION)
    if (TL>1) jez.trace(`${TAG} ${aToken.name} Modifiers`, 'SURVIVAL',SURVIVAL, 'SLEIGHTH',SLEIGHTH, 'RELIGION', RELIGION, 'MOD', MOD)
    //
    let skill = 'Survival'
    let skillType = 'sur'
    if (MOD === SLEIGHTH) { skill = 'Sleight of Hand'; skillType = 'slt' }
    if (MOD === RELIGION) { skill = 'Religion'; skillType = 'rel' }
    if (TL>1) jez.trace(`${TAG} ${aToken.name} Modifiers`, 'skill', skill, 'skillType', skillType)
    //
    const FLAVOR = `${aToken.name} attempts a ${skill} check vs <b>DC${SKILL_DC}</b> to light ${tToken.name}.`
    let check = (await aActor.rollSkill(skillType, { flavor: FLAVOR, chatMessage: true, fastforward: true })).total;
    //(
    if (check < SKILL_DC ) {
        msg = `${aToken.name} failed to use ${skill} skill to relight ${tToken.name}`
        postResults(msg)
        return
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Obtain color to be used. Typical Token Name: Ceremonial Lantern - Yellow
    //
    const TOKEN_ATOMS = tToken.name.split(" ")       // Trim off the version number and extension
    const COLOR = TOKEN_ATOMS[TOKEN_ATOMS.length - 1]
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the lantern to cast light
    //
    let updates = [];
    updates.push({
        _id: tToken.id,
        'light.bright': 30,
        'light.dim': 60,
        img: `Tiles_JGB/Terrain/Lantern_Ceremonial/Lantern-Ceremony-${COLOR}.png`
    });
    await jez.updateEmbeddedDocs("Token", updates)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `${aToken.name} successfully used ${skill} skill to relight ${tToken.name}`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}