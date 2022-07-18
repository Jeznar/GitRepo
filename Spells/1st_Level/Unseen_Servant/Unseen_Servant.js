const MACRONAME = "Unseen_Servant.0.2.js"
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
 * 07/18/22 0.2 Update to use jez.spawnAt for summoning
 ******************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
let msg = "";
const TL = 0;
const LAST_ARG = args[args.length - 1];
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor;
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const MINION = "Unseen Servant"
doIt()
/******************************************************************************************/
async function doIt() {
    //--------------------------------------------------------------------------------------------------
    // Portals need the same color for pre and post effects, so get that set here. Even though only used
    // when we are doing portals
    //
    const PORTAL_COLORS = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple", "Dark_Red",
        "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange", "Bright_Purple", "Bright_Red",
        "Bright_Yellow"]
    let index = Math.floor((Math.random() * PORTAL_COLORS.length))
    let portalColor = PORTAL_COLORS[index]
    //--------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        defaultRange: 60,                   // Defaults to 30, but this varies per spell
        duration: 4000,                     // Duration of the intro VFX
        img: aItem.img,                     // Image to use on the summon location cursor
        introTime: 250,                     // Amount of time to wait for Intro VFX
        introVFX: `~Portals/Portal_${portalColor}_H_400x400.webm`, // default introVFX file
        minionName: `${aToken.name}'s Servant`,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: `~Portals/Masked/Portal_${portalColor}_H_NoBG_400x400.webm`, // default outroVFX file
        scale: 0.7,								// Default value but needs tuning at times
        source: aToken,                     // Coords for source (with a center), typically aToken
        width: 1,                           // Width of token to be summoned, 1 is the default
        traceLvl: TL                        // Trace level, matching calling function decent choice
    }
    jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
    //--------------------------------------------------------------------------------------
    // 5. Post a completion message
    //
    msg = `<b>${aToken.name}</b> has summoned <b>${aToken.name}'s Servant}</b>`
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