const MACRONAME = "test_MakeProne"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * 06/30/22 0.1 Creation
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
let trcLvl = 1;
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(2, trcLvl, `  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let msg = "";
//
// Set the value for the Active Actor (aActor)
let aActor;
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else aActor = game.actors.get(LAST_ARG.actorId);
//
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const CONDITION = "Prone";
const GAME_RND = game.combat ? game.combat.round : 0;


//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        ui.notifications.warn(msg)
        postResults(msg);
        return (false);
    }
    return (true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.trc(1, trcLvl, `--- Starting --- ${MACRONAME} ${FUNCNAME} ---`);
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    jez.log("tToken",tToken)
    jez.log("tToken.actor.uuid",tToken.actor.uuid)
    //-----------------------------------------------------------------------------------------------
    // Basic MidiQOL application of effect
    //
    jez.log("aItem", aItem)
    await jezcon.addProne(tToken.actor.uuid, aItem);
    //-----------------------------------------------------------------------------------------------
    // CUB Application of Prone
    //
    // let effectData = {
    //     label: "New Name...",
    //     icon: "modules/combat-utility-belt/icons/prone.svg",
    //     origin: aToken.uuid,
    //     disabled: false,
    //     // duration: { rounds: 999, startRound: GAME_RND },
    //     changes: [
    //         { key: `macro.CUB`, mode: jez.CUSTOM, value: "Prone", priority: 20 },
    //     ]
    // };
    // await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:tToken.actor.uuid, effects: [effectData] });

    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    jez.trc(1, trcLvl, `--- Finished --- ${MACRONAME} ${FUNCNAME} ---`);

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Add Prone effect to specified target (UUID), assuming it doesn't already have it
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    async function AddProne(targetUuid) {
        const CONDITION = "Prone"
        console.log("====> targetUuid", targetUuid)

        let tokenDoc5e = await fromUuid(targetUuid)
        console.log("====> tokenDoc5e", tokenDoc5e)
        if (!tokenDoc5e) return badNews(`Could not find token data corresponding to ${targetUuid}`, "warn")
        jez.log("Before the find", tokenDoc5e.data.actorData)
        if (tokenDoc5e.data.actorData?.effects)
            if (tokenDoc5e.data.actorData.effects.find(ef => ef?.label === CONDITION))
                return jez.log(`${tokenDoc5e.name} already prone`)
        jez.log("Past the find")

        let specialDuration = ["newDay", "longRest", "shortRest"];
        let effectData = {
            label: CONDITION,
            icon: "modules/combat-utility-belt/icons/prone.svg",
            disabled: false,
            flags: {
                dae: {
                    itemData: aItem,
                    specialDuration: specialDuration
                },
                core: {
                    statusId: "Prone"
                }
            },
            changes: [
                { key: `flags.midi-qol.disadvantage.attack.all`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.mwak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.msak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rwak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rsak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `data.attributes.movement.walk`, mode: jez.MULTIPLY, value: 0.5, priority: 20 }
            ]
        };
        return await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetUuid, effects: [effectData] });
    }
}
