const MACRONAME = "Blazing_Weapon.0.1.js"
/****************************************************************************************************
 * Create a Blazing weapon abiity for the Helm of Brilliance to implement this portion:
 * 
 *   As long as the helm has at least one fire opal, you can use an action and speak a command word 
 *   to cause one weapon you are holding to burst into flames. The flames emit bright light in a 
 *   10-foot radius and dim light for an additional 10 feet. The flames are harmless to you and the 
 *   weapon. When you hit with an attack using the blazing weapon, the target takes an extra 1d6 fire 
 *   damage. The flames last until you use a bonus action to speak the command word again or until you 
 *   drop or stow the weapon.
 * 
 * 11/23/22 0.1 Creation of Macro from Magic_Weapon.0.5.js
 ****************************************************************************************************/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
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
//Make sure advanced-macros module is active
//
if (!game.modules.get("advanced-macros")?.active) 
    return jez.badNews("Please enable the Advanced Macros module","e")
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const EFFECT_NAME = "Blazing Weapon"
const FLAG_NAME = "blazingWeapon"
function clamp(val, min, max) { return val > max ? max : val < min ? min : val }
function setBonus(level) { return clamp(Math.floor(level/2), 1, 3) }
const VFX_NAME = `${aToken.name} Flame`
const DEFAULT_SOURCE_NAME = 'Helm of Brilliance'
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff({traceLvl:TL});                   // DAE removal
if (args[0] === "on") await doOn({traceLvl:TL});                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Ending ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function preCheck() {
    if (args[0].targets.length !== 1)       // If not exactly one target 
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`,"w");
    return(true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG}--- Finished ---`);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 * 
 * Most significantly, remove concentrating effect if nothing was targeted.
 ***************************************************************************************************/
async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    // Verify the the user of this ability has the Helm of Brillance equiped and attuned. If they 
    // don't, remove the applied buff and delete this item
    //

    //-----------------------------------------------------------------------------------------------
    // Post completion message
    //
    msg = `${aToken.name} has caused a weapon to burst into flames which harm neither the user nor 
        the weapon.`
    postResults(msg)
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return (true);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 * 
 * Select for weapon and apply bonus based on spell level
 ***************************************************************************************************/
async function doOn(options={}) {
    const FUNCNAME = "doOn(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //---------------------------------------------------------------------------------------------------
    // Seemingly the spell's cast at level is stashed in args[1], grab it as use it to scale the effect
    //
    // const SPELL_LEVEL = args[1]
    // if (TL>2) jez.trace(`${TAG} SPELL_LEVEL from args[1]`, SPELL_LEVEL);
    //---------------------------------------------------------------------------------------------------
    // Set Function specific globals
    //
    let weapon_content = ``;
    // const DAE_ITEM = LAST_ARG.efData.flags.dae.itemData
    // if (TL>2) jez.trace(`${TAG} DAE_ITEM`, DAE_ITEM);
    let weapons = aActor.items.filter(i => i.data.type === `weapon`);
    if (TL>2) jez.trace(`${TAG} weapons`,weapons);
    //---------------------------------------------------------------------------------------------------
    // Grab the source item name, out of description by finding a RegEx that:
    // - Starts with "Source Item:"
    // - Any amount of white space (discarded)
    // - Contains at least one character and stops at "<" or newline (this is the name of source item)
    // - Any amount of white space (discarded)
    // - Ends with a new line
    //
    const REG_EXP = /Source Item:\s*([^<]+)\s*/; 
    let sourceItemName = aItem.data?.description?.value.match(REG_EXP)[1];
    if (TL>2) jez.trace(`${TAG} Searching Description`,
        `aItem.data.description.value`, aItem.data?.description?.value,
        'REG_EXP                     ', REG_EXP,
        `sourceItemName              `, sourceItemName);
    if (!sourceItemName) {
        msg = `Unable to find name of source item in description of ${aItem.name}.`
        jez.badNews(msg,"w")
        msg += `<br><br>Assuming default item name: "${DEFAULT_SOURCE_NAME}"<br><br>
        Source item name should be in the description and start with "Source Item:", follwed by the 
        item name and a new line.`
        jez.postMessage({color: jez.randomDarkColor(), fSize: 14, token: aToken,
                icon: aItem.img, msg: msg, title: `${aItem.name} Config Error?`})
        sourceItemName = DEFAULT_SOURCE_NAME
    }
    //---------------------------------------------------------------------------------------------------
    // Find the source item, check that it is equipped and attuned.
    //
    let itemOrigin = aActor.items.find(item => item.data.name === sourceItemName && item.type === 'equipment');
    let goodToGo = true
    if (itemOrigin) {
        if (TL>2) jez.trace(`${TAG} Origin Item`,itemOrigin);
        if (!itemOrigin.data.data.equipped) {
            msg = `${sourceItemName} is not equipped!`
            jez.badNews(msg,"w")
            goodToGo = false
        }
        if (itemOrigin.data.data.attunement !== 2) {
            msg = `${sourceItemName} is not attuned!`
            jez.badNews(msg,"w")
            goodToGo = false
        }
        if (TL>2) jez.trace(`${TAG} ${sourceItemName} was found, it is equipped and attuned.`)
    }
    else {
        msg = `Could not find ${sourceItemName} in ${aToken.name}'s inventory`
        jez.badNews(msg,"w")
        goodToGo = false
    }
    //---------------------------------------------------------------------------------------------------
    // If any of the error conditions were found, compose message, remove the effect and bail out.
    //
    if (!goodToGo) {
        let aEffect = await aActor?.effects?.find(ef => ef?.data?.label === EFFECT_NAME)
        if (aEffect) await aEffect.delete();
        msg = `${msg}<br><br>
        Deleting effect on ${aToken.name}.`
        jez.postMessage({color: jez.randomDarkColor(), fSize: 14, token: aToken,
                icon: aItem.img, msg: msg, title: `${aItem.name} Failed`})
        return
    }
    //-----------------------------------------------------------------------------------------------
    // Build HTML structure holding the target's weapons, EXAMPLE follows:
    //
    for (let weapon of weapons) {
        weapon_content += `<label class="radio-label">
    <input type="radio" name="weapon" value="${weapon.id}">
    <img src="${weapon.img}" style="border:0px; width: 50px; height:50px;">
    ${weapon.data.name}
    </label>`;
    }
    if (TL>3) jez.trace(`${TAG} weapon_content`,weapon_content);
    //-----------------------------------------------------------------------------------------------
    // Build HTML defining the dialog
    //
    let content = `
    <style>
    .magicWeapon .form-group {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        align-items: flex-start;
      }
      
      .magicWeapon .radio-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        justify-items: center;
        flex: 1 0 25%;
        line-height: normal;
      }
      
      .magicWeapon .radio-label input {
        display: none;
      }
      
      .magicWeapon img {
        border: 0px;
        width: 50px;
        height: 50px;
        flex: 0 0 50px;
        cursor: pointer;
      }
          
      /* CHECKED STYLES */
      .magicWeapon [type=radio]:checked + img {
        outline: 2px solid #f00;
      }
    </style>
    <form class="magicWeapon">
      <div class="form-group" id="weapons">
          ${weapon_content}
      </div>
    </form>
    `;
    if (TL>3) jez.trace(`${TAG} content`,content);
    //-----------------------------------------------------------------------------------------------
    // Define the dialog to display
    //
    new Dialog({
        content,
        buttons:
        {
            Ok:
            {
                label: `Ok`,
                callback: async (html) => {
                    //-------------------------------------------------------------------------------
                    // Define a bunch of important variables
                    //
                    let itemId = $("input[type='radio'][name='weapon']:checked").val();
                    let weaponItem = aActor.items.get(itemId);
                    let copy_item = duplicate(weaponItem);
                    let wpDamage = copy_item.data.damage.parts[0][0]
                    const WP_DMG_ARRAY = copy_item.data.damage.parts
                    let verDamage = copy_item.data.damage.versatile;
                    if (TL>2) jez.trace(`${TAG} --- Callback Values ---`, "itemId", itemId, 
                        "weaponItem", weaponItem, "copy_item", copy_item,  
                        "wpDamage", wpDamage, "verDamage", verDamage,
                        "WP_DMG_ARRAY", WP_DMG_ARRAY)
                    //-------------------------------------------------------------------------------
                    // Set flag so that the magic can be reversed
                    //
                    let flagContent = {
                        damage: weaponItem.data.data.attackBonus,
                        weapon: itemId,
                        weapDmg: wpDamage,
                        verDmg: verDamage,
                        WP_DMG_ARRAY: WP_DMG_ARRAY,
                        mgc: copy_item.data.properties.mgc
                    }
                    await DAE.setFlag(aActor, FLAG_NAME, flagContent);
                    if (TL > 2) jez.trace(`${TAG} flag from ${aActor.name}`,DAE.getFlag(aActor, FLAG_NAME))
                    if (TL > 2) jez.trace(`${TAG} ${FLAG_NAME} flag set on ${aActor.name}`,flagContent)
                    //-------------------------------------------------------------------------------
                    // Update our in memory copy of the weapon
                    //
                    copy_item.data.damage.parts.push(['1d6[fire]','fire'])
                    copy_item.data.properties.mgc = true
                    if (verDamage !== "" && verDamage !== null) 
                        copy_item.data.damage.versatile = (verDamage + " + " + '1d6[fire]');
                    //-------------------------------------------------------------------------------
                    // Update the "real" weapon
                    //
                    aActor.updateEmbeddedDocuments("Item", [copy_item]);
                    //-----------------------------------------------------------------------------------------------
                    // Define the desired modification to the changes data
                    //
                    const CE_DESC = `${weaponItem.name} has been lit ablaze, 1d6 additional fire damage on each hit`
                    jez.setCEDesc(aActor, EFFECT_NAME, CE_DESC, { traceLvl: TL });
                    //-------------------------------------------------------------------------------------------------------------
                    // Launch the VFX on the target
                    //
                    runVFX(aToken)
                }
            },
            Cancel:
            {
                label: `Cancel`
            }
        }
    }).render(true);
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * Revert weapon and unset flag.
 ***************************************************************************************************/
async function doOff(options={}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Terminate the VFX 
    //
    Sequencer.EffectManager.endEffects({ name: VFX_NAME });
    //-----------------------------------------------------------------------------------------------
    // Grab the flag value object that needs to be restored from the stored flag
    //
    const FLAG_VAL = DAE.getFlag(aActor, FLAG_NAME);
    if (TL > 2) jez.trace(`${TAG} Flag value object`, FLAG_VAL);
    if (!FLAG_VAL) return jez.trace(`${TAG} No flag containing previous data found`)
    //-----------------------------------------------------------------------------------------------
    // Make sure the selected weap can be found.
    //
    if (TL > 1) jez.trace(`${TAG} Flag values`,FLAG_VAL)
    if (!FLAG_VAL.weapon) return jez.badNews(`No weapon found on ${FLAG_NAME} flag, can not proceed`,"e")
    //-----------------------------------------------------------------------------------------------
    // Read the data for our weapon from the actor
    //
    let weaponItem = aActor.items.get(FLAG_VAL.weapon);
    if (TL > 2) jez.trace(`${TAG} weaponItem before reversal`,weaponItem)
    if (!weaponItem) return jez.badNews(`Weapon "${FLAG_VAL.weapon}" not found on ${aToken.name}`,"e")
    //-----------------------------------------------------------------------------------------------
    // Duplicate the weapon data and update fields
    //
    let copy_item = duplicate(weaponItem);
    copy_item.data.attackBonus = FLAG_VAL.damage;
    copy_item.data.damage.parts = FLAG_VAL.WP_DMG_ARRAY;
    copy_item.data.properties.mgc = FLAG_VAL.mgc
    if (FLAG_VAL.verDmg !== "" && FLAG_VAL.verDmg !== null) 
        copy_item.data.damage.versatile = FLAG_VAL.verDmg;
    if (TL > 2) jez.trace(`${TAG} copy of the weapon after update`,copy_item)
    //-----------------------------------------------------------------------------------------------
    // Update the weapon back to original values and clear the flag
    //
    aActor.updateEmbeddedDocuments("Item", [copy_item]);
    DAE.unsetFlag(aActor, FLAG_NAME);
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
}
/***************************************************************************************************
 * Run VFX on Target
 ***************************************************************************************************/
 async function runVFX(target) {
    const VFX_LOOP = "jb2a.explosion.orange.0"
    new Sequence()
        .effect()
        .file(VFX_LOOP)
        .atLocation(target)
        .scaleToObject(2.0)
        .play();
    await jez.wait(1000)
    new Sequence()
        .effect()
        .file(`jb2a.flames.02.orange`)
        .persist()
        .opacity(0.60)
        .name(VFX_NAME)
        .attachTo(target)
        .scaleToObject(1)
        .spriteOffset({ y: -0.75 }, { gridUnits: true })
        .belowTokens() 
        .play()
}