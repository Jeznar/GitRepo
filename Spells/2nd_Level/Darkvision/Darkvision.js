//DAE Macro Execute, Effect Value = "Macro Name" @target
const LAST_ARG = args[args.length - 1];
let msg = ""
let tactor;
if (LAST_ARG.tokenId) tactor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else tactor = game.actors.get(LAST_ARG.actorId);
const target = canvas.tokens.get(LAST_ARG.tokenId)

let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;

let dimVision = target.data.dimSight;
if (args[0] === "on") {
    DAE.setFlag(tactor, 'darkvisionSpell', dimVision);
    let newSight = dimVision < 60 ? 60 : dimVision
    await target.update({"dimSight" : newSight});
    await tactor.update({"token.dimSight" : newSight})
    msg = `<b>${target.name}'s</b> vision has been improved by ${aItem.name}`;
    jez.postMessage({color: jez.randomDarkColor(), 
                fSize: 14, 
                icon: target.data.img, 
                msg: msg, 
                title: `Vision has been improved`, 
                token: target})
}
if(args[0] === "off") {
    let sight = DAE.getFlag(tactor, 'darkvisionSpell');
    target.update({"dimSight" : sight });
    await tactor.update({"token.dimSight" : sight})
    DAE.unsetFlag(tactor, 'darkvisionSpell');
    msg = `<b>${target.name}'s</b> vision has returned to normal, having lost the benefits of ${aItem.name}`;
    jez.postMessage({color: jez.randomDarkColor(), 
                fSize: 14, 
                icon: target.data.img, 
                msg: msg, 
                title: `Vision is normal`, 
                token: target})
}