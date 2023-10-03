const MACRONAME = "Soul_Rend.0.1.js"
const TL = 0;                               // Trace Level for this macro
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * This macro is intended to be run twice.  Once before the item is rolled, then after things complete. First pass is to set the 
 * targets.  Second pass runs VFX/
 * 
 * 10/04/23 0.1 Creation of Macro
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

//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.macroPass === 'preItemRoll') {       // Execute only when called before the item
   preItemRoll({ traceLvl: TL });               // Manipulate the data to set correct targets
   return
}
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
// DamageBonus must return a function to the caller
if (TL > 1) jez.log(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODYo
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the2 setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (args[0].targets.length !== 1)
        return jez.badNews(`Must target exactly one target.  ${args[0].targets?.length} were targeted.`, 'w')
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 2) jez.log("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preItemRoll(options = {}) {
    const FUNCNAME = "preItemRoll(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Find tokens in a 20-foot radius centered on aActor that aActor has a LoS to
    //
    let opts = {
        direction: "o2t",       // t2o or o2t (Origin to Target) (t2o is default) 
        chkSight: true,         // Boolean (false is default)
        traceLvl: 0,           // Trace level, integer typically 0 to 5
    }
    const IN_RANGE_TOKENS = await jez.inRangeTargets(aToken, 20, opts);
    if (IN_RANGE_TOKENS.length === 0) return jez.badNews(`No valid targets in range`, "i")
    if (TL>2) for (let i = 0; i < IN_RANGE_TOKENS.length; i++) jez.log(`${TAG} Targeting: ${IN_RANGE_TOKENS[i].name}`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Filter that list down to just humanoids. More specically, filter it to all PCs and NPCs that have race humanioid and put their 
    // token Ids into a handy array that will be used to set targets.
    //
    let validTargets = []
    for (i = 0; i < IN_RANGE_TOKENS.length; i++) {
        if (TL > 3) jez.log(`${TAG} Checking Validity`,
            `IN_RANGE_TOKENS[${i}]             `, IN_RANGE_TOKENS[i],
            `jez.isPC(IN_RANGE_TOKENS[${i}])   `, await jez.isPC(IN_RANGE_TOKENS[i],
            `jez.getRace(IN_RANGE_TOKENS[${i}])`, jez.getRace(IN_RANGE_TOKENS[i]).toLowerCase()))
        if (await jez.isPC(IN_RANGE_TOKENS[i]) || (jez.getRace(IN_RANGE_TOKENS[i]).toLowerCase() === 'humanoid')) 
            validTargets.push(IN_RANGE_TOKENS[i].id)
    }
    if (TL > 3) jez.log(`${TAG} Arg Data`, 'targetUuids', L_ARG.targetUuids, 'targets    ', L_ARG.targets,  'validTargets ', validTargets );
    // Ex: game.user.updateTokenTargets(['SRE8HPMu1ZaIx7K5'])
    game.user.updateTokenTargets(validTargets)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return true;
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
    if (args[0].targets.length === 0) return jez.badNews(`No valid targets`,'i')
    //-------------------------------------------------------------------------------------------------------------------------------
    // Loop through the targets running our VFX
    //
    for (i = 0; i < args[0].targets.length; i++) {
        runVFX( args[0].targets[i], aToken)
        await jez.wait(250 + 500 * Math.random() )
        if (TL > 1) jez.log(`${TAG} Targeted`, args[0].targets[i].name);
    } 
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `Rends the souls of ${args[0].targets.length} victims`
    postResults(msg)
    if (TL > 0) jez.log(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Run a nice little VFX from active token to summoning token
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function runVFX(target, caster) {
    const BEAM_VFX = 'jb2a.energy_beam.normal.greenyellow.02'
    new Sequence()
        .effect()
            .file(BEAM_VFX)
            .atLocation(target)
            .stretchTo(caster)
        .play();
}