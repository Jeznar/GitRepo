const MACRONAME = "Freezing_Wave.js"
/*****************************************************************************************
 * Implement the Brown Mold damage portion as decribed in the DMG (and used in Barovia) 
 * https://www.dndbeyond.com/sources/dmg/adventure-environments#DungeonHazards
 *
 *   Brown mold feeds on warmth, drawing heat from anything around it. A patch of brown
 *   mold typically covers a 10-foot square, and the temperature within 30 feet of it is
 *   always frigid.
 *
 *   When a creature moves to within 5 feet of the mold for the first time on a turn or
 *   starts its turn there, it must make a DC 12 Constitution saving throw, taking 22
 *   (4d10) cold damage on a failed save, or half as much damage on a successful one.
 *
 *   Brown mold is immune to fire, and any source of fire brought within 5 feet of a
 *   patch causes it to instantly expand outward in the direction of the fire, covering
 *   a 10-foot-square area (with the source of the fire at the center of that area).
 *   A patch of brown mold exposed to an effect that deals cold damage is instantly
 *   destroyed.
 *
 * My idea is to teach this macro so that the GM can target a token, click this macro from
 * a journal entry and have it do the rest...
 *  1) Launch some nifty JB2A VFX on the targeted token
 *  2) Perform a DC12 Con saving throw (half damage on a save)
 *  3) Execute damage portion, 4d10 cold
 *  4) Display the results
 *
 * 02/11/22 0.1 Creation of Macro
 *****************************************************************************************/
jez.log(`-------------- Starting --- ${MACRONAME} -----------------`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

const MACRO = MACRONAME.split(".")[0]     // Trim off the version number and extension
let msg = ""
const DAMAGE_TYPE = "Cold"
let STRIKE_CHANCE = 100  // Percentage chance of a lightning strike
let damageMult = 1      // Damage multiplier
const VFX_NAME = `${MACRO}`
const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Ice/SnowflakeBurst_01_Regular_TealYellow_Loop_600x600.webm"
const VFX_OPACITY = 1.0;
const VFX_SCALE = 0.4;
const DAMAGE_DICE = "4d10"
const SAVE_TYPE = "con"
const SAVE_DC = 12
const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to resisit <b>${MACRO} damage.</b>`;
let saved = true;
//----------------------------------------------------------------------------------------
// Get all controlled tokens and make sure there are exactly one of'em
//
let tokens = canvas.tokens.controlled;
if (tokens.length !== 1) {
    msg = ` ${MACRONAME} requires that exactly one token be selected (controlled), currently ${tokens.length} are.`
    ui.notifications.warn(msg);
    jez.log(msg)
    return
}
let tToken = canvas.tokens.controlled[0]; // First Targeted Token, if any
jez.log('tToken', tToken)
//----------------------------------------------------------------------------------------
// Launch the Visual Effects
//
runVFX(tToken)
//----------------------------------------------------------------------------------------
// Perform the saving throw
//
let save = (await tToken.actor.rollAbilitySave(SAVE_TYPE, { flavor: FLAVOR, chatMessage: true, fastforward: true }));
if (save.total < SAVE_DC) {
    jez.log(`${tToken.name} failed: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
    saved = false;
} else {
    jez.log(`${tToken.name} saved: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
    damageMult = 0.5
}
//----------------------------------------------------------------------------------------
// Execute Damage 
//
let damageRoll = new Roll(DAMAGE_DICE).evaluate({ async: false });
game.dice3d?.showForRoll(damageRoll);
let damage = Math.floor(damageRoll.total * damMult(tToken, DAMAGE_TYPE))
// await MidiQOL.applyTokenDamage([{ damage: damageRoll.total, type: "lightning" }], damageRoll.total, [tToken], null, null);
let curHP = tToken.actor.data.data.attributes.hp.value
damage = Math.min(curHP, damage)  // Damage may not exceed current health
let newHP = tToken.actor.data.data.attributes.hp.value - damage
jez.log("current HP", curHP)
//----------------------------------------------------------------------------------------
// Post the results to a new Chat Card
//
const ActorUpdate = game.macros?.getName("ActorUpdate");
if (!ActorUpdate) return ui.notifications.error(`Cannot locate ActorUpdate GM Macro`);
if (!ActorUpdate.data.flags["advanced-macros"].runAsGM) return ui.notifications.error(`ActorUpdate "Execute as GM" needs to be checked.`);
ActorUpdate.execute(tToken.id, { "data.attributes.hp.value": newHP });
if (saved) msg = `${tToken.name} saves vs frosty wave of deep cold, but still takes damage.<br><br>
    <b>${damage} hit points</b> of Cold damage have been inflicted (modifer: ${damageMult})`
else msg = `${tToken.name} fails to save vs frosty wave of deep cold, taking full damage.<br><br>
    <b>${damage} hit points</b> of Cold damage have been inflicted (modifer: ${damageMult})`
jez.postMessage({
    color: "dodgerblue",
    fSize: 14,
    icon: "systems/dnd5e/icons/spells/ice-blue-3.jpg",
    msg: msg,
    title: `${tToken.name} Flash Frosted`,
    token: tToken
})
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Calculate effect of vulnerabilities and resistance to damage type.
 ***************************************************************************************************/
function damMult(target, type) {
    let traits = target.actor.data.data.traits
    if (inArray(traits.dr.value, type)) damageMult = damageMult * 0.5
    if (inArray(traits.dv.value, type)) damageMult = damageMult * 2.0
    if (inArray(traits.di.value, type)) damageMult = 0
    jez.log(`Damage multiplier vs ${type}`, damageMult)
    return (damageMult)
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
function inArray(array, target) {
    target = target.toLowerCase()
    if (array.length < 1) return (false)
    for (let i = 0; i < array.length; i++) if (target === array[i]) return (true)
    return (false)
}
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
 async function runVFX(token) {
     jez.log("***Execute VFX***",token,"VFX_LOOP",VFX_LOOP,"VFX_SCALE",VFX_SCALE,
            "VFX_OPACITY",VFX_OPACITY,"VFX_NAME",VFX_NAME)
     new Sequence()
        .effect()
        .file(VFX_LOOP)
        .attachTo(token)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .duration(5000)
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(10)             // Fade in for specified time in milliseconds
        .fadeOut(1000)          // Fade out for specified time in milliseconds
        .extraEndDuration(1200) // Time padding on exit to connect to Outro effect
        .play();
    jez.log("VFX Launched")
}