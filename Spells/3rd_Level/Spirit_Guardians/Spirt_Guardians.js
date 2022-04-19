const MACRONAME = "Spirit_Gurdians.js"
/*****************************************************************************************
 * Not happy with any of my not really working Spirit Guardians I have found.  I'm trying 
 * again, this time staring with Produce Flame macro to hopefully give the caster an 
 * ability to selectively zap baddies who enter teh aura or start their turns with in it.
 * 
 *  READ First!
 *  Themed after Kandashi's create item macro
 * 
 * 12/07/21 0.1 Creation of Macro
 * 12/06/21 0.2 Correcting the type of spell to require a save
 *****************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension

const IMAGE = "Icons_JGB/Spells/Spirit_Guardian.jpg"
const LAST_ARG = args[args.length - 1];
let msg = "";
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const VFX_NAME = `${MACRO}-${aToken.name}`
const VFX_OPACITY = 1.0;
const VFX_SCALE = 1.25;

const ITEM_NAME = "Guardian Attack"
const SPEC_ITEM_NAME = `%%${ITEM_NAME}%%`               // Name as expected in Items Directory 
const NEW_ITEM_NAME = `${aToken.name}'s ${ITEM_NAME}`   // Name of item in actor's spell book

await jez.wait(100)
jez.log(`************* Starting ${MACRONAME}`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
if (args[0] === "off") doOff();         // DAE removal
if (args[0].tag === "OnUse") doOnUse(); // Midi ItemMacro On Use
/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
/***************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 * 
 * https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/Sequencer-Effect-Manager#end-effects
 ***************************************************************************************/
 async function doOff() {
    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });
    let getItem = aActor.items.find(i => i.name === NEW_ITEM_NAME);
    if (!getItem) return {};
    await getItem.delete();
    msg = `An At-Will Spell "${NEW_ITEM_NAME}" has been deleted from ${aToken.name}'s spell book`
    ui.notifications.info(msg);
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
    runVFX(damageType, aToken)
    jez.log(`Executing doOnUse , Number of dice: ${numDice}, Type: ${damageType}`);
    await copyEditItem(aToken, numDice, damageType)
    msg = `An At-Will Spell "${NEW_ITEM_NAME}" has been added for the duration of this spell`
    ui.notifications.info(msg);
    msg = `A new Innate Spell <b>${NEW_ITEM_NAME}</b> should be used to attack 
    creatures that begin their turn in the AoE or that enter it for the first time.`
    await postResults(msg)    
    jez.log(`************* Ending doOnUse`);
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
    let actorRace = aActor.data.data.details.race;      // Shorten subsequent lines for aActor Details Race
    let actorType = aActor.data.data.details.type;      // Shorten subsequent lines for aActor Details Type
    let actorAlign = aActor.data.data.details.alignment;// Shorten subsequent lines for aActor Details Alignment

        jez.log(` aActor: `, aActor)
        jez.log(` Alignment: `, actorAlign)
        jez.log(` Race: `, actorRace)
        jez.log(` Type: `, actorType)

    if (aActor.data.type === "character") {     
        // actor is a PC                     
        jez.log(`${aActor.name} is a PC`, aActor);

        for (let necroticRace of necroticRaces) {
            if (actorRace) {
                if (actorRace.toLowerCase().includes(necroticRace.toLowerCase())) {
                    jez.log(`${aActor.name}'s race is ${necroticRace}`, aActor, necroticRace);
                    damageType = "necrotic"
                }
            } else jez.log(`${aActor.name} has no race`, aActor); 
        }
    } else { 
        // actor is a NPC                                                                   
        jez.log(`${aActor.name} is an NPC`, aActor);

        // Loop through each creature type found in the necroticRaces array.
        for (let necroticRace of necroticRaces) {
             jez.log(`Checking against ${necroticRace}`);

            // If the creature type is custom...
            if (actorType.value.toLowerCase() === "custom") {
                jez.log(` Beginning custom type Checker`);

                // Check custom creature type against our necroticRaces collection
                if (actorType.custom.toLowerCase().includes(necroticRace.toLowerCase())) {
                    jez.log(` Found a dirty ${necroticRace} spy.`, necroticRace);
                    damageType = "necrotic"
                }
            } else {
                jez.log(` ${aActor.name} does not have a custom race -- ${actorType.value}`);
            }

            // If the creature has a subtype...
            if (!actorType.subtype == "") {
                // if(actorType.subtype) {

                // If the creature's subtype is found in the necroticRaces collection...
                if (actorType.subtype.toLowerCase().includes(necroticRace.toLowerCase())) {
                    jez.log(" Beginning subtype Checker");

                    // Check creature Subtypes for the types in our necroticRaces collection.
                    if (actorType.custom.toLowerCase().includes(necroticRace.toLowerCase())) {
                        jez.log(" Found a sneaky subtype.");
                        damageType = "necrotic"
                    }
                }
            } else jez.log(` ${aActor.name} does not have a subtype`) ;

            // Check creature type against our necroticRaces collection.
            if (actorType.value.toLowerCase().includes(necroticRace.toLowerCase())) {
                jez.log(` aActor's npc type is ${necroticRace}`);
                damageType = "necrotic"
            } else jez.log(` ${aActor.name} radiant npc type is ${actorType.value}`) ;
        }
    }

    // Check alignment, set necrotic if found in necroticAligns
    for (let necroticAlign of necroticAligns) {
        jez.log(` necroticAlign is ${necroticAlign}`);
        if (necroticAlign) {
            if (actorAlign.toLowerCase().includes(necroticAlign.toLowerCase())) {
                jez.log(`${aActor.name}'s alignment is ${necroticAlign}`, aActor, necroticAlign);
                damageType = "necrotic"
            }
        } else jez.log(`${aActor.name} has no alignment`, aActor);
    }
    jez.log(`${aActor.name} will do >>>>>> ${damageType} <<<<<< damage`);
    return (damageType);
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 async function postResults(msg) {
    jez.log(`postResults: ${msg}`);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    await jez.wait(100)
    jez.log("chatMsg", chatMsg)
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    jez.log("------ --------")
}
/***************************************************************************************************
 * Run the VFX on the caster
 ***************************************************************************************************/
async function runVFX(type, entity) {
    let vfxLoop = "jb2a.spirit_guardians.blueyellow"
    if (type === "necrotic") vfxLoop = "jb2a.spirit_guardians.pinkpurple.ring"
    new Sequence()
        .effect()
            .file(vfxLoop)
            .attachTo(aToken)
            .scale(VFX_SCALE)
            .opacity(VFX_OPACITY)
            .persist()
            .name(VFX_NAME) 
            .scaleIn(0.1, 1500)         // Expand from 0.1 to 1 size over 1.5 second
            .rotateIn(180, 1500)        // 1/2 Rotation over 1.5 second 
            .scaleOut(0.1, 1500)        // Contract from 1 to 0.1 size over 1.5 second
            .rotateOut(180, 1500)       // 1/2 Counter Rotation over 1.5 second  
        .play();
    return (true);
}
/***************************************************************************************************
 * Copy the temporary item to actor's spell book and edit it as appropriate
 ***************************************************************************************************/
 async function copyEditItem(token5e, NUM_DICE, DMG_TYPE) {
    const FUNCNAME = "copyEditItem()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //----------------------------------------------------------------------------------------------
    let oldActorItem = token5e.actor.data.items.getName(NEW_ITEM_NAME)
    if (oldActorItem) await deleteItem(token5e.actor, oldActorItem)
    //----------------------------------------------------------------------------------------------
    jez.log("Get the item from the Items directory and slap it onto the active actor")
    let itemObj = game.items.getName(SPEC_ITEM_NAME)
    if (!itemObj) {
        msg = `Failed to find ${SPEC_ITEM_NAME} in the Items Directory`
        ui.notifications.error(msg);
        postResults(msg)
        return (false)
    }
    console.log('Item5E fetched by Name', itemObj)
    await replaceItem(token5e.actor, itemObj)
    //----------------------------------------------------------------------------------------------
    jez.log("Find the item on the actor")
    let aActorItem = token5e.actor.data.items.getName(SPEC_ITEM_NAME)
    jez.log("aActorItem", aActorItem)
    if (!aActorItem) {
        msg = `Failed to find ${SPEC_ITEM_NAME} on ${token5e.name}`
        ui.notifications.error(msg);
        postResults(msg)
        return (false)
    }
    //-----------------------------------------------------------------------------------------------
    jez.log(`Remove the don't change this message assumed to be embedded in the item description.  It 
     should be of the form: <p><strong>%%*%%</strong></p> followed by white space`)
    const searchString = `<p><strong>%%.*%%</strong></p>[\s\n\r]*`;
    const regExp = new RegExp(searchString, "g");
    const replaceString = ``;
    let content = await duplicate(aActorItem.data.data.description.value);
    content = await content.replace(regExp, replaceString);
    let itemUpdate = {
        'name': NEW_ITEM_NAME,              // Change to actor specific name for temp item
        'data.description.value': content,  // Drop in altered description
        // 'data.level': LAST_ARG.spellLevel,  // Change spell level of temp item 
        'data.damage.parts' : [[`${NUM_DICE}d6`, DMG_TYPE]]
    }
    jez.log("itemUpdate",itemUpdate)
    await aActorItem.update(itemUpdate)
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/*************************************************************************************
 * replaceItem
 * 
 * Replace or Add targetItem to inventory of actor5e passed as parms
 *************************************************************************************/
 async function replaceItem(actor5e, targetItem) {
    await deleteItem(actor5e, targetItem)
    return (actor5e.createEmbeddedDocuments("Item", [targetItem.data]))
}
/*************************************************************************************
 * deleteItem
 * 
 * Delete targetItem to inventory of actor5e passed as parms
 *************************************************************************************/
 async function deleteItem(actor5e, targetItem) {
    let itemFound = actor5e.items.find(item => item.data.name === targetItem.data.name && item.type === targetItem.type)
    if (itemFound) await itemFound.delete();
}