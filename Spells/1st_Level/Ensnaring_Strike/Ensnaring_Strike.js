const MACRONAME = "Ensnaring_Strike_0.6.js"
/*******************************************************************************************
 * Implement Ensnaring Strike
 * 
 * Description: The next time you hit a creature with a weapon attack before this spell 
 *   ends, a writhing mass of thorny vines appears at the point of impact, and the target 
 *   must succeed on a Strength saving throw or be restrained by the magical vines until 
 *   the spell ends. A Large or larger creature has advantage on this saving throw. If the 
 *   target succeeds on the save, the vines shrivel away. 
 * 
 *   While restrained by this spell, the target takes 1d6 piercing damage at the start 
 *   of each of its turns. A creature restrained by the vines or one that can touch the 
 *   creature can use its action to make a Strength check against your spell save DC. 
 *   On a success, the target is freed. 
 * 
 *   At Higher Levels. If you cast this spell using a spell slot of 2nd level or higher, 
 *   the damage increases by 1d6 for each slot level above 1st.
 * 
 * The following steps need to be accomplished:
 * 1. OnUse - add buff to the caster to transfer to the next creature hit with a weap attack.
 *    Modeling this on Searing_Smite.0.1
 *
 * 
 * This will need an OnUse and a Each execution.
 * 
 * 12/27/21 0.1 JGB Creation
 * 12/28/21 0.2 JGB Continued Development
 * 12/28/21 0.3 JGB Add dialog to make skill check to escape an option
 * 07/29/22 0.4 JGB Add convenientDescription, fixed bug from Midi change, paired effect
 * 12/06/22 0.5 JGB Problem discovered: Error: User Joe M. lacks permission to update Token 
 * 12/08/22 0.6 JGB Several problems addresed
 *******************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 0;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //---------------------------------------------------------------------------------------------------
 if (TL>1) jez.trace(`${TAG} === Starting ===`);
 if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
 const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
 //---------------------------------------------------------------------------------------------------
 // Set standard variables
 let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
 let aActor = aToken.actor; 
 let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
 const VERSION = Math.floor(game.VERSION);
 const GAME_RND = game.combat ? game.combat.round : 0;
 //---------------------------------------------------------------------------------------------------
 // Set Macro specific globals
 //
const DEBUFF_NAME = "Restrained" // aItem.name || "Nature's Wraith";
const DEBUFF_ICON = "modules/combat-utility-belt/icons/restrained.svg"
const SAVE_TYPE = "str"
const JOURNAL_RESTRAINED = "<b>@JournalEntry[CZWEqV2uG9aDWJnD]{restrained}</b>"
//-------------------------------------------------------------------------------
// Depending on where invoked call appropriate function to do the work
//
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});      
if (args[0] === "on") await doOn({traceLvl:TL});          	
if (args[0] === "each") await doEach({traceLvl:TL});		
if (args[0]?.tag === "DamageBonus") await doBonusDamage({traceLvl:TL}); 
if (TL>1) jez.trace(`${TAG} === Finished ===`);
return;
/***************************************************************************************
*    END_OF_MAIN_MACRO_BODY
*                                END_OF_MAIN_MACRO_BODY
*                                                             END_OF_MAIN_MACRO_BODY
***************************************************************************************/
/**************************************************************************************
* Execute code for a ItemMacro onUse
***************************************************************************************/
async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    //
    const SAVE_DC = aToken.actor.data.data.attributes.spelldc;
    const SPELL_LVL = L_ARG.spellLevel
    //-----------------------------------------------------------------------------------------------
    //
    let effectData = [{
        changes: [
            { key: "flags.dnd5e.DamageBonusMacro", mode: jez.CUSTOM, value: `ItemMacro.${aItem.name}`, priority: 20 },
            { key: "flags.midi-qol.spellLevel", mode: jez.OVERRIDE, value: `${SPELL_LVL}`, priority: 20 },
            { key: "flags.midi-qol.spellId", mode: jez.OVERRIDE, value: `${L_ARG.uuid}`, priority: 20 },
        ],
        origin: L_ARG.uuid,
        disabled: false,
        duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
        flags: { 
            dae: { itemData: aItem, specialDuration: ["DamageDealt"] },
            convenientDescription: `Next weapon attack forces DC${SAVE_DC} STR Save or be Restrained and take DoT`
         },
        icon: aItem.img,
        label: aItem.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: effectData });

    //---------------------------------------------------------------------------------------
    // Thats all folks
    //
    msg = `<p style="color:blue;font-size:14px;">
        <b>${aToken.name}</b> will attemt to apply ${JOURNAL_RESTRAINED} on next hit.  
        Target may make a <b>DC${SAVE_DC}</b> ${CONFIG.DND5E.abilities[SAVE_TYPE]} save to avoid.
        </p>`
    postResults(msg);
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set On
 * This runs on actor that has the affected applied to it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
async function doOn(options={}) {
    const FUNCNAME = "doOn(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL>0) jez.trace(`${TAG} --- Starting ---`);
    //-----------------------------------------------------------------------------------------------
    //
    const SAVE_DC = args[1];
    //---------------------------------------------------------------------------------------
    // If the target is large or larger, it should have advantage on its save
    //
    let targetSize = getSizeInfo(aToken);
    let adv = false;
    let flavor = `<b>${aToken.name}</b> attempts a 
    ${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> save to avoid <b>${DEBUFF_NAME}</b>
    effect from ensnaring strike.`;
    if (TL > 1) jez.trace(`${TAG} ${aToken.name} is ${targetSize.nameStr} with a value of ${targetSize.value}`)
    if (targetSize.value > 3) {
        adv = true
        flavor += `<br><br>Roll is made with <b>advantage</b> as ${aToken.name} is <b>${targetSize.nameStr}</b>`;
    }
    if (TL > 1) jez.trace(`${TAG} *** Make save with advantage? ${adv}`, flavor);
    //---------------------------------------------------------------------------------------
    // Have the target roll its saving throw
    //
    let save = null
    if (adv) save = (await aActor.rollAbilitySave(SAVE_TYPE, { flavor: flavor, advantage: "true", chatMessage: true, fastforward: true })).total;
    else save = (await aActor.rollAbilitySave(SAVE_TYPE, { flavor: flavor, chatMessage: true, fastforward: true })).total;
    if (TL > 1) jez.trace(`${TAG} Result of save roll`, save);
    if (save >= SAVE_DC) {
        if (TL > 1) jez.trace(`${TAG} save was made with a ${save}`);
        postResults(`save was made`);
        // remove the effect.
    } else if (TL > 1) jez.trace(`${TAG} save failed with a ${save}`);
    //---------------------------------------------------------------------------------------
    // If the target made the save remove the recently aplied effect
    //
    if (save >= SAVE_DC) {
        msg = `${aToken.name} made its save.  Rolling ${save} vs ${SAVE_DC} DC.`;
        if (TL>0) jez.trace(`${TAG} ${msg}`)
        await jez.wait(500)   // This pause allows the debuff to be placed by DAE before removal
        if (TL > 1) jez.trace(`${TAG} After a brief pause, tToken.data`, aToken.data)
        //----------------------------------------------------------------------------------
        // Check for debuff matching DEBUFF_NAME.  If it exists, remove it.
        //
        if (TL > 1) jez.trace(`${TAG}  aToken.data.effects`, aToken.data.actorData.effects)
        let existingEffect = aActor.effects.find(ef => ef.data.label === DEBUFF_NAME) ?? null;

        if (existingEffect) {
            msg = `${aToken.name} has ${DEBUFF_NAME} effect`;
            if (TL>0) jez.trace(`${TAG} ${msg}`, existingEffect);
            await existingEffect.delete();
        } else {
            msg = `${aToken.name} lacked ${DEBUFF_NAME} effect.`;
            if (TL>0) jez.trace(`${TAG} ${msg}`)
        }
    }
    else {
        msg = `${aToken.name} failed its save.  Rolling ${save} vs DC${SAVE_DC}.`;
        if (TL>0) jez.trace(`${TAG} ${msg}`)
    }
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked each round by DAE
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doEach(options = {}) {
    const FUNCNAME = "doEach(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //-----------------------------------------------------------------------------------------------
    //
    const SAVE_DC = args[1];
    //-----------------------------------------------------------------------------------------------
    // Ask if ability check should be used to attempt to break the vines
    // 
    let confirmation = await Dialog.confirm({
        title: '${aToken.name} Spend Action to Break Vines?',
        content: `<p>The nasty vines are keeping <b>${aToken.name}</b> restrained.  
        Would you like to use your action this round to attempt to break the vines making a 
        <b>DC${SAVE_DC} Strength</b> check?</p>
        <p>If so click <b>Yes</b>.</p>  
        <p>If not click <b>No</b>.</p>`,
    });
    console.log(`confirmation`, confirmation)
    //-----------------------------------------------------------------------------------------------
    // If ignoring the vines, log it and return
    // 
    if (!confirmation) { // Actor is ignoring the vines
        if (TL > 0) jez.trace(`${TAG} "Ignoring the vines"`)
        return
    }
    //-----------------------------------------------------------------------------------------------
    // Attempt escape
    // 
    if (TL > 0) jez.trace(`${TAG} "Attempting to break the vines"`)
    let flavor = `${aToken.name} uses this turn's <b>action</b> to attempt a 
        ${CONFIG.DND5E.abilities[SAVE_TYPE]} check vs <b>DC${SAVE_DC}</b> to end the 
        <b>${DEBUFF_NAME}</b> effect from ensnaring strike.`; // doesn't do anything -- midi sets
    let check = (await aActor.rollAbilityTest(SAVE_TYPE, {
        flavor: flavor,
        chatMessage: true,
        fastforward: true
    })).total;
    if (TL > 1) jez.trace(`${TAG} Result of check roll`, check);
    //---------------------------------------------------------------------------------------
    // If the target made the save remove the effect
    //
    if (check >= SAVE_DC) {
        msg = `${aToken.name} made its check.  Rolling ${check} vs ${SAVE_DC} DC.`;
        if (TL > 0) jez.trace(`${TAG} ${msg}`);
        //----------------------------------------------------------------------------------
        // Check for debuff matching DEBUFF_NAME.  If it exists, remove it.
        //
        if (TL > 1) jez.trace(`${TAG}  aToken.data.effects`, aToken.data.actorData.effects);
        let existingEffect = aActor.effects.find(ef => ef.data.label === DEBUFF_NAME) ?? null;

        if (existingEffect) {
            msg = `${aToken.name} has ${DEBUFF_NAME} effect: `;
            if (TL > 0) jez.trace(`${TAG} ${msg}`, existingEffect)
            await existingEffect.delete();
        } else {
            msg = `${aToken.name} lacked ${DEBUFF_NAME} effect.`;
            if (TL > 0) jez.trace(`${TAG} ${msg}`)
        }
    }
    else {
        msg = `${aToken.name} failed its check.  Rolling ${check} vs DC${SAVE_DC}.`;
        if (TL > 0) jez.trace(`${TAG} ${msg}`)
    }
    //---------------------------------------------------------------------------------------
    // Thats all
    //
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
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
    if (!oneTarget()) return;
    if (!["mwak"].includes(L_ARG.item.data.actionType)) return {};
    let target = canvas.tokens.get(L_ARG.hitTargets[0].id);
    let spellLevel = getProperty(L_ARG.actor.flags, "midi-qol.spellLevel");
    const SAVE_DC = aToken.actor.data.data.attributes.spelldc;
    let spellUuid = getProperty(L_ARG.actor.flags, "midi-qol.spellId");
    let spellItem = await fromUuid(getProperty(L_ARG.actor.flags, "midi-qol.spellId"));
    let damageType = "piercing";
    if (TL > 1) jez.trace(`${TAG} Input Info`, "target    ", target, "spellLevel", spellLevel,
        "SAVE_DC   ", SAVE_DC, "spellUuid ", spellUuid, "spellItem ", spellItem, "damageType", damageType)
    //-----------------------------------------------------------------------------------------------
    // Apply the debuff to the target
    //
    let value = `turn=start,label="Ensnaring Strike",damageRoll=${spellLevel}d6,damageType=${damageType}`
    let effectData = [{
        changes: [
            { key: `flags.midi-qol.OverTime`, mode: jez.OVERRIDE, value: value, priority: 20 },
            { key: "data.attributes.movement.walk", mode: jez.OVERRIDE, value: 1, priority: 20 },
            { key: "macro.itemMacro", mode: jez.CUSTOM, value: SAVE_DC, priority: 20 },
            { key: "macro.CE", mode: jez.CUSTOM, value: "Restrained", priority: 20 },
        ],
        origin: spellUuid,
        flags: { 
            dae: { itemData: spellItem.data, macroRepeat: "startEveryTurn", token: target.uuid },
            convenientDescription: `${DEBUFF_NAME} and taking Damage over Time`        
        },
        disabled: false,
        duration: { rounds: 10, seconds: 60, startRound: GAME_RND, startTime: game.time.worldTime },
        icon: spellItem.img,
        label: spellItem.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: effectData });
    // Bug Fix?  Crymic had the following line execute to remove concentration, which I think is an incorrect 
    // interpretation of the spell.  Dropping concentration should end the DoT.  Keeping this line in case I want
    // to revert my change to Crymic's code.
    //
    // await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: aToken.actor.uuid, effects: [CONC.id] });
    await jez.wait(100)
    if (TL > 1) jez.trace(`${TAG} jez.pairEffectsAsGM(aActor, "Concentrating", target.actor, ${spellItem.name})`)
    jez.pairEffectsAsGM(aActor, "Concentrating", target.actor, spellItem.name) // --> Permission problem for players
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return {
        damageRoll: `${spellLevel}d6[${damageType}]`,
        flavor: `(Ensnaring Strike (${CONFIG.DND5E.damageTypes[damageType]}))`
    };
}
/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) 
        return jez.badNews(`Targeted nothing, must target single token to be acted upon`,'w')
    if (game.user.targets.ids.length != 1) 
        return jez.badNews(`Target a single token. Targeted ${game.user.targets.ids.length} tokens`,'w')
    if (TL > 1) jez.trace(`${TAG}  targeting one target`);
    return (true);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
}
/****************************************************************************************
 * Return an object describing the size of a passed TokenID.  The object will contain:
 *   this.key     - short form of size used as a key to obtain other info
 *   this.value   - numeric value of size, 1 is tiny, 6 is gargantuan, 0 is error case
 *   this.namestr - size string in lowercase, e.g. medium
 *   this.nameStr - size string in mixedcase, e.g. Gargantuan
 ***************************************************************************************/
function getSizeInfo(token5E) {
    if (TL>1) jez.trace(`${TAG} (getSizeInfo(token5E)`, token5E)
    class CreatureSizeInfos {
        constructor(size) {
            this.key = size;
            switch (size) {
                case "tiny": this.value = 1;
                    this.namestr = "tiny";
                    this.nameStr = "Tiny";
                    break;
                case "sm": this.value = 2;
                    this.nameStr = "small";
                    this.nameStr = "Small";
                    break;
                case "med": this.value = 3;
                    this.namestr = "medium";
                    this.nameStr = "Medium";
                    break;
                case "lg": this.value = 4;
                    this.nameStr = "large";
                    this.nameStr = "Large";
                    break;
                case "huge": this.value = 5;
                    this.nameStr = "huge";
                    this.nameStr = "Huge";
                    break;
                case "grg": this.value = 6;
                    this.nameStr = "gargantuan";
                    this.nameStr = "Gargantuan";
                    break;
                default: this.value = 0;  // Error Condition
                    this.nameStr = "unknown";
                    this.nameStr = "Unknown";
            }
        }
    }
    let token5ESizeStr = token5E.document?._actor.data.data.traits.size
        ? token5E.document?._actor.data.data.traits.size
        : token5E._actor.data.data.traits.size
    let token5ESizeInfo = new CreatureSizeInfos(token5ESizeStr);
    if (!token5ESizeInfo.value) {
        let message = `Size of ${token5E.name}, ${token5ESizeStr} failed to parse. End ${MACRONAME}<br>`;
        log(message);
        ui.notifications.error(message);
    }
    return (token5ESizeInfo);
}