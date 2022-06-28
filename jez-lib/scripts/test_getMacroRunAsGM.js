console.log(getMacroRunAsGM("ImaginaryyMacro"))

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Test to see if the received string links to a run as GM macro.  Return the macro or false.
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function getMacroRunAsGM(macroName) {
    if (typeof macroName !== "string") {
        let msg = `isMacroRunAsGM() received non-string paramater.  Bad, bad, programmer.`
        console.log(msg, macroName)
        ui.notifications.error(`ERROR: ${msg}`)
        return(false)
    }
    const ACTOR_UPDATE = game.macros?.getName(macroName);
    if (!ACTOR_UPDATE) return jez.badNews(`Cannot locate ${macroName} GM Macro`,"Error");
    if (!ACTOR_UPDATE.data.flags["advanced-macros"].runAsGM) 
        return jez.badNews(`${macroName} "Execute as GM" needs to be checked.`,"Error");
    return(ACTOR_UPDATE)
}