const MACRONAME = "Shillelagh.0.4.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Create/manage a limited duration item for the Shillelagh spell
 * 
 * Description: The wood of a club or quarterstaff you are holding is imbued with nature's 
 *   power. For the duration, you can use your spellcasting ability instead of Strength 
 *   for the attack and damage rolls of melee attacks using that weapon, and the weapon's 
 *   damage die becomes a d8. The weapon also becomes magical, if it isn't already. The 
 *   spell ends if you cast it again or if you let go of the weapon.
 * 
 * 12/31/21 0.1 Creation of Macro
 * 05/17/22 0.2 Update for Foundry 9.x and VFX
 * 08/02/22 0.3 Add convenientDescription
 * 12/10/22 0.4 Updated logging to quiet the log and used library functions
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
const EFFECT_NAME = "Shillelagh"
const EFFECT_ICON = "Icons_JGB/Weapons/quarterstaff-shillelagh.jpg"
const MACRO_HELPER = `${MACRO}_Helper_DAE`;
let attackItem = "Shillelagh";
let baseWeapon = ""; // The base weapon turned into a Shillelagh
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          // Midi ItemMacro On Use
if (args[0] === "off") await doOff({traceLvl:TL});                   // DAE removal
//-----------------------------------------------------------------------------------------------------------------------------------
// All Done
//
if (TL>1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 * Return false if the spell failed.
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
    // Initial checks and settings
    //
    if (!game.macros.getName(MACRO_HELPER)) return jez.badNews(`${TAG} Could not locate required macro: ${MACRO_HELPER}`)
    let clubD = await jez.itemFindOnActor(aToken, "Club", "weapon");
    // if (hasItem("Club", aActor)) baseWeapon = "Club"
    if (clubD) baseWeapon = "Club"
    let staffD = await jez.itemFindOnActor(aToken, "Quarterstaff", "weapon");
    // if (hasItem("Quarterstaff", aActor)) baseWeapon = "Quarterstaff"
    if (staffD) baseWeapon = "Quarterstaff"
    if (!baseWeapon) return jez.badNews(`${TAG} ${aToken.name} has nether a Quarterstaff nor Club. Spell Failed.`,'w')
    await jez.deleteItems(`${attackItem} Club`, "weapon", aActor);
    await jez.deleteItems(`${attackItem} Quarterstaff`, "weapon", aActor);
    //-------------------------------------------------------------------------------------------------------------------------------
    // If the buff already exists, remove it before adding another one
    //
    let existingEffect = aActor.effects.find(ef => ef.data.label === EFFECT_NAME) ?? null;
    if (existingEffect) await existingEffect.delete();
    //-------------------------------------------------------------------------------------------------------------------------------
    // Launch Rune VFX
    //
    jez.runRuneVFX(aToken, jez.getSpellSchool(aItem))
    //-------------------------------------------------------------------------------------------------------------------------------
    // Set base weapon dependent variables
    //
    let descValue = ""
    let damVersatile = ""
    let propVer = "false"
    attackItem += " " + baseWeapon;

    if (baseWeapon === "Club") {
        descValue = `The wood of the club you are holding is imbued with nature's power. 
            For the duration, you can use your spellcasting ability instead of Strength 
            for the attack and damage rolls of melee attacks using that weapon, and the 
            weapon's <b>damage die becomes a d8</b>. 
            <br><br>The weapon also becomes <b>magical</b>.`
    }
    if (baseWeapon === "Quarterstaff") {
        descValue = `The wood of the quarterstaff you are holding is imbued with nature's power. 
           For the duration, you can use your spellcasting ability instead of Strength 
           for the attack and damage rolls of melee attacks using that weapon, and the 
           weapon's <b>damage die becomes a d8</b>.
           <br><br><b>Houserule</b>: It keeps versatile property, damage die becomes a d10. 
           <br><br>The weapon also becomes <b>magical</b>.`
        damVersatile = "1d10+@mod"
        propVer = "true"
    }
    if (TL>1) jez.trace(`${TAG} --- Weapon Properties ---`,
        "propVer     ", propVer,
        "damVersatile", damVersatile,
        "descValue   ", descValue)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Create an effect on the caster to trigger the doOff action to remove temp weap
    //
    const CE_DESC = `Held Staff or Club is imbued with nature's power.`
    let gameRound = game.combat ? game.combat.round : 0;
    let value = `${MACRO_HELPER} "${attackItem}"`;
    let effectData = {
        label: MACRO,
        icon: EFFECT_ICON,
        origin: aActor.uuid,
        disabled: false,
        flags: { 
            convenientDescription: CE_DESC
        },
        duration: { rounds: 10, turns: 10, startRound: gameRound, seconds: 60, startTime: game.time.worldTime },
        changes: [
            { key: "macro.execute", mode: jez.CUSTOM, value: value, priority: 20 },
            // { key: `macro.itemMacro`, mode: jez.ADD, value: `Not Used`, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
    if (TL>1) jez.trace(`${TAG} applied ${MACRO} effect`, effectData);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build the item data for the action to be created, a new weapon in inventory
    //
    let itemData = [{
        "name": attackItem,
        "type": "weapon",
        "data": {
            "source": "Casting Shillelagh",
            "ability": "",
            "ability": aActor.data.data.attributes.spellcasting,
            "description": {
                "value": descValue
            },
            "actionType": "mwak",
            "attackBonus": 0,
            "damage": {
                "parts": [[`1d8+@mod`, `bludgeoning`]],  // Set base damage
                "versatile": damVersatile               // Set vesatile damage (Houserule)
            },
            "equipped": true,
            "formula": "",
            "properties": {
                "mgc": "true",  // Mark the new item as magic
                "ver": propVer  // Mark the new item as versatile or not (Houserule)
            }
        },
        "img": EFFECT_ICON,
        "effects": []
    }];
    await aActor.createEmbeddedDocuments("Item", itemData);
    msg = `<p style="color:green;font-size:14px;">
        <b>${aToken.name}</b>'s ${baseWeapon} is wreathed in dim green glow and sprouts 
        magical vines and thorns making it a fearsome weapon.</p>
        <p><b>FoundryVTT</b>: Use newly created item <b>${attackItem}</b> in INVENTORY 
        tab to attack with the temporary weapon.</p>`
    postResults(msg);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pop a system notification about the item being added to inventory.
    //
    msg = `Created "${attackItem}" in inventory.  It can now be used for melee attacks.`
    ui.notifications.info(msg);
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return (true);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Post the results to chat card
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
    await jez.deleteItems(`${attackItem} Club`, "weapon", aActor);
    await jez.deleteItems(`${attackItem} Quarterstaff`, "weapon", aActor);
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}