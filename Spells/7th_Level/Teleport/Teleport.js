const MACRONAME = "Teleport.js"
/*****************************************************************************************
 * Teleport spell that presents dialog to obtain the conection to the destination and then
 * rlls a d100 to determine the result of the teleport.  It does not further automate the 
 * spell.
 * 
 * Below is the table being implmented
 * -----------------------------------
 * Familiarity	        Mishap	Similar Off-Tar	On-Tar
 * Permanent Circle	      x	      x	      x	    01-100%
 * Associated Object 	  x	      x	      x	    01-100%
 * Very Familiar	    01-05	06-13	14-24	25-100%
 * Seen Casually	    01-33	34-43	44-53	54-100%
 * Viewed Once	        01-43	44-53	54-73	74-100%
 * Description	        01-43	44-53	54-73	74-100%
 * False Destination	01-50	51-100%	  x	      x
 * 
 * 04/13/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const DAMAGE_TYPE = "force"
const DAMAGE_DICE = "3d10"
let msg = "";
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    if (args[0].targets.length === 0) {     // If not exactly one target, return
        msg = `Must target at least one target.`
        postResults(msg);
        return (false);
    }
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    runRuneVFXonTargets(args[0].targets)
    popDialog(aToken);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************
 * 
 ***************************************************************************************/
async function popDialog(token1) {
    const Q_TITLE = "Teleport to..."
    const QUERY = `${token1.name}'s Knowledge/Connection to Destination`
    const LIST = [
        'Permanent Circle',
        'Associated Object',
        'Very Familiar',
        'Seen Casually',
        'Viewed Once',
        'Description',
        'False Destination',
        //'Force Mishap'
    ]
    jez.pickRadioListArray(Q_TITLE, QUERY, pickRadioCallBack, LIST);
    return
}
/***************************************************************************************
 * 
 ***************************************************************************************/
async function pickRadioCallBack(selection) {
    jez.log("pickRadioCallBack", "selection", selection)
    //----------------------------------------------------------------------------------
    // Roll the d100 for results determination
    //
    let d100Roll = new Roll(`d100`).evaluate({ async: false });
    game.dice3d?.showForRoll(d100Roll);
    let roll = d100Roll.total
    jez.log(`d100Roll ${roll}`, d100Roll)
    //----------------------------------------------------------------------------------
    // Build array containg rolls to results
    //
    let resultsArray = null
    switch (selection) {
        case "Permanent Circle":
            resultsArray = [0, 0, 0, 100]
            break;
        case "Associated Object":
            resultsArray = [0, 0, 0, 100]
            break;
        case "Very Familiar":
            resultsArray = [5, 13, 24, 100]
            break;
        case "Seen Casually":
            resultsArray = [33, 43, 53, 100]
            break;
        case "Viewed Once":
            resultsArray = [43, 53, 73, 100]
            break;
        case "Description":
            resultsArray = [43, 53, 73, 100]
            break; 
        case "False Destination":
            resultsArray = [50, 100, 100, 100]
        case "Force Mishap":
            resultsArray = [100, 100, 100, 100]
            break;
        default:
            msg = `Coding error?  Selection = ${selection}`
            ui.notifications.error(msg);
            return(false)
        }
    jez.log("resultsArray",resultsArray)
    //----------------------------------------------------------------------------------
    // Determine variables needed by the results strings
    //
    let percentOffTarget = (getRandomInt(10)+1) * (getRandomInt(10)+1)
    jez.log("percentOffTarget", percentOffTarget)
    let errorDirections = ["North", "North-East", "East", "South-East", 
                           "South", "South-West", "West", "North-West"]
    let errorDirection = errorDirections[getRandomInt(8)]
    jez.log("errorDirection",errorDirection)
    //----------------------------------------------------------------------------------
    // Build array containg possible result strings
    //
    let resultsStrings = [
    `<b>Mishap</b>: The spell's unpredictable magic results in a difficult journey. Each 
    teleporting creature (or the target object) takes ${DAMAGE_DICE} ${DAMAGE_TYPE} damage. 
    Execute the spell again, without using a spell slot or other resource`,

    `<b>Similar Area</b>: Your targets wind up in a different 
    area that's visually or thematically similar to the target area. If you are heading for 
    your home laboratory, for example, you might wind up in another wizard's laboratory or 
    in an alchemical supply shop that has many of the same tools and implements as your 
    laboratory. Generally, you appear in the closest similar place, but since the spell has 
    no range limit, you could conceivably wind up anywhere on the plane.`,    

    `<b>Off Target</b>: Your targets appear a random distance away 
    from the intended destination in a random direction. Distance off target is 
    <b>${percentOffTarget}%</b> of the distance that was to be travelled to the 
    <b>${errorDirection}</b>.`,    

    `<b>On Target</b>: Your targets appear where you wanted them to go.`]
    
    jez.log("resultsStrings",resultsStrings)
    //----------------------------------------------------------------------------------
    // Determine index for message based on die roll
    // 
    let index = null
    if (roll <= resultsArray[0]) index = 0;
    if (roll > resultsArray[0] && roll <= resultsArray[1]) index = 1;
    if (roll > resultsArray[1] && roll <= resultsArray[2]) index = 2;
    if (roll > resultsArray[2] && roll <= resultsArray[3]) index = 3;
    jez.log("index", index)
    //----------------------------------------------------------------------------------
    // Post the results
    //  
    msg = resultsStrings[index]
    postResults(msg)
    //----------------------------------------------------------------------------------
    // If a Mishap occured, determine and apply damage to targeted tokens
    //  
    if (index === 0) {          // Mishap occured
        await jez.wait(2000)    // dramatic pause
        //------------------------------------------------------------------------------
        // Build an array of the targeted Token5s from TokenDocument5es
        // 
        let tTokens = []
        for (const element of args[0].targets) {
            console.log(element);
            tTokens.push(element._object)
            jez.log("element._object",element._object)
          }
        //----------------------------------------------------------------------------------
        // Apply damage
        // 
        let damageRollObj = new Roll(DAMAGE_DICE).evaluate({ async: false });
        game.dice3d?.showForRoll(damageRollObj);
        //game.dice3d?.showForRoll(damageRollObj);
        new MidiQOL.DamageOnlyWorkflow(aToken.actor, aToken, 
            damageRollObj.total, DAMAGE_TYPE, 
            tTokens, damageRollObj, 
            {flavor:`Teleportees suffer a mishap`, itemCardId: args[0].itemCardId});
        //----------------------------------------------------------------------------------
        //  Run VFX on affected tokens
        // 
        runOuchVFXonTargets(tTokens)
    }
}
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
/***************************************************************************************************
 * Run Rune VFX on Targets
 ***************************************************************************************************/
 async function runRuneVFXonTargets(targets) {
    let color = jez.getRandomRuneColor()
    let school = jez.getSpellSchool(aItem)
    for (const element of targets) {
        jez.runRuneVFX(element, school, color)
    }
 }
/***************************************************************************************************
 * Run Ouch VFX on Targets
 ***************************************************************************************************/
 async function runOuchVFXonTargets(targets) {
    const VFX_LOOP = "jb2a.dizzy_stars.200px.blueorange"
    for (const element of targets) {
        new Sequence()
            .effect()
            .file(VFX_LOOP)
            .atLocation(element)
            .scaleToObject(1)
            .play();
    }
 }

