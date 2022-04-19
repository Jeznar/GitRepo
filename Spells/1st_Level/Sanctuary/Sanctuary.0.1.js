const MACRONAME = "Sanctuary.0.1"
/*****************************************************************************************
 * This spell macro built from a Shield_of_Faith.0.1
 * 
 * JB2A Effects can be viewed at: https://www.jb2a.com/Library_Preview/
 * 
 * 01/23/22 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME} or ${MACRO}`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

//---------------------------------------------------------------------------------------
// See https://gitlab.com/tposney/dae#lastarg for info on what is included in lastArg
//
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
const LAST_ARG = args[args.length - 1];
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const VFX_NAME  = `${MACRO}-${aToken.id}`
const VFX_INTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_01_Regular_Blue_Intro_400x400.webm"
const VFX_LOOP  = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Blue_Loop_400x400.webm";
const VFX_OUTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Blue_OutroExplode_400x400.webm";
let msg = "";

jez.log("------- Obtained Global Values -------",
    `Active Token (aToken) ${aToken.name}`, aToken,
    `Active Item (aItem) ${aItem.name}`, aItem);

//---------------------------------------------------------------------------------------
// Do something Useful
//
if (args[0] === "on") doOn();          		// DAE Application
if (args[0] === "off") doOff();        		// DAE removal
if (args[0]?.tag === "OnUse") doOnUse();    // Midi ItemMacro On Use


//---------------------------------------------------------------------------------------
// That's all folks
//
jez.log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    // https://www.w3schools.com/tags/ref_colornames.asp

    const SPELL_DC = aActor?.data?.data?.attributes?.spelldc;
    let chatMessage = game.messages.get(args[args.length - 1].itemCardId);

    msg = `Any creature who targets <b>${tToken.name}</b> with an attack or a harmful spell must 
           first make a <b>DC${SPELL_DC} Wisdom</b> saving throw, or it must choose a new target, 
           or lose the attack or spell.`
    jez.addMessage(chatMessage,{color:"blue",fSize:14,msg:msg,tag:"saves"})

    // https://www.w3schools.com/tags/ref_colornames.asp

    
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}

/***************************************************************************************
 * Perform the steps that runs when this macro is executed by DAE to add to target
 * 
 * Sequencer Examples at:
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/blob/master/README.md
 ***************************************************************************************/
 async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

    new Sequence()
    .effect()
        .file(VFX_INTRO)
        .attachTo(aToken)
        .scale(0.5)
        .opacity(0.5)           
        .waitUntilFinished(-500) // Negative wait time (ms) clips the effect to avoid fadeout
    .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .scale(0.5)
        .opacity(1.0)  
        .belowTokens()
        .persist()
        .name(VFX_NAME)      // Give the effect a uniqueish name
        .fadeIn(300)            // Fade in for specified time in milliseconds
        .fadeOut(300)           // Fade out for specified time in milliseconds
        .extraEndDuration(800)  // Time padding on exit to connect to Outro effect
    .play()

    jez.log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

 /***************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************/
  async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });

    new Sequence()
    .effect()
        .file(VFX_OUTRO)
        .scale(0.5)
        .opacity(0.5)  
        .attachTo(aToken)
    .play()

    jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

