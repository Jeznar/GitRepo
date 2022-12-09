const MACRONAME = "Celestial_6th:Radiant_Soul.0.3.js"
/*****************************************************************************************
 * Wildfire Druid 6th Level Ability,  based very much on my rewrite of Hex, which 
 * borrowed heavily from Crymic's code
 * 
 * 03/15/22 Creation of Macro
 * 07/01/22 Chasing "<Warlock> is not a Celestial" bug caused by FoundryVTT 9.x
 * 12/09/22 0.3 Update logging to current style
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 0;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //---------------------------------------------------------------------------------------------------
 if (TL>0) jez.trace(`${TAG} === Starting ===`);
 if (TL>1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
const ABILITY_NAME = "Radiant Soul"
const FLAG = MACRO                      // Name of the DAE Flag  
const MIN_LVL = 6    
//------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "DamageBonus") {
    let damFunc = doBonusDamage({traceLvl:TL})
    if (TL>1) jez.trace(`${TAG} === Finished === ${MACRONAME} ===`,damFunc);
    return damFunc    // DAE Damage Bonus
}
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
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro BonusDamage
 ***************************************************************************************************/
async function doBonusDamage(options={}) {
    const FUNCNAME = "doBonusDamage(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-----------------------------------------------------------------------------------------------
    const NUM_DICE = 1
    const DIE_TYPE = "d8"
    let dmgType = "";
    //---------------------------------------------------------------------------------------------
    // Make sure the user is at least a level ${MIN_LVL} warlock of subclass celestial
    //
    // ----------------------------------------------------------------------------------------------
    // As of FoundryVTT 9.x the location of levels moved
    //   FROM: aToken.actor.data.data.classes?.warlock?.levels
    //   TO:   aToken.actor.data.document?._classes?.warlock?.data?.data?.levels
    let warlockLevel = aToken.actor.data.document?._classes?.warlock?.data?.data?.levels
    if (TL>1) jez.trace(`${TAG} ${aToken.name} is warlock level ${warlockLevel}`,warlockLevel)
    if ((warlockLevel < MIN_LVL || !warlockLevel)) {
        msg = `<b>${aToken.name}</b> is a level "${warlockLevel}" 
        warlock, must be at least level ${MIN_LVL} for <b>${ABILITY_NAME}</b> to be used.`
        jez.postMessage({color: "dodgerblue", fSize: 14, icon: aToken.data.img, msg: msg, 
                title: `${aToken.name} is not a Lvl ${MIN_LVL}+ Warlock`, token: aToken})
        return {}
    } else if (TL>1) jez.trace(`${TAG} Passed test of warlockLevel ${warlockLevel}`)

    // ----------------------------------------------------------------------------------------------
    // As of FoundryVTT 9.x the location of subclass moved
    //   FROM: aToken.actor.data.data.classes?.warlock?.subclass
    //   TO:   aToken.actor.data.document._classes?.warlock?.data?.data?.subclass
    let subClass = aToken.actor.data.document._classes?.warlock?.data?.data?.subclass
    if (TL>1) jez.trace(`${TAG} ${aToken.name} is subclass ${subClass}`)
    if (subClass.toLowerCase() !== "celestial") {
        msg = `<b>${aToken.name}</b> is subclass "${subClass}", 
        must be "Celestial" for <b>${ABILITY_NAME}</b> to be used.`
        jez.postMessage({color: "dodgerblue", fSize: 14, icon: aToken.data.img, msg: msg, 
                title: `${aToken.name} is not a Celestial`, token: aToken})
        return {}
    }
    //---------------------------------------------------------------------------------------------
    // Make sure something was targeted (return a null function if not) and then point at the first 
    // token.
    //
    if (args[0].targets.length === 0) return {}
    const tToken = canvas.tokens.get(args[0].targets[0].id); 
    //---------------------------------------------------------------------------------------------
    // If action type wasn't a spell attack (msak or rsak) then return a null function
    //
    let actionType = aItem.data.actionType
    if (TL > 1) jez.trace(`${TAG} actionType`, actionType)
    if (actionType === "rsak" || actionType === "msak" || actionType === "save") {
        if (TL > 1) jez.trace(`${TAG} continuing...`)
    }
    else return {};
    //if (!["sak"].some(actionType => (aItem.data.actionType || "").includes(actionType))) return {};
    //---------------------------------------------------------------------------------------------
    // If the attack didn't have a type of "fire" or "radiant" then return a null function, 
    // otherwise send back a valid extra damage function.
    //
    if (TL>1) jez.trace(`${TAG} Checking for fire or radiant damage`, aItem.data.damage.parts)
    for(const damageLine of aItem.data.damage.parts) {
        if (TL>1) jez.trace(`${TAG} Damage Line`, damageLine )
        if (damageLine[1] === "fire") {
            dmgType = "fire"
            break;
        }
        if (damageLine[1] === "radiant") {
            dmgType = "radiant"
            break;
        }
    }
    if (dmgType !== "fire" && dmgType !== "radiant") return {}
    let chrMod = jez.getStatMod(aToken,"cha")
    runVFX(dmgType, tToken) 
    if (TL>1) jez.trace(`${TAG} --- Finishing --- ${MACRONAME} ${FUNCNAME} ---`);
    return {
        //damageRoll: `${NUM_DICE}${DIE_TYPE}[${dmgType}]`,
        damageRoll: `${chrMod}[${dmgType}]`,
        flavor: `(Radiant Soul - ${CONFIG.DND5E.damageTypes[dmgType]})`,
        damageList: args[0].damageList, itemCardId: args[0].itemCardId
    };
}
/***************************************************************************************************
 * Play the VFX for the fire effect, type is "heal" or "fire" and nothing else
 ***************************************************************************************************/
async function runVFX(type, token5e, options = {}) {
    const FUNCNAME = "runVFX(type, token5e, options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "type", type, "token5e", token5e,
        "options", options);
    //-----------------------------------------------------------------------------------------------
    let vfxEffect = ""
    switch (type) {
        case "radiant": vfxEffect = "jb2a.template_circle.out_pulse.02.burst.tealyellow"; break
        case "fire": vfxEffect = "jb2a.explosion.01.orange"; break
        default: return
    }
    if (TL>1) jez.trace(`${TAG} vfxEffect`,vfxEffect)
    await jez.wait(2000)
    new Sequence()
    .effect()
        .file(vfxEffect)
        .atLocation(token5e) 
        .scale(0.3)
        .opacity(1)
    .play();
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
 }
