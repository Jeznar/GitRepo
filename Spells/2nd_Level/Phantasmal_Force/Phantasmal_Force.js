const MACRONAME = "Phantasmal_Force.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Does some house keeping for the Phantasmal Force Spell.  Specifically:
 * 
 * 1. If nothing was targeted, remove concentration and display an error message
 * 2. If the target made its save, remove concentration and display a message
 * 3. Pair the newly applied effect and concentration
 * 4. Update the convenientDescription of concentrating on caster
 * 5. Update the convenientDescription on the target
 * 6. Use Warpgate to spawn in an actor to represent the phantasmal effect
 * 
 * 10/20/22 0.1 Creation of Macro
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
let aActor = aToken.actor;
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const EFFECT_NAME = "Phantasmal Force"
let ceDesc = ""
const MINION = EFFECT_NAME
const ALLOWED_UNITS = ["", "ft", "any"];
const SPELL_RANGE = jez.getRange(aItem, ALLOWED_UNITS) ?? 60
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
//if (args[0] === "on") await doOn({traceLvl:TL});              // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });     // Midi ItemMacro On Use
if (args[0] === "off") await doOff();                           // Remove the image when effect ends

if (TL > 1) jez.trace(`=== Finished === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function preCheck() {
    if (args[0].targets.length !== 1)       // If not exactly one target 
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, "w");
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
 * Perform the code that runs when this macro is removed by DAE, set On
 * This runs on actor that has the affected applied to it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
// async function doOn(options={}) {
//     const FUNCNAME = "doOn()";
//     const FNAME = FUNCNAME.split("(")[0] 
//     const TAG = `${MACRO} ${FNAME} |`
//     const TL = options.traceLvl ?? 0
//     if (TL>0) jez.trace(`${TAG} --- Starting ---`);
//     //-----------------------------------------------------------------------------------------------
//     // Comments, perhaps
//     //
//     if (TL>3) jez.trace(`${TAG} | More Detailed Trace Info.`)

//     if (TL>1) jez.trace(`${TAG} --- Finished ---`);
//     return true;
// }
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
    // 1. Make sure we had a token targeted
    //
    if (!await preCheck()) {
        clearEffect(aToken.id, "Concentrating")
        msg = `Must target a creature to be effected to be effective.`
        postResults(msg)
        return (false);
    }
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //----------------------------------------------------------------------------------
    // 2. Make sure the target failed it's saving throw 
    //
    if (LAST_ARG.failedSaves.length === 0) {                // Target made it's save
        // clearEffect(aToken.id, "Concentrating")
        if (TL > 2) jez.trace(`${TAG} Target ${tToken.name} made its saving throw`);
        msg = `${tToken.name} shrugs off the effects of ${aToken.name}'s spell.`
        postResults(msg)
        return;
    }
    //-----------------------------------------------------------------------------------------------
    // 3. Pair the newly applied effect and concentration
    //
    await jez.wait(100)
    jez.pairEffectsAsGM(aToken.id, "Concentrating", tToken.id, EFFECT_NAME)
    //-----------------------------------------------------------------------------------------------
    // 4. Update the convenientDescription of concentrating on caster
    //
    ceDesc = `Maintaining ${EFFECT_NAME} afflicting ${tToken.name}'s mind`
    await jez.setCEDesc(aActor, "Concentrating", ceDesc, { traceLvl: TL });
    //-----------------------------------------------------------------------------------------------
    // 5. Update the convenientDescription on the target
    //
    ceDesc = `Afflicted by ${aToken.name}'s ${EFFECT_NAME}`
    await jez.setCEDescAsGM(tToken.id, EFFECT_NAME, ceDesc, { traceLvl: TL });
    //-----------------------------------------------------------------------------------------------
    // 6. Use Warpgate to spawn in an actor to represent the phantasmal effect
    //
    let effectTokenId = await summonToken(tToken)
    if (TL > 1) jez.trace(`${TAG} Token ID of spawned token`, effectTokenId);
    //-----------------------------------------------------------------------------------------------
    // 7. Add watchdog effect to the afflicted token's effect to remove summoned on effect removal
    //
    // Need to modify recently added EFFECT_NAME to include a call to DeleteTokenMacro effectTokenId
    //
    modExistingEffect(aActor, "Concentrating", effectTokenId, {traceLvl:TL})

    /***************************************************************************************************
     * Modify existing effect to include a midi-qol overtime saving throw element
     ***************************************************************************************************/
    async function modExistingEffect(subject, EFFECT_NAME, tokenId, options = {}) {
        const FUNCNAME = "modExistingEffect(options = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `${MACRO} ${FNAME} |`
        const TL = options.traceLvl ?? 0
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "subject", subject, 
            "EFFECT_NAME", EFFECT_NAME, "tokenId", tokenId, "options", options);
        await jez.wait(100) // Chill for a moment
        //---------------------------------------------------------------------------------------------------
        // Set function variables
        //
        sActor = jez.getActor5eDataObj(subject)
        //----------------------------------------------------------------------------------------------
        // Seach the token to find the just added effect
        //
        let effect = await sActor.effects.find(i => i.data.label === EFFECT_NAME);
        if (!effect) return jez.badNews(`${EFFECT} sadly not found`,'i')     
        //----------------------------------------------------------------------------------------------
        // Define the desired modification to existing effect. 
        //    
        effect.data.changes.push({key: `macro.execute`, mode:jez.ADD, value:`DeleteTokenMacro ${tokenId}`, priority: 20})
        //----------------------------------------------------------------------------------------------
        // Apply the modification to existing effect
        //
        await effect.update({ 'changes': effect.data.changes });
    }






    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${TAG} More Detailed Trace Info.`)


    msg = `Maybe say something useful...`
    postResults(msg)
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function summonToken(tToken) {
    let argObj = {
        defaultRange: SPELL_RANGE,
        duration: 3000,                     // Duration of the intro VFX
        introTime: 1000,                    // Amount of time to wait for Intro VFX
        introVFX: '~Energy/SwirlingSparkles_01_Regular_${color}_400x400.webm', // default introVFX file
        minionName: `Phantasm visible only to ${tToken.name}`,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: '~Fireworks/Firework*_02_Regular_${color}_600x600.webm', // default outroVFX file
        scale: 0.7,								// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        templateName: `%${MINION}%`,        // Name of the actor in the actor directory
        width: 2,                           // Width of token to be summoned
        traceLvl: TL
    }
    //--------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    let summonData = await game.actors.getName(MINION)
    argObj.img = summonData ? summonData.img : aItem.img
    //--------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    let returnedIds = await jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
    if (TL > 1) jez.trace(`${TAG} Returned data 1 from spawnAt`, returnedIds[0]);
    return returnedIds[0]
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Remove an effect from passed subject
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function clearEffect(subject, effectName, options = {}) {
    const TL = options.traceLvl ?? 0
    sActor = jez.getActor5eDataObj(subject)
    const EFFECT = await aToken.actor.effects.find(i => i.data.label === effectName);
    if (TL > 1) jez.trace(`${TAG} Attempting to clear ${effectName} from ${subject.name}`, EFFECT)
    if (EFFECT) await EFFECT.delete()
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * When the effect ends, remove the token represented the phantasm on the scene
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff() {
    if (TL > 1) jez.trace("Token to dismiss", args[1])
    warpgate.dismiss(args[1], game.scenes.viewed.id)
    return;
}