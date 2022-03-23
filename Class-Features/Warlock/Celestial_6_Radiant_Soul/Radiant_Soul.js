const MACRONAME = "Celestial_6th:Radiant_Soul.js"
/*****************************************************************************************
 * Wildfire Druid 6th Level Ability,  based very much on my rewrite of Hex, which 
 * borrowed heavily from Crymic's code
 * 
 * 03/15/22 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]   // Trim of the version number and extension
const ABILITY_NAME = "Radiant Soul"
const FLAG = MACRO                      // Name of the DAE Flag  
const MIN_LVL = 6    
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
let msg = "";

//------------------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
//if ((args[0]?.tag === "OnUse") && !preCheck()) return;
//------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "DamageBonus") return (doBonusDamage());    // DAE Damage Bonus
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
function postResults() {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro BonusDamage
 ***************************************************************************************************/
async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    const NUM_DICE = 1
    const DIE_TYPE = "d8"
    let dmgType = "";
    jez.log(`-------------- Starting --- ${MACRONAME} --- ${FUNCNAME} -----------------`);
    //---------------------------------------------------------------------------------------------
    // Make sure the user is at least a level ${MIN_LVL} warlock of subclass celestial
    //
    if (aToken.actor.data.data.classes?.warlock?.levels < MIN_LVL) {
        msg = `<b>${aToken.name}</b> is a level "${aToken.actor.data.data.classes?.warlock?.levels}" 
        warlock, must be at least level ${MIN_LVL} for <b>${ABILITY_NAME}</b> to be used.`
        jez.postMessage({color: "dodgerblue", fSize: 14, icon: aToken.data.img, msg: msg, 
                title: `${aToken.name} is not a Lvl ${MIN_LVL}+ Warlock`, token: aToken})
        return {}
    }
    if (aToken.actor.data.data.classes?.warlock?.subclass.toLowerCase() !== "celestial") {
        msg = `<b>${aToken.name}</b> is subclass "${aToken.actor.data.data.classes?.warlock?.subclass}", 
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
    jez.log("tToken", tToken)
    //---------------------------------------------------------------------------------------------
    // If action type wasn't a spell attack (msak or rsak) then return a null function
    //
    let actionType = aItem.data.actionType
    jez.log("actionType", actionType)
    if (actionType==="rsak" || actionType==="msak" || actionType==="save" ) jez.log("continuing...")
    else return {};
    //if (!["sak"].some(actionType => (aItem.data.actionType || "").includes(actionType))) return {};
    //---------------------------------------------------------------------------------------------
    // If the attack didn't have a type of "fire" or "radiant" then return a null function, 
    // otherwise send back a valid extra damage function.
    //
    jez.log("Checking for fire or radiant danage")
    for(const damageLine of aItem.data.damage.parts) {
        jez.log("Damage Line", damageLine )
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
 async function runVFX(type, token5e) {
    let vfxEffect = ""
    switch (type) {
        case "radiant": vfxEffect = "jb2a.template_circle.out_pulse.02.burst.tealyellow"; break
        case "fire": vfxEffect = "jb2a.explosion.01.orange"; break
        default: return
    }
    jez.log("vfxEffect",vfxEffect)
    await jez.wait(2000)
    new Sequence()
    .effect()
        .file(vfxEffect)
        .atLocation(token5e) 
        .scale(0.3)
        .opacity(1)
    .play();
 }
