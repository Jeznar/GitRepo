const MACRONAME = "Morning_Amulet.js"
/*****************************************************************************************
 * Implments a bit of VFX and a message for Morning Amulet which is largely manual.
 * 
 * 06/02/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
//---------------------------------------------------------------------------------------
// Set some global variables and constants
//
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//---------------------------------------------------------------------------------------
// See https://gitlab.com/tposney/dae#lastarg for info on what is included in lastArg
//
const VFX_NAME  = `${MACRO}-${aToken.id}`
const VFX_INTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_01_Regular_Red_Intro_400x400.webm"
const VFX_LOOP  = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Red_Loop_400x400.webm";
const VFX_OUTRO = "modules/jb2a_patreon/Library/1st_Level/Shield/Shield_03_Regular_Red_OutroExplode_400x400.webm";
const VFX_OPACITY = 0.7;
const VFX_SCALE = 1.9;
const EFFECT = MACRO;
//---------------------------------------------------------------------------------------
// Do something Useful
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "on") doOn();          		    // DAE Application
if (args[0] === "off") doOff();        			    // DAE removal
//---------------------------------------------------------------------------------------
// That's all folks
//
jez.log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
return;
/****************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let existingEffect = await aToken.actor.effects.find(i => i.data.label === EFFECT);
    if (existingEffect) {
        msg = `<b>${aToken.name}</b> is no longer benefitted by the <b>Mourning Amulet</b>`
        await existingEffect.delete()
        postResults(msg)
        return
    }
    else {
        const GAME_RND = game.combat ? game.combat.round : 0;
        let effectData = {
            label: EFFECT,
            icon: aItem.img,
            origin: aToken.uuid,
            disabled: false,
            flags: { dae: { itemData: aItem } },
            duration: { rounds: 100, seconds: 600, startRound: GAME_RND, startTime: game.time.worldTime },
            changes: [
                { key: `macro.itemMacro`, mode: jez.CUSTOM, value: 40, priority: 20 },
            ]
        };
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
        msg = `A shimmering second skin appears around <b>${aToken.name}</b>.`
        postResults(msg)
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}

/***************************************************************************************
 * Perform the steps that runs when this macro is executed by DAE to add to target
 ***************************************************************************************/
 async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
    jez.runRuneVFX(aToken, jez.getSpellSchool(aItem), "red")
    new Sequence()
    .effect()
        .file(VFX_INTRO)
        .attachTo(aToken)
        .scaleToObject(VFX_SCALE)
        .opacity(VFX_OPACITY)           
        .waitUntilFinished(-500) // Negative wait time (ms) clips the effect to avoid fadeout
    .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .scaleToObject(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(true)  
        .persist()
        .name(VFX_NAME)         // Give the effect a uniqueish name
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
        .scaleToObject(VFX_SCALE)
        .opacity(VFX_OPACITY)  
        .attachTo(aToken)
    .play()

    jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}