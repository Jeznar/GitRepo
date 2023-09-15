const MACRONAME = "Rot_Grub_Bites.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implement the Rot Grub bite effect.
 * 
 *   On a Hit: The target is infested by 1d4 rot grubs. At the start of each of the target's turns, the target takes 1d6 piercing 
 *   damage per rot grub infesting it. Applying fire to the bite wound before the end of the target's next turn deals 1 fire damage 
 *   to the target and kills these rot grubs. After this time, these rot grubs are too far under the skin to be burned.
 * 
 * This macro needs to:
 *  1. Check if the target was hit, if not, exit
 *  2. Determine how many grubs are inserted by the bite (1d4)
 *  3. Add a DAE overtime effect to roll the damage at start of vistims turns
 *  
 * The two cure options are to be handled manually.
 * 
 * 09/15/23 0.1 Creation of Macro
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
 * Check the setup of things.  Must hit exactly one target.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function preCheck() {
    if (args[0]?.targets?.length !== 1)
        return jez.badNews(`Illegal number of targets.  ${args[0]?.targets?.length} were targeted.`, 'w')
    if (args[0].hitTargets.length !== 1)
        return jez.badNews(`Target was not hit, no effect.`, 'i')
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
    // 1.  Verifies that one target was hit
    if (!await preCheck()) return (false);  
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // 2. Determine how many rot grubs have infected our victim
    //
    const NUM_GRUBS_OBJ = new Roll(`1d4`).evaluate({ async: false });
    const SPEAKER = ChatMessage.getSpeaker({ actor });
    NUM_GRUBS_OBJ.toMessage({ speaker: SPEAKER });
    const NUM_GRUBS = NUM_GRUBS_OBJ.total
    const GRUB_STR = NUM_GRUBS === 1 ? `Rot Grub` : `Rot Grubs`;
    if (TL > 1) jez.trace(`${TAG} Inserted ${NUM_GRUBS} Rot Grubs into ${tToken.name}`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 2a. Check for immunity to disease, if immune no effect
    //
    if (TL > 1) jez.trace(`${TAG} ${tToken.name} condition immunities: `, tToken.actor.data.data.traits?.ci?.value)
    if (tToken.actor.data.data.traits?.ci?.value.includes('diseased'))
        return postResults(`${tToken.name}'s body quickly destroys ${NUM_GRUBS} ${GRUB_STR} which had penetrated.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 3. Apply a DoT effect
    //
    const CE_DESC = `${NUM_GRUBS} ${GRUB_STR} burrowing deeper into flesh.`
    let overTimeVal = `turn=start,label=${NUM_GRUBS} ${GRUB_STR} burrowing,damageRoll=${NUM_GRUBS}d6,damageType=piercing`
    let effectData = {
        label: aItem.name,
        icon: 'Tokens/Monsters/Rot_Grub/Rot_grub-Avatar.webp',
        origin: L_ARG.uuid,
        disabled: false,
        flags: {
            convenientDescription: CE_DESC,
            core: { statusId: 'Force Display' }
        },
        changes: [
            { key: `flags.midi-qol.OverTime`, mode: jez.OVERRIDE, value: overTimeVal, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: [effectData] });
    //-------------------------------------------------------------------------------------------------------------------------------
    // Comments
    //
    if (TL > 3) jez.trace(`${TAG} More Detailed Trace Info.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `${tToken.name} has ${NUM_GRUBS} rot grubs burrowing into their flesh.`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}