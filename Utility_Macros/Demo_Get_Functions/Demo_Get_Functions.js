const MACRONAME = "Demo_Get_Functions"
/*****************************************************************************************
 * Macro intended to be used as a onUse ItemMacro macro optionally targeting an on screen 
 * token that will be used to popiulate variables needed to exercise the various get 
 * functions that are intended to be part of jez-lib.
 * 
 * 03/12/22 0.1 Creation of Macro
 *****************************************************************************************/
/*** 
 
A series of functions that return simple integer values or false on errors with a fair 
amount of error checking.

- jez.getCastMod(subject) -- Returns the subject's casting stat modifier
- jez.getCastStat(subject) -- Returns the subject's casting stat string (e.g. "int")
- jez.getStatMod(subject,stat) -- Returns the subject's modifier for passed stat str
- jez.getProfMod(subject) -- Returns the subject's proficiency modifer
- jez.getTokenById(subjectId) -- Returns the Token5e acssociated with the passed ID

Parameters
Subject: Token5e or Actor5e object or 16 character id of a token
Stat: A string from: "str", "dex", "con", "int", "wis", "chr"
SubjectId: 16 character identifier for a token in the current scene

***/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
console.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) console.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
    else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
    else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
    else aItem = lastArg.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------
// Exercise: jez.getCastMod
//
console.log("jez.getCastMod(aToken)",jez.getCastMod(aToken))
console.log("jez.getCastMod(aActor)",jez.getCastMod(aActor))
console.log("jez.getCastMod(aToken.id)",jez.getCastMod(aToken.id))
console.log("jez.getCastMod(aItem)",jez.getCastMod(aItem))
console.log("jez.getCastMod(garbage)",jez.getCastMod("garbage"))
//---------------------------------------------------------------------------------------
// Exercise: jez.getCastStat
//
console.log("jez.getCastStat(aToken)",jez.getCastStat(aToken))
console.log("jez.getCastStat(aActor)",jez.getCastStat(aActor))
console.log("jez.getCastStat(aToken.id)",jez.getCastStat(aToken.id))
console.log("jez.getCastStat(aItem)",jez.getCastStat(aItem))
console.log("jez.getCastStat(garbage)",jez.getCastStat("garbage"))
//---------------------------------------------------------------------------------------
// Exercise: jez.getStatMod
//
console.log('jez.getStatMod(aToken,"Int")',jez.getStatMod(aToken,"Int"))
console.log('jez.getStatMod(aActor,"Int")',jez.getStatMod(aActor,"Int"))
console.log('jez.getStatMod(aToken.id,"Int")',jez.getStatMod(aToken.id,"Int"))
console.log('jez.getStatMod(aToken,"XYZ")',jez.getStatMod(aToken,"XYZ"))
console.log('jez.getStatMod(aToken,"intelligence")',jez.getStatMod(aToken,"intelligence"))
console.log('jez.getStatMod(aItem,"Int")',jez.getStatMod(aItem,"Int"))

//---------------------------------------------------------------------------------------
// Exercise: jez.getProfMod
//
console.log('jez.getProfMod(aToken)',jez.getProfMod(aToken))
console.log('jez.getProfMod(aActor)',jez.getProfMod(aActor))
console.log('jez.getProfMod(aToken.id)',jez.getProfMod(aToken.id))
console.log('jez.getProfMod(XYZ)',jez.getProfMod("XYZ"))
console.log('jez.getProfMod(aItem)',jez.getProfMod(aItem))
//---------------------------------------------------------------------------------------
// Exercise: jez.getTokenById
//
console.log("jez.getTokenById(aToken.id)",jez.getTokenById(aToken.id))
console.log("jez.getTokenById(BogusID)",jez.getTokenById("BogusID"))

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
 function getCastMod(subject) {
    let stat=getCastStat(subject)
    if (!stat) return(false)
    return (getStatMod(subject,stat))
 }
/***************************************************************************************************
 * Return casting stat string based on input: Token5e, TokenID, Actor5e
 ***************************************************************************************************/
function getCastStat(subject) {
    let actor5e = null
    if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
        if (subject.constructor.name === "Token5e") actor5e = subject.actor
        else if (subject.constructor.name === "Actor5e") actor5e = subject
        else {
            let msg = `Object passed to getCastStat(subject) is type '${typeof(subject)}' must be a Token5e or Actor5e`
            ui.notifications.error(msg)
            console.log(msg)
            return (false)
        }
    } else if ((typeof (subject) === "string") && (subject.length === 16)) actor5e = getTokenById(subject).actor
    else {
        let msg = `Parameter passed to getCastStat(subject) is not a Token5e, Actor5e, or Token.id: ${subject}`
        ui.notifications.error(msg)
        console.log(msg)
        return (false)
    }
    return (actor5e.data.data.attributes.spellcasting)
}
/***************************************************************************************************
 * Return casting stat mod integer based on input: Token5e, TokenID, Actor5e and stat string
 ***************************************************************************************************/
 function getStatMod(subject,statParm) {
    let actor5e = null
    let stat = ""
    const STAT_ARRAY = ["str", "dex", "con", "int", "wis", "chr"]   // Allowed stat strings
    //----------------------------------------------------------------------------------------------
    // Validate the subject parameter, stashing it into "actor5e"
    //
    if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
        if (subject.constructor.name === "Token5e") actor5e = subject.actor
        else if (subject.constructor.name === "Actor5e") actor5e = subject
        else {
            let msg = `Object passed to getStatMod(subject,statParm) is type '${typeof(subject)}' must be a Token5e or Actor5e`
            ui.notifications.error(msg)
            console.log(msg)
            return (false)
        }
    } else if ((typeof (subject) === "string") && (subject.length === 16)) actor5e = getTokenById(subject).actor
    else {
        let msg = `Subject parm passed to getStatMod(subject,statParm) is not a Token5e, Actor5e, or Token.id: ${subject}`
        ui.notifications.error(msg)
        console.log(msg)
        return (false)
    }
    //----------------------------------------------------------------------------------------------
    // Validate the statParm parameter and stash it into "stat"
    //
    if ((typeof(statParm) !== "string") || (statParm.length !== 3)) {
        let msg = `Stat parameter passed to getStatMod(subject, statParm) is invalid: ${statParm}`
        ui.notifications.error(msg)
        console.log(msg)
        return (false)
    }
    stat = statParm.toLowerCase();
    if (!STAT_ARRAY.includes(stat)) {
        let msg = `Stat parameter passed to getStatMod(subject, statParm) is invalid: ${statParm}`
        ui.notifications.error(msg)
        console.log(msg)
        return (false)
    }
    //----------------------------------------------------------------------------------------------
    // Fetch and return that modifier
    //
    return(actor5e.data.data.abilities[stat].mod)
}
 /***************************************************************************************************
 * Return proficency modifier
 ***************************************************************************************************/
  function getProfMod(subject) {
    let actor5e = null
    if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
        if (subject.constructor.name === "Token5e") actor5e = subject.actor
        else if (subject.constructor.name === "Actor5e") actor5e = subject
        else {
            let msg = `Object passed to getCastStat(subject) is type '${typeof(subject)}' must be a Token5e or Actor5e`
            ui.notifications.error(msg)
            console.log(msg)
            return (false)
        }
    } else if ((typeof (subject) === "string") && (subject.length === 16)) actor5e = getTokenById(subject).actor
    else {
        let msg = `Parameter passed to getCastStat(subject) is not a Token5e, Actor5e, or Token.id: ${subject}`
        ui.notifications.error(msg)
        console.log(msg)
        return (false)
    }
    return (actor5e.data.data.attributes.prof)
 }
 /***************************************************************************************************
 * Get token5e object based on ID passed
 ***************************************************************************************************/
  function getTokenById(tokenId) {
    if ((typeof(tokenId) != "string") || (tokenId.length !== 16)) {
       let msg = `Parameter passed to getTokenById(tokenId) is not an ID: ${tokenId}`
       ui.notifications.error(msg)
       console.log(msg)
       return(false)
    }
   return(canvas.tokens.placeables.find(ef => ef.id === tokenId));
}