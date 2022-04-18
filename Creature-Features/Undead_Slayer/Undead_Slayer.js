const MACRONAME = "Undead_Slayer.js"
/*****************************************************************************************
 * Rudolph Van Richten's special ability:
 * 
 *   When a weapon attack hits an undead, the undead takes an extra 10 (3d6) damage of 
 *   the weapon’s type.
 * 
 * This will be implmented with a DamageBonus macro.
 * 
 * 04/18/22 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]   // Trim of the version number and extension
const ABILITY_NAME = "Undead Slayer"
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item;
    else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
if (args[0]?.tag === "DamageBonus") return (doBonusDamage());    // DAE Damage Bonus
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro BonusDamage
 ***************************************************************************************************/
async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    let numDice = 3
    const DIE_TYPE = "d6"
    let dmgType = "";
    jez.log(`-------------- Starting --- ${MACRONAME} --- ${FUNCNAME} -----------------`);
    //---------------------------------------------------------------------------------------------
    // Make sure something was targeted (return a null function if not) 
    //
    if (args[0].targets.length !== 1) return {}
    const tToken = canvas.tokens.get(args[0].targets[0].id); 
    jez.log("tToken",tToken)
    //---------------------------------------------------------------------------------------------
    // Is the target an undead? (return a null function if not) 
    //
    let race = jez.getRace(tToken.document)
    if (race.includes("undead")) jez.log("continuing..."); else return {}; 
    //---------------------------------------------------------------------------------------------
    // If action type wasn't a weapon attack (mwak or rwak) then return a null function
    //
    let actionType = aItem.data.actionType
    if (actionType==="rwak" || actionType==="mwak") jez.log("continuing......"); else return {};
    //---------------------------------------------------------------------------------------------
    // If triggering attack was a critical, double the number of damage dice.
    //
    if (args[0].isCritical) numDice =  numDice *2
    //---------------------------------------------------------------------------------------------
    // Obtain the type of damage inflicted for application of extra damage.
    //
    dmgType = aItem.data.damage.parts[0][1]
    //---------------------------------------------------------------------------------------------
    // run a VFX on the target for a bit of sizzle
    //
    runVFX(dmgType, tToken) 
    //---------------------------------------------------------------------------------------------
    // Return yhe damage function for application
    //
    return {
        damageRoll: `${numDice}${DIE_TYPE}[${dmgType}]`,
        flavor: `(${ABILITY_NAME} - ${CONFIG.DND5E.damageTypes[dmgType]})`,
        damageList: args[0].damageList, itemCardId: args[0].itemCardId
    };
}
/***************************************************************************************************
 * Play the VFX for the fire effect, type is "heal" or "fire" and nothing else
 ***************************************************************************************************/
 async function runVFX(type, token5e) {
    await jez.wait(500)
    new Sequence()
    .effect()
        .file("jb2a.healing_generic.burst.bluewhite")
        .atLocation(token5e) 
        .scale(0.2)
        .opacity(1)
    .play();
 }
