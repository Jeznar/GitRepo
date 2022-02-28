// https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/MidiQOL-&-JB2A-Fire-Bolt

let tokenD = canvas.tokens.get(args[0].tokenId);

new Sequence()
    .effect()
        .file("jb2a.fire_bolt.orange")
        .atLocation(tokenD)
        .reachTowards(args[0].targets[0])
        .missed(args[0].hitTargets.length === 0)
    .play()