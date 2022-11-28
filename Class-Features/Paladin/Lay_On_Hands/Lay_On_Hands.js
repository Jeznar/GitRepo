const MACRONAME = "Lay_On_Hands.0.4"
/*****************************************************************************************
 * Based on a Lay-on-Hands macro found online at:
 * https://github.com/foundry-vtt-community/macros/blob/4e25a66ef7990dbcb0c9015b554286de147c5116/actor/5e_lay_on_hands.js
 *  READ First!
 * 
 * 12/24/21 0.1 Creation of Macro
 * 12/26/21 0.2 Correcting the type of spell to require a save
 * 12/27/21 0.3 Add cure disease/poison option
 * 11/27/22 0.4 Rewrite and use limited item uses as alternative resource.
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 0;                               // Trace Level for this macro
 let msg = "";                               // Global message string
 //---------------------------------------------------------------------------------------------------
 if (TL>1) jez.trace(`${TAG} === Starting ===`);
 if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
 const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
 //---------------------------------------------------------------------------------------------------
 // Set the value for the Active Token (aToken)
 let aToken;         
 if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
 else aToken = game.actors.get(LAST_ARG.tokenId);
 let aActor = aToken.actor; 
 //
 // Set the value for the Active Item (aItem)
 let aItem;         
 if (args[0]?.item) aItem = args[0]?.item; 
 else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
 //---------------------------------------------------------------------------------------------------
 // Set Macro specific globals
 //
const RESOURCE_NAME = "Lay on Hands"
// const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
if (TL>1) jez.trace(`${TAG} Starting ${MACRONAME}`);
if (TL>1) for (let i = 0; i < args.length; i++) jez.trace(`${TAG}   args[${i}]`, args[i]);
//---------------------------------------------------------------------------------------
// Set some global variables and constants
//
// let msg = "";
// let aActor;         // Acting actor, creature that invoked the macro
// let aToken;         // Acting token, token for creature that invoked the macro
// let aItem;          // Active Item information, item invoking this macro
//---------------------------------------------------------------------------------------
// Deal with casting resource -- this needs to consider those with resouce set (perferred
// for PCs) and those that use the 'uses' pool on the actual item (generally NPC)
//
const ACTOR_DATA = await aActor.getRollData();
const FALLBACK_SLOT = 'Limited Item Uses'
let resourceList = [{ name: "primary" }, { name: "secondary" }, { name: "tertiary" }];
let resourceValues = Object.values(ACTOR_DATA.resources);
let resourceTable = mergeObject(resourceList, resourceValues);
let curRes, curMax = 0
let resourceSlot = ""
let findResourceSlot = resourceTable.find(i => i?.label?.toLowerCase() === RESOURCE_NAME?.toLowerCase());
if (findResourceSlot) { // Found a resource named RESOURCE_NAME, we'll use that
    resourceSlot = findResourceSlot.name;
    curRes = ACTOR_DATA.resources[resourceSlot].value;
    curMax = ACTOR_DATA.resources[resourceSlot].max;
}
else {                 // Didn't find resource, fall back to item use field
    jez.trace(`${TAG} ${RESOURCE_NAME} is missing on ${aToken.name}, falling back to item uses.`)
    const ITEM_USES = await jez.getItemUses(aItem, { traceLvl: TL })
    resourceSlot = FALLBACK_SLOT
    curRes = ITEM_USES.value;
    curMax = ITEM_USES.max;
}
// const mainRes = ACTOR_DATA.resources[RESOURCE];
if (TL>1) jez.trace(`${TAG} ------- Resource Slot Values -------`,
    'resourceList    ', resourceList,
    'resourceValues  ', resourceValues,
    'resourceTable   ', resourceTable,
    'findResourceSlot', findResourceSlot,
    'resourceSlot    ', resourceSlot,
    'ACTOR_DATA      ', ACTOR_DATA,
    'curRes          ', curRes,
    'curMax          ', curMax)
//---------------------------------------------------------------------------------------
// const LAST_ARG = args[args.length - 1];   
// if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
// if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
// if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//-----------------------------------------------------------------------------------------------
// Make sure exactly one token was targeted
//
if (!await preCheck()) return(false);
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
let tActor = tToken?.actor;
let hpMax = tActor?.data.data.attributes.hp.max;
let hpVal = tActor?.data.data.attributes.hp.value;
if (TL > 1) jez.trace(`${TAG} ------- Target Values -------`,
    'tToken', tToken,
    'tActor', tActor,
    'hpMax', hpMax,
    'hpVal', hpVal)
/**
 * System: D&D5e
 * Apply lay-on-hands feat to a target character.  Asks the player how many HP to heal and
 * verifies the entered value is within range before marking down usage counter. If the player
 * has OWNER permissions of target (such as GM or self-heal) the HP are applied automatically; 
 * otherwise, a 'roll' message appears allowing the target character to right-click to apply healing.
 */
let confirmed = false;
// let featUpdate = duplicate(aItem);
let maxHeal = Math.clamped(curRes, 0, hpMax - hpVal);

if (TL>1) jez.trace(`${TAG} Calc of maxHeal (${maxHeal}): ${curMax} available, target's max hp ${hpMax}, current hp ${hpVal}`);

let maxDoP = math.floor(curMax / 5);

let content = `<p><em><b>${aActor.name}</b> lays hands on <b>${tToken.name}</b>.</em>
                  <br><br>You have a total of <b>${curRes} remaining</b> in your resource pool.
                  <br><br>How many health do you want to restore to ${tToken.name}? 
                  <br><br>You may attempt to cure up to <b>${maxDoP} diseases/poisons</b> on 
                    ${tToken.name} at the cost of 5 each.</p>
               <form>
                  <div class="form-group">
                    <label for="num">HP to Restore: (Max: ${maxHeal}) </label>
                    <input id="num" name="num" type="number" min="0" max="${maxHeal}"></input>
                  </div>
                  <div class="form-group">
                    <label for="numDoP">Disease/Poison Cures: </label>
                    <input id="numDoP" name="numDoP" type="number" min="0" max="${maxDoP}"></input>
                  </div>
              </form>`;                  
new Dialog({
    title: "Lay on Hands Healing",
    content: content,
    buttons: {
        heal: { label: "Heal!", callback: () => confirmed = true },
        cancel: { label: "Cancel", callback: () => confirmed = false }
    },
    default: "heal",

    close: async html => {
        if (confirmed) {
            let healAmount = Math.floor(Number(html.find('#num')[0].value));
            let dopAmount = Math.floor(Number(html.find('#numDoP')[0].value));
            if (TL > 1) jez.trace(`${TAG} dopAmount`, dopAmount);
            let chargesUsed = healAmount + 5 * dopAmount;
            if (TL > 1) jez.trace(`${TAG} charges used ${chargesUsed} of ${curMax} max.`);
            if (chargesUsed < 1 || chargesUsed > curMax)
                jez.badNews(`${healAmount} healing and (${dopAmount} disease/poison)*5 exceeds ${curMax}. Aborting action.`, 'w')
            else
                if (healAmount > maxHeal)
                    jez.badNews(`Attemting to heal for more than ${maxHeal} not allowed. Aborting action.`, 'w');
                else {
                    msg = `${aToken.name} applied healing to ${tToken.name}.<br>`
                    if (healAmount > 0) msg += `<br>${healAmount} point(s) of health has been restored.<br>`
                    if (dopAmount > 0) msg += `<br>${dopAmount} disease/poison(s) perhaps cured.<br>
                    <p style="color:black;"><b>FoundryVTT</b>: Disease/poison(s) done manually.</p>`
                    await PerformHeal(aActor, aToken, tToken, healAmount, { traceLvl: TL });
                    await replaceHitsWithHeals({ traceLvl: TL });
                    DecrementResource(aToken, resourceSlot, curRes, chargesUsed, { traceLvl: TL });
                    postResults(msg);
                }
        };
    }
}).render(true);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check the setup of things.  Post bad message and return false fr bad, true for ok!
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function preCheck() {
    if (args[0].targets.length !== 1)       // If not exactly one target 
        return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`,"w");
    return(true)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 function postResults(msg,options={}) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TL = options.traceLvl ?? 0
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the healing 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
async function PerformHeal(aActor, aToken, tToken, healAmount, options={}) {
    const FUNCNAME = "PerformHeal(aActor, aToken, tToken, healAmount, options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
        "aActor",aActor,
        "aToken",aToken,
        "tToken",tToken,
        "healAmount",healAmount,
        "options",options);
    //----------------------------------------------------------------------------------
    //
    let healRollObj = new Roll(`${healAmount}`).evaluate({ async: false });
    if (TL>1) jez.trace(`${TAG} healRollObj`, healRollObj);
    await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, healAmount, 
        "healing",[tToken], healRollObj,
        {
            flavor: `(${CONFIG.DND5E.healingTypes["healing"]})`,
            itemCardId: args[0].itemCardId,
            useOther: false
        }
    );
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Decrement the resource
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
async function DecrementResource(tokenD, typeRes, curRes, spentRes, options={}) {
    const FUNCNAME = "DecrementResource(tokenD, typeRes, curRes, spentRes, options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
        "tokenD  ",tokenD,
        "typeRes ",typeRes,
        "curRes  ",curRes,
        "spentRes",spentRes,
        "options ",options);
    //-----------------------------------------------------------------------------------------------
    //
    let newRes = Number(curRes - spentRes);
    //-----------------------------------------------------------------------------------------------
    // Consider and handle the fallback resource: resourceSlot = FALLBACK_SLOT, first
    //
    if (resourceSlot === FALLBACK_SLOT) {
        jez.setItemUses(aItem, newRes, { traceLvl: TL })
        if (TL>1) jez.trace(`${TAG} --- Finished Fallback ---`);
        return
    }
    //-----------------------------------------------------------------------------------------------
    // If we didn't fall back, use a primary/seondary/tertiary resource slot
    //
    let resType = typeRes === "primary" 
        ? "data.resources.primary.value" 
        : resourceType === "secondary" 
            ? "data.resources.secondary.value" 
            : "data.resources.tertiary.value";
    let resUpdate = {};
    resUpdate[resType] = newRes;
    if (TL>1) jez.trace(`${TAG} Values set`, 
        "newRes            ",newRes,
        "resType           ",resType,
        "resUpdate[resType]",resUpdate[resType]);
    await tokenD.actor.update(resUpdate);
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Replace first string with second on chat card, purely cosemetic, but nice touch
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function replaceHitsWithHeals(options={}) {
    const FUNCNAME = "replaceHitsWithHeals(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    //-----------------------------------------------------------------------------------------------
    let chatmsg = game.messages.get(args[0].itemCardId);
    let content = await duplicate(chatmsg.data.content);
    const searchString = / hits/g;
    const replaceString = `<p style="color:Green;"> Heals</p>`;
    content = await content.replace(searchString, replaceString);
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return;
}