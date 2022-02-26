const MACRONAME = "Grasping_Root"
/*****************************************************************************************
 * Grasping Root is a special ability of the Tree Blight defined in CoS
 * 
 * Description (https://www.dndbeyond.com/monsters/tree-blight)
 *   Melee Weapon Attack: +9 to hit, reach 15 ft., one creature not grappled by the blight. 
 *   Hit: The target is grappled (escape DC 15). Until the grapple ends, the target takes 9
 *   (1d6 + 6) bludgeoning damage at the start of each of its turns. The root has AC 15 and
 *   can be severed by dealing 6 or more slashing damage to it on one attack. Cutting the 
 *   root doesn’t hurt the blight but ends the grapple.
 * 
 * Expected Flow of this Implemention
 *  - Verify that one target has been hit
 *  - Summon a new token "Grasping Root" at location of the target
 *  - Rename the summoned root for uniqueness
 *  - Initiate a grapple between the root and target by placing appropriate paired debuffs
 *  - Setup a DoT on the target
 *  - Post appropriate summary information
 * 
 * 02/16/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
if (!aActor) {
    msg = `[${MACRONAME}] Principal actor not found on scene.`;
    console.log(msg);
    ui.notifications.error(msg)
    return (false);
}
jez.log("Actor/Token/Item",`${aActor.name}`,aActor,`${aToken.name}`,aToken,`${aItem.name}`,aItem)
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
const GAME_RND = game.combat ? game.combat.round : 0;
const MINION = "Grasping Root"
const MINION_NAME = `${aToken.name}'s ${MINION} - ${GAME_RND}`
let tCoord = {}     // Will contain coordinate of summoned token
const GRAPPLED_ICON = "Icons_JGB/Conditions/grappling.svg"
const GRAPPLED_COND = "Grappled"
const GRAPPLED_JRNL = `@JournalEntry[${game.journal.getName("Grappled").id}]{Grappled}`
const GRAPPLING_ICON = "Icons_JGB/Conditions/grappling.png"
const GRAPPLING_COND = "Grappling"
const GRAPPLING_JRNL = `@JournalEntry[${game.journal.getName("Grappling").id}]{Grappling}`
let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
// Only for the OnUse execution case.
//
if ((args[0]?.tag==="OnUse") && (!preCheck())) return;
//-------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
jez.log(`Call the apppriate main function based on mode. ${args[0]}  ${args[0]?.tag}`)
if (args[0] === "off") await doOff();                   // DAE removal
//if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
//if (args[0] === "each") doEach();					    // DAE removal
//if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus
jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    //----------------------------------------------------------------------------------------------
    // Was only one target targeted?
    //
    if (game.user.targets.ids.length !== 1) {
        msg = `Targeted ${game.user.targets.ids.length} tokens, please target a single token.`;
        console.log(msg);
        ui.notifications.warn(msg)
        return (false);
    }
    //----------------------------------------------------------------------------------------------
    // Was a target hit? (always should be, but just in case)
    //
    if (args[0].hitTargets.length !== 1) {
        msg = `Targets hit: ${args[0].hitTargets.length}, nmust be one.`;
        console.log(msg);
        ui.notifications.warn(msg)
        return (false);
    }
    //----------------------------------------------------------------------------------------------
    // Is the target already being afflicted by this ability?  It can only have one root on it.
    //
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    jez.log('tToken.actor.effects',tToken.actor.effects)
    let alreadyGrappled = tToken.actor.effects.find(i => i.data.label === GRAPPLED_COND &&
        i.sourceName === aItem.name);
    if (alreadyGrappled) {
        msg = `${tToken.name} is already already grappled by ${aToken.name}'s ${aItem.name} can not 
            do this twice, simultaneously.`
        ui.notifications.info(msg)
        jez.log(msg)

        jez.addMessage(chatMsg, {color:"darkblue", fSize:15, msg:msg, tag:"saves" })

        return(false)
    } jez.log("all clear to continue.")
    return (true)
}

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let pairedId     = args[1];
    let pairedEffect = args[2];
    let pairedToken  = canvas.tokens.placeables.find(ef => ef.id === pairedId)
    // Remove a "paired" effect when either of the partner effects is deleted
    jez.log(`Attempt to remove ${pairedEffect} from ${pairedToken.name} as well.`)
    let pairedEffectObj = pairedToken.actor.effects.find(i => i.data.label === pairedEffect);
    if (pairedEffectObj) {
        jez.log(`Attempting to remove ${pairedEffectObj.id} from ${pairedToken.actor.uuid}`)
        MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: pairedToken.actor.uuid, effects: [pairedEffectObj.id] });
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }
  
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("A place for things to be done");
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`   Targeted '${tToken?.name}, actor name ${tActor?.name}'`, tToken);
    //----------------------------------------------------------------------------------------------
    // Get the x,y coordinates of the target token to use as anchor for summoned creature
    //
    tCoord = { x: tToken.center.x, y: tToken.center.y }
    jez.log(`Summoning coordinate ${tCoord.x}, ${tCoord.y}`)
    //----------------------------------------------------------------------------------------------
    // Summon the the new actor to the scene
    //
// COOL-THING: Summon an existing actor to the scene
    await executeSummon(MINION, tCoord.x, tCoord.y, null)
    await jez.wait(500)
    //----------------------------------------------------------------------------------------------
    // Find the just summoned token and rename it to our "uniquish" name
    //
// COOL-THING: Renaming a token in the scene
    let mToken = await findTokenByName(MINION)  // minion token
    const updates = { _id: mToken.id, name: MINION_NAME };
    await mToken.update(updates);
    //----------------------------------------------------------------------------------------------
    // Apply Grappled & Grappling Conditions 
    //
    await applyGrappling(mToken, tToken);
    await applyGrappled(tToken, mToken);
    // https://www.w3schools.com/tags/ref_colornames.asp
    msg = `<p style="color:blue;font-size:14px;">
    Maybe say something useful...</p>`
    //postResults(msg);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("The do On Use code")
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/*****************************************************************************************
 *  executeSummon call the runAsGM macro to place the summoned root creature * 
 *****************************************************************************************/
 async function executeSummon(minion, x, y, update) {
    const FUNCNAME = "executeSummon";
    const RUNASGMMACRO = "SummonCreatureMacro";
    // Make sure the RUNASGMMACRO exists and is configured correctly
    const SummonFunc = game.macros.getName(RUNASGMMACRO);
    if (!SummonFunc) { ui.notifications.error(`Cannot locate ${RUNASGMMACRO} run as GM Macro`); return;}
    if (!SummonFunc.data.flags["advanced-macros"].runAsGM) {ui.notifications.error(`${RUNASGMMACRO} "Execute as GM" needs to be checked.`); return; }
    jez.log(` Found ${RUNASGMMACRO}, verified Execute as GM is checked`);
    // Invoke the RunAsGM Macro to do the job
    SummonFunc.execute(minion, x, y, update);
}
/***************************************************************************************************
 * Find an owned token by name on current scene.  Return the token or null if not found
 ***************************************************************************************************/
 async function findTokenByName(name) {
    const FUNCNAME = "findTokenByName(name)";
    let targetToken = null
    let counter = 0;
    //----------------------------------------------------------------------------------------------
    // Loop through tokens on the canvas looking for the one we seek, check each name match for a 
    // coordinated match.  Return a match or null.
    //
    let ownedTokens = canvas.tokens.ownedTokens
    let foundToken = null
    for (let i = 0; i < ownedTokens.length; i++) {
        jez.log(`  ${i}) ${ownedTokens[i].name}`, ownedTokens[i]);
        if (name === ownedTokens[i].name) {
            jez.log(`Eureka I found it! Maybe... (${++counter}`)
            targetToken = ownedTokens[i]
            // See if name match is at the correct coordinates
            if (ownedTokens[i].center.x === tCoord.x && ownedTokens[i].center.y === tCoord.y) {
                jez.log("...Why yes, I did.", ownedTokens[i])
                foundToken = ownedTokens[i]
                break;
            }
        }
    }
    if (foundToken) jez.log(`${counter} ${name}'s token(s) found`, foundToken)
    else jez.log(`${name}s token was not found :-(`)
    jez.log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (foundToken);
}
/***************************************************************************************************
 * Apply the Grappling Condition to the initiating Root
 ***************************************************************************************************/
async function applyGrappling(token1, token2) {
    let constrictingEffect = [{
        label: GRAPPLING_COND,
        icon: GRAPPLING_ICON,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 99, startRound: GAME_RND }, 
        // Sadly, DAE triggers the following even if zero damage gets through to the target
        // flags: { dae: { itemData: aItem, specialDuration: ["isDamaged"] } },
        changes: [
            { key: `flags.gm-notes.notes`, mode: CUSTOM, value: "Can only constrict one target at a time", priority: 20 },
            { key: `macro.itemMacro`, mode: CUSTOM, value: `${token2.id} ${GRAPPLED_COND}`, priority: 20 },
        ]
    }]
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token1.uuid, effects: constrictingEffect });
}
/***************************************************************************************************
 * Apply the Grappled Condition to the target token
 ***************************************************************************************************/
// COOL-THING: Midi Overtime used to apply a DoT effect
 async function applyGrappled(token1, token2) {
    let overTimeValue = `turn=start,label=${aItem.name},damageRoll=1d6+6,damageType=bludgeoning`
    let restrainedEffect = [{
        label: GRAPPLED_COND,
        icon: GRAPPLED_ICON,
        // origin: aActor.uuid,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 99, startRound: GAME_RND }, 
        changes: [
            { key: `flags.VariantEncumbrance.speed`, mode: DOWNGRADE, value: 1, priority: 20 },
            { key: `data.attributes.movement.walk`, mode: DOWNGRADE, value: 1, priority: 20 },
            { key: `data.attributes.movement.swim`, mode: DOWNGRADE, value: 1, priority: 20 },
            { key: `data.attributes.movement.fly`, mode: DOWNGRADE, value: 1, priority: 20 },
            { key: `data.attributes.movement.climb`, mode: DOWNGRADE, value: 1, priority: 20 },
            { key: `data.attributes.movement.burrow`, mode: DOWNGRADE, value: 1, priority: 20 },
            { key: `macro.itemMacro`, mode: CUSTOM, value: `${token2.id} ${GRAPPLING_COND}`, priority: 20 },
            { key: `flags.midi-qol.OverTime`, mode: OVERRIDE, value: `${overTimeValue}`, priority: 20 }
        ]
    }]
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token1.uuid, effects: restrainedEffect });
 }