const MACRONAME = "Prismatic_Spray_Helper.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * This macro is triggered by an effect placed by Prismatic Spray.  It grabs the save result and 
 * updates a flag on the actor to track successes and failures for Indigo and Violet beams.  When the
 * cound reaches 3 it takes appropriate action.
 * 
 * 11/29/22 0.1 Creation of Macro
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

//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
// Curiously, this macro is called each turn as an OnUse macro, not as each
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
// if (args[0] === "each") doEach({ traceLvl: TL });					     // DAE everyround
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(Math.floor(Math.random() * 1000))

    //-----------------------------------------------------------------------------------------------
    // Grab beam color and save result from the environment data provided by DAE
    //
    const NAME_ATOMS = aItem.name.split(' ')        // example: "Indigo Beam from TCma6bPCS0YnA6Kc 9"
    const BEAM_COLOR = NAME_ATOMS[0]                // Indigo
    const FLAG_NAME = `${NAME_ATOMS[0]}-${NAME_ATOMS[3]}-${NAME_ATOMS[4]}` // Indigo.TCma6bPCS0YnA6Kc.9
    const SAVED = (args[0].saves.length === 1) ? true : false
    if (TL > 2) jez.trace(`${TAG} Received Information`,
        'NAME_ATOMS', NAME_ATOMS,
        'BEAM_COLOR', BEAM_COLOR,
        'FLAG_NAME', FLAG_NAME,
        'SAVED', SAVED);
    //-----------------------------------------------------------------------------------------------
    // create newValue object 
    //
    let newValue = {
        saves: 0,
        fails: 0
    }
    //-----------------------------------------------------------------------------------------------
    // Grab flag value for this spell (if any)
    //
    let flagValue = await DAE.getFlag(aActor, FLAG_NAME);
    if (TL > 1) jez.trace(`${TAG} Flag values retrieved`, flagValue)
    //-----------------------------------------------------------------------------------------------
    // if we retrieved non-null flag add to newValue
    //
    if (flagValue) {
        newValue.saves += flagValue.saves
        newValue.fails += flagValue.fails
    }
    //-----------------------------------------------------------------------------------------------
    // Increment saves or fails based on SAVED value
    //
    if (SAVED) newValue.saves++
    else newValue.fails++
    //-----------------------------------------------------------------------------------------------
    // Display a message about save/fail status
    //
    if (newValue.saves > 2)
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: aItem.img, title: "Success!  3 Saves",
            msg: `${aToken.name} has made 3 saves, clearing the ${BEAM_COLOR} Beam effect.`,
            token: aToken
        })
    else if (newValue.fails > 2) {
        if (BEAM_COLOR === "Violet") {
            msg = `<b>${aToken.name} has failed 3 times</b>, succumbing to ${BEAM_COLOR} Beam effect.  It is 
            <b>transported to another plane</b> of existence of the GM's choosing and is no longer Blinded.
            <br><br> 
            Typically, a creature that is on a plane that isn't its home plane is banished home, while 
            other creatures are usually cast into the Astral or Ethereal planes.
            <br><br> 
            This needs to be <b>handled manually</b> by the GM.`
            await jezcon.addCondition("Banished", aActor.uuid, {
                allowDups: false, replaceEx: true,
                origin: aActor.uuid, overlay: true, traceLvl: TL
            })
        }
        if (BEAM_COLOR === "Indigo") {
            msg = `<b>${aToken.name} has failed 3 times</b>, succumbing to ${BEAM_COLOR} Beam effect. It 
            <b>permanently turns to stone</b> and is subjected to the <b>Petrified</b> condition.`
            await jezcon.addCondition("Petrified", aActor.uuid, {
                allowDups: false, replaceEx: true,
                origin: aActor.uuid, overlay: true, traceLvl: TL
            })
        }
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: aItem.img, title: "Failure! 3 Fails",
            msg: msg, token: aToken
        })
    }
    else
        jez.postMessage({
            color: jez.randomDarkColor(), fSize: 14, icon: aItem.img, title: "Need 3 saves before 3 fails",
            msg: `Attempting to make saves vs ${BEAM_COLOR} Beam.<br><br>Saves: ${newValue.saves}<br>Fails: ${newValue.fails}`,
            token: aToken
        })
    //-----------------------------------------------------------------------------------------------
    // If we have reached 3 on saves or fails, take additional actions
    //
    if (newValue.saves > 2 || newValue.fails > 2) {
        // Clear the flag from the actor
        await DAE.unsetFlag(aActor, FLAG_NAME);
        // Do Stuff...
        console.log('Do stuff')
        // Find and delete the effect that called this macro
        let effect = aActor.effects.find(ef => ef.data.label === aItem.name)
        await effect.delete()
        return
    }
    //-----------------------------------------------------------------------------------------------
    // Stash the flag value for next pass
    //
    if (TL > 1) jez.trace(`${TAG} Flag values to be stashed`, newValue)
    await DAE.setFlag(aActor, FLAG_NAME, newValue);


    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 3) jez.trace(`${TAG} | More Detailed Trace Info.`)

    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}