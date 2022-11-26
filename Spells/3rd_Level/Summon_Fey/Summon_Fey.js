const MACRONAME = "Summon_Fey.0.2"
console.log(MACRONAME)
/*****************************************************************************************
 * Rebuild Summon Fey which used to utilize the Automated Evocations module.
 * 
 *   You call forth a fey spirit. It manifests in an unoccupied space that you can see 
 *   within range. This corporeal form uses the Fey Spirit stat block. When you cast 
 *   the spell, choose a mood: Fuming, Mirthful, or Tricksy. The creature resembles a 
 *   fey creature of your choice marked by the chosen mood, which determines one of the 
 *   traits in its stat block. The creature disappears when it drops to 0 hit points or 
 *   when the spell ends.
 * 
 *   The creature is an ally to you and your companions. In combat, the creature shares 
 *   your initiative count, but it takes its turn immediately after yours. It obeys your 
 *   verbal commands (no action required by you). If you don't issue any, it takes the 
 *   Dodge action and uses its move to avoid danger.
 * 
 *   At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, 
 *   use the higher level wherever the spell's level appears in the stat block.
 * 
 * 01/14/22 0.1 Creation of Macro
 * 11/26/22 0.2 Update to not use AE module
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 1;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //---------------------------------------------------------------------------------------------------
 if (TL>1) jez.trace(`${TAG} === Starting ===`);
 if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
const RUNASGMMACRO = "DeleteTokenMacro";
const viewedScene = game.scenes.viewed;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});     // Midi ItemMacro On Use
if (args[0] === "off") await doOff({traceLvl:TL});                           // DAE removal
if (TL>1) jez.trace(`${TAG} === Finished ===`);
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    // Define our doOnUse Values
    //

    //-----------------------------------------------------------------------------------------------
    // Dialog to select the mood of our spirit
    //
    
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL>3) jez.trace(`${TAG} More Detailed Trace Info.`)


    msg = `Maybe say something useful...`
    postResults(msg)
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Make sure the RUNASGMMACRO exists and is configured correctly
    //
    const DeleteFunc = game.macros.getName(RUNASGMMACRO);
    if (!DeleteFunc) {
        ui.notifications.error(`Cannot locate ${RUNASGMMACRO} run as GM Macro`);
        return;
    }
    if (!DeleteFunc.data.flags["advanced-macros"].runAsGM) {
        ui.notifications.error(`${RUNASGMMACRO} "Execute as GM" needs to be checked.`);
        return;
    }
    if (TL > 1) jez.trace(`${TAG} Found ${RUNASGMMACRO}, verified Execute as GM is checked`);
    let trash = [`${aToken.name}'s Fuming Fey`,`${aToken.name}'s Mirthful Fey`,`${aToken.name}'s Tricksy Fey`,`${aToken.name}'s Tricksy Fey's Darkness`]
    if (TL > 1) jez.trace(`${TAG} trash`, trash)
    //----------------------------------------------------------------------------------------------
    // Search for MINION in the current scene 
    //
    for (let critter of viewedScene.data.tokens) {
        // log("critter.data.name", critter.data.name);
        if (trash.includes(critter.data.name)) {
            if (TL > 1) jez.trace(`${TAG}Deleting ${critter.data.name}`)
            DeleteFunc.execute(critter);
        }
    }
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
  }
  

/***************************************************************************************************
 * Post the results to chat card
 ***************************************************************************************************/
 function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG}--- Finished ---`);
}