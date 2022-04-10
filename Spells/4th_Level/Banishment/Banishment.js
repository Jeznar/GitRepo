const MACRONAME = "Banishment.js"
/*****************************************************************************************
 * This is based on a MidiQOL Sample Item which handled "banishing" one target with a very
 * simple set of messages to the GM in chat. 
 * 
 * The spell already "handles" upcasting by allowing multiple tokens to be targeted, but
 * it doesn't:
 *   1. Provide a VFX
 *   2. Give meaningful messages
 * Well, it does those things now
 * 
 * 04/10/22 0.1 Creation of Macro from MidiQOL Sample Item
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
//----------------------------------------------------------------------------------------
//
if (args[0]?.tag === "OnUse") {          // Midi ItemMacro On Use
    let color = jez.getRandomRuneColor()
    let school = jez.getSpellSchool(args[0].item)
    for (const element of args[0].targets) {
        jez.runRuneVFX(element, school, color)
    }
}
//----------------------------------------------------------------------------------------
//
if (args[0] === "on") {
    let target = canvas.tokens.get(args[1]);
    jez.wait(1000)
    jez.postMessage({
        color: jez.randomDarkColor(),
        fSize: 14,
        icon: aToken.data.img,
        msg: "Creature will return or be permanently banished if the spell lasts its 1 minute duration.",
        title: `${aToken.name} Banished`,
        token: aToken
    })
    await jez.wait(1000)
    await target.update({ hidden: true });
    await target.actor.setFlag('world', 'banishment', 1);
    //ChatMessage.create({content: target.name + "  was banished"})
}
//----------------------------------------------------------------------------------------
//
if (args[0] === "off") {
    let target = canvas.tokens.get(args[1]);

    target.update({ hidden: false })
    target.actor.unsetFlag('world', 'banishment');
    await jez.wait(500)
    jez.postMessage({
        color: jez.randomDarkColor(),
        fSize: 14,
        icon: aToken.data.img,
        msg: "Has returned from banishment (or been permanently banished).",
        title: `${aToken.name} Banished`,
        token: aToken
    })
    //ChatMessage.create({content: target.name + "  returned"})
}