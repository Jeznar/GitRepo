const MACRONAME = "Find_Steed_Specific.0.2.js"
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
 * 07/17/22 0.2 Update to use jez.spawnAt (v2) for summoning
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
const TL = 0;

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
    const MINION = summonedSteedName
    //-----------------------------------------------------------------------------------------------
    // Build our data object
    let argObj = {
        defaultRange: 30,
        duration: 3000,                     // Duration of the intro VFX
        introTime: 1000,                    // Amount of time to wait for Intro VFX
        introVFX: '~Energy/SwirlingSparkles_01_Regular_${color}_400x400.webm', // default introVFX file
        minionName: MINION,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: '~Fireworks/Firework*_02_Regular_${color}_600x600.webm', // default outroVFX file
        scale: 0.9,							// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        templateName: MINION,               // Name of the actor in the actor directory
        updates: {},
        width: 2,                           // Width of token to be summoned
        traceLvl: TL
    }
    //--------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    let summonData = await game.actors.getName(MINION)
    argObj.img = summonData ? summonData.img : aItem.img
    //--------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    let returned = await jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
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