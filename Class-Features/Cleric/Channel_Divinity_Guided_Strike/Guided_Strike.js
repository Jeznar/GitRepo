const MACRONAME = "Channel_Divinity_Guided_Strike.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Imported from Crymic code, dated 11/1/22
 * 
 * 11/22/22 0.1 Creation of Macro from Crymic's Code
 * 11/23/22 0.2 Update to support NPCs who cann't have the resource
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]       // Trim off the VERSION number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL>1) jez.trace(`${TAG} === Starting ===`);
if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;         
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor; 
//
// Set the value for the Active Item (aItem)
let aItem;         
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
if (TL > 2) jez.trace(`${TAG} Active Item, ${aItem.name}`,aItem)
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const VERSION = Math.floor(game.VERSION);
const ACTOR_DATA = await aActor.getRollData();
const RESOURCE_NAME = "Channel Divinity";
const GUIDED = aActor.itemTypes.feat.find(item => ["guided strike"].some(x => 
    (item.name).toLowerCase().includes(x)));
const IS_NPC = (aToken.document._actor.data.type === "npc") ? true : false;
if (TL > 2) jez.trace(`${TAG} Macro Variables`,
    "VERSION       ", VERSION,
    "ACTOR_DATA    ", ACTOR_DATA,
    "RESOURCE_NAME ", RESOURCE_NAME,
    "GUIDED        ", GUIDED,
    "IS_NPC        ", IS_NPC)
let resourceSlot = null
//---------------------------------------------------------------------------------------------------
// Make sure we have guided strike
//
if (!GUIDED) return jez.badNews(`${TAG} Looking for an item named Guided Strike, cannot find it`,'e')
//---------------------------------------------------------------------------------------------------
// If triggered by something other than an attack (mwak, msak, rwak, rsak).  Does this ever happen?
//
if (!["ak"].some(i => (VERSION > 9 ?
    aItem.system.actionType :
    aItem.data.actionType).toLowerCase().includes(i))) {
    if (VERSION > 9) jez.trace(`${TAG} Triggered by an ${aItem.system.actionType} action.`, 'i')
    if (VERSION <= 9) jez.trace(`${TAG} Triggered by an ${aItem.data.actionType} action.`, 'i')
    return {};
}
//---------------------------------------------------------------------------------------------------
// Deal with casting resource -- this needs to consider NPC and PC data structures
//
let curtRes, curtMax
if (IS_NPC) {   // Process resources for an NPC
    const ITEM_USES = await jez.getItemUses(GUIDED, { traceLvl: 5 })
    if (TL > 2) jez.trace(`${TAG} Resource Values for NPC: ${aToken.name}`, "ITEM_USES", ITEM_USES)
    curtRes = ITEM_USES.value;
    curtMax = ITEM_USES.max;
}
else { 
    let resourceList = [{ name: "primary" }, { name: "secondary" }, { name: "tertiary" }];
    let resourceValues = Object.values(ACTOR_DATA.resources);
    let resourceTable = mergeObject(resourceList, resourceValues);
    let findResourceSlot = resourceTable.find(i => i.label.toLowerCase() === RESOURCE_NAME.toLowerCase());
    if (!findResourceSlot) return jez.badNews(`${TAG} ${RESOURCE_NAME} Resources is missing on 
        ${aToken.name}, Add it.`);
    resourceSlot = findResourceSlot.name;
    curtRes = ACTOR_DATA.resources[resourceSlot].value;
    curtMax = ACTOR_DATA.resources[resourceSlot].max;
    if (TL > 2) jez.trace(`${TAG} Resource Values for PC: ${aToken.name}`,
        "resourceList     ", resourceList,
        "resourceTable    ", resourceTable,
        "findResourceSlot ", findResourceSlot)
}
if (TL > 2) jez.trace(`${TAG} Resource Values`,
    "curtRes ", curtRes,
    "curtMax ", curtMax)
if (curtRes < 1) return console.warn(GUIDED.name, curtRes, `out of resources`);
//---------------------------------------------------------------------------------------------------
// If Executing as a preCheckHits do the following...
//
if (LAST_ARG.macroPass === "preCheckHits") {
    let workflow = await MidiQOL.Workflow.getWorkflow(LAST_ARG.uuid);
    //-----------------------------------------------------------------------------------------------
    // Set supplimentary message for the subsequent dialog
    //
    const XTRA_MSG = (IS_NPC) ? `<p>${aToken.name} is an NPC and can't check for ${RESOURCE_NAME}
    charges. Using Item uses (which must be defined to non-zero) as a substitute resource.</p>` :
    null;
    //-----------------------------------------------------------------------------------------------
    // Pop and wait for a dialog to determine if this ability should be used.
    //
    let guidingStrike = await new Promise((resolve) => {
        let the_content = `<p>Attack Roll Total: 
        <span style="font-weight:800;color: ${LAST_ARG.attackD20 === 1 ? "red" : 
            LAST_ARG.attackD20 === 20 ? "green" : "black"}">
        ${LAST_ARG.attackTotal}  </span> <small>[ ${LAST_ARG.attackRoll.result} ]</small></p>
        ${XTRA_MSG}<p>
        Do you wish to consume resource to guide your attack? [${curtRes}/${curtMax}]</p>`;
        new Dialog({
            title: GUIDED.name,
            content: the_content,
            buttons: {
                use: {
                    label: ` Use Resource`, icon: `<img src="${VERSION > 9 ? GUIDED.img : GUIDED.data.img}"
                    width="30px" height="30px">`, callback: async () => resolve(true)
                },
                skip: {
                    label: " Normal Attack", icon: `<img src="${aItem.img}"
                    width="30px" height="30px">`, callback: () => resolve(false)
                }
            },
            default: "Skip"
        }).render(true);
    });
    //-----------------------------------------------------------------------------------------------
    // If dialog returned false, that's all just return
    //
    if (!guidingStrike) return {};  
    //-----------------------------------------------------------------------------------------------
    // Add the bonus (10) to the attack roll 
    //
    // console.warn(GUIDED.name, `Original Attack Data =>`, `Attack Total:`, LAST_ARG.attackTotal);
    let newAttackRoll = await new Roll(`${LAST_ARG.attackRoll.result} + 10`).evaluate({ async: true });
    if (TL > 2) jez.trace(`${TAG} Attack Rolls, before and after`,
        `Before ==>`, LAST_ARG.attackTotal,
        `After ==>`, newAttackRoll._total)
    // console.warn(GUIDED.name, `Adjusted Attack Data =>`, `Attack Total:`, newAttackRoll.total);
    //-----------------------------------------------------------------------------------------------
    // Manipulate the Fumble and Critical results (reason?)
    //
    // if (TL > 2) jez.trace(`${TAG} original workflow info: isFumble ${workflow.isFumble} workflow.isCritical ${workflow.isCritical}`)
    // workflow.isFumble = false;
    // workflow.isCritical = false;
    // if (LAST_ARG.attackD20 === 1) {
    //     workflow.isFumble = true
    // } else if (LAST_ARG.attackD20 === 20) {
    //     workflow.isCritical = true;
    // } else {
    //     workflow.attackRoll = newAttackRoll;
    //     workflow.attackTotal = newAttackRoll.total;
    // }
    // if (TL > 2) jez.trace(`${TAG} final workflow info: isFumble ${workflow.isFumble} workflow.isCritical ${workflow.isCritical}`)
    //-----------------------------------------------------------------------------------------------
    // Adjust workflow attackroll html based on midi setting for rollAlternate
    //
    if (TL > 2) jez.trace(`${TAG} Perhaps adjust workflow.attackRollHTML based on 
        ${MidiQOL.configSettings().rollAlternate}`)
    switch (MidiQOL.configSettings().rollAlternate) {
        case "formula":
        case "formulaadv": workflow.attackRollHTML = await newAttackRoll.render(
            { template: "modules/midi-qol/templates/rollAlternate.html" }); break;
        case "adv":
        case "off":
        default: workflow.attackRollHTML = await newAttackRoll.render(); // "off"
    }
    //-----------------------------------------------------------------------------------------------
    // Decrement our resource -- this needs to consider NPC and PC data structures
    //
    if (IS_NPC) {   // Decrement resource for an NPC
        jez.setItemUses(GUIDED, curtRes - 1, { traceLvl: TL })
    }
    else {          // Decrement resource for a PC
        let updates = {};
        let resources = VERSION > 9 ? `system.resources.${resourceSlot}.value` :
            `data.resources.${resourceSlot}.value`;
        updates[resources] = curtRes - 1;
        await aActor.update(updates);
    }
    await jez.wait(300);
    //-----------------------------------------------------------------------------------------------
    // Update the item card
    //
    let the_message = `<em>${GUIDED.name}.<br>${aToken.name} strikes with supernatural accuracy!</em>`;
    let chatMessage = game.messages.get(LAST_ARG.itemCardId);
    let content = await duplicate(VERSION > 9 ? chatMessage.content : chatMessage.data.content);
    let searchString = /<div class="midi-qol-saves-display">[\s\S]*<div class="end-midi-qol-saves-display">/g;
    let replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display"><hr>${the_message}`;
    content = content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
}



    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Return the Item Use field from the passed item5e data object (yes, this is trivial)
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
     async function getItemUses(itemObj, options = {}) {
        const FUNCNAME = "jez.getItemUses(options={})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.lib ${FNAME} |`
        const TL = options.traceLvl ?? 0
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
            "itemObj ==>", itemObj, "options ==>", options);
        //-----------------------------------------------------------------------------------------------
        // Did we receive an item5e?  if it wasn't, maybe it is one of the funky item obj data blocks 
        // that we can convert to an item5e to update it.
        //
        let item5e = null
        if (typeof (itemObj) === "object") {                    // Hopefully we have an Item5e
            if (itemObj.constructor.name === "Item5e") item5e = itemObj
            else {
                item5e = await fromUuid(itemObj.uuid)
                if (item5e.constructor.name !== "Item5e") return jez.badNews(`Item ${item5e?.name} is 
                not an Item5e`, 'e')
            }
        }
        //-----------------------------------------------------------------------------------------------
        // Nab the data field and return it
        //
        if (TL > 2) jez.trace(`${TAG} item5e`, item5e)
        const ITEM_USES = (item5e.data?.data?.uses) ? item5e.data.data.uses : false
        if (TL > 1) jez.trace(`${TAG} Item_Uses`, ITEM_USES)
        return ITEM_USES;
    }