const MACRONAME = "Aura_of_Annihilation.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Support thevBodak's damage aura which is defined as follows:
 * 
 *    %TOKENNAME% can activate or deactivate this feature as a bonus action. While active, the aura 
 *    deals 5 necrotic damage to any creature that ends its turn within 30 feet of %TOKENNAME%.
 *    Undead and fiends ignore this effect.
 * 
 * This macro does a bunch of things.
 * 
 * OnUse:   Toggles the effect on/off. When it toggles on, it places an effect that includes an 
 *          Active Effect that drives the rest of the process.  
 * doOn:    At one point deleted the effect on immune tokens, but this caused an issue with the 
 *          effect being applied/removed in an infinite loop by active auras, so it now does nothing.
 * doOff:   If the active token is the origin, remove the persistent VFX
 * each:    Apply damage to those not immune along with a VFX.
 * 
 * 11/04/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
if (TL > 1) jez.trace(`${TAG} Active Token: ${aToken.name}`);
let aActor = aToken.actor;
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const COND_NAME = 'Aura of Annihilation'
// const COND_NAME = `${aToken.name}'s Aura`
const DAMAGE_ROLL = "2d4"
const DAMAGE_TYPE = "necrotic"
const VFX_NAME = `${MACRO}-${aToken.name}`
const IMMUNE_RACES = ['undead', 'fiend']
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "on") await doOn({ traceLvl: TL });                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (args[0] === "each") doEach({ traceLvl: TL });					     // DAE everyround
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Post message to new chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function postMessage(title, msg) {
    const RC = await jez.postMessage({
        color: jez.randomDarkColor(),
        fSize: 14,
        icon: aToken.data.img,
        msg: msg,
        title: title,
        token: aToken
    })
    return (RC)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * OnUse, this function will check for teh aura on the active token, removing it if found, adding it
 * it if it wasn't found.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //----------------------------------------------------------------------------------
    // Check for the aura created by this macro, from this actor
    //
    // Examples:
    //   data.origin: Scene.MzEyYTVkOTQ4NmZk.Token.SGSAiWBUM7kTzeB1.Item.t4b3rcea8drrhtbu
    //   aActor.uuid: Scene.MzEyYTVkOTQ4NmZk.Token.SGSAiWBUM7kTzeB1
    //
    const EFFECT = await aToken.actor.effects.find(ef => ef.data.label === COND_NAME &&
        ef.data.origin.includes(aActor.uuid))
    //----------------------------------------------------------------------------------
    // If found, delete the aura and exit with approriate message.
    //
    if (EFFECT) {
        if (TL > 2) jez.trace(`${TAG} Aura on ${aToken.name} found`, EFFECT);
        EFFECT.delete()
        msg = `<b>${aToken.name} has toggled ${COND_NAME} off`
        postResults(msg)
        // Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });
        return
    }
    //----------------------------------------------------------------------------------
    // If missing, add aura and exit with approriate message.
    //
    if (TL > 2) jez.trace(`${TAG} Effect aura "${EFFECT}" on ${aToken.name} not found`);
    const CE_DESC = `${COND_NAME} from ${aToken.name}`
    let effectData = {
        label: COND_NAME,
        icon: aItem.img,
        origin: aItem.uuid,
        disabled: false,
        transfer: false,
        flags: {
            ActiveAuras: {
                alignment: "",
                aura: "All",
                displayTemp: false,
                height: false,
                hostile: true,
                ignoreSelf: true,
                isAura: true,
                onlyOnce: false,
                radius: 30,
                type: ""
            },
            convenientDescription: CE_DESC,
            // core: {
            //     statusId: "true" // This forces the effect icon to display
            // },
            dae: {
                durationExpression: "",
                macroRepeat: "endEveryTurn",
                selfTarget: false,
                specialDuration: ['None'],
                stackable: false,
                transfer: true
            },
        },
        changes: [
            { key: `macro.itemMacro`, mode: jez.ADD, value: `"${aToken.name}" ${aToken.id}`, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
    //----------------------------------------------------------------------------------
    // run VFX on origin
    //
    runVFXorigin(aToken)
    //----------------------------------------------------------------------------------
    // Post message and exit
    //
    msg = `<b>${aToken.name} has toggled ${COND_NAME} on`
    postResults(msg)
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * If effect is applied to creature of type: Undead or Fiend, and this creature isn't the origin, 
 * delete the effect straight away.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOn(options = {}) {
    const FUNCNAME = "doOn()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
    //-----------------------------------------------------------------------------------------------
    // If we're the origin of the effect, just leave
    //
    if (LAST_ARG.origin.includes(aActor.uuid)) return
    //-----------------------------------------------------------------------------------------------
    // If we're not origin of the effect, check to see if immune race, if so remove effect
    // This resulted in some race condition when two bodaks were active, so I moved the operation 
    // to doEach, giving damage immunity
    //
    // const RACE = jez.getRace(aToken)
    // if (IMMUNE_RACES.includes(RACE)) {
    //     // Find and remove the effect just applied
    //     let aEffect = await aToken?.actor?.effects?.find(ef => ef?.id === LAST_ARG.effectId)
    //     if (aEffect) {
    //         await aEffect.delete()
    //         await jez.wait(1000)
    //     }
    // }
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff(options = {}) {
    const FUNCNAME = "doOff()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(1000)
    //-----------------------------------------------------------------------------------------------
    // If we are removing the effect from the origin token, need to cancel the persistent VXF
    //
    if (LAST_ARG.origin.includes(aActor.uuid)) {
        Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });
    }
    //-----------------------------------------------------------------------------------------------
    // That's all Folks
    //
    if (TL > 3) jez.trace(`${TAG} | More Detailed Trace Info.`)
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doEach(options = {}) {
    const FUNCNAME = "doEach()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // If this is executed on the origin token return
    //
    if (LAST_ARG.origin.includes(aActor.uuid)) return
    //-----------------------------------------------------------------------------------------------
    // Get Token5e object for origin token
    //
    let oToken = canvas.tokens.placeables.find(ef => ef.id === args[2])
    if (TL > 1) jez.trace(`${TAG} Origin token data object`, oToken)
    if (!oToken) return jez.badNews(`Could not find origin token, ${args[1]} ${args[2]}`, 'w')
    //-----------------------------------------------------------------------------------------------
    // If the token is of immune type, quietly exit
    //
    const RACE = jez.getRace(aToken)
    if (IMMUNE_RACES.includes(RACE)) return
    //-----------------------------------------------------------------------------------------------
    // If this is executed on non-origin token, roll/apply some damage if in range post a message, 
    // remove the effect then return
    //
    if (TL > 1) jez.trace(`${TAG} Need to apply ${DAMAGE_ROLL} ${DAMAGE_TYPE} damage to ${aToken.name}`);
    // Roll some damage
    let damageRoll = new Roll(`${DAMAGE_ROLL}`).evaluate({ async: false });
    if (TL > 1) jez.trace(`${TAG} Damage Rolled ${damageRoll.total}`, damageRoll)
    game.dice3d?.showForRoll(damageRoll);
    // Apply damage to target
    new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll, DAMAGE_TYPE, [], damageRoll,
        { flavor: "No Workie", itemCardId: "new" /*args[0].itemCardId*/ });
    MidiQOL.applyTokenDamage([{ damage: damageRoll.total, type: DAMAGE_TYPE }], damageRoll.total,
        new Set([aToken]), null /*aItem*/, new Set());
    await postMessage(`Damaged by ${COND_NAME}`, `${aToken.name} takes ${damageRoll.total} 
        ${DAMAGE_TYPE} damage from ${oToken.name}'s ${COND_NAME}.`)
    //-----------------------------------------------------------------------------------------------
    // Get Token5e object for origin token
    //
    runVFXtarget(aToken)
    //-----------------------------------------------------------------------------------------------
    // All done
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/***************************************************************************************************
 * Run some VFX on origin token
 ***************************************************************************************************/
 function runVFXorigin(token) {
    const VFX_TARGET = "modules/jb2a_patreon/Library/Generic/Template/Circle/OutPulse/OutPulse_02_Regular_PurplePink_Loop_600x600.webm"
    const VFX_SCALE = 2.2
    const VFX_OPACITY = 0.2
    new Sequence()
        .effect()
        .file(VFX_TARGET)
        .attachTo(token)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .persist()
        .name(VFX_NAME) 
        .belowTokens(true)
        .play();
}
/***************************************************************************************************
 * Run some VFX on target token
 ***************************************************************************************************/
 function runVFXtarget(token) {
    const VFX_TARGET = "modules/jb2a_patreon/Library/Generic/Impact/Impact_03_Regular_PinkPurple_400x400.webm"
    const VFX_SCALE = 1
    const VFX_OPACITY = 1.0
    new Sequence()
        .effect()
        .file(VFX_TARGET)
        .attachTo(token)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        .play();
}

