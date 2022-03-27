const MACRONAME = "Beyond_Death.js"
/*****************************************************************************************
 * This macro simply sets current health to one if it was zero.  It does not check to see
 * if the hit that reduced to zero was a critical and it does not automatically fire.
 * 
 *   When reduced to 0 hit points by an attack that isn't a crical hit, and  not killed 
 *   outright, can choose to fall to 1 hit point instead.
 * 
 * 03/27/22 0.1 Creation of Macro
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
jez.log("aItem",aItem)
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
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    jez.log("doOnUse()")
    jez.log(" aToken.actor.data.data.attributes", aToken.actor.data.data.attributes)
    let curHp = aToken.actor.data.data.attributes?.hp?.value
   
    jez.log("curHp",curHp)
    //----------------------------------------------------------------------------------------------
    // If actor has remaining HP, post as such and exit
    //
    if (curHp > 0) {
        msg = `${aToken.name} still has HP. ${aItem.name} no effect`;
        postResults(msg);
        return (false);
    }
    //----------------------------------------------------------------------------------------------
    // Increase actor's health by 1 HP
    //
    const DAM_TYPE = "healing";
    jez.log("DAM_TYPE",DAM_TYPE)
    let healDamage = new Roll(`1`).evaluate({ async: false });
    await new MidiQOL.DamageOnlyWorkflow(aToken.actor, aToken, healDamage.total, DAM_TYPE, [aToken],
        healDamage, { flavor: `(${CONFIG.DND5E.healingTypes[DAM_TYPE]})`, 
        itemCardId: args[0].itemCardId, useOther: false });
    replaceHitsWithHeals()
    await jez.wait(250)
    msg = `${aToken.name} teeters on the edge of death but resists it.`
    postResults(msg)
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
/***************************************************************************************
 * Replace first " hits" with " Heals" on chat card
 ***************************************************************************************/
 async function replaceHitsWithHeals() {
    let chatmsg = game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatmsg.data.content);
    const searchString = / hits/g;
    const replaceString = `<p style="color:Green;"> Restores</p>`;
    content = await content.replace(searchString, replaceString);
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}