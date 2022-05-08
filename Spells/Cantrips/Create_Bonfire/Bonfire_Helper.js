const MACRONAME = "Bonfire_Helper.0.1.js"
/*****************************************************************************************
 * Intended to be called to apply the damage element of an active Aura attached to 
 * Create Bonfire spell. 
 * 
 * 05/06/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
if (args[0] === "off") return;           // DAE removal
jez.log("---------------------------------------------------------------------------",
    `Starting ${MACRONAME}`,MACRO);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let msg = "";
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
//if (args[0] === "off") await doOff();         // DAE removal
if (args[0] === "on") await doOn();           // DAE Application
jez.log("---------------------------------------------------------------------------",
    "Finished", `${MACRONAME}`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    jez.log(`Active Token, ${aToken.name}`, aToken)
    const DAMAGE_DICE = args[1]
    const SAVE_DC     = args[2]
    const SAVE_TYPE   = "dex"
    const FLAVOR      = "flavor text"
    const DAMAGE_TYPE = "fire"
    let save = (await aActor.rollAbilitySave(SAVE_TYPE, { flavor: FLAVOR, chatMessage: true, 
        fastforward: true }));
    //jez.log("save", save)
    let damageRoll = new Roll(`${DAMAGE_DICE}`).evaluate({async:false});
    //jez.log("damageRoll before save",damageRoll)
    let saveMsg = `Save failed with a ${save.total}, needed ${SAVE_DC}.`
    if (save.total >= SAVE_DC) {
        //jez.log("The save is GOOD!", save.total)
        let saveDamage = Math.floor(damageRoll.total/2)
        damageRoll = new Roll(`${saveDamage}`).evaluate({async:false});
        saveMsg = `Save succeeded with a ${save.total}, needed ${SAVE_DC}.`
    }
    //jez.log("damageRoll after save",damageRoll)
    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, DAMAGE_TYPE,
        [aToken], damageRoll,
        { flavor: `Flavor ${DAMAGE_TYPE}`, itemCardId: "new", itemData: aItem, useOther: false });

    msg = `The Bonfire inflicted ${damageRoll.total} fire damage (before resistaces).  `    
    jez.postMessage({
        color: "FireBrick",
        fSize: 13,
        icon: "Icons_JGB/Misc/campfire.svg",
        msg: `The Bonfire inflicted ${damageRoll.total} fire damage (before resistaces). ${saveMsg}`,
        title: `Ouch! ${aToken.name} burns...`,
        token: aToken
    })
    jez.log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}