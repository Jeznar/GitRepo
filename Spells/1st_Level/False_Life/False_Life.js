const MACRONAME = "False_Life.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * False Life places a scaling effect on the caster, giving them 1d4+4 temp hit points that 
 * increases by 5 for every upcast level. 
 * 
 * 06/27/22 0.1 Creation of Macro
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
const SPELL_LEVEL = LAST_ARG?.spellLevel;

//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 function postResults(msg) {
    //jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //-----------------------------------------------------------------------------------------------
    // Determine how many temp hp can be added to the caster
    //
    let tempHitPointRoll = new Roll(`1d4`).evaluate({ async: false });
    jez.log("tempHitPointRoll",tempHitPointRoll)
    game.dice3d?.showForRoll(tempHitPointRoll);
    let tempHP = tempHitPointRoll.total + 4 + (SPELL_LEVEL-1)*5
    let oldTempHp = aToken.actor.data.data.attributes.hp.temp;
    let newTempHp = Math.max(tempHP, oldTempHp)
    jez.log("newTempHp",newTempHp)
    //-----------------------------------------------------------------------------------------------
    // If HP is being added, update the actor and bake an appropriate message
    //
    if (tempHP <= oldTempHp) {
        jez.log(`Old temp HP was ${oldTempHp}, not changing temporary hit points`); 
        msg = `${aToken.name} has ${oldTempHp} temporary hit points. The ${tempHP} can not be used.`
    } else { 
        jez.runRuneVFX(aToken, jez.getSpellSchool(aItem))
        await aToken.actor.update({
            'data.attributes.hp.temp' : newTempHp,
            // 'data.attributes.hp.tempmax' : newTempHp.total
        })
        msg = `<b>${aToken.name}</b> had ${oldTempHp} temporary hit points, added ${tempHP-oldTempHp}. 
        ${aToken.name} now has ${newTempHp} temporary HP.`
    }
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
