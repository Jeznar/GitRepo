const MACRONAME = "Standing_Stone_Lightning_Strike"
/*****************************************************************************************
 * Implement the Lightning Strike as inspired by the Module's description of the Druid's 
 * Circle at Yesterhill: https://www.dndbeyond.com/sources/cos/yester-hill#Y3DruidsCircle
 * 
 *   The ring of boulders that surrounds the field is 250 feet in diameter and ranges from 
 *   5 to 10 feet high. Any creature that climbs over the black boulders has a 10 percent 
 *   chance of being struck by lightning, taking 44 (8d10) lightning damage. Characters 
 *   can avoid the damage by sticking to the two trails that pass through the ring.
 * 
 * My idea is to teach this macro so that the GM can target a token, click this macro from
 * a journal entry and have it do the rest...
 *  1) Determine if damage shuld be done (10% by RAW)
 *  2) Optionally allow a difficult DEX saving throw (not per RAW)
 *  3) Execute damage portion, 8d10 ligtning
 *  4) Display the results
 * 
 * 02/05/22 0.1 Creation of Macro
 *****************************************************************************************/
jez.log(`-------------- Starting --- ${MACRONAME} -----------------`);
const MACRO = MACRONAME.split(".")[0]     // Trim off the version number and extension
let msg = ""
const DAMAGE_TYPE = "Lightning"
let STRIKE_CHANCE = 20 // Percentage chance of a lightning strike
let damageMult = 1      // Damage multiplier

const VFX_NAME = `${MACRO}`
const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Lightning/LightningBall_01_Regular_Red_400x400.webm"
const VFX_OPACITY = 1.0;
const VFX_SCALE = 1.0;
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
// Determine if a lightning strike should happen, if not generate message and end
//
let ranNum = Math.floor(Math.random() * 100 + 1)
if (ranNum <= STRIKE_CHANCE) {
    jez.log("execute lightning strike")
    runVFX(tToken)
    let damageRoll = new Roll(`8d10`).evaluate({ async: false });
    game.dice3d?.showForRoll(damageRoll);
    let damage = damageRoll.total * damMult(tToken, DAMAGE_TYPE)
    // await MidiQOL.applyTokenDamage([{ damage: damageRoll.total, type: "lightning" }], damageRoll.total, [tToken], null, null);
    let curHP = tToken.actor.data.data.attributes.hp.value
    damage = Math.min(curHP, damage)  // Damage may not exceed current health
    let newHP = tToken.actor.data.data.attributes.hp.value - damage
    jez.log("current HP", curHP)
    //----------------------------------------------------------------------------------------
    // Update the target's health in the database
    //
    const ActorUpdate = game.macros?.getName("ActorUpdate");
    if (!ActorUpdate) return ui.notifications.error(`Cannot locate ActorUpdate GM Macro`);
    if (!ActorUpdate.data.flags["advanced-macros"].runAsGM) return ui.notifications.error(`ActorUpdate "Execute as GM" needs to be checked.`);
    ActorUpdate.execute(tToken.id, { "data.attributes.hp.value": newHP });
    jez.postMessage({
        color: "dodgerblue",
        fSize: 14,
        icon: "systems/dnd5e/icons/spells/lightning-blue-2.jpg",
        msg: `${tToken.name} is zapped by electricity originating from a nearby Standing Stone.<br><br>
        <b>${damage} hit points</b> have been inflicted. (modifer: ${damageMult})`,
        title: `${tToken.name} Zapped`,
        token: tToken
    })
} else {
    jez.log(`whisper macro user: ${game.user.name}`)
    ChatMessage.create({
        user: game.user.id,
        content: `No lighting strike, d100 roll was a ${ranNum},<br> strike chance set at ${STRIKE_CHANCE}%`,
        whisper: [game.user.id]
    });
}
/***************************************************************************************************
 * 
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
     jez.log("***Execute VFX***")
     
    new Sequence()
    .effect()
        .file(VFX_LOOP)
        .attachTo(token)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        //.persist()
        .duration(3000)
        .name(VFX_NAME) // Give the effect a uniqueish name
        .fadeIn(10) // Fade in for specified time in milliseconds
        .fadeOut(1000) // Fade out for specified time in milliseconds
        .extraEndDuration(1200) // Time padding on exit to connect to Outro effect
    .play();
}