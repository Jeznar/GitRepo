const MACRONAME = "Bonfire_Helper.0.1.js"
/*****************************************************************************************
 * IIntended to be called to apply the damage element of an active Aura attached to 
 * Create Bonfire spell. 
 * 
 * 05/06/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log("---------------------------------------------------------------------------",
    `Starting ${MACRONAME}`,MACRO);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

const ATTACK_ITEM = args[1];

if (!ATTACK_ITEM) {
    ui.notifications.error(`${MACRONAME} received invalid parameters, please, politely ask Joe to fix this`);
    jez.log(`Bad stuff received by ${MACRONAME}`,"ATTACK_ITEM", ATTACK_ITEM);
    return;
}
jez.log("ATTACK_ITEM",ATTACK_ITEM);

const lastArg = args[args.length - 1];
let msg = "";
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;

if (args[0] === "off") await doOff();         // DAE removal
if (args[0] === "on") await doOn();           // DAE Application

jez.log("---------------------------------------------------------------------------",
    "Finished", `${MACRONAME}`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    jez.log(`doOff ---> Delete ${ATTACK_ITEM} from ${aToken.name} if it exists`, aActor)
    jez.log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log("--------------On---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    jez.log("Nothing to do");
    jez.log("--------------On---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
}