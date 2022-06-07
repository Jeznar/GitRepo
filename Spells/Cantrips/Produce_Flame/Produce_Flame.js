const MACRONAME = "Produce_Flame.0.3.js"
/*****************************************************************************************
 * Produce Flame!
 * 
 * Originally from Crymic's macro that was themed after Kandashi's create item macro.  It 
 * now uses a helper macro from the Items directory that is copied to the actor.
 * 
 * 06/06/22 0.2 Conversion of Crymic code to my style (sort of) and FoundryVTT 9.x 
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
 jez.log(`============== Starting === ${MACRONAME} =================`);
 for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
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
 const TEMPLATE_NAME = "%%Flame%%"
 const TEMP_SPELL_NAME = `${aToken.name}'s Flame`
 const VFX_NAME = `${aToken.name} Flame`
 //----------------------------------------------------------------------------------
 // Run the main procedures, choosing based on how the macro was invoked
 //
 if (args[0] === "off") await doOff();                   // DAE removal
 if (args[0] === "on") await doOn();                     // DAE Application
 if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
 jez.log(`============== Finishing === ${MACRONAME} =================`);
 /***************************************************************************************************
  *    END_OF_MAIN_MACRO_BODY
  *                                END_OF_MAIN_MACRO_BODY
  *                                                             END_OF_MAIN_MACRO_BODY
  ***************************************************************************************************
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
  msg = `<b>${aToken.name}</b> has produced a flame that emits light until thrown at a target, by 
  using temporary innate spell, "<b>${TEMP_SPELL_NAME}</b>," which can be found in his/her spell book.`
  postResults(msg)
  jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
  return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //do { } while (await jez.itemDeleteFromActor(aToken, TEMP_SPELL_NAME, "spell"));
    await jez.deleteItems(TEMP_SPELL_NAME, "spell", aToken);
    runVFX(aToken)
    await aToken.document.update({ "dimLight": 20, "brightLight": 10, "lightAlpha": 0.25, "lightColor": "#f7c597", lightAnimation: { intensity: 4, speed: 5, type: "torch" } });
    await jez.itemAddToActor(aToken, TEMPLATE_NAME)
    let itemUpdate = {
        name: TEMP_SPELL_NAME,
        // data: { description: { value: "Shazam"}}  // Forces value of description text to "Shazam"
    }
    await jez.itemUpdateOnActor(aToken, TEMPLATE_NAME, itemUpdate, "spell")
    msg = `Added One Time Use Spell: "${TEMP_SPELL_NAME}"`      // Set notification message
    ui.notifications.info(msg);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
async function doOff() {
  const FUNCNAME = "doOff()";
  jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
  await aToken.document.update({ "dimLight": 0, "brightLight": 0, "lightColor": "" });
  //do {} while (await jez.itemDeleteFromActor(aToken, TEMP_SPELL_NAME, "spell"));
  await jez.deleteItems(TEMP_SPELL_NAME, "spell", aToken);
  jez.log("end VFX_NAME", VFX_NAME)
  Sequencer.EffectManager.endEffects({ name: VFX_NAME });
  //Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });

  jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
  return;
}
/***************************************************************************************************
 * Run VFX
 ***************************************************************************************************/
 function runVFX(target) {
  let color = ""
  const IMAGE = aItem.img.toLowerCase()
  if (IMAGE.includes("blue")) color = "blue"
  else if (IMAGE.includes("green")) color = "green"
  else if (IMAGE.includes("orange")) color = "orange"
  else if (IMAGE.includes("purple")) color = "purple"
  else if (IMAGE.includes("magenta")) color = "purple"
  else if (IMAGE.includes("sky")) color = "blue"
  else if (IMAGE.includes("royal")) color = "green"
  if (!color) color = "orange"

  new Sequence()
      .effect()
      //.file("jb2a.fire_bolt.orange")
      .file(`jb2a.flames.01.${color}`)
      //.duration(10000)
      .persist()
      .opacity(0.60)
      .name(VFX_NAME)
      .atLocation(target)
      .play()
}