// Snippet to apply an effect asGM from Crymic

let effectData = [{
    label: "Prone",
    icon: "modules/combat-utility-belt/icons/prone.svg",
    origin: args[0].uuid,
    disabled: false,
    duration: { rounds: 10, seconds: 60, startTime: game.time.worldTime },
    changes: [
        { key: `flags.midi-qol.disadvantage.attack.all`, mode: 2, value: 1, priority: 20 },
        { key: `flags.midi-qol.grants.advantage.attack.mwak`, mode: 2, value: 1, priority: 20 },
        { key: `flags.midi-qol.grants.advantage.attack.msak`, mode: 2, value: 1, priority: 20 },
        { key: `flags.midi-qol.grants.disadvantage.attack.rwak`, mode: 2, value: 1, priority: 20 },
        { key: `flags.midi-qol.grants.disadvantage.attack.rsak`, mode: 2, value: 1, priority: 20 }
    ]
}];
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: effectData });