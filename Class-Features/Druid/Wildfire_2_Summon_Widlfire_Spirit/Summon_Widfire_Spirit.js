const MACRONAME = "Summon_Wildfire_Spirit.js"
/*****************************************************************************************
 * Implemention of Summon Wildfire Spirit.  Based on macro Jon baked. 
 * 
 * args[0] contains a bunch of information for ItemMacro macros, including templateID of 
 * the placed template (if any).  That ID can be accessed as: args[0].templateId
 * The list is documented at: https://gitlab.com/tposney/midi-qol#notes-for-macro-writers
 * 
 * Module automated evocations apprently can eliminate the need for this macro.
 * 
 * A Reddit guide on setting up automated resouce usage.
 * https://www.reddit.com/r/FoundryVTT/comments/j9q81f/guide_how_to_setup_skill_resource_consumption/
 * 
 * 11/29/21 0.1 Add headers, debug and use of Summoner Module
 * 11/29/21 0.2 Try to make the macro actually, you know, work
 * 11/29/21 0.3 Cleanup the mostly working code
 * 11/29/21 0.4 Add use of a resource which is checked and decremented, on further study 
 *              this was implemented by setting Resource Consumption of details page to
 *              resource.secondry.value (also primary and tertiary available)
 * 12/01/21 0.5 Fix maxHP added fixed 13 but should have been 5
 * 03/16/22 0.6 Update to use WARPGATE and add to GitRepo (also fix bug of graphic failing)
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
 jez.log(`============== Starting === ${MACRONAME} =================`);
 for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
 const LAST_ARG = args[args.length - 1];
 let aActor;         // Acting actor, creature that invoked the macro
 let aToken;         // Acting token, token for creature that invoked the macro
 let aItem;          // Active Item information, item invoking this macro
 if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
    else aActor = game.actors.get(LAST_ARG.actorId);
 if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
    else aToken = game.actors.get(LAST_ARG.tokenId);
 if (args[0]?.item) aItem = args[0]?.item; 
    else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
 let msg = "";
//-----------------------------------------------------------------------------------------
// Get the template coords and delete it.
//
const MINION = await jez.familiarNameGet(aToken.actor);
// Extract coordinates from the template and then delete it
const templateID = args[0].templateId
// Set the x,y coordinates of the targeting template that was placed.
const X = canvas.templates.get(templateID).data.x
const Y = canvas.templates.get(templateID).data.y
// Delete the template that had been placed
canvas.templates.get(templateID).document.delete()
//-----------------------------------------------------------------------------------------
// Set the maximum hit points for the summoned familiar
//
const MAX_HP = (token.actor.getRollData().classes.druid.levels * 5) + 5;
//-----------------------------------------------------------------------------------------
// Do the actual summon
//
await summonCritter(X,Y,MINION,MAX_HP)
//-----------------------------------------------------------------------------------------
// Post a more or less useful message to chat log and exit
//
msg = `<b>${aToken.name}</b> has summoned <b>${MINION}</b> (with ${MAX_HP}HP) to the field.  
Creatures within 10 feet are hit with fire damage from explosion.`
postResults(msg);
jez.log(`Ending ${MACRONAME}`);
return;
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
 * Summon the minion and update HP
 * 
 * https://github.com/trioderegion/warpgate
 ***************************************************************************************************/
 async function summonCritter(x,y,summons, MAX_HP) {
    jez.log("function summonCritter(x,y,summons, number, updates)","x",x,"y",y,"summons",summons,"MAX_HP",MAX_HP);
    let updates = { actor: { "data.attributes.hp": { value: MAX_HP, max: MAX_HP } } }
    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
    const CALLBACKS = {
      pre: async (template) => {
        preEffects(template);
        await warpgate.wait(500);
      },
      post: async (template, token) => {
        postEffects(template);
        await warpgate.wait(500);
      }
    };
    await warpgate.spawnAt({x:x,y:y},summons, updates, CALLBACKS, OPTIONS);
  }
  /***************************************************************************************************
   * 
   ***************************************************************************************************/
   async function preEffects(template) {
    const VFX_FILE = "jb2a.explosion.02.orange"
    new Sequence()
      .effect()
      .file(VFX_FILE)
      .atLocation(template)
      .center()
      .scale(1.4)
      .play()
  }
  /***************************************************************************************************
   * 
   ***************************************************************************************************/
   async function postEffects(template) {
    const VFX_OPACITY = 1.0
    const VFX_SCALE = 1.0
    const VFX_FILE = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Regular_Grey_400x400.webm"
    new Sequence()
      .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .waitUntilFinished(-1000) 
    .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE*1.5)
        .opacity(VFX_OPACITY*0.75)
        .waitUntilFinished(-1000) 
    .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE*2.0)
        .opacity(VFX_OPACITY*0.5)
        .waitUntilFinished(-1000) 
    .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE*2.5)
        .opacity(VFX_OPACITY*0.25)
        .waitUntilFinished(-1000) 
    .play()
  }