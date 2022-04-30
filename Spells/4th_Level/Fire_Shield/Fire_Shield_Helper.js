// This macro runs VFX for Fire Shield
let color = "orange"
const IMAGE = args[0]?.item.img.toLowerCase()
if(IMAGE.includes("blue")) color = "blue"
new Sequence()
    .effect()
    .file(`jb2a.fire_bolt.${color}`)
    .atLocation(canvas.tokens.get(args[0].tokenId))
    .stretchTo(args[0].targets[0])
    .play()