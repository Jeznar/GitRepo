const TL = 6
const DIR = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Regular_*_400x400.webm"
const AVG_DUR = await avgDuration(DIR)
console.log(`Average Duration ${AVG_DUR} for ${DIR}`)

async function avgDuration(path) {
    let dirMatches = await FilePicker.browse("data", path, { wildcard: true })
    let min, max
    let total = 0
    for (let i = 0; i < dirMatches.files.length; i++) {
        const TEXTURE = await loadTexture(dirMatches.files[i]);
        const DURATION = TEXTURE.baseTexture.resource.source.duration;
        if (!min) min = DURATION; else if (min > DURATION) min = DURATION
        if (!max) max = DURATION; else if (max < DURATION) max = DURATION
        total = total + DURATION
        if (TL > 5) jez.trace(`${i} ${DURATION} second duration for ${dirMatches.files[i]}`)
    }
    let average = (total / dirMatches.files.length).toFixed(2)
    if (TL > 0) jez.trace(`${average} sec avg duration, ${min} min, ${max} max for ${dirMatches.files.length} files
          matching ${path}`)
    return (average)
}