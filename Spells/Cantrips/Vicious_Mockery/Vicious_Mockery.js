const MACRONAME = "Viscious_Mockery.0.2.js"
/*****************************************************************************************
 * Based on Crymic 21.12.25 Vicious Mockery
 * Let macro deal damage instead of the item, it also supports "mockeries" table found in Community Tables Module.
 * Requires ActiveEffect callback macro
 * 
 * 12/25/21 0.1 Creation of Macro by Crymic
 * 08/02/22 0.2 Add convenientDescription
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const TL = 5;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL>1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
// let getClass = Object.keys(aActor.classes);
// if (TL > 2) jez.trace(`${MACRO} | ${aToken.name} getClass`,getClass)
// let level = aActor.classes[getClass].data.data.levels;
let level = jez.getCharLevel(aToken)
if (TL > 2) jez.trace(`${MACRO} | ${aToken.name} level`,level)
let numDice = 1 + (Math.floor((level + 1) / 6));
//---------------------------------------------------------------------------------------------------
// If nothing failed the save, we're done here.
//
if (LAST_ARG.failedSaves.length === 0) return jez.badNews(`Target saved vs ${aItem.name}`,"i")
//---------------------------------------------------------------------------------------------------
// Set the target
//
let tToken = canvas.tokens.get(LAST_ARG.failedSaves[0].id);
if (TL > 2) jez.trace(`${MACRO} | Targeting ${tToken.name}`)
//---------------------------------------------------------------------------------------------------
// Run the VFX
//
jez.runRuneVFX(aToken, jez.getSpellSchool(aItem))
//---------------------------------------------------------------------------------------------------
// Grab a mockery to be played from the roll table and play it
//
// COOL-THING: Draw a text message from a roll table
let table = game.tables.getName("Mockeries-All");
let mockery = "";
if (TL > 2) jez.trace(`${MACRO} | Mockery table`,table)
if (table) {
    let roll = await table.roll();
    mockery = roll.results[0].data.text;
} else {
    jez.badNews(`No mockery ("Mockeries-All") table found, using default.`,"w")
    mockery = "Now go away or I shall taunt you a second time-a!";
}
jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: aToken.data.img, 
    msg: mockery, title: `${aToken.name} speaks mockingly...`, token: aToken})
bubbleForAll(aToken.id, mockery, true, true)
//---------------------------------------------------------------------------------------------------
// If the target has the no LoS (Line of Sound), it is immune
//
ray = new Ray(tToken.center, aToken.center)
let badLoS = canvas.walls.checkCollision(ray, { type: "sound", mode: "any" })
if (TL > 2 && badLoS)  jez.trace(`${MACRO} | ${token.name} sound path blocked`)
msg = `Maybe there was a noise over that way?`
bubbleForAll(tToken.id, msg, true, true)
msg = `<i>...while pointing generally toward ${aToken.name}...</i><br><br>` + msg
jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: tToken.data.img, 
    msg: msg, title: `${tToken.name} wonders...`, token: tToken})
if (badLoS) return  // Line of Sound
//---------------------------------------------------------------------------------------------------
// If the target has the deafened condition, it is immune
//
if (jezcon.hasCE("Deafened", tToken.actor.uuid, { traceLvl: 0 })) {
    if (TL > 1) jez.trace(`${MACRO} | ${token.name} is deaf, and this immune.`)
    msg = `Did ${aToken.name} say something?`
    bubbleForAll(tToken.id, msg, true, true)
    jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: tToken.data.img, 
        msg: msg, title: `${tToken.name} wonders...`, token: tToken})
    return
}
//---------------------------------------------------------------------------------------------------
// Handle damage from the spell
//
let combatRound = game.combat ? game.combat.round : 0;
let damageType = "psychic";
let damageRoll = new Roll(`${numDice}d4`).evaluate({ async: false });
if (TL > 2) jez.trace(`${MACRO} | Performing damage action with DamageOnlyWorkflow`,
    "damageType",damageType,"damageRoll",damageRoll)
await new MidiQOL.DamageOnlyWorkflow(aActor,aToken,damageRoll.total,damageType,[tToken],damageRoll, 
    { flavor:`<hr><div style="font-weight:bold;">${mockery}</div><hr><div>(${CONFIG.DND5E.damageTypes[damageType]})</div>`, itemCardId: LAST_ARG.itemCardId });
//---------------------------------------------------------------------------------------------------
// Define and apply debuff effect
//
const CE_DESC = `Disadvantage on next attack roll`
let effectData = {
    label: aItem.name,
    icon: aItem.img,
    duration: { rounds: 1, turns: 1, startRound: combatRound, startTime: game.time.worldTime },
    flags: { dae: { macroRepeat: "none", specialDuration: ["1Attack", "turnEnd"] } },
    origin: LAST_ARG.uuid,
    disabled: false,
    flags: { 
        dae: { itemData: aItem }, 
        convenientDescription: CE_DESC
    },
    changes: [{
        "key": "flags.midi-qol.disadvantage.attack.all",
        "mode": 0,
        "value": 1,
        "priority": 20
    }]
};
if (TL > 2) jez.trace(`${MACRO} | Apply effect`, effectData)
let effect = tToken.actor.effects.find(ef => ef.data.label === game.i18n.localize(aItem.name));
if (!effect) await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:tToken.actor.uuid, effects: [effectData] });