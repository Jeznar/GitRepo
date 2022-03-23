const MACRONAME = "Find_Steed_Specific.js"
/*****************************************************************************************
 * This macro implmenets Find Steed in a manor rquested by our friendly Paladin.  It does
 * the following.
 * 
 * 1. Parse the aItem.name to find the name of the creature to be summoned.  The name needs
 *    to be of the form: Find Steed: <Actor Name> - <Steed Name>.  It must contain one and 
 *    only one colon (:) and dash (-)
 * 2. Verify the Actor named in the aItem.name exists 
 * 3. Define warpgate updates, options and callbacks 
 * 4. Fire off warpgate
 * 5. Post a completion message
 * 
 * 03/23/22 0.1 Creation from Flaming_spehere.0.4.js
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
async function doIt() {
    //-------------------------------------------------------------------------------------
    // 1. Parse the aItem.name to find the name of the creature to be summoned.  The name 
    //    needs to be of the form: <Spell Name>: <Generic Name> - <Steed Name>
    //    It must contain one and only one colon (:) and dash (-)
    //
    if ((aItem.name.match(/:/g) || []).length != 1) {
        msg = `Item name must contain a single colon (:) used to seperate the generic name
    from the specific actor name to be summoned.<br><br>
    Can not complete the ${aItem.name} action.`;
        postResults(msg);
        return (false);
    }
    if ((aItem.name.match(/-/g) || []).length != 1) {
        msg = `Item name must contain a single dash (-) used to seperate the generic steed
    name from the token's intended name.<br><br>
    Can not complete the ${aItem.name} action.`;
        postResults(msg);
        return (false);
    }
    let summonedSteedName = aItem.name.split(":")[1].trim()
    jez.log(`summonedSteedName: "${summonedSteedName}"`)
    let specificSteedName = summonedSteedName.split("-")[1].trim()
    if (!specificSteedName) {
        msg = `Could not parse steed name from "<b>${summonedSteedName}</b>". <br><br>
    Can not complete the ${aItem.name} action.  Expected steed name to follow a dash (-)`;
        postResults(msg);
        return (false);
    }
    jez.log(`specificSteedName: "${specificSteedName}"`,)
    //--------------------------------------------------------------------------------------
    // 2. Verify the Actor named in the aItem.name exists
    //
    if (!game.actors.getName(summonedSteedName)) {   // If steed not found, that's all folks
        msg = `Could not find "<b>${summonedSteedName}</b>" in the <b>Actors Directory</b>. 
    <br><br>Can not complete the ${aItem.name} action.`;
        postResults(msg);
        return (false);
    }
    //--------------------------------------------------------------------------------------
    // 3. Define warpgate updates, options and callbacks 
    //
    let updates = { token: { name: specificSteedName } }
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
    //let returned = await warpgate.spawnAt({x:x,y:y},summons, updates, CALLBACKS, OPTIONS);
    let returned = await warpgate.spawn(summonedSteedName, updates, CALLBACKS, OPTIONS);
    jez.log("returned", returned)
    //--------------------------------------------------------------------------------------
    // 5. Post a completion message
    //
    msg = `<b>${aToken.name}</b> has summoned <b>${specificSteedName}</b>`
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