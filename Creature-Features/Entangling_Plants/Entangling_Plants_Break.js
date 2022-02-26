const MACRONAME = "Entangling_Plants_Break"
/*****************************************************************************************
 * Vine Blight's Entangling Plant ability -- Free an Adjacent Ally (or enemy)
 *
 *   Grasping roots and vines sprout in a 15-foot radius centered on the blight, withering
 *   away after 1 minute. For the duration, that area is difficult terrain for nonplant
 *   creatures. In addition, each creature of the blight’s choice in that area when the
 *   plants appear must succeed on a DC 12 Strength saving throw or become restrained. A
 *   creature can use its action to make a DC 12 Strength check, freeing itself or another
 *   entangled creature within reach on a success.
 * 
 * This is the partner macro that allows "allies" to attempt to remove the effect from 
 * adjacent tokens.
 *
 * 02/13/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const SAVE_TYPE = "str"
let msg = "";
const DEBUFF_NAME = "Restrained by Entangling Plants" // aItem.name || "Nature's Wraith";
const RESTRAINED_JRNL = `@JournalEntry[${game.journal.getName("Restrained").id}]{Restrained}`
//----------------------------------------------------------------------------------
// Fetch the chat message card for later use
//
let chatMsg = game.messages.get(LAST_ARG.itemCardId);
//----------------------------------------------------------------------------------
// Make sure a ONE target was selected and hit before continuing
//
if (args[0].targets.length !== 1) {     // If not exactly one target, return
    msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
    ui.notifications.warn(msg)
    jez.log(msg)
    return (false);
}
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------
    // Check to see if the tActor currently has DEBUFF_NAME and fetch the SAVE_DC
    //
    let debuff = tActor.effects.find(i => i.data.label === DEBUFF_NAME);
    if (!debuff) {
        msg = `${aToken.name} is mildly embarrassed as the attempt to help ${tToken.name} 
            has failed -- ${tToken.name} lacks ${DEBUFF_NAME}`
        await jez.addMessage(chatMsg, {color:"deeppink", fSize:15, msg:msg, tag:"saves" })
        return;
    }
    jez.log('debuff', debuff)
    //----------------------------------------------------------------------------------
    // Obtain save DC from the debuff information.
    //
    let itemmacro = debuff.data.changes.find(i => i.key === "macro.itemMacro");
    jez.log('itemmacro', itemmacro)
    const VALUE_ARRAY =  itemmacro.value.split(" ")  
    const SAVE_DC = VALUE_ARRAY[VALUE_ARRAY.length - 1]
    jez.log("Save DC", SAVE_DC)
    //----------------------------------------------------------------------------------
    // Make the Skill Check
    //
    let flavor = `Attempting to break restraint, ${SAVE_TYPE.toUpperCase()} DC${SAVE_DC} check.`
    let check = (await aActor.rollAbilityTest(SAVE_TYPE,
        { flavor:flavor, chatMessage: true, fastforward: true })).total;
    jez.log("Result of check roll", check);
    //----------------------------------------------------------------------------------
    // Post the results (also clear the debuff if check was a success.)
    //
    if (check >= SAVE_DC) {
        jez.log("debuff.id", debuff.id)
        await tActor.deleteEmbeddedDocuments("ActiveEffect", [debuff.id]);
        await jez.addMessage(chatMsg, { 
            color: "darkblue",
            fSize: 14,
            msg: `Succesfully broke the vines that had been keeping ${tToken.name} ${RESTRAINED_JRNL}<br><br>
            Rolled a ${check} on the ${SAVE_TYPE.toUpperCase()} DC${SAVE_DC} skill check.`,
            tag:"saves"
        })
    } else {
        await jez.addMessage(chatMsg, {
            color: "darkgreen",
            fSize: 14,
            msg: `Failed to break the vines that have been keeping ${tToken.name} ${RESTRAINED_JRNL}<br><br>
            Rolled a ${check} on the ${SAVE_TYPE.toUpperCase()} DC${SAVE_DC} skill check.`,
            tag:"saves"
        })
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}