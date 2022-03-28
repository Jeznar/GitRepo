const MACRONAME = "Blight.js"
/*****************************************************************************************
 * This one is a simple damage macro, but the amount of damage varies with the type of the 
 * target.
 * 
 *   Necromantic energy washes over a creature of your choice that you can see within 
 *   range, draining moisture and vitality from it. 
 * 
 *   This spell has no effect on undead or constructs.
 * 
 *   The target must make a Constitution saving throw. The target takes 8d8 necrotic damage 
 *   on a failed save, or half as much damage on a successful one. 
 * 
 *   If you target a plant creature or a magical plant, it makes the saving throw with 
 *   disadvantage, and the spell deals maximum damage to it.
 * 
 *   If you target a nonmagical plant that isn't a creature, such as a tree or shrub, it 
 *   doesn't make a saving throw, it simply withers and dies.
 * 
 *   Higher Level .When you cast this spell using a spell slot of 5th level or higher, the 
 *   damage increases by 1d8 for each slot level above 4th.
 * 
 * 03/28/22 0.1 Creation of Macro
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
const DICE_NUM = 4 + LAST_ARG.spellLevel
const DICE_TYPE = "d8"
const DICE_MAX = 8
//--------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
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
    return(true)
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let immuneRaces = ["undead", "construct"];  // Set strings that define immune races
    let vulnerableRaces = ["plant"]             // Strings that define vulnerable races
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------
    // Run the preCheck function to make sure things are setup as best I can check them
    //
    if (!preCheck()) return;
    //-----------------------------------------------------------------------------------------------
    // If target is immune type, post appropriate message and exit
    //
    if (checkType(tToken, immuneRaces)) {
        msg = `${tToken.name} appears to be unaffected by ${aItem.name}.`
        postResults(msg);
        return (false);
    }
    //-----------------------------------------------------------------------------------------------
    // Launch our VFX
    //
    jez.runRuneVFX(tToken, jez.getSpellSchool(aItem))
    //-----------------------------------------------------------------------------------------------
    // If target is vulnerable type, store that for later use
    //
    let vulnerableType = checkType(tToken, vulnerableRaces)
    //-----------------------------------------------------------------------------------------------
    // Roll saving throw, disadvantage if vulnerable
    //
    const SAVE_TYPE = "con"
    const SAVE_DC = aToken.actor.data.data.attributes.spelldc;
    let flavor = `<b>${tToken.name}</b> attempts ${CONFIG.DND5E.abilities[SAVE_TYPE]} <b>DC${SAVE_DC}</b> 
    save to reduce damage from <b>${aItem.name}</b>`;
    let optionsObj = { flavor: flavor, chatMessage: true, fastforward: true }
    if (vulnerableType) {
        optionsObj = { disadvantage: true, flavor: flavor, chatMessage: true, fastforward: true }
        flavor += " at disadvantage"
    }
    let save = (await tToken.actor.rollAbilitySave(SAVE_TYPE, optionsObj));
    //-----------------------------------------------------------------------------------------------
    // Roll damage 
    //
    const DAMAGE_TYPE = "necrotic"
    let damageRollObj = {}
    if (vulnerableType) damageRollObj = new Roll(`${DICE_NUM}*${DICE_MAX}`).evaluate({ async: false });
    else damageRollObj = new Roll(`${DICE_NUM}${DICE_TYPE}`).evaluate({ async: false });
    game.dice3d?.showForRoll(damageRollObj);
    jez.log(` Damage Total: ${damageRollObj.total} Type: ${DAMAGE_TYPE}`);
    //-----------------------------------------------------------------------------------------------
    // Create a fake roll, fudged to come up with half the damage for when target saves
    //
    let damageRollSaveObj = new Roll(`floor(${damageRollObj.total}/2)`).evaluate({ async: false });
    let damObj = damageRollObj
    if (save.total >= SAVE_DC) damObj = damageRollSaveObj
    jez.log("damage roll", damageRollObj)
    //damageRollObj.result = 12
    new MidiQOL.DamageOnlyWorkflow(aToken.actor, aToken, damageRollObj.total, DAMAGE_TYPE, [tToken],
        damObj, {
            flavor: `${tToken.name} withers on hit from ${aItem.name}`,
        itemCardId: args[0].itemCardId
    });
    msg = `Vulnerable Race: ${vulnerableType} `
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
 }
/***************************************************************************************************
 * Determine if passed token is of one of the types to check against, returning True if found
 ***************************************************************************************************/
function checkType(token5e, typeArray) {
    // COOL-THING: Checks race against an array of races or types, for PC and NPC
    let tokenRace = token5e.actor.data.data.details.race;   // Shorten subsequent lines for Target Details Race
    let tokenType = token5e.actor.data.data.details.type;   // Shorten subsequent lines for Target Details Type
    //-----------------------------------------------------------------------------------------------
    // Check to see if we have an immune or vulnerable creature type to deal with
    //
    let foundType = false;
    if (token5e.actor.data.type === "character") {
        jez.log(`${token5e.name} is a PC`, token5e);
        if (tokenRace) {
            //jez.log("PC Race", tokenRace)
            for (let entity of typeArray) {
                if (tokenRace.toLowerCase().includes(entity.toLowerCase())) {
                    // jez.log(`${token5e.name}'s race is ${entity}`);
                    foundType = true;
                }
            }
        } // else jez.log(`${token5e.name} has no race`, token5e);
    } else {
        // jez.log(`${token5e.name} is an NPC`, token5e);
        //--------------------------------------------------------------------------------------
        // Loop through each creature type found in the typeArray array.
        //
        for (let entity of typeArray) {
            // jez.log(`Checking against ${entity}`);
            // If the creature type is custom...
            if (tokenType.value.toLowerCase() === "custom") {
                // jez.log(` Beginning custom type Checker`);
                // Check custom creature type against our typeArray collection
                if (tokenType.custom.toLowerCase().includes(entity.toLowerCase())) {
                    // jez.log(` Found a dirty ${entity} spy.`, entity);
                    foundType = true;
                }
            } //else jez.log(` ${token5e.name} does not have a custom race -- ${tokenType.value}`);
            // If the creature has a subtype...
            if (!tokenType.subtype == "") {
                // if(tokenType.subtype) {
                // If the creature's subtype is found in the typeArray collection...
                if (tokenType.subtype.toLowerCase() === entity.toLowerCase()) {
                    // jez.log(" Beginning subtype Checker");

                    // Check creature Subtypes for the types in our typeArray collection.
                    if (tokenType.custom.toLowerCase().includes(entity.toLowerCase())) {
                        // jez.log(" Found a sneaky subtype.");
                        foundType = true;
                    }
                }
            } //else jez.log(` ${token5e.name} does not have a subtype`);
            // Check creature type against our typeArray collection.
            if (entity.toLowerCase() === tokenType.value.toLowerCase()) {
                // jez.log(` target's npc type is ${entity}`);
                foundType = true;
            } //else jez.log(` ${token5e.name} vulnerable npc type is ${tokenType.value}`);
        }
    }
    return (foundType)
}