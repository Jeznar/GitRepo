const MACRONAME = "Sleep.1.6.js"
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
 *************************************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;

let immuneRaces = ["undead", "construct", "elf"];    // Set strings that define immune races
const condition = "Unconscious";                     // Condition to be slept representing sleep 
let gameRound = game.combat ? game.combat.round : 0; // Added missing initilization -JGB
let effectData = [];                                 // Array to hold effect data
jez.log(`Starting: ${MACRONAME}`); 

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const sleepHp = await args[0].damageTotal;
if (!sleepHp) return ui.notifications.error("Set the Spells Damage Details to 'No Damage'");

jez.log(`Sleep Spell => Available HP Pool [${sleepHp}] points`);
let targets = await args[0].targets.filter(i=> i.actor.data.data.attributes.hp.value != 0).sort((a, b) => canvas.tokens.get(a.id).actor.data.data.attributes.hp.value < canvas.tokens.get(b.id).actor.data.data.attributes.hp.value ? -1 : 1);
let remainingSleepHp = sleepHp;

runVFX()

let slept_target = [];

checkTarget: for (let target of targets) {
   jez.log(`Target ${target.name}`, target);
   let find_target = await canvas.tokens.get(target.id);
   jez.log(` find_target: ${target.id}`); 

   let targetRace = find_target.actor.data.data.details.race;   // Shorten subsequent lines for Target Details Race
   let targetType = find_target.actor.data.data.details.type;   // Shorten subsequent lines for Target Details Type

   /* Following line from original macro is both hard to read and fails on player characters.  
   let immune_type = find_target.actor.data === "character" ? ["undead", "construct"].some(race => (find_target.actor.data.data.details.race || "").toLowerCase().includes(race)) : ["undead", "construct"].some(value => (find_target.actor.data.data.details.type.value || "").toLowerCase().includes(value));
   */  
   // Rewritten Giant line of code from above, in longer (working) form
   let immune_type = false;	
   if(find_target.actor.data.type === "character")	{
       jez.log(`${target.name} is a PC`, target);
       for(let immuneRace of immuneRaces) {
           if(targetRace) {
               if(immuneRace.toLowerCase().includes(targetRace.toLowerCase()))
               {
                   jez.log(`${target.name}'s race is ${immuneRace}`, target, immuneRace);
                   immune_type = true;
               }
            } else jez.log(`${target.name} has no race`, target);
       }		
   } else { 
       jez.log(`${target.name} is an NPC`, target);
       // Loop through each creature types found in the immuneRaces array.
       for(let immuneRace of immuneRaces) {
           jez.log(`Checking against ${immuneRace}`);
           // If the creature type is custom...
           if (targetType.value.toLowerCase() === "custom") {
               jez.log(` Beginning custom type Checker`);          
               // Check custom creature type against our immuneRaces collection
               if(targetType.custom.toLowerCase().includes(immuneRace.toLowerCase())) {
                   jez.log(` Found a dirty ${immuneRace} spy.`, immuneRace);
                   immune_type = true;
               }
           } else jez.log(` ${target.name} does not have a custom race -- ${targetType.value}`);
           // If the creature has a subtype...
           if(!targetType.subtype == "") {
           // if(targetType.subtype) {
                   // If the creature's subtype is found in the immuneRaces collection...
                   if (targetType.subtype.toLowerCase() === immuneRace.toLowerCase()) {					
                   jez.log(" Beginning subtype Checker");

                   // Check creature Subtypes for the types in our immuneRaces collection.
                   if(targetType.custom.toLowerCase().includes(immuneRace.toLowerCase())) {
                       jez.log(" Found a sneaky subtype.");
                       immune_type = true;
                   }
               }
           } else jez.log(` ${target.name} does not have a subtype`);
           
           // Check creature type against our immuneRaces collection.
           if(immuneRace.toLowerCase() === targetType.value.toLowerCase()) {
               jez.log(` target's npc type is ${immuneRace}`);
               immune_type = true;
           } else jez.log(` ${target.name} vulnerable npc type is ${targetType.value}`);
       }
   }      
   // End of rewritten Giant line of code from above
    jez.log(` immune type:`, immune_type);
    let immune_ci = find_target.actor.data.data.traits.ci.custom.includes("Sleep");
    jez.log(` custom immunity:`, immune_ci);
    jez.log(` find_target.actor: `, find_target.actor);
    // Set sleeping to "true" (load its data structure) if token is currently "unconscious"
    let sleeping = find_target.actor.effects.find(i => i.data.label === condition); 
        if (sleeping) { // Sleeping creatures are immune to this spell and should be skipped
            jez.log(` ${target.name} is ${condition}`,sleeping);
            jez.log(` remaining unconscious: ${sleeping.data.duration.rounds} rounds, ${sleeping.data.duration.seconds} seconds`);
        } else { jez.log(` ${target.name} is not ${condition}`) }
    
    // Set prone to "true" (load its data structure) if token is currently "prone"
    let prone = find_target.actor.effects.find(i => i.data.label === "Prone"); 
        if (prone) { 
            jez.log(` ${target.name} is already prone`), prone;
        } else jez.log(` ${target.name} is not yet prone`)

   let targetHpValue = find_target.actor.data.data.attributes.hp.value;
   jez.log(` targetHpValue: `,targetHpValue); 
   if ((immune_type) || (immune_ci) || (sleeping)) {
       jez.log(`Sleep Results => Target: ${find_target.name} | HP: ${targetHpValue} | Status: Not Affected`);
       slept_target.push(`<div class="midi-qol-flex-container"><div>no effect</div><div class="midi-qol-target-npc midi-qol-target-name" id="${find_target.id}"> ${find_target.name}</div><div><img src="${find_target.data.img}" width="30" height="30" style="border:0px"></div></div>`);

       // Sleeping target needs sleep reapplied as Midi-QoL will remove it due to a "feature" which takes zero damage applied as damage applied.
       if (sleeping) { 
           effectData = addSleepEffectData(effectData, sleeping.data.duration.rounds, sleeping.data.duration.seconds);
           await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: find_target.actor.uuid, effects: effectData }); 
       }
       continue checkTarget;
   }
   if (remainingSleepHp > targetHpValue) {
       remainingSleepHp -= targetHpValue;
       jez.log(`Sleep Results => Target: ${find_target.name} |  HP: ${targetHpValue} | HP Pool: ${remainingSleepHp} | Status: Slept`);
       slept_target.push(`<div class="midi-qol-flex-container"><div>slept</div><div class="midi-qol-target-npc midi-qol-target-name" id="${find_target.id}"> ${find_target.name}</div><div><img src="${find_target.data.img}" width="30" height="30" style="border:0px"></div></div>`);

       if (!prone) {                                    // If target is not prone load array to add sleep and prone effects
           effectData = addSleepProneEffectData(effectData);
           // game.cub.addCondition("Prone", target);   // Combat Utility Belt mod to add Prone generated unhappiness
       } else {                                         // If target is already prone load array to add sleep effect only
           effectData = addSleepEffectData(effectData, 10, 60);
       }
 
       await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: find_target.actor.uuid, effects: effectData });
       continue;
   } else {
       console.log(`Sleep Results => Target: ${target.name} | HP: ${targetHpValue} | HP Pool: ${remainingSleepHp - targetHpValue} | Status: Missed`);
       slept_target.push(`<div class="midi-qol-flex-container"><div>misses</div><div class="midi-qol-target-npc midi-qol-target-name" id="${find_target.id}"> ${find_target.name}</div><div><img src="${find_target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
       break;
   } 
}
let slept_list = slept_target.join('');
await wait(500);
let slept_results = `<div><div class="midi-qol-nobox">${slept_list}</div></div>`;
const chatMessage = game.messages.get(args[0].itemCardId);
let content = duplicate(chatMessage.data.content);
const searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${slept_results}`;
content = await content.replace(searchString, replaceString);
await chatMessage.update({ content: content });

/***********************************************************************************************************************
 * Function to load up array with data to be used to apply unconscious and prone effects to target
************************************************************************************************************************/
function addSleepProneEffectData(_effectData) {
    jez.log(` ...add Sleep & Prone effect data`)
    _effectData = [
        {
            label: condition,
            icon: "icons/svg/sleep.svg",
            origin: args[0].uuid,
            disabled: false,
            // duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
            duration: { rounds: 10, startRound: gameRound, startTime: game.time.worldTime },
            flags: { dae: { specialDuration: ["isDamaged"] } },
            changes: [
                { key: `flags.midi-qol.grants.critical.mwak`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.all`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.fail.ability.save.str`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.fail.ability.save.dex`, mode: 2, value: 1, priority: 20 },
                { key: `data.attributes.movement.all`, mode: 5, value: 0, priority: 20 }
            ]
        }, {
            label: "Prone",
            icon: "modules/combat-utility-belt/icons/prone.svg",
            origin: args[0].uuid,
            disabled: false,
            duration: { rounds: 99, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
            changes: [
                { key: `flags.midi-qol.disadvantage.attack.all`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.mwak`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.msak`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rwak`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rsak`, mode: 2, value: 1, priority: 20 }
            ]
        }];
        return(_effectData);
    }
/***********************************************************************************************************************
 * Function to load up array with data to be used to apply unconscious only (already prone) effect to target.
 * _rounds and _seconds are optional parameters intendedto be used for reapplying a partially timed out effect.
************************************************************************************************************************/
function addSleepEffectData(_effectData, _rounds, _seconds) {
    jez.log(` ...add Sleep effect data`)
    let newRounds = _rounds || 10;
    // let newSeconds = _seconds || 60;
    _effectData = [
        {
            label: condition,
            icon: "icons/svg/sleep.svg",
            origin: args[0].uuid,
            disabled: false,
            // duration: { rounds: newRounds, seconds: newSeconds, startRound: gameRound, startTime: game.time.worldTime },
            duration: { rounds: newRounds, startRound: gameRound, startTime: game.time.worldTime },
            flags: { dae: { specialDuration: ["isDamaged"] } },
            changes: [
                { key: `flags.midi-qol.grants.critical.mwak`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.all`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.fail.ability.save.str`, mode: 2, value: 1, priority: 20 },
                { key: `flags.midi-qol.fail.ability.save.dex`, mode: 2, value: 1, priority: 20 },
                { key: `data.attributes.movement.all`, mode: 5, value: 0, priority: 20 }
            ]
        }];
    return (_effectData);
}
/***************************************************************************************************
 * Perform the VFX code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function runVFX() {
    jez.log("Launch VFX")
    jez.log("args[0]", args[0])
    const FUNCNAME = "doOnUse()";
    const VFX_NAME = `${MACRO}`
    const VFX_OPACITY = 1.0;
    const VFX_SCALE = 2.7;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const templateID = args[0].templateId
    jez.log('templateID', templateID)
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
    //jez.log(`Color ${color}`)
    const VFX_LOOP = `modules/jb2a_patreon/Library/1st_Level/Sleep/Cloud01_01_${color}_400x400.webm`
    jez.log(`VFX_File: ${VFX_LOOP}`)
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
}