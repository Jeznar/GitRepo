const MACRONAME = "Compulsion.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro is on Confusion
 * 
 * 07/22/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TL = 5;                               // Trace Level for this macro
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
        doEachO();  // Origin Actor
        return
    }
    doEachT();      // Target Actor
    return;
}
/***********************************************************************************************
* Do the every turn operations for the ORIGIN of this macro
************************************************************************************************/
async function doEachO() {
    const FUNCNAME = "doEachO()";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    if (TL > 1) jez.trace(`${MACRO} ${FNAME} | Executing on originating actor`);
    //------------------------------------------------------------------------------------------
    // Prepare for and pop a dialog asking the originator what direction his/her minions should 
    // move
    //
    const Q_TITLE = `What Direction for ${aToken.name}'s Minions?`
    const Q_TEXT = `Pick a direction you will order your compulsion victims to move`

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
            doEachO()
            return null;
        }
        if (TL > 1) jez.trace(`${MACRO} ${FNAME} | Choice made: ${choice}`)
        // Generate a chat bubble on the scene, using a World script!
        msg = `I do declare, my minions must move <b>${choice}</b>!`
        bubbleForAll(aToken.id, msg, true, true)
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
async function doEachT() {
    const FUNCNAME = "doEachT()";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    //-----------------------------------------------------------------------------------------------
    // Extract actor UUID from LAST_ARG.origin. UUID should look like one of the following:
    //
    let oToken = await getTokenObjFromUuid(LAST_ARG.origin, { traceLvl: TL })   
    if (!oToken) return
    jez.log("oToken", oToken)
    jez.log("oToken.name", oToken.name)
    jez.log("oToken.actor", oToken.actor)
    //-----------------------------------------------------------------------------------------------
    // Obtain the dirction of movement from the flag set within the originator
    // oToken is likely a PrototypeTokenData in which case actor5e is hiding under document
    //
    let actorObj = null
    if (oToken?.constructor.name === "Token5e") actorObj = oToken.actor
    else if (oToken?.constructor.name === "PrototypeTokenData") actorObj = oToken.document
    else return jez.badNews(`Failed to find actor for ${oToken.name}`,"e")
    let direction = await DAE.getFlag(actorObj, MACRO);
    if (TL > 2) jez.trace("Value of flag obtained from oToken.actor", direction)
    //-----------------------------------------------------------------------------------------------
    // Call out direction of movement.
    //
    msg = `I feel compelled to move <b>${direction}</b!`
    bubbleForAll(aToken.id, msg, true, true)
    msg +=  " But I can use my action normally."
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
    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    modConcentratingEffect(aToken, { traceLvl: TL })
    doEachO()
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}
/***************************************************************************************************
 * Modify existing concentration effect to call this macro as an ItemMacro that will run each turn.
 ***************************************************************************************************/
async function modConcentratingEffect(token5e, optionObj = {}) {
    const FUNCNAME = "modConcentratingEffect(token5e)";
    const FNAME = FUNCNAME.split("(")[0]
    const TL = optionObj?.traceLvl ?? 0
    if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "token5e", token5e);
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
    effect.data.changes.push({ key: `macro.itemMacro`, mode: jez.CUSTOM, value: `arbitrary_arg`, priority: 20 })
    //----------------------------------------------------------------------------------------------
    // Apply the modification to add changes infoto existing effect
    //
    console.log("effect.data", effect.data)
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result) jez.log(`Active Effect ${EFFECT} updated!`, result);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********
 * Obtain the Token5e or PrototypeTokenData asociated with the uuid passed into this function. UUID 
 * might look like one of the following:
 * 
 *   Linked Actor  : Actor.lZ487ouiBiQs3lql.Item.fyhrudodjr8ooucb
 *   Unlinked Actor: Scene.MzEyYTVkOTQ4NmZk.Token.lZ487ouiBiQs3lql.Item.fyhrudodjr8ooucb
 * 
 * Wanting to return: Token5e object or false on falure
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function getTokenObjFromUuid(uuid, optionObj = {}) {
    const FUNCNAME = "getTokenObjFromUuid(uuid, optionObj = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TL = optionObj?.traceLvl ?? 0
    if (TL === 1) jez.trace(`--- Called --- ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Called --- ${FUNCNAME} ---`, "uuid", uuid, "optionObj", optionObj);
    let sUuid = null    // Sought after UUID
    let sToken = null   // Sought Token5e data object
    //-----------------------------------------------------------------------------------------------
    // Split the UUID up into tokens.  Bail out if odd number of tokens found
    //
    if (TL > 2) jez.trace(`Our UUID of interest`, LAST_ARG.origin);
    const UUID_ARRAY = LAST_ARG.origin.split(".")
    let length = UUID_ARRAY.length
    if (TL > 4) for (let i = 0; i < length; i++)
        jez.trace(`${FNAME} | Part ${i} of LAST_ARG.origin`, UUID_ARRAY[i]);
    if (length % 2) return jez.badNews(`${MACRO} ${FNAME} | Passed UUID has odd number of tokens: ${LAST_ARG.origin}`, "e")
    //-----------------------------------------------------------------------------------------------
    // Build the sought for UUID (sUuid)
    //
    if (UUID_ARRAY[0] === "Actor") {        // Apparently dealing with a linked Actor UUID
        if (UUID_ARRAY[1].length !== 16) 
            return jez.badNews(`${MACRO} ${FNAME} | Second token wrong length: ${LAST_ARG.origin}`, "e")
        sUuid = `${UUID_ARRAY[0]}.${UUID_ARRAY[1]}`
    }
    else if (UUID_ARRAY[0] === "Scene") {   // Apparently dealing with an unlinked Actor UUID
        if (UUID_ARRAY[1].length !== 16)
            return jez.badNews(`${MACRO} ${FNAME} | Second token (${UUID_ARRAY[1]}) wrong length: ${LAST_ARG.origin}`, "e")
        if (UUID_ARRAY[2] !== "Token")
            return jez.badNews(`${MACRO} ${FNAME} | Third token (${UUID_ARRAY[2]}) not "Token": ${LAST_ARG.origin}`, "e")
        if (UUID_ARRAY[3].length !== 16)
            return jez.badNews(`${MACRO} ${FNAME} | Forth token (${UUID_ARRAY[3]}) wrong length: ${LAST_ARG.origin}`, "e")
        sUuid = `${UUID_ARRAY[0]}.${UUID_ARRAY[1]}.${UUID_ARRAY[2]}.${UUID_ARRAY[3]}`
    }
    if (!sUuid) return jez.badNews(`${MACRO} ${FNAME} | Received UUID not parsed: ${LAST_ARG.origin}`, "e");
    //-----------------------------------------------------------------------------------------------
    // Obtain the sought after token data (sToken) data object, looking different places for different
    // object types that can be found.
    //
    let oDataObj = await fromUuid(sUuid)    // Retrieves data object for the UUID
    if (oDataObj?.constructor.name === "TokenDocument5e") {
        if (TL > 2) jez.trace(`Found a TokenDocument5e, must be unlinked caster`, oDataObj);
        sToken = oDataObj._object           // Nab the Token5e out of aTokenDocument5e
    }
    else if (oDataObj?.constructor.name === "Actor5e") {
        if (TL > 2) jez.trace(`Found a Actor5e, must be linked caster`, oDataObj);
        sToken = oDataObj.data.token        // PrototypeTokenData object
    }
    else return jez.badNews(`${MACRO} ${FNAME} | Obtained neither TokenDocument5e nor Actor5e from ${oDataObj}`,"e")
    jez.log("sToken", sToken)
    jez.log("sToken.name", sToken.name)
    return(sToken)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
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
        // Clear prexisting value of the flag set for this macro
        //
        await DAE.unsetFlag(aToken.actor, MACRO);
        return
    }
    return jez.trace(`${MACRO} ${FNAME} | doOff invoked for ${aToken.name} doing nothing`)
}