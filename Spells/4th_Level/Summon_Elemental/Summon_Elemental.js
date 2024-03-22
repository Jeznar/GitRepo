const MACRONAME = "Summon_Elemental.0.1.js"
const TL = 0;                               // Trace Level for this macro
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Automate Summon Elemental
 * 
 * You call forth an elemental spirit. It manifests in an unoccupied space that you can see within range. This corporeal form uses 
 * the Elemental Spirit stat block. When you cast the spell, choose an element: Air, Earth, Fire, or Water. The creature resembles 
 * a bipedal form wreathed in the chosen element, which determines certain traits in its stat block. The creature disappears when 
 * it drops to 0 hit points or when the spell ends.
 * 
 * The creature is an ally to you and your companions. In combat, the creature shares your initiative count, but it takes its turn 
 * immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge 
 * action and uses its move to avoid danger.
 * 
 * At Higher Levels. When you cast this spell using a spell slot of 5th level or higher, use the higher level wherever the spell's 
 * level appears in the stat block.
 * 
 * - Build list of available summons, verifying existence of each template creature
 * - Dialog to select creature to summon
 * - Place summoned creature, including making creature "friendly" (same disposition as caster)
 * - Mod concentration to flip creature to opposite attitude on concentration break
 * - Place timer effect on summoned elemental to delete itself at end of spell duration. Dismiss_Token perhaps?
 * 
 * 07/21/22 0.1 Creation of Macro starting from Conjure_Elemental.0.1
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 1) jez.log(`=== Starting === ${MACRONAME} ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const SPELL_LEVEL = args[0].spellLevel
const SPELL_DC = aActor.data.data.attributes.spelldc
const ELEMENTAL_TYPES = ['Air', 'Earth', 'Fire', 'Water']
const IMAGES = {
    Air: 'Tokens/Monsters/Elementals/Air-Elemental.png',
    Earth: 'Tokens/Monsters/Elementals/Earth-Elemental.png',
    Fire: 'Tokens/Monsters/Elementals/Fire-Elemental.png',
    Water: 'Tokens/Monsters/Elementals/Water-Elemental.png'
}
const IMAGES_ACTOR = {
    Air: 'Tokens/Monsters/Elementals/Avatar/Air-Elemental_Avatar.png',
    Earth: 'Tokens/Monsters/Elementals/Avatar/Earth-Elemental_Avatar.png',
    Fire: 'Tokens/Monsters/Elementals/Avatar/Fire-Elemental_Avatar.png',
    Water: 'Tokens/Monsters/Elementals/Avatar/Water-Elemental_Avatar.png'
}
const ELEMENTAL_TEMPLATE = '%Elemental Spirit%'
const ALLOWED_UNITS = ["", "ft", "any"];
const MAX_RANGE = jez.getRange(aItem, ALLOWED_UNITS) ?? 90
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
// if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.log(`=== Starting === ${MACRONAME} ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/

function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Make sure the templates exist in the actor's directory
    //
    let summonData = game.actors.getName(ELEMENTAL_TEMPLATE)
    if (!summonData) return jez.badNews(`$TAG "${ELEMENTAL_TEMPLATE}" could not be found in actor directory`, "e")
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Pop a dialog to obtain the desired elemental type for this casting
    //
    const queryTitle = "Select Element to be Summoned"
    const queryText = "Pick one from the list (or I'll do it for you!)"
    const RANDOM_ELEMENT = ELEMENTAL_TYPES[Math.floor(Math.random() * ELEMENTAL_TYPES.length)]
    const ELEMENT_SELECTED = await jez.pickRadioListArray(queryTitle, queryText, () => { }, ELEMENTAL_TYPES.sort());
    const ELEMENT = ELEMENT_SELECTED ? ELEMENT_SELECTED : RANDOM_ELEMENT
    if (TL > 1) jez.log(`${TAG} ELEMENT selected`, ELEMENT)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Portals need the same color for pre and post effects, so get that set here. Even though only used when we are doing portals
    //
    const PORTAL_COLORS = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple", "Dark_Red",
        "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange", "Bright_Purple", "Bright_Red", "Bright_Yellow"]
    let index = Math.floor((Math.random() * PORTAL_COLORS.length))
    let portalColor = PORTAL_COLORS[index]
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    const MINION_NAME = `${aToken.name}'s Elemental Spirit`
    let argObj = {
        defaultRange: MAX_RANGE,             // Defaults to 30, but this varies per spell
        duration: 4000,                     // Duration of the intro VFX
        introTime: 250,                     // Amount of time to wait for Intro VFX
        introVFX: `~Portals/Portal_${portalColor}_H_400x400.webm`, // default introVFX file
        minionName: MINION_NAME,
        templateName: ELEMENTAL_TEMPLATE,
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: `~Portals/Masked/Portal_${portalColor}_H_NoBG_400x400.webm`, // default outroVFX file
        scale: 0.5,						    // 
        source: aToken,                     // Coords for source (with a center), typically aToken
        width: 1,                           // Width of token to be summoned, 1 is the default
        traceLvl: 0                         // Trace level, matching calling function decent choice
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    argObj.img = IMAGES[ELEMENT]
    // ---------------------------------------------------------------------------------------------
    // Get updates depending on mood and caster values
    // 
    argObj.updates = customization(MINION_NAME, SPELL_LEVEL, ELEMENT, SPELL_DC, summonData, { traceLvl: TL })
    // if (TL > 1) jez.log(`${TAG} Updates for our ${MOOD} Elemental`, argObj.updates)
    //--------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    const ELE_ID_ARRAY = await jez.spawnAt(ELEMENTAL_TEMPLATE, aToken, aActor, aItem, argObj)
    const ELE_ID = ELE_ID_ARRAY[0]
    if (TL > 1) jez.log(`${TAG} Token ID of Summoned Elemental`, ELE_ID) // '1pQBnOntUvRCZzQS'
    const ELE_UUID = `Scene.${game.scenes.viewed.id}.Token.${ELE_ID}`
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Modify concentrating effect to delete the elemental when concentration breaks
    //
    modConcentratingEffect(aToken, ELE_ID, MINION_NAME)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Delete Amorphous Form if we're making an earth elemental
    if (ELEMENT === "Earth") {
        if (TL > 1) jez.log(`${TAG} Delete Amorphous Form from ${ELEMENT} Elemental`)
        jez.deleteItems("Amorphous Form", "feat", ELE_ID);    // 
    }
    //-----------------------------------------------------------------------------------------------
    // That's all folks
    //
    if (TL > 1) jez.log(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Call back function called after elemental is selected and then proceeds with execution.  
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function pickEleCallBack(selection) {
    const FUNCNAME = "pickEleCallBack(selection)";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL === 1) jez.log(`--- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.log(`--- Starting --- ${MACRO} ${FUNCNAME} ---`, "selection", selection);

    //--------------------------------------------------------------------------------------------------
    // Build a UUID that will be slapped on the concentrating effect for doOff call.  Should look like:
    //   Scene.MzEyYTVkOTQ4NmZk.Token.cBMsqVwfwf1MxRxV
    let elemementalUuid = `Scene.${game.scenes.viewed.id}.Token.${elementalId}`
    modConcentratingEffect(aToken, elemementalUuid)
    //--------------------------------------------------------------------------------------------------
    // Convert Item Card's duration into seconds, if supported units, otherwise go with 3600
    //
    let duration = 3600
    if (aItem.data.duration.units === "turn") duration = aItem.data.duration.value * 6
    if (aItem.data.duration.units === "round") duration = aItem.data.duration.value * 6
    if (aItem.data.duration.units === "minute") duration = aItem.data.duration.value * 60
    if (aItem.data.duration.units === "hour") duration = aItem.data.duration.value * 3600
    //--------------------------------------------------------------------------------------------------
    // Add an effect to our recently summoned elemental to delete itself at the end of the spell duration
    //
    const CE_DESC = `Summoned ${summons} will remain for up to an hour`
    const EXPIRE = ["newDay", "longRest", "shortRest"];
    const GAME_RND = game.combat ? game.combat.round : 0;
    let effectData = {
        label: aItem.name,
        icon: CLOCK_IMG,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: {
            rounds: duration / 6, startRound: GAME_RND,
            seconds: duration, startTime: game.time.worldTime,
            token: aToken.uuid, stackable: false
        },
        flags: {
            dae: { macroRepeat: "none", specialDuration: EXPIRE },
            convenientDescription: CE_DESC
        },
        changes: [
            { key: `macro.execute`, mode: jez.CUSTOM, value: `Dismiss_Tokens ${elemementalUuid}`, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: elemementalUuid, effects: [effectData] });
    //--------------------------------------------------------------------------------------------------
    // Post completion message to item card
    //
    msg = `${aToken.name} has summoned a ${summons} which will serve for the spell duration.`
    postResults(msg)
}
/***************************************************************************************************
 * Modify existing concentration effect to call this macro as an ItemMacro that can use doOff
 * function can be used to clean accumulated effects.  
 ***************************************************************************************************/
async function modConcentratingEffect(token5e, arg, MINION_NAME) {
    const EFFECT = "Concentrating"
    //----------------------------------------------------------------------------------------------
    // Seach the token to find the just added concentrating effect
    //
    await jez.wait(100)
    let effect = await token5e.actor.effects.find(i => i.data.label === EFFECT);
    //----------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect. 
    //    
    const CE_DESC = `Concentrating on ${MINION_NAME}`
    effect.data.changes.push({
        key: `macro.execute`, mode: jez.ADD, value: `DeleteTokenMacro ${arg}`, priority: 20
    })
    effect.data.flags = { convenientDescription: CE_DESC }
    if (TL > 0) jez.log(`effect.data.changes`, effect.data.changes)
    //----------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const result = await effect.update({ 'changes': effect.data.changes, 'flags': effect.data.flags });
    if (result && TL > 1) jez.log(`${MACRO} | Active Effect ${EFFECT} updated!`, result);
}
/***************************************************************************************************
 * Return a data object appropriate for each of the three Elemental moods to be used to customize the
 * summoned token by spell level (for up casts)
 ***************************************************************************************************/
function customization(MINION_NAME, SPELL_LEVEL, ELEMENT, SPELL_DC, SUMMON_DATA, options = {}) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL > 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 2) jez.log(`${TAG} Customization Parms`, 'MINION_NAME', MINION_NAME,
        'SPELL_LEVEL', SPELL_LEVEL, 'ELEMENT    ', ELEMENT, 'SPELL_DC   ', SPELL_DC,
        'SUMMON_DATA', SUMMON_DATA, "options    ", options)
    //-----------------------------------------------------------------------------------------------
    // Function Variables
    //
    let updates = {}
    const DEX_MOD = SUMMON_DATA.data.data.abilities.dex.mod
    const PROFICENCY = SUMMON_DATA.data.data.attributes.prof
    const EXTRA_ATTACK_BONUS = SPELL_DC - 8 - DEX_MOD - PROFICENCY // Additional bonus over natural for Elemental
    // if (TL > 1) jez.log(`${TAG} EXTRA_ATTACK_BONUS (${EXTRA_ATTACK_BONUS}), DEX_MOD (${DEX_MOD}), PROFICENCY (${PROFICENCY})`)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Build language array for elemental
    //
    let languageArray = aActor.data.data.traits.languages.value
    languageArray.push('primordial')
    if (TL > 2) jez.log(`${TAG} Language array`, languageArray)
    let castStat = jez.getCastStat(aActor)
    if (TL > 2) jez.log(`${TAG} Caster cast stat`, castStat)
    let strValue = aActor.data.data.abilities[castStat].value
    if (TL > 2) jez.log(`${TAG} Strength value`, strValue)
    //-----------------------------------------------------------------------------------------------------------------------------------
    //
    const DAM_TYPE = (ELEMENT === "Fire") ? "fire" : "bludgeoning"
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Modifications for all types
    // 
    updates = {
        token: {
            "name": MINION_NAME,
            "img": IMAGES[ELEMENT]
        },
        actor: {
            "name": MINION_NAME,
            "img": IMAGES_ACTOR[ELEMENT],
            data: {
                abilities: {
                    str: {
                        value: strValue,                        // Set strength equal to casters cast stat for attack bonus 
                    }
                },
                attributes: {
                    hp: {
                        max: (SPELL_LEVEL || 4) * 10 + 10,     // 50 + 10 for each spell level above 4th
                        value: (SPELL_LEVEL || 4) * 10 + 10,   // 50 + 10 for each spell level above 4th
                    },
                    ac: {
                        flat: 11 + (SPELL_LEVEL || 4),         // 11 + the level of the spell (natural armor)
                    }
                },
                details: {
                    cr: jez.getCharLevel(aActor),               // Chalenge Rating is caster's level
                },
                traits: {
                    di: {
                        value: ["poison"],                         // Only Fire gets fire immunity  
                    },
                    languages: {
                        value: languageArray,               // Caster's languages plus Primordial
                        custom: '',                         // Caster's languages plus Primordial
                    }
                }
            }
        },
        embedded: {
            Item: {
                "Multiattack (Elemental Spirit)": {
                    "data.description.value": `<p>${MINION_NAME} may make <b>${Math.floor(SPELL_LEVEL / 2)}</b> attacks per attack 
                    action.</p>`,
                    "name": `Multiattack (${Math.floor(SPELL_LEVEL / 2)} per attack action)`,
                },
                "Slam (Elemental Spirit)": {
                    "name": "Slam",
                    "data.attackBonus": 0,
                    "data.damage.parts": [
                        [`1d10[${DAM_TYPE}]+@mod+${(SPELL_LEVEL || 4)}`, DAM_TYPE]
                    ],
                    "data.description.value":
                        `<p><strong>Melee Weapon Attack</strong></p>
                        <ul>
                        <li>${aToken.name}'s spell attack modifier (${SPELL_DC - 8}) to hit,</li>
                        <li>Reach 5 feet,</li>
                        <li>One target,</li>
                        <li>Hit: 1d10 + ${aToken.name}'s Casting Mod (${jez.getCastMod(aActor)}) + spell's cast level (${(SPELL_LEVEL || 4)}) ${DAM_TYPE} damage</li>
                        </ul>`,
                }
            },
        }
    }
    if (TL > 1) jez.log(`${TAG} Special case treatment of our ${ELEMENT} Elemental`, updates)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Air Elemental
    //
    if (ELEMENT === "Air") {
        updates.actor.data.attributes.movement = {
            fly: 40,                                                            // Air gets flight
            hover: true                                                         // Air gets hover
        }
        updates.actor.data.traits.dr = {
            value: ["lightning", "thunder"]           // Air gets lightning & thunder
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Earth Elemental
    //
    if (ELEMENT === "Earth") {
        updates.actor.data.attributes.movement = {
            burrow: 40,                                                        
        }
        updates.actor.data.traits.dr = {
            value: ["piercing", "slashing"]           // Air gets lightning & thunder
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Fire Elemental
    //
    if (ELEMENT === "Fire") {
        updates.actor.data.traits.di = {
            value: ["poison", "fire"]           // Air gets lightning & thunder
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Water Elemental
    //
    if (ELEMENT === "Water") {
        updates.actor.data.attributes.movement = {
            swim: 40,                                                        
        }
        updates.actor.data.traits.dr = {
            value: ["acid"]           // Air gets lightning & thunder
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Done
    //
    return updates
}
