const MACRONAME = "Hex.js"
/*****************************************************************************************
 * My rewrite of Hex, borrowing heavily from Crymic's code
 * 
 * 0/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]   // Trim of the version number and extension
const FLAG = MACRO                      // Name of the DAE Flag       
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
    else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
    else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; 
    else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";

const ITEM_NAME = "Hex - Move"                          // Base name of the helper item
const SPEC_ITEM_NAME = `%%${ITEM_NAME}%%`               // Name as expected in Items Directory 
const NEW_ITEM_NAME = `${aToken.name}'s ${ITEM_NAME}`   // Name of item in actor's spell book
//------------------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
//if ((args[0]?.tag === "OnUse") && !preCheck()) return;
//------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
//if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
//if (args[0] === "each") doEach();					    // DAE removal
if (args[0]?.tag === "DamageBonus") return(doBonusDamage());    // DAE Damage Bonus
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
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let hexedId = await DAE.getFlag(aToken.actor, FLAG);
    jez.log("existingHexId",hexedId)
    let hexedToken = await canvas.tokens.placeables.find(ef => ef.id === hexedId)
    jez.log("Hexed Token:",hexedToken)
    let existingHex = await hexedToken.actor.effects.find(i => i.data.label === FLAG);
    jez.log("existingEffect",existingHex)
    await existingHex.delete()
    await DAE.unsetFlag(aToken.actor, FLAG)     // Clear the flag as a cleanup step

    jez.log("TODO: Remove the atWill spell from spell book")

    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
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
    //-----------------------------------------------------------------------------------------------
    // Set the DAE Flag to point at the targeted token id
    //
    await DAE.setFlag(aToken.actor, FLAG, tToken.id)
    //-----------------------------------------------------------------------------------------------
    // Define the variables that will be passed out of the curse dialog
    //
    const LEVEL = args[0].spellLevel;
    const UUID = args[0].uuid;
    const RNDS = LEVEL === 3 ? 480 : LEVEL === 4 ? 480 : LEVEL >= 5 ? 1440 : 60;
    const SECONDS = LEVEL === 3 ? 28800 : LEVEL === 4 ? 28800 : LEVEL >= 5 ? 86400 : 3600;
    const ABILITY_FNAME = Object.values(CONFIG.DND5E.abilities);
    const ABILITY_SNAME = Object.keys(CONFIG.DND5E.abilities);
    const GAME_RND = game.combat ? game.combat.round : 0;
    let ability_list = "";
    for (let i = 0; i < ABILITY_FNAME.length; i++) {
        let full_name = ABILITY_FNAME[i];
        let short_name = ABILITY_SNAME[i];
        ability_list += `<option value="${short_name}">${full_name}</option>`;
    }
    let the_content = `<form><div class="form-group"><label for="ability">Ability:</label>
            <select id="ability">${ability_list}</select></div></form>`;
    //-----------------------------------------------------------------------------------------------
    // Build and display the dialog to pick stat being hexed
    //
    new Dialog({
        title: aItem.name,
        content: the_content,
        buttons: {
            hex: {
                label: "Hex",
                callback: async (html) => {
                    let ability = html.find('#ability')[0].value;
                    bonusDamage(tToken, aItem, UUID, aToken, aActor, RNDS, SECONDS, GAME_RND);
                    await jez.wait(500);
                    applyDis(tToken, ability, aItem, UUID, LEVEL, aToken, RNDS, SECONDS, GAME_RND);
                }
            }
        },
        default: "Hex"
    }).render(true);
    //-----------------------------------------------------------------------------------------------
    // Modify the concentrating effect to make this macro an ItemMacro
    //
    modConcEffect(aToken)
    //-----------------------------------------------------------------------------------------------
    // Post completion message
    //
    msg = `Maybe say something useful...`
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
    //-----------------------------------------------------------------------------------------------
    // Define a function to use as a call back from the dialog.
    //
    async function bonusDamage(tToken, aItem, UUID, aToken, aActor, RNDS, SECONDS, GAME_RND) {
        jez.log(`bonusDamage(tToken, aItem, UUID, aToken, aActor, RNDS, SECONDS, GAME_RND)`, "tToken", tToken,
            "aItem", aItem, "UUID", UUID, "aToken", aToken, "aActor", aActor, "RNDS", RNDS, "SECONDS", SECONDS, "GAME_RND", GAME_RND)
        let effectData = {
            label: aItem.name,
            icon: "systems/dnd5e/icons/skills/violet_24.jpg",
            origin: UUID,
            disabled: false,
            duration: { rounds: RNDS, SECONDS: SECONDS, startRound: GAME_RND, startTime: game.time.worldTime },
            flags: { dae: { itemData: aItem } },
            changes: [
                { key: "flags.midi-qol.hexMark", mode: OVERRIDE, value: tToken.id, priority: 20 },
                { key: "flags.dnd5e.DamageBonusMacro", mode: CUSTOM, value: `ItemMacro.${aItem.name}`, priority: 20 },
                { key: "flags.midi-qol.concentration-data.targets", mode: ADD, value: { "actorId": aActor.id, "tokenId": aToken.id }, priority: 20 }
            ]
        };
        await aActor.createEmbeddedEntity("ActiveEffect", effectData);
        let getConc = aActor.effects.find(i => i.data.label === "Concentrating");
        await aActor.updateEmbeddedEntity("ActiveEffect", {
            "_id": getConc.id, origin: UUID,
            "duration": { rounds: RNDS, SECONDS: SECONDS, startRound: GAME_RND, startTime: game.time.worldTime }
        });
    }
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro BonusDamage
 ***************************************************************************************************/
async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const tToken = canvas.tokens.get(args[0].targets[0].id);
    //const aToken = canvas.tokens.get(args[0].tokenId);
    //const aItem = args[0].item;
    const DMG_TYPE = "necrotic";
    if (tToken.id !== getProperty(aToken.actor.data.flags, "midi-qol.hexMark")) return {};
    if (!["ak"].some(actionType => (aItem.data.actionType || "").includes(actionType))) return {};
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return {
        damageRoll: `1d6[${DMG_TYPE}]`, 
        flavor: `(Hex (${CONFIG.DND5E.damageTypes[DMG_TYPE]}))`,
        damageList: args[0].damageList, itemCardId: args[0].itemCardId};
}
/***************************************************************************************************
 * Apply the hex debuff to the target
 ***************************************************************************************************/
 async function applyDis(tToken, ability, aItem, UUID, LEVEL, aToken, RNDS, SECONDS, GAME_RND) {
    // Crymic's code looked for "hex" I changed it to look for the name of the item instead.
    const hexEffect = await aToken.actor.effects.find(i => i.data.label === aItem.name);
    const concEffect = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
    jez.log(`aToken.id ${aToken?.id}`, aToken)
    jez.log(`hexEffect.id ${hexEffect?.id}`, hexEffect)
    jez.log(`concEffect.id ${concEffect?.id}`, concEffect.id)
    let effectData = {
        label: aItem.name,
        icon: aItem.img,
        origin: UUID,
        disabled: false,
        duration: { rounds: RNDS, SECONDS: SECONDS, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: { dae: { itemData: aItem, spellLevel: LEVEL, tokenId: aToken.id, hexId: hexEffect.id, concId: concEffect.id } },
        changes: [{key: `flags.midi-qol.disadvantage.ability.check.${ability}`, mode: ADD, value: 1, priority: 20}]
    };
    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: tToken.actor.uuid, effects: [effectData]});    
    //------------------------------------------------------------------------------------------
    // Post completion message
    //
    msg = `An At-Will Spell "${NEW_ITEM_NAME}" has been added to ${aToken.name} for the duration of this spell`
    ui.notifications.info(msg);
    copyEditItem(aToken)
}
/***************************************************************************************************
 * Copy the temporary item to actor's spell book and edit it as appropriate
 ***************************************************************************************************/
 async function copyEditItem(token5e) {
    const FUNCNAME = "copyEditItem(token5e)";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    let oldActorItem = token5e.actor.data.items.getName(NEW_ITEM_NAME)
    if (oldActorItem) await deleteItem(token5e.actor, oldActorItem)
    //----------------------------------------------------------------------------------------------
    jez.log("Get the item from the Items directory and slap it onto the active actor")
    let itemObj = game.items.getName(SPEC_ITEM_NAME)
    if (!itemObj) {
        msg = `Failed to find ${SPEC_ITEM_NAME} in the Items Directory`
        ui.notifications.error(msg);
        postResults(msg)
        return (false)
    }
    console.log('Item5E fetched by Name', itemObj)
    await replaceItem(token5e.actor, itemObj)
    //----------------------------------------------------------------------------------------------
    jez.log("Edit the item on the actor")
    let aActorItem = token5e.actor.data.items.getName(SPEC_ITEM_NAME)
    jez.log("aActorItem", aActorItem)
    if (!aActorItem) {
        msg = `Failed to find ${SPEC_ITEM_NAME} on ${token5e.name}`
        ui.notifications.error(msg);
        postResults(msg)
        return (false)
    }
    //-----------------------------------------------------------------------------------------------
    jez.log(`Remove the don't change this message assumed to be embedded in the item description.  It 
             should be of the form: <p><strong>%%*%%</strong></p> followed by white space`)
    const searchString = `<p><strong>%%.*%%</strong></p>[\s\n\r]*`;
    const regExp = new RegExp(searchString, "g");
    const replaceString = ``;
    let content = await duplicate(aActorItem.data.data.description.value);
    content = await content.replace(regExp, replaceString);
    let itemUpdate = {
        'name': NEW_ITEM_NAME,
        'data.description.value': content,
    }
    await aActorItem.update(itemUpdate)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/*************************************************************************************
 * replaceItem
 * 
 * Replace or Add targetItem to inventory of actor5e passed as parms
 *************************************************************************************/
 async function replaceItem(actor5e, targetItem) {
    await deleteItem(actor5e, targetItem)
    return (actor5e.createEmbeddedDocuments("Item", [targetItem.data]))
}
/*************************************************************************************
 * deleteItem
 * 
 * Delete targetItem to inventory of actor5e passed as parms
 *************************************************************************************/
 async function deleteItem(actor5e, targetItem) {
    let itemFound = actor5e.items.find(item => item.data.name === targetItem.data.name && item.type === targetItem.type)
    if (itemFound) await itemFound.delete();
}
/***************************************************************************************************
 * Modify existing concentration effect to call a this macro as an ItemMacro that can use doOff
 * function can be used to clean accumulated effects.  
 ***************************************************************************************************/
async function modConcEffect(token5e) {
    const EFFECT = "Concentrating"
    await jez.wait(100)
    let effect = await token5e.actor.effects.find(i => i.data.label === EFFECT);
    effect.data.changes.push({key: `macro.itemMacro`, mode: CUSTOM, value:`arbitrary_arg`, priority: 20})
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result) jez.log(`Active Effect ${EFFECT} updated!`, result);
}