const MACRONAME = "Find_Familiar.1.0.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Look in the sidebar for creatures that can serve as fams and provide a list of options for
 * the find fam spell. Then, execute the summon with jez.spawnAt (WarpGate)
 * 
 Assumptions & Preconditions
 * Name to be used for the familiar has been set with "Set Familiar Name"
 * One or more familiars are stored in the folder defined by FAM_FLDR ("Familiars")
 * Familiars, if any, for Chain Locks stored in FAM_FLDR_CHAIN ("Familiars Pact of the Chain")
 * Feature named PACT_OF_THE_CHAIN ("Pact of the Chain") spelled exactly enables Chain Lock
 * Familiars have unique names, i.e. there is only one "bat," "raven," etc.
 * Feature CHAIN_MASTER, if present results in message reminding that this is not automated.

 * 08/18/22 1.0 Creation
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
const FAM_FLDR = "Familiars"
const FAM_FLDR_CHAIN = "Familiars Pact of the Chain"
const PACT_OF_THE_CHAIN = "Pact of the Chain"
const CHAIN_MASTER = "Invocation: Investment of the Chain Master"
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
let aActor = aToken.actor;
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
//
let famNames = []   // Global array to hold the list of familiar names
const FLAG_NAME = "familiar_name"
const FAMILIAR_NAME = DAE.getFlag(aActor, FLAG_NAME)
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
// jez.log(`============== Finishing === ${MACRONAME} =================`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********
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
    // Obtain the list of familiars that can be choosen from
    // 
    famOpts = getFamiliarOptions({ traceLvl: TL })
    if (!famOpts) return jez.badNews(`No familiars to choose from found`, "e")
    //-----------------------------------------------------------------------------------------------
    // Build an array of familiar names, sort it and make sure they are unique
    //
    for (let i = 0; i < famOpts.length; i++) famNames.push(famOpts[i].name)
    famNames = famNames.sort()
    for (let i = 1; i < famNames.length; i++)
        if (famNames[i - 1] === famNames[i])
            return jez.badNews(`Duplicate familiar option (${famNames[i]} found, not allowed)`, "e")
    console.log(`famNames`, famNames)
    //-----------------------------------------------------------------------------------------------
    // If we have more than one familiar choice, setup and run a dialog to select the familiar
    //
    if (famNames.length > 1) popDialog1(famNames, { traceLvl: TL })
    else {
        console.log("TODO: NEED SHORT CIRCUIT TO SUMMON THE ONLY AVAILABLE FAMILIAR OPTION")
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
 * Grab Familiar Options
 * 
 * Returns an array of the options available
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function getFamiliarOptions(options = {}) {
    const FUNCNAME = "getFamiliarOptions(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //--------------------------------------------------------------------------------------------
    // Grab the folder of fams from the actor directory (sidebar)
    //
    let famFold = game.folders.find(item => item.data.name === FAM_FLDR)
    if (!famFold) return jez.badNews(`Could not find a folder named ${FAM_FLDR}`, "e")
    if (TL > 3) jez.trace(`${TAG} Familiar Folder`, famFold)
    //--------------------------------------------------------------------------------------------
    // Make sure at least one familiar exists in the folder
    //
    if (!famFold.content || famFold.content.length === 0)
        return jez.badNews(`No familiars found in the ${FAM_FLDR} folder`, "e")
    //--------------------------------------------------------------------------------------------
    // Convert the folder data into an array of handy actor objects
    //
    let famArray = []
    for (let i = 0; i < famFold.content.length; i++) {
        famArray[i] = {
            name: famFold.content[i].name,
            id: famFold.content[i].id,
            actor5e: famFold.content[i]
        }
    }
    let famCnt = famArray.length
    //--------------------------------------------------------------------------------------------
    // Does the caster have the "Pact of the Chain" (PACT_OF_THE_CHAIN) feature, and thus 
    // more options?
    //
    let chainLock = false   // Boolean flag indicating caster is a chain lock (or not)
    if (aActor.items.find(i => i.name === PACT_OF_THE_CHAIN)) chainLock = true
    if (TL > 2)
        if (chainLock) jez.trace(`${TAG} ${aToken.name} is a Chain Warlock`)
        else jez.trace(`${TAG} ${aToken.name} is not a Chain Warlock`)
    //--------------------------------------------------------------------------------------------
    // If we're dealing with a Chain Lock, need to add in the additional familiar options
    //
    if (chainLock) {
        let chainFamFold = game.folders.find(item => item.data.name === FAM_FLDR_CHAIN)
        if (!chainFamFold)
            jez.badNews(`Could not find chain lock familiar folder "${FAM_FLDR_CHAIN}"`, "w")
        else {
            if (TL > 3) jez.trace(`${TAG} Chain Lock Familiar Folder`, chainFamFold)
            for (let i = famCnt; i < chainFamFold.content.length + famCnt; i++) {
                if (TL > 4) jez.trace(`${TAG} Processing`, chainFamFold.content[i - famCnt].name)
                famArray[i] = {
                    name: chainFamFold.content[i - famCnt].name,
                    id: chainFamFold.content[i - famCnt].id,
                    actor5e: chainFamFold.content[i - famCnt]
                }
            }
        }
    }
    //--------------------------------------------------------------------------------------------
    // Depending on TL, spit out what we have assembled
    //
    for (let i = 0; i < famArray.length; i++) {
        if (TL > 3) jez.trace(`${TAG} ${i + 1} Familiar`, famArray[i].name)
        if (TL > 5) jez.trace(`${TAG} ${i + 1} Familiar`, famArray[i].id)
        if (TL > 4) jez.trace(`${TAG} ${i + 1} Familiar`, famArray[i].actor5e)
    }
    //--------------------------------------------------------------------------------------------
    // Return results
    //
    return famArray
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Create the dialog to select a familiar
 * 
 **********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function popDialog1(famNames, options = {}) {
    const FUNCNAME = "popDialog1(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "famNames", famNames,
        "options", options);
    //-----------------------------------------------------------------------------------------------
    // Obtain the list of familiars that can be choosen from
    // 
    const queryTitle = "What form for Familiar"
    const queryText = "Select the form for the familiar from drop down list"
    jez.pickFromListArray(queryTitle, queryText, callBack1, famNames);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Process the selection from the dialog offering list of familiar forms.
 * 
 **********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function callBack1(itemSelected) {
    const FUNCNAME = "callBack1(itemSelected)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "itemSelected", itemSelected);
    //-----------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.trace(`${TAG} itemCallBack: Item "${itemSelected}" selected in the dialog`)
    //--------------------------------------------------------------------------------------------
    // If cancel button was selected on the preceding dialog, null is returned ==> Terminate
    //
    if (itemSelected === null) return;
    //--------------------------------------------------------------------------------------------
    // If nothing was selected call preceding function and terminate this one
    //
    if (!itemSelected) {
        if (TL > 1) jez.trace(`${TAG} No selection passed to ${FUNCNAME}, trying again.`)
        popDialog1(famNames, { traceLvl: TL })
        return;
    }
    //--------------------------------------------------------------------------------------------
    // Summon the familiar to the scene
    //
    if (TL > 1) jez.trace(`${TAG} Actually summon the familiar ${itemSelected}`)
    let familiarName = FAMILIAR_NAME ?? `${aToken.name}'s ${itemSelected}`
    if (TL > 2) jez.trace(`${TAG} Familiar name: ${familiarName}`)
    let argObj = {
        defaultRange: 10,
        duration: 3000,                     // Duration of the intro VFX
        introTime: 1000,                    // Amount of time to wait for Intro VFX
        introVFX: '~Energy/SwirlingSparkles_01_Regular_${color}_400x400.webm', // default introVFX file
        minionName: familiarName,
        outroVFX: '~Fireworks/Firework*_02_Regular_${color}_600x600.webm', // default outroVFX file
        scale: 0.4,							// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        templateName: itemSelected,         // Name of the actor in the actor directory
        traceLvl: TL
    }
    //--------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    let summonData = await game.actors.getName(itemSelected)
    argObj.img = summonData ? summonData.img : aItem.img
    //--------------------------------------------------------------------------------------------
    // Does the caster have the CHAIN_MASTER feature, and thus needs special treatment?
    //
    let chainMaster = false   // Boolean flag indicating caster has CHAIN_MASTER invocation
    if (aActor.items.find(i => i.name === CHAIN_MASTER)) chainMaster = true
    if (chainMaster) {
        if (TL > 1) jez.trace(`${TAG} ${aToken.name} has ${CHAIN_MASTER}`)
        jez.badNews(`Features provided by ${CHAIN_MASTER} are not automated`, "i")
    }
    else if (TL > 1) jez.trace(`${TAG} ${aToken.name} lacks ${CHAIN_MASTER}`)
    //--------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    let returnValue = await jez.spawnAt(itemSelected, aToken, aActor, aItem, argObj)
    console.log(`Return Value`, returnValue)
    return
}