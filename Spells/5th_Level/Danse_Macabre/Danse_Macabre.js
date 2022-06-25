const MACRONAME = "Danse_Macabre.0.1.js"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 06/24/22 0.1 Creation of Macro
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
// const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
const SKELETON_NAME = "Skeleton"  // Name of skeleton to call as base item
const ZOMBIE_NAME   = "Zombie"    // Name of zombie to call as base item
const CAST_MOD = jez.getCastMod(aActor)
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
// if (args[0] === "off") await doOff();             // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
  //---------------------------------------------------------------------------------------------------
  // Make sure actors that may be summoned exist and are unique before continuing
  //

  //---------------------------------------------------------------------------------------------------
  // Determine how many critters can be summoned 
  //
  let summonMax = 5 + (LAST_ARG?.spellLevel - 5)*2
  //---------------------------------------------------------------------------------------------------
  // Proceed with the dialog
  //
  dialogSummonUndeads({maxSummons: summonMax})
  return (true);
}
/***************************************************************************************************
 * Called by the dialog after a legal count of zombies and skeletons obtained
 ***************************************************************************************************/
async function doIt(args) {
  let numSkeletons = args?.numSkeletons
  let numZombies = args?.numZombies
  // let summonId
  // let summonIdArray = []
  let summonUuid
  let summonUuidArray = []
  const SCENE_ID = game.scenes.viewed.id
  // jez.log("Inputs to doIt(args)","numSkeletons",numSkeletons,"numZombies",numZombies)
  //---------------------------------------------------------------------------------------------------
  // Spawn in the Skeletons
  //
  for (let i = 1; i <= numSkeletons; i++) {
    // summonId = await summonCritter(SKELETON_NAME, i)
    // summonIdArray.push(summonId)  // Catch the id of summoned token
    // Build UUID for this token, e.g. Scene.MzEyYTVkOTQ4NmZk.Token.MsbMe9mgA23RTjV2
    summonUuid = `Scene.${SCENE_ID}.Token.${summonId}`
    summonUuidArray.push(summonUuid)
  }
  //---------------------------------------------------------------------------------------------------
  // Spawn in the Zombies
  //
  for (let i = 1; i <= numZombies; i++) {
    // summonId = await summonCritter(ZOMBIE_NAME, i)
    // summonIdArray.push(summonId)  // Catch the id of summoned token
    // Build UUID for this token, e.g. Scene.MzEyYTVkOTQ4NmZk.Token.MsbMe9mgA23RTjV2
    summonUuid = `Scene.${SCENE_ID}.Token.${summonId}`
    summonUuidArray.push(summonUuid)
  }
  jez.log("summonIdArray", summonIdArray)
  jez.log("summonUuidArray", summonUuidArray)
  //--------------------------------------------------------------------------------------
  // Modify the conc. effect to delete the summoned creatures on concentration break
  //
  modConcentratingEffect(aToken, "Dismiss_Tokens", summonUuidArray)
  //---------------------------------------------------------------------------------------------------
  // Post completion message
  //
  let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
  msg = `<b>${aToken.name}</b> summons ${numSkeletons.total} ${SKELETON_NAME} and ${numZombies} ${ZOMBIE_NAME}`
  await jez.addMessage(chatMessage, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" })
}
/***************************************************************************************************
 * Dialog to obtain the number of skeletons and zombies to summon, returning an object containing:
 * 
 * @typedef  {Object} returnObj
 * @property {integer} numSkeletons - number of skeletons to summon
 * @property {integer} numZombies - number of zombies to summon
 * @property {integer} maxSummons - maximum number of summons allowed
 * @property {string} tryAgain - Message to display on subsequent attempts
 ***************************************************************************************************/
 async function dialogSummonUndeads(args) {
  //---------------------------------------------------------------------------------------------------
  // Set function specific variables
  //
  let content = ""
  let numSkeletons = args?.numSkeletons ?? 0
  let numZombies = args?.numZombies ?? 0
  let maxSummons = args?.maxSummons ?? 5
  let tryAgain = args?.tryAgain ?? ""
  //---------------------------------------------------------------------------------------------------
  // Build the HTML string for the dialog
  //
  if (tryAgain) content += `
  <p style="color:Red;">${tryAgain}</p><p></p>
`
  content += `
  <form class="flexcol">
    <p style="color:DarkSlateBlue;">You can animate up to ${maxSummons} small or medium corpses that 
  you can see within 60 feet. They can be a mix of skeletons and zombies as you prefer, but no more 
  than ${maxSummons} total.<br></p>
    <p></p>
    <div class="form-group">
      <label for="numSkeletons">Skeletons</label>
      <input type="text" name="numSkeletons" value=${numSkeletons}>
    </div>
    <div class="form-group">
    <label for="numZombies">Zombies</label>
    <input type="text" name="numZombies" value=${numZombies}>
  </div>
  <p></p>
  <p style="color:DarkRed;">This spell does not check for the existance/visibility of corpses to animate, 
  that is left to the players to handle.</p>
  </form>
  `
  //---------------------------------------------------------------------------------------------------
  // Define the dialog to be displayed
  //
  let d = await new Dialog({
      title: 'Danse Macabre Summoning',
      content: content,
      buttons: {
          //------------------------------------------------------------------------------------------
          // Define the "yes" button, the button on the left
          //
          yes: {
              icon: '<i class="fas fa-check"></i>',
              label: 'Continue',
              callback: (html) => {
                  numSkeletons = parseInt(html.find('[name="numSkeletons"]').val());
                  numZombies = parseInt(html.find('[name="numZombies"]').val());
                  jez.log("Summons Counts Entered","numSkeletons", numSkeletons, "numZombies  ", numZombies)
                  //-----------------------------------------------------------------------------------
                  // Build the object that will be passed to recursive call if required
                  //
                  let newArgs = {
                      numSkeletons: numSkeletons,
                      numZombies: numZombies,
                      maxSummons: maxSummons, 
                      tryAgain: "Please enter valid integers."
                  }
                  //-----------------------------------------------------------------------------------
                  // Validate the input calling this function recursively if it was bad
                  //
                  if (isNaN(numSkeletons) || isNaN(numZombies)) {
                      jez.log("Try again, entries were not parseable as integers")
                      newArgs.tryAgain = "Please enter valid integers in the quantity fields."
                      dialogSummonUndeads(newArgs)
                  } else if (numSkeletons === 0 && numZombies === 0) {
                          jez.log("Try again, since zero was entered for the total")
                          newArgs.tryAgain = `Did you really want to summon zero undeads?<br>If so 
                          Cancel this dialog.`
                          dialogSummonUndeads(newArgs)
                      } else if (numSkeletons < 0 || numZombies < 0) {
                          jez.log("Try again, a negative number of summons was entered")
                          newArgs.tryAgain = `Ok, really?  You can't summon a negative quantity of critters.
                          <br>Try again.`
                          dialogSummonUndeads(newArgs)
                      } else if (numSkeletons + numZombies > maxSummons) {
                          jez.log(`Try again, attempted to summon ${numSkeletons + numZombies}, max of 
                          ${maxSummons} allowed`)
                          newArgs.tryAgain = `Ambition is one thing, but that was too much. You attempted to 
                          summon ${numSkeletons + numZombies}, max of ${maxSummons} allowed.  Try again.`
                          dialogSummonUndeads(newArgs)
                      }                      
                      else {
                      // jez.log("Call the next function as we have a valid input.")
                      doIt(newArgs)
                  }
              }
          },
          //------------------------------------------------------------------------------------------
          // Define the "no" button, the button on the right
          //
          no: {
              icon: '<i class="fas fa-times"></i>',
              label: 'Cancel',
              callback: (html) => {
                  console.log('Dialog Cancelled');
              }
          },
      },
      default: 'yes',
      close: () => {
          console.log('Dialog Closed');
      }
  }).render(true)
}
/***************************************************************************************************
 * Summon the actor and rename with a numeric suffix also add the caster's stat mod to attack and 
 * damage rolls
 ***************************************************************************************************/
async function summonCritter(summons, number) {
  let name = `${aToken.name}'s ${summons} ${number}`
  const OPTIONS = { controllingActor: aActor };
  // jez.log("CAST_MOD", CAST_MOD)
  let updates = {
    token: { name: name },
    actor: {
      name: name,
      data: {
        bonuses: {
          mwak: {
            attack: CAST_MOD, // Add the caster's stat mod to attack rolls
            damage: CAST_MOD, // Add the caster's stat mod to damage rolls
          },
          rwak: {
            attack: CAST_MOD, // Add the caster's stat mod to attack rolls
            damage: CAST_MOD, // Add the caster's stat mod to damage rolls
          },
          msak: {
            attack: CAST_MOD, // Add the caster's stat mod to attack rolls
            damage: CAST_MOD, // Add the caster's stat mod to damage rolls
          },
          rsak: {
            attack: CAST_MOD, // Add the caster's stat mod to attack rolls
            damage: CAST_MOD, // Add the caster's stat mod to damage rolls
          }
        }
      }
    }
  }
  const CALLBACKS = {
    pre: async (template) => {
      jez.vfxPreSummonEffects(template, { color: "*", scale: 1, opacity: 1 });
      await warpgate.wait(500);
    },
    post: async (template) => {
      jez.vfxPostSummonEffects(template, { color: "*", scale: 1, opacity: 1 });
      await warpgate.wait(500);
    }
  };
  return(await warpgate.spawn(summons, updates, CALLBACKS, OPTIONS))
}
/***************************************************************************************************
 * Modify an existing concentrating effect to contain a DAE effect line of the form:
 *   macro.execute custom <macroName> <argument[1]> <argument[2]> ...
 * 
 * macroName should be a string that names an existing macro to be called by DAE when the effect 
 * is removed with the arguments provided.
 * 
 * argArray should be an array of arguments to pass to macroName as a string with a single space
 * between each.
 ***************************************************************************************************/
async function modConcentratingEffect(aToken, macroName, argArray) {
  let argValue = ""
  const EFFECT = "Concentrating"
  // Make sure the macro to be called exists
  if (!game.macros.getName(macroName)) return (badNews(`Cannot locate ${macroName} macro.`))
  // Search the passed token to find the effect, return if it doesn't
  let effect = await aToken.actor.effects.find(i => i.data.label === EFFECT);
  if (!effect) return (jez.badNews(`Unable to find ${EFFECT} on ${aToken.name}`))
  // Build the value string from the argArray
  for (const element of argArray) argValue += `${element} `
  // Define the desired modification to concentartion effect. 
  effect.data.changes.push(
    {key: `macro.execute`, mode: jez.CUSTOM, value:`${macroName} ${argValue}`, priority: 20}
  )
  // Apply the modification to existing effect
  await effect.update({ 'changes': effect.data.changes });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
  const FUNCNAME = "doOff()";
  // jez.log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
  // Delete the existing summoned critters
  //
  let sceneId = game.scenes.viewed.id
  for (let i = 1; i <= args.length-2; i++) {
      jez.log(`Deleting undead #${i}`, args[i])
      await jez.wait(500)
      warpgate.dismiss(args[i], sceneId)
  }
  // jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
  return;
}