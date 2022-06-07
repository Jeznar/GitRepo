const MACRONAME = "Flame.0.1.js"
/*****************************************************************************************
 * Simple attack macro that runs a VFX for the Flame attack.
 * 
 * 06/06/22 0.1 Creation of Macro
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
const TEMP_SPELL_NAME = `${aToken.name}'s Flame`
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
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
 async function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        await postResults(msg);
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
    if (!await preCheck()) return(false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    runVFX(tToken)
    msg = `<b>${aToken.name}</b> throws the ball flame at ${tToken.name}.`
    postResults(msg)
    //-----------------------------------------------------------------------------------------------
    // Delete the Produce Flame effect that produced this item.
    //
    let existingEffect = aToken.actor.effects.find(i=> i.data.label === "Produce Flame");
    if (existingEffect) existingEffect.delete();
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
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
 * Run VFX
 ***************************************************************************************************/
function runVFX(target) {
    let color = ""
    const IMAGE = aItem.img.toLowerCase()
    if (IMAGE.includes("blue")) color = "blue"
    else if (IMAGE.includes("dark_green")) color = "dark_green"
    else if (IMAGE.includes("green02")) color = "green02"
    else if (IMAGE.includes("green")) color = "green"
    else if (IMAGE.includes("dark_red")) color = "dark_red"
    else if (IMAGE.includes("orange")) color = "orange"
    else if (IMAGE.includes("purple")) color = "purple"
    if (!color) color = "orange"

    new Sequence()
        .effect()
        //.file("jb2a.fire_bolt.orange")
        .file(`jb2a.fire_bolt.${color}`)
        .atLocation(aToken)
        .stretchTo(target)
        .missed(args[0].hitTargets.length === 0)
        .play()
}