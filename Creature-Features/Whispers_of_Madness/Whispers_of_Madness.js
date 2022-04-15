const MACRONAME = "Whispers_of_Madness.js"
/*****************************************************************************************
 * Implments the Allip's ability of same name.  Assuming that the user has trageted 1-3
 * tokens before this macro is invoked as an OnUse.
 * 
 *   Choose up to three creatures that can be seen within 60 feet. Each target must 
 *   succeed on a DC 14 Wisdom saving throw, or it takes 7 (1d8 + 3) psychic damage 
 *   and must use its reaction to make a melee weapon attack against one creature of 
 *   the creature's choice that the creature can see.
 * 
 *   Constructs and undead are immune to this effect.
 * 
 * 04/14/22 0.1 Creation of Macro
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
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
// DamageBonus must return a function to the caller
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    if (args[0].targets.length === 0 || args[0].targets.length > 3) {     
        msg = `Must target between one and three target(s).  ${args[0].targets.length} were targeted.`
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
    let targetArray = []
    let token5eArray = []
    if (!preCheck()) return(false);
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let color = jez.getRandomRuneColor()
    jez.runRuneVFX(aToken, jez.getSpellSchool(aItem), color)
    //--------------------------------------------------------------------------------------------
    // Build the target list (targetArray) from those that failed saves, tossing out any that are 
    // type Undead or Construct
    //
     for (const element of args[0].failedSaves) {
         let race = jez.getRace(element)
         if (race.includes("construct")) continue
         if (race.includes("undead"))    continue
         targetArray.push(element)
        //----------------------------------------------------------------------------------------
        // Build array of Token5e objects from the TokenDocument5e
        //
        let fetchedToken = canvas.tokens.placeables.find(ef => ef.id === element.id)
        jez.log('Token5e fetched by ID', fetchedToken)
        token5eArray.push(fetchedToken)
    }
    jez.log("targetArray", targetArray)
    jez.log("token5eArray", token5eArray)
    //--------------------------------------------------------------------------------------------
    // If no targets remain, post message and exit
    //
    if (targetArray.length === 0) {
        msg = `No effect, all targets saved or are immune`
        postResults(msg)
        return
    }
    //--------------------------------------------------------------------------------------------
    // Determine damage to inflict: 1d8 + @mod psychic damage
    //
    let damageRoll = new Roll(`1d8 + ${jez.getCastMod(aToken)}`).evaluate({ async: false });
    game.dice3d?.showForRoll(damageRoll);
    //--------------------------------------------------------------------------------------------
    // Apply damage 
    //
    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, "psychic", targetArray, 
        damageRoll, { flavor: `Psychic Damage`, itemCardId: args[0].itemCardId })
    jez.runRuneVFX(targetArray, jez.getSpellSchool(aItem), color)
    //--------------------------------------------------------------------------------------------
    // Post completion message
    //
    let failedStr = ""
    for (const ELEMENT of targetArray) {
        if (failedStr) failedStr += `, <b>${ELEMENT.name}</b>`
        else failedStr = `<b>${ELEMENT.name}</b>`;
    }
    msg = `Creatures that failed their saving throws (${failedStr}) must use their reaction (if available) to 
    make a melee weapon attack against one creature of ${aToken.name}'s choice that ${aToken.name}
    can see.`
    postResults(msg)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}


