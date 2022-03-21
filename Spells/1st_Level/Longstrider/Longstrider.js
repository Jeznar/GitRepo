const MACRONAME = "Longstrider"
/*****************************************************************************************
 * Simply run a rather generic VFX on the target of this spell and post a completion 
 * message.
 * 
 * 03/19/22 0.1 Creation of Macro
 * 03/21/22 0.2 Allow multiple targets for upcasting
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && !preCheck()) {await jez.wait(250); return;}
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (args[0].targets.length === 0) {     // If no target, return
        msg = `Must target at least one target.  ${args[0].targets.length} were targeted.`
        postResults(msg);
        return (false);
    }
    return(true)
}
/***************************************************************************************************
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
    //let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let tarNames = ""
    let targ = args[0].targets
     if (Array.isArray(targ)) {                         // If array of targets build targets string
         for (let i = 0; i < targ.length; i++) {        // Loop on the number of array elements
             if(tarNames)tarNames+=`, ${targ[i].name}`; // After the first element, add a comma space
             else tarNames = targ[i].name;              // On first element set name into accumulator
         }
     } else tarNames = targ.name                        // Not array, just get name
     jez.log("Targets",targ)
     jez.runRuneVFX(targ, jez.getSpellSchool(aItem), jez.getRandomRuneColor())

    msg = `<b>${tarNames}</b> speed increased by 10.`
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
 }