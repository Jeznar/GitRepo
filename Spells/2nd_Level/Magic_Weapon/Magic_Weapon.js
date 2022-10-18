const MACRONAME = "Magic_Weapon.0.4.js"
/*****************************************************************************************
 * Implement Magic Weapon based on an ItemMacro that I literally found, source unknown.
 * 
 * 05/31/22 0.1 Creation of Macro
 * 10/15/22 0.2 Update format toward current standard, add VFX and link pair the effects
 * 10/15/22 0.3 Update to provide convenientDescription contents for the effects
 * 10/18/22 0.4 Change to use jez.setCEDesc library calls instead of 0.3 code
 *****************************************************************************************/
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
const EFFECT_NAME = "Magic Weapon"
function clamp(val, min, max) { return val > max ? max : val < min ? min : val }
function setBonus(level) { return clamp(Math.floor(level/2), 1, 3) }
//----------------------------------------------------------------------------------
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
    // Verify something was targeted, if not clear concentrating and return a message of sadness
    //
    if (!await preCheck()) {
        msg = `This spell requires that a target be selected before casting.`
        postResults(msg);
        await jez.wait(100)
        let conc = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
        if (TL>1) jez.trace(`${TAG} Clearing concentration from ${aToken.name}`, conc)
        await conc.delete()
        return
    }
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); 
    //-------------------------------------------------------------------------------------------------------------
    // Pair the effects so concentrating will drop if the effect is terminated
    //
    await jez.wait(100)
    jez.pairEffects(aToken, "Concentrating", tToken, EFFECT_NAME)
    //-------------------------------------------------------------------------------------------------------------
    // Launch the VFX on the target
    //
    runVFX(tToken)
    //-----------------------------------------------------------------------------------------------
    // Calculate the bonus for this casting, taking into account spell level scaling
    //
    // let spellLvl = Math.floor(LAST_ARG.spellLevel/2);
    let bonus = setBonus(LAST_ARG.spellLevel)
    //-----------------------------------------------------------------------------------------------
    // Update the convenientDescription of the Concentrating effect to describe the spell
    //
    const CE_DESC = `Maintaining concentration on +${bonus} bonus to ${tToken.name}'s weapon`
    await jez.setCEDesc(aActor, "Concentrating", CE_DESC, { traceLvl: TL });
    //-----------------------------------------------------------------------------------------------
    // Post completion message
    //
    msg = `${aToken.name} has given a weapon magical properties.`
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
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
    const SPELL_LEVEL = args[1]
    if (TL>2) jez.trace(`${TAG} SPELL_LEVEL from args[1]`, SPELL_LEVEL);
    //---------------------------------------------------------------------------------------------------
    // Set Function specific globals
    //
    let weapon_content = ``;
    const DAE_ITEM = LAST_ARG.efData.flags.dae.itemData
    if (TL>2) jez.trace(`${TAG} DAE_ITEM`, DAE_ITEM);
    let weapons = aActor.items.filter(i => i.data.type === `weapon`);
    if (TL>2) jez.trace(`${TAG} weapons`,weapons);
    //-----------------------------------------------------------------------------------------------
    // Build HTML structure holding the target's weapons, EXAMPLE follows:
    //
    // weapon_content : <label class="radio-label">
    // <input type="radio" name="weapon" value="fUko1U9LGK8ENxwK">
    // <img src="/systems/dnd5e/icons/items/weapons/dagger.jpg" style="border:0px; width: 50px; height:50px;">
    // Dagger
    // </label><label class="radio-label">
    // <input type="radio" name="weapon" value="cyjcowc5fyqgdlg1">
    // <img src="/systems/dnd5e/icons/items/weapons/sword-long.jpg" style="border:0px; width: 50px; height:50px;">
    // Longsword
    // </label> 
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
                callback: (html) => {
                    //-------------------------------------------------------------------------------
                    // Define a bunch of important variables
                    //
                    let itemId = $("input[type='radio'][name='weapon']:checked").val();
                    let weaponItem = aActor.items.get(itemId);
                    let copy_item = duplicate(weaponItem);
                    let bonus = setBonus(SPELL_LEVEL)
                    let wpDamage = copy_item.data.damage.parts[0][0];
                    let verDamage = copy_item.data.damage.versatile;
                    if (TL>2) jez.trace(`${TAG} === Callback Values ---`, "itemId", itemId, 
                        "weaponItem", weaponItem, "copy_item", copy_item,  
                        "bonus", bonus, "wpDamage", wpDamage, "verDamage", verDamage)
                    //-------------------------------------------------------------------------------
                    // Set flag so that the magic can be reversed
                    //
                    let flagContent = {
                        damage: weaponItem.data.data.attackBonus,
                        weapon: itemId,
                        weaponDmg: wpDamage,
                        verDmg: verDamage,
                        mgc: copy_item.data.properties.mgc
                    }
                    DAE.setFlag(aActor, `magicWeapon`, flagContent);
                    if (TL > 2) jez.trace(`${TAG} magicWeapon flag set on ${aActor.name}`,flagContent)
                    //-------------------------------------------------------------------------------
                    // Update our in memory copy of the weapon
                    //
                    if (copy_item.data.attackBonus === "") copy_item.data.attackBonus = "0"
                    copy_item.data.attackBonus = `${parseInt(copy_item.data.attackBonus) + bonus}`;
                    copy_item.data.damage.parts[0][0] = (wpDamage + " + " + bonus);
                    copy_item.data.properties.mgc = true
                    if (verDamage !== "" && verDamage !== null) 
                        copy_item.data.damage.versatile = (verDamage + " + " + bonus);
                    //-------------------------------------------------------------------------------
                    // Update the "real" weapon
                    //
                    aActor.updateEmbeddedDocuments("Item", [copy_item]);
                    //-----------------------------------------------------------------------------------------------
                    // Define the desired modification to the changes data
                    const CE_DESC = `${weaponItem.name} has been enchanted with a +${bonus} bonus`
                    jez.setCEDesc(aActor, EFFECT_NAME, CE_DESC, { traceLvl: TL });
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
    // Grab the flag value object that needs to be restored from the stored flag
    //
    const FLAG_VAL = DAE.getFlag(aActor, 'magicWeapon');
    if (TL > 2) jez.trace(`${TAG} Flag value object`, FLAG_VAL);
    if (!FLAG_VAL) return jez.trace(`${TAG} No flag containing previous data found`)
    //-----------------------------------------------------------------------------------------------
    // Destructure the flag (Furnace was tossing an error when compound statement was used)
    //
    let damage = FLAG_VAL.damage
    let weapon = FLAG_VAL.weapon
    let weaponDmg = FLAG_VAL.weaponDmg
    let verDmg = FLAG_VAL.verDmg
    let mgc = FLAG_VAL.mgc
    if (TL > 1) jez.trace(`${TAG} Flag values`,
        "damage", damage, "weapon", weapon, "weaponDmg", weaponDmg, "verDmg", verDmg, "mgc", mgc);
    if (!weapon) return jez.badNews(`No weapon found on magic weapon flag, can not proceed`,"e")
    //-----------------------------------------------------------------------------------------------
    // Read the data for our weapon from the actor
    //
    let weaponItem = aActor.items.get(weapon);
    if (TL > 2) jez.trace(`${TAG} weaponItem before reversal`,weaponItem)
    if (!weaponItem) return jez.badNews(`Weapon "${weapon}" not found on ${aToken.name}`,"e")
    //-----------------------------------------------------------------------------------------------
    // Duplicate the weapon data and update fields
    //
    let copy_item = duplicate(weaponItem);
    copy_item.data.attackBonus = damage;
    copy_item.data.damage.parts[0][0] = weaponDmg;
    copy_item.data.properties.mgc = mgc
    if (verDmg !== "" && verDmg !== null) copy_item.data.damage.versatile = verDmg;
    if (TL > 2) jez.trace(`${TAG} copy of the weapon after update`,copy_item)
    //-----------------------------------------------------------------------------------------------
    // Update the weapon back to original values and clear the flag
    //
    aActor.updateEmbeddedDocuments("Item", [copy_item]);
    DAE.unsetFlag(aActor, `magicWeapon`);
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
}
/***************************************************************************************************
 * Run VFX on Target
 ***************************************************************************************************/
 async function runVFX(target) {
    const VFX_LOOP = "modules/jb2a_patreon/Library/1st_Level/Cure_Wounds/CureWounds_01_*_400x400.webm"
    new Sequence()
        .effect()
        .fadeIn(1000)
        .duration(8000)
        .fadeOut(1000)
        .file(VFX_LOOP)
        .atLocation(target)
        .scaleToObject(2.0)
        .play();
}