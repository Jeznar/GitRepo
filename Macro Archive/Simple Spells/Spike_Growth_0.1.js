const MACRONAME = "Spike_Growth_0.1"
/*****************************************************************************************
 * Implements the Spike Growth Spell.
 * 
 * Spell Description: The ground in a 20-foot radius centered on a point within range 
 *   twists and sprouts hard spikes and thorns. The area becomes difficult terrain for the 
 *   duration. When a creature moves into or within the area, it takes 2d4 piercing damage 
 *   for every 5 feet it travels.
 * 
 *   The transformation of the ground is camouflaged to look natural. Any creature that 
 *   can't see the area at the time the spell is cast must make a Wisdom (Perception) 
 *   check against your spell save DC to recognize the terrain as hazardous before 
 *   entering it.
 * 
 * The approach is to create a temporary ability that allows the caster to zap offenders
 * with a synthetic spell to apply the appropriate damage. 
 * 
 * 12/10/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
let msg = "";
const IMAGE = args[0].item.img
const SPELLNAME="Spike Attack";
let actorD;
if (args[0].tokenId) actorD = canvas.tokens.get(args[0].tokenId).actor;
else actorD = game.actors.get(args[0].actorId);

if(DEBUG) {
    console.log(`Beginning ${MACRONAME}`);
    console.log(` args[0]: `,args[0]);
    console.log(` image: ${IMAGE}`);
    console.log(` actorD:`,actorD);
}

if (args[0].tag === "OnUse") doOnUse(); // Midi ItemMacro On Use

// ---------------------------------------------------------------------------------------
// Post results to the card
//
msg = `<b>${actorD.name}</b> can use their newly added <b>${SPELLNAME}</b> to damage each token
       that moves into an affected space while the spikes are present. Those are difficult 
       terrain for the duration.`
await postResults(msg);
return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    /***************************************** 
     * Some Special div's per Posney's docs
     *  - midi-qol-attack-roll
     *  - midi-qol-damage-roll
     *  - midi-qol-hits-display
     *  - midi-qol-saves-display
     * 
     * One other that I have been using
     *  - midi-qol-other-roll
    ******************************************/

    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    if (DEBUG) console.log(`chatMessage: `,chatMessage);
    const searchString = /<div class="midi-qol-other-roll">[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll"><div class="end-midi-qol-other-roll">${resultsString}`;
    // const searchString = /<div class="end-midi-qol-saves-display">/g;
    // const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}

/***************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************/
 async function doOnUse() {
    /*let extraDice = 0;
    if (args[0].spellLevel > 3) extraDice = args[0].spellLevel - 3;
    const numDice = 3 + extraDice;*/
    let numDice = 2;
    let damageType = "piercing"; 

    if (DEBUG) {
        console.log(`Executing doOnUse Function`);
        console.log(` Number of dice to roll: ${numDice}`);
        console.log(` Damage Type: ${damageType}`);
    }

    let itemData = [{
        "name": `${SPELLNAME}`,
        "type": "spell",
        "data": {
            "description": {
                "value": `<p>Use the <b>${SPELLNAME}</b> Innate Spellcasting ability to attack each enemy once for every affected space it enters.</p>`,
                "chat": "",
                "unidentified": ""
            },
            "activation": {
                "type": "action",
                "cost": 1,
                "condition": ""
            },
            "target": {
                "value": 1,
                "width": null,
                "units": "",
                "type": "creature"
            },
            "range": {
                "value": 30,
                "long": null,
                "units": "ft"
            },
            "ability": "",
            "actionType": "other", // rsak
            "attackBonus": "",
            "chatFlavor": "",
            "critical": null,
            "damage": {
                "parts": [
                    [
                        `${numDice}d4`,
                        `${damageType}`
                    ]
                ],
                "versatile": ""
            },
            "formula": "",
            /* "save": {
                "ability": "Wisdom",
                "dc": 12,                     // DC ???
                "scaling": "spell"
            },*/
            "level": 0,
            "school": "con",
            "components": {
                "value": "",
                "vocal": true,
                "somatic": true
            },
            "preparation": {
                "mode": "innate",
                "prepared": true
            },
            /*"scaling": {
                "mode": "spell",
                "formula": `1d8`
            }*/
        },
        "img": IMAGE
    }];
    await actorD.createEmbeddedDocuments("Item", itemData);
    if (DEBUG) console.log(`************* Ending doOnUse`);
    return;
}
