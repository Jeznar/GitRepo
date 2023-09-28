const MACRONAME = "Healing_Light_0.2"
/***************************************************************************************
 * Implemention of Healing Light.  Original source unknown. 
 * 
 * 11/27/21 0.1 Convert funky arrow function and add heals from Blood Staff
 * 11/27/21 0.2 Changed check from equipped to attuned
 ***************************************************************************************/
const DEBUG = 1;
if (DEBUG) console.log(`Starting: ${MACRONAME}`); 
await healingLight();
if (DEBUG) console.log(`Ending ${MACRONAME}`);


/***************************************************************************************
* This function contains guts of original macro.  It included these notes:
*  o Remove healing from the item and resource costs. Right now this uses Primary 
     Resources, adjust to fit your needs.
*  o Item macro @target @item
***************************************************************************************/
async function healingLight() {
    if(args[0].targets.length === 0) return ui.notifications.warn(`Please select a target.`);
    const target = canvas.tokens.get(args[0].targets[0].id);
    const itemD = args[0].item;
    const actorD = await game.actors.get(args[0].actor._id);
    const tokenD = await canvas.tokens.get(args[0].tokenId);
    const resourceType = "primary";
    const getData = await actorD.getRollData();
    const mainRes = getData.resources[resourceType];
    const curRes = mainRes.value;
    const maxRes = mainRes.max;
    const chrBon = getData.abilities.cha.mod;
    if (DEBUG) console.log(`curRes ${curRes}, maxRes ${maxRes}, chrBon ${chrBon}`);
    const finalMax = Math.min(chrBon, curRes);
    const healingType = "healing";
    
    if (DEBUG) console.log(`actorD: actorD.name`,actorD);
    const PROF = actorD.data.data.prof;
    let BONUS = 0;  // Bonus to be added to healing effect
    // If actor has "Blood Spear" equipped set BONUS = PROF otherwise zero
    if (await itemAttuned("Blood Staff")) BONUS = PROF;
    if (DEBUG) console.log(`actorD prof: ${PROF}, healing bonus ${BONUS}`);

    if(curRes < 1) {
        ui.notifications.warn(`You are out of the required resources.`);
        return;
    }

    new Dialog({
        title: itemD.name,
        content:`<div style="vertical-align:top;display:flex;">
                <img src="${target.data.img}" style="border:none;" height="30" width="30"> 
                <span style="margin-left:10px;line-height:2.1em;">
                ${target.data.name} <b>HP:</b> ${target.actor.data.data.attributes.hp.value} / ${target.actor.data.data.attributes.hp.max}
                </span></div><hr>
                <form class="flexcol"><div class="form-group">
                <label for="num"><b>[${curRes}/${maxRes}]</b> Dice to spend:</span>
                </label><input id="num" name="num" type="number" min="0" max="${maxRes}" value="1">
                </input></div></form>`,
        buttons: {
            heal: {
                icon: '<i class="fas fa-check"></i>', label: 'Heal', callback: async (html) => {
                    let number = Math.floor(Number(html.find('#num')[0].value));
                    if (DEBUG) console.log(`Charges requested: ${number}, max avail ${finalMax}`);
                    if (number < 1 || number > finalMax) {
                        return ui.notifications.warn(`Invalid number of charges entered = ${number}. Aborting action.`);
                    } else {
                        let healDamage = new Roll(`${number}d6+${BONUS}`).evaluate({ async: false });
                        new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, healDamage.total, healingType, [target], healDamage, { flavor: `(${CONFIG.DND5E.healingTypes[healingType]})`, itemCardId: args[0].itemCardId, useOther: false });
                        let total = Number(curRes - number);
                        let resType = resourceType === "primary" ? "data.resources.primary.value" : resourceType === "secondary" ? "data.resources.secondary.value" : "data.resources.tertiary.value";
                        let resUpdate = {};
                        resUpdate[resType] = total;
                        await tokenD.actor.update(resUpdate);
                    }
                }
            }
        },
        default: "heal"
    }).render(true);
}

/***************************************************************************************
* Function to determine if passed actor has a specific item attuned, returning a boolean 
* result
*
* Parameters
*  - itemName: A string naming the item to be found in actor's inventory
*  - actor: Optional actor to be searched, defaults to actor launching this macro
***************************************************************************************/
async function itemAttuned(itemName, actor) {
    const FUNCNAME = "itemAttuned";
    const DEBUG = true;

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    if (DEBUG > 1) {
        console.log(`Executing ${FUNCNAME}`);
        console.log(`Item: ${itemName}`);
        console.log(`Actor: ${actor.name}`, actor);
    }

    let item = actor.items.find(item => item.data.name == itemName)
    if (item == null || item == undefined) {
        if (DEBUG) {
            console.log(`${actor.name} does not have ${itemName}`);
            console.log(`${FUNCNAME} returning false`);
        }
        return (false);
    } else {
        if (DEBUG) {
            console.log(`${actor.name} has ${itemName} in inventory`, item);
        }
    }

    // Attunment can be: 0 Does not require Attunment, 1 Requires Attunment, 2 Is Attuned
    const ATTUNED = item.data.data.attunement;
    if (DEBUG) console.log(`item.data.data: `,item.data.data);
 
    if (ATTUNED != 2) {
        if (DEBUG) {
            console.log(`${itemName} is in inventory but not attuned`, item);
            console.log(`${FUNCNAME} returning false`);
        }
        return (false);
    } else {
        if (DEBUG) {
            console.log(`${itemName} is attuned`, item);
            console.log(`${FUNCNAME} returning true`);
        }
        return (true);
    }
}