/************************************************************
 * Allows option to autograpple or do damage on a hit.  I've 
 * added paramaeters at the top to make it easier to adjust
 * power of particular vamp. Based on Crymic's macro.
 * 
 * Eliminated the save vs being grappled.
 * 
 * 10/29/21 1.0 JGB Updated starting from Cyrmic's code
 * 11/06/21 1.1 JGB Add Grappling condition parallel as done
 *                  in grapple/escape macros
 * 05/04/22 1.2 Update for Foundry 9.x
 ***********************************************************/
 const numDice = 2;     // Number of dice to roll for damage
 const typeDice = "d4"; // Type of dice to roll for damage
 const atckStat = "str";// Stat to add, typically str or dex
 const damageType = "slashing";
 /*********************************************************/
 const macroName = "Vampire_Claw_1.0"
 const debug = true; 
 if (debug) console.log("Starting: " + macroName); 

async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
if (lastArg.hitTargets.length === 0) return {};
const actorD = game.actors.get(lastArg.actor._id);
const tokenD = canvas.tokens.get(lastArg.tokenId);
const target = canvas.tokens.get(lastArg.hitTargets[0].id);

const itemD = lastArg.item;
const damageRoll = new Roll(`${numDice}${typeDice} + @abilities.${atckStat}mod`, actorD.getRollData()).evaluate({ async: false });
if (debug) console.log(" Damage: " + damageRoll.total); 
const effect = target.actor.effects.find(ef => ef.data.label === game.i18n.localize("Grappled"));
if (!effect) {
    new Dialog({
        title: itemD.name,
        content: `Pick an attack`,
        buttons: {
            attack: {
                label: "Attack", callback: async () => {
                    if (debug) console.log(" Attack");
                    game.dice3d?.showForRoll(damageRoll);
                    await new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damageType, [target], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemCardId: lastArg.itemCardId, useOther: false });
                }
            },
            grapple: {
                label: "Grappled", callback: async () => {
                    if (debug) console.log(" Grapple");
                    let gameRound = game.combat ? game.combat.round : 0;
                    let effectData = {
                        label: "Grappled",
                        icon: "modules/combat-utility-belt/icons/grappled.svg",
                        origin: lastArg.uuid,
                        disabled: false,
                        duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
                        changes: [{ key: `data.attributes.movement.all`, mode: 5, value: 0, priority: 20 }]
                    };
                    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:target.actor.uuid, effects: [effectData] });
                    await wait(300);
                    let grapple_msg = `<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} 
                                        is grappled! </div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`;
                    let grapple_result = `<div class="midi-qol-nobox midi-qol-bigger-text"></div><div><div class="midi-qol-nobox">${grapple_msg}</div></div>`; 

                    let chatMessage = await game.messages.get(args[0].itemCardId);
                    let content = await duplicate(chatMessage.data.content);
                    let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
                    if (debug>1) console.log(" Search: <" + searchString +">"); 
                    let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${grapple_result}`;
                    if (debug>1) console.log(" Replace: <" + replaceString +">"); 
                    content = await content.replace(searchString, replaceString);
                    await chatMessage.update({ content: content });
                    await ui.chat.scrollBottom();

                    // Add "Grappling" effect to originating token to support Escape macro
                    applyGrappling(tokenD);
                }
            }
        },
        default: "attack"
    }).render(true);
} else {
    game.dice3d?.showForRoll(damageRoll);
    await new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damageType, [target], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemCardId: lastArg.itemCardId, useOther: false });
}

/**************************************************************************
*  Apply Grappling Condition
***************************************************************************/
async function applyGrappling(token) {

    if (debug) console.log(` Apply grappling condition to ${token.name}`);

    let gameRound = game.combat ? game.combat.round : 0;
    let effectData = {
        label: "Grappling",
        icon: "Icons_JGB/Conditions/grappling.png",
        /*origin: lastArg.uuid,*/
        disabled: false,
        duration: { rounds: 99, startRound: gameRound },
        changes: [{ key: `data.attributes.movement.all`, mode: 1, value: 0.5, priority: 20 }] // half speed would be cool
    };
    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:token.actor.uuid, effects: [effectData] });
}