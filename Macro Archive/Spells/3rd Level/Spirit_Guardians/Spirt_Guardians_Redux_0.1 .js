const MACRONAME = "Spirit_Gurdians_Redux_0.1"
/*****************************************************************************************
 * Not happy with any of my not really working Spirit Guardians I have found.  I'm trying 
 * again, this time staring with Produce Flame macro to hopefully give the caster an 
 * ability to selectively zap baddies who enter teh aura or start their turns with in it.
 * 
 *  READ First!
 *  Themed after Kandashi's create item macro
 * 
 * 12/07/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = false;
const IMAGE = "Icons_JGB/Spells/Spirit_Guardian.jpg"

const lastArg = args[args.length - 1];
let actorD;
if (lastArg.tokenId) actorD = canvas.tokens.get(lastArg.tokenId).actor;
else actorD = game.actors.get(lastArg.actorId);

if (DEBUG) {
    console.log(`************* Starting ${MACRONAME}`);
    console.log(` IMAGE ${IMAGE}, tag ${args[0].tag}, args[0]:`,args[0]);
}

if (args[0] === "off") doOff();         // DAE removal
if (args[0] === "on") doOn();           // DAE Application
if (args[0].tag === "OnUse") doOnUse(); // Midi ItemMacro On Use

return;

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/***************************************************************************************
 * Perform the code that runs when this macro is applied by DAE, set On
 ***************************************************************************************/
 function doOn() {
    // Handle the application by doing nothing...(I don't really know why)
    if (DEBUG) {
        console.log(`handling the args[0]="on" event by bailing out`)
        console.log(`************* Ending doOn`);
    }
    return;
}

/***************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************/
 async function doOff() {
    
    if (DEBUG) { 
        console.log(Sequencer.EffectManager.getEffects());
        console.log(`**** Executing doOff`)
        console.log('actorD:',actorD);
        console.log(`name ${actorD.data.name}`)
    }
    // Sequencer.EffectManager.endEffects({ name: "test_effect", object: token })
    Sequencer.EffectManager.endEffects({name: actorD.data.name})

    let getItem = actorD.items.find(i => i.name === "Guardian Attack");
    if (!getItem) return {};
    await getItem.delete();
    if (DEBUG) console.log(`************* Ending doOff`);
    return;
}

/***************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************/
async function doOnUse() {
    let extraDice = 0;
    if (args[0].spellLevel > 3) extraDice = args[0].spellLevel - 3;
    const numDice = 3 + extraDice;
    let damageType = setDamageType();

    if (DEBUG) {
        console.log(`Executing doOnUse Function`);
        console.log(` Number of dice to roll: ${numDice}`);
        console.log(` Damage Type: ${damageType}`);
    }

    let itemData = [{
        "name": "Guardian Attack",
        "type": "spell",
        "data": {
            "description": {
                "value": "<p>You should use the <b>Guardian Attack</b> Innate Spellcasting ability to attack each enemy who enters your aura and who begins its turn within it.</p>",
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
            "actionType": "rsak",
            "attackBonus": "",
            "chatFlavor": "",
            "critical": null,
            "damage": {
                "parts": [
                    [
                        `${numDice}d8`,
                        `${damageType}`
                    ]
                ],
                "versatile": ""
            },
            "formula": "",
            "save": {
                "ability": "",
                "dc": null,
                "scaling": "spell"
            },
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

/***************************************************************************************
 * Return Damage Type
 * - Radiant by default
 * - Necrotic if the actor has a race that contains an element of necroticRaces array
 * - Necrotic if the actor's alignment contains an element of necroticAligns
 ***************************************************************************************/
function setDamageType() {
    let damageType = "radiant"
    let necroticRaces = ["undead", "fiend", "devil", "demon"];  // Set strings that define necrotic races
    let necroticAligns = ["evil"];                             // Set strings that define necrotic alignments
    let actorRace = actorD.data.data.details.race;      // Shorten subsequent lines for actorD Details Race
    let actorType = actorD.data.data.details.type;      // Shorten subsequent lines for actorD Details Type
    let actorAlign = actorD.data.data.details.alignment;// Shorten subsequent lines for actorD Details Alignment
    let DEBUG = false;

    if (DEBUG) {
        console.log(` actorD: `, actorD)
        console.log(` Alignment: `, actorAlign)
        console.log(` Race: `, actorRace)
        console.log(` Type: `, actorType)
    }

    if (actorD.data.type === "character") {     
        // actor is a PC                     
        if (DEBUG > 1) { console.log(`${actorD.name} is a PC`, actorD) };

        for (let necroticRace of necroticRaces) {
            if (actorRace) {
                if (actorRace.toLowerCase().includes(necroticRace.toLowerCase())) {
                    if (DEBUG > 1) { console.log(`${actorD.name}'s race is ${necroticRace}`, actorD, necroticRace) };
                    damageType = "necrotic"
                }
            } else {
                if (DEBUG > 1) { console.log(`${actorD.name} has no race`, actorD); }
            }
        }
    } else { 
        // actor is a NPC                                                                   
        if (DEBUG > 1) { console.log(`${actorD.name} is an NPC`, actorD) };

        // Loop through each creature type found in the necroticRaces array.
        for (let necroticRace of necroticRaces) {
            if (DEBUG) { console.log(`Checking against ${necroticRace}`) };

            // If the creature type is custom...
            if (actorType.value.toLowerCase() === "custom") {
                if (DEBUG) { console.log(` Beginning custom type Checker`) };

                // Check custom creature type against our necroticRaces collection
                if (actorType.custom.toLowerCase().includes(necroticRace.toLowerCase())) {
                    if (DEBUG) { console.log(` Found a dirty ${necroticRace} spy.`, necroticRace) };
                    damageType = "necrotic"
                }
            } else {
                if (DEBUG > 1) { console.log(` ${actorD.name} does not have a custom race -- ${actorType.value}`) };
            }

            // If the creature has a subtype...
            if (!actorType.subtype == "") {
                // if(actorType.subtype) {

                // If the creature's subtype is found in the necroticRaces collection...
                if (actorType.subtype.toLowerCase().includes(necroticRace.toLowerCase())) {
                    if (DEBUG) { console.log(" Beginning subtype Checker") };

                    // Check creature Subtypes for the types in our necroticRaces collection.
                    if (actorType.custom.toLowerCase().includes(necroticRace.toLowerCase())) {
                        if (DEBUG) { console.log(" Found a sneaky subtype.") };
                        damageType = "necrotic"
                    }
                }
            } else {
                if (DEBUG > 1) { console.log(` ${actorD.name} does not have a subtype`) };
            }

            // Check creature type against our necroticRaces collection.
            if (actorType.value.toLowerCase().includes(necroticRace.toLowerCase())) {
                if (DEBUG) { console.log(` actorD's npc type is ${necroticRace}`) };
                damageType = "necrotic"
            } else {
                if (DEBUG > 1) { console.log(` ${actorD.name} radiant npc type is ${actorType.value}`) };
            }
        }
    }

    // Check alignment, set necrotic if found in necroticAligns
    for (let necroticAlign of necroticAligns) {
        if (DEBUG>1) { console.log(` necroticAlign is ${necroticAlign}`) };
        if (necroticAlign) {
            if (actorAlign.toLowerCase().includes(necroticAlign.toLowerCase())) {
                if (DEBUG > 1) { console.log(`${actorD.name}'s alignment is ${necroticAlign}`, actorD, necroticAlign) };
                damageType = "necrotic"
            }
        } else {
            if (DEBUG > 1) console.log(`${actorD.name} has no alignment`, actorD);
        }
    }
    if (DEBUG) console.log(`${actorD.name} will do >>>>>> ${damageType} <<<<<< damage`);
    return (damageType);
}