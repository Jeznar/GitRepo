const MACRONAME = "Stench.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Implment the save and effects portion of a Ghast's stench ability.
 * 
 * This is intended to be used as an ItemMacro invoked from an ability that triggers the appropriate
 * saving throw.  It depends on that saving throw result and having a single token targeted. It does:
 * 
 * 1. Check to see if the target is immune, if so post message and return.
 * 2. If the target failed save, apply a 1 turn POISONED effect from existing CE effect
 * 3. If the target saved, apply a 24 hour immunity effect
 * 4. Post results.
 * 
 * 09/22/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
const IMMUNE = `Stench Immune`
const POISONED = `Poisoned`
const IMMU_ICON = "Icons_JGB/Monster_Features/Skunk_No.png"
const POIS_ICON = "Icons_JGB/Monster_Features/Skunk.png"
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          // Midi ItemMacro On Use
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function preCheck() {
    const FUNCNAME = "preCheck()";
    const FNAME = FUNCNAME.split("(")[0]

    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`
        if (TL > 3) jez.trace(`${FNAME} | ${msg}`)

        ui.notifications.warn(msg)
        postResults(msg);
        return (false);
    }
    return (true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
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
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //----------------------------------------------------------------------------------
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------
    // Launch VFX on aToken
    // 
    runVFX(aToken);
    //-----------------------------------------------------------------------------------------------
    // If target is immune, post message and get on with life
    //
    if (jezcon.hasCE( IMMUNE, tActor.uuid, {traceLvl: TL} )) {
        if (TL > 1) jez.trace(`${TAG} Target ${tToken.name} is already immune`);
        console.log("TODO: Post already immune message")
        msg = `<b>${tToken.name}</b> is immune to ${aItem.name} from recent exposure.`
        postResults(msg)
        return
    }
    //-----------------------------------------------------------------------------------------------
    // If the target did not save apply a 1 turn POISONED effect
    //
    if (args[0].saves.length === 0) {
        if (TL > 1) jez.trace(`${TAG} Target ${tToken.name} failed its save`);
        // Retrieve as an object, the POISONED Convenient Effect for modification
        let effectData = game.dfreds.effectInterface.findEffectByName(POISONED).convertToObject();
        // If debugging, dump out the effect data object
        if (TL>3) jez.trace(`${TAG} effectData objtained`, effectData)  
        // The standard Poisoned CE lags a "dae" field in its flags, so it needs to be added
        effectData.flags.dae = { specialDuration : [ "turnStart" ] }
        // Change the icon used to one specific to this spell
        effectData.icon = POIS_ICON
        // Change the convenient description to one specific to this spell
        effectData.description = "Poisoned by overwhelming stench, disadvantage on attack rolls and ability checks."
        // If debugging, dump out the effect data object after the updates
        if (TL>3) jez.trace(`${TAG} updated ===>`, effectData)  
        // Slap the updated CE onto our targeted actor
        game.dfreds.effectInterface.addEffectWith({ effectData: effectData, uuid: tActor.uuid, origin: aActor.uuid });
        // Set msg with result for later display
        msg = `<b>${tToken.name}</b> has been poisoned by the effects of ${aItem.name} for one turn.`
    }
    //-----------------------------------------------------------------------------------------------
    // If target saved, craft and apply an immunity effect
    //
    if (args[0].saves.length === 1) {
        if (TL > 1) jez.trace(`${TAG} Target ${tToken.name} made its save`);
        let effectData = {
            label: IMMUNE,
            icon: IMMU_ICON,
            origin: LAST_ARG.uuid,
            disabled: false,
            duration: { seconds: 86400, startTime: game.time.worldTime },
            flags: {
                dae: { itemData: aItem },
                isConvenient: true,
                isCustomConvenient: true,
                convenientDescription: `Immmune to Stench's Poison effect`
            },
        };
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
        msg = `${tToken.name} resists the effect of ${aItem.name} and is now immune to it for 24 hours.`;
    }
    //-----------------------------------------------------------------------------------------------
    // Post completion message
    //
    postResults(msg)
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/***************************************************************************************************
 * Run some VFX on token
 ***************************************************************************************************/
 function runVFX(token) {
    const VFX_TARGET = "jb2a.markers.poison.dark_green.01"
    const VFX_SCALE = 0.8
    const VFX_OPACITY = 0.7

    new Sequence()
        .effect()
        .file(VFX_TARGET)
        .attachTo(token)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        .play();
}