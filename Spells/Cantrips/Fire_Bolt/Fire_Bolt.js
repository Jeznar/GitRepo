// https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/MidiQOL-&-JB2A-Fire-Bolt

let tokenD = canvas.tokens.get(args[0].tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;

// COOL-THING: Pick VFX color based on color of item image icon
let color = ""
const IMAGE = aItem.img.toLowerCase()
if(IMAGE.includes("blue")) color = "blue"
else if(IMAGE.includes("dark_green")) color = "dark_green"
else if(IMAGE.includes("green02")) color = "green02"
else if(IMAGE.includes("green")) color = "green"
else if(IMAGE.includes("dark_red")) color = "dark_red"
else if(IMAGE.includes("orange")) color = "orange"
else if(IMAGE.includes("purple")) color = "purple"
if (!color) color = "orange"

new Sequence()
    .effect()
        //.file("jb2a.fire_bolt.orange")
        .file(`jb2a.fire_bolt.${color}`)
        .atLocation(tokenD)
        .reachTowards(args[0].targets[0])
        .missed(args[0].hitTargets.length === 0)
    .play()