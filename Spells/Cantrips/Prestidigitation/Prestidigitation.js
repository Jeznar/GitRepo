const MACRONAME = "Prestidigitation"
/*****************************************************************************************
 * Simply runs a VFX on the casting token, you know, for fun.
 * 
 * 02/11/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;

if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Energy/Icosahedron*_600x600.webm"
const GAME_RND = game.combat ? game.combat.round : 0;
const VFX_NAME = `${MACRO}-${aToken.id}-${GAME_RND}`
runVFX(aToken)
let msg = `${aToken.name} causes a minor magical effect to manifest.`
// COOL-THING: Pick a random (dark) color name 
await jez.addMessage(game.messages.get(args[args.length - 1].itemCardId),
               {color:jez.randomDarkColor(),fSize:14,msg:msg,tag:"saves"})
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function runVFX(token5e) {
    new Sequence()
    .effect()
        .file(VFX_LOOP)
        .attachTo(token5e)
        .scale(0.7)
        .scaleIn(0.1, 1500)         // Expand from 0.25 to 1 size over 1 second
        .rotateIn(180, 1500)        // 1/2 Rotation over 1 second 
        .scaleOut(0.1, 1500)        // Contract from 1 to 0.25 size over 1 second
        .rotateOut(180, 1500)       // 1/2 Counter Rotation over 1 second
        .opacity(2.0)
        //.belowTokens()
        //.persist()
        .duration(6000)
        .name(VFX_NAME)             // Give the effect a uniqueish name
        .fadeIn(1500)               // Fade in for specified time in milliseconds
        .fadeOut(1500)              // Fade out for specified time in milliseconds
        //.extraEndDuration(1200)   // Time padding on exit to connect to Outro effect
    .play();
    await jez.wait(100)         // Don't delete till VFX established
    return (true)
}
  