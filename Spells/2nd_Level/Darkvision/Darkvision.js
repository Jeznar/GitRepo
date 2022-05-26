const MACRONAME = "Darkvision.0.2.js"
/*****************************************************************************************
 * Darkvision
 * 
 * 05/26/22 0.2 Compatibility upgrade for FoundryVTT 9.x
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let msg = ""
//----------------------------------------------------------------------------------------
//DAE Macro Execute, Effect Value = "Macro Name" @target
//
let tActor;
if (LAST_ARG.tokenId) tActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else tActor = game.actors.get(LAST_ARG.actorId);
const target = canvas.tokens.get(LAST_ARG.tokenId)
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let dimVision = target.data.dimSight;
//----------------------------------------------------------------------------------------
// On Invocation
//
if (args[0] === "on") {
    DAE.setFlag(tActor, 'darkvisionSpell', dimVision);
    let newSight = dimVision < 60 ? 60 : dimVision
    // target.update({"dimSight" : newSight});                      // Obsolete as of FoundryVTT 9.x
    await target.document.update({"dimSight" : newSight});          // Syntax as of FoundryVTT 9.x
    // await target.update({"token.dimSight" : newSight});          // Obsolete as of FoundryVTT 9.x
    await target.document.update({"token.dimSight" : newSight});    // Syntax as of FoundryVTT 9.x
    msg = `<b>${target.name}'s</b> vision has been improved by ${aItem.name}`;
    jez.postMessage({color: jez.randomDarkColor(), 
                fSize: 14, 
                icon: target.data.img, 
                msg: msg, 
                title: `Vision has been improved`, 
                token: target})
}
//----------------------------------------------------------------------------------------
// Off Invocation
//
if(args[0] === "off") {
    let sight = DAE.getFlag(tActor, 'darkvisionSpell');
    // target.update({"dimSight" : sight});                     // Obsolete as of FoundryVTT 9.x
    await target.document.update({"dimSight" : sight});         // Syntax as of FoundryVTT 9.x
    // await target.update({"token.dimSight" : sight});         // Obsolete as of FoundryVTT 9.x
    await target.document.update({"token.dimSight" : sight});   // Syntax as of FoundryVTT 9.x
    DAE.unsetFlag(tActor, 'darkvisionSpell');
    msg = `<b>${target.name}'s</b> vision has returned to normal, having lost the benefits of ${aItem.name}`;
    jez.postMessage({color: jez.randomDarkColor(), 
                fSize: 14, 
                icon: target.data.img, 
                msg: msg, 
                title: `Vision is normal`, 
                token: target})
}