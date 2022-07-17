const MACRONAME = "Sacrificial_Summon.0.5.js"
/*****************************************************************************************
 * Implemention of sacrifical summon HomeBrewed forOlivia in the TiB Campaign.
 * 
 * Spell Description: Cast Find Familiar as an action without expending a spell slot or 
 * using any material components. When you cast Find Familiar in this way, you take 
 * 1d4 + half of your occultist level necrotic damage and your max hit points are reduced 
 * by the same amount until you complete a long rest.
 * 
 * 02/16/22 0.4 Convert to new(ish) styles
 * 07/16/22 0.5 Update to use jez.spawnAt with VFX
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
 const TL = 0;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //---------------------------------------------------------------------------------------------------
 if (TL>1) jez.trace(`=== Starting === ${MACRONAME} ===`);
 if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
const MINION = "Flopsy"
const lastArg = args[args.length - 1];
const itemD = lastArg.item;
const gameRound = game.combat ? game.combat.round : 0;
let damageDetail = await lastArg.damageDetail.find(i => i.type === "necrotic");
let damageTotal = (damageDetail.damage - (damageDetail.DR ?? 0)) * (damageDetail.damageMultiplier ?? 1);
jez.log(`Executing: ${MACRONAME}`,
    ` Minion: `, MINION, ` actor: ${actor.name}`, actor, ` actor.uuid: `, actor.uuid,
    ` ItemD: ${itemD.name}`, itemD, ` damageDetail: `, damageDetail, ` damageTotal: `, damageTotal);
//----------------------------------------------------------------------------------------
// Apply the debuff effect
//
let effectData = {
    label: itemD.name,
    icon: itemD.img,
    flags: { dae: { itemData: itemD, stackable: true, macroRepeat: "none", specialDuration: ["longRest"] } },
    origin: actor.uuid,
    disabled: false,
    duration: { rounds: 99999, startRound: gameRound },
    changes: [{ key: "data.attributes.hp.max", mode: 2, value: -damageTotal, priority: 20 }]
};
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
//----------------------------------------------------------------------------------------
// Create and post summary message
//
msg = `<b>${actor.name}</b> drains her life force by <b>${damageTotal}</b> to summon <b>${MINION}</b>.`;
let chatMessage = await game.messages.get(lastArg.itemCardId);
jez.addMessage(chatMessage, { color: "purple", fSize: 15, msg: msg, tag: "saves" })
// COOL-THING: USes Warp Gate to spawn a minion with out a pop up dialog
// await warpgate.spawn(MINION);
//--------------------------------------------------------------------------------------
// Build data object for the spawnAt call 
//
let argObj = {
    defaultRange: 30,
    duration: 3000,                     // Duration of the intro VFX
    img: aItem.img,                     // Image to use on the summon location cursor
    introTime: 1000,                    // Amount of time to wait for Intro VFX
    introVFX: '~Energy/SwirlingSparkles_01_Regular_${color}_400x400.webm', // default introVFX file
    name: aItem.name,                   // Name of action (message only), typically aItem.name
    outroVFX: '~Fireworks/Firework*_02_Regular_${color}_600x600.webm', // default outroVFX file
    scale: 0.5,
    source: aToken,                     // Coords for source (with a center), typically aToken
    templateName: MINION,               // Name of the actor in the actor directory
    updates: {},                        // Empty opbject needed for linked actors
    width: 1,                           // Width of token to be summoned
    traceLvl: TL
}
  //--------------------------------------------------------------------------------------
  // Call spawnAt to do the deed 
  //
  let returned = await jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
