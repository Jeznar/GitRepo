const MACRONAME = "test_resource.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Evelop an test the library functions: resourceSpend, resourceRefund.
 * 
 * Functions Include
 * 
 * isNPC(actorUuid) - Returns true if the named actor is a NPC, false otherwise
 * isPC(actorUuid) - Returns true if the named actor is a PC, false otherwise
 * 
 * resourceAvail(actorUuid, resourceName) - Checks the availaibility of named resource on passed actor.
 * Return values:
 *  - Positive integer: 1 or more charges is available on a PC/NPC
 *  - Zero: 0 charges are available on a PC/NPC
 *  - False: named resource does not exist on a PC/NPC
 *  - Null: The actor is a NPC and none of the above passed tests
 * 
 * resourceSpend((actorUuid, resourceName, aItemUuid) - For PCs, decrement resource, verifying it exists and has at least value of 1.
 *  Return values:
 *  - Null: actor is a NPC making this irrelevant
 *  - True: PC actor's resource successfully decrimented
 *  - False: PC actor's resource was not found (not set on actor)
 *  - Zero: PC actor's resource was already zero (or below), and could not be decrimented
 * 
 * resourceRefund (actorUuid, resourceName, aItemUuid) - For PCs, increment the verified resource but not past max.
 *  Return values:
 *  - Null: actor is a NPC making this irrelevant
 *  - True: PC actor's resource successfully incremented
 *  - False: PC actor's resource was not found (not set on actor)
 *  - Zero: PC actor's resource was already at (or above) max
 * 
 * 12/14/22 0.1 Creation
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
const SPELL_NAME = `Test Resource`
const ACTOR_DATA = await aActor.getRollData();
console.log('ACTOR_DATA', ACTOR_DATA)
const RESOURCE_NAME = "Channel Divinity";
//---------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // test if using actor is a PC or NPC 
    //
    if (await jez.isPC(aActor.uuid, { traceLvl: 0 })) console.log(`${aToken.name} is a PC`)
    if (await jez.isNPC(aActor.uuid, { traceLvl: 0 })) console.log(`${aToken.name} is an NPC`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Check to see if the actor has the resource and get charge values
    //
    const RES_AVAIL = await jez.resourceAvail(aActor.uuid, RESOURCE_NAME, aItem.uuid, { traceLvl: TL, quiet: false })
    if (RES_AVAIL > 0) console.log(`Actor has charges remaining`, RES_AVAIL)
    else switch (RES_AVAIL) {
        case null: console.log(`Actor is an NPC and for some reason the resouce exits (should not happen)`); break
        case false: console.log(`${RESOURCE_NAME} for PC or limited uses on ${aItem.name} for NPC not defined`); break
        case 0: console.log(`${RESOURCE_NAME} for PC or limited uses on ${aItem.name} already exhausted`); break
        default: return jez.badNews()`resourceAvail returned unexpected value ${RES_AVAIL}`
    }
    if (TL > 1) jez.trace(`${TAG} resourceAvail result`, RES_AVAIL)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Ask if a resource should be consumed
    //
    const Q_TITLE = `Consume Resource?`
    let qText = `<p>${aToken.name} is using <b>${SPELL_NAME}</b> to test the utilization of character resources.</p>
    <p>If you want to spend the charge (or use the NPC alternative), click <b>"Yes"</b>.</p>
    <p>If you want to bypass spending the charge (with GM permission) click <b>"No"</b>.</p>
    <p>If you want to cancel the spell click <b>"Close"</b> (top right of dialog).</p>`
    const SPEND_RESOURCE = await Dialog.confirm({ title: Q_TITLE, content: qText, });
    if (TL > 1) jez.trace(`${TAG} SPEND_RESOURCE`, SPEND_RESOURCE)
    if (SPEND_RESOURCE === null) return jez.badNews(`${SPELL_NAME} cancelled by player.`, 'i')
    //-------------------------------------------------------------------------------------------------------------------------------
    // Deal with casting resource -- this needs to consider NPC and PC data structures
    //
    if (TL > 1) jez.trace(`${TAG} Time to use a resource`)
    if (SPEND_RESOURCE) {
        const CONTINUE = await jez.resourceSpend(aActor.uuid, RESOURCE_NAME, aItem.uuid, { traceLvl: TL, quiet: false })
        switch (CONTINUE) {
            case null: console.log(`Actor is an NPC, can't decrement a resource`); break
            case true: console.log(`Actor is a PC & resource decrimented`); break
            case false: console.log(`Actor is a PC but doesn't have the resource defined`); break
            case 0: console.log(`Actor is a PC but resource has no available charges`); break
            default: return jez.badNews()`resourceSpend returned unexpected value ${CONTINUE}`
        }
        if (TL > 1) jez.trace(`${TAG} resourceSpend result`, CONTINUE)
        if (CONTINUE === false) return jez.badNews(`${SPELL_NAME} cancelled for lack of defined ${RESOURCE_NAME}`, 'w')
        if (CONTINUE === 0) return jez.badNews(`${SPELL_NAME} cancelled for lack of ${RESOURCE_NAME} charges`, 'w')
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Cool heals while keeping a beat in the log
    //
    for (let i = 1; i < 6; i++) {
        await jez.wait(500)
        console.log(`${i}...`)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Lets refund it! This will generate an error if we are already at max resources
    //
    const CONTINUE = await jez.resourceRefund(aActor.uuid, RESOURCE_NAME, aItem.uuid, { traceLvl: TL, quiet: false })
    switch (CONTINUE) {
        case null: console.log(`Actor is an NPC, can't increment a resource`); break
        case true: console.log(`Actor is a PC & resource incremented`); break
        case false: console.log(`Actor is a PC but doesn't have the resource defined`); break
        case 0: console.log(`Actor is a PC but resource is already at maximum charges`); break
        default: return jez.badNews()`resourceRefund returned unexpected value ${CONTINUE}`
    }
    if (TL > 1) jez.trace(`${TAG} resourceRefund result`, CONTINUE)
    if (CONTINUE === false) return jez.badNews(`${SPELL_NAME} cancelled for lack of defined ${RESOURCE_NAME}`, 'w')
    if (CONTINUE === 0) return jez.badNews(`${SPELL_NAME} cancelled for ${RESOURCE_NAME} charges, already at maximum`, 'w')
    //-------------------------------------------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
// /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
//  * resourceSpend((actor5eUuid, resourceName, aItemUuid) - For PCs, decrement resource, verifying it exists and at least a value of 1.
//  * 
//  * Inputs Required:
//  *  - actor5eUuid: Actor UUID e.g. 'Actor.qvVZIQGyCMvDJFtG' (linked) or 'Scene.MzEyYTVkOTQ4NmZk.Token.HNjb9QaxP5K1V1NG' (unlinked)
//  *  - resourceName: String that must match (exactly) one of a PC's predefined resource slots
//  *  - aItemUuid: Item UUID on the calling macro, e.g. "Scene.MzEyYTVkOTQ4NmZk.Token.HNjb9QaxP5K1V1NG.Item.9vm3k6d26nbuqezf"
//  *  - options: Two supported option fields.
//  * 
//  * Options
//  *  - traceLvl: Integer controlling verbosity of logging.  Default is 0 which is silent
//  *  - quiet: boolean value.  Default is false which enables display of error messages.  True suppresses them.
//  *  
//  * Return values:
//  *  - Null: actor is a NPC making this irrelevant
//  *  - True: PC actor's resource successfully decrimented
//  *  - False: PC actor's resource was not found (not set on actor)
//  *  - Zero: PC actor's resource was already zero (or below), and could not be decrimented
//  *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
// async function resourceSpend(actor5eUuid, resourceName, aItemUuid, options = {}) {
//     const FUNCNAME = "resourceSpend(actor5eUuid, resourceName, options = {})";
//     const FNAME = FUNCNAME.split("(")[0]
//     const TAG = `jez.${FNAME} |`
//     const TL = options.traceLvl ?? 0
//     const QUIET = options.quiet ?? false
//     if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
//     if (TL > 1) jez.trace(`${TAG} --- Starting ${FUNCNAME}`, 'actor5eUuid', actor5eUuid, 'resourceName', resourceName,
//         'aItemUuid', aItemUuid, "options", options);
//     //-------------------------------------------------------------------------------------------------------------------------------
//     // Function variables
//     //
//     let aItem = await fromUuid(aItemUuid)
//     let actor5e = await fromUuid(actor5eUuid)
//     if (TL > 1) jez.trace(`${TAG} Data Accessed`, 'aItem  ', aItem, 'actor5e', actor5e)
//     const IS_NPC = await jez.isNPC(actor5eUuid, { traceLvl: 0 })
//     //-------------------------------------------------------------------------------------------------------------------------------
//     //
//     if (IS_NPC) {
//         if (TL > 2) jez.trace(`${TAG} Processing ${actor5e.name} as NPC`)
//         const ITEM_USES = await jez.getItemUses(aItem, { traceLvl: TL })
//         if (TL > 2) jez.trace(`${TAG} Resource Values for NPC: ${aToken.name}`, "ITEM_USES", ITEM_USES)
//         if (ITEM_USES.max) return null // If max charges isn't set, this item is not set up correctly
//         if (!QUIET) jez.badNews(`Make sure limited daily uses are configured for ${aItem.name}.`, 'i')
//         return null;
//     }
//     //-------------------------------------------------------------------------------------------------------------------------------
//     // Set variables for this function
//     //
//     let resourceSlot = null
//     const ACTOR_DATA = await actor5e.getRollData();
//     let usesVal, usesMax
//     //-------------------------------------------------------------------------------------------------------------------------------
//     // Figure our which slot has our resource and get the current and maximum value
//     //
//     if (TL > 2) jez.trace(`${TAG} Processing ${actor5e.name} as PC`)
//     let resourceList = [{ name: "primary" }, { name: "secondary" }, { name: "tertiary" }];
//     let resourceValues = Object.values(ACTOR_DATA.resources);
//     let resourceTable = mergeObject(resourceList, resourceValues);
//     let findResourceSlot = resourceTable.find(i => i.label.toLowerCase() === RESOURCE_NAME.toLowerCase());
//     if (!findResourceSlot) {
//         if (!QUIET) jez.badNews(`${RESOURCE_NAME} Resource is missing on ${aToken.name}, Please add it.`,'i');
//         return false
//     }
//     resourceSlot = findResourceSlot.name;
//     usesVal = ACTOR_DATA.resources[resourceSlot].value;
//     usesMax = ACTOR_DATA.resources[resourceSlot].max;
//     if (TL > 2) jez.trace(`${TAG} Resource Values for PC: ${aToken.name}`, "resourceList     ", resourceList,
//         "resourceTable    ", resourceTable, "findResourceSlot ", findResourceSlot,
//         'usesVal          ', usesVal, 'usesMax          ', usesMax)
//     console.log(`Marco...`)
//     if (usesVal < 1) {
//         console.log(`There are no ${RESOURCE_NAME} charges available.`)
//         if (!QUIET) jez.badNews(`There are no ${RESOURCE_NAME} charges available.`,'i');
//         console.log(`There are no ${RESOURCE_NAME} charges available.`)
//         return 0
//     }
//     console.log(`...Polo`)
//     //-------------------------------------------------------------------------------------------------------------------------------
//     // Decrement our resource 
//     //
//     console.log(`Decrement resource`)
//     let updates = {};
//     let resources = `data.resources.${resourceSlot}.value`;
//     updates[resources] = usesVal - 1;
//     console.log(`updates`,updates)
//     await aActor.update(updates);
//     return true
// }
// /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
//  * resourceRefund (actor5eUuid, resourceName, aItemUuid) - For PCs, increment the verified resource but not past max.
//  * 
//  * Inputs Required:
//  *  - actor5eUuid: Actor UUID e.g. 'Actor.qvVZIQGyCMvDJFtG' (linked) or 'Scene.MzEyYTVkOTQ4NmZk.Token.HNjb9QaxP5K1V1NG' (unlinked)
//  *  - resourceName: String that must match (exactly) one of a PC's predefined resource slots
//  *  - aItemUuid: Item UUID on the calling macro, e.g. "Scene.MzEyYTVkOTQ4NmZk.Token.HNjb9QaxP5K1V1NG.Item.9vm3k6d26nbuqezf"
//  *  - options: Two supported option fields.
//  * 
//  * Options
//  *  - traceLvl: Integer controlling verbosity of logging.  Default is 0 which is silent
//  *  - quiet: boolean value.  Default is false which enables display of error messages.  True suppresses them.
//  *  
//  *  Return values:
//  *  - Null: actor is a NPC making this irrelevant
//  *  - True: PC actor's resource successfully incremented
//  *  - False: PC actor's resource was not found (not set on actor)
//  *  - Zero: PC actor's resource was already at (or above) max
//  *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
// async function resourceRefund(actor5eUuid, resourceName, aItemUuid, options = {}) {
//     const FUNCNAME = "resourceRefund(actor5eUuid, resourceName, aItemUuid, options = {})";
//     const FNAME = FUNCNAME.split("(")[0]
//     const TAG = `jez.${FNAME} |`
//     const TL = options.traceLvl ?? 0
//     const QUIET = options.quiet ?? false
//     if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
//     if (TL > 1) jez.trace(`${TAG} --- Starting ${FUNCNAME}`, 'actor5eUuid', actor5eUuid, 'resourceName', resourceName,
//         'aItemUuid', aItemUuid, "options", options);
//     //-------------------------------------------------------------------------------------------------------------------------------
//     // Function variables
//     //
//     let aItem = await fromUuid(aItemUuid)
//     let actor5e = await fromUuid(actor5eUuid)
//     if (TL > 1) jez.trace(`${TAG} Data Accessed`, 'aItem  ', aItem, 'actor5e', actor5e)
//     const IS_NPC = await jez.isNPC(actor5eUuid, { traceLvl: 0 })
//     //-------------------------------------------------------------------------------------------------------------------------------
//     //
//     if (IS_NPC) {
//         if (TL > 2) jez.trace(`${TAG} Processing ${actor5e.name} as NPC`)
//         const ITEM_USES = await jez.getItemUses(aItem, { traceLvl: TL })
//         if (TL > 2) jez.trace(`${TAG} Resource Values for NPC: ${aToken.name}`, "ITEM_USES", ITEM_USES)
//         if (ITEM_USES.max) return null
//         if (!QUIET) jez.badNews(`Make sure limited daily uses are configured for ${aItem.name}.`, 'i')
//         return null;
//     }
//     //-------------------------------------------------------------------------------------------------------------------------------
//     //
//     let resourceSlot = null
//     const ACTOR_DATA = await actor5e.getRollData();
//     let usesVal, usesMax
//     //-------------------------------------------------------------------------------------------------------------------------------
//     // Figure our which slot has our resource and get the current and maximum value
//     //
//     if (TL > 2) jez.trace(`${TAG} Processing ${actor5e.name} as PC`)
//     let resourceList = [{ name: "primary" }, { name: "secondary" }, { name: "tertiary" }];
//     let resourceValues = Object.values(ACTOR_DATA.resources);
//     let resourceTable = mergeObject(resourceList, resourceValues);
//     let findResourceSlot = resourceTable.find(i => i.label.toLowerCase() === RESOURCE_NAME.toLowerCase());
//     if (!findResourceSlot) {
//         if (!QUIET) jez.badNews(`${RESOURCE_NAME} Resource is missing on ${aToken.name}, Please add it.`);
//         return false
//     }
//     resourceSlot = findResourceSlot.name;
//     usesVal = ACTOR_DATA.resources[resourceSlot].value;
//     usesMax = ACTOR_DATA.resources[resourceSlot].max;
//     if (TL > 2) jez.trace(`${TAG} Resource Values for PC: ${aToken.name}`, "resourceList     ", resourceList,
//         "resourceTable    ", resourceTable, "findResourceSlot ", findResourceSlot,
//         'usesVal          ', usesVal, 'usesMax          ', usesMax)
//     if (usesVal >= usesMax) {
//         if (!QUIET) jez.badNews(`Already at maximum ${RESOURCE_NAME} charges.`);
//         return 0
//     }
//     // }
//     //-------------------------------------------------------------------------------------------------------------------------------
//     // Increment our resource 
//     //
//     let updates = {};
//     let resources = `data.resources.${resourceSlot}.value`;
//     updates[resources] = usesVal + 1;
//     await aActor.update(updates);
//     return true
// }
// /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
//  * resourceAvail(actorUuid, actor5eUuid, aItemUuid) - Checks the availaibility of named resource on passed actor. 
//  * 
//  * Inputs Required:
//  *  - actor5eUuid: Actor UUID e.g. 'Actor.qvVZIQGyCMvDJFtG' (linked) or 'Scene.MzEyYTVkOTQ4NmZk.Token.HNjb9QaxP5K1V1NG' (unlinked)
//  *  - resourceName: String that must match (exactly) one of a PC's predefined resource slots
//  *  - aItemUuid: Item UUID on the calling macro, e.g. "Scene.MzEyYTVkOTQ4NmZk.Token.HNjb9QaxP5K1V1NG.Item.9vm3k6d26nbuqezf"
//  *  - options: Two supported option fields.
//  * 
//  * Options
//  *  - traceLvl: Integer controlling verbosity of logging.  Default is 0 which is silent
//  *  - quiet: boolean value.  Default is false which enables display of error messages.  True suppresses them.
//  * 
//  * Return values:
//  *  - Positive integer: 1 or more charges is available on a PC/NPC
//  *  - Zero: 0 charges are available on a PC/NPC
//  *  - False: named resource does not exist on a PC/NPC
//  *  - Null: The actor is a NPC and none of the above passed tests
//  *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
//  async function resourceAvail(actor5eUuid, resourceName, aItemUuid, options = {}) {
//     const FUNCNAME = "resourceAvail(actor5eUuid, resourceName, options = {})";
//     const FNAME = FUNCNAME.split("(")[0]
//     const TAG = `jez.${FNAME} |`
//     const TL = options.traceLvl ?? 0
//     const QUIET = options.quiet ?? false
//     if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
//     if (TL > 1) jez.trace(`${TAG} --- Starting ${FUNCNAME}`, 'actor5eUuid', actor5eUuid, 'resourceName', resourceName,
//         'aItemUuid', aItemUuid, "options", options);
//     //-------------------------------------------------------------------------------------------------------------------------------
//     // Function variables
//     //
//     let aItem = await fromUuid(aItemUuid)
//     let actor5e = await fromUuid(actor5eUuid)
//     if (TL > 1) jez.trace(`${TAG} Data Accessed`, 'aItem  ', aItem, 'actor5e', actor5e)
//     const IS_NPC = await jez.isNPC(actor5eUuid, { traceLvl: 0 })
//     //-------------------------------------------------------------------------------------------------------------------------------
//     //
//     if (IS_NPC) {
//         if (TL > 2) jez.trace(`${TAG} Processing ${actor5e.name} as NPC`)
//         const ITEM_USES = await jez.getItemUses(aItem, { traceLvl: TL })
//         if (TL > 2) jez.trace(`${TAG} Resource Values for NPC: ${aToken.name}`, "ITEM_USES", ITEM_USES)
//         // ITEM_USES: { max: 3, per: "day", value: 3 }
//         if (ITEM_USES?.value > 0) return ITEM_USES.value
//         if (ITEM_USES?.value <= 0) return 0
//         if (ITEM_USES.max) return false // If max charges isn't set, this item is not set up correctly
//         if (!QUIET) jez.badNews(`Make sure limited daily uses are configured for ${aItem.name}.`, 'i')
//         return null;
//     }
//     //-------------------------------------------------------------------------------------------------------------------------------
//     // Set variables for this function
//     //
//     let resourceSlot = null
//     const ACTOR_DATA = await actor5e.getRollData();
//     let usesVal, usesMax
//     //-------------------------------------------------------------------------------------------------------------------------------
//     // Figure our which slot has our resource and get the current and maximum value
//     //
//     if (TL > 2) jez.trace(`${TAG} Processing ${actor5e.name} as PC`)
//     let resourceList = [{ name: "primary" }, { name: "secondary" }, { name: "tertiary" }];
//     let resourceValues = Object.values(ACTOR_DATA.resources);
//     let resourceTable = mergeObject(resourceList, resourceValues);
//     let findResourceSlot = resourceTable.find(i => i.label.toLowerCase() === RESOURCE_NAME.toLowerCase());
//     if (!findResourceSlot) {
//         if (!QUIET) jez.badNews(`${RESOURCE_NAME} Resource is missing on ${aToken.name}, Please add it.`);
//         return false
//     }
//     resourceSlot = findResourceSlot.name;
//     usesVal = ACTOR_DATA.resources[resourceSlot].value;
//     usesMax = ACTOR_DATA.resources[resourceSlot].max;
//     if (TL > 2) jez.trace(`${TAG} Resource Values for PC: ${aToken.name}`, "resourceList     ", resourceList,
//         "resourceTable    ", resourceTable, "findResourceSlot ", findResourceSlot,
//         'usesVal          ', usesVal, 'usesMax          ', usesMax)
//     if (usesVal < 1) {
//         if (!QUIET) jez.badNews(`There are no ${RESOURCE_NAME} charges available.`);
//         return 0
//     }
//     //-------------------------------------------------------------------------------------------------------------------------------
//     // Decrement our resource 
//     //
//     return usesMax
// }