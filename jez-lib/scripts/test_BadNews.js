jez.badNews(42)
jez.badNews("Plain Message")
await jez.wait(5500)
jez.badNews("Info Message", 1)  // Information
jez.badNews("Warn Message", 2)  // Warning
jez.badNews("Error Message", 3) // Error
await jez.wait(5500)
jez.badNews("Info Message", "info them!")  // Information
jez.badNews("Warn Message", "WARN THEM!")  // Warning
jez.badNews("Error Message", "error") // Error
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Pop the passed string (message) onto the console and as ui notification and return false.
 * 
 * This function can accept one or two arguments
 * message: required string that will be used as the error message
 * badness: optional severity indicator.  It can be an integer (1, 2, or 3) or a string that begins 
 *          with a i, w, or e (technically, the code is much more permissive but this is intent.)
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function badNews(message, badness = 2) {
    if (typeof message !== "string") {
        let msg = `The message paramater passed to badNews must be a string.  Bad, bad, programmer.`
        console.log(msg, message)
        ui.notifications.error(`ERROR: ${msg}`)
        return(false)
    }
    if (typeof badness === "string") {
        switch (badness.toLowerCase().at(0)) {
            case "i": badness = 1; break
            case "w": badness = 2; break
            default: badness = 3
        }
    }
    console.log(`BadNews | ${message}`)
    if (badness < 2) ui.notifications.info(`INFO: ${message}`)
    else if (badness === 2) ui.notifications.warn(`WARN: ${message}`)
    else ui.notifications.error(`ERROR: ${message}`)
    return (false)
}