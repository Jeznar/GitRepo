const MACRONAME = "Enlarge_Reduce_0.7.js"
jez.log(MACRONAME)
/*****************************************************************************************
 * Implement Enlarge/Reduce and allow a choice for the target to accept the effect or 
 * attempt a saving throw.
 * 
 * Requires: DAE Callback macro: ActorUpdate runAsGM
 * 
 * DAE Macro.ItemMacro Execute, Effect Value = "Macro Name" @target **Maybe?**
 * 
 * HTML Color Codes: https://www.w3schools.com/tags/ref_colornames.asp
 * 
 * 01/07/22 0.1 Update Macro from what was already on the spell into my "normal" format
 * 01/07/22 0.2 Add dialog allowing acceptance of effect or forcing a saving throw
 * 01/09/22 0.4 Polishing the Apple
 *              - Remove the active effect on a successful save
 *              - Review the postResults messages, especially to show saveDC
 *              - Attempt to refresh token after size is changed
 *              - Test when used by a "normal" player
 * 01/10/22 0.5 Added generic functions to test argument types for Token5e and Actor5e
 * 01/10/22 0.6 Change the token update method to avoid apparent race condition
 * 05/03/22 0.7 Update for FoundryVTT 9.x (updateMany)
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME}`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const SIZE_ARRAY = ["error", "tiny", "sm", "med", "lg", "huge", "grg"]
jez.log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.constructor.name} ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.constructor.name} ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.constructor.name} ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";
let saveMsg = "";
const EFFECT_NAME = "Enlarge/Reduce"
const SAVE_DC = aActor.data.data.attributes.spelldc;
const SAVE_TYPE = "CON"
const GAME_RND = game.combat ? game.combat.round : 0;
//----------------------------------------------------------------------------------
// Make sure we have ActorUpdate and it is runAsGM
//
const ACTOR_UPDATE = game.macros?.getName("ActorUpdate");
if (!ACTOR_UPDATE) return ui.notifications.error(`Cannot locate ActorUpdate GM Macro`);
if (!ACTOR_UPDATE.data.flags["advanced-macros"].runAsGM) 
    return ui.notifications.error(`ActorUpdate "Execute as GM" needs to be checked.`);
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (!preCheck()) {
    jez.log(errorMsg)
    ui.notifications.error(errorMsg)
    return;
}

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
//if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use

jez.log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);

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
    if (args[0]?.tag === "OnUse") {
        if (!oneTarget()) return (false)
    }
    jez.log('All looks good, to quote Jean-Luc, "MAKE IT SO!"')
    return (true)
}

/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log("--------------OnUse-----------------", "Starting", `${MACRONAME} ${FUNCNAME}`,
        `First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken,
        `First Targeted Actor (tActor) ${tActor?.name}`, tActor);

    DialogSaveOrAccept();

    jez.log("--------------OnUse-----------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);

    //----------------------------------------------------------------------------------
    // 
    async function DialogSaveOrAccept() {
        jez.log(SAVE_TYPE.toLowerCase())
        new Dialog({
            title: "Save or Accept Spell",
            content: `<div><h2>Attempt Save -OR- Accept Effect</h2>
            <div><p style="color:Green;">Does <b>${tToken.name}</b> want to attempt <b>DC${SAVE_DC}</b> 
            ${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} (${SAVE_TYPE}) save vs 
            ${aToken.name}'s ${aItem.name} spell/effect?</p><div>`,
            buttons: {
                save: {
                    label: "Attempt Save",
                    callback: (html) => {
                        PerformCallback(html, "Save")
                    }
                },
                accept: {
                    label: "Accept Effect",
                    callback: (html) => {
                        PerformCallback(html, "Accept")
                    }
                },
            },
            default: "abort",
        }).render(true);
    }

    //----------------------------------------------------------------------------------
    // 
    async function PerformCallback(html, mode) {
        jez.log("PerformCallback() function executing.", "html", html, "mode", mode);
        let result = "";
        if (mode === "Save") {
            if (await attemptSave()) {  // Save was made
                result = "Saved"
                jez.log("PerformCallback obtained status:", result);
                msg = `<p style="color:DarkRed;"><b>${tToken.name}</b> avoids the effect of <b>${aToken.name}'s</b> ${aItem.name} 
                spell with a successful save.
                ${saveMsg}`
                postResults(msg);
             } else {                    // Save failed
                result = "Failed"
                jez.log("PerformCallback obtained status:", result);
                doEnlargeReduce();
            }
        } else if (mode === "Accept") {
            result = "Accepted"
            jez.log("PerformCallback obtained status:", result);
            saveMsg = `<p>${tToken.name} <b>declined</b> to attempt a <b>DC${SAVE_DC} ${SAVE_TYPE}</b> saving throw.</p>`
            doEnlargeReduce();
        }
    }
    //----------------------------------------------------------------------------------
    // Return true on success, false on failure
    //
     async function attemptSave() {
         const FUNCNAME = "attemptSave()";
         jez.log(`--------------${FUNCNAME}-----------`, "Starting", `${MACRONAME} ${FUNCNAME}`);
         let saved = false;

         const flavor = `${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} <b>DC${SAVE_DC}</b>
             to avoid <b>${aItem.name}</b> effect`;
         jez.log("---- Save Information ---", "SAVE_TYPE", SAVE_TYPE, "SAVE_DC", SAVE_DC, "flavor", flavor);

         let save = (await tActor.rollAbilitySave(SAVE_TYPE.toLowerCase(), { flavor, chatMessage: true, fastforward: true })).total;
         jez.log("save", save);
         if (save > SAVE_DC) {
             jez.log(`save was made with a ${save}`);
             saved = true;
             saveMsg = `<p style="color:Green;">${tToken.name} <b>made</b> its save with a <b>${save}</b> 
                        versus a <b>DC${SAVE_DC} ${SAVE_TYPE}</b> saving throw.</p>`          
             // Remove the effect already applied by DAE to the target, testing to make sure it exists
             let tActorExistingEffect = await tActor.effects.find(ef => ef.data.label === EFFECT_NAME)
             if (tActorExistingEffect) {
                 jez.log("")
                 jez.log(`Deleting existing effect`, tActorExistingEffect)
                 await tActorExistingEffect.delete();
             } else {
                 let msg = `${tToken.name} lacks the ${EFFECT_NAME} effect. This shouldn't happen.`
                 ui.notifications.error(mesg);
                 jez.log("")
                 jez.log(msg);
                 return (false);
             }
         } else {
             saveMsg = `<p style="color:Red;">${tToken.name} <b>failed</b> its save with a 
                        <b>${save}</b> versus a <b>DC${SAVE_DC} ${SAVE_TYPE}</b> saving throw.</p>`
             jez.log(`save failed with a ${save}`);
         }
         // addLightEffect(args[0].uuid, tActor, 60, colorCodes[selection])
         jez.log("--------------${FUNCNAME}-----------", "Finished", `${MACRONAME} ${FUNCNAME}`);
         return (saved);
     }
     //----------------------------------------------------------------------------------
     // Actually do the enlarge or reduce
     //
     async function doEnlargeReduce() {
         const FUNCNAME = "doEnlargeReduce()";
         jez.log(`--------------${FUNCNAME}---------------------`, "Starting", `${MACRONAME} ${FUNCNAME}`);
         let originalWidth = tToken.data.width;
         let mwak = tActor.data.data.bonuses.mwak.damage;
         let ogSizeValue = sizeOfToken(tToken); // Original Size of token, 1 = Tiny, ..., 6 = Gargantuan
         let ogSize = tActor.data.data.traits.size;
         await DAE.setFlag(tActor, 'enlageReduceSpell', {
            "width": originalWidth,
            "ogMwak": mwak,
            "ogSize": ogSize
        });
         await new Dialog({
             title: "Enlarge or Reduce",
             buttons: {
                 one: {
                     label: "Enlarge",
                     callback: async () => {
                         jez.log("Choice made: Enlarge")
                         let bonus = mwak + "+1d4";
                         let newWidth = (originalWidth + 1);
                         if (ogSizeValue > 5) { 
                             msg = `<p style="color:Brown;"><b>${aToken.name}'s</b> attempt to <b>enlarge</b> ${tToken.name} 
                                    fizzles. <b>${tToken.name}</b> is too large to be further enlarged<p>`
                             postResults(msg);
                             return (false);
                         }
                         jez.log("Ready  to call tActor.update","bonus",bonus,"SIZE_ARRAY[ogSizeValue + 1]",SIZE_ARRAY[ogSizeValue + 1])
                         // The next line throws a permission error of the form:
                         // --> Uncaught (in promise) Error: User Jon M. lacks permission to update Actor 
                         // await tActor.update({ "data.bonuses.mwak.damage":bonus, "data.traits.size":SIZE_ARRAY[ogSizeValue + 1] }); 
                         let updateData = { "data.bonuses.mwak.damage":bonus, "data.traits.size":SIZE_ARRAY[ogSizeValue + 1] }
                         await ACTOR_UPDATE.execute(tActor.id, updateData);

                         await jez.wait(1000)
                         jez.log("jezUpdateTokenHeightWidth(tToken, newWidth)","tToken",tToken,"newWidth",newWidth)
                         await jezUpdateTokenHeightWidth(tToken, newWidth);
                         jez.log("Ready to call tToken.refresh()")
                         // The next line throws a permission error of the form:
                         // --> Uncaught (in promise) Error: User Jon M. lacks permission to update Token [rveDGfJ0ygwzHYFb] in parent Scene [MzEyYTVkOTQ4NmZk]
                         //
                         await tToken.refresh();  // Causes the token to be redrawn *NOW*
                         await jez.wait(1000)

                         jez.log(`tToken ${tToken.name}`, tToken)
                         msg = `<p style="color:DarkGreen;">
                                <b>${aToken.name}'s</b> attempt to <b>enlarge</b> ${tToken.name} is met with success!.</p>
                                ${saveMsg}
                                <p>${tToken.name} is now one size category larger.</p>`
                         postResults(msg);
                     }
                 },
                 two: {
                     label: "Reduce",
                     callback: async () => {
                         jez.log("Choice made: Reduce")
                         let bonus = mwak + "-1d4";
                         let newWidth = (originalWidth > 1) ? (originalWidth - 1) : (originalWidth - 0.25);
                         if (ogSizeValue < 2) {
                             msg = `<p style="color:Brown;"><b>${aToken.name}'s</b> attempt to <b>enlarge</b> ${tToken.name} 
                                    fails. ${tToken.name} is too small to be further reduced.<p>`
                             postResults(msg);
                             return (false);
                         }
                         await tActor.update({ "data.bonuses.mwak.damage": bonus, "data.traits.size": SIZE_ARRAY[ogSizeValue - 1] });
                         await jezUpdateTokenHeightWidth(tToken, newWidth);
                         msg = `<p style="color:DarkGreen;"><b>${aToken.name}'s</b> attempt to <b>reduce</b> 
                                ${tToken.name} is met with success!.<p>
                                ${saveMsg}
                                ${tToken.name} is now one size category smaller.</p>`
                         postResults(msg);
                         await jez.wait(500);
                         await tToken.refresh();  // Causes the token to be redrawn *NOW*
                     }
                 },
             }
         }).render(true);
         jez.log(`--------------${FUNCNAME}---------------------`, "Finished", `${MACRONAME} ${FUNCNAME}`);
         return;
     }

     //----------------------------------------------------------------------------------
     // Obtain size of the target
     //
     function sizeOfToken(token1) {
         const FUNCNAME = "sizeOfToken(token1)";
         jez.log(`--------------${FUNCNAME}---------------------`, "Starting", `${MACRONAME} ${FUNCNAME}`, "token1", token1);
         class CreatureSizes {
             constructor(size) {
                 this.SizeString = size;
                 switch (size) {
                     case "tiny": this.SizeInt = 1; break;
                     case "sm": this.SizeInt = 2; break;
                     case "med": this.SizeInt = 3; break;
                     case "lg": this.SizeInt = 4; break;
                     case "huge": this.SizeInt = 5; break;
                     case "grg": this.SizeInt = 6; break;
                     default: this.SizeInt = 0;  // Error Condition
                 }
             }
         }
         
         let token1SizeString = token1.document._actor.data.data.traits.size;
         let token1SizeObject = new CreatureSizes(token1SizeString);
         let token1Size = token1SizeObject.SizeInt;  // Returns 0 on failure to match size string
         if (!token1Size) {
             errorMsg = `Size of ${token1.name}, ${token1SizeString} failed to parse. End ${macroName}<br>`;
             jez.log(errorMsg);
             ui.notifications.error(errorMsg);
             return (99);
         }
         jez.log(`=====> Token1 ${token1.name}: ${token1SizeString} ${token1Size}`)
         return (token1Size);
     }
}
/************************************************************************
 * Verify exactly one target selected, boolean return
 ************************************************************************/
async function jezUpdateTokenHeightWidth(tok, newWidth) {
    if (jez.IsToken5e(tok)) {
        jez.log(`Update ${tok.name} updating width to ${newWidth}`)
        let updates = [];
        updates.push({
            _id: tok.id,
            height: newWidth,
            width: newWidth
        });
        // canvas.tokens.updateMany(updates);                           // Depricated 
        game.scenes.current.updateEmbeddedDocuments("Token", updates);  // FoundryVTT 9.x 
        return(true);
    } else {
        errorMsg = `Argument passed was not of object type Token5e`
        jez.log(errorMsg, tok)
        ui.notifications.error(errorMsg)
        return(false)
    }
}
/************************************************************************
 * Verify exactly one target selected, boolean return
 ************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        errorMsg = `Targeted nothing, must target single token to be acted upon`;
        jez.log(errorMsg);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        errorMsg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        jez.log(errorMsg);
        return (false);
    }   
    jez.log(`Targeting one target, a good thing`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    let flag = DAE.getFlag(aActor, 'enlageReduceSpell');
    jez.log("flag", flag)
    if (flag) {
        await aActor.update({
            "data.bonuses.mwak.damage": flag.ogMwak,
            "data.traits.size": flag.ogSize
        });

        await jezUpdateTokenHeightWidth(aToken, flag.width);
        aToken.refresh();  // Causes the token to be redrawn *NOW*

        // await aToken.document.data.update({"width": flag.width,"height": flag.width});
        await DAE.unsetFlag(aActor, 'enlageReduceSpell');
        ChatMessage.create({ content: `<b>${aToken.name}</b> is returned to normal size` });
    } else {
        msg = `"DAE.getFlag(aActor, 'enlageReduceSpell') did not find flag value.`
        jez.log(msg)
    }
    jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
/***************************************************************************************************
 * Post the results to chat card
 ***************************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];
    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    jez.log(`chatMessage: `,chatMessage);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}