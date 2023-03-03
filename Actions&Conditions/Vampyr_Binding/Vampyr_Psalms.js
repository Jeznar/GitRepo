const MACRONAME = "Vampyr_Psalms.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Read the Psalms and trigger the progressive effects of the complex trap event
 * 
 * 01/08/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 4;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; 
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const TRACKING_EFFECT = MACRO
const TRACKING_FLAG = 'jez.vampyrPsalm'        // Progress through the ritual flag
//-----------------------------------------------------------------------------------------------------------------------------------
// Psalm Verses Spoken
//
SPOKEN = [
    '',
    'The great evil, for its bread, mills our bones.',
    'Lo, the blood of the martyrs runs in hot rivers.',
    'Shrouded, a sanguine evil lies in wait.',
    'Our endings are nigh, and fear covers all.',
    'Hear our blooded words and heed our call.',
    'Let our fear be a guiding light to protect us from your darkness.',
    'We shall follow our path, narrow and true, through the valley of your malevolence!',
    'Neither darkness, nor blood, nor blight of death shall hold us in our stead.',
    'Lord of Blood, we bind thee. Thus may your name be forgotten forevermore!'
]
RESPONSE = [
    '',
    'You feel a ponderous weight press upon you, as if the world itself were crushing you into dust.',
    'Against your will, tears pour from your eyes. Wiping them away, you find your hand covered in blood.',
    `The mists of Barovia press upon you, filling the ritual site and obscuring your vision. They carry with them a malevolence 
        that you have never felt before.`,
    `Misty shapes swirl within the summoning circle; echoes of horrors that existed before there was language to name them. 
        Shadows of your nightmares manifest, and your soul is filled with an animal's terror.`,
    `The very air itself rumbles with the fury of a god, and the gray mists become crimson. The air thickens with the life blood 
        of the damned.`,
    `Like jagged fingers, the mists coalesce and creep around each ritual lantern, blocking their light from view and plunging the 
        ritual site into darkness.`,
    `The mists swirl to and fro before your eyes in disorienting patterns. They seem to invade your mind, and attempt to pull you 
        off course.`,
    `The mists thicken and swirl faster on the ground. Tendrils flare wildly as if grasping at your legs and feet.`,
    `The world shudders, and you feel a thousand needles pierce your skin. Rivulets of your blood float through the air from your 
        wounds and through the air. They coalesce and begins to take shape. Vampyr engages in its final, last ditch effort to remain
        free, as its aspect takes shape. Two glowing red eyes flare in the darkness before you, and a set of razor claws unfurl. 
        The Aspect of Vampyr is manifest!`
]
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
    // Look to see if our actor has the tracking effect and grab number of last psalm read
    //
    let existingEffect = aActor.effects.find(ef => ef.data.label === aItem.name)
    let psalmRead = 0
    if (existingEffect) {
        if (TL > 1) jez.trace(`${TAG} found existing effect`,existingEffect)
        psalmRead = getProperty(aActor.data.flags, TRACKING_FLAG);
        if (TL > 1) jez.trace(`${TAG} psalm read`, psalmRead)
    }
    if (TL > 1) jez.trace(`${TAG} existingEffect`, existingEffect)
    const NEXT_VERSE = parseInt(psalmRead) + 1
    //-------------------------------------------------------------------------------------------------------------------------------
    // Remove previously existing effect
    //
    // if (existingEffect) await MidiQOL.socket().executeAsGM('removeEffects', { actorUuid: aActor.uuid, effects: [existingEffect.id]});
    //-------------------------------------------------------------------------------------------------------------------------------
    // update existing effect (if there is one)
    //
    if (existingEffect) {
        let updates = {
            '_id': existingEffect.id,
            'changes': [
                {
                    'key': `flags.${TRACKING_FLAG}`,
                    'mode': jez.OVERIDE,
                    'value': NEXT_VERSE,
                    'priority': 20
                }
            ]
        };
        await MidiQOL.socket().executeAsGM('updateEffects', { 'actorUuid': aActor.uuid, 'updates': [updates] });
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // create tracking effect (if there wasn't one)
    //
    if (!existingEffect) {
        let effectData = {
            label: aItem.name,
            icon: aItem.img,
            origin: L_ARG.uuid,
            disabled: false,
            flags: { convenientDescription: 'Tracks the last psalm verse read' },
            changes: [
                { key: `flags.${TRACKING_FLAG}`, mode: jez.OVERIDE, value: 1, priority: 20 },
            ]
        };
        if (TL > 1) jez.trace(`${TAG} Add effect ${aItem.name} to ${aToken.name}`)
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pulse VFX on the active actor
    //
    new Sequence()
        .effect()
        .file('modules/jb2a_patreon/Library/Generic/Template/Circle/OutPulse/OutPulse_02_Regular_PurplePink_Burst_600x600.webm')
        .attachTo(aToken)
        .scale(2)
        .opacity(1)
        .play();
    //-------------------------------------------------------------------------------------------------------------------------------
    // Comments
    //
    if (TL > 3) jez.trace(`${TAG} More Detailed Trace Info.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    msg = `${tToken.name} gives voice to <b>Verse ${NEXT_VERSE}</b> of the Psalm of Terror:<br><br> <b><i>${SPOKEN[NEXT_VERSE]}</i></b>`
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "hits" });
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    await jez.wait(3000)
    msg = `<b>${RESPONSE[NEXT_VERSE]}</b>`
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doEach(options = {}) {
    const FUNCNAME = "doEach(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Comments
    //
    if (TL > 3) jez.trace(`${TAG} More Detailed Trace Info.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}