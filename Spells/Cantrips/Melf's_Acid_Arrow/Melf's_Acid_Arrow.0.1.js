const MACRONAME = "Melf's_Acid_Arrow.0.1"
console.log(MACRONAME)
/*****************************************************************************************
 * Create a temporary attack item to use against the victim of Heat Metal
 * 
 * 01/01/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
log("")
log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

const lastArg = args[args.length - 1];
log("lastArg", lastArg);

const spellLevel = lastArg.spellLevel;
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.aItemata;
const damageType = "acid";
const gameRound = game.combat ? game.combat.round : 0;
let damageRoll;
let msg = "";
let errorMsg = "";

if (!oneTarget()) {
    log(errorMsg)
    ui.notifications.error(errorMsg)
    return(false)
}

let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
playVFX(aToken, tToken)
await wait(1000) // Let the VFX substatially complete before the damage rolls

if (lastArg.hitTargets.length > 0) {
    log(`${lastArg.hitTargets.length} Target(s) hit.`)
    let effectData = {
        label: aItem.name,
        icon: aItem.img,
        flags: { dae: { itemData: aItem, macroRepeat: "none", specialDuration: ["turnEnd"] } },
        origin: lastArg.uuid,
        disabled: false,
        duration: { turns: 2, startRound: gameRound, startTime: game.time.worldTime },
        changes: [
            {
                key: `flags.midi-qol.OverTime`,
                mode: 2,
                value: `turn=end,label=${aItem.name},damageRoll=${spellLevel}d4,damageType=${damageType}`,
                priority: 20
            },
        ]
    };

    log(`Add effect ${aItem.name} to ${tToken.name}`)  
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });

    log(`Roll immediate damage from ${aItem.name} to ${tToken.name}`)
    damageRoll = new Roll(`${spellLevel + 2}d4`).evaluate({ async: false });
    log(`Roll results`, damageRoll)
    game.dice3d?.showForRoll(damageRoll);
    log(`Apply Damage ${damageRoll.total} ${damageType}`)
    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, damageType, [tToken], damageRoll,
        { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemCardId: lastArg.itemCardId, useOther: false });
    msg = `<p style="color:Olive;font-size:14px;">${tToken.name} is hit by the acid arrow and begins to melt.</p>`
    await postResults(msg);
} else {
    log(`${tToken.name} was missed, doing half damage.`)
    damageRoll = new Roll(`${spellLevel}d4`).evaluate({ async: false });
    log(`Roll results`, damageRoll)
    game.dice3d?.showForRoll(damageRoll);
    log(`Apply Damage ${damageRoll.total} ${damageType}`)
    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, damageType, [tToken], damageRoll,
        { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemCardId: lastArg.itemCardId, useOther: false });
    msg = `<p style="color:Olive;font-size:14px;">${tToken.name} is splashed by the near miss, taking a bit of damage.</p>`
    await postResults(msg);
}
log("That's all folks.")
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

async function playVFX(aToken5E, tToken5E) {
    log(`lets play a VFX from ${aToken5E.name} to ${tToken5E.name}`,tToken5E)
    new Sequence()
        .effect()
        .file("modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/Arrow02_01_Regular_Green_Poison_30ft_1600x400.webm")
        .atLocation(aToken5E)
        .stretchTo(tToken5E)
        .missed(args[0].hitTargets.length === 0)
        .play()
}

/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        errorMsg = `Targeted nothing, must target single token to be acted upon`;
        log(errorMsg);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        errorMsg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        log(errorMsg);
        return (false);
    }
    log(`Targeting one target, a good thing`);
    return (true);
}


/***************************************************************************************************
 * Post the results to chat card
 ***************************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    log(`chatMessage: `,chatMessage);
    //const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    //const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}

/***************************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************************/
function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    }
}
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }