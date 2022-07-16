const MACRONAME = "Dancing_Lights.0.3.js"
/*****************************************************************************************
 * Summon 4 dancing lights with WarpGate
 * 
 * 05/13/22 0.1 Creation of Macro
 * 06/06/22 0.2 Chasing player can't summon with warpgate issue.  Fix was granting players
 *              permission to browse files in the player permissions within FoundryVTT.
 * 07/15/22 0.3 Convert to use jez.warpCrosshairs
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
let msg = "";
const TL = 0;
const SUMMON_PREFIX = "%Dancing_Light_"
const SUMMON_POSTFIX = "%"
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "off") await doOff();             // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let lightIdArray = []
    for (let i = 1; i <= 4; i++) {
        const COLOR = pickColor();
        jez.log(`${i} Color`, COLOR)
        const SIDEBAR_NAME = `${SUMMON_PREFIX}${COLOR}${SUMMON_POSTFIX}`
        lightIdArray.push(await summonCritter(SIDEBAR_NAME, i, COLOR))
    }
    jez.log("LightID", lightIdArray)
    //--------------------------------------------------------------------------------------
    // Modify the concentrating effect to delete the Bonfire on termination
    //
    modConcentratingEffect(aToken, lightIdArray)
    //--------------------------------------------------------------------------------------
    // Post completion message
    //
    let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
    msg = `<b>${aToken.name}</b> summons 4 lights...As a bonus action on your turn, you can 
    move the lights up to 60 feet to a new spot within range. A light must be within 20 feet 
    of another light created by this spell and remain in range.`
    await jez.addMessage(chatMessage, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" })
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Summon the actor and rename with a numeric suffix
 * 
 * https://github.com/trioderegion/warpgate
 ***************************************************************************************************/
async function summonCritter(summons, number, color) {
  jez.log(`summonCritter(${summons}, ${number}, ${color})`)
  let name = `${aToken.name}'s Dancing Light ${number}`
  let updates = { 
      actor: {name: name},    
      token: {name: name},
  }
  const OPTIONS = { controllingActor: aActor };
  const CALLBACKS = {
    pre: async (template) => {
      jez.log(`Calling preEffects(template, color)`,"template",template,"color")
      preEffects(template, color);
      await warpgate.wait(500);
    },
    post: async (template, token) => {
      jez.log(`Calling postEffects(template, color)`,"template",template,"color")
      postEffects(template, color);
      await warpgate.wait(500);
      //greetings(template, token);
    }
  };
  const MINION = summons
  //-----------------------------------------------------------------------------------------------
  // Get and set maximum sumoning range
  //
  const ALLOWED_UNITS = ["", "ft", "any"];
  if (TL > 1) jez.trace("ALLOWED_UNITS", ALLOWED_UNITS);
  const MAX_RANGE = jez.getRange(aItem, ALLOWED_UNITS) ?? 120
  //-----------------------------------------------------------------------------------------------
  // Obtan location for spawn
  //
  let summonData = game.actors.getName(MINION)
  if (TL > 1) jez.trace("summonData", summonData);
  let {x,y} = await jez.warpCrosshairs(aToken, MAX_RANGE, summonData.img, aItem.name, {}, -1)
  // let {x,y} = await jez.warpCrosshairs(aToken, MAX_RANGE, summonData.img, aItem.name, {width:2},1, { traceLvl: TL })
  //-----------------------------------------------------------------------------------------------
  // Suppress Token Mold for a wee bit
  //
  jez.suppressTokenMoldRenaming(1000)
  await jez.wait(75)
  //-----------------------------------------------------------------------------------------------
  // Return while executing the summon
  //
  return (await warpgate.spawnAt({x,y}, MINION, updates, CALLBACKS, OPTIONS));
  // jez.log(`await warpgate.spawn(summons, updates, CALLBACKS, OPTIONS)`,"summons",summons,"updates",updates,"CALLBACKS",CALLBACKS,"OPTIONS",OPTIONS)
  // return(await warpgate.spawn(summons, updates, CALLBACKS, OPTIONS))
}
/***************************************************************************************************
 * Randomly pick a color for the next dancing light
 ***************************************************************************************************/
 function pickColor() {
    let ColorArray = ["BlueTeal", "BlueYellow", "Green", "Pink", "Purple", "Red", "Yellow"]
    // Returns a random integer from 0 to 6:
    let INDEX = Math.floor(Math.random() * 7);
    return(ColorArray[INDEX])
  }
/***************************************************************************************************
 * 
 ***************************************************************************************************/
 async function preEffects(template, color) {
  const PREFIX ="modules/jb2a_patreon/Library/Generic/Explosion/Explosion_"
  const POSTFIX = "_400x400.webm"
  let colorString = "03_Dark_BlueWhite"
  if (color === "BlueYellow") colorString = "03_Regular_BlueYellow"
  else if (color === "Green") colorString = "01_Green"
  else if (color === "Pink") colorString = "03_Regular_Pink"
  else if (color === "Purple") colorString = "04_Dark_Purple"
  else if (color === "Red") colorString = "03_Regular_Red"
  else if (color === "Yellow") colorString = "01_Yellow"
  const VFX_FILE = `${PREFIX}${colorString}${POSTFIX}`
  jez.log("VFX File",VFX_FILE)
  new Sequence()
    .effect()
    .file(VFX_FILE)
    .atLocation(template)
    .center()
    .scale(0.7)
    .play()
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
 async function postEffects(template, color) {
  const PREFIX ="jb2a.smoke.puff.centered."
  const POSTFIX = `.${Math.floor(Math.random() * 3)}`
  let colorString = "grey"
  jez.log("color", color)
  if (color === "BlueYellow") colorString = "blue"
  else if (color === "Green") colorString = "dark_green"
  else if (color === "Pink") colorString = "grey"
  else if (color === "Purple") colorString = "blue"
  else if (color === "Red") colorString = "dark_black"
  else if (color === "Yellow") colorString = "grey"
  const VFX_FILE = `${PREFIX}${colorString}${POSTFIX}`
  jez.log("VFX File",VFX_FILE)
  new Sequence()
    .effect()
      .file(VFX_FILE)
      .atLocation(template)
      .center()
      .scale(0.7)
    .play()
}
/***************************************************************************************************
 * Modify existing concentration effect to call ItemMacro with ID's of lights to despawn on removal
 ***************************************************************************************************/
 async function modConcentratingEffect(aToken, idArray) {
    //----------------------------------------------------------------------------------------------
    // Seach the casting token to find the just added concentration effect
    //
    //await jez.wait(200)
    let effect = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to concentartion effect. In this case, a macro that will be
    // given arguments: idArray[0]...idArray[3]
    //    
    effect.data.changes.push({key: `macro.itemMacro`, mode: jez.CUSTOM, 
        value:`${idArray[0]} ${idArray[1]} ${idArray[2]} ${idArray[3]}`, priority: 20})
    jez.log(`effect.data.changes`, effect.data.changes)
    //----------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes });
    if (result) jez.log(`Active Effect "Concentrating" updated!`, result);
}
/***************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    //--------------------------------------------------------------------------------------
    // Delete the existing dancing lights
    //
    let sceneId = game.scenes.viewed.id
    for (let i = 1; i <= 4; i++) {
        jez.log(`Deleting light #${i}`, args[i])
        await jez.wait(500)
        warpgate.dismiss(args[i], sceneId)
    }
    jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}