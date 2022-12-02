const MACRONAME = "Cure_Wounds.0.3.js"
/*****************************************************************************************
 * Make sure only one target was targeted and run a runVFX on that target
 * 
 * 03/30/22 0.1 Creation of Macro
 * 05/22/22 0.2 Added message about need to manually backout ineligible heals
 * 12/02/22 0.3 Changed to refund spell slot on cast that has no target
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 5;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //---------------------------------------------------------------------------------------------------
 if (TL>1) jez.trace(`${TAG} === Starting ===`);
 if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
 const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
 //---------------------------------------------------------------------------------------------------
 // Set standard variables
 let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
 let aActor = aToken.actor; 
 let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
 const VERSION = Math.floor(game.VERSION);
 const GAME_RND = game.combat ? game.combat.round : 0;
 //---------------------------------------------------------------------------------------------------
 // Set Macro specific globals
 //
//--------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
// if (args[0].macroPass !== "preItemRoll") {
//     if (TL>0) jez.trace(`${TAG} Running ${args[0].macroPass}`);
//     doPreItemRoll({traceLvl:TL})
//     return
// }
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          // Midi ItemMacro On Use
if (TL>1) jez.trace(`${TAG} === Finished ===`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        if (args[0].targets.length !== 1) {      // If not exactly one target 
            jez.refundSpellSlot(aToken, L_ARG.spellLevel, { traceLvl: 0, quiet: false, spellName: aItem.name })
            return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`,"w");
        }
    }
    return(true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    // Run the preCheck function to make sure things are setup as best I can check them
    if (!preCheck()) return;
    //----------------------------------------------------------------------------------
    // Set the tToken
    //
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // Targeted Token
    if (TL>1) jez.trace(`${TAG} Targeting ${tToken.name}`,tToken);
    //-----------------------------------------------------------------------------------------------
    // If target is immune type, post appropriate message and exit
    //
    let immuneRaces = ["undead", "construct"];  // Set strings that define immune races
    if (checkType(tToken, immuneRaces)) {
        msg = `${tToken.name} appears to be unaffected by ${aItem.name}. Heal needs to be manually
        reversed.`
        ui.notifications.info(msg)
        postResults(msg);
        return (false);
    }
    //-----------------------------------------------------------------------------------------------
    // Launch our VFX
    //
    jez.runRuneVFX(tToken, jez.getSpellSchool(aItem), "yellow")
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
 }
/***************************************************************************************************
 * Determine if passed token is of one of the types to check against, returning True if found
 ***************************************************************************************************/
function checkType(token5e, typeArray) {
    let tokenRace = token5e.actor.data.data.details.race;   // Shorten subsequent lines for Target Details Race
    let tokenType = token5e.actor.data.data.details.type;   // Shorten subsequent lines for Target Details Type
    //-----------------------------------------------------------------------------------------------
    // Check to see if we have an immune or vulnerable creature type to deal with
    //
    let foundType = false;
    if (token5e.actor.data.type === "character") {
        jez.log(`${token5e.name} is a PC`, token5e);
        if (tokenRace) {
            for (let entity of typeArray) {
                if (tokenRace.toLowerCase().includes(entity.toLowerCase())) {
                    foundType = true;
                }
            }
        } 
    } else {
        //--------------------------------------------------------------------------------------
        // Loop through each creature type found in the typeArray array.
        //
        for (let entity of typeArray) {
            // If the creature type is custom...
            if (tokenType.value.toLowerCase() === "custom") {
                // Check custom creature type against our typeArray collection
                if (tokenType.custom.toLowerCase().includes(entity.toLowerCase())) {
                    foundType = true;
                }
            } 
            // If the creature has a subtype...
            if (!tokenType.subtype == "") {
                // if(tokenType.subtype) {
                // If the creature's subtype is found in the typeArray collection...
                if (tokenType.subtype.toLowerCase() === entity.toLowerCase()) {
                    // Check creature Subtypes for the types in our typeArray collection.
                    if (tokenType.custom.toLowerCase().includes(entity.toLowerCase())) {
                        foundType = true;
                    }
                }
            } 
            // Check creature type against our typeArray collection.
            if (entity.toLowerCase() === tokenType.value.toLowerCase()) {
                foundType = true;
            } 
        }
    }
    return (foundType)
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}