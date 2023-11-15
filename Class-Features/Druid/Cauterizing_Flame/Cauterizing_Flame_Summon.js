const MACRONAME = "Cauterizing_Flame_Summon.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Call a token via warpgate which will be placed at the location specified by a crosshair. Two
 * abilities need to be edited to replace a magic word (%YOU%) with teh name of the summoning
 * token and a watchdog timeout effect needs to be added so the token removes itself at the end
 * of its duration.
 *
 * 11/14/23 0.1 Creation of Macro from Major_Image
 * 11/15/23 0.2 Use a character resource by name 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim of the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`=== Starting === ${MACRONAME} ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const L_ARG = args[args.length - 1];
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;
if (L_ARG.tokenId) aToken = canvas.tokens.get(L_ARG.tokenId);
else aToken = game.actors.get(L_ARG.tokenId);
let aActor = aToken.actor;
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = L_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
const MINION = `Spectral Flame`;
const DURATION = 60 // Seconds
const CLOCK_IMG = "Icons_JGB/Misc/alarm_clock.png"
const RESOURCE_NAME = L_ARG.item.name
const SPELL_NAME = L_ARG.item.name
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function postResults(msg) {
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is removed by DAE, set Off
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOff() {
    if (TL > 1) jez.trace("Token to dismiss", args[1])
    warpgate.dismiss(args[1], game.scenes.viewed.id)
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0]
    await jez.wait(100)
    if (TL === 1) jez.trace(`--- Starting --- ${MACRONAME} ${FNAME} ---`);

    //---------------------------------------------------------------------------------------------------
    // Ask if a resource should be consumed 
    //
    const Q_TITLE = `Consume ${RESOURCE_NAME} Resource?`
    let qText = `<p>${aToken.name} is using <b>${SPELL_NAME}</b> to summon a spectral flame.  This can 
    only be done as a reaction. The flame must be placed on just vanquished enemy. This typically 
    consumes one charge of <b>Spectral Flame.</b></p>
    <p>If you want to spend the charge (or use the NPC alternative), click <b>"Yes"</b>.</p>
    <p>If you want to bypass spending the charge (with GM permission) click <b>"No"</b>.</p>
    <p>If you want to cancel the spell click <b>"Close"</b> (top right of dialog).</p>`
    const SPEND_RESOURCE = await Dialog.confirm({ title: Q_TITLE, content: qText, });
    if (SPEND_RESOURCE === null) return jez.badNews(`${SPELL_NAME} cancelled by player.`, 'i')
    //---------------------------------------------------------------------------------------------------
    // Deal with casting resource -- this needs to consider NPC and PC data structures
    //
    if (SPEND_RESOURCE) {
        if (TL > 1) jez.trace(`${TAG} Time to use a resource`)
        let spendResult = await jez.resourceSpend(aActor.uuid, RESOURCE_NAME, aItem.uuid, { traceLvl: TL, quiet: false })
        if (!spendResult) return jez.badNews(`${SPELL_NAME} cancelled for lack of ${RESOURCE_NAME}`, 'w')
    }

    //--------------------------------------------------------------------------------------
    // Perform the actual summon
    //
    let summonedID = await summonSpectralFlame({ traceLvl: TL })
    if (!summonedID) {  // Something went sideways
        if (TL > 3) jez.trace(`${FNAME} | aToken`, aToken)
        if (TL > 3) jez.trace(`${FNAME} | aActor`, aActor)
        //   jezcon.remove("Concentrating", aToken.actor.uuid, { traceLvl: TL });
        return false
    }
    let summonedUuid = `Scene.${game.scenes.viewed.id}.Token.${summonedID}`
    //--------------------------------------------------------------------------------------------------
    // Add an effect to our recently summoned token to delete itself at the end of the spell duration
    //
    const CE_DESC = `Summoned ${MINION} will remain for up to a minute`
    const GAME_RND = game.combat ? game.combat.round : 0;
    let effectData = {
        label: aItem.name,
        icon: CLOCK_IMG,
        origin: L_ARG.uuid,
        disabled: false,
        duration: {
            rounds: DURATION / 6, startRound: GAME_RND,
            seconds: DURATION, startTime: game.time.worldTime,
            token: aToken.uuid, stackable: false
        },
        flags: {
            convenientDescription: CE_DESC
        },
        changes: [
            { key: `macro.execute`, mode: jez.CUSTOM, value: `Dismiss_Tokens ${summonedUuid}`, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: summonedUuid, effects: [effectData] });
    //-----------------------------------------------------------------------------------------------
    // post summary effect message
    //
    msg = `${aToken.name} creates a spectral flame.<br><br>
    See:&nbsp;<a href="https://www.dndbeyond.com/classes/druid#:~:text=your%20wildfire%20spirit.-,Cauterizing%20Flames,-10th%2Dlevel%20Circle"
    target="_blank" rel="noopener">
    D&amp;D Beyond Description</a> for details.`
    postResults(msg)
    if (TL > 1) jez.trace(`--- Finished --- ${MACRONAME} ${FNAME} ---`);
    return true;
}
/***************************************************************************************************
 * Summon the minion and update
 ***************************************************************************************************/
async function summonSpectralFlame(options = {}) {
    const FUNCNAME = "summonSpectralFlame(options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.log(`${TAG} --- Starting ---`);
    if (TL > 1) jez.log(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    //--------------------------------------------------------------------------------------------------
    // Nab the data for our soon to be summoned critter.  It will have actions that need to be updated
    //
    let summonData = await game.actors.getName(MINION)
    if (TL > 2) jez.log(`${TAG} summonData`, summonData)
    //-----------------------------------------------------------------------------------------------
    //
    let argObj = {
        allowedColorsIntro: null,
        allowedColorsOutro: null,
        allowedUnits: ["", "ft", "any"],
        colorIntro: "*",
        colorOutro: "*",
        defaultRange: 30,
        duration: 1000,                     // Duration of the introVFX
        introTime: 1000,                    // Amount of time to wait for Intro VFX
        introVFX: '~Explosion/Explosion_*_${color}_400x400.webm', // default introVFX file
        name: "Summoning",                  // Name of action (message only), typically aItem.name
        opacity: 1,                         // Opacity for the VFX
        options: { controllingActor: aActor }, // Aledgedly hides an open character sheet
        outroVFX: '~Smoke/SmokePuff01_01_Regular_${color}_400x400.webm', // default outroVFX file
        scale: 0.7,                         // Scale for the VFX
        snap: -1,                           // Snap value passed to jez.warpCrosshairs
        source: aToken,  // Coords for source (within center), typically aToken
        suppressTokenMold: 2000,            // Time (in ms) to suppress TokenMold's renaming setting
        templateName: `%${MINION}%`,
        traceLvl: 0,
        updates: {
            actor: { name: `${aToken.name}'s ${MINION}` },
            token: { name: `${aToken.name}'s ${MINION}` },
            embedded: { Item: {} },
        },
        waitForSuppress: 100,               // Time (in ms) to wait of for Suppression to being
        width: 1                            // Width of token to be summoned
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Push the items for this actor into an array so all of teh descriptions can be scanned for %YOU% which needs uypdated.
    //
    const itemArray = Array.from(summonData.data.items)
    if (TL > 2) jez.log(`${TAG} itemArray`, itemArray)
    for (let i = 0; i < itemArray.length; i++) {
        if (TL > 2) jez.log(`${TAG} Item ${i}`, itemArray[i])
        if (TL > 3) jez.log(`${TAG} Item ${i}`, itemArray[i].data.data.description)
        let a = jez.replaceSubString(itemArray[i].data.data.description.value, 'ATOKEN.NAME', aToken.name, '%').string
        argObj.updates.embedded.Item[itemArray[i].data.name] = { data: { description: { value: a } } }
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build updates data field to replace %YOU% in the attack descriptions
    //
    if (TL > 1) jez.trace(`${TAG} argObj.updates ==> `, argObj.updates)
    //--------------------------------------------------------------------------------------------------
    // Use the data for our soon to be summoned critter so we can have the right image (img) and use it
    // to update the img attribute or set basic image to match this item
    //
    argObj.img = summonData ? summonData.img : aItem.img
    //--------------------------------------------------------------------------------------------------
    // Do the actual summon
    //
    return jez.spawnAt(MINION, aToken, aActor, aItem, argObj)
}