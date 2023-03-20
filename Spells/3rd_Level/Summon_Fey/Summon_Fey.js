const MACRONAME = "Summon_Fey.0.3.js"
console.log(MACRONAME)
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Rebuild Summon Fey which used to utilize the Automated Evocations module.
 * 
 *   You call forth a fey spirit. It manifests in an unoccupied space that you can see 
 *   within range. This corporeal form uses the Fey Spirit stat block. When you cast 
 *   the spell, choose a mood: Fuming, Mirthful, or Tricksy. The creature resembles a 
 *   fey creature of your choice marked by the chosen mood, which determines one of the 
 *   traits in its stat block. The creature disappears when it drops to 0 hit points or 
 *   when the spell ends.
 * 
 *   The creature is an ally to you and your companions. In combat, the creature shares 
 *   your initiative count, but it takes its turn immediately after yours. It obeys your 
 *   verbal commands (no action required by you). If you don't issue any, it takes the 
 *   Dodge action and uses its move to avoid danger.
 * 
 *   At Higher Levels. When you cast this spell using a spell slot of 4th level or higher, 
 *   use the higher level wherever the spell's level appears in the stat block.
 * 
 * 01/14/22 0.1 Creation of Macro
 * 11/26/22 0.2 Update to not use AE module
 * 03/20/23 0.3 Fix to attack/damage of the shortsword which is now named "Shortsword (Fey)"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//-----------------------------------------------------------------------------------------------------------------------------------
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
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const RUNASGMMACRO = "DeleteTokenMacro";
const viewedScene = game.scenes.viewed;
const EFFECT_NAME = 'Summon Fey'
const SPELL_LEVEL = args[0].spellLevel
const SPELL_DC = aActor.data.data.attributes.spelldc
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });     // Midi ItemMacro On Use
if (args[0] === "off") await doOff({ traceLvl: TL });                           // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
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
    //-----------------------------------------------------------------------------------------------
    // Define our doOnUse Values
    //
    const FEY_MOODS = ["Fuming", "Mirthful", "Tricksy"]
    if (TL > 1) jez.trace(`${TAG} FEY_MOODS`, FEY_MOODS)
    let feyTemplates = []
    for (let i = 0; i < FEY_MOODS.length; i++) feyTemplates.push(`${FEY_MOODS[i]} Fey`)
    if (TL > 1) jez.trace(`${TAG} feyTemplates`, feyTemplates)
    //-----------------------------------------------------------------------------------------------
    // Make sure the templates exist in the actor's directory
    //
    for (let i = 0; i < feyTemplates.length; i++) {
        if (TL > 1) jez.trace(`${TAG} Looking for actor ${feyTemplates[i]}`)
        let nameActor = game.actors.getName(feyTemplates[i])
        if (!nameActor)
            return jez.badNews(`$TAG "${feyTemplates[i]}" could not be found in actor directory`, "e")
    }
    //-----------------------------------------------------------------------------------------------
    // Dialog to select the mood of our spirit
    //
    const queryTitle = "Select Mood of the Fey to be Summoned"
    const queryText = "Pick one from the list (or I'll do it for you!)"
    const MOOD = await jez.pickRadioListArray(queryTitle, queryText, dummyFunction, FEY_MOODS.sort());
    if (!MOOD) MOOD = FEY_MOODS[Math.floor(Math.random() * FEY_MOODS.length)]
    const MINION = `${MOOD} Fey`
    if (TL > 1) jez.trace(`${TAG} Fey selected`, MINION)
    function dummyFunction(itemSelected) { return } // RadioList requires a function...
    //-----------------------------------------------------------------------------------------------
    // 
    //
    const ALLOWED_UNITS = ["", "ft", "any"];
    let maxRange = jez.getRange(aItem, ALLOWED_UNITS) ?? 90
    //--------------------------------------------------------------------------------------------------
    // Portals need the same color for pre and post effects, so get that set here. Even though only used
    // when we are doing portals
    //
    const PORTAL_COLORS = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple", "Dark_Red",
        "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange", "Bright_Purple", "Bright_Red",
        "Bright_Yellow"]
    let index = Math.floor((Math.random() * PORTAL_COLORS.length))
    let portalColor = PORTAL_COLORS[index]
    //--------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    const MINION_NAME = `${aToken.name}'s ${MINION}`
    let argObj = {
        defaultRange: maxRange,             // Defaults to 30, but this varies per spell
        duration: 4000,                     // Duration of the intro VFX
        introTime: 250,                     // Amount of time to wait for Intro VFX
        introVFX: `~Portals/Portal_${portalColor}_H_400x400.webm`, // default introVFX file
        minionName: MINION_NAME,
        templateName: MINION,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: `~Portals/Masked/Portal_${portalColor}_H_NoBG_400x400.webm`, // default outroVFX file
        scale: 0.5,						    // 
        source: aToken,                     // Coords for source (with a center), typically aToken
        width: 1,                           // Width of token to be summoned, 1 is the default
        traceLvl: 0                         // Trace level, matching calling function decent choice
    }
    //--------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    let summonData = await game.actors.getName(MINION)
    argObj.img = summonData ? summonData.img : aItem.img
    // ---------------------------------------------------------------------------------------------
    // Get updates dependeing on mood and caster values
    //
    argObj.updates = customization(MINION_NAME, SPELL_LEVEL, MOOD, SPELL_DC, summonData, { traceLvl: TL })
    if (TL > 1) jez.trace(`${TAG} Updates for our ${MOOD} Fey`, argObj.updates)
    //--------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    const FEY_ID_ARRAY = await jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
    const FEY_ID = FEY_ID_ARRAY[0]
    if (TL > 1) jez.trace(`${TAG} Token ID of Summoned Fey`, FEY_ID) // '1pQBnOntUvRCZzQS'
    //--------------------------------------------------------------------------------------------------
    // Modify existing DAE effect to despawn our summon on termination
    //
    let effect = await aActor.effects.find(i => i.data.label === EFFECT_NAME);
    if (!effect) return jez.badNews(`${TAG} Oddly, could not find ${EFFECT_NAME} on ${aToken.name}`, 'e')
    effect.data.changes.push({
        key: `macro.itemMacro`, mode: jez.CUSTOM, value: `"${MINION_NAME}" ${FEY_ID}`, priority: 20
    })
    const result = await effect.update({ 'changes': effect.data.changes });
    if (!result) return jez.badNews(`${TAG} Sadly, could not update ${EFFECT_NAME} on ${aToken.name}`, 'e')
    if (TL > 1) jez.trace(`${TAG} Active Effect ${EFFECT_NAME} on ${aToken.name} updated!`, result);
    //--------------------------------------------------------------------------------------------------
    // Add our Fey to combat tracker with appropriate initiative, if summoner is in combat
    //
    const ATOKEN_INIT_VALUE = aToken?.combatant?.data?.initiative
    if (!ATOKEN_INIT_VALUE) jez.badNews(`${aToken.name} not in combat, can't add ${MINION_NAME}.`, 'i')
    else {
        const FEY_INIT = ATOKEN_INIT_VALUE - 0.001
        await jez.combatAddRemove('Add', FEY_ID, { traceLvl: 0 })
        await jez.wait(1000)
        await jez.combatInitiative(FEY_ID, { formula: FEY_INIT, traceLvl: 0 })
    }
    //--------------------------------------------------------------------------------------------------
    // Final Message
    //
    msg = `${aToken.name} has summoned a ${MINION}. It obeys ${aToken.name}'s verbal commands (no 
        action required from ${aToken.name}). If no command issued in a round, it takes the Dodge 
        action and uses its move to avoid danger.`
    postResults(msg)
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    //
    //
    const FEY_NAME = args[1]
    const FEY_ID = args[2]
    const SCENE_ID = game.scenes.viewed.id
    let fToken = canvas.tokens.placeables.find(ef => ef.id === FEY_ID)
    if (TL > 2) jez.trace(`${TAG} Despawning Fey Info`,
        "FEY_NAME ==>", FEY_NAME,
        "SCENE_ID ==>", SCENE_ID,
        "FEY_ID ==>", FEY_ID,
        "fToken  ==>", fToken)
    if (fToken) {
        if (TL > 2) jez.trace(`${TAG} Dismissing ${fToken.name}`, fToken)
        runVFXSmoke(fToken.center)
        warpgate.dismiss(FEY_ID, SCENE_ID)
        await jez.wait(750)
    }
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Run a simple smoke VFX on specified location
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function runVFXSmoke(coords) {
    const VFX_SMOKE = `modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Regular_Grey_400x400.webm`
    new Sequence()
        .effect()
        .file(VFX_SMOKE)
        .atLocation(coords)
        .scale(.5)
        .opacity(.5)
        .play()
}
/***************************************************************************************************
 * Post the results to chat card
 ***************************************************************************************************/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG}--- Finished ---`);
}
/***************************************************************************************************
 * Return a data object appropriate for each of the three Fey moods to be used to customize the
 * summoned token by spell level (for up casts)
 ***************************************************************************************************/
function customization(MINION_NAME, SPELL_LEVEL, MOOD, SPELL_DC, SUMMON_DATA, options = {}) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("Customization Parms", 'MINION_NAME', MINION_NAME,
        'SPELL_LEVEL', SPELL_LEVEL, 'MOOD       ', MOOD, 'SPELL_DC   ', SPELL_DC,
        'SUMMON_DATA', SUMMON_DATA, "options    ", options)
    //-----------------------------------------------------------------------------------------------
    // Function Variables
    //
    let updates = {}
    const DEX_MOD = SUMMON_DATA.data.data.abilities.dex.mod
    const PROFICENCY = SUMMON_DATA.data.data.attributes.prof
    const EXTRA_ATTACK_BONUS = SPELL_DC - 8 - DEX_MOD - PROFICENCY // Additional bonus over natural for Fey
    if (TL > 1) jez.trace(`${TAG} EXTRA_ATTACK_BONUS (${EXTRA_ATTACK_BONUS}), DEX_MOD (${DEX_MOD}), PROFICENCY (${PROFICENCY})`)
    //-----------------------------------------------------------------------------------------------
    // Fuming Mood
    //
    if (MOOD === "Fuming") {
        if (TL > 1) jez.trace(`${TAG} Special case treatment of our ${MOOD} Fey`)
        updates = {
            token: { "name": MINION_NAME },
            actor: {
                "data.attributes.hp.max": (SPELL_LEVEL || 3) * 10,
                "data.attributes.hp.value": (SPELL_LEVEL || 3) * 10,
                "data.attributes.ac.flat": (SPELL_LEVEL || 3) + 12,
                "name": MINION_NAME
            },
            embedded: {
                Item: {
                    "Multiattack": {
                        "data.description.value": `<p>The summoned <b>fey</b> makes <b>${Math.floor(SPELL_LEVEL / 2)}
                        </b> attack(s) per attack action.</p>`
                    },
                    "Shortsword (Fey)": {
                        "data.attackBonus": EXTRA_ATTACK_BONUS,
                        "data.damage.parts": [
                            [`1d6[piercing]+@mod+${(SPELL_LEVEL || 3)}`, "piercing"],
                            [`1d6[force]`, "force"],
                        ],
                        "data.description.value":
                            `<p><strong>Melee Weapon Attack</strong></p>
                            <ul>
                            <li>${aToken.name}'s spell attack modifier (${SPELL_DC - 8}) to hit,</li>
                            <li>Reach 5 ft.,</li>
                            <li>One target,</li>
                            <li>Hit: 1d6 + 3 (Dex Mod) + the spell's level (${(SPELL_LEVEL || 3)}) piercing damage + 1d6 force damage</li>
                            </ul>`,
                    }
                },
            }
        }
    }
    //-----------------------------------------------------------------------------------------------
    // Mirthful Mood
    //
    if (MOOD === "Mirthful") {
        if (TL > 1) jez.trace(`${TAG} Special case treatment of our ${MOOD} Fey`)
        updates = {
            token: { "name": MINION_NAME },
            actor: {
                "data.attributes.hp.max": (SPELL_LEVEL || 3) * 10,
                "data.attributes.hp.value": (SPELL_LEVEL || 3) * 10,
                "data.attributes.ac.flat": (SPELL_LEVEL || 3) + 12,
                "name": (MINION_NAME)
            },
            embedded: {
                Item: {
                    "Multiattack": {
                        "data.description.value": `<p>The summoned <b>fey</b> makes <b>${Math.floor(SPELL_LEVEL / 2)}
                        </b> attack(s) per attack action.</p>`
                    },
                    "Shortsword (Fey)": {
                        "data.attackBonus": EXTRA_ATTACK_BONUS,
                        "data.damage.parts": [
                            [`1d6[piercing]+@mod+${(SPELL_LEVEL || 3)}`, "piercing"],
                            [`1d6[force]`, "force"],
                        ],
                        "data.description.value":
                            `<p><strong>Melee Weapon Attack</strong></p>
                            <ul>
                            <li>${aToken.name}'s spell attack modifier (${SPELL_DC - 8}) to hit,</li>
                            <li>Reach 5 ft.,</li>
                            <li>One target,</li>
                            <li>Hit: 1d6 + 3 (Dex Mod) + the spell's level (${(SPELL_LEVEL || 3)}) piercing damage + 1d6 force damage</li>
                            </ul>`,
                    },
                    "Mirthful Fey Charm": {
                        "data.save.dc": (SPELL_DC || 8),
                        "data.description.value":
                            `Immediately after a <b>@Item[4ZDtnbKJV5y6jjW5]{Fey Step}</b>, the fey can attempt to charm 
                            one creature it can see within 10 feet of it, The creature must make a 
                            DC${SPELL_DC} wisdom save or be 
                            @JournalEntry[i3AsMG5XwVIvE8TK]{charmed} by the fey and ${aToken.name} for 
                            1 minute or until the target takes any damage.`
                    }
                },
            }
        }
    }
    //-----------------------------------------------------------------------------------------------
    // Tricksy Mood
    //
    if (MOOD === "Tricksy") {
        if (TL > 1) jez.trace(`${TAG} Special case treatment of our ${MOOD} Fey`)
        updates = {
            token: { "name": MINION_NAME },
            actor: {
                "data.attributes.hp.max": (SPELL_LEVEL || 3) * 10,
                "data.attributes.hp.value": (SPELL_LEVEL || 3) * 10,
                "data.attributes.ac.flat": (SPELL_LEVEL || 3) + 12,
                "name": (MINION_NAME)
            },
            embedded: {
                Item: {
                    "Multiattack": {
                        "data.description.value": `<p>The summoned <b>fey</b> makes <b>${Math.floor(SPELL_LEVEL / 2)}
                        </b> attack(s) per attack action.</p>`
                    },
                    "Shortsword (Fey)": {
                        "data.attackBonus": EXTRA_ATTACK_BONUS,
                        "data.damage.parts": [
                            [`1d6[piercing]+@mod+${(SPELL_LEVEL || 3)}`, "piercing"],
                            [`1d6[force]`, "force"],
                        ],
                        "data.description.value":
                            `<p><strong>Melee Weapon Attack</strong></p>
                            <ul>
                            <li>${aToken.name}'s spell attack modifier (${SPELL_DC - 8}) to hit,</li>
                            <li>Reach 5 ft.,</li>
                            <li>One target,</li>
                            <li>Hit: 1d6 + 3 (Dex Mod) + the spell's level (${(SPELL_LEVEL || 3)}) piercing damage + 1d6 force damage</li>
                            </ul>`,
                    }
                },
            }
        }
    }
    //-----------------------------------------------------------------------------------------------
    // Done
    //
    return updates
}