const MACRONAME = "Raven_Bite.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Macro to return the necrotic damage inflicted to the Raven Precurssor who summoned this critter
 * 
 * 10/29/21 1.0 JGB Created from Vampire_Bite.1.2.js
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
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
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const HEAL_TYPE = "healing";
const DAMAGE_TYPE = "necrotic";
//-------------------------------------------------------------------------------------------------------------------------------
// If we didn't hit anything, just terminate this macro
//
if (LAST_ARG.hitTargets.length === 0) return {};
//-------------------------------------------------------------------------------------------------------------------------------
// Find our summoner Flags: FeatheredKindredSummonedBy
//
const SUMMONER_UUID = DAE.getFlag(aActor, 'FeatheredKindredSummonedByActor');
const SUMMONER_ID = DAE.getFlag(aActor, 'FeatheredKindredSummonedByToken');
if (!SUMMONER_UUID) return jez.badNews(`Summoner ${SUMMONER_UUID} not found`, "i")
const SUMMONER_ACTOR5E = fromUuid(SUMMONER_UUID)
const SUMMONER_TOKEN = canvas.tokens.placeables.find(ef => ef.id === SUMMONER_ID)
if (!SUMMONER_TOKEN) return jez.badNews(`Summoner Token (${SUMMONER_TOKEN}) not found`, "i")
if (TL > 1) jez.log('${TAG} Summoner Data', 'SUMMONER_ACTOR5E: ', SUMMONER_ACTOR5E, 'SUMMONER_TOKEN', SUMMONER_TOKEN)
//-------------------------------------------------------------------------------------------------------------------------------
// Dig out how much damage the calling attack inflicted
//
let damageTotal = LAST_ARG.damageDetail.find(i => i.type === DAMAGE_TYPE);                   // Changed for Midi update    
if (!damageTotal) return jez.badNews("No damage found", "w");                               // 21.12.12 Addition
if (TL > 2) jez.trace(`${TAG} Damage Total`, damageTotal);
//-------------------------------------------------------------------------------------------------------------------------------
// Run a nice little VFX from active token to summoning token
//
const BEAM_VFX = 'jb2a.energy_beam.normal.greenyellow.02'
new Sequence()
    .effect()
        .file(BEAM_VFX)
        .atLocation(aToken)
        .stretchTo(SUMMONER_TOKEN)
    .play();
await jez.wait(1000)
//-------------------------------------------------------------------------------------------------------------------------------
// Apply 2xhealing to the summoning token (if any)
//
if (!SUMMONER_TOKEN) return jez.badNews(`Could not find summoning token`, "i")
if (TL > 2) jez.trace(`${TAG} Healing Amount`, damageTotal.damage);
await MidiQOL.applyTokenDamage([{ damage: 2*damageTotal.damage, type: HEAL_TYPE }], 2*damageTotal.damage, new Set([SUMMONER_TOKEN]), aItem, new Set());                // 21.12.12 Addition
//-------------------------------------------------------------------------------------------------------------------------------
// Post summary message
//
postResults(`Raven inflicts damage to ${tToken.name} healing the Precursor`)
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
* Post results to the chat card
*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}