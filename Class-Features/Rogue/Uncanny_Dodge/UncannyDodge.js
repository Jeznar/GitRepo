const MACRONAME = "Uncanny_Dodge.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Uncanny Dodge implmentation using midi qol flag.  This needs to be triggered as a reaction.
 * 
 * 07/10/23 0.1 Creation
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Apply DAE effect with he uncanny dodge flag set and generous expriation conditions
//
const CE_DESC = `Using Uncanny Dodge to reduce incoming damage.`
let effectData = {
    label: aItem.name,
    icon: aItem.img,
    flags: { dae: { itemData: aItem, stackable: false, macroRepeat: "none" } },
    origin: L_ARG.uuid,
    disabled: false,
    duration: { rounds: 1, seconds: 6, startRound: GAME_RND, startTime: game.time.worldTime },
    flags: { 
        dae: { 
            itemData: aItem, 
            specialDuration: ["1Reaction", "newDay", "longRest", "shortRest"]
         }, 
        convenientDescription: CE_DESC
    },
    changes: [{ key: "flags.midi-qol.uncanny-dodge", mode: jez.ADD, value: 1, priority: 20 }]
};
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });