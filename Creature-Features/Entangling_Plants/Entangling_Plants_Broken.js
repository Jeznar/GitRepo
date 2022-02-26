const MACRONAME = "Entangling_Plants_Broken"
/*****************************************************************************************
 * Vine Blight's Entangling Plant ability -- Free an Adjacent Ally (or enemy)
 *
 *   Grasping roots and vines sprout in a 15-foot radius centered on the blight, withering
 *   away after 1 minute. For the duration, that area is difficult terrain for nonplant
 *   creatures. In addition, each creature of the blight’s choice in that area when the
 *   plants appear must succeed on a DC 12 Strength saving throw or become restrained. A
 *   creature can use its action to make a DC 12 Strength check, freeing itself or another
 *   entangled creature within reach on a success.
 *
 * 02/13/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
const SAVE_TYPE = "str"
const SAVE_DC = args[0]?.tag === "OnUse" ? aActor.data.data.attributes.spelldc : args[2] // Second arg should be save DC
// const SAVE_DC = aActor.data.data.attributes.spelldc;
let msg = "";
const DEBUFF_NAME = "Restrained by Entangling Plants" // aItem.name || "Nature's Wraith";
const DEBUFF_ICON = "modules/combat-utility-belt/icons/restrained.svg"
const RESTRAINED_JRNL = `@JournalEntry[${game.journal.getName("Restrained").id}]{Restrained}`
const DIFFICULT_JRNL = `@JournalEntry[${game.journal.getName("Difficult Terrain").id}]{Difficult Terrain}`
let chatMsg = game.messages.get(LAST_ARG.itemCardId);


//----------------------------------------------------------------------------------
// Make sure a ONE target was selected and hit before continuing
//
if (args[0].targets.length !== 1) {     // If not exactly one target, return
    msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
    ui.notifications.warn(msg)
    jez.log(msg)
    return (false);
}
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
//if (args[0] === "off") await doOff();                   // DAE removal
//if (args[0] === "on") await doOn();                   // DAE removal
//if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
//if (args[0] === "each") doEach();					    // DAE removal
//if (args[0]?.tag === "DamageBonus") doBonusDamage();    // DAE Damage Bonus
jez.log(`============== Finishing === ${MACRONAME} =================`);
jez.log("")
return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doEach() {
    const FUNCNAME = "doEach()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const DIALOG_TITLE = "Make a choice of how to use your action"
    const DIALOG_TEXT = `The nasty vines are keeping <b>${aToken.name}</b> restrained.  
        Would you like to use your action this round to attempt to break the vines 
        (<b>DC${SAVE_DC} Strength</b> check), or simply ignore them and do something else 
        with your action?<br><br>`
    new Dialog({
        title: DIALOG_TITLE,
        content: DIALOG_TEXT,
        buttons: {
            yes: {
                label: "Break Vines", callback: async () => {
                    let flavor = `${aToken.name} uses this turn's <b>action</b> to attempt a 
                    ${CONFIG.DND5E.abilities[SAVE_TYPE]} check vs <b>DC${SAVE_DC}</b> to end the 
                    <b>${DEBUFF_NAME}</b> effect from ${aItem.name}.`;
                    let check = (await aActor.rollAbilityTest(SAVE_TYPE,
                        { flavor: flavor, chatMessage: true, fastforward: true })).total;
                    jez.log("Result of check roll", check);
                    if (SAVE_DC < check) {
                        await aActor.deleteEmbeddedDocuments("ActiveEffect", [LAST_ARG.effectId]);
                        jez.postMessage({
                            color: "darkblue",
                            fSize: 14,
                            icon: aToken.data.img,
                            msg: `Succesfully broke free of the vines that had been keeping him/her/it ${RESTRAINED_JRNL}.`,
                            title: `Succesful Skill Check`,
                            token: aToken
                        })
                    } else {
                        jez.postMessage({
                            color: "darkgreen",
                            fSize: 14,
                            icon: aToken.data.img,
                            msg: `Failed to break free from the vines that have been keeping him/her/it ${RESTRAINED_JRNL}.`,
                            title: `Failed Skill Check`,
                            token: aToken,
                        })
                    }
                }
            },
            no: { label: "Ignore Vines", callback: () => { } }
        },
        default: "yes",
    }).render(true);

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
    //----------------------------------------------------------------------------------
    // Check to see if the tActor currently has DEBUFF_NAME and fetch the SPELL_DC
    //
    let debuff = tActor.effects.find(i => i.data.label === DEBUFF_NAME);
    if (!debuff) {
        msg = `${aToken.name} is mildly embarrassed as the attempt to help ${tToken.name} 
            has failed -- ${tToken.name} lacks ${DEBUFF_NAME}`
        await jez.addMessage(chatMsg, {color:"deeppink", fSize:15, msg:msg, tag:"saves" })
        return;
    }
    jez.log('debuff', debuff)
    //----------------------------------------------------------------------------------
    // Obtain save DC from the debuff information.
    //
    let itemmacro = debuff.data.changes.find(i => i.key === "macro.itemMacro");
    jez.log('itemmacro', itemmacro)
    const VALUE_ARRAY =  itemmacro.value.split(" ")  
    const SPELL_DC = VALUE_ARRAY[VALUE_ARRAY.length - 1]
    jez.log("Spell DC", SPELL_DC)
    //----------------------------------------------------------------------------------
    // Make the Skill Check
    //
    let check = (await aActor.rollAbilityTest(SAVE_TYPE,
        { chatMessage: true, fastforward: true })).total;
    jez.log("Result of check roll", check);
    //----------------------------------------------------------------------------------
    // Post the results (also clear the debuff if check was a success.)
    //
    if (check >= SAVE_DC) {
        jez.log("debuff.id", debuff.id)
        await tActor.deleteEmbeddedDocuments("ActiveEffect", [debuff.id]);

        await jez.postMessage({
            color: "darkblue",
            fSize: 14,
            icon: aToken.data.img,
            msg: `Succesfully broke the vines that had been keeping ${tToken.name} ${RESTRAINED_JRNL}<br><br>
            Rolled a ${check} on the ${SAVE_TYPE.toUpperCase()} DC${SAVE_DC} skill check.`,
            title: `Successful Skill Check`,
            token: aToken
        })

    } else {
        await jez.postMessage({
            color: "darkgreen",
            fSize: 14,
            icon: aToken.data.img,
            msg: `Failed to break the vines that have been keeping ${tToken.name} ${RESTRAINED_JRNL}<br><br>
            Rolled a ${check} on the ${SAVE_TYPE.toUpperCase()} DC${SAVE_DC} skill check.`,
            title: `Failed Skill Check`,
            token: aToken,
        })
    }
return


    //----------------------------------------------------------------------------------------------
    // Add message about difficult terrain around caster.
    //

    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}