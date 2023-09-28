// Snippet to remove an effect asGM from Crymic

let removeConc = target.actor.effects.find(i => i.data.label === "Concentrating");
if (removeConc) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: target.actor.uuid, effects: [removeConc.id] });