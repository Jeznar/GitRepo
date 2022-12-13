const MACRONAME = "Fire_Shield.0.3.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implments Fire Shield!
 * 
 * 04/11/22 0.1 Creation of Macro
 * 12/07/22 0.2 change ui.notification & ui.notfications (typo) to jez.badNews calls
 * 12/13/22 0.3 Update logging and set a target requirement for the temp item
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
const VFX_NAME = `${MACRO}-${aToken.id}`
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "on") await doOn({ traceLvl: TL });                     // DAE Application
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);

//-----------------------------------------------------------------------------------------------------------------------------------
//


/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set On
 * This runs on actor that has the affected applied to it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOn(options = {}) {
    const FUNCNAME = "doOn(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    await jez.deleteItems("Fire Shield (Hot)", "weapon", aActor);
    await jez.deleteItems("Fire Shield (Cold)", "weapon", aActor);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pop the dialog to select shield type
    //
    new Dialog({
        title: "Hot or Cold Shield",
        buttons: {
            one: {
                label: "Hot",
                callback: async () => {
                    runVFX(aToken, "hot")           // Launch the VFX
                    await createTempItem(aToken, "hot")   // Create the temporary item
                    await setResistance(aToken, "cold")   // Set appropriate resistance
                }
            },
            two: {
                label: "Cold",
                callback: async () => {
                    runVFX(aToken, "cold")          // Launch the VFX
                    await createTempItem(aToken, "cold")  // Create the temporary item
                    await setResistance(aToken, "fire")   // Set appropriate resistance
                }
            },
        }
    }).render(true);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOff(options = {}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Execute the removal of buff steps
    // TODO: Resistance removal is a problem if actor was already resistant
    //
    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken }); // End VFX
    await jez.deleteItems("Fire Shield (Hot)", "weapon", aActor);
    await jez.deleteItems("Fire Shield (Cold)", "weapon", aActor);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Create and post removal of item message
    //
    msg = `Fire Shield has been removed from ${aToken.name}'s inventory.`
    jez.postMessage({ color: jez.randomDarkColor(), fSize: 13, icon: aToken.data.img, msg: msg, title: `Fire Shield Removed`, 
        token: aToken })
    //-------------------------------------------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Set resistance based on parameters, modify existing effect to include appropriate resistance
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function setResistance(token5e, flavor, options = {}) {
    const FUNCNAME = "setResistance(token5e, flavor, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "token5e", token5e, "flavor", flavor, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Seach the token to find the just added effect
    //
    await jez.wait(100)
    let effect = await token5e.actor.effects.find(i => i.data.label === "Fire Shield");
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define the desired modification to existing effect for resistance.
    //
    effect.data.changes.push({ key: `data.traits.dr.value`, mode: jez.ADD, value: flavor, priority: 20 })
    //-------------------------------------------------------------------------------------------------------------------------------    -
    // Define the desired modification to existing icon (image)
    //
    if (flavor === "fire") effect.data.icon = 'systems/dnd5e/icons/spells/protect-blue-3.jpg'
    if (flavor === "cold") effect.data.icon = 'systems/dnd5e/icons/spells/protect-orange-3.jpg'
    //-------------------------------------------------------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const RESULT = await effect.update({
        'changes': effect.data.changes,
        'icon': effect.data.icon
    });
    if (RESULT) if (TL>1) jez.trace(`${TAG} Active Effect 'Fire Shield' updated!`, RESULT);
    //-------------------------------------------------------------------------------------------------------------------------------
    // DAE Flag version that could end up removal natural immunity from caster, kept 
    // because it seems an interesting exercise.
    //
    //let resistances = duplicate(token5e.actor.data.data.traits.dr.value);
    //if (TL>1) jez.trace(`${TAG} resistances`,resistances)
    //resistances.push(flavor);
    //if (TL>1) jez.trace(`${TAG} resistances`,resistances)
    //if (TL>1) jez.trace(`${TAG} 1. token5e.actor.data.data.traits.dr`, token5e.actor.data.data.traits.dr)
    //await token5e.actor.update({ "data.traits.dr.value": resistances });
    //if (TL>1) jez.trace(`${TAG} 2. token5e.actor.data.data.traits.dr`, token5e.actor.data.data.traits.dr)
    //await DAE.setFlag(token5e, 'FireShield', flavor);
    //ChatMessage.create({ content: `${aToken.name} gains resistance to cold` });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Build the temporary item
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function createTempItem(token5e, flavor, options = {}) {
    const FUNCNAME = "createTempItem(token5e, flavor, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "token5e", token5e, "flavor", flavor, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    await token5e.actor.createEmbeddedDocuments("Item", [defineItem(flavor)])
    if (!(flavor === "cold" || flavor === "hot")) {
        jez.badNews(`Parameter passed to defineItem(flavor), '${flavor},' is not supported.`, "e")
        return (false)
    }
    let damageType = "cold"
    if (flavor === "cold") damageType = "fire";
    let itemName = `Fire Shield (${flavor})`
    msg = `${itemName}, has been added to ${token5e.name}'s inventory.`
    jez.badNews(msg, "i");
    msg += ` Use this item every time ${token5e.name} is hit by a melee attack from adjacent space.
    <br><br>${token5e.name} is now resistant to ${damageType} damage.`
    jez.postMessage({
        color: jez.randomDarkColor(), fSize: 13, icon: token5e.data.img,
        msg: msg, title: `Fire Shield Added`, token: token5e
    })
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Return an object describing the temporary item to be created.
 * 
 * Object will include a dynamically defined ItemMacro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function defineItem(flavor, options = {}) {
    const FUNCNAME = "defineItem(flavor, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "flavor", flavor, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    if (!(flavor === "cold" || flavor === "hot")) 
        return jez.badNews(`Parameter passed to defineItem(flavor), '${flavor},' is not supported.`, "e")
    //-------------------------------------------------------------------------------------------------------------------------------
    let color = "orange"
    let damageType = "fire"
    if (flavor === "cold") {
        color = "blue"
        damageType = "cold"
    }
    if (TL>1) jez.trace(`${TAG} flavor: ${flavor}`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Set string with description to be included on the temp item.
    //
    const DESC = `<p>Everytime a creature within 5 feet of you hits you with a melee Attack:</p>
    <ol>
    <li>Target the offender,</li>
    <li>Trigger this ability.</li>
    </ol>
    <p>The attacker will take damage from your Fire Shield (unless immune).</p>`
    //-------------------------------------------------------------------------------------------------------------------------------
    // Set string for itemMacro
    //
    let itemMacro = `// This macro runs VFX for Fire Shield
let color = "orange"
const IMAGE = args[0]?.item.img.toLowerCase()
if(IMAGE.includes("blue")) color = "blue"
new Sequence()
    .effect()
        .file(\`jb2a.fire_bolt.\${color}\`)
        .atLocation(canvas.tokens.get(args[0].tokenId))
        .stretchTo(args[0].targets[0])
    .play()`
    //-------------------------------------------------------------------------------------------------------------------------------
    // Return the object that defines the temporary inventory item
    //
    let effectName = `Fire Shield (${flavor[0].toUpperCase() + flavor.slice(1)})`
    return {
        "name": effectName,
        "type": "weapon",
        "img": `systems/dnd5e/icons/spells/protect-${color}-3.jpg`,
        "flags": {
            "midi-qol": {
                "onUseMacroName": "ItemMacro"
            },
            "itemacro": {
                "macro": {
                    "_data": {
                        "name": effectName,
                        "type": "script",
                        "scope": "global",
                        "command": itemMacro,
                    },
                    "data": {
                        "name": effectName,
                        "type": "script",
                        "scope": "global",
                        "command": itemMacro,
                        //"author": "feceaHtk8xrriPzY"
                    }
                }
            }
        },
        "data": {
            "source": "Fire Shield Spell",
            "description": {
                "value": DESC
            },
            "activation": {
                "type": "special",
                "cost": 0,
                "condition": "whenever a creature within 5 feet of you hits you with a melee Attack"
            },
            "equipped": "true",
            "actionType": "other",
            "damage": {
                "parts": [
                    [
                        "2d8",
                        damageType
                    ]
                ]
            },
            target: {
                type: 'creature',
                value: '1'
            },
            "weaponType": "natural"
        },
        "effects": []
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Startup the VFX on the token
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function runVFX(token5e, flavor, options = {}) {
    const FUNCNAME = "runVFX(token5e, flavor, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "token5e", token5e, "flavor", flavor, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    if (!(flavor === "cold" || flavor === "hot")) {
        jez.badNews(`Flavor parm in runVFX(token5e, flavor), '${flavor},' is bad.`, "e")
        return (false)
    }
    let color = "yellow"
    let vfxLoop = "jb2a.wall_of_fire.ring.yellow"
    if (flavor === "cold") {
        color = "blue"
        vfxLoop = "jb2a.wall_of_fire.ring.blue"
    }
    jez.runRuneVFX(token5e, jez.getSpellSchool(aItem), color)
    if (TL>1) jez.trace(`${TAG} vfxLoop`, vfxLoop)
    new Sequence()
        .effect()
        .file(vfxLoop)
        .attachTo(token5e)
        .scaleToObject(1.25)
        .opacity(1)
        .fadeIn(1000)
        .fadeOut(1000)
        .belowTokens(true)
        .persist()
        .name(VFX_NAME)
        .play()
}