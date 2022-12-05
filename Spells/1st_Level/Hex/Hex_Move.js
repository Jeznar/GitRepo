const MACRONAME = "Hex-Move.0.5.js"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 * 07/10/22 0.2 Move the hex if the taregt is missing and confirmed in a dialog
 * 07/31/22 0.3 Add convenientDescription
 * 11/01/22 0.4 Dealing with player permission issue clering old hex from corpse
 * 12/04/22 0.5 Handling missing base hex effect
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set standard variables
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const MAC = MACRONAME.split("-")[0]                 // Extra short form of the MACRONAME
const FLAG = MAC                                    // Name of the DAE Flag    
// const NEW_ITEM_NAME = `${aToken.name} ${}` // Name of item in actor's spell book
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (!preCheck()) return;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          // Midi ItemMacro On Use
if (TL>1) jez.trace(`${TAG} === Finished ===`);
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
    return (true)
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-----------------------------------------------------------------------------------------------
    // set the target data object
    //
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //----------------------------------------------------------------------------------------------
    // Is Hex currenty active?  If not, delete this action and quit
    //
    const HEX_EFFECT = await aToken.actor.effects.find(i => i.data.label === "Hex");
    if (HEX_EFFECT) {
        if (TL > 1) jez.trace(`${TAG} ${aToken.name} has an active hex`)
    }
    else {
        if (TL > 1) jez.trace(`${TAG} ${aToken.name} does not have an active hex`)
        await jez.deleteItems(aItem.name, "spell", aActor);
        jez.badNews(`${aToken.name} has no active hex, deleting ${aItem.name}`, 'i')
        return
    }
    //----------------------------------------------------------------------------------------------
    // Obtain the existing hexMark
    //
    let oldHexMark = getProperty(aToken.actor.data.flags, "midi-qol.hexMark")
    if (TL>1) jez.trace(`${TAG} hexMark target:`, oldHexMark)
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
        if (TL>0) jez.trace(`${TAG} ***** targetDead`, targetDead)
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
        if (TL > 1) jez.trace(`${TAG} ${oToken.name} was the old hex target`, oToken)
        if (TL > 2) jez.trace(`${TAG} oToken.actor.data.data.attributes.hp.value`, oToken.actor.data.data.attributes.hp.value)
        if (oToken.actor.data.data.attributes.hp.value !== 0) {
            msg = `Perhaps sadly, ${oToken.name} is alive!  The hex may not be moved.`
            ui.notifications.warn(msg);
            postResults(msg);
            return (false);
        } else if (TL>1) jez.trace(`${TAG} Yea? ${oToken.name} is dead and can have hex moved`)
    }
    //----------------------------------------------------------------------------------------------
    // Stash the token ID of the new target into the DAE Flag
    //
    if (TL > 3) jez.trace(`${TAG} Flag setting data`,
        `aActor   `, aActor,
        `FLAG     `, FLAG,
        `tToken.id`, tToken?.id)
    await DAE.setFlag(aToken.actor, FLAG, tToken.id)
    if (TL > 1) jez.trace(`${TAG} Flag Value`,await DAE.getFlag(aToken.actor, FLAG))
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
    let rc = setProperty(aToken.actor.data.flags, "midi-qol.hexMark", newHexMark)
    if (TL > 1) jez.trace(`${TAG} setProperty returned`,rc)
    //----------------------------------------------------------------------------------------------
    // Get the data of the original hex on the target, then delete it.
    //
    let oldEffect = null
    if (oToken) {
        oldEffect = await oToken.actor.effects.find(i => i.data.label === FLAG);
        if (TL>1) jez.trace(`${TAG} **** ${FLAG} found?`, oldEffect)
        if (TL>1) jez.trace(`${TAG} **** Effect UUID`, oldEffect.uuid) // Scene.MzEyYTVkOTQ4NmZk.Token.KVTYA7FwushIK9h9.ActiveEffect.ztlq9s7jopvvevn9
        if (!oldEffect) {
            msg = `${FLAG} sadly not found on ${oToken.name}.`
            ui.notifications.error(msg);
            postResults(msg);
            return (false);
        }
    }
    //----------------------------------------------------------------------------------------------
    // Set a bunch of values
    //
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
    // const HEX_EFFECT = await aToken.actor.effects.find(i => i.data.label === "Hex");
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
                    hexId: HEX_EFFECT,
                    concId: concId
                },
                convenientDescription: C_DESC

            },
            changes: [{ key: `flags.midi-qol.disadvantage.ability.check.${ability}`, mode: jez.ADD, value: 1, priority: 20 }]
        };
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
        //----------------------------------------------------------------------------------------------
        // Post the results message
        //
        msg = `Hex removed from ${oToken?.name}'s corpse. <b>${tToken.name}</b>'s ${ability.toUpperCase()} is now hexed,
    and will make stat checks at disadvantage.`
        postResults(msg)
        if (TL>1) jez.trace(`${TAG} --- Finished ---`);
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
    if (TL>1) jez.trace(`${TAG} VFX_FILE`, VFX_FILE)
    new Sequence()
        .effect()
        .file(VFX_FILE)
        .atLocation(token)
        .center()
        // .scale(SCALE)
        .scaleToObject(SCALE)
        .repeats(8, 2000, 3000)
        .opacity(OPACITY)
        .play()
}