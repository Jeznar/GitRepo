const MACRONAME = "TokenMoldSettings.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Messing with Token Mold settings with intent of learning how to temporaily suppress the rename
 * setting.
 * 
 * 07/06/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/

jez.suppressTokenMoldRenaming(2500)

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * If the token-mold module is active, check to see if renaming is enabled.  If it is, turn it off 
 * for a bit and then turn it back on. The bit is determined f=by the optional argument.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function suppressTokenMoldRenaming(delay = 500) {
    const FUNCNAME = `jez.suppressTokenMoldRenaming()`
    if (game.modules.get("token-mold")) {
        jez.log(`${FUNCNAME} | Found token-mold, checking renaming`)
        // Grab the current Tokenmold settings
        let tokenMoldSettings = game.settings.get("Token-Mold", "everyone");
        if (tokenMoldSettings.name.use === true) {
            // Toggle renaming off
            tokenMoldSettings.name.use = false
            await game.settings.set("Token-Mold", "everyone", tokenMoldSettings)
            jez.log(`${FUNCNAME} | Renaming was enabled, suppressing for ${delay/1000} seconds.`)
            // Wait for passed amount of time before restoring
            await jez.wait(delay)
            // Toggle renaming on
            tokenMoldSettings.name.use = true
            await game.settings.set("Token-Mold", "everyone", tokenMoldSettings)
            jez.log(`${FUNCNAME} | Renaming has been re-enabled.`)
        } 
        else jez.log(`${FUNCNAME} | Renaming was already diaabled, did nothing.`)
    }
}
