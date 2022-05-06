const MACRONAME = "Create_Bonfire.0.1.js"
/*****************************************************************************************
 * Create Bonfire.
 * 
 *   Description: Create a bonfire on ground that you can see within range. Until the 
 *   spell ends, the magic bonfire fills a 5-foot cube. Any creature in the bonfire's 
 *   space when you cast the spell must succeed on a Dexterity save or take 1d8 fire 
 *   damage.
 * 
 *   A creature must also make the saving throw when it moves into the bonfire's space 
 *   for the first time on a turn or ends its turn there. 
 * 
 *   The bonfire ignites flammable objects in its area that aren't being worn or carried.
 * 
 *   The spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), 
 *   and 17th level (4d8).
 * 
 * 05/05/22 0.1 Creation of Macro
  *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`-------------------Starting ${MACRONAME}----------------------------------`)
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; 
    else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); 
    else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; 
    else aItem = lastArg.efData?.flags?.dae?.itemData;
let SAVE_DC = aItem.data.save.dc;
let msg = "";
const BONFIRE_ORIG_NAME = "%Bonfire%"
const EFFECT = "Binding Curse"
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") doOnUse();          // Midi ItemMacro On Use
//if (args[0] === "off") await doOff();           // DAE removal
//if (args[0] === "each") doEach();			      // DAE removal
jez.log(`-------------------Finishing ${MACRONAME}----------------------------------`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
     const FUNCNAME = "doOnUse()";
     const SQ_WID = game.scenes.viewed.data.grid;
     //let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
     jez.log(`---------Starting ${MACRONAME} ${FUNCNAME}----------------------`)
     //-----------------------------------------------------------------------------------------
     // Get the TEMPLATE object and delete the template.
     //
     const templateID = args[0].templateId
     // Set the x,y coordinates of the targeting template that was placed.
     const TEMPLATE = canvas.templates.get(templateID).data
     //const X = canvas.templates.get(templateID).data.x
     //const Y = canvas.templates.get(templateID).data.y
     //let center = { x: TEMPLATE.x, y: TEMPLATE.y}
     //jez.log("Center", center)
     // Delete the template that had been placed
     canvas.templates.get(templateID).document.delete()
    //--------------------------------------------------------------------------------------
    // Spawn in the Bonfire, catch its token.id, exit on failure to spawn
    //
    const BONFIRE_ID = await spawnBonfire({x:TEMPLATE.x+SQ_WID/2,y:TEMPLATE.y+SQ_WID/2}, 
        `${aToken.name}'s Bonfire`)
    if (!BONFIRE_ID) {
        msg = `Bonfire could not be spawned.   ${BONFIRE_ORIG_NAME} must be available in <b>Actors 
        Directory</b>.<br><br>
        Can not complete the ${aItem.name} action.`;
        postResults(msg);
        return (false);
    }
    //--------------------------------------------------------------------------------------
    // Modify the concentrating effect to delete the Bonfire on termination
    //
    // modConcentratingEffect(aToken, tToken)
    //--------------------------------------------------------------------------------------
    // 
    //
    postResults(msg);
    jez.log("--------------OnUse-----------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}
/***************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************/
  async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
    //--------------------------------------------------------------------------------------
    // Delete the existing bonfire
    //
    let sceneId = game.scenes.viewed.id
    let casterId = args[1]
    let bonfireId = args[2]
    warpgate.dismiss(bonfireId, sceneId)
    jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 * 
 *   If a creature starts its turn more than 10 feet from the binding point, they must make 
 *   a Strength saving throw, on faiure dragged 5 feet toward the binding point.
 ***************************************************************************************************/
async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
    //--------------------------------------------------------------------------------------
    // Need distance between current token and associated bonfire token
    //
    const CASTER_ID = args[1]
    const BONFIRE_ID = args[2]
    const SAVE_DC = args[3]
    let bonfireToken = canvas.tokens.placeables.find(ef => ef.id === BONFIRE_ID)
    if (!bonfireToken) {
        msg = `Could not find bonfire token with id "${BONFIRE_ID}"`
        ui.notifications.warn(msg);
        jez.log(msg)
        return (false)
    }
    let distance = jez.getDistance5e(aToken, bonfireToken);
    jez.log(`Distance between ${aToken.name} and ${bonfireToken.name} is ${distance} feet.`)
    if (distance > 10) {
        //--------------------------------------------------------------------------------------
        // Roll saving throw to see if aToken needs to be moved 5 feet toward bonfire
        //
        const SAVE_TYPE = "str"
        const flavor = `${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} <b>DC${SAVE_DC}</b>
        to avoid <b>${aItem.name}</b> pull`;
        let save = (await aActor.rollAbilitySave(SAVE_TYPE.toLowerCase(),
            { flavor:flavor, chatMessage: true, fastforward: true })).total;
        jez.log("save", save);
        if (save >= SAVE_DC) {
            msg = `<b>${aToken.name}</b> resisted the pull of <b>${bonfireToken.name}</b>. 
            Rolling a <b>${save}</b> on the ${SAVE_DC} DC 
            ${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} save.`
            jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                msg: msg, title: `Pull resisted`, token: aToken })
        } else {
            jez.moveToken(bonfireToken, aToken, -1, 1500)
            msg = `<b>${aToken.name}</b> is pulled five feet toward <b>${bonfireToken.name}</b>. 
            Having failed the ${SAVE_DC} DC ${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} 
            save with a <b>${save}</b> roll.`
            jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                msg: msg, title: `Pull succeeded`, token: aToken })
        }
    }
    if (distance > 0) chainEffect(aToken, bonfireToken)
    //----------------------------------------------------------------------------------------------
    // Pop Dialog asking GM if the afflicted wants to attempt a save to move.
    //
    const SAVE_TYPE = "wis"
    let template = `<div><label></label>
     <div class="form-group" style="font-size: 14px; padding: 5px; 
     border: 2px solid silver; margin: 5px;"><b>${aToken.name}</b> must succeed on a ${SAVE_DC} DC 
     ${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} save to move more than 5 feet from
     <b>${bonfireToken.name}</b>.  Does ${aToken.name} wish to attempt the save?</div>`
    let d = new Dialog({
        title: `Does ${aToken.name} want to move away from Bonfire?`,
        content: template,
        buttons: {
            attempt: {
                label: "Attempt Save",
                callback: (html) => {
                    callBackFunc(html);
                }
            },
            decline: {
                label: "Decline Save",
                callback: (html) => {
                    msg = `<b>${aToken.name}</b> has declined to attempt a save, it may not move further 
                    from <b>${bonfireToken.name}</b> than five feet.`
                    jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                        msg: msg, title: `Declined Save Attempt`, token: aToken })
                    return (false)
                }
            }
        },
        default: "attempt"
    })
    d.render(true)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
    //----------------------------------------------------------------------------------------------
    // Dialog call back function to attempt saving throw
    //
    async function callBackFunc(html) {
        const SAVE_TYPE = "wis"
        const flavor = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to move away`;
        let save = (await aActor.rollAbilitySave(SAVE_TYPE,
            { flavor:flavor, chatMessage:true, fastforward:true })).total;
        jez.log("save", save);
        if (save >= SAVE_DC) {
            msg = `<b>${aToken.name}</b> resisted restraint of <b>${bonfireToken.name}</b>. Rolling a 
            <b>${save}</b> on the ${SAVE_DC} DC ${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} save 
            and may move freely.`
            jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                msg:msg, title: `Restraint failed`, token:aToken })
        } else {
            msg = `<b>${aToken.name}</b> succumbed to restraint of <b>${bonfireToken.name}</b>. Having 
            failed the ${SAVE_DC} DC ${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} save with a 
            <b>${save}</b>. ${aToken.name} may move no further than 5 feet from the bonfire.`
            jez.postMessage({ color:jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                msg: msg, title: `Restraint succeeded`, token: aToken })
        }

    }
}
/***************************************************************************************************
 * Post the results to chat card
 ***************************************************************************************************/
 function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, {color:jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Spawn the Bonfire into existance returning the UUID or null on failure
 ***************************************************************************************************/
async function spawnBonfire(center, newName) {
    //--------------------------------------------------------------------------------------
    // Verify the Actor named BONFIRE_ORIG_NAME exists in Anctor Directory
    //
    if (!game.actors.getName(BONFIRE_ORIG_NAME)) {   // If bonfire not found, that's all folks
        msg = `Could not find "<b>${BONFIRE_ORIG_NAME}</b>" in the <b>Actors Directory</b>. 
        <br><br>Can not complete the ${aItem.name} action.`;
        postResults(msg);
        return (null);
    }
    //--------------------------------------------------------------------------------------
    // Define warpgate updates, options and callbacks 
    //
    let updates = { token: { name: newName } }
    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
    const CALLBACKS = {
        pre: async (template) => {
            preEffects(template);
            await jez.wait(5000)
        },
        post: async (template) => {
            postEffects(template);
        }
    };
    //--------------------------------------------------------------------------------------
    // Fire off warpgate 
    //
    let bonfireId = await warpgate.spawnAt(center, BONFIRE_ORIG_NAME, updates, CALLBACKS, OPTIONS);
    jez.log("bonfireId", bonfireId)
    return(bonfireId)
}
/***************************************************************************************************
 * Pre-Spawn VFX
 ***************************************************************************************************/
async function preEffects(template) {
    jez.runRuneVFX(template, jez.getSpellSchool(aItem)) 
    return
}
/***************************************************************************************************
 * Post-Spawn VFX
 ***************************************************************************************************/
async function postEffects(template) { return }
/***************************************************************************************************
 * Line connecting token to bonfire VFX
 ***************************************************************************************************/
 async function chainEffect(token1, token2) {
    new Sequence()
        .effect()
        .file("jb2a.energy_beam.normal.blue.01")
        .atLocation(token1)
        .stretchTo(token2)
        .fadeIn(500)
        .fadeOut(500)
        .duration(2000)
        .scale(1.0)
        .opacity(1.0)
    .play()
}
/***************************************************************************************************
 * Modify existing concentration effect to call Remove_Effect_doOff on removal
 ***************************************************************************************************/
async function modConcentratingEffect(aToken, tToken) {
    // COOL-THING: Modify concentrating to remove an effect on target token
    //----------------------------------------------------------------------------------------------
    // Make sure the world macro that is used to remove effect exists
    //
    const REMOVE_MACRO = "Remove_Effect_doOff"
    const removeFunc = game.macros.getName(REMOVE_MACRO);
    if (!removeFunc) {
        ui.notifications.error(`Cannot locate ${RUNASGMMACRO} run as World Macro`);
        return;
    }
    //----------------------------------------------------------------------------------------------
    // Seach the token to find the just added effect
    //
    await jez.wait(100)
    let effect = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect. In this case, a world macro that will be
    // given arguments: tToken.id and  for all affected tokens
    //    
    effect.data.changes.push({key: `macro.execute`, mode: jez.CUSTOM, value:`${REMOVE_MACRO} ${tToken.id} '${EFFECT}'`, priority: 20})
    jez.log(`effect.data.changes`, effect.data.changes)
    //----------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result) jez.log(`Active Effect "Concentrating" updated!`, result);
}