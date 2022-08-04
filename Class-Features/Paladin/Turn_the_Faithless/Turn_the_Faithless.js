const MACRONAME = "Turn_the_Faithless.0.5.js";
/*******************************************************************************************
 * Source: Unknown
 * Requires: DAE, Callback macros ActorUpdate
 * 
 * 12/21/21 0.1 JGB Imported code added headers
 * 12/22/21 0.2 JGB Working on getting the set of targets 
 * 12/22/21 0.3 JGB Remove stray existance of Frightened 
 * 05/04/22 0.4 Update for Foundry 9.x
 * 08/02/22 0.5 Add convenientDescription
 *******************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
 const TAG = `${MACRO} |`
 const TL = 5;                               // Trace Level for this macro
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
const DEBUG = true;

const ActorUpdate = game.macros?.getName("ActorUpdate");
if (!ActorUpdate) return ui.notifications.error(`Cannot locate ActorUpdate GM Macro`);
if (!ActorUpdate.data.flags["advanced-macros"].runAsGM) return ui.notifications.error(`ActorUpdate "Execute as GM" needs to be checked.`);

// const actorD = game.actors.get(args[0].actor._id);
const level = aActor.getRollData().classes.paladin.levels;
const SAVE_DC = aActor.getRollData().attributes.spelldc;
const SAVE_TYPE = "wis";
const RANGEPAD = 4.9;
const TURNEDICON = "Icons_JGB/Misc/Turned.png";
const allowedUnits = ["", "ft", "any"];
const EFFECT = "Turned"
const faithlessTypes = ["undead", "fey", "fiend"]
const CUSTOM=0, MULTIPLY=1, ADD=2, DOWNGRADE=3, UPGRADE=4, OVERRIDE=5; // midi-qol mode values
const TURNED_JRNL = `@JournalEntry[${game.journal.getName("Turned").id}]{Turned}`

let toFarCount = 0;
let toFar = "";
let turnTargets = [];
let isNPC = true;
let targetType = "";
let isFaithless = false;

if (TL>4) jez.trace(`${TAG} Inititial Values Set as follows:`,
    "aActor", aActor, "aToken", aToken, "token", token, "level", level,
    "SAVE_DC", SAVE_DC, "aItem", aItem, "aItem.data.range.value", aItem.data.range.value,
    "aItem.data.range.units", aItem.data.range.units, "SAVE_TYPE", SAVE_TYPE);
if (TL>3) jez.trace(`${TAG} rollData`, aActor.getRollData());
//-------------------------------------------------------------------------------------------------
// Get Spell Range from item card
//
// let spellRange = getSpellRange(aItem, allowedUnits) + RANGEPAD;
// if (TL>3) jez.trace(`${TAG} Values from Item Card`, "spellRange", `${spellRange} including ${RANGEPAD} padding`);
const ALLOWED_UNITS = ["", "ft", "any"];
const SPELL_RANGE = jez.getRange(aItem, ALLOWED_UNITS) ?? 30
//-------------------------------------------------------------------------------------------------
// Get in Range tokens list
//
let options = {
    exclude: "self",    // self, friendly, or none (self is default)
    direction: "t2o",       // t2o or o2t (Origin to Target) (t2o is default) 
    chkHear: false,         // Boolean (false is default)
    chkDeaf: true,          // Boolean (false is default)
    traceLvl: TL,           // Trace level, integer typically 0 to 5
}
let targetList = await jez.inRangeTargets(aToken, 30, options);
if (targetList.length === 0) return jez.badNews(`No effectable targets in range`, "i")
if (TL>1) for (let i = 0; i < targetList.length; i++) jez.trace(`${TAG} Targeting: ${targetList[i].name}`)
// let targetList = getInRangeTokens(aToken, SPELL_RANGE);
//-------------------------------------------------------------------------------------------------
// Loop through potential targets and evaluate
//
for (let targeted of targetList) {
    let target = canvas.tokens.get(targeted.id);
    if (TL>3) jez.trace(`${TAG} Targeting`, target.actor.name);
    //------------------------------------------------------------------------------------------
    // Need the creature type, but PCs and NPCs store that data differently.  Some important 
    // data hidden in the data structures:
    //   target.document._actor.data.type contains npc or character 
    // 
    // For NPCs:
    //   target.document._actor.data.data.details.type.value has the creature type
    //   target.document._actor.data.data.details.type.subtype has the creature subtype
    //
    // For PCs:
    //   target.document._actor.data.data.details.race has the race, free form
    //
    if (targeted.document._actor.data.type === "npc") isNPC = true;
    else isNPC = false;
    if (TL>3) jez.trace(`${TAG} ${targeted.name} is NPC? ${isNPC}`)
    if (isNPC) targetType = target.document._actor.data.data.details.type.value 
    else targetType = target.document._actor.data.data.details.race.toLowerCase()
    if (TL>3) jez.trace(`${TAG} targetType`,targetType);

    isFaithless = false;
    for (let i = 0; i < faithlessTypes.length; i++) {
        if (targetType.search(faithlessTypes[i]) != -1) {
            isFaithless = true;
            break;
        }
    }
    if (TL>2) jez.trace(`${TAG} ${targeted.name} is faithless?`, isFaithless);

    if (isFaithless) {
        let resist = ["Turn Resistance", "Turn Defiance"];
        let getResistance = target.actor.items.find(i => resist.includes(i.name));
        let immunity = ["Turn Immunity"];
        let getImmunity = target.actor.items.find(i => immunity.includes(i.name));
        let save = "";
        getResistance ? save = await target.actor.rollAbilitySave(SAVE_TYPE, { advantage: true, chatMessage: false, fastForward: true }) : save = await target.actor.rollAbilitySave(SAVE_TYPE, { chatMessage: false, fastForward: true });
        if (getImmunity) {
            turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} immune</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
        }
        else {
            /****************************************************************************************
            * A turned creature:
            * - Must spend its turns trying to move as far away from you as it can, and
            * - Can not willingly move to a space within 30 feet of you.
            * - Can not take reactions.
            * - Must use the Dash action or try to escape from an effect that prevents it from 
            *   moving. If it can not move, it uses the Dodge action.
            * - If true form is concealed by an illusion, shapeshifting, or other 
            *   effect, that form is revealed while it is turned.
            ***************************************************************************************/
            if (SAVE_DC > save.total) {
                if (TL>2) jez.trace(`${TAG} -- Failed Save --`, `Target name ${target.name}`, target, `save.total ${save.total}`, save);
                const CE_DESC = `Must move & dash away from ${aToken.name}, can not move with 30 ft. If can not move, must dodge.`
                let gameRound = game.combat ? game.combat.round : 0;
                let effectData = {
                    label: EFFECT,
                    icon: TURNEDICON,
                    origin: args[0].uuid,
                    disabled: false,
                    duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
                    flags: { 
                        dae: { macroRepeat: "none", specialDuration: ["isDamaged"] },
                        convenientDescription: CE_DESC
                    },
                    changes: [
                        { key: `flags.gm-notes.notes`, mode: CUSTOM, value: `Applied by ${aToken.name}`, priority: 20 },
                        { key: `macro.CE`, mode: jez.CUSTOM, value: `Reactions - None`, priority: 20 }
                    ]};
                let effect = target.actor.effects.find(ef => ef.data.label === game.i18n.localize(`${EFFECT}`));
                if (!effect) await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:target.actor.uuid, effects: [effectData] });
                turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} fails with ${save.total} [${EFFECT}]</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);

            } else {
                if (TL>0) jez.trace(`${TAG} ${target.name}, save total ${save.total} saved`);
                turnTargets.push(`<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} succeeds with ${save.total}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`);
            }
        }
    }
}
await jez.wait(800);
let turn_list = turnTargets.join('');
let turn_results = `<div class="midi-qol-nobox midi-qol-bigger-text">${aItem.name} DC ${SAVE_DC} ${CONFIG.DND5E.abilities[SAVE_TYPE]} Saving Throw:</div><div><div class="midi-qol-nobox">${turn_list}</div></div>`;
const chatMessage = await game.messages.get(args[0].itemCardId);
let content = await duplicate(chatMessage.data.content);
const searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${turn_results}`;
content = await content.replace(searchString, replaceString);
await chatMessage.update({ content: content });
await ui.chat.scrollBottom();


postResults(`Creatures that failed their saving throw are affected by the <b>${TURNED_JRNL}</b> condition.`)

if (TL>3) jez.trace(`${TAG} --- Finished ---`);
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG}--- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG}--- Finished ---`);
}