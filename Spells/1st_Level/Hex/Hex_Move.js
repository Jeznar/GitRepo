const MACRONAME = "Hex-Move.0.4.js"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 * 07/10/22 0.2 Move the hex if the taregt is missing and confirmed in a dialog
 * 07/31/22 0.3 Add convenientDescription
 * 11/01/22 0.4 Dealing with player permission issue clering old hex from corpse
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]   // Trim of the version number and extension
const MAC = MACRONAME.split("-")[0]     // Extra short form of the MACRONAME
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
const FLAG = MAC    // Name of the DAE Flag    
const TL = 0;   
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (!preCheck()) return;
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
        postResults();
        return (false);
    }
    return (true)
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
function postResults() {
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
    // Obtain the existing hexMark
    //
    let oldHexMark = getProperty(aToken.actor.data.flags, "midi-qol.hexMark")
    jez.log("hexMark target:", oldHexMark)
    //----------------------------------------------------------------------------------------------
    // Get the token for the old hex target
    //
    let oToken = canvas.tokens.placeables.find(ef => ef.id === oldHexMark)
    if (!oToken) {
        let content = `<p style="color:DarkRed;">Your previously hex'ed target appears to be missing 
                       from the current scene. Your hex can be moved only if that creature is now 
                       dead.</p>
                       <p style="color:DarkSlateBlue;">Is that target actually dead?</p>`
        let targetDead = await Dialog.confirm({
            title: 'Previous Hex Target is Missing!',
            content: content,
        });
        console.log("***** targetDead", targetDead)
        if (!targetDead) {
            msg = `The token that had the old hex is still alive.  Sorry, can not move hex.`
            ui.notifications.warn(msg);
            postResults(msg);
            return (false);
        }
    }
    //----------------------------------------------------------------------------------------------
    // Verify the old hex mark is actually, you know, dead
    //
    if (oToken) {
        jez.log(`${oToken.name} was the old hex target`, oToken)
        jez.log("oToken.actor.data.data.attributes.hp.value", oToken.actor.data.data.attributes.hp.value)
        if (oToken.actor.data.data.attributes.hp.value !== 0) {
            msg = `Perhaps sadly, ${oToken.name} is alive!  The hex may not be moved.`
            ui.notifications.warn(msg);
            postResults(msg);
            return (false);
        } else jez.log(`Yea? ${oToken.name} is dead and can have hex moved`)
    }
    //----------------------------------------------------------------------------------------------
    // Stash the token ID of the new target into the DAE Flag
    //
    await DAE.setFlag(aToken.actor, FLAG, tToken.id)
    //----------------------------------------------------------------------------------------------
    // Update the hexMark to the token ID in the effect data
    //
    let newHexMark = tToken.id
    /** setProperty(object, key, value)
     * A helper function which searches through an object to assign a value using a string key
     * This string key supports the notation a.b.c which would target object[a][b][c]
     * @param {object} object   The object to update
     * @param {string} key      The string key
     * @param {*} value         The value to be assigned
     * @return {boolean}        Whether the value was changed from its previous value
     */
    setProperty(aToken.actor.data.flags, "midi-qol.hexMark", newHexMark)

    //----------------------------------------------------------------------------------------------
    // Get the data of the original hex on the target, then delete it.
    //
    let oldEffect = null
    if (oToken) {
        oldEffect = await oToken.actor.effects.find(i => i.data.label === FLAG);
        jez.log(`**** ${FLAG} found?`, oldEffect)
        jez.log(`**** Effect UUID`, oldEffect.uuid) // Scene.MzEyYTVkOTQ4NmZk.Token.KVTYA7FwushIK9h9.ActiveEffect.ztlq9s7jopvvevn9
        if (!oldEffect) {
            msg = `${FLAG} sadly not found on ${oToken.name}.`
            ui.notifications.error(msg);
            postResults(msg);
            return (false);
        }
    }
    //let icon = aItem.img
    let origin = oldEffect?.data?.origin ? oldEffect?.data?.origin : args[0].uuid;
    const LEVEL = args[0].spellLevel;
    const RNDS = LEVEL === 3 ? 480 : LEVEL === 4 ? 480 : LEVEL >= 5 ? 1440 : 60;
    let rounds = oldEffect?.data?.duration?.rounds ? oldEffect?.data?.duration?.rounds : RNDS
    let seconds = 6 * rounds
    const GAME_RND = game.combat ? game.combat.round : 0;
    let startRound = oldEffect?.data?.duration?.startRound ? oldEffect?.data?.duration?.startRound : GAME_RND
    let startTime = oldEffect?.data?.duration?.startTime ? oldEffect?.data?.duration?.startTime : game.time.worldTime
    let itemData = oldEffect?.data?.flags?.dae?.itemData ? oldEffect?.data?.flags?.dae?.itemData : aItem
    let spellLevel = oldEffect?.data?.flags?.dae?.spellLevel ? oldEffect?.data?.flags?.dae?.spellLevel : args[0].spellLevel
    const hexEffect = await aToken.actor.effects.find(i => i.data.label === "Hex");
    const concEffect = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
    let concId = oldEffect?.data?.flags?.dae?.concId ? oldEffect?.data?.flags?.dae?.concId : concEffect.id
    const OLD_UUID = oldEffect?.uuid
    let ability = ""
    //-----------------------------------------------------------------------------------------------
    // Build up ability list for following dialog
    //
    let ability_list = "";
    const ABILITY_FNAME = Object.values(CONFIG.DND5E.abilities);
    const ABILITY_SNAME = Object.keys(CONFIG.DND5E.abilities);
    for (let i = 0; i < ABILITY_FNAME.length; i++) {
        let full_name = ABILITY_FNAME[i];
        let short_name = ABILITY_SNAME[i];
        ability_list += `<option value="${short_name}">${full_name}</option>`;
    }
    //-----------------------------------------------------------------------------------------------
    // My new dialog code
    //
    let template = `
<div>
<label>Pick stat to be hexed (disadvantage on ability checks)</label>
<div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">
`   // Back tick on its on line to make the console output better formatted
    for (let i = 0; i < ABILITY_FNAME.length; i++) {
        let fName = ABILITY_FNAME[i];
        let sName = ABILITY_SNAME[i];
        if (i === 0) template += `<input type="radio" id="${sName}" name="selectedLine" value="${sName}" checked="checked"> <label for="${sName}">${fName}</label><br>
`
        else template += `<input type="radio" id="${sName}" name="selectedLine" value="${sName}"> <label for="${sName}">${fName}</label><br>
`
    }
    //-----------------------------------------------------------------------------------------------
    // Build and display the dialog to pick stat being hexed
    //
    new Dialog({
        title: aItem.name,
        content: template,
        buttons: {
            hex: {
                label: "Hex",
                callback: async (html) => {
                    ability = html.find("[name=selectedLine]:checked").val();
                    //bonusDamage(tToken, aItem, UUID, aToken, aActor, RNDS, SECONDS, GAME_RND);
                    await jez.wait(500);
                    applyDis(tToken, ability, itemData, origin, spellLevel, aToken, rounds, seconds, GAME_RND);
                }
            }
        },
        default: "hex"
    }).render(true);
    //----------------------------------------------------------------------------------------------
    // Delete the old effect
    //
    if (oldEffect) jez.deleteEffectAsGM(OLD_UUID, { traceLvl: TL })
    vfxPlayHex(tToken, { color: "*" })
    /***************************************************************************************************
     * Apply the hex debuff to the target
    ***************************************************************************************************/
    async function applyDis(tToken, ability, aItem, UUID, LEVEL, aToken, RNDS, SECONDS, GAME_RND) {
        const C_DESC = `Takes extra damage from ${aToken.name}'s attacks`
        let effectData = {
            label: aItem.name,
            icon: aItem.img,
            origin: UUID,
            disabled: false,
            duration: { rounds: RNDS, SECONDS: SECONDS, startRound: startRound, startTime: startTime },
            flags: {
                dae: {
                    itemData: aItem,
                    spellLevel: LEVEL,
                    tokenId: aToken.id,
                    hexId: hexEffect,
                    concId: concId
                },
                convenientDescription: C_DESC

            },
            changes: [{ key: `flags.midi-qol.disadvantage.ability.check.${ability}`, mode: ADD, value: 1, priority: 20 }]
        };
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
        //----------------------------------------------------------------------------------------------
        // Post the results message
        //
        msg = `Hex removed from ${oToken?.name}'s corpse. <b>${tToken.name}</b>'s ${ability.toUpperCase()} is now hexed,
    and will make stat checks at disadvantage.`
        postResults(msg)
        jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
        return (true);
    }
}
/***************************************************************************************************
 * Function to play a VFX hex on a specified target.  
 * 
 * Supported colors: "Blue", "Green", "Red", "*"
 * 
 * @typedef  {Object} optionObj
 * @property {string} color - one of the supported colors
 * @property {number} opactity - real number defining opacity, defaults to 1.0
 * @property {number} scale - real number defining scale, defaults to 1.0
***************************************************************************************************/
async function vfxPlayHex(token, optionObj) {
    //-------------------------------------------------------------------------------------------------
    // Anticipated VFX files include
    // modules/jb2a_patreon/Library/Generic/Token_Stage/TokenStageHex01_04_Regular_Green_400x400.webm
    // modules/jb2a_patreon/Library/Generic/Token_Stage/TokenStageHex01_04_Regular_Blue_400x400.webm
    // modules/jb2a_patreon/Library/Generic/Token_Stage/TokenStageHex01_04_Regular_Red_400x400.webm
    //
    // Sequencer Docs: https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Effects
    //
    const colors = ["Blue", "Green", "Red", "*"]
    let color // = optionObj.color ?? "Green"
    if (colors.includes(optionObj?.color)) color = optionObj?.color
    else color = "*"
    const SCALE = optionObj?.scale ?? 1.4
    const OPACITY = optionObj?.opacity ?? 1.0
    //const VFX_FILE = `modules/jb2a_patreon/Library/Generic/Explosion/Explosion_*_${color}_400x400.webm`
    const VFX_FILE = `modules/jb2a_patreon/Library/Generic/Token_Stage/TokenStageHex01_04_Regular_${color}_400x400.webm`
    jez.log("VFX_FILE", VFX_FILE)
    new Sequence()
        .effect()
        .file(VFX_FILE)
        .atLocation(token)
        .center()
        // .scale(SCALE)
        .scaleToObject(SCALE)
        .repeats(8,2000,3000)
        .opacity(OPACITY)
        .play()
}