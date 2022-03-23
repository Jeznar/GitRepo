const MACRONAME = "Unseen_Servant.js"
/*****************************************************************************************
 * This macro implements Unseen Servant...Summoning a mostly transparent actor to the 
 * field
 * 
 * 1. Parse the aItem.name to find the name of the creature to be summoned.  Presumably 
 *    this will be "Unseen Servant" but it could be something else
 * 2. Verify the Actor named in the aItem.name exists 
 * 3. Define warpgate updates, options and callbacks 
 * 4. Fire off warpgate
 * 5. Post a completion message
 * 
 * 03/23/22 0.1 Creation from Find_Steed_Specific.js
 ******************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let msg = "";
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
doIt()
/******************************************************************************************/
async function doIt() {
    //-------------------------------------------------------------------------------------
    // 1. Parse the aItem.name to find the name of the creature to be summoned. 
    //
    let summonedAct = aItem.name
    // If name includes white space, get just the last token to use as the name
    if ((aItem.name.match(/ /g) || []).length >= 1) {
        let nameTokenArray = aItem.name.split(" ");
        summonedAct = nameTokenArray[nameTokenArray.length - 1];
    }
    jez.log(`summonedAct: "${summonedAct}"`)
    let specificActorName = `${aToken.name}'s ${summonedAct}`
    jez.log(`specificActorName: "${specificActorName}"`,)
    //--------------------------------------------------------------------------------------
    // 2. Verify the Actor named in the aItem.name exists
    //
    if (!game.actors.getName(aItem.name)) {   // If critter not found, that's all folks
        msg = `Could not find "<b>${aItem.name}</b>" in the <b>Actors Directory</b>. 
        <br><br>Can not complete the ${aItem.name} action.`;
        postResults(msg);
        return (false);
    }
    //--------------------------------------------------------------------------------------
    // 3. Define warpgate updates, options and callbacks 
    //
    let updates = { token: { name: specificActorName } }
    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
    const CALLBACKS = {
        pre: async (template) => {
            preEffects(template);
            await warpgate.wait(3000);
        },
        post: async (template, token) => {
            postEffects(template);
            await warpgate.wait(500);
        }
    };
    //--------------------------------------------------------------------------------------
    // 4. Fire off warpgate 
    //
    let returned = await warpgate.spawn(aItem.name, updates, CALLBACKS, OPTIONS);
    jez.log("returned", returned)
    //--------------------------------------------------------------------------------------
    // 5. Post a completion message
    //
    msg = `<b>${aToken.name}</b> has summoned <b>${specificActorName}</b>`
    postResults(msg);
    return;
}
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
   * 
   ***************************************************************************************************/
 async function preEffects(template) {
    const VFX_FILE = "modules/jb2a_patreon/Library/Generic/Portals/Masked/Portal_Vortex_*_H_NoBG_400x400.webm"
    new Sequence()
      .effect()
      .file(VFX_FILE)
      .atLocation(template)
      .center()
      .opacity(1.0)
      .scaleIn(0.3, 2000)
      //.scale(0.5)
      .scaleToObject(2.0)
      .fadeOut(2000)
      .waitUntilFinished(-3000) 
      .play()
  }
  /***************************************************************************************************
   * 
   ***************************************************************************************************/
   async function postEffects(template) {
    const VFX_OPACITY = 1.0
    const VFX_FILE = "modules/jb2a_patreon/Library/Generic/Fireworks/Firework03_02_Regular_*_600x600.webm"
    new Sequence()
      .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .scaleToObject(2.0)
        //.scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
    .play()
  }