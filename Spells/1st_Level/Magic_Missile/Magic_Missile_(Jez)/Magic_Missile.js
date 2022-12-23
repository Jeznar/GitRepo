const MACRONAME = "Magic_Missile"
/*****************************************************************************************
 * Simply run a VFX for the number of missles (all or one) being cast at the target
 * 
 * 02/17/22 0.1 Creation of Macro
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
let msg = "";
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
let tActor = tToken?.actor;
//-----------------------------------------------------------------------------------------------------
//
/*
let itemArray = aItem.name.split("-")
for (const element of itemArray) jez.log("element",element)

let missileCnt = parseInt(itemArray[itemArray.length-1], 10);
jez.log("Suffix (if any)", missileCnt)
jez.log("NaN            ", NaN)
if (isNaN(missileCnt)) {
    const SPELL_LEVEL = lastArg.spellLevel
    missileCnt = SPELL_LEVEL + 2
    jez.log("missileCnt ===>", missileCnt)
}
jez.log("missileCnt", missileCnt)

const MSL_CNT = parseInt(aItem.data.damage.parts[0][0].split("d")[0])     // Grab number in front of the "d"
*/
//-----------------------------------------------------------------------------------------------------
// Noodle out how many d4 were rolled so missile VFX count can be correct.
//
let diceCnt = 0
jez.log("Damage Formula Used",lastArg.damageRoll._formula)
let rollArray = lastArg.damageRoll._formula.split("+")
const REGEX = /[1-9]d4/g;                       // Reg Exp to use to find d4's in roll expression
for (const element of rollArray) {              // Loop through all the tokens
    if (element.search(REGEX)===-1) continue    // Wasn't a d4 element, skip it     
    diceCnt = diceCnt + parseInt(element, 10)   // grab the integer that should proceed the "d4"
}
jez.log("Number of d4's rolled", diceCnt)
//-----------------------------------------------------------------------------------------------------
// Run the VFX with correct missle count
//
new Sequence()
    .effect()
        .atLocation(aToken)
        .stretchTo(tToken)
        .file("jb2a.magic_missile")
        .repeats(diceCnt, 200, 300)
        .randomizeMirrorY()
    .play();

return;
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "each") doEach();					    // DAE removal
if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus
jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
function preCheck() {
    // Check anything important...
    jez.log('All looks good, to quote Jean-Luc, "MAKE IT SO!"')
    return (true)
}

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("Something could have been here")
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }
  
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("A place for things to be done");
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    jez.log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor)


    // https://www.w3schools.com/tags/ref_colornames.asp
    msg = `<p style="color:blue;font-size:14px;">${aToken.name} fires magic missles.</p>`
    postResults(msg);
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}

/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
 async function doBonusDamage() {
    const FUNCNAME = "doBonusDamage()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("The do On Use code")
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
