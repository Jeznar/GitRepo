const MACRONAME = "Demo_CombatAddRemove.0.1.js"
/*****************************************************************************************
 * Macro intended to be used as a onUse ItemMacro macro targeting on screen 
 * token(s) that will be used to popiulate variables needed to exercise the function 
 * which is intended to be part of jez-lib.
 * 
 * 11/18/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
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
//---------------------------------------------------------------------------------------
// Exercise: jez.getCastMod
//
console.log(`${args[0]?.targets.length} Targets ==>`,args[0]?.targets)
combatAddRemove('Add', args[0]?.targets, { traceLvl: TL })
await jez.wait(2000)
console.log('-----------------------------------------------------------------------------------')
combatAddRemove('Remove', args[0]?.targets, { traceLvl: TL })
await jez.wait(1000)
console.log('-----------------------------------------------------------------------------------')
combatAddRemove('Add', aToken, { traceLvl: TL })
await jez.wait(1000)
console.log('-----------------------------------------------------------------------------------')
combatAddRemove('Remove', aToken.document, { traceLvl: TL })
await jez.wait(1000)
console.log('-----------------------------------------------------------------------------------')
combatAddRemove('Toggle', [aToken], { traceLvl: TL })
await jez.wait(1000)
console.log('-----------------------------------------------------------------------------------')
combatAddRemove('Add', aToken.id, { traceLvl: TL })
await jez.wait(1000)
console.log('-----------------------------------------------------------------------------------')
combatAddRemove('Add', aToken.document.uuid, { traceLvl: TL })
await jez.wait(1000)
console.log('-----------------------------------------------------------------------------------')
combatAddRemove('Add', "Garbage", { traceLvl: TL })
console.log(`============== Finishing === ${MACRONAME} =================`);
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/
/***************************************************************************************************
 * Return casting modifier integer based on input: Token5e, TokenID, Actor5e
 ***************************************************************************************************/
async function combatAddRemove(ACTION, SUBJECT, options = {}) {
    const FUNCNAME = "combatAddRemove(ACTION, SUBJECT, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    const ALLOWED_ACTIONS = ["Add", "Remove", "Toggle"]
    if (TL === 2) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 2) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FUNCNAME} ---`,
        "ACTION  ==>", ACTION, "SUBJECT ==>", SUBJECT, "options ==>", options);
    //----------------------------------------------------------------------------------------------
    // Grab the RunAsGM Macros
    //
    const GM_TOGGLE_COMBAT = jez.getMacroRunAsGM("ToggleCombatAsGM")
    if (!GM_TOGGLE_COMBAT) { return false }
    //----------------------------------------------------------------------------------------------
    // Validate ACTION is one of allowed actions
    //
    if (!ALLOWED_ACTIONS.includes(ACTION))
        if (TL > 2) jez.trace(`${TAG} Action Choosen:`, ACTION)
        else return jez.badNews(`${TAG} Unsupported Action, ${ACTION}, must be in:`, ALLOWED_ACTIONS)
    //----------------------------------------------------------------------------------------------
    // Validate SUBJECT received, it can be a single or array of the following types:
    // Token5e data object, token.document.uuid, token.id (all must be same type)
    //
    if (jez.typeOf(SUBJECT) === "array")   // Processing an array of critters
        for (let i = 0; i < SUBJECT.length; i++) processOneEntity(ACTION, SUBJECT[i], { traceLvl: TL })
    else processOneEntity(ACTION, SUBJECT, { traceLvl: TL })
    //----------------------------------------------------------------------------------------------
    // Release any selected (controlled) objects to keep them from being affected by this macro
    // This is needed as toggleCombat() will affect all controlled tokens.
    //
   await canvas.tokens.releaseAll()
    //----------------------------------------------------------------------------------------------
    // Process a single entity, may need to call for each element of an array
    //
    async function processOneEntity(ACTION, SUBJECT, options = {}) {
        const FUNCNAME = "processOneEntity(ACTION, SUBJECT, options = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `${MACRO} ${FNAME} |`
        const TL = options.traceLvl ?? 0
        if (TL === 2) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FNAME} ---`);
        if (TL > 2) jez.trace(`${TAG} --- Starting --- ${MACRO} ${FUNCNAME} ---`,
            "ACTION  ==>", ACTION, "SUBJECT ==>", SUBJECT, "options ==>", options);
        //----------------------------------------------------------------------------------------------
        // Set Boolean Flow Control constants based on Action setting
        //
        const COMBAT_ADD = (ACTION === "Add") ? true : false;
        const COMBAT_REM = (ACTION === "Remove") ? true : false;
        const COMBAT_TOG = (ACTION === "Toggle") ? true : false;
        //----------------------------------------------------------------------------------------------
        // Determine the type of Subject
        //
        // let subjectType = jez.typeOf(SUBJECT)
        let subjectType = ""
        if (jez.typeOf(SUBJECT) === "object") {
            if (SUBJECT?.constructor?.name === "Token5e") subjectType = `Token5e`
            if (SUBJECT?.constructor?.name === "TokenDocument5e") subjectType = `TokenDocument5e`
        } else if (jez.typeOf(SUBJECT) === "string") {
            if (SUBJECT.length === 16) subjectType = `token.id`
            else if (SUBJECT.length === 45) subjectType = `token.document.uuid`
            else subjectType = `Garbage`
        } else subjectType = `Garbage`
        if (TL > 0) jez.trace(`${TAG} Processing ${subjectType}`, SUBJECT)
        if (subjectType === 'Garbage') return jez.badNews(`Seemingly passed some icky junk: ${SUBJECT}`)
        //----------------------------------------------------------------------------------------------
        // Need to convert SUBJECT into a _token.document.uuid
        //
        let subjectDocumentUuid = ""
        let dToken 
        switch (subjectType) {
            case 'Token5e':
                subjectDocumentUuid = SUBJECT.document.uuid
                dToken = SUBJECT
                break;
            case 'TokenDocument5e':
                subjectDocumentUuid = SUBJECT.uuid
                dToken = SUBJECT._object
                break;
            case 'token.id':
                dToken = await canvas.tokens.placeables.find(ef => ef.id === SUBJECT)
                subjectDocumentUuid = dToken.document.uuid
                break;
            case 'token.document.uuid':
                subjectDocumentUuid = SUBJECT
                let dTokenDocument5e = await fromUuid(SUBJECT) 
                dToken = dTokenDocument5e._object
                break;
            default:
                return jez.badNews(`This should not happen! Choked on ${SUBJECT}`)
        }
        if (TL > 0) jez.trace(`${TAG} token.document.uuid ${subjectDocumentUuid}`, dToken)
        //----------------------------------------------------------------------------------------------
        // Determine if the subject is currently in combat
        //
        let inCombat = false
        if (dToken?.combatant?.id) inCombat = true
        if (TL <= 1) jez.trace(`${TAG} ${dToken.name} in combat?`, inCombat)
        if (TL > 1) jez.trace(`${TAG} Adding to combat`,
            "inCombat ==>", inCombat,
            "dToken.name ==>", dToken.name,
            "COMBAT_ADD ==>", COMBAT_ADD,
            "COMBAT_REM ==>", COMBAT_REM,
            "COMBAT_TOG ==>", COMBAT_TOG,
            "subjectDocumentUuid ==>", subjectDocumentUuid)
        //----------------------------------------------------------------------------------------------
        // Toggle combat if not in combat and Action is Add
        //
        if (COMBAT_ADD && !inCombat) await GM_TOGGLE_COMBAT.execute(subjectDocumentUuid)
        //----------------------------------------------------------------------------------------------
        // Toggle combat if not in combat and Action is Remove
        //
        if (COMBAT_REM && inCombat) await GM_TOGGLE_COMBAT.execute(subjectDocumentUuid)
        //----------------------------------------------------------------------------------------------
        // Toggle combat if Action is Toggle
        //
        if (COMBAT_TOG) await GM_TOGGLE_COMBAT.execute(subjectDocumentUuid)
    }
}
