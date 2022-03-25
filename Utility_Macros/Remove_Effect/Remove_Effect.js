const MACRONAME = "Remove_Effect"
/*****************************************************************************************
 * Remove the effect defined as args[2] from the token defined as args[1]
 * 
 * 03/25/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let msg = "";
doIt();
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/
async function doIt() {
    if (args.length !== 4) {
        // Actually expecting 4 arguments as a DAE macro.  One is evocation type, last is environment
        msg = `${MACRO} requires two arguments, a token ID and the name of effect to remove.`
        ui.notifications.error(msg)
        return (false);
    }
    //----------------------------------------------------------------------------------
    // Obtain the token passed as the first argument
    //
    jez.log("try to find token associated with", args[1])
    let tToken = canvas.tokens.placeables.find(ef => ef.id === args[1])
    if (!tToken) {
        msg = `Token associated with ${args[1]} was not found on canvas.`
        ui.notifications.error(msg)
        return (false);
    }
    //----------------------------------------------------------------------------------
    // Find the effect named as args[2] pm the target Token.
    // NOTE: The effect name will need to be quoted by invoking function if it contains 
    //       whie
    //
    jez.log("try to find effect named", args[2])
    let effect = await tToken.actor.effects.find(i => i.data.label === args[2]);
    if (!effect) {
        msg = `Effect named "${args[2]}" could not be found on ${tToken.name}.`
        ui.notifications.error(msg)
        return (false);
    }
    //----------------------------------------------------------------------------------
    // Remove the effect from the token
    //
    jez.log("Remove the effect from the token")
    await effect.delete()
}