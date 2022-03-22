const MACRONAME = "Fighting_Style_Interception"
/*****************************************************************************************
 * This is my attempt to implement something useful as a parttial automation of Fighting
 * Style: Inteception. Following is RAW:
 * 
 *   When a creature you can see hits a target, other than you, within 5 feet of you with 
 *   an attack, you can use your reaction to reduce the damage the target takes by 1d10 
 *   + your proficiency bonus (to a minimum of 0 damage). You must be wielding a shield 
 *   or a simple or martial weapon to use this reaction.
 * 
 * There are a number of conditions in that description that make it hard to automate. My
 * implementation aims to provide an "item" that can be used to do what is effectively a 
 * reactionary heal. This will not always be correct, but it ains to be better than nothing.
 * 
 * User of the item targets the token to be protected by the item and fires the ability, then:
 *  1. Health of target token is checked and amount below max health calculated.
 *  2. Roll the 1d10 + @prof representing maximum damage blocked.
 *  3. Pop Dialog asking GM how much damage can be blocked by this intecept
 *  4. Heal the target for the minium of 1, 2, and 3 numbers.
 *  5. Add an appropriate message to the chat log.
 * 
 * 02/11/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const LAST_ARG = args[args.length - 1];
let tToken = null
let healthDeficit = 0
let blockAmount = 0
let msg = "";
let aToken = canvas.tokens.get(LAST_ARG.tokenId);
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (!preCheck())  {await jez.wait(250); return;}
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
await doOnUse();          // Midi ItemMacro On Use
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
    return(true)
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 async function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: "Blue", fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    //----------------------------------------------------------------------------------------------
    // Step 1. Health of target is checked and amount below max health calculated. Exiting if zero.
    //
    let CurrentHP = tToken.actor.data.data.attributes.hp
    healthDeficit = CurrentHP.max - CurrentHP.value
    if (healthDeficit === 0 ) {
        msg = `${tToken.name} is still at maximum health.`;
        postResults(msg);
        return(false);
    }
    //----------------------------------------------------------------------------------------------
    // Step 2. Obtain the block Amount from the item's roll passed in the environment
    //
    blockAmount = LAST_ARG.damageTotal
     //----------------------------------------------------------------------------------------------
     // Step 3. Pop Dialog asking GM how much damage can be blocked by this intecept
     //
     let template = `<div><label>Enter the amount of damage done to ${tToken.name} in the single 
     attack that triggered ${aToken.name}'s use of Interception ability. This is the maximum damage
     that can be negated.  (${tToken.name} is currently ${healthDeficit} below maximum health.)</label>
<div class="form-group" style="font-size: 14px; padding: 5px; 
    border: 2px solid silver; margin: 5px;">
    <input name="TEXT_SUPPLIED" style="width:350px" value=${healthDeficit}></div>`
     let d = new Dialog({
         title: `How much damage can ${aToken.name} Intercept?`,
         content: template,
         buttons: {
             done: {
                 label: "Intercept",
                 callback: (html) => {
                     callBackFunc(html);
                 }
             },
             cancel: {
                 label: "Cancel",
                 callback: (html) => {
                     msg = `Hopefully, ${aToken.name} didn't really want to Intercept because the GM 
                            Canceled the action.`;
                     postResults(msg);
                     return(false)
                 }
             }
         },
         default: "done"
     })
     d.render(true)
     return
 }
/***************************************************************************************************
 * Callback triggered via the dialog
 ***************************************************************************************************/
 async function callBackFunc(html) {
    const TEXT_SUPPLIED = html.find("[name=TEXT_SUPPLIED]")[0].value;
    if (TEXT_SUPPLIED === "") {
        msg = `An empty string was supplied as maximum damage that can be restored.  This is treated
        as a zero, so no health will be restored to ${tToken.name}.`;
        postResults(msg);
        return;
    }
    let damageDone = parseInt(TEXT_SUPPLIED)
    jez.log("damageDone",damageDone)
    if (isNaN(damageDone)) {
        msg = `Bad!<br><br>Bad GM!<br><br>The text entered "${TEXT_SUPPLIED}" could not be parsed to 
        extract a leading integer.`;
        postResults(msg);
        return;
    }
    runVFX()
    //----------------------------------------------------------------------------------------------
    // Step 4. Heal the target for the minium of 1, 2, and 3 numbers.
    //
    //jez.log("damageDone",damageDone)
    let healAmount = Math.min(damageDone, healthDeficit, blockAmount)
    //jez.log("healAmount",healAmount)
    let healDamage = new Roll(`${healAmount}`).evaluate({ async: false });
    //jez.log("healDamage",healDamage);
    await new MidiQOL.DamageOnlyWorkflow(aToken.actor, aToken, healAmount, "healing", [tToken],
        healDamage, { flavor: `(flavor message...)`, 
        itemCardId: args[0].itemCardId, useOther: false });
    //----------------------------------------------------------------------------------------------
    // Step 5. Add an appropriate message to the chat log.
    //
    msg = `<b>${aToken.name}</b> prevents ${healAmount} damage to <b>${tToken.name}</b>`
    await postResults(msg);
    await jez.wait(250)
    await replaceHitsWithProtects();
    return;
}
/***************************************************************************************************
 * Run VFX on protected Token
 ***************************************************************************************************/
 async function runVFX() {
    new Sequence()
        .effect()
            //.file("jb2a.icon.shield.green")
            .file("modules/JB2A_DnD5e/Library/Generic/UI/IconShield_01_Regular_Green_200x200.webm")
            .attachTo(tToken)
            .scaleIn(0.3, 500)
            .scaleToObject(1.5)
            .scaleOut(0.3, 500)
            .opacity(1.0)
        .play();
}
/***************************************************************************************
 * Replace " hits" with " Protects" on chat card
 ***************************************************************************************/
 async function replaceHitsWithProtects() {
    let chatmsg = game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatmsg.data.content);
    const searchString = / hits/g;
    const replaceString = `<p style="color:Blue;"> Protects</p>`;
    content = await content.replace(searchString, replaceString);
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}