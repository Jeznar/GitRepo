const MACRONAME = "Nightmare_Haunting"
/*****************************************************************************************
 * Applies a debuff to the target that reduces max HP.  No error checking performed,
 * No save is allowed.
 * 
 * 02/18/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
//if (args[0] === "off") await doOff();                   // DAE removal
//if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
//if (args[0] === "each") doEach();					    // DAE removal
//if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)
    //---------------------------------------------------------------------------------------------
    // How much damage does the haunting do?
    //
    const GAME_RND = game.combat ? game.combat.round : 0;
    let damageDetail = await LAST_ARG.damageDetail.find(i=> i.type === "necrotic");
    let damageTotal = (damageDetail.damage-(damageDetail.DR ?? 0))*(damageDetail.damageMultiplier ?? 1);
    //---------------------------------------------------------------------------------------------
    // Launch the visual effect
    //
    runVFX(tToken)
    //---------------------------------------------------------------------------------------------
    // Apply the debuff effect
    //
    let effectData = {
        label: aItem.name,
        icon: aItem.img,
        flags: { dae: { itemData: aItem, stackable: true, macroRepeat: "none"/*, specialDuration: ["longRest"]*/ } },
        origin: aActor.uuid,
        disabled: false,
        duration: { rounds: 999999, startRound: GAME_RND },
        changes: [{ key: "data.attributes.hp.max", mode: ADD, value: -damageTotal, priority: 20 }]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tActor.uuid, effects: [effectData] });
    //---------------------------------------------------------------------------------------------
    // Post message to chat
    //
    // https://www.w3schools.com/tags/ref_colornames.asp
    let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
    msg = `${tToken.name} has been afflicted by ${aItem.name}.  Maximum health has been reduced.`
    jez.addMessage(chatMessage,{color:"darkslategrey",fSize:15,msg:msg,tag:"saves"})
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function runVFX(token1) {
    const VFX_NAME  = `${MACRO}-${aToken.id}`
    const VFX_INTRO = "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/NecromancyRuneIntro_01_Regular_Red_400x400.webm"
    const VFX_LOOP  = "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/NecromancyRuneLoop_01_Regular_Red_400x400.webm";
    const VFX_OUTRO = "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/NecromancyRuneOutro_01_Regular_Red_400x400.webm";
    const VFX_OPACITY = 1.0;
    const VFX_SCALE = 0.3;
// COOL-THING: Intro & Outro VFX
    new Sequence()
    .effect()
        .file(VFX_INTRO)
        .attachTo(token1)
        .scaleIn(0.25, 1000)    // Expand from 0.25 to VFXSCALE size over 1 second
        .rotateIn(180, 1000)    // 1/2 Rotation over 1 second 
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)           
        .waitUntilFinished(-500) // Negative wait time (ms) clips the effect to avoid fadeout
    .effect()
        .file(VFX_LOOP)
        .attachTo(token1)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)  
        .duration(3000)
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(300)            // Fade in for specified time in milliseconds
        .fadeOut(300)           // Fade out for specified time in milliseconds
        //.extraEndDuration(-800)  // Time padding on exit to connect to Outro effect
        .waitUntilFinished(-500) // Negative wait time (ms) clips the effect to avoid fadeout
    .effect()
        .file(VFX_OUTRO)
        .scale(VFX_SCALE)
        .scaleOut(0.25, 1000)   // Contract from VFXSCALE to 0.25 size over 1 second
        .rotateOut(180, 1000)   // 1/2 Counter Rotation over 1 second
        .opacity(VFX_OPACITY)  
        .attachTo(token1)
    .play()
}