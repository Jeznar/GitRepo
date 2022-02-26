const MACRONAME = "eyebite_frightened_helper.js"
/*****************************************************************************************
 * helper macro that checks LoS and Distance to the originating token.  If no LoS and far
 * enough, the debuff is cleared.
 * 
 * 02/22/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
let msg = "";
const FRIGHTENED_JRNL = `@JournalEntry[${game.journal.getName("Frightened").id}]{Frightened}`
const FRIGHTENED_ICON = "Icons_JGB/Monster_Features/Frightened.png"
//----------------------------------------------------------------------------------
// Obtain info on the effect
//
let effect = await aToken.actor.effects.find(i => i.data.label === "Frightened");
if (!effect) {
    msg = `Something went sideways.  ${aToken.name} does not have Frightened effect`    
    ui.notifications.error(msg)
    console.log(msg)
    return(false);
}
jez.log("effect", effect)
let oTokenId = effect.data.origin   // Origin token id stashed here by main program
let oToken = canvas.tokens.placeables.find(ef => ef.id === oTokenId)
jez.log(`Origin Token, ${oToken.name}`, oToken)
//-----------------------------------------------------------------------------------------
// Check to see if vision is blocked by a wall between current pair
// COOL-THING: Check LoS between two tokens
//
let goodLoS = true
let blocked = canvas.walls.checkCollision(new Ray(aToken.center, oToken.center),
    { type: "sight", mode: "any" })
if (blocked) {
    jez.log(`${aToken.name} has no LoS to ${oToken.name}`)
    goodLoS = false
    // TODO: Do something about blocked LoS
} else jez.log(`${aToken.name} has GOOD LoS to ${oToken.name}`)
//-----------------------------------------------------------------------------------------
// Check to see if pair is within 60 feet of each other
// COOL-THING: Check range between two tokens
//
let inRange = jez.inRange(oToken, aToken, 60)
jez.log("In Range", inRange)
//-----------------------------------------------------------------------------------------
// If LoS is good, post appropriate message and terminate
//
if (goodLoS) {
    msg = `<b>${aToken.name}</b> has unobstructed LoS to <b>${oToken.name}</b> and continues 
        to suffer from ${FRIGHTENED_JRNL}.`
    jez.postMessage({color:"dodgerblue", fSize:14, icon:FRIGHTENED_ICON, 
        msg:msg, title:`${aToken.name} fears ${oToken.name}`, token:aToken})
    return
}
//-----------------------------------------------------------------------------------------
// If LoS is blocked but within range, post appropriate message and terminate
//
if (!goodLoS && inRange) {
    msg = `<b>${aToken.name}</b> can not see <b>${oToken.name}</b> but can sense the closeness of the 
        source of the fear effect. <b>${aToken.name}</b> remains ${FRIGHTENED_JRNL}.`
    jez.postMessage({color:"dodgerblue", fSize:14, icon:FRIGHTENED_ICON, 
        msg:msg, title:`${aToken.name} fears ${oToken.name}`, token:aToken})
    return
}
//-----------------------------------------------------------------------------------------
// Tokens lack LoS and are out of range, time to remove the fear effect.
// 
game.cub.removeCondition("Frightened", aToken)
msg = `<b>${aToken.name}</b> can not see <b>${oToken.name}</b> and is far enough away to 
    rally. <b>${aToken.name}</b> is no longer ${FRIGHTENED_JRNL}.`
jez.postMessage({color:"dodgerblue", fSize:14, icon:FRIGHTENED_ICON, 
msg:msg, title:`${aToken.name} fears ${oToken.name}`, token:aToken})
return