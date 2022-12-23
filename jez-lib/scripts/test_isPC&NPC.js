const MACRONAME = "test_isPC&NPC.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 
 * 12/19/22 0.1 Creation 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
let pcsString = "";
let npcsString = "";
const tempOnly = true;
//---------------------------------------------------------------------------------------------------------------------------------
const TOKEN_COUNT = jez.selectedTokens(MACRO)
if (!TOKEN_COUNT) return
//---------------------------------------------------------------------------------------------------------------------------------
for (let token of canvas.tokens.controlled) {
    console.log(`Token ${token.name}`,token.actor)
    if (await jez.isPC(token.actor.uuid, { traceLvl: TL })) pcsString += `<br>${token.name}`
    if (await jez.isNPC(token.actor.uuid, { traceLvl: TL })) npcsString += `<br>${token.name}`
}
msg = `Checked ${TOKEN_COUNT} tokens<br><br>
    These are PCs<br>-----------------${pcsString}<br><br>
    These are NPCs<br>------------------${npcsString}<br>`
jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: 'Icons_JGB/Misc/Jez.png', title: 'Token Check PC/NPC Status', msg: msg })
//---------------------------------------------------------------------------------------------------------------------------------
// Next, try a few actors by name from the actor directory
//
pcsString = ''
npcsString = ''
const ACTOR_NAMES = [ 'Giant Eagle', 'Amend', 'Olivia Ironlocke', 'Zombie' ]
// const ACTOR_NAMES = [ 'Olivia Ironlocke', 'Zombie' ]
for (let i = 0; i < ACTOR_NAMES.length; i++) {
    actor5e = game.actors.getName(ACTOR_NAMES[i])
    console.log(`Actor ${actor5e.name}`,actor5e)
    if (await jez.isPC(actor5e.uuid, { traceLvl: TL })) pcsString += `<br>${actor5e.name}`
    if (await jez.isNPC(actor5e.uuid, { traceLvl: TL })) npcsString += `<br>${actor5e.name}`
}
msg = `Checked ${ACTOR_NAMES.length} actors<br><br>
    These are PCs<br>-----------------${pcsString}<br><br>
    These are NPCs<br>------------------${npcsString}<br>`
jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: 'Icons_JGB/Misc/Jez.png', title: 'Actor Check PC/NPC Status', msg: msg })