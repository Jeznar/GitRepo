const MACRONAME = "Bestow_Curse_Damage_0.1"
/*****************************************************************************************
 * Implementation of a extra damage portion of Bestow Curse Spell
 *  
 * 12/14/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
if (DEBUG) {
    console.log(`************ Executing ${MACRONAME} ****************`)
    console.log(`tag ${args[0].tag}, args[0]:`,args[0]);
}

const EFFECT = "Cursed";
let targetD = canvas.tokens.get(args[0].targets[0]?.id);
let msg = "";

let actorD = game.actors.get(args[0].actor._id);
let tokenD = canvas.tokens.get(args[0].tokenId).actor;

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
let target = canvas.tokens.get(args[0].targets[0].id);
let itemD = args[0].item;
// let tokenD = canvas.tokens.get(args[1]);


if (DEBUG) {
    console.log(` target `, target);
    console.log(` itemD `, itemD);
    console.log(` tokenD`, tokenD);
}

if (args[0] === "off") doOff();         // DAE removal (unused)
if (args[0] === "on") doOn();           // DAE Application (unused)
if (args[0].tag === "OnUse") doOnUse(); // Midi ItemMacro On Use

return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

 /***************************************************************************************
 * Code to execute on onUse ItemMacro
 ***************************************************************************************/
  async function doOnUse() {
    if (DEBUG) console.log(`Executing doOnUse()`);
    if (!oneTarget) { postResults(msg); return; }
    if (!hasEffect(targetD, EFFECT))  { postResults(msg); return; }
    dealDamage();
    msg = `<b>${target.name}</b> takes additional damage from the curse it carries.`
    await postResults(msg);

    if (DEBUG) console.log(`Finised doOnUse()`);
}

/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        msg = `Targeted nothing, must target single token to be acted upon`;
        if (DEBUG) console.log(msg);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        msg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        if (DEBUG) console.log(msg);
        return (false);
    }
    if (DEBUG) console.log(`targeting one target`);
    return (true);
}

/************************************************************************
 * Check to see if target has named effect. Return boolean result
*************************************************************************/
function hasEffect(target, effect) {
    if (target.actor.effects.find(ef => ef.data.label === effect)) {
        msg = `${target.name} has ${effect} effect.`;
        if (DEBUG) console.log(msg);
        return(true);
    } else {
        msg = `${target.name} lacks ${effect} effect.`
        if (DEBUG) console.log(msg);
        return(false)
    }
}

/***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    if (DEBUG) console.log(`chatMessage: `,chatMessage);
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}

 /***************************************************************************************
 * Apply Damage
 ***************************************************************************************/
async function dealDamage() {
    if (DEBUG) {
        console.log(`*** EXECUTING dealDamage()...`);
        console.log(` tokenD: `, tokenD);
    }
    await wait(100);

    const DAMAGETYPE = "necrotic";
    let damageRoll = new Roll(`1d8`).evaluate({ async: false });

    if (DEBUG) console.log(` Damage Total: ${damageRoll.total} Type: ${DAMAGETYPE}`);
    if (DEBUG > 1) {
        console.log('actorD', actorD);
        console.log('tokenD', tokenD);
        console.log('target', target);
        console.log(`itemD`, itemD);
        console.log(`target name ${target.name}`);
        console.log(`item name: ${itemD.name}`);
    }    
    game.dice3d?.showForRoll(damageRoll);
    new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, DAMAGETYPE,
        [target], damageRoll, {
        flavor: `(${CONFIG.DND5E.damageTypes[DAMAGETYPE]})`,
        itemData: itemD, itemCardId: args[0].itemCardId
        }
    );
    if (DEBUG) console.log(`damageRoll.total `, damageRoll.total);
    return;
}

/***************************************************************************************
 * Code to execute on effect application
 ***************************************************************************************/
 async function doOn() {
    if (DEBUG) console.log(`Executed doOn()`);
    ui.notifications.error(`Oddly, doOn() was called within ${MACRONAME}`);
    return;
}

/***************************************************************************************
 * Code to execute on effect removal 
 ***************************************************************************************/
async function doOff() {
    if (DEBUG) console.log(`Executed doOff()`);
    ui.notifications.error(`Oddly, doOff() was called within ${MACRONAME}`);
    return;
}