const MACRONAME = "Decaying_Touch_0.2"
/*****************************************************************************************
 * Implementation of a Decaying Touch
 * 
 * Description: You wreath your hand in necrotic decay that causes anything you touch to 
 *   wither and die. Make a melee spell attack against the target. On a hit, the target 
 *   takes 1d4 necrotic damage and starts to rot and decay. The first time they take 
 *   damage from another source before the start of your next turn, they take an 
 *   additional 1d6 necrotic damage. Targets immune to diseases are immune to this 
 *   effect.
 * 
 *   The both the initial and secondary damage of the spell increases by a die when you 
 *   reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).
 *   
 * 12/14/21 0.1 Creation of Macro headers and inclusion of Booming Blade as starter code
 *****************************************************************************************/
const DEBUG = true;
if (DEBUG) {
    console.log(`************ Executing ${MACRONAME} ****************`)
    console.log(`tag ${args[0].tag}, args[0]:`,args[0]);
}

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
let target = canvas.tokens.get(lastArg.tokenId);
let itemD = lastArg.efData.flags.dae.itemData;
let tokenD = canvas.tokens.get(args[1]);
let msg = "";

if (DEBUG) {
    console.log(` target `, target);
    console.log(` itemD `, itemD);
    console.log(` tokenD`, tokenD);
}

if (args[0] === "off") doOff();         // DAE removal
if (args[0] === "on") doOn();           // DAE Application
if (args[0].tag === "OnUse") doOnUse(); // Midi ItemMacro On Use

return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/***************************************************************************************
 * Code to execute on effect application
 ***************************************************************************************/
 async function doOn() {
    //if (args[0] === "on") {    
        if (DEBUG) console.log(`************** EXECUTING doOn()`);
        let hookId = Hooks.on("updateToken", tokenDamage);
        // let hookPos = {x: target.data.x, y: target.data.y};
        DAE.setFlag(target.actor, `${MACRONAME}hookId`, hookId);
        // DAE.setFlag(target.actor, "BoomingBladePosition", hookPos);
 }

/***************************************************************************************
 * Actor Damage -- Did the actor take damage?
 ***************************************************************************************/
async function tokenDamage(tokenData, tokenId, diff, userid) {
    let oldHp = tokenData.data.actorData.oldHpVal;
    let newHp = tokenData.data.actorData.data.attributes.hp.value;

    if (DEBUG) {
        console.log(`************** EXECUTING tokenDamage`);
        console.log(`tokenData`, tokenData);
        console.log(`tokenId`, tokenId);
        console.log(`diff`, diff);
        console.log(`userid `, userid);
        console.log(`oldHp`, oldHp);
        console.log(`newHp`, newHp);
    }
    await wait(500);
    if (tokenId._id != target.id) return {};
    // let currentPosition = {x: tokenData.data.x, y: tokenData.data.y};
    // let savedPosition = DAE.getFlag(target.actor, "BoomingBladePosition");
    // if(savedPosition === undefined) return {};
    // console.log(savedPosition);
    // if ((currentPosition.x === savedPosition.x) && (currentPosition.y === savedPosition.y)) return {};
    if (newHp >= oldHp) return {};
    dealDamage();
    MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: target.actor.uuid, effects: [lastArg.effectId] });
    return;
}

/***************************************************************************************
 * Apply Damage
 ***************************************************************************************/
async function dealDamage() {
    if (DEBUG) console.log(`************** EXECUTING dealDamage()...`);
    await wait(500);

    let lastDamage = DAE.getFlag(target.actor, `${MACRONAME}`);
    if (lastDamage) {
        if (DEBUG) console.log(`Already damaged for ${lastDamage}, returning`);
        return;
    }

    let spellLevel = tokenD.actor.data.type === "character" ?
        tokenD.actor.data.data.details.level :
        tokenD.actor.data.data.details.cr;
    let numDice = 1 + (Math.floor((spellLevel + 1) / 6));
    let damageType = "necrotic";
    let damageRoll = new Roll(`${numDice}d6`).evaluate({ async: false });
    game.dice3d?.showForRoll(damageRoll);
    new MidiQOL.DamageOnlyWorkflow(tokenD.actor, tokenD, damageRoll.total, damageType,
        [target], damageRoll, {
        flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`,
        itemData: itemD, itemCardId: "new"
        }
    );
    if (DEBUG) console.log(`damageRoll.total `, damageRoll.total);
    if (damageRoll.total > 0) DAE.setFlag(target.actor, `${MACRONAME}`, damageRoll.total);
    return;
}

/***************************************************************************************
 * Code to execute on effect removal 
 ***************************************************************************************/
async function doOff() {
    if (DEBUG) console.log(`************** EXECUTING doOff()`);
    // if (args[0] === "off") {
    let hookId = DAE.getFlag(target.actor, `${MACRONAME}hookId`);
    Hooks.off("updateToken", hookId);
    DAE.unsetFlag(target.actor, `${MACRONAME}hookId`);
    DAE.unsetFlag(target.actor, `${MACRONAME}`);
}

/***************************************************************************************
 * Code to execute on onUse ItemMacro
 ***************************************************************************************/
 async function doOnUse() {
    if (!oneTarget) { postResults(msg); return; }
    if (!hitTarget) { postResults(msg); return; }
    let msg = `<b>${target.name}</b> appears to rot and decay.  The next damage they receive
    will cause additional damage.`
    postResults(msg);
}

/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        msg = `Targeted nothing, must target single token to be acted upon`;
        if (debug) console.log(message);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        msg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        if (debug) console.log(message);
        return (false);
    }
    if (debug) console.log(`targeting one target`);
    return (true);
}

/************************************************************************
* If no target was hit, write msg and return false, otherwise true 
*************************************************************************/
function hitTarget() {
    if (args[0].hitTargets.length === 0) {
        msg = `The attack missed, no additional effects.`;
        return(false);
    }
    return(true);
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