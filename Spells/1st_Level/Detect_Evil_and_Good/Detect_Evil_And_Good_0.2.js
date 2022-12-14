const MACRONAME = "Detect_Evil_And_Good.0.2"
/*****************************************************************************************
 * Create and manage an aura on the casting token to represent the detction effect area
 * 
 * 12/27/21 0.1 Creation of Macro
 * 12/31/21 0.2 Generalization Effort
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;

log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME} or ${MACRO}`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

let gameRound = game.combat ? game.combat.round : 0;

let msg = "";
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro

const lastArg = args[args.length - 1];
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;

const VFX_NAME  = `${MACRO}-${aToken.id}`
const VFX_LOOP = "modules/jb2a_patreon/Library/TMFX/Radar/Circle/RadarPulse_02_Circle_Slow_500x500.webm"
const VFX_OPACITY = 0.4;
const VFX_SCALE = 2.85;

log("------- Obtained Global Values -------",
    `Active Token (aToken) ${aToken.name}`, aToken,
    `Active Actor (aActor) ${aActor.name}`, aActor,
    `Active Item (aItem) ${aItem.name}`, aItem,
    `VFX_NAME`, VFX_NAME);

//-------------------------------------------------------------------------------
// Depending on where invoked call appropriate function to do the work
//
// if (args[0]?.tag === "OnUse") doOnUse();   			    // Midi ItemMacro On Use
if (args[0] === "on") doOn();          		        // DAE Application
if (args[0] === "off") doOff();        			    // DAE removal
// if (args[0] === "each") doEach();					    // DAE removal
//if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus

log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
return;
/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

 /***************************************************************************************
 * Perform the code that runs when this macro is added by DAE, set On
 ***************************************************************************************/
  async function doOn() {
    const FUNCNAME = "doOn()";
    log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    log("effects", Sequencer.EffectManager.getEffects());

    new Sequence()
    .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)  
        .persist()
        .name(VFX_NAME)         // Give the effect a uniqueish name
    .play()

    log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
 
 /***************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    log("effects", Sequencer.EffectManager.getEffects());

    // Sequencer.EffectManager.endEffects({ name: "test_effect", object: token })
    await Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken._object });
    // Sequencer.EffectManager.endEffects({ name: aToken.data.name })
    log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/****************************************************************************************
* DEBUG Logging
* 
* If passed an odd number of arguments, put the first on a line by itself in the log,
* otherwise print them to the log seperated by a colon.  
* 
* If more than two arguments, add numbered continuation lines. 
***************************************************************************************/
function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    }
}

/****************************************************************************************
 * Tricksy little sleep implementation
 ***************************************************************************************/
 async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
