const MACRONAME = "Wail.0.1"
console.log(MACRONAME)
/*****************************************************************************************
 * Implment Banshee Wail
 * 
 *   As an action, release a mournful wail, provided the actor isn’t in sunlight.
 *   This wail has no effect on constructs and undead.
 *   All other creatures within 30 feet that can hear her must make a Constitution saving 
 *   throw. On a failure, a creature drops to 0 hit points. On a success, a creature takes 
 *   10 (3d6) psychic damage
 * 
 * The "can hear" portion is not implemented as I have no consistency or interest in 
 * placing walls that block sound or tracking deafness.
 * 
 * 01/01/21 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim off the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
const ALLOWED_UNITS = ["", "ft", "any"];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
const DAMAGE_TYPE = "psychic"
const DAMAGE_DICE = "3d6"
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Template/Circle/Vortex_01_Regular_Blue_600x600.webm"
const VFX_INTRO = "modules/jb2a_patreon/Library/Generic/Template/Circle/VortexIntro_01_Regular_Blue_600x600.webm"
const VFX_OUTRO = "modules/jb2a_patreon/Library/Generic/Template/Circle/VortexOutro_01_Regular_Blue_600x600.webm"
const VFX_OPACITY = 0.8;
const VFX_SCALE = 2.25;

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use

jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    let isNPC = false;
    let targetType = null;
    let tokensToSave = []
    const SAVE_TYPE = "con"
    const SAVE_DC = aActor.data.data.attributes.spelldc;
    const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to resisit <b>${aItem.name}</b>`;
    let failSaves = []  // Array to contain the tokens that failed their saving throws
    let madeSaves = []  // Array to contain the tokens that made their saving throws
    let madeNames = ""
    let failNames = ""
    let immuneNames = ""
    let damTaken = ""
    let damDone = 0
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //---------------------------------------------------------------------------------------------
    // Fetch the spell effect range
    //
    let RANGE = aItem.data.range?.value ? aItem.data.range?.value : 60
    let UNITS = aItem.data.range.units;
    jez.log(`range ${RANGE}, units ${UNITS}`);
    if (ALLOWED_UNITS.includes(UNITS)) {
        jez.log("Units are ok");
    } else {
        jez.log(`Unit ${UNITS} not in`, ALLOWED_UNITS);
        ui.notifications.error(`Unit ${UNITS} not in allowed units`);
        return (false);
    }
    //---------------------------------------------------------------------------------------------
    // Startup ye'ole VFX
    //
    runVFX();
    //---------------------------------------------------------------------------------------------
    // Proceed to doing actual things
    //
    let tTokens = await jez.tokensInRange(aToken, RANGE)
    let tTokenCnt = tTokens?.length
    jez.log("")
    jez.log(`${tTokenCnt} Token(s) found within ${RANGE} feet`, tTokens)
    for (let i = 0; i < tTokenCnt; i++) {
        //-----------------------------------------------------------------------------------------
        // Check to see if target is a construct and thus immune
        //
        if (tTokens[i].document._actor.data.type === "npc") isNPC = true; else isNPC = false;
        if (isNPC) targetType = tTokens[i].document._actor.data.data.details.type.value 
              else targetType = tTokens[i].document._actor.data.data.details.race.toLowerCase()
        if (targetType.includes("construct")) {
            jez.log(`${tTokens[i].name} is construct`)
            immuneNames += `<b>${tTokens[i].name}</b> (construct)<br>`
            continue
        }
        //-----------------------------------------------------------------------------------------
        // Check to see if target is undead and thus immune
        //
        if (tTokens[i].document._actor.data.type === "npc") isNPC = true; else isNPC = false;
        if (isNPC) targetType = tTokens[i].document._actor.data.data.details.type.value 
              else targetType = tTokens[i].document._actor.data.data.details.race.toLowerCase()
        if (targetType.includes("undead")) {
            jez.log(`${tTokens[i].name} is undead`)
            immuneNames += `<b>${tTokens[i].name}</b> (Undead)<br>`
            continue
        }
        //---------------------------------------------------------------------------------------------
        // Proceed with the tokens that might be affected (need to roll saves)
        //
        tokensToSave.push(tTokens[i])
        let save = (await tTokens[i].actor.rollAbilitySave(SAVE_TYPE, { FLAVOR, chatMessage: false, fastforward: true }));
        if (save.total < SAVE_DC) {
            jez.log(`${tTokens[i].name} failed: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            failSaves.push(tTokens[i])
            failNames += `<b>${tTokens[i].name}</b>: ${save.total} (${save._formula})<br>`
        } else {
            jez.log(`${tTokens[i].name} saved: ${SAVE_TYPE}${save.total} vs ${SAVE_DC}`)
            madeSaves.push(tTokens[i])
            madeNames += `<b>${tTokens[i].name}</b>: ${save.total} (${save._formula})<br>`
        }
    }
    //---------------------------------------------------------------------------------------------
    // If no tokens need to roll saves, we're done, get on out of here.
    //
    if (tokensToSave.length < 1) {
        msg = `There are no targets that need to save against ${aToken.name}'s ${aItem.name}`
        jez.log(`msg`)
        let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
        await jez.addMessage(chatMessage, { color: "purple", fSize: 15, msg: msg, tag: "saves" })
        return;
    }
    //---------------------------------------------------------------------------------------------
    // Process Tokens that Failed Saves. Apply the prescribed damage, killz them.
    //
    jez.log(`${failSaves.length} Tokens failed saves, need health dropped to zero`)
    for (let i = 0; i < failSaves.length; i++) {
        jez.log(` ${i + 1}) ${failSaves[i].name}`, failSaves[i])
        damDone = await applyDamage(failSaves[i], 99999)
        jez.log(`  ${damDone} Damage Done <==================================`)
        damTaken += `<b>${failSaves[i].name}</b> took ${damDone} damage<br>`
    }
    //---------------------------------------------------------------------------------------------
    // Process Tokens that made Saves. Apply the prescribed damage.
    //
    jez.log(`${madeSaves.length} Tokens passed saves, need damage applied`)
    let damageRoll = new Roll(`${DAMAGE_DICE}`).evaluate({ async: false });
    game.dice3d?.showForRoll(damageRoll);
    for (let i = 0; i < madeSaves.length; i++) {
        jez.log(` ${i + 1}) ${madeSaves[i].name}`, madeSaves[i])
        damDone = await applyDamage(madeSaves[i],damageRoll.total)
        jez.log(`  ${damDone} Damage Done <==================================`)
        damTaken += `<b>${madeSaves[i].name}</b> took ${damDone}<br>`
    }
    async function applyDamage(token1, amount) {
        let hpVal = token1.actor.data.data.attributes.hp.value;
        let damageDone = Math.min(hpVal, amount)
        let damageRollObj = new Roll(`${damageDone}`).evaluate({ async: false });
        jez.log(`damageRollObj`, damageRollObj);
        await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageDone, 
            DAMAGE_TYPE,[token1], damageRollObj,
            {
                flavor: `(${CONFIG.DND5E.healingTypes[DAMAGE_TYPE]})`,
                itemCardId: null,
                useOther: false
            }
        );
        return(damageDone)
    }
    //---------------------------------------------------------------------------------------------
    // Craft results message and post it.
    //
    let chatMessage = await game.messages.get(args[args.length - 1].itemCardId);
    await jez.wait(100)
    if (immuneNames) {
        msg = `<b><u>Immune</u></b><br>${immuneNames}`
        await jez.wait(100)
        // https://www.w3schools.com/tags/ref_colornames.asp
        jez.addMessage(chatMessage, { color: "purple", fSize: 14, msg: msg, tag: "damage" })
    }
    if (madeNames) {
        msg = `<b><u>Successful ${SAVE_TYPE.toUpperCase()} Save</u></b> vs DC${SAVE_DC}<br>${madeNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkgreen", fSize: 14, msg: msg, tag: "damage" })
    }
    if (failNames) {
         msg = `<b><u>Failed ${SAVE_TYPE.toUpperCase()} Save</u></b> vs DC${SAVE_DC}<br>${failNames}`
        await jez.wait(100)
        jez.addMessage(chatMessage, { color: "darkred", fSize: 14, msg: msg, tag: "damage" })
    }
    await jez.wait(100)
    msg = `Total of ${tTokenCnt} target(s) within ${RANGE}ft of ${aToken.name}<br>`
    jez.addMessage(chatMessage, { color: "darkblue", fSize: 14, msg: msg, tag: "damage" })
    if (damTaken) {
        await jez.wait(100)
        msg = "<b><u>Damage taken by individual</b></u><br>" + damTaken
        jez.addMessage(chatMessage, { color: "darkbrown", fSize: 14, msg: msg, tag: "saves" })
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
async function runVFX() {
    new Sequence()
        .effect()
        .file(VFX_INTRO)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .waitUntilFinished(-500) // Negative wait time (ms) clips the effect to avoid fadeout
        .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        //.persist()
        .duration(3000)
        .name(VFX_NAME) // Give the effect a uniqueish name
        .fadeIn(10) // Fade in for specified time in milliseconds
        .fadeOut(1000) // Fade out for specified time in milliseconds
        .extraEndDuration(1200) // Time padding on exit to connect to Outro effect
        .effect()
        .file(VFX_OUTRO)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .attachTo(aToken)
        .play();
}
