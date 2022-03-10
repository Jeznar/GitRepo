const MACRONAME = "Blood_Staff_Soul_Drain.js"
/*****************************************************************************************
 * Add 2d6 temp HP to invoking actor and some splashy VFX
 * 
 * 03/10/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
let msg = "";
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (args[0]?.tag === "OnUse") if (!preCheck()) return(false)
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
        ui.notifications.info(msg);
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
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)
    //----------------------------------------------------------------------------------------------
    // Is the targeted token dead, zero HP?
    //
    if (tToken.actor.data.data.attributes.hp.value !== 0) {
        msg = `Fortunately for <b>${tToken.name}</b> it is alive!  This spell can only drain the 
        soul of a creature just killed by the wielder of this item.`
        ui.notifications.info(msg);
        postResults(msg);
        return (false);
    } else jez.log(`Yea? ${tToken.name} is dead and can have hex moved`)
    //----------------------------------------------------------------------------------------------
    // Fire up some nifty visual effects
    //
    runVFX(aToken, tToken)
    //----------------------------------------------------------------------------------------------
    // Roll some temp HP
    //
    let numDice = 2
    let diceType = "d6"
    let bonus = 0
    let newTempHp = new Roll(`${numDice}${diceType}+${bonus}`).evaluate({ async: false });
    jez.log("newTempHp",newTempHp)
    game.dice3d?.showForRoll(newTempHp);
    jez.log("newTempHp.total",newTempHp.total)
    //----------------------------------------------------------------------------------------------
    // Fetch the Old temp HP for comparison to the new ones
    //
    let oldTempHp = aToken.actor.data.data.attributes.hp.temp;
    jez.log("oldTempHp",oldTempHp)
    //----------------------------------------------------------------------------------------------
    // If the new temp HP are more than the old ones, upgrade the quantity
    //
    if (newTempHp.total <= oldTempHp) {
        jez.log(` old temp HP was ${oldTempHp}, not changing temporary hit points`); 
        msg = `${aToken.name} has ${oldTempHp} temporary hit points. The ${newTempHp.total} can not be used.`
    } else { 
        await aToken.actor.update({
            'data.attributes.hp.temp' : newTempHp.total
            //,'data.attributes.hp.tempmax' : newTempHp.total
        })
        msg = `<b>${aToken.name}</b> had ${oldTempHp} temporary hit points, gained ${newTempHp.total-oldTempHp}. 
        ${aToken.name} now has ${newTempHp.total} temp HP.`
    }
    //----------------------------------------------------------------------------------------------
    // Post the results and exit
    //
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Play a VFX beam from the drained target to the caster
 ***************************************************************************************************/
async function runVFX(token1, token2) {
    const VFX_BEAM = "modules/jb2a_patreon/Library/Generic/Energy/EnergyStrand_Multiple01_Dark_Red_30ft_1600x400.webm"
    const VFX_CLOUD = "modules/jb2a_patreon/Library/Generic/Marker/EnergyStrands_01_Dark_Red_600x600.webm"
    new Sequence()
        .effect()
            .atLocation(token2)
            .reachTowards(token1)
            .scale(1)
            .repeats(5,1200)
            .file(VFX_BEAM)
            .waitUntilFinished(-2000) 
        .effect()
            .file(VFX_CLOUD)
            .atLocation(token1)
            .scale(0.3)
            .opacity(1)
        .play();
    }