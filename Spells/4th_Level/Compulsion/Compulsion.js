const MACRONAME = "Compulsion.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This is a complex macro to implement Compulsion.
 * 
 * 07/22/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const VFX_FILE = 'Icons_JGB/Spells/4th_Level/Compulsion.png'        // Move in random direction
const DIRECTIONS = [
    "East (Right)", "South East (Down/Right)", "South (Down)", "South West (Down/Left)",
    "West (Left)", "North West (Up/Left)", "North (Up)", "North East (Up/Right)"];
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "each") doEach();					        // DAE everyround
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "off") await doOff();                   // DAE removal
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doEach() {
    const FUNCNAME = "doEach()";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Do different steps for the origin and target actor(s)
    //
    if (LAST_ARG.origin.includes(LAST_ARG.actorUuid)) { // doEach running on originating actor
        doEachOrigin();  // Origin Actor
        return
    }
    doEachTarget();      // Target Actor
    return;
}
/***********************************************************************************************
* Do the every turn operations for the ORIGIN of this macro
************************************************************************************************/
async function doEachOrigin() {
    const FUNCNAME = "doEachOrigin()";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    if (TL > 1) jez.trace(`${MACRO} ${FNAME} | Executing on originating actor`);
    //------------------------------------------------------------------------------------------
    // Prepare for and pop a dialog asking the originator what direction his/her minions should 
    // move
    //
    const Q_TITLE = `What Direction for ${aToken.name}'s Minions?`
    const Q_TEXT = `If you want to use your bonus action this round on this spell, pick a 
    direction you will order your compulsion victims to move and click the OK button.  Otherwise, 
    click the Cancel button to save Bonus action for something else.`
    jez.pickRadioListArray(Q_TITLE, Q_TEXT, dirCallBack, DIRECTIONS);
    /********************************************************************************************
     * Callback function to handle menu choice.
     *******************************************************************************************/
    async function dirCallBack(choice) {
        const FUNCNAME = "dirCallBack(choice)"
        const FNAME = FUNCNAME.split("(")[0]
        if (TL > 0) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
        if (TL > 1) jez.trace(`${MACRO} ${FNAME} | Menu choice`, choice);
        if (!choice) {
            if (TL > 1) jez.trace("${MACRO} ${FNAME} | Falsy choice made", choice)
            await DAE.unsetFlag(aToken.actor, MACRO);
            // doEachOrigin()
            return null;
        }
        if (TL > 1) jez.trace(`${MACRO} ${FNAME} | Choice made: ${choice}`)
        // Generate a chat bubble on the scene, using a World script!
        msg = `I do declare, my minions must move <b>${choice}</b>!`
        bubbleForAll(aToken.id, msg, true, true)
        msg = msg + `<br><br>I spent my BONUS ACTION to issue that command.`
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img,
            msg: msg, title: `${aToken.name} says...`, token: aToken
        })
        //-----------------------------------------------------------------------------------------
        // Display flag object for our actor
        //
        if (TL > 3) jez.trace(`${aToken.name} current DAE flagObj content`, aToken.actor.data.flags.dae)
        //-----------------------------------------------------------------------------------------
        // Clear any prexisting value of the flag set for this macro
        //
        await DAE.unsetFlag(aToken.actor, MACRO);
        //-----------------------------------------------------------------------------------------
        // Display the value of the flag afetr the clearing
        //
        let currentValue = await DAE.getFlag(aToken.actor, MACRO);
        if (TL > 4) jez.trace("Value of flag after clear", currentValue)
        //-----------------------------------------------------------------------------------------
        // Add the direction choice to the flag
        //
        await DAE.setFlag(aToken.actor, MACRO, choice);
        //-----------------------------------------------------------------------------------------
        // Display the value of the flag
        //
        currentValue = await DAE.getFlag(aToken.actor, MACRO);
        if (TL > 3) jez.trace(`Value of flag after adding ${choice}`, currentValue)
    }
}
/************************************************************************************************
// Do the every turn operations for a TARGET of this macro
************************************************************************************************/
async function doEachTarget() {
    const FUNCNAME = "doEachTarget()";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Extract actor UUID from LAST_ARG.origin. UUID should look like one of the following:
    //
    let oToken = await jez.getTokenObjFromUuid(LAST_ARG.origin, { traceLvl: TL })
    if (!oToken) return
    //-----------------------------------------------------------------------------------------------
    // Obtain the dirction of movement from the flag set within the originator
    // oToken is likely a PrototypeTokenData in which case actor5e is hiding under document
    //
    let actorObj = null
    if (oToken?.constructor.name === "Token5e") actorObj = oToken.actor
    else if (oToken?.constructor.name === "PrototypeTokenData") actorObj = oToken.document
    else return jez.badNews(`Failed to find actor for ${oToken.name}`, "e")
    let direction = await DAE.getFlag(actorObj, MACRO);
    if (!direction) {
        return
    }
    if (TL > 2) jez.trace("Value of flag obtained from oToken.actor", direction)
    //-----------------------------------------------------------------------------------------------
    // Call out direction of movement.
    //
    msg = `I feel compelled to move <b>${direction}</b!`
    bubbleForAll(aToken.id, msg, true, true)
    msg += " But I can use my action normally."
    jez.postMessage({
        color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img,
        msg: msg, title: `${aToken.name} says...`, token: aToken
    })
    //-----------------------------------------------------------------------------------------------
    // Run the visual effects (VFX) on the target
    //
    runVFX(VFX_FILE)
    //-----------------------------------------------------------------------------------------------
    // Done
    //
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
    //-----------------------------------------------------------------------------------------------
    // Run simple video on the token with the attitude change
    //
    function runVFX(fileName) {
        new Sequence()
            .effect()
            .file(fileName)
            .atLocation(aToken)
            .center()
            .scaleToObject(1)
            .opacity(1)
            .fadeIn(1500)
            .duration(7000)
            .fadeOut(1500)
            .play()
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    await jez.wait(100)
    const RANGE = jez.getRange(aItem, ["", "ft", "any"]) ?? 30
    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);


    await pickProcessTargets(RANGE, {traceLvl: TL})
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}
/***************************************************************************************************
 * Check for targets that can hear and are in range. Pop a dialog to pick actual targets. Do saves
 * apply compulsion effect to those who failed. 
 * 
 *  1. Build list of all tokens in range that are not deafened and have unblocked LoS
 *  2. Build and pop dialog to pick targets, passing control onto callback function.
 *  3. Setup variables and handle cancel or X choices from the dialog
 *  4. Handle a cancel or X button from previous dialog, cancel loops back to calling function
 *  5. Build an array of objects representing the selected targets of this spell
 *  6. Process the tokens that might be affected, rolling saves and making lists of results
 *  7. Apply our CE Compulsion effect modified to include an overTime element to failues
 *  8. Craft results message with summary of made and failed saves and post it. 
 *  9. Modify the (hopefully) existant concentration effect on the caster.
 * 10. Run the each turn function for the initial time on the caster.
 ***************************************************************************************************/
async function pickProcessTargets(RANGE=30, optionObj = {}) {
    const FUNCNAME = "pickProcessTargets(RANGE=30, optionObj = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TL = optionObj?.traceLvl ?? 0
    if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`);
    let potTargNames = []
    //-------------------------------------------------------------------------------------------------------
    // Step 1. Build list of all tokens in range that are not deafened and have unblocked LoS
    //
    let options = {
        chkHear: true,          // Boolean (false is default)
        chkDeaf: true,          // Boolean (false is default)
        traceLvl: TL,           // Trace level, integer typically 0 to 5
    }
    let potTargs = await jez.inRangeTargets(aToken, RANGE, options);
    if (TL > 0) jez.trace(`${MACRO} ${FNAME} | potTargs`, potTargs)
    if (!potTargs) return jez.badNews(`No effectable targets in range`, "i")  
    for (let i = 0; i < potTargs.length; i++) {
        if (TL > 0) jez.trace(`${MACRO} ${FNAME} | ${i+1}) ${potTargs[i].name} is a potential victim.`)
        potTargNames.push(`${potTargs[i].name} {${potTargs[i].id}}`)
    }
    //-------------------------------------------------------------------------------------------------------
    // Step 2. Build and pop dialog to pick targets, passing control onto callback function.
    //
    const Q_TITLE = `Targets for ${aToken.name}'s Spell?`
    const Q_TEXT = `Pick targets that ${aToken.name} wants to force to roll saves or be affected by Spell.`
    await jez.pickCheckListArray(Q_TITLE, Q_TEXT, checkCallBack, potTargNames.sort());
    //-------------------------------------------------------------------------------------------------------
    // Step 3. Setup variables 
    //
    async function checkCallBack(selection) {
        const FUNCNAME = "checkCallBack(selection)";
        const FNAME = FUNCNAME.split("(")[0]
        const TL = optionObj?.traceLvl ?? 0
        const SAVE_TYPE = "wis"
        const SAVE_DC = aActor.data.data.attributes.spelldc;
        let failSaves = []  // Array to contain the tokens that failed their saving throws
        let madeSaves = []  // Array to contain the tokens that made their saving throws
        let madeNames = ""  // String with concatination of names that made saves
        let failNames = ""  // String with concatination of names that fail saves
        if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
        if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "Selection", selection);
        //---------------------------------------------------------------------------------------------------
        // Step 4. Handle a cancel or X button from previous dialog
        //
        msg = `pickCheckCallBack: ${selection.length} actor(s) selected in the dialog`
        if (TL > 3) jez.trace(msg)
        if (selection === null) return;     // Cancel button was selected on the preceding dialog
        if (selection.length === 0) {       // Nothing was selected
            if (TL > 0) jez.trace(`${MACRO} ${FNAME} | No selection passed to pickCheckCallBack(selection), trying again.`)
            itemCallBack(itemSelected)		// itemSelected is a global that is passed to preceding func
            return;
        }
        //--------------------------------------------------------------------------------------------
        // Step 5. Build array of objects representing the selected targets of this spell from dialog
        //
        let tObjs = []                                  // Target Objects array
        for (let i = 0; i < selection.length; i++) {
            const TOKEN_ARRAY = selection[i].split("{") // Split the selection of braces "{"
            if (TOKEN_ARRAY.length < 2) return jez.badNews(`${MACRO} ${FNAME} | Bad parse of ${selection[i]}`, "e")
            const TOKEN_ID = TOKEN_ARRAY[TOKEN_ARRAY.length - 1].slice(0, -1);  // Clip trailing }
            tObjs.push(canvas.tokens.placeables.find(ef => ef.id === TOKEN_ID)) // Add object to array
        }
        //---------------------------------------------------------------------------------------------
        // Step 6. Process the tokens that might be affected, rolling saves and making lists of results
        //         Also, run a RuneVFX on each targeted token, saves get shorter duration.
        //
        const COLOR = jez.getRandomRuneColor()
        const SCHOOL = jez.getSpellSchool(aItem)      
        for (let i = 0; i < tObjs.length; i++) {
            let save = (await tObjs[i].actor.rollAbilitySave(SAVE_TYPE, { chatMessage: false, fastforward: true }));
            if (save.total < SAVE_DC) {
                jez.runRuneVFX(tObjs[i], SCHOOL, COLOR)
                if (TL > 2) jez.trace(`${MACRO} ${FNAME} | ${tObjs[i].name} failed: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
                failSaves.push(tObjs[i])
                failNames += `<b>${tObjs[i].name}</b>: ${save.total} (${save._formula})<br>`
            } else {
                runRuneVFX(tObjs[i], SCHOOL, COLOR)
                if (TL > 2) jez.trace(`${MACRO} ${FNAME} | ${tObjs[i].name} saved: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
                madeSaves.push(tObjs[i])
                madeNames += `<b>${tObjs[i].name}</b>: ${save.total} (${save._formula})<br>`
            }
        }
        if (TL > 3) jez.trace(`${FNAME} | Failed Saves ===>`, failSaves)
        //---------------------------------------------------------------------------------------------
        // Step 7. Apply our CE Compulsion effect modified to include an overTime element to failues
        //
        let effectUuids = ""
        let effectData = game.dfreds.effectInterface.findEffectByName("Compulsion").convertToObject();
        if (TL > 3) jez.trace(`${FNAME} | effectData >`, effectData)
        let overTimeVal = `turn=end, saveAbility=${SAVE_TYPE}, saveDC=${SAVE_DC},label="Save vs Compulsion"`
        effectData.changes.push({
            key: `flags.midi-qol.OverTime`, mode: jez.OVERRIDE, value: overTimeVal,
            priority: 20
        })
        if (TL > 3) jez.trace(`${FNAME} | updated ===>`, effectData)
        for (let i = 0; i < failSaves.length; i++) {
            if (TL > 2) jez.trace(`${FNAME} | Apply affect to ${failSaves[i].name}`)
            await game.dfreds.effectInterface.addEffectWith({
                effectData: effectData,
                uuid: failSaves[i].actor.uuid, origin: aItem.uuid
            });
            compulsionEffect = failSaves[i].actor.effects.find(ef => ef.data.label === "Compulsion")
            if (!compulsionEffect) return badNews(`Compulsion effect didn't stick...`, "e")
            // Strip off the last part of the UUID: <Goodstuff>.ActiveEffect.3F8dtbZ6JqNZ21av
            let xyz = compulsionEffect.uuid.slice(0, -30) // Chop off .ActiveEffect.3F8dtbZ6JqNZ21av
            effectUuids = effectUuids + xyz + ' '
        }
        if (TL > 2) jez.trace(`${FNAME} | effectUuids >${effectUuids}<`)
        //---------------------------------------------------------------------------------------------
        // Step 8. Craft results message with summary of made and failed saves and post it.
        //
        let chatMessage = await game.messages.get(args[args.length - 1].itemCardId);
        await jez.wait(100)
        if (madeNames) {
            msg = `<b><u>Successful ${SAVE_TYPE.toUpperCase()} Save</u></b> vs DC${SAVE_DC}<br>${madeNames}`
            await jez.wait(100)
            jez.addMessage(chatMessage, { color: "darkgreen", fSize: 14, msg: msg, tag: "damage" })
        }
        if (failNames) {
            msg = `<b><u>Failed ${SAVE_TYPE.toUpperCase()} Save</u></b> vs DC${SAVE_DC}<br>${failNames}`
            await jez.wait(100)
            jez.addMessage(chatMessage, { color: "darkred", fSize: 14, msg: msg, tag: "damage" })
        }
        //---------------------------------------------------------------------------------------------
        // Step 9. Modify the (hopefully) existant concentration effect on the caster.
        //
        await modConcentratingEffect(aToken, effectUuids, { traceLvl: TL })
        //---------------------------------------------------------------------------------------------
        // Step 10. Run the each turn function for the initiial time on the caster.
        //
        await doEachOrigin()
    }
}
/***************************************************************************************************
 * Modify existing concentration effect to call this macro as an ItemMacro that will run each turn.
 ***************************************************************************************************/
async function modConcentratingEffect(token5e, effectUuids, optionObj = {}) {
    const FUNCNAME = "modConcentratingEffect(token5e, effectUuids, optionObj = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TL = optionObj?.traceLvl ?? 0
    if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "token5e", token5e, "effectUuids", 
        effectUuids, "optionObj", optionObj);
    const EFFECT = "Concentrating"
    //----------------------------------------------------------------------------------------------
    // Seach the token to find the just added concentrating effect
    //
    await jez.wait(100)
    let effect = await token5e.actor.effects.find(i => i.data.label === EFFECT);
    if (TL > 1) jez.trace(`${FNAME} | ${EFFECT}`, effect);
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to the changes data
    //  
    effect.data.flags.dae = {
        itemData: aItem,
        macroRepeat: "startEveryTurn",
        stackable: false
    }
    await effect.data.update({ 'flags': effect.data.flags });
    await jez.wait(50)
    effect.data.changes.push({ key: `macro.itemMacro`, mode: jez.CUSTOM, value: effectUuids, priority: 20 })
    //----------------------------------------------------------------------------------------------
    // Apply the modification to add changes infoto existing effect
    //
    if (TL > 1) jez.trace(`${FNAME} | effect.data`, effect.data)
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result && TL>1) jez.trace(`${FNAME} | Active Effect ${EFFECT} updated!`, result);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off. Treating the origin and 
 * targeted tokens differently.
 * 
 * Origin: Clear the applied to all targets who still have it and clear flag
 * Target: Do nothing, just return (this will be called since we need the each for targets)
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff() {
    const FUNCNAME = "doOff()";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL === 1) jez.trace(`--- Called --- ${MACRO} --- ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Called --- ${MACRO} ${FUNCNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Do different steps for the origin and target actor(s)
    //
    if (LAST_ARG.origin.includes(LAST_ARG.actorUuid)) { // doEach running on originating actor
        //-------------------------------------------------------------------------------------------
        // Clear any remaining effects on targeted tokens
        //
        for (let i = 1; i <= args.length -2; i++) {
            if (TL>1) jez.trace(`${MACRO} ${FNAME} | Clearing effect from target #${i}`, args[i] );
            await jez.wait(100)
            jezcon.remove("Compulsion", args[i], {traceLvl: TL});
        }
        //-------------------------------------------------------------------------------------------
        // Clear prexisting value of the flag set for this macro
        //
        await DAE.unsetFlag(aToken.actor, MACRO);
        return
    }
    return jez.trace(`${MACRO} ${FNAME} | doOff invoked for ${aToken.name} doing nothing`)
}
/***************************************************************************************************
 * Run a 2 part spell rune VFX on indicated token  with indicated rune, Color, scale, and opacity
 * may be optionally specified.
 * 
 * If called with an array of target tokens, it will recursively apply the VFX to each token 
 ***************************************************************************************************/
 async function runRuneVFX(target, school, color, scale, opacity) {
    school = school || "enchantment"            // default school is enchantment \_(ツ)_/
    color = color || jez.getRandomRuneColor()   // If color not provided get a random one
    scale = scale || 1.2                        // If scale not provided use 1.0
    opacity = opacity || 1.0                    // If opacity not provided use 1.0
    // jez.log("runRuneVFX(target, school, color, scale, opacity)","target",target,"school",school,"scale",scale,"opacity",opacity)
    if (Array.isArray(target)) {                // If function called with array, do recursive calls
        for (let i = 0; i < target.length; i++) jez.runRuneVFX(target[i], school, color, scale, opacity);
        return (true)                           // Stop this invocation after recursive calls
    }
    //-----------------------------------------------------------------------------------------------
    // Build names of video files needed
    // 
    const INTRO = `jb2a.magic_signs.rune.${school}.intro.${color}`
    const OUTRO = `jb2a.magic_signs.rune.${school}.outro.${color}`
    //-----------------------------------------------------------------------------------------------
    // Play the VFX
    // 
    new Sequence()
        .effect()
        .file(INTRO)
        .atLocation(target)
        .scaleToObject(scale)
        .opacity(opacity)
        .waitUntilFinished(-500)
        .fadeOut(1500)
        .effect()
        .file(OUTRO)
        .atLocation(target)
        .scaleToObject(scale)
        .opacity(opacity)
        .fadeOut(2000)
        .play();
}