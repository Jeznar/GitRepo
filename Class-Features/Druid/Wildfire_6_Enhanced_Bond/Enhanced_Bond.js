const MACRONAME = "Wildfire-6th:Enhanced_Bond.js"
/*****************************************************************************************
 * Wildfire Druid 6th Level Ability,  based very much on my rewrite of Hex, which 
 * borrowed heavily from Crymic's code
 * 
 * 03/15/22 Creation of Macro
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
//if (args[0] === "off") await doOff();                   // DAE removal
//if (args[0] === "on") await doOn();                     // DAE Application
//if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
//if (args[0] === "each") doEach();					    // DAE removal
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
    //let rc = await familiarPresent()
    //jez.log("Returned value from seach for familiar:", rc)
    if (!await familiarPresent()) {
        jez.log("Familiar is not present, sorry, no special effects")
        return{};
    }
    //---------------------------------------------------------------------------------------------
    // Make sure something was targeted (return a null function if not) and then point at the first 
    // token.
    //
    if (args[0].targets.length === 0) return {}
    const tToken = canvas.tokens.get(args[0].targets[0].id); 
    jez.log("tToken", tToken)
    //---------------------------------------------------------------------------------------------
    // If action type was "heal" return a proper healing function
    //
    if (aItem.data.actionType === "heal") {
        runVFX("heal", tToken) 
        jez.log("Healing detected", aItem.data.actionType)
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
    jez.log("MINION", MINION)
    //jez.log('Familar name being searched for', MINION)
    for (let critter of game.scenes.viewed.data.tokens) {
        //jez.log(` Creature ${i++}`, critter.data.name);
        jez.log(`critter ${critter.name}`,critter)
        if (critter.data.name === MINION) {
            jez.log("heading on back from function familiarPresent() with TRUE")
            if (critter._actor.data.data.attributes.hp.value > 0) return(true)
        }
    }
    jez.log(`Could not find active ${MINION} in the current scene, returning FALSE`)
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