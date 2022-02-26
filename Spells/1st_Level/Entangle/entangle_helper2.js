const MACRONAME = "entangle_helper2.js"
/*****************************************************************************************
 * This is a helper macro for the main entangle script.  It is intended to provide an 
 * option dialog for a Restrained token to attempt a skill check to escape the sitch.
 * 
 * Input arguments expected to be: ${EFFECT} ${CHK_TYPE} ${SAVE_DC} ${aToken.id}
 * 
 * 02/23/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "each") doEach();					    // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
 async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const CONDITION = args[1]
    const CHK_TYPE  = args[2]
    const CHK_DC    = args[3]
    const TOKEN_ID  = args[4]
    const SOURCE_T  = canvas.tokens.placeables.find(ef => ef.id === TOKEN_ID)
    jez.log(`Condition: ${CONDITION}, Check Type: ${CHK_TYPE}, Check DC: ${CHK_DC}, Source: ${SOURCE_T.name}`)

    let d = Dialog.confirm({
        title: "Attempt to break the Restrained effect",
        content: `<p>Does ${aToken.name} want to spend its action this turn to attempt to break the 
        restrained effect impossed by ${SOURCE_T.name}?  This would be a DC${CHK_DC} ${CHK_TYPE} skill 
        check.<br></p>`,
        yes: () => dCallback(CONDITION, CHK_TYPE, CHK_DC, SOURCE_T),
        no: () => console.log("You chose ... poorly"),
        defaultYes: false
       });
    
    jez.log("The doEach code")
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
 async function dCallback(CONDITION, CHK_TYPE, CHK_DC, SOURCE_T) {
    jez.log("perform skill check and maybe clear the effect")
    const FLAVOR = `Attempting ${CHK_TYPE.toUpperCase()} DC${CHK_DC} to break ${CONDITION}`
    let check = (await aToken.actor.rollAbilityTest(CHK_TYPE,
        { flavor: FLAVOR, chatMessage: true, fastforward: true })).total;
    if (check >= CHK_DC)  {
        let effect = aToken.actor.effects.find(ef => ef.data.label === CONDITION) ?? null
        await effect.delete();
        jez.postMessage({
            color: "dodgerblue",
            fSize: 14,
            icon: aToken.data.img,
            msg: `<b>${aToken.name}</b> succeeded in breaking the <b>${CONDITION}</b> condition 
                imposed by <b>${SOURCE_T.name}</b>. 
                Skill check of <b>${check}</b> beats the ${CHK_TYPE.toUpperCase()} DC${CHK_DC}.`,
            title: `${aToken.name} breaks free`,
            token: aToken
        })
    } else {
        jez.postMessage({
            color: "firebrick",
            fSize: 14,
            icon: aToken.data.img,
            msg: `<b>${aToken.name}</b> fails to break the <b>${CONDITION}</b> condition imposed 
                by <b>${SOURCE_T.name}</b>. 
                Skill check of <b>${check}</b> fell short of the ${CHK_TYPE.toUpperCase()} DC${CHK_DC}.`,
            title: `${aToken.name} remains ${CONDITION}`,
            token: aToken
        })
    }
 }