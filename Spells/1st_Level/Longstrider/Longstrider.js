const MACRONAME = "Longstrider"
/*****************************************************************************************
 * Simply run a rather generic VFX on the target of this spell and post a completion 
 * message.
 * 
 * 03/19/22 0.1 Creation of Macro
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
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";

//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && !preCheck())return;

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
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        postResults(msg);
        return (false);
    }
    /*if (LAST_ARG.hitTargets.length === 0) {  // If target was missed, return
        msg = `Target was missed.`
        postResults(msg);
        return(false);
    }*/
    /*if (args[0].failedSaveUuids.length !== 1) {  // If target made its save, return
        msg = `Saving throw succeeded.  ${aItem.name} has no effect.`
        postResults(msg);

        return(false);
    }*/
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
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)

    let school = getSpellSchool(aItem)
    let color = jez.log(getRandomRuneColor())
    runRuneVFX(tToken, school, color, 0.4, 1) 

    msg = `Maybe say something useful...`
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Retrieve and return the spell school string formatted for jb2a from the passed item or false if 
 * none found.
 ***************************************************************************************************/
 function getSpellSchool(item) {
    let school = item?.data?.school
    if (!school) return (false)
    switch (school) {
        case "abj" : school = "abjuration"; break
        case "con" : school = "conjuration"; break
        case "div" : school = "divination"; break
        case "enc" : school = "enchantment"; break
        case "evo" : school = "evocation"; break
        case "ill" : school = "illusion"; break
        case "nec" : school = "necromancy"; break
        case "trs" : school = "transmutation"; break
        default: school = false
    }
    return (school)
}
/***************************************************************************************************
 * Return a random supported color for spell rune
 ***************************************************************************************************/
 function getRandomRuneColor() {
    let allowedColorArray = ["blue", "green", "pink", "purple", "red", "yellow"];
    // Returns a random integer from 0 to (allowedColorArray.length):
    let index = Math.floor(Math.random() * (allowedColorArray.length));
    return (allowedColorArray[index])
 }
/***************************************************************************************************
 * Run a 3 part spell rune on indicated token with passed school and color
 ***************************************************************************************************/
 async function runRuneVFX(token, school, color, scale, opacity) {
    const INTRO = `jb2a.magic_signs.rune.${school}.intro.${color}`
    const BODY  = `jb2a.magic_signs.rune.${school}.loop.${color}`
    const OUTRO = `jb2a.magic_signs.rune.${school}.outro.${color}`
    new Sequence()
    .effect()
        .file(INTRO)
        .atLocation(token) 
        .scale(scale)
        .opacity(opacity)
        .waitUntilFinished(-500) 
    .effect()
        .file(BODY)
        .atLocation(token)
        .scale(scale)
        .opacity(opacity)
        //.persist()
        .duration(4000)
        .waitUntilFinished(-500) 
    .effect()
        .file(OUTRO)
        .atLocation(token)
        .scale(scale)
        .opacity(opacity)
    .play();
}