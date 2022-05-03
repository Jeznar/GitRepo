//##############################################
// Midi-Qol On Use
// Detects Undead and gives them disadvantage
//##############################################
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
if (args[0].hitTargets.length === 0) return {};
const target = canvas.tokens.get(args[0].hitTargets[0].id);
const undead = (target.actor.data.data.details?.type?.value || target.actor.data.data.details?.race).toLowerCase().includes("undead");
const itemD = args[0].item;
const spellSeconds = itemD.data.duration.value * 6;
const gameRound = game.combat ? game.combat.round : 0;
const effectName = `${itemD.name} Effect`;
let undeadDis = [{ "key": "data.traits.di.value", "mode": 2, "value": "healing", "priority": 20 }];
if (undead) undeadDis.push(
    { "key": "flags.midi-qol.disadvantage.attack.all", "mode": 2, "value": 1, "priority": 20 }    
);
let effectData = {
    label: effectName,
    icon: "systems/dnd5e/icons/skills/ice_17.jpg",
    origin: args[0].uuid,
    //------------------
    // 6 second duration replaced with 1 round duration to keep the effect in place till the 
    // caster's next turn (unless token exit/enter the turn tracker, that screws it up). -Jez
    //
    //duration: { seconds: spellSeconds, startRound: gameRound, startTime: game.time.worldTime },
    duration: { rounds: 1, startRound: gameRound, startTime: game.time.worldTime },
    changes: undeadDis
};
let checkEffect = target.actor.effects.find(i => i.data.label === effectName);
if (checkEffect) return {};
await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:target.actor.uuid, effects: [effectData] });