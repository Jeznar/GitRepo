const MACRONAME = "GrappleEscapeFixedDC.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Run as GM Macro that creates/deletes a temporary item in the target's inventory to attempt 
 * to escape a grapple against a fixed DC.
 * 
 * Input Arguments required
 * 
 * @param {string} args[0] - type of action: create or delete
 * @param {string} args[1] - Token uuid of acting token, e.g. aToken.data.document.uuid
 * @param {string} args[2] - Token uuid of target token, e.g. aToken.uuid}
 * @param {string} args[3] - Actor uuid of acting token, e.g. aToken.data.document.uuid
 * @param {integer} args[4] - Fixed DC that needs to matched or beaten
 * 
 * 
 * 07/05/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 4
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(2, trcLvl, `  args[${i}]`, args[i]);
//---------------------------------------------------------------------------------------------------
// Parse and the input arguments
//
let action = args[0] ?? "create"
let aTokenUuid = args[1] ?? 'Scene.MzEyYTVkOTQ4NmZk.Token.cBMsqVwfwf1MxRxV'
let tTokenUuid = args[2] ?? 'Scene.MzEyYTVkOTQ4NmZk.Token.pcAVMUbbnGZ1lz4h'
let aActorUuid = args[3] ?? `Actor.8D0C9nOodjwHDGQT`
const FIXED_DC = args[4] ?? 15
//---------------------------------------------------------------------------------------------------
// Onto the main event
//
main()
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function preCheck() {
    // This is a good place to check the arguments, but I haven't written that
    return (true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Setup the environment then call the create or delete code
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function main() {
    const HELPER_MACRO = "%%Escape Fixed DC%%"
    if (!await preCheck()) return (false);
    //-------------------------------------------------------------------------------------------
    // Convert received actor.uuid's into the needed Actor5e data objects
    //
    // const aActor = await game.dfreds.effectInterface._foundryHelpers.getActorByUuid(aActorUuid)
    // if (!aActor) return badNews(`aActor with uuid ${aActorUuid} not found, aActor not set, aborting.`, "warn")
    // jez.trc(2, trcLvl, `aActor ${aActor.name} with uuid ${aActorUuid}, found!`, aActor)
    // jez.trc(2,trcLvl,"aToken",aActor.parent._object)
    //
    // const tActor = await game.dfreds.effectInterface._foundryHelpers.getActorByUuid(tActorUuid)
    // if (!tActor) return badNews(`tActor with ${tActorUuid} could not be found, tActor not set, aborting.`, "warn")
    // jez.trc(2, trcLvl, `tActor ${tActor.name} with uuid ${tActorUuid}, found!`, tActor)
    // jez.trc(2,trcLvl,"tToken",tActor.parent._object)
    //-------------------------------------------------------------------------------------------
    // Convert received token.uuid's into Token5e data objects
    //
    let aTokenId = aTokenUuid.split(".")[3]
    let aToken = canvas.tokens.placeables.find(ef => ef.id === aTokenId)
    if (!aToken) return badNews(`aToken with id ${aTokenId} not found, aToken not set, aborting.`, "warn")
    jez.trc(2, trcLvl, `aToken ${aToken.name} with uuid ${aTokenId}, found!`, aToken)
    const CUSTOM_MACRO = `Escape ${aToken.name}, DC ${FIXED_DC}`
    //
    let tTokenId = tTokenUuid.split(".")[3]
    let tToken = canvas.tokens.placeables.find(ef => ef.id === tTokenId)
    if (!tToken) return badNews(`tToken with id ${tTokenId} not found, tToken not set, aborting.`, "warn")
    jez.trc(2, trcLvl, `aToken ${tToken.name} with uuid ${tTokenId}, found!`, tToken)
    //-------------------------------------------------------------------------------------------
    // Proceed with create or delete
    //
    if (action === "create") createItem()
    else deleteItem()
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Creat Function
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    async function createItem() {
        //-------------------------------------------------------------------------------------------
        // Get rid of any pre-existing item for this escape
        //
        // await jez.deleteItems(CUSTOM_MACRO, "feat", tActor);
        await jez.deleteItems(CUSTOM_MACRO, "feat", tToken.actor);

        //-------------------------------------------------------------------------------------------
        // Slap the template item onto the actor
        //
        await jez.itemAddToActor(tToken, HELPER_MACRO)
        //-------------------------------------------------------------------------------------------
        // Update the item's name and extract the comments from the description
        //
        let itemUpdate = {
            name: CUSTOM_MACRO,                 // Change to actor specific name for temp item
        }
        await jez.itemUpdateOnActor(tToken, HELPER_MACRO, itemUpdate, "feat")
        //-------------------------------------------------------------------------------------------
        // Grab the data for the new item from the actor
        //
        let getItem = await jez.itemFindOnActor(tToken, CUSTOM_MACRO, "feat");
        //-------------------------------------------------------------------------------------------
        // Update the description field
        //
        let description = getItem.data.data.description.value
        description = description.replace(/%TOKENNAME%/g, `${tToken.name}`);
        description = description.replace(/%GRAPPLERNAME%/g, `${aToken.name}`);
        description = description.replace(/%FIXED_DC%/g, FIXED_DC);
        //-------------------------------------------------------------------------------------------
        // Update the macro field
        //
        let macro = getItem.data.flags.itemacro.macro.data.command
        macro = macro.replace(/%GRAPPLER_TOKEN_UUID%/g, `${aTokenUuid}`);
        macro = macro.replace(/%GRAPPLER_ACTOR_UUID%/g, `${aActorUuid}`);
        macro = macro.replace(/%FIXED_DC%/g, `${FIXED_DC}`);
        //-------------------------------------------------------------------------------------------
        // Build a new itemUpdate Object
        //
        itemUpdate = {
            data: { description: { value: description } },   // Drop in altered description
            flags: {
                itemacro: {
                    macro: {
                        data: {
                            command: macro,
                            name: CUSTOM_MACRO,
                        },
                    },
                },
            },
        }
        //-------------------------------------------------------------------------------------------
        // Update the item with new information
        //
        await jez.itemUpdateOnActor(tToken, CUSTOM_MACRO, itemUpdate, "feat")
        //-------------------------------------------------------------------------------------------
        // Modify the effect to cleanup the item when it is removed
        //
        // modifyEffect(token, item, effectName) {
        modifyEffect(tToken, getItem)
        //-------------------------------------------------------------------------------------------
        // Pop Creation notification
        //
        ui.notifications.info(`Created Action on ${tToken.name}: "${CUSTOM_MACRO}"`);
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * 
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    async function deleteItem() {
        //-------------------------------------------------------------------------------------------
        // Get rid of any pre-existing item for this escape
        //
        await jez.deleteItems(CUSTOM_MACRO, "feat", tToken.actor);
    }
}
/************************************************************************
 * Modify an existing effect
*************************************************************************/
async function modifyEffect(token, item) {
    await jez.wait(100)
    let effect = token.actor.effects.find(ef => ef.data.label === "Grappled" && ef.data.origin === aActorUuid)
    effect.data.changes.push({ key: `macro.execute`, mode: jez.CUSTOM, value: `CleanUpItem ${item.uuid}`, priority: 20 })
    effect.update({ 'changes': effect.data.changes });
}