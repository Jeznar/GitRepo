const MACRONAME = "Searing_Smite.0.3.js"
/*****************************************************************************************
 * Original downloaded from https://www.patreon.com/posts/searing-smite-56611523
 * 
 * 11/09/21 0.0 Cry Posted Version which seems fine
 * 12/27/21 0.1 JGB Add lighting effect for the "on fire" victim
 * 01/25/22 0.2 JGB Add VFX
 * 05/05/22 0.3 Change ATL.dimLight etc. to ATL.light.dim etc. for 9.x
 *****************************************************************************************/
 const DEBUG = true;
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
 log("---------------------------------------------------------------------------",
     "Starting", `${MACRONAME} or ${MACRO}`);
 for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
const tokenD = canvas.tokens.get(lastArg.tokenId);
const gameRound = game.combat ? game.combat.round : 0;
// VFX Settings -------------------------------------------------------------------
const VFX_NAME = `${MACRO}-${tokenD.id}`
const VFX_TARGET = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Regular_PurplePink_Target_400x400.webm"
const VFX_CASTER = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Regular_PurplePink_Caster_400x400.webm"
const VFX_OPACITY = 1.0;
const VFX_SCALE = 0.70;
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
if (lastArg.tag === "OnUse") {
    let itemD = lastArg.item;
    let spellLevel = lastArg.spellLevel;
    //------------------------------------------------------------------------------------------------
    // Launch VFX on caster
    // 
    new Sequence()
        .effect()
        .file(VFX_CASTER)
        .attachTo(tokenD)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        .name(VFX_NAME)          // Give the effect a uniqueish name
        .play()
    //-------------------------------------------------------------------------------------------------
    // Define and apply the effect
    // 
    let effectData = [{
        changes: [
            { key: "flags.dnd5e.DamageBonusMacro", mode: jez.CUSTOM, value: `ItemMacro.${lastArg.item.name}`, priority: 20 },
            { key: "flags.midi-qol.spellLevel",    mode: jez.CUSTOM, value: `${spellLevel}`, priority: 20 },
            { key: "flags.midi-qol.spellId",       mode: jez.CUSTOM, value: `${lastArg.uuid}`, priority: 20 },
        ],
        origin: lastArg.uuid,
        disabled: false,
        duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
        flags: { dae: { itemData: itemD, specialDuration: ["DamageDealt"] } },
        icon: lastArg.item.img,
        label: lastArg.item.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tokenD.actor.uuid, effects: effectData });    
}

/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "doBonusDamage"
 ***************************************************************************************************/
if (lastArg.tag === "DamageBonus") {
    if (!["mwak"].includes(lastArg.item.data.actionType)) return {};    
    let target = canvas.tokens.get(lastArg.hitTargets[0].id);
    let spellLevel = getProperty(lastArg.actor.flags, "midi-qol.spellLevel");
    let spellDC = tokenD.actor.data.data.attributes.spelldc;
    let spellUuid = getProperty(lastArg.actor.flags, "midi-qol.spellId");
    let spellItem = await fromUuid(getProperty(lastArg.actor.flags, "midi-qol.spellId"));
    let damageType = "fire";
    const CONC = tokenD.actor.effects.find(i => i.data.label === "Concentrating");
    //-------------------------------------------------------------------------------------------------------------
    // Launch VFX on target
    // 
    new Sequence()
        .effect()
        .file(VFX_TARGET)
        .attachTo(target)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        .name(VFX_NAME)          // Give the effect a uniqueish name
        .play()
    //-------------------------------------------------------------------------------------------------------------
    // Define & Apply Effect
    //
    let effectData = [{
        changes: [
            { key: `flags.midi-qol.OverTime`, mode: jez.OVERRIDE, value: `turn=start,label=${spellItem.name},
                damageRoll=${spellLevel}d6,saveDC=${spellDC},damageType=${damageType},
                saveAbility=con,saveRemove=true`, priority: 20 },
            { key: "ATL.light.dim",     mode: jez.ADD,      value: 10,          priority: 20},
            { key: "ATL.light.bright",  mode: jez.ADD,      value: 5,           priority: 20},
            { key: "ATL.light.color",   mode: jez.OVERRIDE, value: "#f8c377",   priority: 20},
            { key: "ATL.light.alpha",   mode: jez.OVERRIDE, value: 0.07,        priority: 20},
        ],
        origin: spellUuid,
        flags: { dae: { itemData: spellItem.data, token: target.uuid} },
        disabled: false,
        duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
        icon: spellItem.img,
        label: spellItem.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: effectData });
    // Bug Fix?  Following line appears to be needed to clear conc after use
    await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tokenD.actor.uuid, effects: [CONC.id] });

    return { damageRoll: `${spellLevel}d6[${damageType}]`, flavor: `(${spellItem.name} (${CONFIG.DND5E.damageTypes[damageType]}))` };
}

log("---------------------------------------------------------------------------",
`Finished`, `${MACRONAME}`);
/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/****************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************/
 function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for (i; i < numParms; i = i + 2) console.log(` ${lines++})`, parms[i], ":", parms[i + 1]);
    } else {            // Even number of arguments
        console.log(parms[i], ":", parms[i + 1]);
        i = 2;
        for (i; i < numParms; i = i + 2) console.log(` ${lines++})`, parms[i], ":", parms[i + 1]);
    }
}

/****************************************************************************************
 * Tricksy little sleep implementation
 ***************************************************************************************/
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }