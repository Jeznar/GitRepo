const MACRONAME = "Agonizing_Blast_0.2"
/*****************************************************************************************
 * 01/01/22 0.1 Creation of Macro
 * 02/08/22 0.2 Now calls library functions
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`----------- Starting ${MACRONAME}------------------------------------------------`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const ALLOWED_UNITS = ["", "ft", "any"];
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
let tActor = tToken?.actor;
let msg = "";
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (!preCheck()) return;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`----------- Finishing ${MACRONAME}---------------------------------------------------------`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/
/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    //----------------------------------------------------------------------------------------------
    // Make sure exactly one token is targeted
    //
    if (game.user.targets.ids.length != 1) {
        msg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        jez.log(msg);
        ui.notifications.warn(msg);
        return (false);
    }
    //----------------------------------------------------------------------------------------------
    // Obtain the range of active ability and make sure units are ok
    //
    let maxRange = jez.getRange(aItem, ALLOWED_UNITS)
    if (!maxRange) {
        msg = `Range is 0 or incorrect units on ${aItem.name}`;
        jez.log(msg);
        ui.notifications.warn(msg);
        return(false)
    }
    //----------------------------------------------------------------------------------------------
    // Make sure the target is in range
    //
    if(!jez.inRange(aToken, tToken, maxRange)) {
        msg = `Target is not in range for ${aItem.name}`;
        jez.log(msg);
        ui.notifications.warn(msg);
        return(false);
    }
    return (true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);  
    const PREFIX = "EldritchBlast_01_"
    let color = "";
    switch (Math.floor(Math.random()*3)) {
        case 0: color = "Dark_Green";   break;
        case 1: color = "Dark_Purple";  break;
        case 2: color = "Dark_Red";     break;
        default: ui.notifications.error("Value was not 0, 1, or 2")
    }
    jez.log("Color selected: ", color)
    let fileName = PREFIX + color + fileSuffix(aToken, tToken)
    jez.log("File Name", fileName)
    new Sequence()
        .effect()
            .file(`modules/jb2a_patreon/Library/Cantrip/Eldritch_Blast/${fileName}`)
            .atLocation(aToken)
            .stretchTo(args[0].targets[0])
            .missed(args[0].hitTargets.length === 0)
        .play()
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Return the distance to the target
 ***************************************************************************************************/
 function fileSuffix(token1, token2) {
        let dist = canvas.grid.measureDistance(token1, token2).toFixed(0);
        jez.log("dist", dist);
        let suffix = "";
        if      (dist < 15)   suffix = "_05ft_600x400.webm"
        else if (dist < 30)   suffix = "_15ft_1000x400.webm"
        else if (dist < 60)   suffix = "_30ft_1600x400.webm"
        else if (dist < 90)   suffix = "_60ft_2800x400.webm"
        else if (dist <= 130) suffix = "_90ft_4000x400.webm"
        jez.log("suffix", suffix)
        return(suffix)
 }