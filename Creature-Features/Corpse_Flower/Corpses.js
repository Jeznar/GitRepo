const MACRONAME = "Corpses.0.1.js"
const TL = 5;                               // Trace Level for this macro
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implement the corpses ability
 * 
 * 09/21/23 0.5 Replace jez.log with jez.log 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.log(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const EFFECT_NAME = 'Corpses'

//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.log(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 2) jez.log("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // If we don't have a CORPSE_EFFECT one needs to be added.
    //
    // const CORPSE_EFFECT = await jez.getActiveEffect(aActor.uuid, ef => ef.data.label === EFFECT_NAME, { traceLvl: 0 })
    let ceDesc = await jez.getCEDesc(aToken, EFFECT_NAME, { traceLvl: TL })
    // if (TL > 3) jez.log(`${TAG} existing CORPSE_EFFECT, if any`, CORPSE_EFFECT)
    if (TL > 3) jez.log(`${TAG} existing ceDesc, if any`, ceDesc)
    // if (!CORPSE_EFFECT) {
    if (!ceDesc) {
        // If we don't already have a corpses buff, lets place one 
        let corpseCnt = Math.floor(Math.random()) * 6 + 4
        const CE_DESC = `Corpses contained: ${corpseCnt}`
        let effectData = [{
            label: EFFECT_NAME,
            icon: aItem.img,
            origin: L_ARG.uuid,
            disabled: false,
            flags: {
                dae: { stackable: false },
                convenientDescription: CE_DESC,
                isConvenient: true,
                isCustomConvenient: true,
                core: { statusId: 'Force Display' }
            },
        }];
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: token.actor.uuid, effects: effectData });
        return postResults(`${corpseCnt} body sized bulges are apparent with the foliage of ${aToken.name}`)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Grab the corpse count from the CE_DESC of CORPSE_EFFECT.  If we have none remaining, exit.
    //
    // if (TL > 2) jez.log(`${TAG} CORPSE_EFFECT`, CORPSE_EFFECT)
    // if (TL > 2) jez.log(`${TAG} CORPSE_EFFECT.data`, CORPSE_EFFECT.data)
    // if (TL > 2) jez.log(`${TAG} CORPSE_EFFECT.data.flags`, CORPSE_EFFECT.data.flags)
    // if (TL > 2) jez.log(`${TAG} convenientDescription`, CORPSE_EFFECT.data.flags.convenientDescription)
    if (TL > 2) jez.log(`${TAG} convenientDescription`, ceDesc)
    // let corpseCnt = CORPSE_EFFECT.data.flags.convenientDescription.split(" ")[2];
    let corpseCnt = ceDesc.split(" ")[2];
    if (TL > 3) jez.log(`${TAG} corpse count`, corpseCnt)
    if (corpseCnt === 0) return postResults(`${aToken.name} has no aditional corpse to consume.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Present a checkbox dialog asking for the action to take with a corpse 
    //
    queryTitle = "Which Action to Perform?"
    queryText = `${aToken.name} can choose one of two actions to perform while consuming one of the ${corpseCnt} corpses it contains.`
    queryOpts = [
        `Heal: Regain 2d10 hit points. Equipment on the corpse is expelled from the corpse flower in its space.`,
        `Spawn: One zombie appears adjacent. The flower’s stench clings to it (see the Stench of Death trait).`
    ]
    const SELECTION = await jez.pickRadioListArray(queryTitle, queryText, () => { }, queryOpts);
    if (SELECTION === null) return jez.badNews(`Selected "Cancel" on dialog`, 'i')
    if (!SELECTION) return jez.badNews(`Didn't select any tokens to be acted on`, 'i')
    if (TL > 2) jez.log(`${TAG} selected`, SELECTION)
    //-------------------------------------------------------------------------------------------------------------------------------
    // If we have choosen to heal, perform that now.
    //
    if (SELECTION.startsWith('Heal:')) {
        await healSelf(aToken, { traceLvl: TL })
        await jez.wait(500)
        postResults(`A single corpse is consumed within ${aToken.name} and its equipment is expelled.`);
        // await jez.wait(500)

    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // If we have chosen to spawn, do so.
    //
    if (SELECTION.startsWith('Spawn:')) {
        await placeUndead(aToken, { traceLvl: TL })
        await jez.wait(500)
        postResults(`${aToken.name} expells a single corpse which it has animated.`);
        // await jez.wait(500)

    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the corpse count in the CE_DESC
    //
    if (TL > 3) jez.log(`${TAG} More Detailed Trace Info.`)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    // msg = `Say something useful...`
    postResults(msg)
    if (TL > 0) jez.log(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Regain 2d10 hit points 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function healSelf(aToken, options = {}) {
    const FUNCNAME = "placeUndead(aToken, options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "aToken", aToken, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    const DAM_TYPE = "healing";
    const DICE_NUM = 2;
    const DICE_TYPE = 'd10';
    const BONUS = 0;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Do the healing
    //
    let healDamage = new Roll(`${DICE_NUM}${DICE_TYPE} + ${BONUS}`).evaluate({ async: false });
    game.dice3d?.showForRoll(healDamage);   // Show 3D die on screen
    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, healDamage.total, DAM_TYPE, [aToken],
        healDamage, {
            flavor: `(${CONFIG.DND5E.healingTypes[DAM_TYPE]})`,
        itemCardId: args[0].itemCardId, useOther: false
    });
    await replaceHitsWithHeals();
    //-------------------------------------------------------------------------------------------------------------------------------
    //
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Replace first " hits" with " heals" on chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function replaceHitsWithHeals() {
    let chatmsg = game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatmsg.data.content);
    const searchString = / hits/g;
    const replaceString = `<p style="color:Green;"> Heals</p>`;
    content = await content.replace(searchString, replaceString);
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Place an zombie under control of the flower near the flower 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function placeUndead(aToken, options = {}) {
    const FUNCNAME = "placeUndead(aToken, options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "aToken", aToken, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    let spawn = "Zombie"
    //-------------------------------------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    let summonData = await game.actors.getName(spawn)
    if (TL > 2) jez.log(`${TAG} summonData`, summonData)
    if (!summonData) return jez.badNews(`Could not find ${spawn} template actor`, 'e')
    // Build the dataObject for our summon call, all we need to do is customize the name and elevation
    let argObj = {
        minionName: `${aToken.name}'s ${spawn}`,
        img: summonData?.img ?? aItem.img,
        defaultRange: 15    // Keep the up chucked undead kinda close
    }
    if (TL > 2) jez.log(`${TAG} argObj`, argObj)
    // Do the actual summon
    summonedMinionId = await jez.spawnAt(spawn, aToken, aActor, aItem, argObj)
    if (TL > 2) jez.log(`${TAG} summonedMinionId`, summonedMinionId)
    // Add our summons to combat tracker after summoner if in combat
    const ATOKEN_INIT_VALUE = aToken?.combatant?.data?.initiative
    if (TL > 1) jez.trace(`${TAG} ${aToken.name} initiative`, ATOKEN_INIT_VALUE);
    if (ATOKEN_INIT_VALUE) {
        const SPAWN_INT = ATOKEN_INIT_VALUE - 1 / 1000;
        await jez.combatAddRemove('Add', summonedMinionId[0], { traceLvl: TL })
        await jez.wait(250)
        await jez.combatInitiative(summonedMinionId[0], { formula: SPAWN_INT, traceLvl: 0 })
    }
    if (TL > 1) jez.log(`${TAG} --- Finished ---`);
}