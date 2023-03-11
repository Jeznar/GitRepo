const MACRONAME = "Rite-Evil_Eye.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Home Brewed modification of Kibble's Occultist Evil Eye.  This implementation inflicts Bane instead of Frightened to avoid 
 * further overlap of that ability. Immunity implemented as till end of next long rest or next new day.
 * 
 *   You gain the ability to lay the most unsettling gaze upon a creature. As a reaction to a creature within 15 feet attacking 
 *   you, you can unleash a terrifying glare at them (occuring after the attack completes). The target creature must make a Wisdom 
 *   saving throw against your spell save DC or become frightened of you until the end of your next turn. "Once a creature has 
 *   succeeded on a save against this ability, they are immune to it for 24 hours.
 * 
 *   Additionally, you gain proficiency in the Intimidation skill.
 * 
 * Basic outline of implementation
 * -------------------------------
 * o Add proficency with Intimidation manually to the owning actor
 * o Wis Saving throw implemented on the item card
 * o OnUse Function 
 *   - Check for immunity effect on the target, if found exit with message
 *   - Check saving throw, if it succeeded, Apply immunity DAE effect, exit with message
 *   - If failed apply the Evil Eye effect (Bane till end of caster's next turn)
 *   - Post appropriate message
 * 
 * 03/11/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
const GLARE_IMMUNE_NAME = `Witch's Glare Immune`
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//

//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (args[0].targets.length !== 1)
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, 'w')
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Is the target immune (has the appropriate DAE immunity effect)
    //
    const GLARE_IMMUNE = await tToken?.actor?.effects?.find(ef => ef?.data?.label === GLARE_IMMUNE_NAME
             && ef?.data?.origin ===  L_ARG.uuid)
    if (TL > 1) jez.trace(`${TAG} GLARE_IMMUNE`, GLARE_IMMUNE)
    if (GLARE_IMMUNE) {
        msg = `${tToken.name} is immune to ${tToken.name};s ${aItem.name}.`;
        postResults(msg);
        return // Exiting if immune
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Did the target Make Save?
    //
    if (args[0].failedSaves.length !== 1) {
        msg = `${tToken.name} made save: no effect and ${tToken.name} is now immune to ${aItem.name}.`;
        postResults(msg);
        // Add the GLARE_IMMUNE_NAME effect to the target
        const CE_DESC = `Immune to ${aToken.name}'s ${aItem.name} until next long rest or day`
        let effectData = {
            label: GLARE_IMMUNE_NAME,
            icon: 'Icons_JGB/Rites/Rite-Evil_Eye/Evil_Eye_Immune.png',
            origin: L_ARG.uuid,
            disabled: false,
            flags: {
                convenientDescription: CE_DESC,
                dae: { specialDuration: ["longRest", "newDay"] },
                core: { statusId: 'Force Display'}
            },
        };
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
        return; // Exiting if save was made
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply the Evil Eye effect (Bane till end of caster's next turn)
    //
    const CE_DESC = `Suffers -1d4-2 on attack and save attempts`
    let effectData = {
        label: `${aToken.name}'s Glare`,
        icon: aItem.img,
        origin: L_ARG.uuid,
        disabled: false,
        flags: {
            convenientDescription: CE_DESC,
            dae: { specialDuration: ["turnEndSource"] },
            core: { statusId: 'Force Display'}
        },
        duration: { seconds: 12, startTime: game.time.worldTime },
        changes: [
            { key: `data.bonuses.abilities.save`, mode: jez.ADD, value: '-1d4 -2', priority: 20 },
            { key: `data.bonuses.mwak.attack`, mode: jez.ADD, value: '-1d4 -2', priority: 20 },
            { key: `data.bonuses.msak.attack`, mode: jez.ADD, value: '-1d4 -2', priority: 20 },
            { key: `data.bonuses.rwak.attack`, mode: jez.ADD, value: '-1d4 -2', priority: 20 },
            { key: `data.bonuses.rsak.attack`, mode: jez.ADD, value: '-1d4 -2', priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `${aToken.name} suffers -1d4-2 on attack and save attempts until end of ${aToken.name}'s next turn.`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}