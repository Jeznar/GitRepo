const MACRONAME = "Danse_Macabre.0.2.js"
/*****************************************************************************************
 * Implement the amazing Danse Macabre spell
 * 
 * This macro does quite a few things.  Here are the highlights:
 * - Verify potentially summoned actors exist
 * - Ask the user how many skeletons/zombies are to be summoned
 * - Validate the input, repeating the dialog if invalid
 * - Place the summoned, modified tokens, on the scene with warpgate, with VFX
 * - Modify concentrating effect to remove the tokens on completion
 * - Trigger Dismiss_Tokens when concentrating effect removed to delete summons
 * 
 * 06/24/22 0.1 Creation of Macro
 * 06/25/22 0.2 Cleanup and polish
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
const SKELETON_NAME = "Skeleton"  // Name of skeleton to call as base item
const ZOMBIE_NAME   = "Zombie"    // Name of zombie to call as base item
const CAST_MOD = jez.getCastMod(aActor)
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
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
  if (!game.actors.getName(SKELETON_NAME))    
    return jez.badNews(`Could not find "<b>${SKELETON_NAME}</b>" in the <b>Actors Directory</b>. Quitiing`) 
  if (!game.actors.getName(ZOMBIE_NAME))    
    return jez.badNews(`Could not find "<b>${ZOMBIE_NAME}</b>" in the <b>Actors Directory</b>. Quitiing`) 
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
  let summonId
  let summonUuid
  let summonUuidArray = []
  const SCENE_ID = game.scenes.viewed.id
  jez.runRuneVFX(aToken, jez.getSpellSchool(aItem))
  //---------------------------------------------------------------------------------------------------
  // Spawn in the Skeletons
  //
  for (let i = 1; i <= numSkeletons; i++) {
    summonId = await summonCritter(SKELETON_NAME, i)
    // summonIdArray.push(summonId)  // Catch the id of summoned token
    // Build UUID for this token, e.g. Scene.MzEyYTVkOTQ4NmZk.Token.MsbMe9mgA23RTjV2
    summonUuid = `Scene.${SCENE_ID}.Token.${summonId}`
    summonUuidArray.push(summonUuid)
  }
  //---------------------------------------------------------------------------------------------------
  // Spawn in the Zombies
  //
  for (let i = 1; i <= numZombies; i++) {
    summonId = await summonCritter(ZOMBIE_NAME, i)
    // Build UUID for this token, e.g. Scene.MzEyYTVkOTQ4NmZk.Token.MsbMe9mgA23RTjV2
    summonUuid = `Scene.${SCENE_ID}.Token.${summonId}`
    summonUuidArray.push(summonUuid)
  }
  jez.log("summonUuidArray", summonUuidArray)
  //--------------------------------------------------------------------------------------
  // Modify the conc. effect to delete the summoned creatures on concentration break
  //
  jez.modConcentratingEffect(aToken, "Dismiss_Tokens", summonUuidArray)
  //---------------------------------------------------------------------------------------------------
  // Post completion message
  //
  msg = `<b>${aToken.name}</b> summons `
  if (numSkeletons > 0) {
    if (numSkeletons === 1) msg += `a ${SKELETON_NAME}`
    else msg += `${numSkeletons} ${SKELETON_NAME}s`
    if (numZombies > 0) msg += ` and `
    else msg += `. `
  }
  if (numZombies > 0) {
    if (numZombies === 1) msg += `a ${ZOMBIE_NAME}. `
    else msg += `${numZombies} ${ZOMBIE_NAME}s. `
  }
  msg += `They can be directed, as a group, with a <b>Bonus Action</b> each turn.`
  postResults(msg)
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
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 function postResults(msg) {
  let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
  jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}