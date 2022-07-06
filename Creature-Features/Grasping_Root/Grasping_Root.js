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
 * 05/02/22 0.2 Update for Foundry 9.x
 * 07/06/22 0.3 Replace native calls with warpgate to spawn in the roots
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let msg = "";
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor;
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const GRAPPLED_COND = "Grappled"
const GRAPPLING_COND = "Grappling"
const RESTRAINED_COND = "Restrained"
const GRAPPLED_JRNL = `@JournalEntry[${game.journal.getName(GRAPPLED_COND).id}]{Grappled}`
const GRAPPLING_JRNL = `@JournalEntry[${game.journal.getName(GRAPPLING_COND).id}]{Grappling}`
const RESTRAINED_JRNL = `@JournalEntry[${game.journal.getName(RESTRAINED_COND).id}]{Restrained}`

const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const GAME_RND = game.combat ? game.combat.round : 0;
const MINION = "Grasping Root"
const MINION_NAME = `${aToken.name}'s ${MINION} - ${GAME_RND}`
let tCoord = {}     // Will contain coordinate of summoned token
const GRAPPLED_ICON = "Icons_JGB/Conditions/grappling.svg"
const GRAPPLING_ICON = "Icons_JGB/Conditions/grappling.png"
let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
// Only for the OnUse execution case.
//
if ((args[0]?.tag === "OnUse") && (!preCheck())) return;
//-------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
jez.log(`Call the apppriate main function based on mode. ${args[0]}  ${args[0]?.tag}`)
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
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
    jez.log('tToken.actor.effects', tToken.actor.effects)
    let alreadyGrappled = tToken.actor.effects.find(i => i.data.label === GRAPPLED_COND &&
        i.sourceName === aItem.name);
    if (alreadyGrappled) {
        msg = `${tToken.name} is already already grappled by ${aToken.name}'s ${aItem.name} can not 
            do this twice, simultaneously.`
        ui.notifications.info(msg)
        jez.log(msg)

        jez.addMessage(chatMsg, { color: "darkblue", fSize: 15, msg: msg, tag: "saves" })

        return (false)
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
    let pairedId = args[1];
    let pairedEffect = args[2];
    let pairedToken = canvas.tokens.placeables.find(ef => ef.id === pairedId)
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
    let sToken = await executeSummon(MINION, tCoord.x, tCoord.y, MINION_NAME)
    //----------------------------------------------------------------------------------
    // Modify the GRAPPLING condition to include an Overtime DoT element and apply
    //
    let statMod = jez.getStatMod(aToken,"str")
    let effectData = game.dfreds.effectInterface.findEffectByName(GRAPPLED_COND).convertToObject();
    let overTimeVal=`turn=start,label="Grasping Root",damageRoll=1d6+${statMod},saveMagic=true,damageType=bludgeoning`
    effectData.changes.push( { key: 'flags.midi-qol.OverTime', mode: jez.OVERRIDE, value:overTimeVal , priority: 20 })
    game.dfreds.effectInterface.addEffectWith({ effectData: effectData, uuid: tToken.actor.uuid, origin: sToken.actor.uuid });
    //----------------------------------------------------------------------------------
    // Apply the GRAPPLING Condition
    //
    jezcon.add({ effectName: GRAPPLING_COND, uuid: sToken.actor.uuid, origin: sToken.actor.uuid })
    //----------------------------------------------------------------------------------
    // Find the two just added effect data objects so they can be paired, to expire 
    // together.
    //
    await jez.wait(100)
    let tEffect = tToken.actor.effects.find(ef => ef.data.label === GRAPPLED_COND && ef.data.origin === sToken.actor.uuid)
    if (!tEffect) return jez.badNews(`Sadly, there was no Grappled effect from ${sToken.name} found on ${tToken.name}.`, "warn")
    let oEffect = sToken.actor.effects.find(ef => ef.data.label === GRAPPLING_COND)
    if (!oEffect) return jez.badNews(`Sadly, there was no Grappling effect found on ${sToken.name}.`, "warn")
    const GM_PAIR_EFFECTS = jez.getMacroRunAsGM("PairEffects")
    if (!GM_PAIR_EFFECTS) { return false }
    await jez.wait(100)
    await GM_PAIR_EFFECTS.execute(sToken.id, oEffect.data.label, tToken.id, tEffect.data.label)
    //-------------------------------------------------------------------------------
    // Create an Action Item to allow the target to attempt escape
    //
    const GM_MACRO = jez.getMacroRunAsGM("GrappleEscapeFixedDC")
    jez.log("GM_MACRO",GM_MACRO)
    if (!GM_MACRO) { return false }
    await GM_MACRO.execute("create", sToken.document.uuid, tToken.document.uuid, sToken.actor.uuid, 15)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/*****************************************************************************************
 *  executeSummon call the runAsGM macro to place the summoned root creature * 
 *****************************************************************************************/
async function executeSummon(minion, x, y, newname) {
    let updates = {
        token: { name: newname },
        actor: { name: newname },
    }
    const OPTIONS = { controllingActor: aActor };   // Hides an open character sheet
    const CALLBACKS = {
        pre: async (template) => {
            jez.vfxPreSummonEffects(template, { color: "*", scale: 1, opacity: 1 });
            await warpgate.wait(500);
        },
        post: async (template) => {
            jez.vfxPostSummonEffects(template, { color: "*", scale: 1, opacity: 1 });
            await warpgate.wait(500);
        }
    };
    jez.log("About to call Warpgate.spawnAt")
    jez.suppressTokenMoldRenaming()
    let returned = await warpgate.spawnAt({ x: x, y: y }, minion, updates, CALLBACKS, OPTIONS);
    jez.log("returned", returned)
    summonedID = returned[0] // The token ID of the summoned sphere
    summonedToken = canvas.tokens.placeables.find(ef => ef.id === summonedID)
    return summonedToken
}
/***************************************************************************************************
 * Find an owned token by name on current scene.  Return the token or null if not found
 ***************************************************************************************************/
async function findTokenByName(name) {
    const FUNCNAME = "findTokenByName(name)";
    jez.log(`---- Starting ${FUNCNAME} -----`)
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