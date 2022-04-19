// Crymic 21.12.25 Vicious Mockery
// Let macro deal damage instead of the item, it also supports "mockeries" table found in Community Tables Module.
// Requires ActiveEffect callback macro
const lastArg = args[args.length - 1];
if (lastArg.failedSaves.length === 0) return {};
let itemD = lastArg.item;
let actorD = game.actors.get(lastArg.actor._id);
let tokenD = canvas.tokens.get(lastArg.tokenId);
let target = canvas.tokens.get(lastArg.failedSaves[0].id);
let getClass = Object.keys(actorD.classes);
let level = actorD.classes[getClass].data.data.levels;
let numDice = 1 + (Math.floor((level + 1) / 6));

// COOL-THING: Draw a text message from a roll table
let tableName = "Mockeries";
let table = game.tables.getName(tableName);
jez.log("table", table)
let damageType = "psychic";
let mockery = "";
if (table) {
    let roll = await table.roll();
    mockery = roll.results[0].data.text;
} else {
    mockery = "Now go away or I shall taunt you a second time-a!";
}

jez.postMessage({color: "purple", 
                fSize: 16, 
                icon: tokenD.data.img, 
                msg: mockery, 
                title: `${tokenD.name} speaks mockingly...`, 
                token: tokenD})

// COOL-THING: Generate a chat bubble on the scene!
let theBubble = new ChatBubbles();
await theBubble.say(tokenD, mockery, true);                

let combatRound = game.combat ? game.combat.round : 0;
let damageRoll = new Roll(`${numDice}d4`).evaluate({ async: false });
await new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damageType, [target], damageRoll, { flavor: `<hr><div style="font-weight:bold;">${mockery}</div><hr><div>(${CONFIG.DND5E.damageTypes[damageType]})</div>`, itemCardId: lastArg.itemCardId });
let effectData = {
    label: itemD.name,
    icon: itemD.img,
    duration: { rounds: 1, turns: 1, startRound: combatRound, startTime: game.time.worldTime },
    flags: { dae: { macroRepeat: "none", specialDuration: ["1Attack", "turnEnd"] } },
    origin: lastArg.uuid,
    disabled: false,
    changes: [{
        "key": "flags.midi-qol.disadvantage.attack.all",
        "mode": 0,
        "value": 1,
        "priority": 20
    }]
};
let effect = target.actor.effects.find(ef => ef.data.label === game.i18n.localize(itemD.name));
if (!effect) await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.uuid, effects: [effectData] });