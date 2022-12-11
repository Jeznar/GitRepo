const MACRONAME = "Wildfire-6th:Enhanced_Bond.0.2.js"
/*****************************************************************************************
 * Wildfire Druid 6th Level Ability,  based very much on my rewrite of Hex, which 
 * borrowed heavily from Crymic's code
 * 
 * 03/15/22 0.1 Creation of Macro
 * 12/10/22 0.2 Update to use current logging and shush the log noise.
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 0;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //-----------------------------------------------------------------------------------------------------------------------------------
 if (TL>0) jez.trace(`${TAG} === Starting ===`);
 if (TL>1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
 //-----------------------------------------------------------------------------------------------------------------------------------
 // Set standard variables
 const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
 let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
 let aActor = aToken.actor; 
 let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
 const VERSION = Math.floor(game.VERSION);
 const GAME_RND = game.combat ? game.combat.round : 0;
 //-----------------------------------------------------------------------------------------------------------------------------------
 // Set Macro specific globals
 //
const ITEM_NAME = "Hex - Move"                          // Base name of the helper item
const SPEC_ITEM_NAME = `%%${ITEM_NAME}%%`               // Name as expected in Items Directory 
const NEW_ITEM_NAME = `${aToken.name}'s ${ITEM_NAME}`   // Name of item in actor's spell book
//------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "DamageBonus") return (doBonusDamage({traceLvl:TL}));    // DAE Damage Bonus
if (TL>1) jez.trace(`${TAG} === Finished ===`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
function postResults() {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "doBonusDamage"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 async function doBonusDamage(options={}) {
    const FUNCNAME = "doBonusDamage(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL>0) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Function Values
    //
    const NUM_DICE = 1
    const DIE_TYPE = "d8"
    let dmgType = "";
    //-------------------------------------------------------------------------------------------------------------------------------
    // Check for presence of familiar
    //
    if (!await familiarPresent()) {
        if (TL>1) jez.trace(`${TAG} Familiar is not present, sorry, no special effects`)
        return{};
    }
    //---------------------------------------------------------------------------------------------
    // Make sure something was targeted (return a null function if not) and then point at the first 
    // token.
    //
    if (args[0].targets.length === 0) return {}
    const tToken = canvas.tokens.get(args[0].targets[0].id); 
    if (TL>1) jez.trace(`${TAG} tToken`, tToken)
    //---------------------------------------------------------------------------------------------
    // If action type was "heal" return a proper healing function
    //
    if (aItem.data.actionType === "heal") {
        runVFX("heal", tToken) 
        if (TL>1) jez.trace(`${TAG} Healing detected`, aItem.data.actionType)
        dmgType = "healing"
        return {
            damageRoll: `${NUM_DICE}${DIE_TYPE}[${dmgType}]`,
            flavor: `(Enhanced Bond - heal)`,
            damageList: args[0].damageList, itemCardId: args[0].itemCardId
        };
    }
    //---------------------------------------------------------------------------------------------
    // If action type wasn't an attack then return a null function
    //
    if (!["ak"].some(actionType => (aItem.data.actionType || "").includes(actionType))) return {};
    //---------------------------------------------------------------------------------------------
    // If the attack didn't have a type of "fire" then return a null function, otherwise send back 
    // a valid extra damage function.
    //
    for(const damageLine of aItem.data.damage.parts) {
        if (damageLine[1] === "fire") {
            dmgType = "fire"
            break;
        }
    }
    if (dmgType !== "fire") return {}
    runVFX("fire", tToken) 
    return {
        damageRoll: `${NUM_DICE}${DIE_TYPE}[${dmgType}]`,
        flavor: `(Enhanced Bond - ${CONFIG.DND5E.damageTypes[dmgType]})`,
        damageList: args[0].damageList, itemCardId: args[0].itemCardId
    };
}
/***************************************************************************************************
 * Check to see is the familiar present?  return true if it is and has positive HP, otherwise false
 ***************************************************************************************************/
async function familiarPresent() {
    //return(true)
    //----------------------------------------------------------------------------------------------
    // Search for MINION in the current scene 
    //
    let i = 0;
    const MINION = await jez.familiarNameGet(aToken.actor)
    if (TL>1) jez.trace(`${TAG} MINION`, MINION)
    for (let critter of game.scenes.viewed.data.tokens) {
        if (critter.data.name === MINION) {
            if (TL>1) jez.trace(`${TAG} heading on back from function familiarPresent() with TRUE`)
            if (critter._actor.data.data.attributes.hp.value > 0) return(true)
        }
    }
    if (TL>1) jez.trace(`${TAG} Could not find active ${MINION} in the current scene, returning FALSE`)
    return(false)
}
/***************************************************************************************************
 * Play the VFX for the fire effect, type is "heal" or "fire" and nothing else
 ***************************************************************************************************/
 async function runVFX(type, token5e) {
    let vfxEffect = ""
    switch (type) {
        case "heal": vfxEffect = "jb2a.shield_themed.above.fire.03.orange"; break
        case "fire": vfxEffect = "jb2a.explosion.01.orange"; break
        default: return
    }
    await jez.wait(2000)
    new Sequence()
    .effect()
        .file(vfxEffect)
        .atLocation(token5e) 
        .scale(0.3)
        .opacity(1)
    .play();
 }