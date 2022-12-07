const MACRONAME = "Fire_Shield.0.2.js"
/*****************************************************************************************
 * Implments Fire Shield!
 * 
 * 04/11/22 0.1 Creation of Macro
 * 12/07/22 0.2 change ui.notification & ui.notfications (typo) to jez.badNews calls
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
const VFX_NAME  = `${MACRO}-${aToken.id}`
//--------------------------------------------------------------------------------------------------
//
if (args[0] === "on") {
    deleteTempItems();
    //----------------------------------------------------------------------------------------------
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
}
//--------------------------------------------------------------------------------------------------
// Execute the removal of buff steps
// TODO: Resistance removal is a problem if actor was already resistant
//
if (args[0] === "off") {
    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken }); // End VFX
    deleteTempItems();                                                      // Delete temp item(s)
    //-----------------------------------------------------------------------------------------------
    // DAE Flag version that could end up removal natural immunity from caster, kept 
    // because it seems an interesting exercise.
    //
    //let element = DAE.getFlag(aActor, 'FireShield');                      // Fetch DAE Flag value
    //let resistances = aActor.data.data.traits.dr.value;                   // Get current resistances
    //const index = resistances.indexOf(element);                           // Find current index
    //resistances.splice(index, 1);                                         // Remove current resist
    //await aActor.update({ "data.traits.dr.value": resistances });         // Store our work
    //ChatMessage.create({content:"Fire Shield expires on " + aToken.name});// Obsolete message
    //await DAE.unsetFlag(aActor, 'FireShield');                            // Clear the DAE Flag
    //----------------------------------------------------------------------------------------------
    // Create and post removal of item message
    //
    msg = `Fire Shield has been removed from ${aToken.name}'s inventory.`
    jez.postMessage({
        color: jez.randomDarkColor(), fSize: 13, icon: aToken.data.img,
        msg: msg, title: `Fire Shield Removed`, token: aToken
    })
}
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 async function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.log("##### chatMsg",chatMsg)
    await jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Delete any previously existing temp items
 ***************************************************************************************************/
async function deleteTempItems() {
    await jez.wait(100)
    let item = aActor.items.getName("Fire Shield (Hot)")            // Seek Hot Shield
    if (!item) item = aActor.items.getName("Fire Shield (Cold)")    // Seek Cold Shield
    if (item) {                                                     // Found one!
        jez.badNews(`Deleted temporary inventory item: ${item.name}`,"i");
        await aActor.deleteEmbeddedDocuments("Item", [item.id])     // Delete the item     
        await jez.wait(100)
        await deleteTempItems()                                     // Look for another one
    }
    return
}
/***************************************************************************************************
 * Set resistance based on parameters, modify existing effect to include appropriate resistance
 ***************************************************************************************************/
async function setResistance(token5e, flavor) {
    jez.log("setResistance(token5e, flavor)", "token5e", token5e, "flavor", flavor)
    //----------------------------------------------------------------------------------
    // Seach the token to find the just added effect
    //
    await jez.wait(100)
    let effect = await token5e.actor.effects.find(i => i.data.label === "Fire Shield");
    //----------------------------------------------------------------------------------
    // Define the desired modification to existing effect for resistance.
    //
    effect.data.changes.push({ key: `data.traits.dr.value`, mode: jez.ADD, value: flavor, priority: 20 })
    //----------------------------------------------------------------------------------
    // Define the desired modification to existing icon (image)
    //
    if (flavor === "fire") effect.data.icon = 'systems/dnd5e/icons/spells/protect-blue-3.jpg'
    if (flavor === "cold") effect.data.icon = 'systems/dnd5e/icons/spells/protect-orange-3.jpg'
    //----------------------------------------------------------------------------------
    // Apply the modification to existing effect
    //
    const RESULT = await effect.update({ 'changes': effect.data.changes,
                                         'icon': effect.data.icon });
    if (RESULT) jez.log(`Active Effect 'Fire Shield' updated!`, RESULT);
    //----------------------------------------------------------------------------------
    // DAE Flag version that could end up removal natural immunity from caster, kept 
    // because it seems an interesting exercise.
    //
    //let resistances = duplicate(token5e.actor.data.data.traits.dr.value);
    //jez.log("resistances",resistances)
    //resistances.push(flavor);
    //jez.log("resistances",resistances)
    //jez.log("1. token5e.actor.data.data.traits.dr", token5e.actor.data.data.traits.dr)
    //await token5e.actor.update({ "data.traits.dr.value": resistances });
    //jez.log("2. token5e.actor.data.data.traits.dr", token5e.actor.data.data.traits.dr)
    //await DAE.setFlag(token5e, 'FireShield', flavor);
    //ChatMessage.create({ content: `${aToken.name} gains resistance to cold` });
}
/***************************************************************************************************
 * Build the temporary item
 ***************************************************************************************************/
async function createTempItem(token5e, flavor) {
    await token5e.actor.createEmbeddedDocuments("Item", [defineItem(flavor)])
    if (!(flavor === "cold" || flavor === "hot")) {
        jez.badNews(`Parameter passed to defineItem(flavor), '${flavor},' is not supported.`,"e")
        return(false)
    }
    let damageType = "cold"
    if (flavor === "cold") damageType = "fire";
    let itemName = `Fire Shield (${flavor})`
    msg = `${itemName}, has been added to ${token5e.name}'s inventory.`
    jez.badNews(msg,"i");
    msg += ` Use this item every time ${token5e.name} is hit by a melee attack from adjacent space.
    <br><br>${token5e.name} is now resistant to ${damageType} damage.`
    jez.postMessage({
        color: jez.randomDarkColor(), fSize: 13, icon: token5e.data.img,
        msg: msg, title: `Fire Shield Added`, token: token5e
    })
}
/***************************************************************************************************
 * Return an object describing the temporary item to be created.
 * 
 * Object will include a dynamically defined ItemMacro
 ***************************************************************************************************/
 function defineItem(flavor) {
     jez.log(`defineItem(flavor)`, flavor)
    if (!(flavor === "cold" || flavor === "hot")) {
        jez.badNews(`Parameter passed to defineItem(flavor), '${flavor},' is not supported.`,"e")
        return(false)
    }
    let color = "orange"
    let damageType = "fire"
    if (flavor === "cold") {
        color = "blue"
        damageType = "cold"
    }
    jez.log(`flavor: ${flavor}`)
    //----------------------------------------------------------------------------------
    // Set string with description to be included on the temp item.
    //
    const DESC = `<p>Everytime a creature within 5 feet of you hits you with a melee Attack:</p>
    <ol>
    <li>Target the offender,</li>
    <li>Trigger this ability.</li>
    </ol>
    <p>The attacker will take damage from your Fire Shield (unless immune).</p>`
    //----------------------------------------------------------------------------------
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
    //----------------------------------------------------------------------------------
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
          "weaponType": "natural"
        },
        "effects": []
      }
}

/***************************************************************************************
 * Startup the VFX on the token
 ***************************************************************************************/
function runVFX(token5e, flavor) {
    jez.log(`runVFX(token5e, flavor)`, "token5e", token5e, "flavor", flavor)
    if (!(flavor === "cold" || flavor === "hot")) {
        jez.badNews(`Flavor parm in runVFX(token5e, flavor), '${flavor},' is bad.`,"e")
        return(false)
    }
    let color = "yellow"
    let vfxLoop = "jb2a.wall_of_fire.ring.yellow"
    if (flavor === "cold") {
        color = "blue"
        vfxLoop = "jb2a.wall_of_fire.ring.blue"
    }
    jez.runRuneVFX(token5e, jez.getSpellSchool(aItem), color)
    jez.log("vfxLoop", vfxLoop)
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