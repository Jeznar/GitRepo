const MACRONAME = "Mutate_Disporition.0.1"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let msg = "";
//
// Set the value for the Active Actor (aActor)
let aActor;
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else aActor = game.actors.get(LAST_ARG.actorId);
//
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const VFX_FILE = "Icons_JGB/Misc/Angry.gif"
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)
    //-----------------------------------------------------------------------------------------------
    // Spit out current dispositions
    //
    console.log("Active Actor Disposition", aActor.data.token.disposition)
    console.log("Active Token Disposition", aToken.data.disposition)
    console.log("Target Actor Disposition", tActor.data.token.disposition)
    //-----------------------------------------------------------------------------------------------
    // Warpgate Mutate target to have same disposition as active actor
    //
    let updates = {
        token : {
            // name: "My Special Goblin", 
            disposition: aActor.data.token.disposition,
        },
    }
    await warpgate.mutate(tToken.document, updates);
    //-----------------------------------------------------------------------------------------------
    // Refresh target data
    //
    // await jez.wait(100)


    //-----------------------------------------------------------------------------------------------
    // Chill for 5 seconds
    //
    let delay = 5
    console.log(`Chill for ${delay} seconds...`)
    for (let i = 1; i <= 5; i++) {
        await jez.wait(1000)
        console.log(i)
    }
    //-----------------------------------------------------------------------------------------------
    // Warpgate Mutate target to opposite of what it had been set to
    //
    tToken = canvas.tokens.get(args[0]?.targets[0]?.id); 
    console.log("Target Actor Disposition", tToken.data.disposition)
    updates = {
        token : {
            // name: "My Special Goblin", 
            disposition: tToken.data.disposition * -1,
        },
    }
    await warpgate.mutate(tToken.document, updates);

    new Sequence()
        .effect()
        .file(VFX_FILE)
        .atLocation(tToken)
        .center()
        .scale(.2)
        .opacity(1)
        .fadeIn(1500)
        .duration(5000)
        .fadeOut(1500)
        .play()

    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
