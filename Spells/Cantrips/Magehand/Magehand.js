const MACRONAME = "Magehand.0.4.js"
/*****************************************************************************************
 * This macro just posts a msg providing basic instructions to teh spell card.
 * 
 * 12/02/21 0.1 Creation
 * 12/02/21 0.2 Drastic simplification and resouce consumption can be handled by base code
 * 02/25/22 0.3 Update to use jez.lib and rename the summoned hand
 * 05/25/22 0.4 Chasing Error: Sequencer | Effect | attachTo - could not find given object
 *              Issue was caused by a conflict with TokenMold/Name.  Now handled with a 
 *              warning.
  *****************************************************************************************/
let msg = "";
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
jez.log(`Beginning ${MACRONAME}`);
const MINION = "Magehand"
const GAME_RND = game.combat ? game.combat.round : 0;
const MINION_NAME = `${aToken.name}'s Magehand ${GAME_RND}`
const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Portals/Portal_Bright_*_H_400x400.webm"
let updates = { token : {name: MINION_NAME} }
// https://github.com/trioderegion/warpgate/wiki/Summon-Spiritual-Badger
// COOL-THING: Rename a summoned token with warpgate (Can be stopped by TokenMold)
let tokenID = await warpgate.spawn(MINION, updates);
jez.log("tokenID", tokenID)
//-------------------------------------------------------------------------------------
// Get the token just summoned for subsequent VFX
//
await jez.wait(100) // Wait for the token to be placed
let newToken = await canvas.tokens.placeables.find(ef => ef.name === MINION_NAME)
if (!newToken) {
    msg = `${MINION_NAME} not found, perhaps Token Mold is messing with namings?`
    jez.log(msg)
    ui.notifications.warn(msg);
    newToken = await canvas.tokens.placeables.find(ef => ef.id === tokenID[0])
} else console.log('Token5e  fetched by Name', newToken)
//-------------------------------------------------------------------------------------
// Run the VFX
//
runVFX(newToken)
//-------------------------------------------------------------------------------------
// Post message
//
let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
msg = `<strong>${actor.name}</strong> summons <strong>${MINION_NAME}</strong> to the field.`;
jez.addMessage(chatMessage, {color:jez.randomDarkColor(), fSize:15, msg:msg, tag:"saves" })
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/
 async function runVFX(token5e) {
    jez.log("token5e",token5e)
    new Sequence()
    .effect()
        .file(VFX_LOOP)
        .attachTo(token5e)
        .scale(0.5)
        .scaleIn(0.1, 1500)         // Expand from 0.25 to 1 size over 1 second
        .rotateIn(180, 1500)        // 1/2 Rotation over 1 second 
        .scaleOut(0.1, 1500)        // Contract from 1 to 0.25 size over 1 second
        .rotateOut(180, 1500)       // 1/2 Counter Rotation over 1 second
        .opacity(2.0)
        .belowTokens()
        .duration(6000)
        .name(MINION_NAME)             // Give the effect a uniqueish name
        .fadeIn(1500)               // Fade in for specified time in milliseconds
        .fadeOut(1500)              // Fade out for specified time in milliseconds
        //.extraEndDuration(1200)   // Time padding on exit to connect to Outro effect
    .play();
    await jez.wait(100)         // Don't delete till VFX established
    return (true)
}
