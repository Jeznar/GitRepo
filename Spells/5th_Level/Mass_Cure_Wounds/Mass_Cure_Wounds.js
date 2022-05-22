const MACRONAME = "Mass_Cure_Wounds.0.1.js"
/*****************************************************************************************
 * Make sure up to six targets were targeted and run a runVFX on that target
 * 
 *   A wave of healing energy washes out from a point of your choice within range. Choose 
 *   up to six creatures in a 30-foot-radius sphere centered on that point. Each target 
 *   regains hit points equal to 3d8 + your spellcasting mod. This spell has no effect on 
 *   undead or constructs.
 * 
 *   At Higher Levels. When you cast this spell using a spell slot of 6th level or higher, 
 *   the healing increases by 1d8 for each slot level above 5th.
 * 
 * 05/22/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
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
    if (args[0].targets.length === 0) {     // If not at least one target, return
        msg = `Must target exactly least one target.`
        ui.notifications.info(msg)
        postResults(msg);
        return (false);
    }
    if (args[0].targets.length > 6) {       // If not 6 or less targets, return
        msg = `Must target no more than 6 targets, targeted ${args[0].targets.length}. 
        Manual cleanup needed.`
        ui.notifications.warn(msg)
        postResults(msg);
        return (false);
    }
    return(true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    let immuneMsg = ""
    //----------------------------------------------------------------------------------
    // Run the preCheck function to make sure things are setup as best I can check them
    //
    if (!preCheck()) return;
    //----------------------------------------------------------------------------------
    // Loop through the targeted tokens
    //
    for (let i = 0; i < args[0].targets.length; i++) {
        //----------------------------------------------------------------------------------
        // Set the tToken
        //
        let tToken = canvas.tokens.get(args[0]?.targets[i]?.id); // Targeted Token
        jez.log(`Processing ${tToken.name}`, tToken)
        //-----------------------------------------------------------------------------------------------
        // If target is immune type, add appropriate message else run the VFX
        //
        let immuneRaces = ["undead", "construct"];  // Set strings that define immune races
        if (checkType(tToken, immuneRaces)) {
            if (!immuneMsg) immuneMsg = `Some targets appears to be unaffected by ${aItem.name}. Heal 
            needs to be manually reversed on:<br><br>`
            immuneMsg += `<b>${tToken.name}</b><br>`
        } else jez.runRuneVFX(tToken, jez.getSpellSchool(aItem), "yellow")
    }
    if (immuneMsg) postResults(immuneMsg)
    return
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