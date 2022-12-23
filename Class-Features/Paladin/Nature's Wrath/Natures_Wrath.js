const MACRONAME = "Natures_Wrath.0.5.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Implement Nature's Wrath
 * 
 * Description: You can use your Channel Divinity to invoke primeval forces to ensnare a foe.
 *   As an action, you can cause spectral vines to spring up and reach for a creature within 
 *   10 feet of you that you can see. The creature must succeed on a Strength or Dexterity 
 *   saving throw (its choice) or be restrained. While restrained by the vines, the creature 
 *   repeats the saving throw at the end of each of its turns. On a success, it frees itself 
 *   and the vines vanish.
 * 
 * This will need an OnUse and a Each execution.
 * 
 * 12/21/21 0.1 JGB Creation
 * 12/24/21 0.2 JGB Incorporate ideas from times_up_sample#1.0.1 and making this a DAE thing
 * 12/26/21 0.3 JGB Seemingly working version
 * 10/21/22 0.4 JGB FoundryVTT 9 fix: Swap deleteEmbeddedEntity for deleteEmbeddedDocuments
 * 12/15/22 0.5 JGB Update style and add call to resourceSpend 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL>0) jez.trace(`${TAG} === Starting ===`);
if (TL>1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
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
const EFFECT_NAME = "Restrained"
const DEBUFF_NAME = "Restrained by Nature's Wrath" // aItem.name || "Nature's Wraith";
const DEBUFF_ICON = "modules/combat-utility-belt/icons/restrained.svg"
const SAVE_DC = aActor.data.data.attributes.spelldc;
const VFX_NAME = `${MACRO}-${aToken.id}`
const SPELL_NAME = `Nature's Wraith`
const RESOURCE_NAME = "Channel Divinity";
let spendResource
//-------------------------------------------------------------------------------
// Depending on where invoked call appropriate function to do the work
//
if (args[0]?.tag === "OnUse") doOnUse({traceLvl:TL});   			    // Midi ItemMacro On Use
if (args[0] === "off") await doOff({traceLvl:TL});                   // DAE removal
if (TL>1) jez.trace(`${TAG} === Finished ===`);
return;
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
 async function preCheck() {
    if (args[0].targets.length !== 1)
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`, 'w')
    return true
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Execute code for a ItemMacro onUse
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Make sure exactly one token was targeted
    //
    if (!await preCheck()) return(false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-------------------------------------------------------------------------------------------------------------------------------
    // Ask if a resource should be consumed 
    //
    const Q_TITLE = `Consume Resource?`
    let qText = `<p>${aToken.name} is using <b>${SPELL_NAME}</b> to attempt to restrain ${aToken.name} This typically
    consumes a <b>${RESOURCE_NAME}</b> charge.</b></p>
    <p>If you want to spend the charge (or use the NPC alternative), click <b>"Yes"</b>.</p>
    <p>If you want to bypass spending the charge (with GM permission) click <b>"No"</b>.</p>
    <p>If you want to cancel the spell click <b>"Close"</b> (top right of dialog).</p>`
    spendResource = await Dialog.confirm({ title: Q_TITLE, content: qText, });
    if (TL > 1) jez.trace(`${TAG} spendResource`, spendResource)
    if (spendResource === null) return jez.badNews(`${SPELL_NAME} cancelled by player.`, 'i')
    //-------------------------------------------------------------------------------------------------------------------------------
    // Handle spending of the resource
    //
    if (spendResource) {
        if (TL > 1) jez.trace(`${TAG} Time to use a resource`)
        let spendResult = await jez.resourceSpend(aActor.uuid, RESOURCE_NAME, aItem.uuid, { traceLvl: TL, quiet: false })
        if (!spendResult) return jez.badNews(`${SPELL_NAME} cancelled for lack of ${RESOURCE_NAME}`, 'i')
    }
    //------------------------------------------------------------------------------------------------------------------------------
    // Determine target's prefered stat for the save
    //
    const TAR_DEX_SAVE_MOD = tToken.actor.data.data.abilities.dex.save;
    const TAR_STR_SAVE_MOD = tToken.actor.data.data.abilities.str.save;
    const SAVE_TYPE = (TAR_DEX_SAVE_MOD > TAR_STR_SAVE_MOD) ?  "dex" : "str";
    //-------------------------------------------------------------------------------------------------------------------------------
    // Perform save
    //
    const FLAVOR = `${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> to remove <b>${DEBUFF_NAME}</b> effect`;
    if (TL>1) jez.trace(`${TAG} ---- Save Information ---`,"SAVE_TYPE",SAVE_TYPE,"SAVE_DC",SAVE_DC,"FLAVOR",FLAVOR);
    let save = (await tActor.rollAbilitySave(SAVE_TYPE, { flavor: FLAVOR, chatMessage: true, fastforward: true })).total;
    if (TL>1) jez.trace(`${TAG} save`,save);
    //-------------------------------------------------------------------------------------------------------------------------------
    // If save failed add effect
    //
    if (save < SAVE_DC) {
        if (TL > 1) jez.trace(`${TAG} save was failed with a ${save}`);
        //---------------------------------------------------------------------------------------------------------------------------
        // Modify the EFFECT_NAME condition to include an Overtime save element and apply
        //
        let statMod = jez.getStatMod(aToken, "str")
        let effectData = game.dfreds.effectInterface.findEffectByName(EFFECT_NAME).convertToObject();
        const OVERTIME = `turn=end,label=Save against ${DEBUFF_NAME},saveDC=${SAVE_DC},saveAbility=${SAVE_TYPE},saveRemove=true,saveMagic=true,rollType=save`
        await effectData.changes.push(
            { key: 'flags.midi-qol.OverTime', mode: jez.OVERRIDE, value: OVERTIME, priority: 20 },
            { key: `macro.itemMacro`, mode: jez.CUSTOM, value: `SAVE_DC ${SAVE_DC}`, priority: 20 },
        )
        effectData.name = DEBUFF_NAME
        game.dfreds.effectInterface.addEffectWith({ effectData: effectData, uuid: tToken.actor.uuid, origin: aItem.uuid });
        //---------------------------------------------------------------------------------------------------------------------------
        // Fire Up that VFX
        //
        runVFX(tToken)
    } else {
        postResults(`${tToken.name} avoids spectral vines that spring up and grasping for him/her. The vines quickly fade away.`);
        if (TL > 1) jez.trace(`${TAG} save succeeded with a ${save}`);
        return
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Thats all folks
    //
    msg = `${aToken.name} invokes primeval forces to ensnare a foe. Spectral vines spring up and reach for ${tToken.name}, 
    restraining it.`
    postResults(msg);
    if (TL>0) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is removed by DAE, set Off
 * This runs on actor that has the affected removed from it.
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 async function doOff(options={}) {
    const FUNCNAME = "doOff(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    if (await Sequencer.EffectManager.endEffects({ name: VFX_NAME })) {
        if (TL>1) jez.trace(`${TAG} Removed existing VFX ${VFX_NAME} from ${aToken.name}`)
    }
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Launch the VFX effect on affected Token
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/ 
 async function runVFX(token) {
    //----------------------------------------------------------------------------------------------
    // Apply new VFX
    //
    new Sequence()
       .effect()
       .file('modules/jb2a_patreon/Library/1st_Level/Entangle/Entangle_01_Yellow_400x400.webm')
       .attachTo(token)
       .scaleToObject(1.2)
       .opacity(0.7)
       .persist()
       .name(`${MACRO}-${token.id}`)    // Give the effect a uniqueish name
       .fadeIn(1000)           // Fade in for specified time in milliseconds
       .fadeOut(1000)          // Fade out for specified time in milliseconds
       .play();   
}


