const MACRONAME = "Flamestrike.0.1.js"
/*****************************************************************************************
 * All this macro needs is a runVFX function triggered as an OnUse ItemMacro
 * 
 * 08/05/22 0.1 Creation of Macro by copying fireball
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
const TEMPLATE_ID = args[0].templateId
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg, color) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    //jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    jez.addMessage(chatMsg, { color: `dark${color}`, fSize: 14, msg: msg, tag: "saves" });

}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    // COOL-THING: Set color for fireball based on keyword in image name
    //
    let color = ""
    const IMAGE = aItem.img.toLowerCase()
    if(IMAGE.includes("orange")) color = "orange"
    else if(IMAGE.includes("blue")) color = "blue"
    else if(IMAGE.includes("purple")) color = "purple"
    else if(IMAGE.includes("red")) color = "orange"
    else if(IMAGE.includes("eerie")) color = "blue"
    else if(IMAGE.includes("sky")) color = "blue"
    else if(IMAGE.includes("acid")) color = "purple"
    if (!color) color = "orange"
    runVFX(aToken, color)
    // https://www.w3schools.com/tags/ref_colornames.asp
    msg = `${aToken.name}'s fireball burst in a ball of ${color} flames`
    postResults(msg, color)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Allowed Colors: orange, blue, purple
 ***************************************************************************************************/
// COOL-THING: Run the VFX -- Beam from originator to the target
async function runVFX(token1, color) {
    const COLOR = color.charAt(0).toUpperCase() + color.slice(1);
    const FUNCNAME = "runVFX(COLOR)";
    const VFX_BOLT = `modules/jb2a_patreon/Library/3rd_Level/Fireball/FireballBeam_01_${COLOR}_30ft_1600x400.webm`
    const VFX_BURST = `modules/jb2a_patreon/Library/3rd_Level/Fireball/FireballExplosion_01_${COLOR}_800x800.webm`
    const VFX_SMOKE = `modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Regular_Grey_400x400.webm`
    const VFX_OPACITY = 0.8;
    const VFX_SCALE = 0.55;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let templateCenter = canvas.templates.objects.children.find(i => i.data._id === TEMPLATE_ID).center;
    jez.log("templateCenter",templateCenter)
    canvas.templates.get(TEMPLATE_ID).document.delete()
    new Sequence()
    .effect()
        .file(VFX_BOLT)
        .atLocation(token1) 
        .stretchTo(templateCenter)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .waitUntilFinished(-500) 
    .effect()
        .file(VFX_BURST)
        .atLocation(templateCenter)
        .scale(VFX_SCALE*1.2)
        .opacity(VFX_OPACITY)
        .waitUntilFinished(-1200) 
    .effect()
        .file(VFX_SMOKE)
        .scale(VFX_SCALE*1.5)
        .opacity(VFX_OPACITY)
        .atLocation(templateCenter)
        .waitUntilFinished(-1000) 
    .effect()
        .file(VFX_SMOKE)
        .scale(VFX_SCALE*2.5)
        .opacity(VFX_OPACITY*0.75)
        .atLocation(templateCenter)
        .waitUntilFinished(-1000) 
    .effect()
        .file(VFX_SMOKE)
        .scale(VFX_SCALE*3.5)
        .opacity(VFX_OPACITY*0.50)
        .atLocation(templateCenter)
        .waitUntilFinished(-1000) 
    .play();
}