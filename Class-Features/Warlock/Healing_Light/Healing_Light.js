const MACRONAME = "Healing_Light.js"
/*****************************************************************************************
 * Adding some headers and such to the macro that I inherited.  This macro does check for
 * possession and attunement of HEAL_ITEM, if it finds that, it adds proficency modifier
 * to the heal.
 * 
 * 03/12/22 Update to Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
const lastArg = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); 
    else aToken = game.actors.get(lastArg.tokenId);
let aActor = aToken.actor;
const HEAL_ITEM = "Blood Staff"
//----------------------------------------------------------------------------------------
// Must target exactly one token
//
if (args[0].targets.length !== 1) return ui.notifications.warn(`Please select a target.`);
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
//----------------------------------------------------------------------------------------
// Check to see if actor has the HEAL_ITEM, attunment and set the profMod to be used
//
let healItem = hasItem(HEAL_ITEM)
let healAttuned = false
if (healItem && healItem.data.data.attunement === 2) healAttuned = true
let castStat = aToken.actor.data.data.attributes.spellcasting
let profMod = 0
if (healAttuned) profMod = Math.max(jez.getProfMod(aToken), 0)
jez.log(`Healing modifier (${castStat.toUpperCase()}) is ${profMod}`)
//---------------------------------------------------------------------------------------------
// Remove healing from the item and resource costs. Right now this uses Primary Resources, 
// adjust to fit your needs.
const aItem = args[0].item;
const RES_TYPE = "primary";                     // Resource Type
const GET_DATA = await aActor.getRollData();
const MAIN_RES = GET_DATA.resources[RES_TYPE];
const CUR_RES = MAIN_RES.value;
const MAX_RES = MAIN_RES.max;
const CHR_BONUS = GET_DATA.abilities.cha.mod;
const FIN_MAX = Math.min(CHR_BONUS, MAX_RES);    // Final maximum
const DAM_TYPE = "healing";
const TAR_HP_OBJ = "tToken.actor.data.data.attributes.hp"
const MIN_HEAL = Math.clamped(CUR_RES, 0, TAR_HP_OBJ.max - TAR_HP_OBJ.value);
const CONTENT = `<div style="vertical-align:top;display:flex;"><img src="${tToken.data.img}" 
    style="border:none;" height="30" width="30"> <span style="margin-left:10px;line-height:2.1em;">
    ${tToken.data.name} <b>HP:</b> ${TAR_HP_OBJ.value} / 
    ${TAR_HP_OBJ.max}</span></div><hr><form class="flexcol"><div class="form-group">
    <label for="num"><b>[${CUR_RES}/${MAX_RES}]</b> Dice to spend:</span></label>
    <input id="num" name="num" type="number" min="0" max="${MAX_RES}" value="${MIN_HEAL}">
    </input></div></form>`;
if (CUR_RES === 0) return ui.notifications.warn(`You are out of the required resources.`);
new Dialog({
    title: aItem.name,
    content: CONTENT,
    buttons: {
        heal: {
            icon: '<i class="fas fa-check"></i>', label: 'Heal', callback: async (html) => {
                let number = Math.floor(Number(html.find('#num')[0].value));
                if (number < 1 || number > FIN_MAX) {
                    return ui.notifications.warn(
                        `Invalid number of charges entered = ${number}. Aborting action.`);
                } else {
                    runVFX(tToken, aToken)
                    let healDamage = new Roll(`${number}d6 + ${profMod}`).evaluate({ async: false });
                    game.dice3d?.showForRoll(healDamage);   // Show 3D die on screen
                    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, healDamage.total, DAM_TYPE, [tToken],
                        healDamage, { flavor: `(${CONFIG.DND5E.healingTypes[DAM_TYPE]})`, 
                        itemCardId: args[0].itemCardId, useOther: false });
                    let total = Number(CUR_RES - number);
                    let resType = RES_TYPE === "primary" ? "data.resources.primary.value" : 
                        RES_TYPE === "secondary" ? "data.resources.secondary.value" : 
                        "data.resources.tertiary.value";
                    let resUpdate = {};
                    resUpdate[resType] = total;
                    await aToken.actor.update(resUpdate);
                    await replaceHitsWithHeals();
                    if (healAttuned) postResults(`Healing augmented by ${HEAL_ITEM}.`);
                }
            }
        }
    },
    default: "heal"
}).render(true);
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************
* Function to determine if passed actor has a specific item, returning a item or false
*
* Parameters
*  - itemName: A string naming the item to be found in actor's inventory
*  - actor: Optional actor to be searched, defaults to actor launching this macro
***************************************************************************************/
function hasItem(itemName, actor) {
    const FUNCNAME = "hasItem";
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;
    jez.log("-------hasItem(itemName, actor)------", "Starting", `${MACRONAME} ${FUNCNAME}`,
    "itemName", itemName, `actor ${actor.name}`, actor);
    // If actor was not passed, pick up the actor invoking this macro
    let item = actor.items.find(item => item.data.name == itemName)
    if (item == null || item == undefined) {
        jez.log(`${actor.name} does not have ${itemName}, ${FUNCNAME} returning false`);
         return(false);
    }
    jez.log("Item found:", item)
    jez.log(`${actor.name} has ${itemName}, ${FUNCNAME} returning true`);
    return(item);
}
/***************************************************************************************
 * Replace first " hits" with " Heals" on chat card
 ***************************************************************************************/
 async function replaceHitsWithHeals() {
    const FUNCNAME = "replaceHitsWithHeals()";
    jez.log("- - - - Starting ${MACRONAME} ${FUNCNAME} - - - - - - - - - - - - - - - - -");
    let chatmsg = game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatmsg.data.content);
    const searchString = / hits/g;
    const replaceString = `<p style="color:Green;"> Heals</p>`;
    content = await content.replace(searchString, replaceString);
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();
    jez.log("- - - - Finished ${MACRONAME} ${FUNCNAME} - - - - - - - - - - - - - - - -");
    return;
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
 * Play a VFX beam from the drained target to the caster
 ***************************************************************************************************/
 async function runVFX(token1, token2) {
    const VFX_BEAM = "jb2a.energy_strands.range.multiple.blue.01"
    const VFX_CLOUD = "jb2a.energy_strands.complete.blueorange.01"
    new Sequence()
        .effect()
            .atLocation(token2)
            .reachTowards(token1)
            .scale(1)
            .repeats(3,1500)
            .file(VFX_BEAM)
            .waitUntilFinished(-2000) 
        .effect()
            .file(VFX_CLOUD)
            .repeats(2,2000)
            .atLocation(token1)
            .scale(0.3)
            .opacity(1)
        .play();
    }