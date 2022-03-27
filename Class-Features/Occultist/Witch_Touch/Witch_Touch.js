const MACRONAME = "Witch_Touch"
/*****************************************************************************************
 * Implementatio0n macro for Occultist's Witch's Touch.  This macro powers an item that 
 * is to be used as a followup to an Occultist taking an action that should trigger the 
 * Witch's Touch.  Here's Kibble's description:
 * 
 *   Starting at 6th level, whenever you cast a spell with a range of touch (including 
 *   through your familiar), you can add one of the following modifiers to the spell
 * 
 *    o Bolster -- It grants one affected target temporary hit points equal to your Wisdom 
 *      modifier. Only one creature can have these temporary hit points at a time.
 *    o Wither -- It deals additional damage equal to your Wisdom modifier to one affected 
 *      creature.
 *    o Curse -- It adds or subtracts 1d4 from the target's next attack roll or saving  
 *      throw before the start of your next turn.
 * 
 *   You can also confer these effects to another spell with a range longer than touch by 
 *   making its range touch, or confer these effects as an action without casting a spell 
 *   by touching a target (making a melee spell attack to do if the target is an unwilling 
 *   creature). If you make the range of a curse spell touch, you no longer need the 
 *   material component for the spell.
 * 
 * I added the word title and split the Curse option into Curse and Bless.
 * 
 * 02/13/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
let tToken;
let tActor;
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const CAST_MOD = jez.getCastMod(aToken)
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
const GAME_RND = game.combat ? game.combat.round : 0; // Added missing initilization -JGB
const BUFF_BOLSTER = `Witch Touch's Bolster`
const BUFF_CURSE = `Witch Touch's Curse`
const BUFF_BLESS = `Witch Touch's Bless`
//----------------------------------------------------------------------------------
// Run the preCheck function to make sure things are setup as best I can check them
//
if ((args[0]?.tag === "OnUse") && !preCheck())return;

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
//if (args[0] === "off") await doOff();                   // DAE removal
//if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
//if (args[0] === "each") doEach();					    // DAE removal
// DamageBonus must return a function to the caller
//if (args[0]?.tag === "DamageBonus") return(doBonusDamage());    
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        postResults(msg);
        return (false);
    }
    /*if (LAST_ARG.hitTargets.length === 0) {  // If target was missed, return
        msg = `Target was missed.`
        postResults();
        return(false);
    }*/
    /*if (args[0].failedSaveUuids.length !== 1) {  // If target made its save, return
        msg = `Saving throw succeeded.  ${aItem.name} has no effect.`
        postResults();

        return(false);
    }*/
    return(true)
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(`Message: ${msg}`);
    let chatMsg = game.messages.get(LAST_ARG.itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    tActor = tToken?.actor;
    let optionArray;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)

    const queryTitle = "Select Witch's Touch Effect"
     const queryText = `Bolster can only be applied to one target at time.<br>Curse and Bless expire at 
        the end of your next turn.`
     if (await isBolstered()) {
         optionArray = [
             `Wither -- Deal ${CAST_MOD} damage to target.`,
             `Curse -- Subtract 1d4 from target's next attack or save.`,
             `Bless -- Add 1d4 to target's next attack or save.`
         ];
     } else {
         optionArray = [
             `Bolster -- Grant one creatire ${CAST_MOD} temp HP.`,
             `Wither -- Deal ${CAST_MOD} damage to target.`,
             `Curse -- Subtract 1d4 from target's next attack or save.`,
             `Bless -- Add 1d4 to target's next attack or save.`
         ];
     }
    jez.pickRadioListArray(queryTitle, queryText, pickEffectCallBack, optionArray);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}

/***************************************************************************************************
 * Process the callback from dialog and fork to correct function to apply effect
 ***************************************************************************************************/
function pickEffectCallBack(selection) {
    jez.log("pickRadioCallBack", selection)
    if (!selection) return(false)
    const action = selection.split(" ")[0]     // Grab the first word from the selection

    switch(action) {
        case "Bolster":
            applyBolster();
            break;
        case "Wither":
            applyWither();
            break;
        case "Curse":
            applyCurse();
            break;
        case "Bless":
            applyBless();
            break;
        default:
            msg = `No valid selection made: ${action}.`
            postResults(msg);
            return (false);
      }
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
function applyBolster() {
    //----------------------------------------------------------------------------------------------
    // Launch the VFX on the target Token
    //
    let intro = "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/EvocationRuneIntro_01_Regular_Blue_400x400.webm"
    let loop  = "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/EvocationRuneLoop_01_Regular_Blue_400x400.webm"
    let outro = "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/EvocationRuneOutro_01_Regular_Blue_400x400.webm"
    runVFX(tToken, intro, loop, outro, 0.4, 1)
    //----------------------------------------------------------------------------------------------
    // Check out existing temp HP so we don't downgrade them
    //
    let oldTempHp = tToken.actor.data.data.attributes.hp.temp;
    jez.log("oldTempHp",oldTempHp)
    if (CAST_MOD <= oldTempHp) {
        msg = `${tToken.name} already had ${oldTempHp} temporary hit points, this spell has no effect.`
        postResults(msg);
        return(false);
    }
    //----------------------------------------------------------------------------------------------
    // Define the effect that will be applied
    //
    let effectData = [
        {
            label: BUFF_BOLSTER,
            icon: aItem.img,
            origin: args[0].uuid,
            disabled: false,
            duration: { rounds: 9999, startRound: GAME_RND, startTime: game.time.worldTime },
            flags: { dae: { specialDuration: ["isDamaged"] } },
            changes: [
                { key: `data.attributes.hp.temp`, mode: UPGRADE, value: CAST_MOD, priority: 20 },
            ]
        }];
    jez.log("effectData",effectData)
    MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: effectData });
    //----------------------------------------------------------------------------------------------
    // Set the flag to point at bolstered actor
    //
    DAE.setFlag(aToken.actor, MACRONAME, tToken.id);    

    // tToken.actor.update({ 'data.attributes.hp.temp' : CAST_MOD })
    jez.log("msg 1", msg)

    msg = `<b>${tToken.name}</b> has been bolstered by Witch's Touch, he/she/it now has <b>${CAST_MOD}</b> 
    temporary hit points.`
    jez.log("msg 2", msg)

    if (oldTempHp) {
        msg = msg + `<br><br><b>${tToken.name}</b> had ${oldTempHp} temporary hit points, gained ${CAST_MOD-oldTempHp}.`
        jez.log("msg 3", msg)
        jez.log("Had oldTempHp", oldTempHp)
    } else jez.log("no oldTempHP")
    jez.log("msg 4", msg)
    postResults(msg);
    return (true);
}
/***************************************************************************************************
 *
 ***************************************************************************************************/
async function applyWither() {
    //----------------------------------------------------------------------------------------------
    // Launch the VFX on the target Token
    //
    let intro = "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/NecromancyRuneIntro_01_Regular_Green_400x400.webm"
    let loop  = "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/NecromancyRuneLoop_01_Regular_Green_400x400.webm"
    let outro = "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/NecromancyRuneOutro_01_Regular_Green_400x400.webm"
    runVFX(tToken, intro, loop, outro, 0.4, 1)
    //----------------------------------------------------------------------------------------------
    // Apply Damage to the target
    //
    await applyDamage(tToken, CAST_MOD)
    //postResults(msg);
    return (false);
    //----------------------------------------------------------------------------------------------
    //
    async function applyDamage(token1, amount) {
        const FUNCNAME = "applyDamage(token1, amount)"
        jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
        const DAMAGE_TYPE = "necrotic"
        let hpVal = token1.actor.data.data.attributes.hp.value;
        let damageDone = Math.min(hpVal, amount)
        let damageRollObj = new Roll(`${damageDone}`).evaluate({ async: false });
        await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRollObj.total, DAMAGE_TYPE, [token1], damageRollObj,
            {
                flavor: `${tToken.name} suffers from ${DAMAGE_TYPE} damage`,
                itemCardId: LAST_ARG.itemCardId,
                useOther: false
            }
        );
        jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
        return (damageDone)
    }
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
 function applyCurse() {
    //----------------------------------------------------------------------------------------------
    // Launch the VFX on the target Token
    //
    let intro = "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/EnchantmentRuneIntro_01_Regular_Red_400x400.webm"
    let loop  = "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/EnchantmentRuneLoop_01_Regular_Red_400x400.webm"
    let outro = "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/EnchantmentRuneOutro_01_Regular_Red_400x400.webm"
    runVFX(tToken, intro, loop, outro, 0.4, 1)
    //----------------------------------------------------------------------------------------------
    // Define Effect Data
    //
    let effectData = [
        {
            label: BUFF_CURSE,
            icon: aItem.img,
            origin: args[0].uuid,
            disabled: false,
            duration: { rounds: 9999, startRound: GAME_RND, startTime: game.time.worldTime },
            flags: { dae: { specialDuration: ["1Attack", "isSave", "turnStartSource"] } },
            changes: [
                { key: `data.bonuses.All-Attacks`, mode: ADD, value: `-1d4[${BUFF_CURSE}]`, priority: 20 },
                { key: `data.bonuses.abilities.save`, mode: ADD, value: `-1d4[${BUFF_CURSE}]`, priority: 20 },
            ]
        }];
    //----------------------------------------------------------------------------------------------
    // Apply the effect
    //
    MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: effectData });
    //----------------------------------------------------------------------------------------------
    // Post results message
    //
    msg = `<b>${aToken.name}</b> has applied ${BUFF_CURSE}.<br><br><b>${tToken.name}</b> makes next attack or save 
    with a 1d4 penalty before the beginning of ${aToken.name}'s next turn`
    postResults(msg);
    return (true);
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
 function applyBless() {
    //----------------------------------------------------------------------------------------------
    // Launch the VFX on the target Token
    //
    let intro = "jb2a.magic_signs.rune.abjuration.intro.yellow"
    let loop  = "jb2a.magic_signs.rune.abjuration.loop.yellow"
    let outro = "jb2a.magic_signs.rune.abjuration.outro.yellow"
    runVFX(tToken, intro, loop, outro, 0.4, 1)
    //----------------------------------------------------------------------------------------------
    // Define Effect Data
    //
    let effectData = [
        {
            label: BUFF_BLESS,
            icon: aItem.img,
            origin: args[0].uuid,
            disabled: false,
            duration: { rounds: 9999, startRound: GAME_RND, startTime: game.time.worldTime },
            flags: { dae: { specialDuration: ["1Attack", "isSave", "turnStartSource"] } },
            changes: [
                { key: `data.bonuses.All-Attacks`, mode: ADD, value: `+1d4[${BUFF_BLESS}]`, priority: 20 },
                { key: `data.bonuses.abilities.save`, mode: ADD, value: `+1d4[${BUFF_BLESS}]`, priority: 20 },
            ]
        }];
    //----------------------------------------------------------------------------------------------
    // Apply the effect
    //
    MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tToken.actor.uuid, effects: effectData });
    //----------------------------------------------------------------------------------------------
    // Post results message
    //
    msg = `<b>${aToken.name}</b> has applied ${BUFF_BLESS}.<br><br><b>${tToken.name}</b> makes next attack or save 
    with a 1d4 bonus before the beginning of ${aToken.name}'s next turn`
    postResults(msg);
    return (true);
}
/***************************************************************************************************
 * Is the previously bolstered actor still bolstered? Return boolean with true = yes, bolstered
 ***************************************************************************************************/
 async function isBolstered() {
    //----------------------------------------------------------------------------------------------
    // Get flag value, if none return(false) as no bolster is outstanding
    //
    let oldBolsteredTokenId = await DAE.getFlag(aToken.actor, MACRONAME);
    jez.log("==> oldBolsteredTokenId", oldBolsteredTokenId)
    if (!oldBolsteredTokenId) return(false)     // No flag set, nothing is bolstered
    //----------------------------------------------------------------------------------------------
    // Translate the flag value (actor ID) in to an Actor5e object
    //
    //let oldBolsteredActor = game.actors.get(oldBolsteredActorId)
    let oldBolsteredToken    = canvas.tokens.placeables.find(ef => ef.id === oldBolsteredTokenId)
    if (!oldBolsteredToken) return(false)     // Can't find the Token, nothing is bolstered
    jez.log(`==> oldBolsteredToken, ${oldBolsteredToken.name}`, oldBolsteredToken)
    //----------------------------------------------------------------------------------------------
    // Search the Actor5e object for a Bolstered buff effect
    //
    let effect = await oldBolsteredToken.actor.effects.find(i => i.data.label === BUFF_BOLSTER);
    jez.log(`==> ${BUFF_BOLSTER} found?`, effect)
    if (effect) {
        jez.log(`==> ${BUFF_BOLSTER} was found on ${oldBolsteredToken.name}.`,oldBolsteredToken)
        return (true);
    }
    else jez.log(`==> ${BUFF_BOLSTER} not found on ${oldBolsteredToken.name}.`,oldBolsteredToken)
    return (false);
}

/***************************************************************************************************
 * Run a three phase VFX at the anchor (likely a token)
 ***************************************************************************************************/
async function runVFX(anchor, intro, loop, outro, scale, opacity) {
    new Sequence()
        .effect()
            .file(intro)
            .atLocation(anchor) 
            .scale(scale)
            .opacity(opacity)
            .waitUntilFinished(-500) 
        .effect()
            .file(loop)
            .atLocation(anchor)
            .scale(scale)
            .opacity(opacity)
            //.persist()
            .duration(4000)
            .waitUntilFinished(-500) 
        .effect()
            .file(outro)
            .atLocation(anchor)
            .scale(scale)
            .opacity(opacity)
        .play();
 }