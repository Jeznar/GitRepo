const MACRONAME = "Magic_Weapon.0.1.js"
/*****************************************************************************************
 * Implement Magic Weapon based on an ItemMacro that I literally found, source unknown.
 * 
 * 05/31/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let msg = ""

//DAE Item Macro Execute, arguments = @item.level
if (!game.modules.get("advanced-macros")?.active) {ui.notifications.error("Please enable the Advanced Macros module") ;return;}
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
else aActor = game.actors.get(LAST_ARG.actorId);
//---------------------------------------------------------------------------------------------------
// If we don't have anything targeted post appropriate message and clear the concentrating effect
//
jez.log("aActor", aActor)
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    if (args[0].targets.length !== 1) { 
        msg = `This spell requires a target be selected before casting.`
        ui.notifications.warn(msg)
        postResults(msg);
        await jez.wait(100)
        let conc = await aToken.actor.effects.find(i => i.data.label === "Concentrating");
        jez.log("conc", conc)
        await conc.delete()
        return
    }
    msg = `${aToken.name} has given one weapon magical properties.`
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 * 
 * Select for weapon and apply bonus based on spell level
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //--------------------------------------------------------------------------------------------------
    //
    const DAEItem = LAST_ARG.efData.flags.dae.itemData

    let weapons = aActor.items.filter(i => i.data.type === `weapon`);
    let weapon_content = ``;

    function value_limit(val, min, max) {
        return val < min ? min : (val > max ? max : val);
    };
    //Filter for weapons
    for (let weapon of weapons) {
        weapon_content += `<label class="radio-label">
    <input type="radio" name="weapon" value="${weapon.id}">
    <img src="${weapon.img}" style="border:0px; width: 50px; height:50px;">
    ${weapon.data.name}
    </label>`;
    }


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
    //---------------------------------------------------------------------------------------------------
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
                    let itemId = $("input[type='radio'][name='weapon']:checked").val();
                    let weaponItem = aActor.items.get(itemId);
                    let copy_item = duplicate(weaponItem);
                    let spellLevel = Math.floor(DAEItem.data.level / 2);
                    let bonus = value_limit(spellLevel, 1, 3);
                    let wpDamage = copy_item.data.damage.parts[0][0];
                    let verDamage = copy_item.data.damage.versatile;
                    DAE.setFlag(aActor, `magicWeapon`, {
                        damage: weaponItem.data.data.attackBonus,
                        weapon: itemId,
                        weaponDmg: wpDamage,
                        verDmg: verDamage,
                        mgc : copy_item.data.properties.mgc
                    }
                    );
                    if(copy_item.data.attackBonus === "") copy_item.data.attackBonus = "0"
                    copy_item.data.attackBonus = `${parseInt(copy_item.data.attackBonus) + bonus}`;
                    copy_item.data.damage.parts[0][0] = (wpDamage + " + " + bonus);
                    copy_item.data.properties.mgc = true
                    if (verDamage !== "" && verDamage !== null) copy_item.data.damage.versatile = (verDamage + " + " + bonus);
                    aActor.updateEmbeddedDocuments("Item", [copy_item]);
                }
            },
            Cancel:
            {
                label: `Cancel`
            }
        }
    }).render(true);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * Revert weapon and unset flag.
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let { damage, weapon, weaponDmg, verDmg, mgc} = DAE.getFlag(aActor, 'magicWeapon');
    let weaponItem = aActor.items.get(weapon);
    let copy_item = duplicate(weaponItem);
    copy_item.data.attackBonus = damage;
    copy_item.data.damage.parts[0][0] = weaponDmg;
    copy_item.data.properties.mgc = mgc
    if (verDmg !== "" && verDmg !== null) copy_item.data.damage.versatile = verDmg;
    aActor.updateEmbeddedDocuments("Item", [copy_item]);
    DAE.unsetFlag(aActor, `magicWeapon`);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
}