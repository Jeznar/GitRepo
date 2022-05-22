const MACRONAME = "Cure_Wounds.js"
/*****************************************************************************************
 * Make sure only one target was targeted and run a runVFX on that target
 * 
 * 03/30/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
const LAST_ARG = args[args.length - 1];
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//--------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Sadly, something went sideways. Must target exactly least one target, targeted 
        ${args[0].targets.length}.`
        postResults(msg);
        return (false);
    }
    return(true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    //----------------------------------------------------------------------------------
    // Run the preCheck function to make sure things are setup as best I can check them
    //
    if (!preCheck()) return;
    //----------------------------------------------------------------------------------
    // Set the tToken
    //
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // Targeted Token
    //-----------------------------------------------------------------------------------------------
    // If target is immune type, post appropriate message and exit
    //
    let immuneRaces = ["undead", "construct"];  // Set strings that define immune races
    if (checkType(tToken, immuneRaces)) {
        msg = `${tToken.name} appears to be unaffected by ${aItem.name}.`
        postResults(msg);
        return (false);
    }
    //-----------------------------------------------------------------------------------------------
    // Launch our VFX
    //
    jez.runRuneVFX(tToken, jez.getSpellSchool(aItem), "yellow")
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