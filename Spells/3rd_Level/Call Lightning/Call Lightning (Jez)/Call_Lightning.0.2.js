const MACRONAME = "Call_Lighning.0.2"
console.log(MACRONAME)
/*****************************************************************************************
 * Create a temporary attack item to use against the victims of Call Lighting
 * 
 * 01/05/22 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME}`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const ATTACK_ITEM = "Lighting Strike";
log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";

//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use

log("---------------------------------------------------------------------------",
    "Finishing", MACRONAME);
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    log("--------------Off---------------------", "Starting", `${MACRONAME} ${FUNCNAME}`);
    log(`doOff ---> Delete ${ATTACK_ITEM} from ${aToken.name} if it exists`)
    await deleteItem(ATTACK_ITEM, aActor);
    log("--------------Off---------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return;
  }
  
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    log("--------------OnUse-----------------", "Starting", `${MACRONAME} ${FUNCNAME}`,
        `First Targeted ID`, tActor?.data._id,   // <== This is needed ID -JGB
        `First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken,
        `First Targeted Actor (tActor) ${tActor?.name}`, tActor);

    await CreateTemporaryAbility();

    log("--------------OnUse-----------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (true);

    //----------------------------------------------------------------------------------
    // Function to create a new spell attack to invoke damage on our victim
    //
    async function CreateTemporaryAbility() {
        const numDice = args[0].spellLevel;

        let damageType = "lightning"
        let spellDC = aActor.data.data.attributes.spelldc;
        log(` spellDC ${spellDC}`);
        log(` args[0].item.img ${args[0].item.img}`);
        let value = `As a bonus action, this attack may be used to inflict <b>${numDice}d10 lighting</b>
         damage to targets in a 5 foot radius, within the 60 foot radius storm.<br><br>
         Targets are allowed a DC${spellDC} DEX save for half damage.`;

        let itemData = [{
            "name": ATTACK_ITEM,
            "type": "spell",
            "img": args[0].item.img,
            "effects": [],
            "data": {
                "ability": "",
                "actionType": "save",
                "activation": {
                    "cost": 1,
                    "type": "action"
                },
                "damage": {
                    "parts": [
                        [
                            `${numDice}d10`,
                            `${damageType}`
                        ]
                    ],
                    "versatile": ""
                },
                "description": { "value": value },
                "formula": "",
                "level": 0,
                "preparation": {
                    "mode": "innate",
                    "prepared": false
                },
                "range": {
                    "units": "ft",
                    "value": 150
                },
                "save": {
                    "ability": "dex",
                    "dc": `${spellDC}`,
                    "scaling": "spell"
                },
                "school": "con",
                "source": "Call Lightning",
                "target": {
                    "type": "cylinder",
                    "units": "ft",
                    "value": 5
                },
            },
            "flags": {
                "autoanimations": {
                    "animType": "t8",
                    "animLevel": false,
                    "killAnim": false,
                    "options": { "ammo": false}, 
                    "override": true,
                    "sourceToken": { "enable": false },
                    "targetToken": { "enable": false },
                    "templates": {
                        "customAnim": false,
                        "customPath": "",
                        "loopDelay": 250,
                        "persistent": false,
                        "removeTemplate": true,
                        "tempAnim": "ex03",
                        "tempColor": "yellowblue",
                        "tempLoop": 3,
                        "tempType": "circle",
                    }
                }

            }
        }];

        let itemData1 = [{
            "name": ATTACK_ITEM,
            "type": "spell",
            "data": {
                "source": "Casting Flaming Sphere",
                "ability": "",
                "description": {"value": value},
                "actionType": "save",
                "attackBonus": 0,
                "damage": {
                    "parts": [
                        [
                            `${numDice}d6`,
                            `${damageType}`
                        ]
                    ],
                },
                "formula": "",
                "save": {
                    "ability": "dex",
                    "dc": spellDC,
                    "scaling": "spell"
                },
                "level": 0,
                "school": "abj",
                "preparation": {
                    "mode": "innate",
                    "prepared": false
                },
            },
            "img": args[0].item.img,
            "effects": []
    
        }];

        log()
        log()
        log("itemData", itemData)
        log()
        log()

        await aActor.createEmbeddedDocuments("Item", itemData);

        msg = `<p style="color:DarkSlateBlue;font-size:14px;">
        <b>${tToken.name}</b> summons forth a 60ft radius storm cloud and can command lightning 
        strikes each round. Strikes will do ${numDice}d10 lightning damage to those within 5 feet 
        of each <b>Lightning Strike</b>, DC${spellDC} DEX save allowed for half damage.</p><br><br>
        <p font-size:14px;">
        <b>FoundryVTT</b>: Use temporary <b>Lightning Strike</b> spell to do damage.</p>`;

        postResults(msg);
    }
}

/***************************************************************************************
 * Function to delete an item from actor
 *
 * Parameters
 *  - itemName: A string naming the item to be found in actor's inventory
 *  - actor: Optional actor to be searched, defaults to actor launching this macro
 ***************************************************************************************/
 async function deleteItem(itemName, actor) {
    const FUNCNAME = "deleteItem(itemName, actor)";
    log("-------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "itemName", itemName,
        `actor ${actor?.name}`, actor);

    // If actor was not passed, pick up the actor invoking this macro
    actor = actor ? actor : canvas.tokens.get(args[0].tokenId).actor;

    let item = actor.items.find(item => item.data.name === itemName && item.type === "spell")
    log("*** Item to be deleted:", item);
    if (item == null || item == undefined) {
        log(`${actor.name} does not have "${itemName}"`);
        log(`${FUNCNAME} returning false`);
        return (false);
    }
    log(`${actor.name} had "${item.name}"`, item);
    let returnCode = await actor.deleteOwnedItem(item._id);
    
    if (returnCode) {
        log(`${FUNCNAME} returning true, item deleted`,returnCode);
        log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
        return (true);
    } else {
        log(`${FUNCNAME} returning false, item delete failed`);
        log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
        return (false);  
    }
}

/***************************************************************************************************
 * Post the results to chat card
 ***************************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    log(`chatMessage: `,chatMessage);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}

/***************************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************************/
function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    }
}
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }