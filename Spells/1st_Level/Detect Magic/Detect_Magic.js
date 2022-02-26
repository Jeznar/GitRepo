const MACRONAME = "Detect_Magic"
/*****************************************************************************************
 * Create and manage an aura on the casting token to represent the detction effect area
 * 
 * 02/17/22 0.1 Creation from Detect_Evil_And_Good.0.2
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;

jez.log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME} or ${MACRO}`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

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
const VFX_LOOP = "modules/JB2A_DnD5e/Library/1st_Level/Detect_Magic/DetectMagicCircle_01_Regular_Blue_1200x1200.webm"
//const VFX_LOOP = "modules/jb2a_patreon/Library/TMFX/Radar/Circle/RadarPulse_02_Circle_Slow_500x500.webm"
const VFX_OPACITY = 0.3;
const VFX_SCALE = 1.15;

jez.log("------- Obtained Global Values -------",
    `Active Token (aToken) ${aToken.name}`, aToken,
    `Active Actor (aActor) ${aActor.name}`, aActor,
    `Active Item (aItem) ${aItem.name}`, aItem,
    `VFX_NAME`, VFX_NAME);

//-------------------------------------------------------------------------------
// Depending on where invoked call appropriate function to do the work
//
if (args[0] === "on") doOn();          		        // DAE Application
if (args[0] === "off") doOff();        			    // DAE removal

jez.log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
return;
/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************
 * Perform the code that runs when this macro is added by DAE, set On
 ***************************************************************************************/
  async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

    jez.log("effects", Sequencer.EffectManager.getEffects());

    new Sequence()
    .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)  
        .persist()
        .name(VFX_NAME)         // Give the effect a uniqueish name
    .play()

    jez.log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
 
 /***************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

    jez.log("effects", Sequencer.EffectManager.getEffects());

    // Sequencer.EffectManager.endEffects({ name: "test_effect", object: token })
    await Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken._object });
    // Sequencer.EffectManager.endEffects({ name: aToken.data.name })
    jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}
