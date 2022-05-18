const MACRONAME = "Portent_Helper.0.1.js"
/*****************************************************************************************
 * To be executed as an ItemMacro from within a temporary item that tracks and displays 
 * the value of a portent.  The item name must end in a number preceded by a space.  This 
 * number controls the "value" of the portent.  
 * 
 * At completion, this macro will delete the item it was executed from -- lets be careful 
 * out there.
 * 
 * 05/16/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
const DICE_DIR = "Icons_JGB/Dice/d20/Blue/"
const DICE_POSTFIX = ".png"
const CARD_DIR = "Icons_JGB/Cards/Tarokka/"
const CARD_POSTFIX = ".jpg"
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let nameArray = aItem.name.split(" ")   // Split the item name into tokens based on spaces
    const VALUE = nameArray[nameArray.length-1]

    msg = `<b>${aToken.name}</b> has foreseen the result of the next attack roll, saving throw, 
    or ability check. It will be a <b>${VALUE}</b>`
    postResults(msg)
    //---------------------------------------------------------------------------------------------
    // Run the VFX
    //
    const DISPLAY = `${CARD_DIR}${VALUE}${CARD_POSTFIX}`
    //const DISPLAY = `${DICE_DIR}${VALUE}${DICE_POSTFIX}`
    runVFX(aToken, DISPLAY)
    //---------------------------------------------------------------------------------------------
    // Time to delete the item this macro is attached to
    //
    // jez.log("aItem", aItem)
    // await aActor.deleteOwnedItem(aItem._id);                 // Obsoletes as of Foundry 9.x
    await aActor.deleteEmbeddedDocuments("Item", [aItem._id])   // Format as of Foundry 9.x 
    msg = `Deleted used "${aItem.name}" from spell book`        // Set notification message
    ui.notifications.info(msg);
    jez.log(msg);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
 async function runVFX(token1, VFXimage) {
    new Sequence()
        .effect()
            .file(VFXimage)
            .attachTo(token1)
            .scale(0.5)
            .opacity(1)
            .scaleIn(0.1, 1000)
            .rotateIn(180, 1000)    // 1/2 Rotation over 1 second 
            .rotateOut(180, 1000)   // 1/2 Counter Rotation over 1 second
            .scaleOut(0.1, 1000)
            .duration(4000)
            .fadeIn(500) 
            .fadeOut(500) 
        .play();
}