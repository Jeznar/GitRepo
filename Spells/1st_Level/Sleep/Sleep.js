const MACRONAME = "Sleep.2.0.js"
//############################################################################################################
// READ FIRST
// based on @ccjmk macro for sleep. Gets targets and ignores those who are immune to sleep.
// Midi-qol "On Use"
// Uses Damage roll on item, set damage to "no damage" in the drop down
//############################################################################################################
/* Downloaded from Crymic's repository
 * https://gitlab.com/crymic/foundry-vtt-macros/-/blob/8.x/5e/Spells/Level%201/Sleep.js
 *
 * 11/02/21 1.1 JGB Added debug statements to trace apparent issue
 * 11/03/21 1.2 JKM Expanded really wide non-working immunity line
 * 11/03/21 1.3 JGB Minor reformatting and debug level setting
 * 11/04/21 1.4 JGB Workaround for Mini-QoL feature that breaks "isDamaged" effect when on zero damage attack. 
 *                  Also, avoid double application of prone contion.      
 * 02/18/22 1.5 JGB Update to use jez.lib functions and handle VFX          
 * 05/13/22 1.6 JGB Update to read color string from icon to set VFX color   
 * 08/01/22 2.0 JGB Rewritten so that it has a more logical flow and handles multiple choices for last sleeper
 *************************************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const TL = 0
const TAG = MACRO
if (TL>0) jez.trace(`${TAG} ============== Starting === ${MACRONAME} =================`);
if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`${TAG} args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;         
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor; 
//
// Set the value for the Active Item (aItem)
let aItem;         
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let immuneRaces = ["undead", "construct", "elf"];   // Set strings that define immune races
const CONDITION = "Unconscious";                    // CONDITION to be slept representing sleep 
let gameRound = game.combat ? game.combat.round : 0;// Added missing initilization -JGB
let effectData = [];                                // Array to hold effect data
let sleptCount = 0                                  // Count of targets slept
let sleptNames = []                                 // Array of names of slet targets
//---------------------------------------------------------------------------------------------------
// Define the HP Pool for this execution
//
const sleepHp = await args[0].damageTotal;
if (!sleepHp) return ui.notifications.error("Set the Spells Damage Details to 'No Damage'");
if (TL>1) jez.trace(`${TAG} Available HP Pool [${sleepHp}] points`);
let remainingSleepHp = sleepHp;
//---------------------------------------------------------------------------------------------------
// Build array of eligible targets from all those tokens targeted.
//
let ct = canvas.tokens
if (TL>3) jez.trace(`${TAG} canvas.tokens`, ct);
let targets = await args[0].targets.filter(i=> i.actor.data.data.attributes.hp.value != 0).sort((a, b) => 
    ct.get(a.id).actor.data.data.attributes.hp.value + ct.get(a.id).actor.data.data.attributes.hp.temp < 
    ct.get(b.id).actor.data.data.attributes.hp.value + ct.get(b.id).actor.data.data.attributes.hp.temp ? 
    -1 : 1);
if (TL>3) jez.trace(`${TAG} targets`, targets);
//---------------------------------------------------------------------------------------------------
// Slice off those targets that have more health (normal + temp) than the entire HP Pool
//
for (let i = 0; i < targets.length; i++) {
    if (TL>4) jez.trace(`${TAG} Checking ${targets[i].name}`, targets[i]);
    if (targets[i].actor.data.data.attributes.hp.value + targets[i].actor.data.data.attributes.hp.temp <= 
        sleepHp) continue
    if (TL>1) jez.trace(`${TAG} ${targets[i].name} has more HP than pool, truncating target list`);
    targets.length = i; // Clip the array just before the current entry
    break;              // Terminate our scan as we have all those that have HP that could be slept
}
//---------------------------------------------------------------------------------------------------
// Launch the VFX
//
runVFX({traceLvl: 0})
//---------------------------------------------------------------------------------------------------
// Build array of eligible targets from all those tokens targeted.
//
let eTargs = pruneImmunes(targets, {traceLvl: 0})
console.log("")
if (TL>2) for (let target of eTargs) {      // If tracing, spit out eligible list
    let normalHP = target.actor.data.data.attributes.hp.value
    let tempHP = target.actor.data.data.attributes.hp.temp
    jez.trace(`${TAG} Eligible: ${target.name} HP: ${normalHP} Normal, ${tempHP} Temp`)
}
//---------------------------------------------------------------------------------------------------
// Build array of slept targets checking to make sure that we randomly select from targets that are
// tied in HP value at the end of the pool so that those excluded are actually random.
//
let sleepers = pickSleepers(eTargs, { traceLvl: 0 })
if (TL>1) for (let target of sleepers) {    // If tracing, spit out to be slept list
    let normalHP = target.actor.data.data.attributes.hp.value
    let tempHP = target.actor.data.data.attributes.hp.temp
    jez.trace(`${TAG} Sleeper: ${target.name} HP: ${normalHP} Normal, ${tempHP} Temp`)
}
//---------------------------------------------------------------------------------------------------
// Obtain, modify and CE CONDITION to be used 
//
let effect = game.dfreds.effectInterface.findEffectByName(CONDITION).convertToObject();
effect.duration = { rounds: 10, startRound: gameRound, startTime: game.time.worldTime }
// Following line seems to tickle a bug in CE that causes the special duration to be set into 
// reference copy so I'll make my function that applies sleep add this condition to each
// effect.flags.dae.specialDuration = ["isDamaged"]  // Add to the effect's special duration
//---------------------------------------------------------------------------------------------------
// Loop through the sleepers list, putting them to sleep (yea!)
//
for (let sleeper of sleepers) {
    if (TL > 1) jez.trace(`${TAG} Putting ${sleeper.name} to sleep`, sleeper);
    applySleep(sleeper, effect, {traceLvl:0})
    sleptNames.push(sleeper.name)
    sleptCount++
}
//---------------------------------------------------------------------------------------------------
// Update the chat card with results
//
let nameList = ""
msg = `${sleptCount} creatures have been put to sleep.`
if (sleptCount === 1) msg = msg + `<br><br>${sleptNames[0]}`
if (sleptCount > 1) {
    sleptNames.sort()
    for (let i = 0; i < sleptCount; i++)
        if (nameList) nameList = `${nameList},<br>${sleptNames[i]}`
        else nameList = `<br><br>${sleptNames[i]}`
    msg = msg + nameList
}
postResults(msg)
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]

    if (TL > 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
}
/***********************************************************************************************************************
 * Function to actually apply sleep and prone (unless already prone)
************************************************************************************************************************/
async function applySleep(TARG, effectData, options={}) {
    const TL = options.traceLvl ?? 0
    const FUNCNAME = "applySleep(TARG, effectData, options=())";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |` 
    if (TL>1) jez.trace(`${TAG} --- Start ---`);
    //----------------------------------------------------------------------------------------
    // Apply CE CONDITION passed to us
    //
    if (TL>2) jez.trace(`${TAG} target data`, TARG);
    if (TL>2) jez.trace(`${TAG} effect data`, effectData);
    game.dfreds.effectInterface.addEffectWith({ effectData: effectData, uuid: TARG.actor.uuid,
        origin: aActor.uuid
    });
    await jez.wait(1000)
    //----------------------------------------------------------------------------------------
    // Just for fun, have them pop out some Z's
    //
    await jez.wait(Math.floor(Math.random() * 3000))
    bubbleForAll(TARG.id, `Zzzzz...`, true, true)
    //----------------------------------------------------------------------------------------
    // Find CONDITION just applied and patch in a special duration to dance around CE oddness
    // This seems like it shouldn't be required.  Issue opened against CE Module.
    //
    //          https://github.com/DFreds/dfreds-convenient-effects/issues/161
    //
    let effect = await TARG.actor.effects.find(i => i.data.label === CONDITION);
    if (!effect) return jez.badNews(`Could not find ${CONDITION} effect on ${TARG.name}`, "w")
    await effect.update({ 'flags.dae.specialDuration': ["isDamaged"] });
    //----------------------------------------------------------------------------------------
    // Knock the target prone, if it isn't already prone
    //
    await jezcon.addCondition("Prone", TARG.actor.uuid, { allowDups: false })
    //----------------------------------------------------------------------------------------
    // Just for fun, have them pop out some Z's
    //
    await jez.wait(Math.floor(Math.random() * 5000))
    bubbleForAll(TARG.id, `Zzzzz...`, true, true)
}
/*****************************************************************************************************
 * Prune out the immune or otherwise unaffectable targets from our list and return the result
 *****************************************************************************************************/
 function pruneImmunes(targets, options = {}) {
    const TL = options.traceLvl ?? 0
    const FUNCNAME = "pruneImmunes(targets, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |` 
    if (TL>1) jez.trace(`${TAG} --- Start ---`);
    let eligibleTargets = []
    //---------------------------------------------------------------------------------------------------
    // Loop through the targets only keeping eligible targets
    //
    chkTarget: for (let target of targets) {
        const THIS_TARG = target._object
        if (TL > 2) jez.trace(`${TAG} Considering ${THIS_TARG.name}`, THIS_TARG);
        let rtnVal = jezcon.hasCE("Unconscious", THIS_TARG.actor.uuid, { traceLvl: 0 })
        if (rtnVal) {
            if (TL > 1) jez.trace(`${TAG} ${THIS_TARG.name} is aleady slept (unconscious)`);
            continue chkTarget
        }
        // Check Specific Condition Immunities looking for "unconscious"
        if (THIS_TARG.actor.data.data.traits.ci) {
            const CI = THIS_TARG.actor.data.data.traits.ci.value
            for (let i = 0; i < CI.length; i++)
                if (CI[i] === "unconscious") {
                    if (TL > 1) jez.trace(`${TAG} ${THIS_TARG.name} has immunity to unconscious checked`);
                    continue chkTarget
                }
        }
        // Check Custom Condition Immunities looking for "sleep" and "slept"
        if (THIS_TARG.actor.data.data.traits.ci.custom) {
            const CUST_IMMUNITY = THIS_TARG.actor.data.data.traits.ci.custom.toLowerCase()
            if (CUST_IMMUNITY.includes("slept") || CUST_IMMUNITY.includes("sleep")) {
                if (TL > 1) jez.trace(`${TAG} ${THIS_TARG.name} has custom immunity (sleep or slept)`, CUST_IMMUNITY);
                continue chkTarget
            }
        }
        // Check Race for immunity against immuneRaces array
        let RACE = jez.getRace(THIS_TARG).toLowerCase()
        if (TL > 3) jez.trace(`${TAG} ${THIS_TARG.name} race`, RACE)
        if (RACE) {
            for (let immuneRace of immuneRaces) {
                if (RACE.includes(immuneRace)) {
                    if (TL > 1) jez.trace(`${TAG} ${THIS_TARG.name}'s immune race is ${RACE}`);
                    continue chkTarget
                }
            }
        }
        // Check individual HP normal plus temp against total available, eliminating if more than possible.
        eligibleTargets.push(THIS_TARG)
    }
    // Return our restultant list
    if (TL > 1) jez.trace(`${TAG} Finished, returning`, eligibleTargets)
    return eligibleTargets
}
/*****************************************************************************************************
 * Pick out the sleepers from the targets available
 *****************************************************************************************************/
 function pickSleepers(eTargs, options = {}) {
    const TL = options.traceLvl ?? 0
    const FUNCNAME = "pickSleepers(eTargs, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Start ---`);
    //---------------------------------------------------------------------------------------------------
    // Loop through the targets only keeping eligible targets
    //
    let sleepers = []
    addSleepers: for (let i = 0; i < eTargs.length; i++) {
        const TARG_HP = eTargs[i].actor.data.data.attributes.hp.value + eTargs[i].actor.data.data.attributes.hp.temp
        if (TARG_HP > remainingSleepHp) break       // Ran out of budget on this item
        if (i < eTargs.length - 1) {                // At least one more to consider, need to look ahead
            let nextHPnorm = eTargs[i + 1].actor.data.data.attributes.hp.value
            let nextHPtemp = eTargs[i + 1].actor.data.data.attributes.hp.temp
            let nextHP = nextHPnorm + nextHPtemp    // Total health of next target in list
            if (TARG_HP < nextHP) {                // Current target has less health than next
                if (TL > 2) jez.trace(`${TAG} ${eTargs[i].name} added to sleepers list`);
                sleepers.push(eTargs[i])            // Store current target in our sleepers list
                remainingSleepHp -= TARG_HP         // Remove the target's HP from pool
                continue addSleepers                // Go on to next target
            } else {                                // At least next target has same health
                if (TL > 3) jez.trace(`${TAG} Starting at ${eTargs[i].name} multiple with same HP (${TARG_HP})`);
                let matches = [];                   // So far we have one HP match
                for (let j = i; j < eTargs.length; j++) {   // step forward through list
                    matches.push(eTargs[j])         // Add target to our list of matches
                    let n = eTargs[j + 1].actor.data.data.attributes.hp.value
                    let t = eTargs[j + 1].actor.data.data.attributes.hp.temp
                    if (n + t > TARG_HP) { i = j; break }
                    if (TL > 2) jez.trace(`${TAG} ${eTargs[j].name} has same HP (${n}+${t})`);
                }
                // Print out info on the set of matches
                if (TL > 1) for (let j = 0; j < matches.length; j++)
                    jez.trace(`${TAG} Matches at ${TARG_HP}HP ${j} ${matches[j].name}`);
                // Need to randomly pick those from the matches that fit inside the budget
                let x = 0
                while (TARG_HP < remainingSleepHp) {// Select matches while budge allows
                    if (TL > 2) jez.trace(`${TAG} Looking through ${matches.length} matches`, matches);
                    if (!matches.length) break      // No remaining matches break out
                    matches = pickMatch(matches)    // Pick a match and set new list of matches
                }
                // Function to pick a match
                function pickMatch(matches) {
                    // Obtain a random integer from 0 to matches.length-1
                    let sel = Math.floor(Math.random() * matches.length);
                    if (TL > 1) jez.trace(`${TAG} Selected #${sel} ${matches[sel].name} from matches`, matches);
                    sleepers.push(matches[sel])         // Store selected target in our sleepers list
                    remainingSleepHp -= TARG_HP         // Remove the selection's HP from pool
                    // Remove the selection from matches array
                    if (TL > 3) jez.trace(`${TAG} matches list before splice`, matches);
                    matches.splice(sel, 1)              // splice out match used    
                    if (TL > 3) jez.trace(`${TAG} matches list after splice`, matches);
                    return matches
                }

            }
        }
        else sleepers.push(eTargs[i])           // Last one fit inside budget, rare occurance
    }
    return(sleepers)
}
/***************************************************************************************************
 * Perform the VFX code
 ***************************************************************************************************/
async function runVFX(options = {}) {
    const TL = options.traceLvl ?? 0
    const FUNCNAME = "runVFX()";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |` 
    if (TL>1) jez.trace(`${TAG} --- Start ---`);
    const VFX_NAME = `${MACRO}`
    const VFX_OPACITY = 0.5;
    const VFX_SCALE = 2.7;
    const templateID = args[0].templateId
    if (TL>2) jez.trace(`${TAG} templateID`, templateID)
    //----------------------------------------------------------------------------------------------
    // Pick a colour based on a colour string found in the icon's name.
    // Color Mappings (Icon String : VFX Color):
    // royal:dark_orangepurple, eerie:dark_purple, sky:blue, blue:blue, jade:green, magenta:pink, fire:yellow
    //
    let color = "yellow"
    const IMAGE = aItem.img.toLowerCase()
    if (IMAGE.includes("royal")) color = "Dark_OrangePurple"
    else if (IMAGE.includes("eerie")) color = "Dark_Purple"
    else if (IMAGE.includes("sky")) color = "Regular_Blue"
    else if (IMAGE.includes("blue")) color = "Regular_Blue"
    else if (IMAGE.includes("jade")) color = "Regular_Green"
    else if (IMAGE.includes("magenta")) color = "Regular_Pink"
    else if (IMAGE.includes("fire")) color = "Regular_Yellow"
    if (TL>2) jez.trace(`${TAG} Color selected: ${color}`)
    const VFX_LOOP = `modules/jb2a_patreon/Library/1st_Level/Sleep/Cloud01_01_${color}_400x400.webm`
    if (TL>2) jez.trace(`${TAG} VFX_File: ${VFX_LOOP}`)
    new Sequence()
    .effect()
        .file(VFX_LOOP)
        .atLocation(templateID) // Effect will appear at  template, center
        .scale(VFX_SCALE)
        .scaleIn(0.25, 1000)    // Expand from 0.25 to 1 size over 1 second
        .rotateIn(180, 1000)    // 1/2 Rotation over 1 second 
        .scaleOut(0.25, 1000)   // Contract from 1 to 0.25 size over 1 second
        .rotateOut(180, 1000)   // 1/2 Counter Rotation over 1 second
        .opacity(VFX_OPACITY)
        .duration(6000)
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(10)             // Fade in for specified time in milliseconds
        .fadeOut(1000)          // Fade out for specified time in milliseconds
        .extraEndDuration(1200) // Time padding on exit to connect to Outro effect
    .play();
    await jez.wait(100)         // Don't delete till VFX established
    canvas.templates.get(templateID).document.delete()
    if (TL>1) jez.trace(`${TAG} --- Finish ---`);
}