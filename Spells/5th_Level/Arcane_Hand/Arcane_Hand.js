const MACRONAME = "Arcane_Hand.0.4.js"
/*****************************************************************************************
 * Summon aand customize an Arcane Hound to the scene
 *  
 * - Summon with WarpGate
 * - Modify Bite ability to have correct to-hit bonus
 * - Delete summon when effect on original caster is removed (or expires)
 * 
 * 02/11/22 0.1 Creation of Macro
 * 07/15/22 0.2 Update to use warpgate.spawnAt with range limitation
 * 07/17/22 0.3 Update to use jez.spawnAt (v2) for summoning
 * 08/02/22 0.4 Add convenientDescription
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
const TL = 0;
//----------------------------------------------------------------------------------
// Setup some specific global values
//
const MINION = `Arcane Hand`;
let colorArray = ["Blue", "Green", "Purple", "Rainbow", "Red", "Grey"];
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    for (let i = 1; i < args.length - 1; i++) {
        jez.log(`  args[${i}]`, args[i]);
        await jez.wait(250)
        warpgate.dismiss(args[i], game.scenes.viewed.id)
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    // if (!await preCheck()) return (false);
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    await popColorDialog();
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Pop a Radio Button Dialog to select the color of the hand to be used.
 ***************************************************************************************************/
async function popColorDialog() {
    const queryTitle = "What Color Should Hand Be?"
    const queryText = `Select one color that should be used for the Arcane Hand.`
    jez.pickRadioListArray(queryTitle, queryText, pickColorCallBack, colorArray);
}
/***************************************************************************************************
 * Process the callback from dialog and fork to correct function to apply effect
 ***************************************************************************************************/
async function pickColorCallBack(selection) {
    if (!selection) popColorDialog()          // Try again if no selection made
    else {
        let color = selection
        if (color === "Grey") color = "Rock01" // Rock is the only 'color' with a suffix
        let houndInfo = await summonHand(color)
        addWatchdogEffect(houndInfo);
        msg = `<b>${aToken.name}</b> has summoned a ${selection} arcane hand that will serve for the 
    duration of the spell.`
        postResults(msg)
    }
}
/***************************************************************************************************
 * Summon the minion and update HP
 * 
 * https://github.com/trioderegion/warpgate
 ***************************************************************************************************/
async function summonHand(color) {
    const CAST_MOD = jez.getCastMod(aToken);
    const CHAR_LVL = jez.getCharLevel(aToken);
    const MAX_HP = aActor.data.data.attributes.hp.max
    const NAME = `${aToken.name}'s Arcane Hand`
    const SPELL_LVL = args[0].spellLevel
    const FIST_DAM = `${4 + (SPELL_LVL - 5) * 2}d8`
    const GRASP_DAM = `${2 + (SPELL_LVL - 5) * 2}d6 + ${CAST_MOD}`
    const CAST_STAT = aActor.data.data.abilities[jez.getCastStat(aToken)].value
    let updates = {
        token: {
            name: NAME,
            img: `modules/jb2a_patreon/Library/5th_Level/Arcane_Hand/ArcaneHand_Human_01_Idle_${color}_400x400.webm`,
        },
        actor: {
            name: NAME,
            img: `modules/jb2a_patreon/Library/5th_Level/Arcane_Hand/ArcaneHand_Human_01_Idle_${color}_Thumb.webp`,
            'data.attributes.hp': {
                formula: MAX_HP,
                max: MAX_HP,
                value: MAX_HP,
            },
            'data.details.cr': CHAR_LVL,            // Set CR to make hands proficency bonus match the casters
            'data.abilities.int.value': CAST_STAT,  // Make hand's cast stat match casters
        },
        embedded: {
            Item: {
                "Clenched Fist": {
                    'data.damage.parts': [[FIST_DAM, "force"]],
                    'data.attackBonus': `${CAST_MOD}[mod]`,
                    img: `modules/jb2a_patreon/Library/5th_Level/Arcane_Hand/ArcaneHand_Human_01_Idle_${color}_Thumb.webp`,
                },
                "Forceful Hand": {
                    img: `modules/jb2a_patreon/Library/5th_Level/Arcane_Hand/ArcaneHand_Human_01_Idle_${color}_Thumb.webp`,
                },
                "Grasping Hand": {
                    'data.damage.versatile': GRASP_DAM,
                    img: `modules/jb2a_patreon/Library/5th_Level/Arcane_Hand/ArcaneHand_Human_01_Idle_${color}_Thumb.webp`,
                },
                "Interposing Hand": {
                    img: `modules/jb2a_patreon/Library/5th_Level/Arcane_Hand/ArcaneHand_Human_01_Idle_${color}_Thumb.webp`,
                },
            }
        }
    }
    //--------------------------------------------------------------------------------------------------
    // Portals need the same color for pre and post effects, so get that set here. Grey and Rainbow need
    // special treatment as no "good" choice exists.
    //
    let darkColors = []
    let brightColors = []
    const PORTAL_COLORS = ["Bright_Blue", "Dark_Blue", "Dark_Green", "Dark_Purple", "Dark_Red",
        "Dark_RedYellow", "Dark_Yellow", "Bright_Green", "Bright_Orange", "Bright_Purple", "Bright_Red",
        "Bright_Yellow"]
    for (COLOR of PORTAL_COLORS) {
        if (COLOR.startsWith("Bright")) brightColors.push(COLOR)
        if (COLOR.startsWith("Dark")) darkColors.push(COLOR)
    }
    switch (color) {
        case "Blue": portalColor = "Bright_Blue"; break;
        case "Green": portalColor = "Bright_Green"; break;
        case "Purple": portalColor = "Bright_Purple"; break;
        case "Red": portalColor = "Bright_Red"; break;
        case "Grey":
            const DINDEX = Math.floor(Math.random() * darkColors.length);
            portalColor = darkColors[DINDEX];
            break;
        default: // Ranbow or anything I missed"
            const BINDEX = Math.floor(Math.random() * brightColors.length);
            portalColor = brightColors[BINDEX];
    }
    //--------------------------------------------------------------------------------------------------
    // Build the dataObject for our summon call
    //
    let argObj = {
        defaultRange: 120,                  // Defaults to 30, but this varies per spell
        duration: 4000,                     // Duration of the intro VFX
        img: aItem.img,                     // Image to use on the summon location cursor
        introTime: 250,                     // Amount of time to wait for Intro VFX
        introVFX: `~Portals/Portal_${portalColor}_H_400x400.webm`, // default introVFX file
        name: aItem.name,                   // Name of action (message only), typically aItem.name
        outroVFX: `~Portals/Masked/Portal_${portalColor}_H_NoBG_400x400.webm`, // default outroVFX file
        scale: 0.8,	         				
        source: aToken,                     // Coords for source (with a center), typically aToken
        updates: updates,
        width: 2,                           // Width of token to be summoned, 1 is the default
        traceLvl: 0                         // Trace level, matching calling function decent choice
    }
    //-----------------------------------------------------------------------------------------------
    // Return while executing the summon
    //
    return (await jez.spawnAt(MINION, aToken, aActor, aItem, argObj))
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
async function addWatchdogEffect(tokenIdArray) {
    let tokenIds = ""
    const EXPIRE = ["longRest"];
    const GAME_RND = game.combat ? game.combat.round : 0;
    const CE_DESC = `Arcane Hand is Active`
    // Build list of token IDs seperated by spaces
    for (let i = 0; i < tokenIdArray.length; i++) tokenIds += `${tokenIdArray[i]} `
    let effectData = {
        label: aItem.name,
        icon: aItem.img,
        origin: LAST_ARG.uuid,
        disabled: false,
        duration: { rounds: 4800, startRound: GAME_RND, seconds: 28800, startTime: game.time.worldTime },
        flags: { 
            dae: { macroRepeat: "none", specialDuration: EXPIRE }, 
            convenientDescription: CE_DESC
        },
        changes: [
            { key: `macro.itemMacro`, mode: jez.ADD, value: tokenIds, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: [effectData] });
}