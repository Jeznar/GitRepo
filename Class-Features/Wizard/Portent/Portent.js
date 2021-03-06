const MACRONAME = "Portent.0.1.js"
/*****************************************************************************************
 * Potent RAW Description:
 *   Starting at 2nd level when you choose this school, glimpses of the future begin to 
 *   press in on your awareness. When you finish a long rest, roll two d20s and record the 
 *   numbers rolled. You can replace any attack roll, saving throw, or ability check made 
 *   by you or a creature that you can see with one of these foretelling rolls. You must 
 *   choose to do so before the roll, and you can replace a roll in this way only once 
 *   per turn. 
 * 
 *   Each foretelling roll can be used only once. When you finish a long rest, you lose any 
 *   unused foretelling rolls.
 * 
 * Major Steps in the Macro
 * 1. Delete any prexisting foretellings.  This will be of the form "Portent - #" where
 *    the number may be 1 to 20.
 * 2. Scoop up the value of the three d20s rolled on the item card and stash them. The 
 *    number of portent items is driven from the item card as the count of dice.
 * 3. Create foretelling cards with teh values rolled
 * 4. Post the results of the rolls.
 * 
 * 05/15/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]           // Trim of the version number and extension
//-----------------------------------------------------------------------------------------
// Adjust these constants based on world specifics
//
const DICE_DIR = "Icons_JGB/Dice/d20/Blue/"     // Path to dir that holds 20 die images
const DICE_POSTFIX = ".jpg"                     // Suffix for the die images
const CARD_DIR = "Icons_JGB/Cards/Tarokka/"     // Path to dir that holds 20 card images 
const CARD_POSTFIX = ".jpg"                     // Suffix for the card images
const ITEM_NAME = `%%Portent%%`                 // Name as expected in Items Directory 
//-----------------------------------------------------------------------------------------
// Proceed with environment setup
//
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
    //----------------------------------------------------------------------------------------------
    // 1. Delete any prexisting foretellings.  This will be of the form "Portent - #" where
    //    the number may be 1 to 20.
    //
    let itemFound = null
    for (let i = 1; i <= 20; i++) {
        while (itemFound = aToken.actor.items.find(item => item.data.name === `Portent - ${i}`)) {
            jez.log("itemFound", itemFound)
            await itemFound.delete();
            msg = `Deleted expired "Portent - ${i}"`      // Set notification message
            ui.notifications.info(msg);
            jez.log(msg);
        }
    }
    //----------------------------------------------------------------------------------------------
    // * 2. Scoop up the value of the d20s rolled on the item card and stash them.
    //
    jez.log("aItem", aItem)
    jez.log("LAST_ARG.damageRoll.terms[0].results", LAST_ARG.damageRoll.terms[0].results) // [0].results
    let dieCount = LAST_ARG.damageRoll.terms[0].results.length + 1
    if (LAST_ARG.isCritical) dieCount = dieCount / 2   // For some reason sometimes this is crit damage
    let rollArray = []
    for (let i = 0; i < dieCount - 1; i++) {
        //rollArray[i] = LAST_ARG.damageRoll.terms[0].results[i].result
        // force the roll to be an integer between 1 and 20 inclusive
        rollArray[i] = Math.min(Math.max(parseInt(LAST_ARG.damageRoll.terms[0].results[i].result), 1), 20);

    }
    // TODO: Sort the rollArray (maybe)
    //----------------------------------------------------------------------------------------------
    // 3. Create foretelling item/cards with the values rolled
    //
    for (let i = 0; i < dieCount - 1; i++) {
        jez.log(`Create card ${i + 1} with a value of ${rollArray[i]}`)
        addItemToActor(aToken)
        await jez.wait(100)
        updateItemOnActor(aToken, rollArray[i])
    }
    //----------------------------------------------------------------------------------------------
    // 4. Post the results of the rolls.
    // 
    msg = `${aToken.name} has forseen ${dieCount - 1} events that may occur today: `
    for (let i = 0; i < dieCount - 1; i++) {
        msg += rollArray[i]
        if (i < dieCount - 2) msg += ", "
        if (i === dieCount - 2) msg += "."
    }
    postResults(msg)
    //----------------------------------------------------------------------------------------------
    // 5. Run the VFX
    // 
    for (let i = 0; i < dieCount - 1; i++) {
        runVFX(aToken, rollArray[i])
        await jez.wait(4500)
        msg = `Created new "Portent - ${rollArray[i]}" as an At-Will Spell in ${aToken.name}'s spell book`   
        ui.notifications.info(msg);
        jez.log(msg);
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 *
 ***************************************************************************************************/
async function addItemToActor(token5e) {
    jez.log("Get the item from the Items directory and slap it onto the active actor")
    let itemObj = game.items.getName(ITEM_NAME)
    if (!itemObj) {
        msg = `Failed to find ${ITEM_NAME} in the Items Directory`
        ui.notifications.error(msg);
        postResults(msg)
        return (false)
    }
    console.log('Item5E fetched by Name', itemObj)
    await token5e.actor.createEmbeddedDocuments("Item", [itemObj.data])
}
/***************************************************************************************************
 *
 ***************************************************************************************************/
async function updateItemOnActor(token5e, value) {
    // Icons to be named as so: Icons_JGB/Dice/d20/Blue/#.png
    // With # being 1 to 20
    //----------------------------------------------------------------------------------------------
    jez.log("Find the item on the actor")
    let aActorItem = token5e.actor.data.items.getName(ITEM_NAME)
    jez.log("aActorItem", aActorItem)
    if (!aActorItem) {
        msg = `Failed to find ${ITEM_NAME} on ${token5e.name}`
        ui.notifications.error(msg);
        postResults(msg)
        return (false)
    }
    //-----------------------------------------------------------------------------------------------
    jez.log(`Remove the don't change this message assumed to be embedded in the item description.  It 
        should be of the form: <p><strong>%%*%%</strong></p> optionally followed by white space`)
    const searchString = `<p><strong>%%.*%%</strong></p>[\s\n\r]*`;
    const regExp = new RegExp(searchString, "g");
    const replaceString = ``;
    let content = await duplicate(aActorItem.data.data.description.value);
    content = await content.replace(regExp, replaceString);
    let itemUpdate = {
        'name': `Portent - ${value}`,       // Change to value specific name for temp item
        'img': `${DICE_DIR}${value}.png`,
        'data.description.value': content,  // Drop in altered description
    }
    jez.log("itemUpdate", itemUpdate)
    await aActorItem.update(itemUpdate)
}
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
 async function runVFX(token1, value) {
    const CARD = `${CARD_DIR}${value}${CARD_POSTFIX}`
    new Sequence()
        .effect()
            .file(CARD)
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
            //.waitUntilFinished(-1500) 
        .play();
}