const MACRONAME = "Find_Familiar.1.4.js"
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
 * 08/29/22 1.1 Update familiar's name to use just the caster's first name token
 *              Set size of token being summoned to match the summoned creature (lib call does not 
 *                  support less than size 1)
 * 08/30/22 1.2 Add effect to caster that deletes summoned familiar when it is removed
 * 08/30/22 1.3 Added shortcut selection triggered by aItem.name containing a "-" character
 * 08/31/22 1.4 Teach the code to modify saving throws for CHAIN_MASTER familiar
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
const FAM_FLDR = "Familiars"
const FAM_FLDR_CHAIN = "Familiars Pact of the Chain"
const PACT_OF_THE_CHAIN = "Pact of the Chain"
const CHAIN_MASTER = "Invocation: Investment of the Chain Master"
const SPELL_NAME = `Find Familiar`
const TEMPLATE_SPELL = "%%Swap Senses (Familiar)%%" // Name as expected in Items Directory 

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
const FIRST_NAME_TOKEN = aToken.name.split(" ")[0]     // Grab the first word from the selection
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
//
let famNames = []   // Global array to hold the list of familiar names
const FLAG_NAME = "familiar_name"
const FAM_NAME = DAE.getFlag(aActor, FLAG_NAME)
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                           // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });  // Midi ItemMacro On Use
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
    //-----------------------------------------------------------------------------------------------
    // Check to see if aItem.name contains a shortcut selection for familiar to be summoned.  That is
    // a string folling the last dash character (if any) in aItem.name
    //
    let shortCutFamName = ""
    const NAME_TOKENS = aItem.name.split("-")
    if (NAME_TOKENS.length > 1) {
        // Set short cut name to last token with leading & trailing white space stripped
        shortCutFamName = NAME_TOKENS[NAME_TOKENS.length -1].trim()   
        if (TL > 1) jez.trace(`${TAG} Shortcut familiar name specified: ${shortCutFamName}`);
        if (!famNames.includes(shortCutFamName)) {  // Is the shortcut name an allowed choice?
            jez.badNews(`Familiar's Actor for shortcut, "${shortCutFamName}" not found.`,"w");
            shortCutFamName = ""
        }
    }
    //-----------------------------------------------------------------------------------------------
    // If we have more than one familiar choice and no shortcut, setup and run a dialog to select the 
    // familiar; otherwise skip dialog and proceed
    //
    if (famNames.length > 1 && !shortCutFamName) popDialog1(famNames, { traceLvl: TL })
    else callBack1(shortCutFamName)
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
        if (chainLock) jez.trace(`${TAG} ${FIRST_NAME_TOKEN} is a Chain Warlock`)
        else jez.trace(`${TAG} ${FIRST_NAME_TOKEN} is not a Chain Warlock`)
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
    const queryTitle = "What form for Familiar?"
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
    // If an existing Find_Familiar effect exists on calling actor, delete it
    //
    existingEffect = aActor.effects.find(ef => ef.data.label === SPELL_NAME)
    if (existingEffect) {
        await existingEffect.delete();
        // await jez.deleteItems(SPELL_NAME, "feat", aToken.actor);
        msg = `<b>${aToken.name}</b> previously existing familiar has been dismissed.`
        jez.postMessage({color: jez.randomDarkColor(), fSize: 13, icon: aToken.data.img, msg: msg, 
            title: `Existing Familiar Dismissed`, token: aToken})
    }
    //--------------------------------------------------------------------------------------------
    // Build basic data object for the summon
    //
    if (TL > 1) jez.trace(`${TAG} Actually summon the familiar ${itemSelected}`)
    let famName = FAM_NAME ?? `${FIRST_NAME_TOKEN}'s ${itemSelected}`
    const NEW_SPELL = `Swap Senses with ${famName}`
    if (TL > 2) jez.trace(`${TAG} Familiar name: ${famName}`)
    let argObj = {
        defaultRange: 10,
        duration: 3000,                     // Duration of the intro VFX
        introTime: 1000,                    // Amount of time to wait for Intro VFX
        introVFX: '~Energy/SwirlingSparkles_01_Regular_${color}_400x400.webm', // default introVFX file
        minionName: famName,
        outroVFX: '~Fireworks/Firework*_02_Regular_${color}_600x600.webm', // default outroVFX file
        scale: 0.4,							// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        templateName: itemSelected,         // Name of the actor in the actor directory
        traceLvl: TL
    }
    //-----------------------------------------------------------------------------------------------
    // If a temp ability to swap senses for this familiar exists, delete it
    //
    let itemFound = aActor.items.find(item => item.data.name === NEW_SPELL && item.type === "spell")
    if (itemFound) {
        await itemFound.delete();
        msg = `"${NEW_SPELL}" has been deleted from ${aToken.name}'s spell book`
        jez.badNews(msg,"i");
    }
    //--------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img and width attributes or set basic image to match this item
    //
    let summonData = await game.actors.getName(itemSelected)
    argObj.img = summonData ? summonData.img : aItem.img
    argObj.width = summonData ? summonData.data.token.width : 1
    if (TL > 2) jez.trace(`${TAG} argObj`,argObj)
    //--------------------------------------------------------------------------------------------------
    // Does the caster have the CHAIN_MASTER feature, and thus needs special treatment?
    //
    let chainMaster = false   // Boolean flag indicating caster has CHAIN_MASTER invocation
    if (aActor.items.find(i => i.name === CHAIN_MASTER)) chainMaster = true
    if (chainMaster) {
        if (TL > 0) jez.trace(`${TAG} ${FIRST_NAME_TOKEN} has ${CHAIN_MASTER}`)
        // ---------------------------------------------------------------------------------------------
        // Special case treatment of Imp to set its attack saving throw
        //
        if (summonData.name === "Imp") {
            if (TL > 1) jez.trace(`${TAG} Special case treatment of our ${summonData.name}`)
            argObj.updates = {
                actor: {
                    name: famName,
                    // 'data.attributes.hp': { value: 66, max: 66 }
                },
                token: { name: famName },
                embedded: {
                    Item: {
                        "Sting (Imp)": {
                            // 'data.damage.parts': [[`1d6 + 3`, "fire"]],
                            // 'data.attackBonus': `2[mod] + 3[prof]`,   
                            'data.save.dc': jez.getSpellDC(aActor),
                        },
                    }
                }
            }
        }
        jez.badNews(`Features provided by ${CHAIN_MASTER} are not automated other than Imp's save DC`, "i")
        // ---------------------------------------------------------------------------------------------
        // Following code was a start at generalizing the saving throw update.  I am opting to just
        // special case Imp in an attempt to get this done in finite time.
        // let items = summonData.items.contents
        // if (TL > 0) jez.trace(`${TAG} ${summonData.name} items`, items)
        // for (let i = 0; i < items.length; i++) {
        //     if (TL > 1) jez.trace(`${TAG} ${i} ${items[i].name}`, items[i].data.type)
        //     if (items[i].data.type === "weapon" || items[i].data.type === "spell") {
        //         if (items[i].data.data.save.dc && items[i].data.data.save.scaling === "flat") {
        //             if (TL > 1) jez.trace(`${TAG} TODO: Item ${items[i].name} needs to have its flat save value adjusted`)
        //             if (TL > 1) jez.trace(`${TAG} Save data`, items[i].data.data.save)
        //         }
        //     }
        // }
        // ---------------------------------------------------------------------------------------------       
    }
    else if (TL > 1) jez.trace(`${TAG} ${FIRST_NAME_TOKEN} lacks ${CHAIN_MASTER}`)
    //--------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    let tokenId = await jez.spawnAt(itemSelected, aToken, aActor, aItem, argObj)
    if (TL > 1) jez.trace(`${TAG} Token ID of summoned familiar`,tokenId)
    //--------------------------------------------------------------------------------------------------
    // Add watchdog effect to the summoning token 
    //
    addWatchdogEffect(tokenId, famName)
    //-------------------------------------------------------------------------------------------------
    // Add the Swap Senses 'spell' to spell book
    // 
    if (copyEditItem(aToken, famName, NEW_SPELL)) {
        msg = `An At-Will Spell "${NEW_SPELL}" has been added to ${aToken.name}`
        jez.badNews(msg,"i");
    }
    //-----------------------------------------------------------------------------------------------
    // Post message about the summons
    //
    msg = `<b>${aToken.name}</b> has summoned ${famName} as thier familiar.`
    postResults(msg)
    return 
}
/***************************************************************************************************
 * Add an effect to the using actor that can perform additional actions on the summoned actor.
 * 
 * Expected input is a single token id and the name of teh familiar
 ***************************************************************************************************/
 async function addWatchdogEffect(tokenId, famName) {
    const FUNCNAME = "addWatchdogEffect(tokenId)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const DEL_TOKEN_MACRO = "ActorUpdate";

    if (TL===1) jez.trace(`${TAG} Starting --- `);
    if (TL > 1) jez.trace(`${TAG} Starting ---`,"tokenId",tokenId,"famName",famName);
    //------------------------------------------------------------------------------------------------
    // Make sure DEL_TOKEN_MACRO exists and is GM execute enabled
    //
    const delTokenMacro = game.macros.getName(DEL_TOKEN_MACRO);
    if (!delTokenMacro) 
        return jez.badNews(`Cannot locate ${DEL_TOKEN_MACRO} GM Macro, skipping watchdog`);
    if (!delTokenMacro.data.flags["advanced-macros"].runAsGM) 
        return jez.badNews(`${DEL_TOKEN_MACRO} "Execute as GM" not checked, skipping watchdog`);
    //------------------------------------------------------------------------------------------------
    // Proceed with adding watchdog
    //
    const CE_DESC = `Familiar, ${famName}, is active`
    let effectData = {
      label: SPELL_NAME,
      icon: aItem.img,
      origin: LAST_ARG.uuid,
      disabled: false,
      flags: { 
        dae: { macroRepeat: "none" }, 
        convenientDescription: CE_DESC 
      },
      changes: [
           { key: `macro.execute`, mode: jez.ADD, value: `DeleteTokenMacro ${tokenId}`, priority: 20 },
           { key: `macro.itemMacro`, mode: jez.CUSTOM, value: `0`, priority: 20 },           
      ]
    };
    if (TL > 1) jez.trace(`${FNAME} | effectData`,effectData);
    if (TL > 3) jez.trace(`${FNAME} | MidiQOL.socket().executeAsGM("createEffects"`,"aToken.actor.uuid",
    aToken.actor.uuid,"effectData",effectData);
    await MidiQOL.socket().executeAsGM("createEffects", 
        { actorUuid: aToken.actor.uuid, effects: [effectData] });  
    if (TL > 0 ) jez.trace(`---  Finished --- ${MACRO} ${FNAME} ---`);
  }
  /***************************************************************************************************
 * Copy the temporary item to actor's spell book and edit it as appropriate
 ***************************************************************************************************/
 async function copyEditItem(token5e, familiarName, NEW_SPELL) {
    const FUNCNAME = "copyEditItem(token5e)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`

    if (TL===1) jez.trace(`${TAG} Starting --- `);
    if (TL > 1) jez.trace(`${TAG} Starting ---`,"token5e",token5e,"familiarName",familiarName,
        "NEW_SPELL",NEW_SPELL);
    //----------------------------------------------------------------------------------------------
    let oldActorItem = token5e.actor.data.items.getName(NEW_SPELL)
    if (oldActorItem) await deleteItem(token5e.actor, oldActorItem)
    //----------------------------------------------------------------------------------------------
    if (TL > 1) jez.trace(`${TAG} Get the item from the Items directory add to ${aToken.name}`)
    let itemObj = game.items.getName(TEMPLATE_SPELL)
    if (!itemObj) {
        msg = `Failed to find ${TEMPLATE_SPELL} in the Items Directory`
        ui.notifications.error(msg);
        postResults(msg)
        return (false)
    }
    console.log('Item5E fetched by Name', itemObj)
    await replaceItem(token5e.actor, itemObj)
    //----------------------------------------------------------------------------------------------
    if (TL > 1) jez.trace(`${TAG} Edit the item on ${aToken.name}'s actor, `)
    let aActorItem = token5e.actor.data.items.getName(TEMPLATE_SPELL)
    if (TL > 1) jez.trace(`${TAG} aActorItem`, aActorItem)
    if (!aActorItem) {
        msg = `Failed to find ${TEMPLATE_SPELL} on ${token5e.name}`
        ui.notifications.error(msg);
        postResults(msg)
        return (false)
    }
    //-----------------------------------------------------------------------------------------------
    if (TL > 1) jez.trace(`${TAG} Remove the don't change this message assumed to be embedded in the 
        item description.  It should be of the form: <p><strong>%%*%%</strong></p> followed by white 
        space`)
    const searchString = `<p><strong>%%.*%%</strong></p>[\s\n\r]*`;
    const regExp = new RegExp(searchString, "g");
    const replaceString = ``;
    let content = await duplicate(aActorItem.data.data.description.value);
    content = await content.replace(regExp, replaceString);
    let itemUpdate = {
        'name': NEW_SPELL,
        'data.description.value': content,
    }
    if (TL > 1) jez.trace(`${TAG} Updating Item`,itemUpdate)
    await aActorItem.update(itemUpdate)
    if (TL > 1) jez.trace(`${TAG} --- Finished`);
    return (true);
}
/*************************************************************************************
 * replaceItem
 * 
 * Replace or Add targetItem to inventory of actor5e passed as parms
 *************************************************************************************/
 async function replaceItem(actor5e, targetItem) {
    await deleteItem(actor5e, targetItem)
    return (actor5e.createEmbeddedDocuments("Item", [targetItem.data]))
}
/*************************************************************************************
 * deleteItem
 * 
 * Delete targetItem to inventory of actor5e passed as parms
 *************************************************************************************/
 async function deleteItem(actor5e, targetItem) {
    let itemFound = actor5e.items.find(item => item.data.name === targetItem.data.name && item.type === targetItem.type)
    if (itemFound) await itemFound.delete();
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Delete any existing temp abilities for this spell
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOff() {
    const FUNCNAME = "doOff()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>0) jez.trace(`${TAG} --- Starting ---`);
    //-----------------------------------------------------------------------------------------------
    // If a temp ability to swap senses for a familiar exists, delete it
    //
    deleteTempSpells({traceLvl:TL})
    if (TL>3) jez.trace(`${TAG} | More Detailed Trace Info.`)

    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Delete existing temporary spell items, if any.  They must be at-will spells that start with 
 * NEW_SPELL_PREFIX
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 async function deleteTempSpells(options = {}) {
    const FUNCNAME = "deleteTempSpell(options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Delete all of the at-will spells that start with NEW_SPELL_PREFIX
    //
    const NEW_SPELL_PREFIX = "Swap Senses with"
    let itemFound = null
    while (itemFound = aActor.items.find(item => item.data.name.startsWith(NEW_SPELL_PREFIX) &&
        item.type === "spell" && item.data.data.preparation.mode === "atwill")) {
        await itemFound.delete();
        jez.badNews(`At-Will Spell "${itemFound.name}" has been deleted from ${aToken.name}'s spell book`, 'i')
        await jez.wait(50)
    }
}