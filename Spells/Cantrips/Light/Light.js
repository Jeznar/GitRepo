const MACRONAME = "Light.0.3.js"
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
 * 01/06/22 0.1 Creation of Macro
 * 05/05/22 0.3 Migration to FoundryVTT 9.x
 * 05/05/22 0.3 Change createEmbeddedEntity to createEmbeddedDocuments for 9.x
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
const SAVE_DC = aActor.data.data.attributes.spelldc;
const SAVE_TYPE = "DEX"
const GAME_RND = game.combat ? game.combat.round : 0;
jez.log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";
let colorArray = ["white", "cyan", "blue", "green", "magenta", "red", "yellow" ]
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
if (!preCheck()) {
    jez.log(errorMsg)
    ui.notifications.error(errorMsg)
    postResults(`<b>Spell Failed</b>: ${errorMsg}`)
    return;
}
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (!oneTarget()) return(false)
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
        const QUERY_TITLE = "Select Color for the Light Effect"
        const QUERY_TEXT = "Pick one color from the drop down list"

        if (mode === "Save") {
            if (await attemptSave()) {  // Save was made
                result = "Saved"
            } else {                    // Save failed
                pickFromListArray(QUERY_TITLE, QUERY_TEXT, pickColorCallBack, colorArray);
                result = "Failed"
            }
        } else if (mode === "Accept") {
            pickFromListArray(QUERY_TITLE, QUERY_TEXT, pickColorCallBack, colorArray);
            result = "Accepted"
        } else {
            postNewChatMessage(`Oh fudge, how did this happen? ${mode}`);
            result = "Fudged"
        }
        await postSpellResult(result)
    }
    //----------------------------------------------------------------------------------
    // 
    async function pickColorCallBack(selection) {
        colorCode = selection;
        jez.log(`The entity named <b>"${colorCode}"</b> was selected in the dialog`)
        addLightEffect(args[0].uuid, tActor, 60, colorCodes[colorCode])
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
        jez.log("---- Save Information ---","SAVE_TYPE",SAVE_TYPE,"SAVE_DC",SAVE_DC,"flavor",flavor);
    
        let save = (await tActor.rollAbilitySave(SAVE_TYPE.toLowerCase(), { flavor, chatMessage: true, fastforward: true })).total;
        jez.log("save",save);
        if (save > SAVE_DC) {
            jez.log(`save was made with a ${save}`);
            saved = true;
        } else jez.log(`save failed with a ${save}`);

        // addLightEffect(args[0].uuid, tActor, 60, colorCodes[selection])
        jez.log("--------------${FUNCNAME}-----------", "Finished", `${MACRONAME} ${FUNCNAME}`);
        return(saved);
    }
    //----------------------------------------------------------------------------------
    // 
    async function postSpellResult(mode) {
        jez.log("")
        jez.log("postSpellResult(mode)", mode)
        jez.log("")
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
        jez.log(msg);
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
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function addLightEffect(uuid, actorD, rounds, color) {
    const FUNCNAME = "addLightEffect(uuid, actorD, rounds)";
    jez.log("--------------${FUNCNAME}-----------", "Starting", `${MACRONAME} ${FUNCNAME}`,
        "uuid", uuid,
        "actorD", actorD,
        "rounds", rounds,
        "color", color);
    let seconds = rounds * 6;
    let effectData = {
        label: aItem.name,
        icon: aItem.img,
        origin: uuid,
        disabled: false,
        duration: { rounds: rounds, seconds: seconds, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: { dae: { itemData: aItem } },
        changes: [
            { key: "ATL.light.dim", mode: UPGRADE, value: 40, priority: 20 },
            { key: "ATL.light.bright", mode: UPGRADE, value: 20, priority: 20 },
            { key: "ATL.light.color", mode: OVERRIDE, value: color, priority: 30 },
            { key: "ATL.light.alpha", mode: OVERRIDE, value: 0.07, priority: 20 },
        ]
    };
    // await actorD.createEmbeddedEntity("ActiveEffect", effectData); // Depricated 
    await actorD.createEmbeddedDocuments("ActiveEffect", [effectData]);
    jez.log("--------------${FUNCNAME}-----------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);
}
/****************************************************************************************
 * Create and process selection dialog, passing it onto specified callback function
 ***************************************************************************************/
 function pickFromListArray(queryTitle, queryText, pickCallBack, queryOptions) {
    const FUNCNAME = "pickFromList(queryTitle, queryText, ...queryOptions)";
    jez.log("---------------------------------------------------------------------------",
        `Starting`, `${MACRONAME} ${FUNCNAME}`,
        `queryTitle`, queryTitle,
        `queryText`, queryText,
        `pickCallBack`, pickCallBack,
        `queryOptions`, queryOptions);

    if (typeof(pickCallBack)!="function" ) {
        let msg = `pickFromList given invalid pickCallBack, it is a ${typeof(pickCallBack)}`
        ui.notifications.error(msg);
        jez.log(msg);
        return
    }   

    if (!queryTitle || !queryText || !queryOptions) {
        let msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, [queryOptions]),
                   but yours are: ${queryTitle}, ${queryText}, ${pickCallBack}, ${queryOptions}`;
        ui.notifications.error(msg);
        jez.log(msg);
        return
    }

    let template = `
    <div>
    <div class="form-group">
        <label>${queryText}</label>
        <select id="selectedOption">`
    for (let option of queryOptions) {
        template += `<option value="${option}">${option}</option>`
    }
    template += `</select>
    </div></div>`

    new Dialog({
        title: queryTitle,
        content: template,
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: 'OK',
                callback: async (html) => {
                    const selectedOption = html.find('#selectedOption')[0].value
                    jez.log('selected option', selectedOption)
                    await pickCallBack(selectedOption)
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Cancel',
                callback: async (html) => {
                    jez.log('canceled')
                    await pickCallBack(null)
                },
            },
        },
        default: 'cancel',
    }).render(true)

    jez.log("---------------------------------------------------------------------------",
        `Finished`, `${MACRONAME} ${FUNCNAME}`);
        return;
}
/***************************************************************************************************
 * Post a new chat message
 ***************************************************************************************************/
 async function postNewChatMessage(msgString) {
    const FUNCNAME = "postChatMessage(msgString)";
    jez.log(`--------------${FUNCNAME}-----------`, "Starting", `${MACRONAME} ${FUNCNAME}`,
        "msgString",msgString);
    await ChatMessage.create({ content: msgString });
    jez.log(`--------------${FUNCNAME}-----------`, "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}