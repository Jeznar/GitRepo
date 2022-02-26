const MACRONAME = "eyebite"
/*****************************************************************************************
 * For the spell’s Duration, your eyes become an inky void imbued with dread power. One 
 * creature of your choice within 60 feet of you that you can see must succeed on a Wisdom 
 * saving throw or be affected by one of the following Effects of your choice for the 
 * Duration. On each of your turns until the spell ends, you can use your action to target 
 * another creature but can’t target a creature again if it has succeeded on a saving 
 * throw against this casting of eyebite.
 * 
 * -- Asleep. The target falls Unconscious. It wakes up if it takes any damage or if  
 *    another creature uses its action to shake the sleeper awake. 
 *    EXP_COND: takes any damage
 * 
 * -- Panicked. The target is Frightened of you. On each of its turns, the frigh⁠tened 
 *    creature must take the Dash action and move away from you by the safest and shortest 
 *    available route, unless there is nowhere to move. If the target moves to a place at 
 *    least 60 feet away from you where it can no longer see you, this effect ends.
 *    EXP_COND: 60+ feet away and can no longer see the caster
 * 
 * -- Sickened. The target has disadvantage on Attack rolls and Ability Checks. At the end 
 *    of each of its turns, it can make another Wisdom saving throw. If it succeeds, the
 *    effect ends
 *    EXP_COND:End of each turn a WIS Save
 * 
 * Implementaion idea: Place a effect on the caster that runs ever turn and asks what to 
 * do with this spell, offering the three effects and nothing as options.  It will need 
 * to put an effect with appropriate settings on the target to handle effect expirations. 
 * 
 * 02/21/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
jez.log("moving on")
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let spellDC = aActor.data.data.attributes.spelldc;
jez.log("spellDC", spellDC)
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const IMMUNE_COND = `Eyebite Immune ${LAST_ARG.actorUuid}`
jez.log('IMMUNE_COND', IMMUNE_COND)
const EYEBITE_ICON = "Icons_JGB/Conditions/evil-eye-red-3.png"
const IMMUNE_ICON = "Icons_JGB/Conditions/evil-eye-red-3-immune.png"
const GAME_RND = game.combat ? game.combat.round : 0;
let msg = "";
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && !preCheck())return;
//----------------------------------------------------------------------------------
// Alternative method for finding CUB Condition macro -JGB for Kandashi's macro
//
const CUBControl = game.macros?.getName("CUB Condition");
if (!CUBControl) return ui.notifications.error(`Cannot locate CUB Condition Macro`);
jez.log("CUBControl",CUBControl)
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0] === "each") doEach();					    // DAE removal
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if(!game.modules.get("advanced-macros")?.active) {ui.notifications.error("Please enable the Advanced Macros module") ;return;}
    if(!game.modules.get("combat-utility-belt")?.active) {ui.notifications.error("Please enable the CUB module"); return;}
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        ui.notifications.warn(msg)
        jez.log(msg)
        return(false);
    }
    return (true)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    firstEyebiteDialog()
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
 async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    eachEyebiteDialog()
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Eyebite Dialog from eyebite_midi-srd_1.02.js (Perhaps by Kandashi)
 ***************************************************************************************************/
function firstEyebiteDialog() {
    const FUNCNAME = "EyebiteDialog()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    spellDC = args[1]
    //----------------------------------------------------------------------------------
    //
    new Dialog({
        title: "Eyebite options",
        content: "<p>Target a token and select the effect to attempt.</p>",
        buttons: {
            one: {
                label: "Asleep",
                callback: async () => { await checkTokenSave("Unconscious") },
            },
            two: {
                label: "Panicked",
                callback: async () => { await checkTokenSave("Frightened") },
            },
            three: {
                label: "Sickened",
                callback: async () => { await checkTokenSave("Poisoned") },
            },
        }
    }).render(true);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
}
/***************************************************************************************************
 * Eyebite Dialog from eyebite_midi-srd_1.02.js (Perhaps by Kandashi)
 ***************************************************************************************************/
 function eachEyebiteDialog() {
    const FUNCNAME = "EyebiteDialog()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    spellDC = args[1]
    //----------------------------------------------------------------------------------
    //
    const qTitle = "Use Action to Inflict Eyebite?"
    const qText = `If you want to use your action this turn to inflict an eyebite, target
        your victim, select the effect, and click <b>ok</b>; otherwise, click the 
        <b>Cancel</b> button.`
    const qChoices = [
        "Sleep",
        "Panic",
        "Sicken"
    ]
    jez.pickRadioListArray(qTitle, qText, pickRadioCallBack, qChoices);
    //----------------------------------------------------------------------------------
    //
    async function pickRadioCallBack(selection) {
        jez.log("pickRadioCallBack(selection)", selection)
        let effect = ""
        jez.log("pickRadioCallBack", selection)
        if (!selection) return;
        switch (selection) {
            case "Sleep"  : effect = "Unconscious"; break;
            case "Panic"  : effect = "Frightened";  break;
            case "Sicken" : effect = "Poisoned";    break;
        }
        checkTokenSave(effect)
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
}
/***************************************************************************************************
 * check the save 
 ***************************************************************************************************/
async function checkTokenSave(selectedEffect) {
    const DAEItem = LAST_ARG.efData.flags.dae.itemData
    let tToken = null
    let tactor;
    if (LAST_ARG.tokenId) tactor = canvas.tokens.get(LAST_ARG.tokenId).actor;
    else tactor = game.actors.get(LAST_ARG.actorId);
    jez.log("canvas.tokens.get(LAST_ARG.tokenId)", canvas.tokens.get(LAST_ARG.tokenId))
    jez.log("game.actors.get(LAST_ARG.actorId)", game.actors.get(LAST_ARG.actorId))
    //------------------------------------------------------------------------------------------
    // Check the target count, should be only one.
    //
    let count = 0;
    for (tToken of game.user.targets) jez.log(`${++count} ${tToken.name}`)
    if (count !== 1) {
        msg = `Need to target exactly one target, ${count} were selected.`
        ui.notifications.warn(msg)
        jez.log(msg)
        eachEyebiteDialog() // Call dialog function again until user gets it right.
        return (false);  
    }
    //------------------------------------------------------------------------------------------
    // If the target is immune, post message and quit
    //
    if (await isImmune(tToken)) {
        msg = `<b>${tToken.name}</b> has recently resisted <b>${aToken.name}'s</b> eyebite and 
            has short term immunity to its effects.`
        jez.postMessage({color:"dodgerblue", fSize:14, icon:IMMUNE_ICON, 
            msg:msg, title:`${tToken.name} has immunity`, token:tToken})
        return;
    }
    //------------------------------------------------------------------------------------------
    // Perform save, apply condition on failure
    //
    jez.log(`Targeted ${tToken}.name`, tToken)
    const flavor = `${CONFIG.DND5E.abilities["wis"]} DC${spellDC} ${DAEItem?.name || ""}`;
    let saveRoll = (await tToken.actor.rollAbilitySave("wis", { flavor })).total;
    if (saveRoll < spellDC) {
        //ChatMessage.create({ content: `${tToken.name} failed the save with a ${saveRoll}` });
        await CUBControl.execute("apply", selectedEffect, tToken);
        msg = `<b>${tToken.name}</b> failed save (with a ${saveRoll}) and is subject to 
            <b>${aToken.name}</b>'s eyebite effect.`
        jez.postMessage({color:"dodgerblue", fSize:14, icon:EYEBITE_ICON, 
            msg:msg, title:`${tToken.name} fails save`, token:tToken})
    }
    else {
        //ChatMessage.create({ content: `${tToken.name} passed the save with a ${saveRoll}` });
        applyImmunity(tToken)
        msg = `<b>${tToken.name}</b> made save (with a ${saveRoll}) and has temporary immunity to  
            <b>${aToken.name}</b>'s eyebite effects.`
        jez.postMessage({color:"dodgerblue", fSize:14, icon:IMMUNE_ICON, 
            msg:msg, title:`${tToken.name} makes save`, token:tToken})
        return;
    }
// COOL-THING: Modify existing effect
    //------------------------------------------------------------------------------------------
    // If we're dealing with "Sickened" (poison), modify the effect to include a Midi-qol 
    // overtime element that will perform a wisdom save at the end of the target's turn.
    //
    jez.log("Set specific settings for selectedEffect", selectedEffect)
    if (selectedEffect === "Poisoned") {
        jez.log("Need to update the effect to include a save overtime")
        //----------------------------------------------------------------------------------
        // Seach the token to find the just added effect
        //
        await jez.wait(100)
        let effect = await tToken.actor.effects.find(i => i.data.label === "selectedEffect");
        //----------------------------------------------------------------------------------
        // Define the desired modification to existing effect.
        //
        //    https://gitlab.com/tposney/midi-qol#flagsmidi-qolovertime-overtime-effects
        //
        let overTimeVal = `turn=end,label=${selectedEffect},saveDC=${spellDC},saveAbility=wis,saveRemove=true,saveMagic=true,rollType=save`
        effect.data.changes.push({ key: `flags.midi-qol.OverTime`, mode: OVERRIDE, value: overTimeVal, priority: 20 })
        jez.log(`effect.data.changes 2`, effect.data.changes)
        //----------------------------------------------------------------------------------
        // Apply the modification to existing effect
        //
        const result = await effect.update({ 'changes': effect.data.changes });
        if (result) jez.log(`Active Effect ${selectedEffect} updated!`, result);
        return (true)
    }
    //------------------------------------------------------------------------------------------
    // If we're dealing with "Panicked" (Frightened), modify the effect to include a Midi-qol 
    // overtime that will run a world macro that can check distance and LoS for possible removal.
    //
    if (selectedEffect = "Frightened") {
        //----------------------------------------------------------------------------------
        // Seach the token to find the just added effect
        //
        await jez.wait(100)
        let effect = await tToken.actor.effects.find(i => i.data.label === selectedEffect);
        //----------------------------------------------------------------------------------
        // Define the desired modification to existing effect.
        //
        //    https://gitlab.com/tposney/midi-qol#flagsmidi-qolovertime-overtime-effects
        //
        let overTimeVal = `turn=end,label=${selectedEffect},macro=eyebite_frightened_helper`
        effect.data.changes.push({ key: `flags.midi-qol.OverTime`, mode: OVERRIDE, value: overTimeVal, priority: 20 })
        //----------------------------------------------------------------------------------
        // Apply the modification to existing effect
        //
        const result = await effect.update({ 'changes': effect.data.changes });
        if (result) jez.log(`Active Effect 1 ${selectedEffect} updated!`, result);
        await jez.wait(1000)
        const result2 = await effect.data.update({ 'origin': aToken.id });
        if (result2) jez.log(`Active Effect 2 ${selectedEffect} updated!`, result2);
        return (true)
    }
}
/***************************************************************************************************
 * Apply Immunity to a token that made its saving throw.
 * 
 * Rather than making the immunity specific to this instance of eyebite, I will make the immunity 
 * specific to the caster and last for 10 rounds, 1 minute.
 ***************************************************************************************************/
 async function applyImmunity(token1) {
    const FUNCNAME = "applyImmunity(token1)";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let immuneEffect = [{
        label: IMMUNE_COND,
        icon: IMMUNE_ICON,
        origin: LAST_ARG.uuid,
        disabled: false,
        flags: { dae: { itemData: aItem, specialDuration: ["newDay", "longRest", "shortRest"] } },
        duration: { rounds: 10, startRound: GAME_RND, seconds: 60, startTime: game.time.worldTime }, 
        changes: [
            { key: `flags.gm-notes.notes`, mode: CUSTOM, value: "Immune to Eyebite from this source", priority: 20 },
        ]
    }]
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token1.uuid, effects: immuneEffect });
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Check for immunity effect on passed token. Return boolean (true = immune)
 ***************************************************************************************************/
 async function isImmune(token1) {
    const FUNCNAME = "isImmune(token1)";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let rtn = false
    jez.log("token1.actor.effects", token1.actor.effects)
    let immuneEffect = await token1.actor.effects.find(i => i.data.label === IMMUNE_COND);
    jez.log("immuneEffect",immuneEffect)
    if (immuneEffect) rtn = true
    jez.log("Immune Effect Found?", rtn)
    jez.log(`-------------- Finishing --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return(rtn)
}