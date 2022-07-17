const MACRONAME = "Phantom_Steed.0.1.js"
/*****************************************************************************************
 * This macro implmenets Phantom Steed.
 * 
 *   A Large quasi-real, horse-like creature appears on the ground in an unoccupied space 
 *   of your choice within range. You decide the creature's appearance, but it is equipped 
 *   with a saddle, bit, and bridle. Any of the equipment created by the spell vanishes in 
 *   a puff of smoke if it is carried more than 10 feet away from the steed.
 * 
 *   For the duration, you or a creature you choose can ride the steed. The creature uses 
 *   the statistics for a riding horse, except it has a speed of 100 feet and can travel 
 *   10 miles in an hour, or 13 miles at a fast pace.
 * 
 *   When the spell ends, the steed gradually fades, giving the rider 1 minute to dismount. 
 *   The spell ends if you use an action to dismiss it or if the steed takes any damage.
 * 
 * 1. Setup variables
 * 2. Verify the Actor %Phantom Steed% exists 
 * 3. Define warpgate updates, options and callbacks 
 * 4. Fire off warpgate
 * 5. Add a watchdog effect that despawns the mount when removed at spell expiration
 * 6. Post a completion message
 * 
 * 05/31/22 0.1 Creation from Find Steed Specific
 ******************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
let msg = "";
const TL = 5;                               // Trace Level for this macro

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
jez.log(`Beginning ${MACRONAME}`);
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
//if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
//if (args[0] === "each") doEach();					    // DAE removal
// DamageBonus must return a function to the caller
//if (args[0]?.tag === "DamageBonus") return(doBonusDamage());    
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
  const FNAME = FUNCNAME.split("(")[0] 
    //-------------------------------------------------------------------------------------
    // 1. Setup variables. Mount to be summoned will be name ${aToken.name}'s Phantom Steed
    //
    const STEED_TEMPLATE = '%Phantom Steed%'
    const STEED_NAME = `${aToken.name}'s Phantom Steed`
    jez.log(`STEED_NAME: "${STEED_NAME}"`)
    //--------------------------------------------------------------------------------------
    // 2. Verify the Actor named in the aItem.name exists
    //
    if (!game.actors.getName(STEED_TEMPLATE)) {   // If steed not found, that's all folks
        msg = `Could not find "<b>${STEED_TEMPLATE}</b>" in the <b>Actors Directory</b>. 
        <br><br>Can not complete the ${aItem.name} action.`;
        postResults(msg);
        return (false);
    }
    //--------------------------------------------------------------------------------------
    // If actor currently has a watchdog effect for this spell, delete it. 
    //
    let existingEffect = await aToken.actor.effects.find(i => i.data.label === aItem.name);
    if (TL>1) jez.trace(`${FNAME} | existingEffect`,existingEffect)
    if (existingEffect) await existingEffect.delete();
    await jez.wait(100) // Let the deletion of the effect despawn the summoned token
    //--------------------------------------------------------------------------------------
    // If summoned token or tokens exist in the scene, dismiss, delete, despawn it. 
    //
    let existToken = null
    let sceneId = game.scenes.viewed.id
    if (TL>1) jez.trace(`${FNAME} | sceneId`,sceneId)
    while (existToken = await canvas.tokens.placeables.find(ef => ef.name === STEED_NAME)) {
        warpgate.dismiss(existToken.id, sceneId)
        await jez.wait(100)
    }
    //--------------------------------------------------------------------------------------
    // 3. Define warpgate updates, options and callbacks 
    //
    let updates = {
        token: { name: STEED_NAME },
        actor: { name: STEED_NAME }
    }
    if (TL>1) jez.trace(`${FNAME} | updates`,updates)
    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
    const CALLBACKS = {
        pre: async (template) => {
            preEffects(template);
            await warpgate.wait(2000);
        },
        post: async (template, token) => {
            postEffects(template);
            await warpgate.wait(500);
        }
    };
    //--------------------------------------------------------------------------------------
    // 4. Fire off warpgate 
    //
    //let returned = await warpgate.spawnAt({x:x,y:y},summons, updates, CALLBACKS, OPTIONS);
    let returned = await warpgate.spawn(STEED_TEMPLATE, updates, CALLBACKS, OPTIONS);
    jez.log("returned", returned)
    //--------------------------------------------------------------------------------------
    // 5. Add watchdog effect to despawn summoned token at expiration (1 hour) via doOff 
    //
    const EXPIRE = ["newDay", "longRest", "shortRest"];
    const GAME_RND = game.combat ? game.combat.round : 0;
    let effectData = {
      label: aItem.name,
      icon: aItem.img,
      origin: LAST_ARG.uuid,
      disabled: false,
      duration: { 
          rounds: 600, startRound: GAME_RND, 
          seconds: 3600,  startTime: game.time.worldTime, 
          token: aToken.uuid, stackable: false 
        },
      flags: { dae: { macroRepeat: "none", specialDuration: EXPIRE } },
      changes: [
        { key: `macro.itemMacro`, mode: jez.ADD, value: returned, priority: 20 },
      ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });
    //--------------------------------------------------------------------------------------
    // 6. Post a completion message
    //
    msg = `<b>${aToken.name}</b> has summoned <b>${STEED_NAME}</b>`
    postResults(msg);
    return;
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
async function preEffects(template) {
    //const VFX_FILE = "jb2a.explosion.orange.0"
    const VFX_FILE = "jb2a.swirling_sparkles.01.bluepink"
    new Sequence()
        .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .opacity(1.0)
        .scale(1.0)
        .play()
}
  /***************************************************************************************************
   * 
   ***************************************************************************************************/
   async function postEffects(template) {
    const VFX_OPACITY = 1.0
    const VFX_SCALE = 0.8
    const VFX_FILE = "jb2a.firework.02.bluepink.03"
    new Sequence()
      .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        //.waitUntilFinished(-1000) 
    .play()
  }
/***************************************************************************************************
 * Delete the summoned token,defined as args[1]
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("Token to dismiss", args[1])
    let sceneId = game.scenes.viewed.id
    warpgate.dismiss(args[1], sceneId)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}