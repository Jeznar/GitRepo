    static async arcaneEye(args, texture) {
        if (!game.modules.get("warpgate")?.active) ui.notifications.error("Please enable the Warp Gate module")
        const { actor, token, lArgs } = MidiMacros.targets(args)
        if (args[0] === "on") {
            if (!game.actors.getName("MidiSRD")) { await Actor.create({ name: "MidiSRD", type: "npc" }) }
            const sourceItem = await fromUuid(lArgs.origin)
            texture = texture || sourceItem.img
            let updates = {
                token: { "name": "Arcane Eye", "img": texture, "dimVision": 30, scale: 0.4, "flags": { "midi-srd": { "ArcaneEye": { "ActorId": actor.id } } } },
                actor: { "name": "Arcane Eye" }
            }
            let { x, y } = await MidiMacros.warpgateCrosshairs(token, 30, "Arcane Eye", texture, {}, -1)

            await warpgate.spawnAt({ x, y }, "MidiSRD", updates, { controllingActor: actor },);
        }
        if (args[0] === "off") {
            await MidiMacros.deleteTokens("ArcaneEye", actor)
        }
    }
