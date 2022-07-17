const TL = 6
const DIR = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Regular_*_400x400.webm"
const file = await fetchFileName(DIR)
console.log(`File selected: ${file}`)

async function fetchFileName(path) {
    let matches = await FilePicker.browse("data", path, { wildcard: true })
    let files = matches.files
    // Returns a random integer from 0 to files.length-1:
    let sel = Math.floor(Math.random() * files.length);
    if (TL > 2) jez.trace(`fetchFileName | ${sel} of ${files.length}: ${files[sel]}`)
    return(files[sel])
}