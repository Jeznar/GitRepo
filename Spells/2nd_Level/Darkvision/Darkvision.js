const MACRONAME = "Darkvision.0.3.js"
/*****************************************************************************************
 * Darkvision
 * 
 * 05/26/22 0.2 Compatibility upgrade for FoundryVTT 9.x
 * 12/11/22 0.3 Update logging to quiet the log storm
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 0;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //-----------------------------------------------------------------------------------------------------------------------------------
 if (TL>0) jez.trace(`${TAG} === Starting ===`);
 if (TL>1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
 //-----------------------------------------------------------------------------------------------------------------------------------
 // Set standard variables
 //
 const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
 let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
 let aActor = aToken.actor; 
 let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
 const VERSION = Math.floor(game.VERSION);
 const GAME_RND = game.combat ? game.combat.round : 0;
 //-----------------------------------------------------------------------------------------------------------------------------------
 // Set Macro specific globals
 //
const tToken = canvas.tokens.get(L_ARG.tokenId)
const tActor = tToken.actor
let dimVision = tToken.data.dimSight;
//----------------------------------------------------------------------------------------
// On Invocation
//
if (args[0] === "on") {
    DAE.setFlag(tActor, 'darkvisionSpell', dimVision);
    let newSight = dimVision < 60 ? 60 : dimVision
    // tToken.update({"dimSight" : newSight});                      // Obsolete as of FoundryVTT 9.x
    await tToken.document.update({"dimSight" : newSight});          // Syntax as of FoundryVTT 9.x
    // await tToken.update({"token.dimSight" : newSight});          // Obsolete as of FoundryVTT 9.x
    await tToken.document.update({"token.dimSight" : newSight});    // Syntax as of FoundryVTT 9.x
    msg = `<b>${tToken.name}'s</b> vision has been improved by ${aItem.name}`;
    jez.postMessage({color: jez.randomDarkColor(), 
                fSize: 14, 
                icon: tToken.data.img, 
                msg: msg, 
                title: `Vision has been improved`, 
                token: tToken})
}
//----------------------------------------------------------------------------------------
// Off Invocation
//
if(args[0] === "off") {
    let sight = DAE.getFlag(tActor, 'darkvisionSpell');
    // tToken.update({"dimSight" : sight});                     // Obsolete as of FoundryVTT 9.x
    await tToken.document.update({"dimSight" : sight});         // Syntax as of FoundryVTT 9.x
    // await tToken.update({"token.dimSight" : sight});         // Obsolete as of FoundryVTT 9.x
    await tToken.document.update({"token.dimSight" : sight});   // Syntax as of FoundryVTT 9.x
    DAE.unsetFlag(tActor, 'darkvisionSpell');
    msg = `<b>${tToken.name}'s</b> vision has returned to normal, having lost the benefits of ${aItem.name}`;
    jez.postMessage({color: jez.randomDarkColor(), 
                fSize: 14, 
                icon: tToken.data.img, 
                msg: msg, 
                title: `Vision is normal`, 
                token: tToken})
}