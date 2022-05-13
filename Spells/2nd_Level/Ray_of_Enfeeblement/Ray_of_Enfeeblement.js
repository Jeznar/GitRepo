const MACRONAME = "Ray_of_Enfeeblement"
/*****************************************************************************************
 * Implement Ray of Enfeeblement
 * 
 * 02/18/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
// but only for OnUse invocation.
if ((args[0]?.tag === "OnUse") && !preCheck()) {
    console.jez.log(errorMsg)
    ui.notifications.error(errorMsg)
    return;
}
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        ui.notifications.warn(msg)
        jez.log(msg)
        return(false);
    }
    return (true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
// COOL-THING: Performs saving throw each round, removes effect on save.
async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("A place for things to be done");
    const SAVE_DC = args[1]
    const SAVE_TYPE = "con"
    const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to end 
        <b>${aItem.name}'s effect.</b>`;
    //----------------------------------------------------------------------------------------
    // Perform the saving throw
    //
    let save = await aToken.actor.rollAbilitySave(SAVE_TYPE,{flavor:FLAVOR, chatMessage:true, fastforward:true});
    if (save.total < SAVE_DC) {
        jez.log(`${aToken.name} failed: ${SAVE_TYPE} ${save.total} vs DC${SAVE_DC}`)
        msg = `${aToken.name} fails to clear effect of ${aItem.name} and is still doing half damage with strength based weapons.<br><br>
        <b>FoundryVTT:</b> Manually handled.`
        jez.log("postmessage before")
        jez.postMessage({color:"darkred", fSize:14, msg:msg, title:`${aItem.name} effect remains`, token:aToken, icon:aActor.img})
        jez.log("postmessage after")

    } else {
        jez.log(`${aToken.name} saved: ${SAVE_TYPE} ${save.total} vs DC${SAVE_DC}`)
        const EFFECT_NAME = "Ray of Enfeeblement"
        jez.log(`Attempt to remove ${EFFECT_NAME} from ${aToken.name}.`)
        let effectObj = aActor.effects.find(i => i.data.label === EFFECT_NAME);
        if (effectObj) {
            jez.log(`Attempting to remove ${effectObj.id} from ${aActor.uuid}`)
            MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: aActor.uuid, effects: [effectObj.id] });
        }
        msg = `${aToken.name} shook off the effects of ${aItem.name} and is no longer doing half damage with strength based weapons.`
        jez.postMessage({color:"purple", fSize:14, msg:msg, title:`${aItem.name} effect removed`, token:aToken, icon:aActor.img})
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)

    runVFX(aToken, tToken)

    msg = `${tToken.name} has been <b>enfeebled</b>.  It does 1/2 damage with strength based weapons while 
    affected by ${aItem.name}.<br><br><b>FoundryVTT</b>: This must be handled manually.`
    
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, {color:"purple", fSize:15, msg:msg, tag:"saves" })

    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Display the VFX for the beam
 ***************************************************************************************************/
async function runVFX(token1, token2) {
    jez.log(`token1 ${token1.name}`, token1)
    jez.log(`token2 ${token2.name}`, token2)
    const VFX_OPACITY = 1.0;
    const VFX_SCALE = 1.0;
    const VFX_NAME = `${MACRO}`
    //----------------------------------------------------------------------------------------------
    // Pick a color based on a color string found in the icon's name.
    // Available VFX colors: blue, blueyellow, green, purpleteal
    // Recognized  strings: blue, yellow (blueyellow), green, teal (purpleteal), magenta (purpleteal)
    let color = "green"
    const IMAGE = aItem.img.toLowerCase()
    if (IMAGE.includes("yellow")) color = "blueyellow"
    else if (IMAGE.includes("blue")) color = "blue"
    else if (IMAGE.includes("green")) color = "green"
    else if (IMAGE.includes("teal")) color = "purpleteal"
    else if (IMAGE.includes("magenta")) color = "purpleteal"
    else if (IMAGE.includes("orange")) color = "orange"
    else if (IMAGE.includes("purple")) color = "purple"
    //jez.log(`Color ${color}`)
    //----------------------------------------------------------------------------------------------
    // Pick distance category to be used.
    //
    let distance = canvas.grid.measureDistance(token1, token2).toFixed(1);
    jez.log(`Distance between ${token1.name} and ${token2.name} is ${distance}.`)
    let distCategory = "05ft_600x400"
    if (distance > 15) distCategory = "15ft_1000x400"
    if (distance > 30) distCategory = "30ft_1600x400"
    if (distance > 45) distCategory = "45ft_2200x400"
    if (distance > 60) distCategory = "60ft_2800x400"
    if (distance > 90) distCategory = "90ft_4000x400"
    //jez.log(`distance category ${distCategory}`) 
    //----------------------------------------------------------------------------------------------
    // Apply the effect
    //
    //modules/jb2a_patreon/Library/Cantrip/Ray_Of_Frost/RayOfFrost_01_Regular_Green_30ft_1600x400.webm
    const ROOT = "modules/jb2a_patreon/Library/Cantrip/Ray_Of_Frost/RayOfFrost_01_Regular"
    const VFX_STRING = `${ROOT}_${color}_${distCategory}.webm`
    jez.log(`VFX File Name: ${VFX_STRING}`)
    new Sequence()
    .effect()
        .atLocation(token1)
        .stretchTo(token2)
        .file(VFX_STRING)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        //.duration(4000)
        .name(VFX_NAME)         // Give the effect a uniqueish name
    .play();
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("ToDo: If further automation (wrapping the damage) is done, this is the function that")
    jez.log("should be used to reverse the creativity of doOn() call.")
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }
  
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("ToDo: To further automate this, this macro could: Edit all damage formulae to be wrapped in");
    jez.log("floor(x/2) per Flix on Foundry Discord.  This would require checking all of the damaging");
    jez.log("abilities, filtering them to just the STR based versions and then do the edit wrap.");
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}