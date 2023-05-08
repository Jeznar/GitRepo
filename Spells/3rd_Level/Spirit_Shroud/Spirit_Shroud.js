const MACRONAME = "Spirit_Shroud.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Import of Crymic's Spirit Shroud 11.7.22: https://www.patreon.com/posts/spirit-shroud-74323874
 * I've massaged the format to make it use variable names I am familiar with and restructered to
 * my normal format.  Also, adding a VFX on the caster.
 * 
 * https://www.patreon.com/crymic
 * 
 * 12/01/22 0.1 Creation of Macro
 * 05/04/23 0.2 Changed effect label to a Speed Debuff, was a Healing Debuff 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the VERSION number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#LAST_ARG for contents
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
else aItem = LAST_ARG.efData?.flags?.dae?.aItemata;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
const EFFECT_NAME = `${MACRO}-${aToken.id}`
//-----------------------------------------------------------------------------------------------
// Set the actor to be acted on
//
let tActor;
if (LAST_ARG.tokenId) tActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else tActor = game.actors.get(LAST_ARG.actorId);

//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
// if (args[0] === "on") await doOn({ traceLvl: TL });                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
// if (args[0] === "each") doEach({ traceLvl: TL });					     // DAE everyround
// DamageBonus must return a function to the caller
if (args[0]?.tag === "DamageBonus") return (doBonusDamage({ traceLvl: TL }));
if (args[0] === "off") await doOff({ traceLvl: TL });                   // DAE removal
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL > 1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set On
 * This runs on actor that has the affected applied to it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-----------------------------------------------------------------------------------------------
    // Function specific variables
    //
    const spellLevel = Math.floor((LAST_ARG.spellLevel - 1) / 2);
    const title = `Choose your Damage Type:`;
    const menuOptions = {};
    //-----------------------------------------------------------------------------------------------
    // Present dialog to choose damage type.  Repeat menu until user makes a choice with "Ok" or 
    // clicks "Cancel" or "X"
    //
    let choices
    do {
        choices = await presentDialog();
        if (TL > 1) jez.trace(`${TAG} Menu choices`, choices)
    }
    while (choices.inputs && !choices.inputs.filter(Boolean).length && choices.buttons)
    //-----------------------------------------------------------------------------------------------
    // If "Cancel" or "X" choice made, remove concentration and refund the spell slot used to cast 
    // the spell.
    //
    if (!choices.buttons) {
        //
        if (TL > 1) jez.trace(`${TAG} Remove "Concentrating" DAE effect.`)
        let effect = tActor.effects.find(i => (VERSION > 9 ? i.label : i.data.label) === "Concentrating");
        if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tActor.uuid, effects: [effect.id] });
        // 
        if (TL > 1) jez.trace(`${TAG} Refund spell slot.`)
        jez.refundSpellSlot(aToken, LAST_ARG.spellLevel, { traceLvl: TL, quiet: false, spellName: aItem.name })
        return
    }
    //-----------------------------------------------------------------------------------------------
    // Build and apply the effect on caster
    //
    let damageChoice = choices.inputs.filter(Boolean)[0];   // Picks first one selected
    damageChoice = damageChoice.split(' ')[0].toLowerCase() // Grab first word and flip to lowercase
    if (TL>1) jez.trace(`${TAG} damageChoice`,damageChoice)
    let effectData = [{
        changes: [
            { key: "flags.dnd5e.DamageBonusMacro", mode: jez.CUSTOM, value: `ItemMacro.${aItem.name}`, priority: 20 },
            { key: "flags.midi-qol.spiritShroud.name", mode: jez.OVERRIDE, value: aItem.name, priority: 20 },
            { key: "flags.midi-qol.spiritShroud.uuid", mode: jez.OVERRIDE, value: LAST_ARG.uuid, priority: 20 },
            { key: "flags.midi-qol.spiritShroud.level", mode: jez.OVERRIDE, value: spellLevel, priority: 20 },
            { key: "flags.midi-qol.spiritShroud.type", mode: jez.OVERRIDE, value: damageChoice, priority: 20 },
            { key: "macro.itemMacro", mode: jez.CUSTOM, value: `not used`, priority: 20 }
        ],
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 10, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: {
            dae: { aItemata: aItem }
        },
        label: aItem.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tActor.uuid, effects: effectData });
    /*****1*********2*********3*********4*********5*********6*********7*********8*********9*********0*/
    async function presentDialog() {
        menuOptions["buttons"] = [
            { label: "Select", value: true },
            { label: "Cancel", value: false }
        ];
        menuOptions["inputs"] = [
            { type: "radio", label: "Cold Damage", value: "cold", options: "damageType" },
            { type: "radio", label: "Necrotic Damage", value: "necrotic", options: "damageType" },
            { type: "radio", label: "Radiant Damage", value: "radiant", options: "damageType" }
        ];
        let choices = await warpgate.menu(menuOptions, { title, options: { height: "100%" } });
        return choices;
    }
    //-----------------------------------------------------------------------------------------------
    // Launch VFX around caster (runVFX)
    //
    let color = ""
    switch (damageChoice) {
        case "cold":
            color = "Light_Blue"
            break;
        case "necrotic":
            color = "Dark_Red"
            break;
        case "radiant":
            color = "Light_Orange"
            break;
        default:
            color = `Dark_Purple`
    }
    const VFX_FILE = `modules/jb2a_patreon/Library/3rd_Level/Spirit_Guardians/SpiritGuardiansSpirits_01_${color}_600x600.webm`
    new Sequence()
        .effect()
            .file(VFX_FILE)
            .attachTo(aToken)
            .scale(1)
            .opacity(1)
            .persist()
            .name(EFFECT_NAME)
        .play();
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
* Perform the code that runs when this macro is invoked as an ItemMacro "doBonusDamage"
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doBonusDamage(options = {}) {
    const FUNCNAME = "doBonusDamage(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    // Are target(s) are within 10 feet using nifty MidiQOL.findNearby? return nothing if not
    //
    let targetList = LAST_ARG.hitTargets.map(i => i.id);
    let findTarget = MidiQOL.findNearby(null, aToken, 10, null).find(i => targetList.includes(i.id));
    if (!findTarget) return {};
    //-----------------------------------------------------------------------------------------------
    // Dig through actor's attacks to determine if this attack should invoke the extra damage.
    //
    let itemList = await tActor.itemTypes.weapon.concat(tActor.itemTypes.spell);
    let attackList = itemList.reduce((list, item) => {
        if (!["ak"].some(i => (VERSION > 9 ? item.system.actionType : item.data.data.actionType).toLowerCase().includes(i))) return list;
        else list.push(item.name.toLowerCase());
        return list;
    }, []);
    let legalAttack = attackList.some(i => (aItem.name.toLowerCase()).toLowerCase().includes(i));
    if (!legalAttack) return {};
    //-----------------------------------------------------------------------------------------------
    // Retrieve values
    //
    const SPELL_NAME = getProperty((VERSION > 9 ? tActor.flags : tActor.data.flags), "midi-qol.spiritShroud.name");
    const SPELL_DICE = getProperty((VERSION > 9 ? tActor.flags : tActor.data.flags), "midi-qol.spiritShroud.level");
    const SPELL_ORIGIN = getProperty((VERSION > 9 ? tActor.flags : tActor.data.flags), "midi-qol.spiritShroud.uuid");
    const DAMAGE_TYPE = getProperty((VERSION > 9 ? tActor.flags : tActor.data.flags), "midi-qol.spiritShroud.type");
    if (TL > 2) jez.trace(`${TAG} Retrieved Values`,
        'SPELL_NAME', SPELL_NAME,
        'SPELL_DICE', SPELL_DICE,
        'SPELL_ORIGIN', SPELL_ORIGIN,
        'DAMAGE_TYPE',DAMAGE_TYPE)
    //-----------------------------------------------------------------------------------------------
    // Build DAE debuff effect and apply it.
    //
    let effectData = {
        changes: [
            { key: "data.traits.di.value", mode: jez.CUSTOM, value: `healing`, priority: 20 }
        ],
        origin: SPELL_ORIGIN,
        disabled: false,
        transfer: false,
        flags: { dae: { stackable: "noneOirign", specialDuration: ["turnStartSource"] } },
        duration: { rounds: 1, turns: 1, startRound: GAME_RND, startTime: game.time.worldTime },
        icon: "icons/skills/wounds/blood-cells-vessel-red-orange.webp",
        label: `Speed Debuff (reduced by 10)` // Functions as CE_DESC when not otherswise set
    }
    let effect = findTarget.actor.effects.find(i => (VERSION > 9 ? i.label : i.data.label) === "Healing Debuff");
    if (!effect) await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: findTarget.actor.uuid, effects: [effectData] });
    //-----------------------------------------------------------------------------------------------
    // Return damage function 
    //
    let damageDice = await new game.dnd5e.dice.DamageRoll(`${SPELL_DICE}d8[${DAMAGE_TYPE}]`, tActor.getRollData(), { critical: LAST_ARG.isCritical }).evaluate({ async: true });
    return { damageRoll: damageDice.formula, flavor: `(${SPELL_NAME} (${CONFIG.DND5E.damageTypes[DAMAGE_TYPE]}))`, damageList: LAST_ARG.damageList, itemCardId: LAST_ARG.itemCardId };
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Launch the VFX when the effect is applied
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOn(options={}) {
    const FUNCNAME = "doOn(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL>0) jez.trace(`${TAG} --- Starting ---`);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    if (TL>3) jez.trace(`${TAG} | More Detailed Trace Info.`)
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Remove the VFX when the effect is removed
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOff(options={}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-----------------------------------------------------------------------------------------------
    // Comments, perhaps
    //
    Sequencer.EffectManager.endEffects({ name: EFFECT_NAME, object: aToken });
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}