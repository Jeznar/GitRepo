const MACRONAME = "Demo_DAE_Durations"
console.log(MACRONAME)
/*****************************************************************************************
 * Test/Demonstrate Aspects of application of a dynamic active effect (DAE)
 * 
 * This is intended t run as an OnUse ItemMacro macro.  It doesn't actually do anything 
 * useful, beyond exercising some aspects of DAE.
 * 
 * 02/08/22 0.1 Creation of Macro
 *****************************************************************************************/
 console.log(`============== Starting === ${MACRONAME} =================`);
 for (let i = 0; i < args.length; i++) console.log(`  args[${i}]`, args[i]);
 const LAST_ARG = args[args.length - 1];
 let aActor;         // Acting actor, creature that invoked the macro
 let aToken;         // Acting token, token for creature that invoked the macro
 let aItem;          // Active Item information, item invoking this macro
 if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
 if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
 if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
 const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;

await noDuration("HashTag");
await durationSeconds(30, "5");
await durationRounds(4, "4");
await durationTurns(3, "3");
await durationSpecial("turnEnd","2");
await durationSpecial("turnStart","1");
return

/*******************************************************************************************************
 * Some interesting special duration flags
 * 
 *  newDay: "Is New Day?"
 *  longRest: "Long Rest"
 *  shortRest: "Short Rest"
 *  turnEnd: "Turn End: Expires at the end of the targets's next turn (in combat)"
 *  turnEndSource: "Turn End: Expires at the end of the source actor's next turn (in combat)"
 *  turnStart: "Turn Start: Expires at the start of the targets's next turn (in combat)"
 *  turnStartSource: "Turn Start: Expires at the start of the source actor's next turn (in combat)"
********************************************************************************************************/
//------------------------------------------------------------------------------------------------------
// Apply a special duration effect.
// Note: A "normal" duration must be set for the buff to appear on the token.  
//       It should be longer than the expected duration, if specialDuration is to trigger.
//
async function durationSpecial(specDur, iconNum) {
    console.log(`Setting Special Duration ${specDur}`);
    let specialDuration = [specDur, "newDay", "longRest", "shortRest"]
    let effectData = [{
        label: `Special Duration: ${specDur}`,
        icon: `Icons_JGB/Markers/Numbers_Transparent_Grey_Background/${iconNum}.png`,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { seconds: 60, startTime: game.time.worldTime },
        flags: { dae: { itemData: aItem, specialDuration: specialDuration } },
        changes: [
            { key: `flags.gm-notes.notes`, mode: CUSTOM, value: `Special Duration ${specDur}`, priority: 20 },
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: effectData });
}

//------------------------------------------------------------------------------------------------------
// Apply an effect with duration set to 3 turns
//
// seemingly startTurn is not needed
//
async function durationTurns(trns, iconNum) {
    console.log("Setting Turn Based Effect");
    const GAME_TRN = game.combat ? game.combat.turn : 0;
    console.log(`Current turn: ${GAME_TRN}`);
    let effectData = [{
        label: `${trns} Turns`,
        icon: `Icons_JGB/Markers/Numbers_Transparent_Grey_Background/${iconNum}.png`,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { turns: trns },
        //duration: { turns: trns },
        changes: [
            { key: `flags.gm-notes.notes`, mode: CUSTOM, value: `${trns} Turn Duration`, priority: 20 },
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: effectData });
}

//------------------------------------------------------------------------------------------------------
// Apply an effect with duration set to runds rounds
//
async function durationRounds(rnds, iconNum) {
    console.log("Setting Round Based Effect");
    const GAME_RND = game.combat ? game.combat.round : 0;
    let effectData = [{
        label: `${rnds} Rounds`,
        icon: `Icons_JGB/Markers/Numbers_Transparent_Grey_Background/${iconNum}.png`,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: rnds, startRound: GAME_RND },
        changes: [
            { key: `flags.gm-notes.notes`, mode: CUSTOM, value: `${rnds} Round Duration`, priority: 20 },
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: effectData });
}

//------------------------------------------------------------------------------------------------------
// Apply an effect with duration set to dur seconds 
//
async function durationSeconds(dur, iconNum) {
    console.log("Setting Time Based Effect");
    let effectData = [{
        label: `${dur} Seconds`,
        icon: `Icons_JGB/Markers/Numbers_Transparent_Grey_Background/${iconNum}.png`,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { seconds: dur, startTime: game.time.worldTime },
        changes: [
            { key: `flags.gm-notes.notes`, mode: CUSTOM, value: `${dur} Seconds Duration`, priority: 20 },
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: effectData });
}

//------------------------------------------------------------------------------------------------------
// Apply an effect with no durations set.
//
async function noDuration(iconNum) {
    let icon = `Icons_JGB/Markers/Numbers_Transparent_Grey_Background/${iconNum}.png`
    console.log("Setting No Duration Effect")
    let effectData = [{
        label: "No Duration",
        icon: icon,
        origin: LAST_ARG.uuid,
        disabled: false,
        changes: [
            { key: `flags.gm-notes.notes`, mode: CUSTOM, value: "No Duration Effect", priority: 20 },
        ]
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: effectData });
}
