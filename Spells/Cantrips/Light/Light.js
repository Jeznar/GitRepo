const MACRONAME = "Light.0.5.js"
/*****************************************************************************************
 * Implment the Light Cantrip on Friendly and Unfriendly targets.
 * 
 * RAW: You touch one object that is no larger than 10 feet in any dimension. Until the 
 *   spell ends, the object sheds bright light in a 20-foot radius and dim light for an 
 *   additional 20 feet. The light can be colored as you like. Completely covering the 
 *   object with something opaque blocks the light. The spell ends if you cast it again 
 *   or dismiss it as an action.
 * 
 *   If you target an object held or worn by a hostile creature, that creature must succeed
 *   on a Dexterity saving throw to avoid the spell.
 * 
 * This macro assumes the effect is being cast on a token.  A choice to accept the effect 
 * or attempt a save is presented, save resolved (if requested) and efect added to token.
 * 
 * 0.4 Store the token id of target as a DAE Flag.  Delete the effect from that token 
 *     before adding the new effect.
 * 
 * 01/06/22 0.1 Creation of Macro
 * 05/05/22 0.3 Migration to FoundryVTT 9.x
 * 05/05/22 0.3 Change createEmbeddedEntity to createEmbeddedDocuments for 9.x
 * 05/13/22 0.4 Change to manage existing effect
 * 12/06/22 0.5 Update log and chase player permission issue deleting/adding effect
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
const SAVE_DC = aActor.data.data.attributes.spelldc;
const SAVE_TYPE = "DEX"
const EFFECT = `${aItem.name}-${aActor.id}`
let errorMsg = "";
let colorArray = ["white", "cyan", "blue", "green", "magenta", "red", "yellow"]
let colorCodes = {
    white: "#ffffff",
    cyan: "#00ffff",
    blue: "#0000ff",
    green: "#00ff00",
    magenta: "#ff00ff",
    red: "#ff0000",
    yellow: "#ffff00"
}
let colorCode = "";
let result = "";
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if (!await preCheck()) return
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });
if (TL > 1) jez.trace(`${TAG} === Finished ===`);

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
    if (args[0].targets.length !== 1) {
        msg = `Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`
        postResults(msg)
        return jez.badNews(msg, "w");
    }
    return true
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-----------------------------------------------------------------------------------------------
    // Fetch the Flag value and delete existing effect if any
    //
    let pTokenId = await DAE.getFlag(aToken.actor, MACRO);
    if (TL>1) jez.trace(`${TAG} pTokenId from Flag`, pTokenId)
    if (pTokenId) {          // Found token ID of previous target
        let pToken = canvas.tokens.placeables.find(ef => ef.id === pTokenId)
        if (TL>1) jez.trace(`${TAG} pToken from Scene`, pToken)
        if (pToken) {        // Found previous Token
            let previousEffect = await pToken.actor.effects.find(ef => ef.data.label === EFFECT)
            if (TL>1) jez.trace(`${TAG} previousEffect from Token`, previousEffect)
            if (previousEffect) {   // Found previous Effect
                // await previousEffect.delete(); --> Player permission error 
                if (TL > 1) jez.trace(`${TAG} Effect to be removed`,
                    'pToken', pToken,
                    'pToken.actor.uuid', pToken.actor.uuid,
                    'previousEffect', previousEffect,
                    'previousEffect.id', previousEffect.id)
                await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: pToken.actor.uuid, effects: [previousEffect.id] });
                // await actorD.createEmbeddedDocuments("ActiveEffect", [effectData]); --> Player permission error 
            }
        }
    }
    await DAE.unsetFlag(aToken.actor, MACRO);   // Clear the Flag
    //-----------------------------------------------------------------------------------------------
    // Now for the main event
    //
    DialogSaveOrAccept();
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return (true);
    //----------------------------------------------------------------------------------
    // 
    async function DialogSaveOrAccept() {
        const FUNCNAME = "DialogSaveOrAccept()";
        const FNAME = FUNCNAME.split("(")[0] 
        const TAG = `${MACRO} ${FNAME} |`
        if (TL===1) jez.trace(`${TAG} --- Starting ---`);
        if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`);
        //-------------------------------------------------------------------------------------------
        if (TL>1) jez.trace(`${TAG} save type ${SAVE_TYPE.toLowerCase()}`)
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
    //-----------------------------------------------------------------------------------------------
    // 
    async function PerformCallback(html, mode) {
        const FUNCNAME = "PerformCallback(html, mode)";
        const FNAME = FUNCNAME.split("(")[0] 
        const TAG = `${MACRO} ${FNAME} |`
        if (TL===1) jez.trace(`${TAG} --- Starting ---`);
        if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"html", html, "mode", mode);
        //-------------------------------------------------------------------------------------------
        const QUERY_TITLE = "Select Color for the Light Effect"
        const QUERY_TEXT = "Pick one color from the drop down list"
        //-------------------------------------------------------------------------------------------
        if (mode === "Save") {
            if (await attemptSave()) {  // Save was made
                result = "Saved"
            } else {                    // Save failed
                jez.pickFromListArray(QUERY_TITLE, QUERY_TEXT, pickColorCallBack, colorArray);
                result = "Failed"
            }
        } else if (mode === "Accept") {
            jez.pickFromListArray(QUERY_TITLE, QUERY_TEXT, pickColorCallBack, colorArray);
            result = "Accepted"
        } else {
            jez.postMessage(`Oh fudge, how did this happen? ${mode}`)
            result = "Fudged"
        }
        await postSpellResult(result)
        //-----------------------------------------------------------------------------------------------
        // 
        async function pickColorCallBack(selection) {
            const FUNCNAME = "pickColorCallBack(selection)";
            const FNAME = FUNCNAME.split("(")[0] 
            const TAG = `${MACRO} ${FNAME} |`
            if (TL===1) jez.trace(`${TAG} --- Starting ---`);
            if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"selection", selection);
            //-------------------------------------------------------------------------------------------
            colorCode = selection;
            if (TL>1) jez.trace(`${TAG} <b>"${colorCode}"</b> was selected in the dialog`)
            addLightEffect(args[0].uuid, tActor, 60, colorCodes[colorCode],{traceLvl:TL})
            //-------------------------------------------------------------------------------------------
            // Set the DAE Flag so the effect can be deleted the next time this is cast
            //
            await DAE.setFlag(aToken.actor, MACRO, tToken.id);
        }
        //-----------------------------------------------------------------------------------------------
        // Return true on success, false on failure
        //
        async function attemptSave() {
            const FUNCNAME = "attemptSave()";
            const FNAME = FUNCNAME.split("(")[0] 
            const TAG = `${MACRO} ${FNAME} |`
            if (TL===1) jez.trace(`${TAG} --- Starting ---`);
            if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`);
            //-------------------------------------------------------------------------------------------
            let saved = false;

            const flavor = `${CONFIG.DND5E.abilities[SAVE_TYPE.toLowerCase()]} <b>DC${SAVE_DC}</b>
             to avoid <b>${aItem.name}</b> effect`;
             if (TL>1) jez.trace(`${TAG} ---- Save Information ---`, 
                "SAVE_TYPE", SAVE_TYPE, "SAVE_DC  ", SAVE_DC, "flavor   ", flavor);
            let save = (await tActor.rollAbilitySave(SAVE_TYPE.toLowerCase(), { flavor, chatMessage: true, fastforward: true })).total;
            if (TL>1) jez.trace(`${TAG} save`, save);
            if (save > SAVE_DC) {
                if (TL>1) jez.trace(`${TAG} save was made with a ${save}`);
                saved = true;
            } else if (TL>1) jez.trace(`${TAG} save failed with a ${save}`);
            // addLightEffect(args[0].uuid, tActor, 60, colorCodes[selection])
            if (TL>1) jez.trace(`${TAG} --- Finished ---`);
            return (saved);
        }
        //-----------------------------------------------------------------------------------------------
        // 
        async function postSpellResult(mode) {
            const FUNCNAME = "attemptSave()";
            const FNAME = FUNCNAME.split("(")[0] 
            const TAG = `${MACRO} ${FNAME} |`
            if (TL===1) jez.trace(`${TAG} --- Starting ---`);
            if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"mode", mode);
            //-------------------------------------------------------------------------------------------
            switch (mode) {
                case "Saved":
                    msg = `${tToken.name} <b>made</b> its save and avoided the ${aItem.name} effect.`
                    break;
                case "Failed":
                    msg = `${tToken.name} <b>failed</b> its save and is now emitting 
                    light from the ${aItem.name} effect.`
                    break;
                case "Accepted":
                    msg = `${tToken.name} <b>accepted</b> the ${aItem.name} effect. It is now emitting light.`
                    break;
                case "Fudged":
                    msg = `Something went sideways.  Please ask Joe nicely, to see about fixing this.`
                    break;
                default:
                    msg = `Something went wack-a-doodle.  Please ask Joe nicely, to see about fixing this.`
            }
            postResults(msg);
            if (TL>1) jez.trace(`${TAG} msg`,msg);
        }
    }
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function addLightEffect(uuid, actorD, rounds, color, options={}) {
    const FUNCNAME = "addLightEffect(uuid, actorD, rounds, color, options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
        'uuid   ', uuid, 'actorD ', actorD, 'rounds ', rounds, 'color  ', color, "options", options);
    //-----------------------------------------------------------------------------------------------
    // 
    //
    let seconds = rounds * 6;
    let effectData = {
        label: EFFECT,
        icon: aItem.img,
        origin: uuid,
        disabled: false,
        duration: { rounds: rounds, seconds: seconds, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: { dae: { itemData: aItem } },
        changes: [
            { key: "ATL.light.dim", mode: jez.UPGRADE, value: 40, priority: 20 },
            { key: "ATL.light.bright", mode: jez.UPGRADE, value: 20, priority: 20 },
            { key: "ATL.light.color", mode: jez.OVERRIDE, value: color, priority: 30 },
            { key: "ATL.light.alpha", mode: jez.OVERRIDE, value: 0.07, priority: 20 },
            // As of 5.13.22 the following line has no effect, though it would be cool if it did.
            { key: "ATL.light.animation", mode: jez.OVERIDE, value: "Energy Field", priority: 20 },
        ]
    };
    // await actorD.createEmbeddedEntity("ActiveEffect", effectData); // Depricated 
    if (TL>1) jez.trace(`${TAG} Creating active effect ${effectData.label}`,effectData)
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actorD.uuid, effects: [effectData] });
    // await actorD.createEmbeddedDocuments("ActiveEffect", [effectData]); --> Player permission error 
    if (TL>1) jez.trace(`${TAG}--- Finished ---`);
    return (true);
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}