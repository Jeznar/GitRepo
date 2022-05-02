const MACRONAME = "Infestation.1.1.js"
/*****************************************************************************************
 * Slap a text message on the item card indicating the direction of movement on a failed
 * saving throw.
 * 
 * Spell Description: You cause a cloud of mites, fleas, and other parasites to appear 
 *  momentarily on one creature you can see within range. The target must succeed on a 
 *  Constitution saving throw, or it takes 1d6 poison damage and moves 5 feet in a random 
 *  direction if it can move and its speed is at least 5 feet. Roll a d4 for the 
 *  direction: 1 north; 2 south; 3 east; or 4 west. This movement doesn’t provoke 
 *  opportunity attacks, and if the direction rolled is blocked, the target doesn’t move.
 * 
 *  The spell’s damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), 
 *  and 17th level (4d6).
 * 
 * I'm modifying it to use 8 directions listed in DIRECTION array.
 * 
 * 12/10/21 0.1 Creation of Macro
 * 01/20/22 1.0.1 Add code to force the move of the target token
 * 01/20/22 1.0.2 Addressing tokens of "even" sizes (large, gargantuan)
 * 05/02/22 1.1   Update for FoundryVTT 9.x and adding to GitHub
 *****************************************************************************************/
const DEBUG = true;
const GRID_SIZE = canvas.scene.data.grid;
const DIRECTION = [ // Reminder: 0 is North!
    "East (Right)", "South East (Down/Right)",
    "South (Down)", "South West (Down/Left)",
    "West (Left)", "North West (Up/Left)",
    "North (Up)", "North East (Up/Right)"];
let msg = "";
let errorMsg = "";
let dir = 0 // direction of movement (0 North, 1 North East, etc...)
let distPixels = GRID_SIZE  // Distance to move one orthogal (N, E, S, W) space in pixels
jez.log(`args[0]: `, args[0]);
// ---------------------------------------------------------------------------------------
// Verify that we have only one target in our sites.
//
if (!oneTarget()) {
    ui.notifications.error(errorMsg)
    jez.log(errorMsg)
    postResults(msg)
    return (false)
}
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
let tActor = tToken?.actor;
// ---------------------------------------------------------------------------------------
// If the target saved, post result and terminate 
//
if (args[0].saves.length !== 0) {
    msg = `${tToken.name} managed to avoid the effects.`
    jez.log(` ${msg}`, args[0].saves);
    postResults(msg)
    return;
}
// ---------------------------------------------------------------------------------------
// If the target can't move at least 5 feet, post result and terminate 
//
let walkSpeed = tActor.data.data.attributes.movement.walk
if (walkSpeed < 5) {
    runVFX(tToken)
    msg = `${tToken.name} can only move ${walkSpeed} feet per turn.  They can not be 
    forced to move 5 feet under their own power.`
    postResults(msg)
    return;
}
//const allowedTags = ["saves-display", "attack-roll", "damage-roll", "hits-display", "other-roll"]
// 
// ---------------------------------------------------------------------------------------
// Roll the new Direction of Movement.
//
//let yDist = GRID_SIZE
let angle = 0
let directionRoll = new Roll(`1d8`).evaluate({ async: false });
game.dice3d?.showForRoll(directionRoll);
let dirRoll = directionRoll.total - 1

let xMult, yMult = 0
let xDist, yDist = 0
angle = (dirRoll * 45)
//angle = 2 * 45 // Forcing the direction to south
xMult = Math.cos(angle * Math.PI / 180)
yMult = Math.sin(angle * Math.PI / 180)
xDist = GRID_SIZE * xMult
yDist = GRID_SIZE * yMult
// ---------------------------------------------------------------------------------------
// Calculate offset (fudge) needed  to get from the token center to the center of its top 
// left hand square.  This assumes tokens are square. 
//
let fudge = 0
if (tToken.data.height === 2) {     
    fudge = GRID_SIZE/2
    jez.log(`${tToken.name} is size "2", set fudge to ${fudge}`)
} else if (tToken.data.height === 4) {     
    fudge = GRID_SIZE/2 + GRID_SIZE
    jez.log(`${tToken.name} is size "4", set fudge to ${fudge}`)
}

let newCenter = {
    "x": tToken.center.x + xDist - fudge,
    "y": tToken.center.y + yDist - fudge
}
jez.log("Inputs",
    "tToken.center.x",tToken.center.x,"xDist",xDist,"newCenter.x",newCenter.x,
    "tToken.center.y",tToken.center.y,"yDist",yDist,"newCenter.y",newCenter.y)
jez.log(`New Center: ${newCenter.x}, ${newCenter.y}`)
jez.log(` ${angle} degrees: (${xDist}, ${yDist}) ==> ${newCenter.x}, ${newCenter.y}`)
let newX = (Math.floor((newCenter.x) / GRID_SIZE)) + 1
let newY = (Math.floor((newCenter.y) / GRID_SIZE)) + 1
jez.log(`     new square x,y (${newX},${newY})`)
jez.log(`Direction Roll: ${dirRoll}, ${DIRECTION[dirRoll]}`)
jez.log(`Previous Center:    ${tToken.center.x}, ${tToken.center.y}`)
jez.log(`Move distances:     ${xDist}, ${yDist}`)

jez.log(`new square x,y (${newX},${newY})`)
jez.log(`new corner coords ((${(newX - 1) * GRID_SIZE},${(newY - 1) * GRID_SIZE})`)

await tToken.document.update({ "x": (newX - 1) * GRID_SIZE, "y": (newY - 1) * GRID_SIZE });
runVFX(tToken)

// ---------------------------------------------------------------------------------------
// Post that the target failed and the consequences.
//
const TARNAME = args[0].targets[0].data.name;
msg = `<b>${TARNAME}</b> failed its saving throw. It moved <b>5 feet ${DIRECTION[dirRoll]}</b>,
       This movement does not provoke opportunity attacks. If the direction is blocked, the target 
       should not move, it may need to be manually put back at starting spot.`;
postResults(msg)
/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        errorMsg = `Targeted nothing, must target single token to be acted upon`;
        jez.log(errorMsg);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        errorMsg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        jez.log(errorMsg);
        return (false);
    }
    jez.log(`Targeting one target, a good thing`);
    return (true);
}
/***************************************************************************************************
 * Play the VFX for the fire effect, type is "heal" or "fire" and nothing else
 ***************************************************************************************************/
 async function runVFX(token5e) {
    let vfxEffect = "jb2a.butterflies.many.red"
    //await jez.wait(2000)
    new Sequence()
    .effect()
        .file(vfxEffect)
        .atLocation(token5e) 
        .scaleToObject(1.2)
        .opacity(1)
    .play();
 }