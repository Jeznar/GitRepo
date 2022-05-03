const MACRONAME = "Battlemaster_Maneuver.0.2.js"
/*****************************************************************************************
 * Derived from Divine Smite.  Reads the item name to determine the type of manuever. 
 * Supported manuevers are listed in the below description.
 *
 *   When the actor hits with a melee weapon Attack, it can choose to apply a maneuver to 
 *   that attack. The attack deals an additional 1d10 damage, and the actor chooses one of
 *   the following effects.
 *   
 *   Disarming Attack. The target must succeed on a Strength saving throw or drop an
 *   object it is holding of the master-at-arms's choice. The object lands at its feet.
 * 
 *   Distracting Strike. The next attack roll against the target by an attacker other than 
 *   the actor has advantage if that attack is made before the start of the actor's next 
 *   turn.
 * 
 *   Trip Attack. If the target is Large or smaller, it must succeed on a Strength 
 *   saving throw or fall prone.
 *  
 * 01/22/22 0.1 JGB Creation
 * 05/02/22 0.2 JGB Update for Foundry 9.x
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const LAST_ARG = args[args.length - 1];
jez.log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME} or ${MACRO}`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
let numDice = 1;
let gameRound = game.combat ? game.combat.round : 0;
let msg = "";
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------
// Search message history for preceding attack
//
let msgHistory = Object.values(MidiQOL.Workflow.workflows).filter(i => 
    i.actor.id === aActor.id && i.workflowType === "Workflow" && i.item?.name != aItem.name);
if (msgHistory.length === 0) {
    msg = `${aToken.name} must successfully attack before using ${aItem.name}`
    jez.addMessage(chatMessage, { color: "purple", fSize: 14, msg: msg, tag: "hits" })
    return ui.notifications.error(msg);
}
let lastAttack = msgHistory[msgHistory.length - 1];
jez.log("Last Attack", lastAttack)
const DAMAGE_TYPE = lastAttack.defaultDamageType
jez.log("DAMAGE_TYPE", DAMAGE_TYPE)
if(!DAMAGE_TYPE) {
    msg = `${aToken.name} need to have hit before using ${aItem.name}`
    jez.addMessage(chatMessage, { color: "purple", fSize: 14, msg: msg, tag: "hits" })
    return ui.notifications.error(msg);
}
let tToken = canvas.tokens.get(lastAttack?.damageList[0]?.tokenId);
let tActor = tToken?.actor;
//---------------------------------------------------------------------------------------
// Roll the extra damage die and apply it.
//
let damageRoll = new Roll(`${numDice}d8`).evaluate({ async: false });
await game.dice3d?.showForRoll(damageRoll);
await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, DAMAGE_TYPE, [tToken], damageRoll,
    { flavor: `(${CONFIG.DND5E.damageTypes[DAMAGE_TYPE]})`, itemCardId: LAST_ARG.itemCardId, itemData: aItem, useOther: false });
//---------------------------------------------------------------------------------------
// Maneuver save DC = 8 + your proficiency bonus + your Strength or Dexterity modifier 
// Attacker's (your choice)
//
const SAVE_DC = 8 + aActor.data.data.attributes.prof +
    Math.max(aActor.data.data.abilities.str.mod, aActor.data.data.abilities.dex.mod)
//---------------------------------------------------------------------------------------
// Add the additional manuever effect
// Determine the effect by looking for keywords in the aItem.name
if(aItem.name.toLowerCase().includes("disarming")) doDisarming()
if(aItem.name.toLowerCase().includes("distracting")) doDistracting()
if(aItem.name.toLowerCase().includes("trip")) doTrip()

jez.log("---------------------------------------------------------------------------",
    `Finished`, `${MACRONAME}`);
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

//---------------------------------------------------------------------------------------
// Trip Attack. When you hit a creature with a weapon attack, you can expend one 
// superiority die to attempt to knock the target down. You add the superiority die to 
// the attack’s damage roll, and if the target is Large or smaller, it must make a 
// Strength saving throw. On a failed save, you knock the target prone.
//
async function doTrip() {
    const CONDITION = "Prone";
    //-----------------------------------------------------------------------------------
    // If target is larger than "large" (i.e. huge or grg) they are immune to this trip 
    //
    jez.log("tActor", tActor)
    let tSizeStr = tActor.data.data.traits.size
    jez.log("tSizeStr", tSizeStr)
    if (tSizeStr === "huge" || tSizeStr === "grg") {
        msg = `${tToken.name} is too large (${tSizeStr}) to be tripped.`
        jez.log(msg);
        jez.addMessage(chatMessage, { color: "saddlebrown", fSize: 14, msg: msg, tag: "saves" })
        return(false)
    }
    //-----------------------------------------------------------------------------------
    // End if target is already affected by CONDITION
    //
  //if (aActor.effects.find(ef => ef.data.label === CONDITION)) {
    let oldEffect = aActor.effects.find(ef => ef.data.label === CONDITION)
    if (tActor.effects.find(ef => ef.data.label === CONDITION)) {
        let msg = `${tToken.name} already prone, can not be tripped.`;
        jez.log(msg);
        jez.addMessage(chatMessage, { color: "darkbrown", fSize: 14, msg: msg, tag: "saves" })
        return;
    }
    //-----------------------------------------------------------------------------------
    // Strength saving throw to avoid a knockdown. 
    //
    const SAVE_TYPE = "str"
    const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to avoid 
                    being knocked prone.`;
    let save = (await tActor.rollAbilitySave(SAVE_TYPE, { FLAVOR, chatMessage: true, fastforward: true }));

    //-----------------------------------------------------------------------------------
    // Apply condition to the target as appropriate
    // 
    if (save.total < SAVE_DC) {
        let effectData = {
            label: CONDITION,
            icon: "modules/combat-utility-belt/icons/prone.svg",
            origin: aActor.uuid,
            disabled: false,
            duration: { rounds: 99, startRound: gameRound },
            changes: [
                { key: `flags.midi-qol.disadvantage.attack.all`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.mwak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.msak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rwak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rsak`, mode: jez.ADD, value: 1, priority: 20 }
            ]
        };
        await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:tActor.uuid, effects: [effectData] });
        msg = `${tToken.name} has been knocked prone by ${aToken.name}`
        jez.log(msg);
        jez.addMessage(chatMessage, { color: "saddlebrown", fSize: 14, msg: msg, tag: "saves" })
    } else {
        msg = `${tToken.name} has not been knocked down.`
        jez.log(msg);
        jez.addMessage(chatMessage, { color: "saddlebrown", fSize: 14, msg: msg, tag: "saves" })
    }
}
//---------------------------------------------------------------------------------------
// Distracting Strike. The next attack roll against the target by an attacker other than 
// the master-at-arms has advantage if that attack is made before the start of the 
// master-at-arms's next turn.
//
async function doDistracting() {
    let mqFlag = "flags.midi-qol.grants.advantage.attack.all";
    let mqExpire = "isAttacked";
    jez.log(`${mqFlag}, ${mqExpire}`);
    msg = ` Add debuff to ${tToken.name}`;
    jez.log(msg);
    let effectData = {
        label: "Grant Advantage",
        icon: aItem.img,
        origin: aActor.uuid,
        disabled: false,
        duration: { turns: 1, startRound: gameRound },
        flags: { dae: { macroRepeat: "none", specialDuration: [mqExpire] } },
        changes: [{
            key: mqFlag,
            value: 1,
            mode: jez.ADD,
            priority: 20
        }]
    }
    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:tActor.uuid, effects: [effectData] });
    msg = `${tToken.name} is granting advantage to the next attack within a round, not from ${aToken.name}.`
    jez.log(msg);
    jez.addMessage(chatMessage, { color: "darkblue", fSize: 14, msg: msg, tag: "saves" })
}
//---------------------------------------------------------------------------------------
// Disarming Attack. The target must succeed on a DC 17 Strength saving throw or drop an
// object it is holding of the master-at-arms's choice. The object lands at its feet.
//
async function doDisarming() {
    const SAVE_TYPE = "str"
    const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to hold to weapon`;
    let save = (await tActor.rollAbilitySave(SAVE_TYPE,{FLAVOR,chatMessage:true,fastforward:true}));
    if (save.total < SAVE_DC) {
        msg = `${tToken.name} has been disarmed, dropping the item ${aToken.name} specified.
    That item is now on the ground at ${tToken.name}'s feet.`
        jez.log(msg);
        jez.addMessage(chatMessage, { color: "saddlebrown", fSize: 14, msg: msg, tag: "saves" })
    } else {
        msg = `${tToken.name} has not been disarmed.`
        jez.log(msg);
        jez.addMessage(chatMessage, { color: "saddlebrown", fSize: 14, msg: msg, tag: "saves" })
    }
}

