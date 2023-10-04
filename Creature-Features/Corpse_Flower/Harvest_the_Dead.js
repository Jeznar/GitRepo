const MACRONAME = "Harvest_the_Dead.0.1.js"
const TL = 0;                               // Trace Level for this macro
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Corpse Flower:  Harvest the dead
 * 
 *   Grab one unsecured dead humanoid within 10 feet of it and stuffs the corpse into itself, along with any 
 *   equipment the corpse is wearing or carrying.
 * 
 * 10/04/22 0.1 Creation of Macro
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
const EFFECT_NAME = 'Corpses'
const EFFECT2_NAME = 'Consumed Corpse'
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
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (args[0].targets.length !== 1)
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, 'w')
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
 * - Make sure we have something targeted
 * - Verify that it is either a PC or a humanoid NPC
 * - Verify that the target is dead 
 * - Update the token of the dead to be on the corpse flower
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
    if (!await preCheck()) return postResults(`Nothing was targeted.`)
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Verify that it is either a PC or a humanoid NPC & is dead, post & exit if target is not dead
    //
    if (await jez.isPC(tActor)) {
        if (tActor.data.data.attributes.death.failure < 3) return postResults(`${tToken.name} is a PC who is not dead.`)
    } else {
        if (tActor.data.data.attributes.hp.value > 0) return postResults(`${tToken.name} is a NPC who is not dead.`)
        let race = jez.getRace(tToken).toLowerCase()
        if (TL > 1) jez.log(`${TAG} | Target race`, race)
        if (!race.includes("humanoid")) return postResults(`Target must be a humanoid. ${tToken.name} is ${race}`)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the token of the dead to be on the corpse flower
    //
    if (TL > 3) jez.log(`${TAG} More Detailed Trace Info.`)
    let newCoords = { x: tToken.x, y: tToken.y };
    if (aToken.x + aToken.w - tToken.w < tToken.x) newCoords.x = aToken.x + aToken.w - tToken.w;
    else if (aToken.x > tToken.x) newCoords.x = aToken.x;
    if (aToken.y + aToken.h - tToken.h < tToken.y) newCoords.y = aToken.y + aToken.h - tToken.h;
    else if (aToken.y > tToken.y) newCoords.y = aToken.y;
    await tToken.document.update({ x: newCoords.x, y: newCoords.y });
    //-------------------------------------------------------------------------------------------------------------------------------
    // Increment the corpse count, If we don't have a CORPSE_EFFECT one needs to be added.
    //
    let ceDesc = await jez.getCEDesc(aToken, EFFECT_NAME, { traceLvl: TL })
    if (TL > 3) jez.log(`${TAG} existing ceDesc, if any`, ceDesc)
    if (!ceDesc) {
        // If we don't already have a corpses buff, lets place one 
        let corpseCnt = Math.floor(Math.random()) * 6 + 5   // One more than usual since it is being added
        const CE_DESC = `Corpses contained: ${corpseCnt}`
        let effectData = [{
            label: EFFECT_NAME,
            icon: 'systems/dnd5e/icons/skills/green_25.jpg',
            origin: L_ARG.uuid,
            disabled: false,
            flags: {
                dae: { stackable: false },
                convenientDescription: CE_DESC,
                isConvenient: true,
                isCustomConvenient: true,
                core: { statusId: 'Force Display' }
            },
        }];
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token.actor.uuid, effects: effectData });
        postResults(`${corpseCnt} body sized bulges are apparent with the foliage of ${aToken.name}`)
    } else {
        let corpseCnt = Number(ceDesc.split(" ")[2])
        if (TL > 3) jez.log(`${TAG} corpse count`, corpseCnt)
        await jez.setCEDesc(aToken, EFFECT_NAME, `Corpses contained: ${1 + corpseCnt}`, { traceLvl: TL });
        postResults(`${aToken.name} pulls ${tToken.name}'s body into itself. There now appear to be ${1 + corpseCnt}
        body sized bulges.`)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply a marker debuff to the corpse
    //
    const CE_DESC = `Consumed by ${aToken.name}`
    let effectData = [{
        label: EFFECT2_NAME,
        icon: aItem.img,
        origin: L_ARG.uuid,
        disabled: false,
        flags: {
            dae: { stackable: false },
            convenientDescription: CE_DESC,
            isConvenient: true,
            isCustomConvenient: true,
            core: { statusId: 'Force Display' }
        },
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: effectData });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 0) jez.log(`${TAG} --- Finished ---`);
    return true;
}