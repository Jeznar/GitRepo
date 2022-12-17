const MACRONAME = "Binding_Curse.0.4.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Binding Curse.  Post a simple message to the chat card describing the effect
 * 
 * Description: You bind a creature to a point within 5 feet of it (1), causing a glowing 
 *   chains of light to connect it to that point.
 * 
 *   For the duration of the spell, if the creature attempts to move away from the anchor, 
 *   it must make a Wisdom saving throw, or be unable to move more than 5 feet away from 
 *   from the anchor until the start of their next turn.
 * 
 *   If a creature starts its turn more than 10 feet from the binding point, they must make 
 *   a Strength saving throw or are dragged 5 feet toward the binding point.
 * 
 * 01/11/22 0.1 Creation of Macro
 * 03/24/22 0.2 Update to include these features:
 *              1. Place Anchor Icon on scene, remove at spell completion
 *              2. Connect Anchor Icon to afflicted token at beginning of afflicted token's turns
 *              3. Auto-Perform Save if too far away
 *              4. Pull token back one square on failed STR save, if more than 10 feet 
 *                 from anchor.
 *              5. Auto-Perform save on afflicted token move
 * 07/20/22 0.3 Suppress token mold renaming and add convenientDescription
 * 12/16/22 0.4 Update style and add persistent connection to the anchor
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 5;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //-----------------------------------------------------------------------------------------------------------------------------------
 if (TL>0) jez.trace(`${TAG} === Starting ===`);
 if (TL>1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
 //-----------------------------------------------------------------------------------------------------------------------------------
 // Set standard variables
 //
 const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
 let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
 let aActor = aToken.actor; 
 let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
 const VERSION = Math.floor(game.VERSION);
 const GAME_RND = game.combat ? game.combat.round : 0;
 //-----------------------------------------------------------------------------------------------------------------------------------
 // Set Macro specific globals
 //
let SAVE_DC = aItem.data.save.dc;
const ANCHOR_ORIG_NAME = "%Anchor%"
const EFFECT = "Binding Curse"
const VFX_NAME = `${MACRO}-${aToken.id}`
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") doOnUse();          // Midi ItemMacro On Use
if (args[0] === "off") await doOff();             // DAE removal
if (args[0] === "each") doEach();			      // DAE removal
jez.log(`-------------------Finishing ${MACRONAME}----------------------------------`);
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
 async function preCheck() {
    if (args[0].targets.length !== 1)
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, 'w')
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    if (!await preCheck()) return(false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Spawn in the anchor, catch its token.id, exit on failureto spawn
    //
    const ANCHOR_ID = await spawnAnchor(tToken, `${tToken.name}'s Anchor`)
    if (!ANCHOR_ID) {
        msg = `Anchor could not be spawned.   ${ANCHOR_ORIG_NAME} must be available in <b>Actors 
        Directory</b>.<br><br>
        Can not complete the ${aItem.name} action.`;
        postResults(msg);
        return (false);
    }
    if (TL>1) jez.trace(`Anchor_ID`, ANCHOR_ID)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Create the Binding_Curse effect on the target Token.
    //
    const GAME_RND = game.combat ? game.combat.round : 0;
    const SPELL_DC = jez.getSpellDC(aToken)
    jez.log("SPELL_DC",SPELL_DC)
    let effectData = [{
        label: EFFECT,
        icon: aItem.img,
        origin: aToken.uuid,
        disabled: false,
        flags: { 
            dae: { itemData: aItem, macroRepeat: "startEveryTurn", token: tToken.uuid, stackable: false }, 
            convenientDescription: `Moving more than 5 feet from anchor requires DC${SPELL_DC} WIS Save.`
        },
        duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
        changes: [
            { key: `macro.itemMacro`, mode: jez.CUSTOM, 
              value: `${aToken.id} ${ANCHOR_ID} ${SPELL_DC} ${VFX_NAME}`, priority: 20 }
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: effectData });
    //-------------------------------------------------------------------------------------------------------------------------------
    // Modify the concentrating effect to remove the newly created effect on termination
    //
    modConcentratingEffect(aToken, tToken)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Launch the VFX chain effect connecting the anchor and the afflicted
    //
    runVFXChainEffect(ANCHOR_ID[0], tToken, VFX_NAME)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    msg = `${aToken.name} has created a magical anchor in an attempt to force ${tToken.name} to stay where it is.`
    postResults(msg);
    if (TL>0) jez.trace(`${TAG} --- Finished ---`);
    return (true);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 async function doOff(options={}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Parse the supplied inputs
    //
    let sceneId = game.scenes.viewed.id
    let casterId = args[1]
    let anchorId = args[2]
    const VFX_NAME = args[3]
    if (TL > 1) jez.trace(`${TAG} doOff Arguments`, 'sceneId', sceneId, 'casterId', casterId, 'VFX_NAME', VFX_NAME);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Terminate the chain VFX by name -- Not needed as removing the anchor will also terminate this
    //
    // if (TL > 1) jez.trace(`${TAG} end VFX_NAME`, VFX_NAME)
    // Sequencer.EffectManager.endEffects({ name: VFX_NAME });
    //-------------------------------------------------------------------------------------------------------------------------------
    // Delete the existing anchor
    //
    if (TL > 1) jez.trace(`${TAG} dismiss ${anchorId} from scene ${sceneId}`)
    warpgate.dismiss(anchorId, sceneId)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Thats all
    //
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked each round by DAE
 * 
 *   If a creature starts its turn more than 10 feet from the binding point, they must make 
 *   a Strength saving throw, on faiure dragged 5 feet toward the binding point.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 async function doEach(options={}) {
    const FUNCNAME = "doEach(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Need distance between current token and associated anchor token
    //
    const CASTER_ID = args[1]
    const ANCHOR_ID = args[2]
    const SAVE_DC = args[3]
    let anchorToken = canvas.tokens.placeables.find(ef => ef.id === ANCHOR_ID)
    if (!anchorToken) {
        msg = `Could not find anchor token with id "${ANCHOR_ID}"`
        ui.notifications.warn(msg);
        jez.log(msg)
        return (false)
    }
    let distance = jez.getDistance5e(aToken, anchorToken);
    jez.log(`Distance between ${aToken.name} and ${anchorToken.name} is ${distance} feet.`)
    if (distance > 10) {
        //---------------------------------------------------------------------------------------------------------------------------
        // Roll saving throw to see if aToken needs to be moved 5 feet toward anchor
        //
        const SAVE_TYPE = "str"
        const flavor = `${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} <b>DC${SAVE_DC}</b>
        to avoid <b>${aItem.name}</b> pull`;
        let save = (await aActor.rollAbilitySave(SAVE_TYPE.toLowerCase(),
            { flavor:flavor, chatMessage: true, fastforward: true })).total;
        jez.log("save", save);
        if (save >= SAVE_DC) {
            msg = `<b>${aToken.name}</b> resisted the pull of <b>${anchorToken.name}</b>. 
            Rolling a <b>${save}</b> on the ${SAVE_DC} DC 
            ${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} save.`
            jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                msg: msg, title: `Pull resisted`, token: aToken })
        } else {
            jez.moveToken(anchorToken, aToken, -1, 1500)
            msg = `<b>${aToken.name}</b> is pulled five feet toward <b>${anchorToken.name}</b>. 
            Having failed the ${SAVE_DC} DC ${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} 
            save with a <b>${save}</b> roll.`
            jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                msg: msg, title: `Pull succeeded`, token: aToken })
        }
    }
    // if (distance > 0) chainEffect(aToken, anchorToken)
    //------------------------------------------------------------------------------------------------------------------------------
    // Pop Dialog asking GM if the afflicted wants to attempt a save to move.
    //
    const SAVE_TYPE = "wis"
    let template = `<div><label></label>
     <div class="form-group" style="font-size: 14px; padding: 5px; 
     border: 2px solid silver; margin: 5px;"><b>${aToken.name}</b> must succeed on a ${SAVE_DC} DC 
     ${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} save to move more than 5 feet from
     <b>${anchorToken.name}</b>.  Does ${aToken.name} wish to attempt the save?</div>`
    let d = new Dialog({
        title: `Does ${aToken.name} want to move away from Anchor?`,
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
                    from <b>${anchorToken.name}</b> than five feet.`
                    jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                        msg: msg, title: `Declined Save Attempt`, token: aToken })
                    return (false)
                }
            }
        },
        default: "attempt"
    })
    d.render(true)
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return (true);
    //------------------------------------------------------------------------------------------------------------------------------
    // Dialog call back function to attempt saving throw
    //
    async function callBackFunc(html) {
        const SAVE_TYPE = "wis"
        const flavor = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to move away`;
        let save = (await aActor.rollAbilitySave(SAVE_TYPE,
            { flavor:flavor, chatMessage:true, fastforward:true })).total;
        jez.log("save", save);
        if (save >= SAVE_DC) {
            msg = `<b>${aToken.name}</b> resisted restraint of <b>${anchorToken.name}</b>. Rolling a 
            <b>${save}</b> on the ${SAVE_DC} DC ${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} save 
            and may move freely.`
            jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                msg:msg, title: `Restraint failed`, token:aToken })
        } else {
            msg = `<b>${aToken.name}</b> succumbed to restraint of <b>${anchorToken.name}</b>. Having 
            failed the ${SAVE_DC} DC ${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} save with a 
            <b>${save}</b>. ${aToken.name} may move no further than 5 feet from the anchor.`
            jez.postMessage({ color:jez.randomDarkColor(), fSize: 14, icon: aItem.img,
                msg: msg, title: `Restraint succeeded`, token: aToken })
        }

    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Spawn the Anchor into existance returning the UUID or null on failure
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
async function spawnAnchor(token, newName) {
    //------------------------------------------------------------------------------------------------------------------------------
    // Verify the Actor named ANCHOR_ORIG_NAME exists in Anctor Directory
    //
    if (!game.actors.getName(ANCHOR_ORIG_NAME)) {   // If anchor not found, that's all folks
        msg = `Could not find "<b>${ANCHOR_ORIG_NAME}</b>" in the <b>Actors Directory</b>. 
        <br><br>Can not complete the ${aItem.name} action.`;
        postResults(msg);
        return (null);
    }
    //------------------------------------------------------------------------------------------------------------------------------
    // Nab the X,Y coordinates from the passed token 
    //
    let center = token.center
    jez.log("center", center)
    //------------------------------------------------------------------------------------------------------------------------------
    // Define warpgate updates, options and callbacks 
    //
    jez.log("newName for Anchor", newName)

    let updates = { token: { name: newName } }
    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
    const CALLBACKS = {
        pre: async (template) => {
            preEffects(template);
            await jez.wait(1000)
        },
        post: async (template) => {
            postEffects(template);
        }
    };
    //------------------------------------------------------------------------------------------------------------------------------
    // Fire off warpgate 
    //
    jez.suppressTokenMoldRenaming(1500) 
    await jez.wait(50)
    let anchorId = await warpgate.spawnAt(center, ANCHOR_ORIG_NAME, updates, CALLBACKS, OPTIONS);
    jez.log("anchorId", anchorId)
    return(anchorId)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Pre-Spawn VFX
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
async function preEffects(template) {
    jez.runRuneVFX(template, jez.getSpellSchool(aItem)) 
    return
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post-Spawn VFX
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
async function postEffects(template) { return }
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Line connecting token to anchor VFX
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
//  async function chainEffect(token1, token2) {
//     new Sequence()
//         .effect()
//         .file("jb2a.energy_beam.normal.blue.01")
//         .atLocation(token1)
//         .stretchTo(token2)
//         .fadeIn(500)
//         .fadeOut(500)
//         .duration(2000)
//         .scale(1.0)
//         .opacity(1.0)
//     .play()
// }
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Modify existing concentration effect to call Remove_Effect_doOff on removal
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
async function modConcentratingEffect(aToken, tToken) {
    // COOL-THING: Modify concentrating to remove an effect on target token
    //------------------------------------------------------------------------------------------------------------------------------
    // Make sure the world macro that is used to remove effect exists
    //
    const REMOVE_MACRO = "Remove_Effect_doOff"
    const removeFunc = game.macros.getName(REMOVE_MACRO);
    if (!removeFunc) {
        ui.notifications.error(`Cannot locate ${RUNASGMMACRO} run as World Macro`);
        return;
    }
    //------------------------------------------------------------------------------------------------------------------------------
    // Seach the token to find the just added effect
    //
    await jez.wait(100)
    let effect = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
    //------------------------------------------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect. In this case, a world macro that will be
    // given arguments: tToken.id and  for all affected tokens
    //    
    effect.data.changes.push({key: `macro.execute`, mode: jez.CUSTOM, value:`${REMOVE_MACRO} ${tToken.id} '${EFFECT}'`, priority: 20})
    jez.log(`effect.data.changes`, effect.data.changes)
    //------------------------------------------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result) jez.log(`Active Effect "Concentrating" updated!`, result);
}
/***************************************************************************************************
 * Line connecting token to anchor VFX
 ***************************************************************************************************/
 async function runVFXChainEffect(token1, token2, VFX_NAME) {
    new Sequence()
        .effect()
        .file("modules/jb2a_patreon/Library/Generic/Energy/EnergyBeamReverse_01_Regular_Blue_30ft_1600x400.webm")
        .attachTo(token1)
        .stretchTo(token2, { attachTo: true })
        .fadeIn(500)
        .fadeOut(500)
        .persist()
        .scale(1.0)
        .opacity(1.0)
        .name(VFX_NAME) // Name the effect so it can be deleted by name later
    .play()
}