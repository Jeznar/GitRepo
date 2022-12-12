const MACRONAME = "Flaming_Sphere.0.9.js"
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
if (args[0].tag === "OnUse") await doOnUse({traceLvl:TL}); // Midi ItemMacro On Use
if (args[0] === "off") await doOff({traceLvl:TL});                   // DAE removal
//-----------------------------------------------------------------------------------------------------------------------------------
// All done
//
if (TL>1) jez.trace(`${TAG} === Finished ===`);
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
    if (!game.modules.get("advanced-macros")?.active) return jez.badNews(`${TAG} Please enable the Advanced Macros module`,'e')
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
    const SPHERE_DATA = await summonCritter(MINION)
    if (TL > 1) jez.trace(`${TAG} SPHERE_DATA`,SPHERE_DATA)
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
async function summonCritter(MINION, options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"MINION", MINION, "options",options);
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
    let returned = await jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
    if (TL>1) jez.trace(`${TAG} spawnAt returned`,returned)
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
 async function doOff(options={}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Despawn our charge
    //
    let sceneId = game.scenes.viewed.id
    let sphereId = args[1]
    warpgate.dismiss(sphereId, sceneId)
    //-------------------------------------------------------------------------------------------------------------------------------
    // All done
    //
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}